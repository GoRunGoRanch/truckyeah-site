-- =========================================================
-- GoRunGo Ranch — memorial ordering schema (Phase A)
-- ---------------------------------------------------------
-- All access is server-side only, via the SERVICE ROLE key inside
-- Vercel serverless functions. RLS is ENABLED with NO anon policies,
-- so the public anon key cannot read or write these tables. The order
-- portal reads a row only after the server validates memorial_id + token.
--
-- Run in Supabase SQL editor (or `supabase db push`).
-- =========================================================

-- One memorial = one unique memorial_id, threaded through every record.
create table if not exists public.gorungo_memorials (
  id            uuid primary key default gen_random_uuid(),
  memorial_id   text unique not null,          -- e.g. RM-2026-000123
  access_token  text not null,                 -- unguessable portal key
  owner_email   text,
  pet_name      text,
  species       text,
  date_from     text,                          -- kept as text; families enter varied formats
  date_to       text,
  tribute       text,
  privacy       text not null default 'private', -- 'private' | 'unlisted' | 'public'
  photo_key     text,                          -- Supabase Storage object key (original, private)
  consent_owns_image boolean not null default false,
  status        text not null default 'DRAFT', -- see order-state machine in the brief
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.gorungo_orders (
  id                    uuid primary key default gen_random_uuid(),
  memorial_id           text not null references public.gorungo_memorials(memorial_id) on delete cascade,
  order_type            text not null,          -- 'pet_memorial'
  package_code          text not null,          -- DIGITAL_TRIBUTE | FOUNDING_RESERVATION | ...
  amount_cents          integer,
  currency              text not null default 'usd',
  stripe_session_id     text,
  stripe_payment_intent text,
  payment_status        text not null default 'PENDING', -- PENDING | PAID | REFUNDED | FAILED
  schema_version        text not null default '1',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_gorungo_orders_memorial on public.gorungo_orders(memorial_id);
create index if not exists idx_gorungo_orders_session  on public.gorungo_orders(stripe_session_id);

-- Idempotency ledger so a replayed Stripe webhook is processed once.
create table if not exists public.gorungo_webhook_events (
  event_id     text primary key,
  type         text,
  processed_at timestamptz not null default now()
);

-- Lock everything down. Service role (server) bypasses RLS; anon gets nothing.
alter table public.gorungo_memorials      enable row level security;
alter table public.gorungo_orders         enable row level security;
alter table public.gorungo_webhook_events enable row level security;
-- (Intentionally NO policies for anon/authenticated — server-only access.)
