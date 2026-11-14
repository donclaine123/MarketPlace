-- Run in a new Supabase project's SQL Editor. No user login is required.
-- Writes go through the server API with its secret key; never expose that key.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null check (length(trim(title)) > 0),
  description text not null check (length(trim(description)) between 1 and 5000),
  price numeric(10,2) not null check (price >= 0 and price <= 99999999.99),
  category varchar(100) not null check (category in ('Furniture','Electronics','Clothing','Vehicles','Home & Garden','Sports & Outdoors','Entertainment','Family','Other')),
  seller_email varchar(254) not null,
  image_url text not null,
  location varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_email varchar(254) not null,
  seller_email varchar(254) not null,
  message text not null check (length(trim(message)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_messages_listing_id on public.messages(listing_id);
alter table public.listings enable row level security;
alter table public.messages enable row level security;
-- Clean up the overly broad policies if the original guide was run first.
drop policy if exists "Anyone can view messages" on public.messages;
drop policy if exists "Anyone can create messages" on public.messages;
drop policy if exists "Anyone can create listings" on public.listings;
drop policy if exists "Users can update their own listings" on public.listings;
drop policy if exists "Anyone can view listings" on public.listings;
drop policy if exists "Public listing reads" on public.listings;
create policy "Public listing reads" on public.listings for select using (true);
revoke all on public.messages from anon, authenticated;
revoke insert, update, delete on public.listings from anon, authenticated;
grant select on public.listings to anon, authenticated;
grant all on public.listings, public.messages to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 4194304, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "Anyone can upload listing images" on storage.objects;
drop policy if exists "Anyone can view listing images" on storage.objects;
-- Public bucket images are readable by URL; only the server key can upload.

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists update_listings_updated_at on public.listings;
create trigger update_listings_updated_at before update on public.listings
for each row execute function public.update_updated_at_column();
