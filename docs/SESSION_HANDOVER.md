# Session Handover

## Date
2026-07-24

## Project
First Avenue Financial landing + lead capture + CRM prototype

## Current status
- Landing page rebranded to life insurance guidance using the real brand
  palette pulled from firstavenuefinancial.com (green #71b664, white, dark
  grey #333) instead of the placeholder mortgage/wealth copy.
- Lead form has a honeypot field and captures attribution (UTMs, gclid,
  fbclid, landing_url, referrer) on first pageview via `lib/attribution.ts`,
  fixing the "read at submit time" defect called out in the PRD.
- `/api/calculator` (placeholder mortgage math) was replaced by `/api/quote`,
  which sends the real Compulife request shape and falls back to a clearly
  labeled mock quote when `COMPULIFE_AUTHORIZATION_ID` isn't set.
- `/privacy` and `/terms` exist as DRAFT stub pages, linked from the footer.
- See docs/HANDOVER.md for full detail and open items.

## Open items surfaced this session (need client/KOKO decisions)
1. Compulife only authorizes one server IP per Authorization ID — decide the
   deployment host before requesting the real ID.
2. No `git remote` is configured on this repo; it only exists locally. Local
   git identity and this machine's `gh auth status` both point to a
   personal-looking GitHub account, not a client-owned org. Needs a proper
   GitHub repo under the client before pushing anywhere.
3. No Supabase project exists yet for this app (leads are in a local JSON
   file) — there is nothing to migrate yet, just a new project to create
   under the client's ownership.
4. PRD Section 12 assumes migrating off WordPress onto Vercel; confirm
   whether that's still the plan vs. publishing this as a new WordPress page.

## Preview URLs
- Landing: http://localhost:3001
- CRM: http://localhost:3001/crm
