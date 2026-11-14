import Stripe from 'stripe';
import { createHash } from 'node:crypto';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_test_')) throw new Error('Stripe sandbox is not configured. Add a test secret key.');
  return new Stripe(key, { maxNetworkRetries: 2 });
}
export function appUrl(request: Request) {
  const incoming = new URL(request.url);
  const local = incoming.hostname === 'localhost' || incoming.hostname === '127.0.0.1';
  const url = new URL(local && process.env.NODE_ENV !== 'production' ? incoming.origin : process.env.APP_URL || '');
  if (!local && url.protocol !== 'https:') throw new Error('APP_URL must be your public HTTPS app URL.');
  return url.origin;
}
export function stripeNamespace() {
  return createHash('sha256').update(process.env.SUPABASE_URL || '').digest('hex').slice(0, 20);
}
export function stripeError(error: unknown) {
  console.error('Payment operation failed:', error instanceof Error ? error.message : 'Database operation failed');
  return Response.json({ error: 'Payments are unavailable. Check the Stripe environment and run the Supabase payment migration, then try again.' }, { status: 503 });
}
