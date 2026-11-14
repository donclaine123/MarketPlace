# Marketplace

A Facebook-inspired neighborhood marketplace built for the [Marketplace Challenge, Test 3](https://tremendous-tiger-a4a.notion.site/Test-3-Marketplace-22400bbdfc3b805b8b7df94e0daa4f54).

Create a listing with a photo, browse and search by category, view individual items, and save buyer messages in Supabase. No login required.

## Run locally

Requires Node.js 22.18+ (Node 24 recommended).

```sh
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm` and `Copy-Item .env.example .env.local` to copy the environment example. Open http://127.0.0.1:3000.

Without Supabase, development shows a **labelled, read-only sample catalog**. Publishing and messaging never pretend to save data. To enable real writes, run [supabase-schema.sql](./supabase-schema.sql) in your Supabase SQL Editor, then configure the environment as described in [SETUP.md](./SETUP.md).

## Stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS 3 · shadcn-style Button/Input primitives · Lucide · Supabase Postgres and Storage · Geist.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

For API and browser checks, start the app with an explicitly enabled sample catalog and no Supabase credentials, then run:

```sh
npx playwright install chromium
npm run test:api
npm run test:e2e
```

Both test commands default to port 3000; set `TEST_BASE_URL` to your running app URL to override either. Browser tests create desktop/mobile, creation and detail screenshots in [screenshots](./screenshots/). These tests cover preview behavior, validation and configuration errors; real database writes require the live checks in [SETUP.md](./SETUP.md).

See [FEATURES.md](./FEATURES.md) for routes and behavior, [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for design decisions, and [SETUP.md](./SETUP.md) for Supabase, Vercel, and submission steps.

## Scope

This implements the no-login challenge, not a full commerce platform. Buyer messages are stored privately for administrative review; there is no public inbox or email delivery. There are no accounts, payments, listing editing, or deletion UI. Public writes need abuse protection before a broad production launch. The catalog currently returns the newest 100 matching listings.
