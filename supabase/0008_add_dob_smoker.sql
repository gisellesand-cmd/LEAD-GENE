-- Lets the CRM show the same date of birth / smoking status the Compulife
-- quoter collected, instead of that info living only in the quote request.
-- Run once in the Supabase SQL Editor.

alter table leads add column if not exists date_of_birth date;
alter table leads add column if not exists smoker boolean;
