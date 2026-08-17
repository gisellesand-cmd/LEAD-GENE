-- Adds Apply Now application capture, plus sex/province as real columns
-- (previously only embedded in the free-text message from the quote step).
-- Run once in the Supabase SQL Editor.

alter table leads add column if not exists application_data jsonb;
alter table leads add column if not exists application_submitted_at timestamptz;
alter table leads add column if not exists applied_company_name text;
alter table leads add column if not exists applied_product_name text;
alter table leads add column if not exists applied_monthly_premium text;
alter table leads add column if not exists sex text;
alter table leads add column if not exists province text;
