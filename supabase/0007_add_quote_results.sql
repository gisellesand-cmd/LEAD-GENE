-- Stores every carrier Compulife quoted for a lead (not just the cheapest
-- one that's already in company_name/insurer_product_name), so the CRM
-- detail panel can list all of them. Run once in the Supabase SQL Editor.

alter table leads add column if not exists quote_results jsonb;
