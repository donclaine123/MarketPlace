import { createHash } from 'node:crypto';
import { getSupabase } from '@/lib/supabase';
import { readJson } from '@/lib/http';
import { InputError } from '@/lib/validation';
import { sellerEmail } from '@/lib/payment-rules';
import { appUrl, getStripe, stripeError, stripeNamespace } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await readJson(request) as { email?: unknown };
    let email: string;
    try { email = sellerEmail(body?.email); } catch { throw new InputError('Enter a valid seller email.'); }
    const db = getSupabase();
    const stripe = getStripe();
    const origin = appUrl(request);
    const { error: insertError } = await db.from('sellers').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
    if (insertError) throw insertError;
    const { data: seller, error } = await db.from('sellers').select('*').eq('email', email).single();
    if (error) throw error;
    let accountId = seller.stripe_account_id as string | null;
    if (!accountId) {
      const idempotencyKey = createHash('sha256').update(`${stripeNamespace()}:${email}`).digest('hex');
      const account = await stripe.v2.core.accounts.create({ contact_email: email, dashboard: 'express', identity: { country: 'US' }, defaults: { responsibilities: { fees_collector: 'stripe', losses_collector: 'stripe' } }, configuration: { merchant: { capabilities: { card_payments: { requested: true } } } }, metadata: { marketplace: stripeNamespace() } }, { idempotencyKey: `seller-v2-express-${idempotencyKey}`, apiVersion: '2026-10-28.preview' });
      accountId = account.id;
      const { error: saveError } = await db.from('sellers').update({ stripe_account_id: accountId }).eq('email', email);
      if (saveError) throw saveError;
    }
    const link = await stripe.v2.core.accountLinks.create({ account: accountId, use_case: { type: 'account_onboarding', account_onboarding: { refresh_url: `${origin}/connect?email=${encodeURIComponent(email)}&refresh=1`, return_url: `${origin}/connect?email=${encodeURIComponent(email)}&returned=1` } } }, { apiVersion: '2026-10-28.preview' });
    return Response.json({ url: link.url });
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return stripeError(error);
  }
}
