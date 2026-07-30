-- Adds columns that were missing from the first run of schema.sql.
alter table leads
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists landing_url text,
  add column if not exists referrer text,
  add column if not exists lost_reason text,
  add column if not exists archived boolean not null default false;
