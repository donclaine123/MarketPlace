import Stripe from 'stripe';

export function canReleaseCheckout(error: unknown) {
  return error instanceof Stripe.errors.StripeInvalidRequestError && error.statusCode === 400 && error.param === 'expires_at' && !['idempotency_key_in_use', 'lock_timeout'].includes(error.code || '');
}
export function paymentAmounts(price: unknown) {
  const text = String(price);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Invalid payment price.');
  const amount = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) throw new Error('Online purchases must be between $0.50 and $999,999.99.');
  return { amount, fee: Math.round(amount * 0.1) };
}
export function sellerEmail(value: unknown) {
  if (typeof value !== 'string' || value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw new Error('Enter a valid seller email.');
  return value.trim().toLowerCase();
}
export type PaymentOrder = { id: string; stripe_account_id: string; stripe_session_id: string | null; amount_total: number };
type PaidSession = { id: string; livemode: boolean; metadata: Record<string, string> | null; payment_status: string; amount_total: number | null; currency: string | null };
export function matchesPaidSession(order: PaymentOrder, session: PaidSession, account: string | undefined) {
  return !session.livemode && session.payment_status === 'paid' && session.currency === 'usd' && session.amount_total === order.amount_total && session.metadata?.order_id === order.id && session.id === order.stripe_session_id && account === order.stripe_account_id;
}
