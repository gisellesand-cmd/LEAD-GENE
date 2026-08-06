-- Lets the CRM show which insurer/product a quote-generated lead's premium
-- came from, without parsing the free-text message field. Run once in the
-- Supabase SQL Editor.

alter table leads add column if not exists company_name text;
alter table leads add column if not exists insurer_product_name text;
