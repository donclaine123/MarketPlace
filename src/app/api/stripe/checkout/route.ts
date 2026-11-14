import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getSupabase } from '@/lib/supabase';
import { readJson } from '@/lib/http';
import { InputError, isUuid } from '@/lib/validation';
import { appUrl, getStripe, stripeError } from '@/lib/stripe';
import { canReleaseCheckout } from '@/lib/payment-rules';

export async function POST(request: Request) {
  try {
    const body = await readJson(request) as { listing_id?: unknown };
    if (typeof body?.listing_id !== 'string' || !isUuid(body.listing_id)) throw new InputError('Choose a valid listing.');
    if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) return Response.json({ error: 'Online checkout is not ready yet. Please contact the marketplace.' }, { status: 503 });
    const db = getSupabase();
    const stripe = getStripe();
    const origin = appUrl(request);
    const cookieStore = await cookies();
    const savedToken = cookieStore.get('checkout_buyer')?.value;
    const buyerToken = savedToken && isUuid(savedToken) ? savedToken : randomUUID();
    cookieStore.set('checkout_buyer', buyerToken, { httpOnly: true, sameSite: 'lax', secure: origin.startsWith('https:'), maxAge: 86400, path: '/' });
    // Recover expired reservations even when an expiration webhook was missed.
    const { data: previous, error: previousError } = await db.from('orders').select('*').eq('listing_id', body.listing_id).eq('status', 'pending').maybeSingle();
    if (previousError) throw previousError;
    if (previous?.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(previous.stripe_session_id, {}, { stripeAccount: previous.stripe_account_id });
      if (session.status === 'expired') {
        const { error } = await db.from('orders').update({ status: 'expired' }).eq('id', previous.id).eq('status', 'pending');
        if (error) throw error;
      }
    }
    const { data: order, error: reserveError } = await db.rpc('reserve_listing', { p_listing_id: body.listing_id, p_buyer_token: buyerToken });
    if (reserveError) {
      if (reserveError.code === 'P0001') return Response.json({ error: reserveError.message }, { status: 409 });
      throw reserveError;
    }
    if (order.status !== 'pending' || order.buyer_token !== buyerToken) return Response.json({ error: 'Another buyer is checking out this item. Please try again later.' }, { status: 409 });
    const response = (url: string) => {
      const result = NextResponse.json({ url });
      result.cookies.set('checkout_buyer', buyerToken, { httpOnly: true, sameSite: 'lax', secure: origin.startsWith('https:'), maxAge: 86400, path: '/' });
      return result;
    };
    if (order.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id, {}, { stripeAccount: order.stripe_account_id });
      if (session.status !== 'open' || !session.url) return Response.json({ error: 'Payment is being confirmed. Refresh the listing shortly.' }, { status: 409 });
      return response(session.url);
    }
    // Recheck Stripe rather than trusting a stale onboarding webhook.
    const account = await stripe.accounts.retrieve(order.stripe_account_id);
    if (!account.charges_enabled || !account.payouts_enabled || !account.details_submitted) {
      return Response.json({ error: 'The seller must finish Stripe onboarding first.' }, { status: 409 });
    }
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
      mode: 'payment', allowed_payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', unit_amount: order.amount_total, product_data: { name: order.listing_title } }, quantity: 1 }],
      payment_intent_data: { application_fee_amount: order.platform_fee, metadata: { order_id: order.id } },
      client_reference_id: order.id, metadata: { order_id: order.id },
      expires_at: Math.floor(new Date(order.created_at).getTime() / 1000) + 35 * 60,
      success_url: `${origin}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/item/${order.listing_id}?checkout=cancelled`,
      }, { stripeAccount: order.stripe_account_id, idempotencyKey: `checkout-${order.id}` });
    } catch (error) {
      // Only expiry validation is definitive; concurrent requests and unknown network outcomes retain the reservation.
      if (canReleaseCheckout(error)) {
        const { error: releaseError } = await db.from('orders').update({ status: 'expired' }).eq('id', order.id).eq('status', 'pending').is('stripe_session_id', null);
        if (releaseError) throw releaseError;
        console.error('Stripe rejected Checkout creation:', error instanceof Error ? error.message : 'Invalid expiry');
        return Response.json({ error: 'Checkout could not start. Please try again.' }, { status: 409 });
      }
      throw error;
    }
    const { data: bound, error: saveError } = await db.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id).eq('status', 'pending').select('id').maybeSingle();
    if (saveError || !session.url) throw saveError || new Error('Checkout did not return a URL.');
    if (!bound) {
      await stripe.checkout.sessions.expire(session.id, {}, { stripeAccount: order.stripe_account_id });
      return Response.json({ error: 'This reservation expired. Please try again.' }, { status: 409 });
    }
    return response(session.url);
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return stripeError(error);
  }
}
