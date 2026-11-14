import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import { matchesPaidSession } from '@/lib/payment-rules';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Webhook is not configured.' }, { status: 503 });
  if (!signature) return Response.json({ error: 'Missing signature.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch { return Response.json({ error: 'Invalid signature.' }, { status: 400 }); }
  if (event.livemode) return Response.json({ received: true, ignored: true });
  try {
    const db = getSupabase();
    if (event.type === 'account.updated') {
      const accountId = event.data.object.id;
      const { data: seller, error } = await db.from('sellers').select('email').eq('stripe_account_id', accountId).maybeSingle();
      if (error) throw error;
      if (seller) {
        const account = await getStripe().accounts.retrieve(accountId);
        const { error: updateError } = await db.from('sellers').update({ charges_enabled: account.charges_enabled, payouts_enabled: account.payouts_enabled, details_submitted: account.details_submitted }).eq('stripe_account_id', accountId);
        if (updateError) throw updateError;
      }
    } else if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.expired') {
      const session = event.data.object;
      // Shared sandbox: foreign sessions do not belong to this marketplace.
      const { data: order, error } = await db.from('orders').select('*').eq('stripe_session_id', session.id).maybeSingle();
      if (error) throw error;
      if (!order || order.stripe_account_id !== event.account) return Response.json({ received: true, ignored: true });
      if (event.type === 'checkout.session.expired') {
        const { error: expireError } = await db.from('orders').update({ status: 'expired' }).eq('id', order.id).eq('status', 'pending');
        if (expireError) throw expireError;
      } else if (matchesPaidSession(order, session, event.account)) {
        const { error: completeError } = await db.rpc('complete_marketplace_order', { p_order_id: order.id, p_session_id: session.id, p_account_id: event.account, p_amount: session.amount_total, p_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id, p_buyer_email: session.customer_details?.email || null });
        if (completeError) throw completeError;
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error instanceof Error ? error.message : 'Database error');
    return Response.json({ error: 'Could not save the event. Retry delivery.' }, { status: 500 });
  }
}
