# Marketplace

A Next.js, React, Supabase marketplace with photo listings, search/category browsing, private messages, and **Stripe Connect sandbox purchases**.

## Setup

Requires Node.js 22.18+ (24 recommended). Install with `npm.cmd install`. Copy `.env.example` to `.env.local` only if no environment file exists, then configure:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SERVER_SECRET
MARKETPLACE_DEMO=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_TEST_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_TEST_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SIGNING_SECRET
APP_URL=https://marketplace-lyart-three.vercel.app
```

For a new Supabase project, run [supabase-schema.sql](./supabase-schema.sql) in SQL Editor, then [supabase-stripe.sql](./supabase-stripe.sql). The payment migration preserves existing listings/messages. Sellers/orders are private; only the server can invoke payment functions.

Run `npm.cmd run dev -- --port 3001` and open http://127.0.0.1:3001. Development Stripe redirects use the local request origin. Without Supabase, development shows a labelled read-only sample catalog.

## Payments

1. Open **Start selling → Connect with Stripe**, or `/connect`. Enter the email used on the seller's listings (case and surrounding spaces are ignored).
2. Complete Stripe-hosted onboarding using **United States** test details. The supplied sandbox requires Accounts v2 with Stripe-managed risk. Express onboarding uses the pinned `2026-10-28.preview` API for this combination; account status and Checkout use the SDK's stable API.
3. On return the app checks Stripe's actual status. Listings show **Buy Now** when onboarding, charges and payouts are enabled. USD purchases must be $0.50–$999,999.99.
4. Checkout creates a **direct charge on the seller's connected account**, with a **10% application fee**, rounded to the nearest cent. Stripe processing fees also apply to the seller. No real money moves.
5. Pay with **4242 4242 4242 4242**, any future expiry, CVC and ZIP.
6. A signed webhook confirms payment, saves the order and marks the item **Sold** in one transaction. The confirmation page polls saved status; visiting its URL never completes an order.

Items are reserved during Checkout for up to 35 minutes. The same browser can resume; another buyer is blocked. Cancellation keeps the reservation until Checkout expires. Expiration webhooks release it; the next purchase attempt also checks for missed expirations.

## Local webhooks

Install the [official Stripe CLI](https://docs.stripe.com/stripe-cli). Run in a second terminal:

```powershell
stripe listen --api-key YOUR_STRIPE_TEST_SECRET_KEY --forward-connect-to http://127.0.0.1:3001/api/stripe/webhook
```

Set the CLI's temporary `whsec_...` secret as `STRIPE_WEBHOOK_SECRET` locally, restart the app and leave the CLI running while testing. The CLI and production signing secrets are different. Restore the production secret before copying settings to Vercel.

## Vercel

Push to the GitHub repository connected to Vercel. Add all environment variables above to Vercel **Production**, using the supplied sandbox keys and real Supabase server secret. Set `APP_URL` to the public production origin, then redeploy. Hosted Checkout redirects do not require Stripe.js; the publishable key is included for the challenge.

A Connect webhook has already been registered for **https://marketplace-lyart-three.vercel.app/api/stripe/webhook**. Its signing secret is saved in the ignored `.env.local`; copy it to Vercel's `STRIPE_WEBHOOK_SECRET`. Enabled events: `checkout.session.completed`, `checkout.session.expired`, `account.updated`, with `connect: true`.

For a **new production URL only**, update APP_URL and run once:

```powershell
node --env-file=.env.local scripts/create-webhook.mjs
```

The script saves the one-time secret locally without printing it and refuses duplicate endpoints. Never delete other candidates' endpoints. Foreign orders/accounts in the shared sandbox are acknowledged and ignored.

Test the public site with an onboarded seller, fresh listing and test card. Confirm `orders.status=paid`, `platform_fee`, connected account, and `listings.sold_at` in Supabase. Leave another unsold listing for the reviewer.

## Checks and limits

Run `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build`.

Tests remain excluded from Git by the owner's preference. Locally, `npm.cmd test` checks validation, images and payment rules. With the app running, opt in to database fixtures using `$env:PAYMENT_TESTS='true'` followed by `node --test tests/stripe.integration.mts`; fixtures are removed afterward. Older API/browser tests expect the read-only sample catalog.

This is a sandbox challenge: seller identity is matched by email without authentication. Add seller authentication before real payments. Shipping, tax, refunds, disputes and seller order-management UI are outside scope. Messages are private for administrative review; email delivery is not included. Photos are limited to 4 MiB and the catalog returns the newest 100 matches.

Never commit `.env.local` or secret keys. Docs, tests, screenshots, caches and generated files remain excluded by [.gitignore](./.gitignore).
