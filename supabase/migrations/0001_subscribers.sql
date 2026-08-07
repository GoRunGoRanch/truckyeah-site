-- TruckYeah Traders — email opt-in list (subscribers)
-- Style/conventions reused from the Guru Seva Meds app (idempotent; run in
-- Supabase Studio → SQL Editor → New query → Run).
--
-- RECOMMENDED: use a NEW Supabase project for this marketing list — do NOT
-- reuse the Guru Seva Meds (medical) project. This table is publicly
-- insertable, and it shouldn't share a database with health data.

create extension if not exists "uuid-ossp";

-- ---------- subscribers ----------
create table if not exists public.subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  source      text,                                   -- where they signed up, e.g. 'trading-site-join'
  consent     boolean not null default true,          -- explicit opt-in (checkbox on the form)
  consent_at  timestamptz not null default now(),
  status      text not null default 'subscribed'
                check (status in ('subscribed','unsubscribed','bounced')),
  user_agent  text,
  created_at  timestamptz not null default now(),
  -- one row per address (emails are stored lowercased by the site before insert)
  constraint subscribers_email_unique unique (email)
);

create index if not exists subscribers_status_idx on public.subscribers(status);

-- ---------- Row-Level Security ----------
-- Enable RLS, then allow ONLY inserts from the public (anon) key.
-- No select/update/delete policy for anon  ->  the list is NOT readable with
-- the public key. You read/manage it in Supabase Studio, or from a trusted
-- server using the service_role key (which must NEVER ship in the website).
alter table public.subscribers enable row level security;

drop policy if exists subscribers_anon_insert on public.subscribers;
create policy subscribers_anon_insert
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- (Intentionally no SELECT/UPDATE/DELETE policies for anon.)
