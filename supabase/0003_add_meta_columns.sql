-- PRD Section 8/14: columns needed to dedupe and enrich native Meta Lead Ads
-- submissions. meta_leadgen_id is UNIQUE so webhook retries and daily
-- backfill overlaps become no-ops instead of duplicate leads.
alter table leads
  add column if not exists meta_leadgen_id text unique,
  add column if not exists meta_form_id text,
  add column if not exists meta_ad_id text,
  add column if not exists meta_adset_id text,
  add column if not exists meta_campaign_id text,
  add column if not exists meta_campaign_name text,
  add column if not exists meta_adset_name text,
  add column if not exists meta_ad_name text;
