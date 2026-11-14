-- Test 4: run once in Supabase SQL Editor after supabase-schema.sql.
-- Additive: existing listings/messages are preserved. All payment data is private.
begin;
alter table public.listings add column if not exists sold_at timestamptz;
create table if not exists public.sellers (
  email text primary key check (email = lower(trim(email))),
  stripe_account_id text unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  listing_title text not null,
  seller_email text not null references public.sellers(email),
  stripe_account_id text not null,
  buyer_token uuid not null,
  buyer_email text,
  amount_total integer not null check (amount_total between 50 and 99999999),
  platform_fee integer not null check (platform_fee > 0 and platform_fee < amount_total),
  currency text not null default 'usd' check (currency = 'usd'),
  status text not null default 'pending' check (status in ('pending','paid','expired')),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create unique index if not exists one_active_order_per_listing on public.orders(listing_id) where status in ('pending','paid');
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
revoke all on public.sellers, public.orders from anon, authenticated;
grant all on public.sellers, public.orders to service_role;

-- Row lock and unique index prevent simultaneous Checkout sessions for one item.
create or replace function public.reserve_listing(p_listing_id uuid, p_buyer_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare l public.listings; s public.sellers; o public.orders; cents integer;
begin
  select * into l from public.listings where id = p_listing_id for update;
  if not found or l.sold_at is not null then raise exception 'This item is unavailable.'; end if;
  select * into s from public.sellers where email = lower(trim(l.seller_email));
  if not found or s.stripe_account_id is null or not s.charges_enabled or not s.payouts_enabled or not s.details_submitted then raise exception 'The seller has not completed Stripe onboarding.'; end if;
  if l.price < 0.50 or l.price > 999999.99 then raise exception 'This price is not eligible for online Checkout.'; end if;
  cents := round(l.price * 100)::integer;
  update public.orders set status = 'expired' where listing_id = l.id and status = 'pending' and stripe_session_id is null and created_at < now() - interval '35 minutes';
  select * into o from public.orders where listing_id = l.id and status in ('pending','paid');
  if found then return to_jsonb(o); end if;
  insert into public.orders(listing_id, listing_title, seller_email, stripe_account_id, buyer_token, amount_total, platform_fee)
  values(l.id, l.title, s.email, s.stripe_account_id, p_buyer_token, cents, round(cents * 0.10)::integer) returning * into o;
  return to_jsonb(o);
end;
$$;

-- Confirmation and Sold update commit together; duplicate deliveries are harmless.
create or replace function public.complete_marketplace_order(p_order_id uuid, p_session_id text, p_account_id text, p_amount integer, p_payment_intent text, p_buyer_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare o public.orders; item uuid;
begin
  select listing_id into item from public.orders where id = p_order_id;
  if not found then return; end if;
  perform 1 from public.listings where id = item for update;
  select * into o from public.orders where id = p_order_id for update;
  if o.stripe_session_id is distinct from p_session_id or o.stripe_account_id <> p_account_id or o.amount_total <> p_amount then raise exception 'Payment does not match order.'; end if;
  if o.status = 'paid' then return; end if;
  if o.status <> 'pending' then raise exception 'Order is not pending.'; end if;
  update public.orders set status = 'paid', paid_at = now(), stripe_payment_intent_id = p_payment_intent, buyer_email = p_buyer_email where id = o.id;
  update public.listings set sold_at = now() where id = o.listing_id;
end;
$$;
revoke all on function public.reserve_listing(uuid,uuid) from public, anon, authenticated;
revoke all on function public.complete_marketplace_order(uuid,text,text,integer,text,text) from public, anon, authenticated;
grant execute on function public.reserve_listing(uuid,uuid) to service_role;
grant execute on function public.complete_marketplace_order(uuid,text,text,integer,text,text) to service_role;
commit;
