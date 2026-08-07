-- PRD Section 13 (Email & Notifications) and Section 14 schema additions.
-- Run once in the Supabase SQL Editor.

alter table leads add column if not exists email_opt_out boolean not null default false;

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  sent_at timestamptz not null default now(),
  type text not null,
  status text not null,
  provider_message_id text,
  attempts integer not null default 1
);

create index if not exists email_logs_lead_id_idx on email_logs (lead_id);

-- Same pattern as leads: only the service role (server-side) ever touches
-- this table, so RLS stays enabled with no public policies.
alter table email_logs enable row level security;
