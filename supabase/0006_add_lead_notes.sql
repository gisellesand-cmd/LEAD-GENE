-- Replaces the single overwritable `notes` text field with a timestamped
-- history: every "Add note" click appends a row instead of replacing the
-- old one. Run once in the Supabase SQL Editor.

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists lead_notes_lead_id_idx on lead_notes (lead_id);

-- Same pattern as leads/email_logs: only the service role (server-side)
-- ever touches this table, so RLS stays enabled with no public policies.
alter table lead_notes enable row level security;

-- One-time backfill so existing notes aren't lost. created_at is the
-- lead's own created_at since we have no earlier timestamp for when the
-- note was actually written.
insert into lead_notes (lead_id, body, created_at)
select id, notes, created_at from leads where notes is not null and notes <> '';
