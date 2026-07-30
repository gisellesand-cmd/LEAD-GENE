-- Run this once in the Supabase project's SQL Editor to create the leads
-- table. Matches the Lead type in lib/leads-store.ts.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  status text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  product_interest text not null default '',
  message text not null default '',
  consent_casl boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  gclid text,
  fbclid text,
  landing_url text,
  referrer text,
  lost_reason text,
  notes text not null default '',
  assigned_to text,
  last_contacted_at timestamptz,
  pipeline_order integer not null default 0,
  archived boolean not null default false
);

create index if not exists leads_pipeline_order_idx on leads (pipeline_order);

-- The app only talks to this table via the service role key on the server
-- (never from the browser), so RLS stays enabled with no public policies.
alter table leads enable row level security;
