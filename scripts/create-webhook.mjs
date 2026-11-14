import fs from 'node:fs';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Load a sandbox key from .env.local first.');
const origin = new URL(process.env.APP_URL || '');
if (origin.protocol !== 'https:') throw new Error('APP_URL must be your public production HTTPS URL.');
const url = `${origin.origin}/api/stripe/webhook`;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
for await (const endpoint of stripe.webhookEndpoints.list({ limit: 100 })) {
  if (endpoint.url === url) throw new Error('An endpoint already exists for this URL. Reuse its signing secret; this script does not delete shared-sandbox endpoints.');
}
const endpoint = await stripe.webhookEndpoints.create({ url, connect: true, enabled_events: ['checkout.session.completed', 'checkout.session.expired', 'account.updated'], description: `Marketplace Test 4: ${origin.hostname}` });
// Save the one-time signing secret without printing it to terminal logs.
let env = fs.readFileSync('.env.local', 'utf8').replace(/^\uFEFF/, '');
for (const [name, value] of Object.entries({ STRIPE_WEBHOOK_SECRET: endpoint.secret, STRIPE_WEBHOOK_ENDPOINT_ID: endpoint.id })) {
  const pattern = new RegExp(`^${name}=.*$`, 'm');
  env = pattern.test(env) ? env.replace(pattern, `${name}=${value}`) : `${env.trimEnd()}\n${name}=${value}\n`;
}
fs.writeFileSync('.env.local', env);
console.log(`Created Connect webhook ${endpoint.id} for ${url}. Signing secret saved to .env.local. Add it to Vercel and redeploy.`);
