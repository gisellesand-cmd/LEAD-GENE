# Handover File

## Project state (updated 2026-07-24)
- Next.js landing page rebranded to life insurance guidance (matching the PRD
  and the real firstavenuefinancial.com → firstavefinancial.com brand: green
  #71b664, white, dark grey #333).
- Landing form submits leads to the local leads API with a honeypot field and
  first-touch attribution (UTMs, gclid, fbclid, landing_url, referrer)
  captured via `lib/attribution.ts` on page load, not at submit time.
- Leads are stored in a local JSON file for now (`data/leads.json`) — no
  Supabase project exists yet for this app.
- A basic CRM view exists at `/crm`.
- The old `/api/calculator` mortgage-math placeholder was replaced by
  `/api/quote`, a real Compulife request shape with a clearly-labeled mock
  fallback when `COMPULIFE_AUTHORIZATION_ID` is not set.
- `/privacy` and `/terms` are DRAFT stub pages — do not publish until the
  client's Canadian counsel reviews them (PRD Section 16).

## Key files
- [app/page.tsx](../app/page.tsx) — landing page, lead form, quote calculator
- [app/api/leads/route.ts](../app/api/leads/route.ts) — lead capture + source classification + honeypot
- [app/api/quote/route.ts](../app/api/quote/route.ts) — Compulife proxy (mock fallback)
- [lib/attribution.ts](../lib/attribution.ts) — first-touch UTM/gclid/fbclid capture
- [lib/leads-store.ts](../lib/leads-store.ts) — local lead storage helper
- [app/crm/page.tsx](../app/crm/page.tsx) — basic CRM pipeline view

## Open items before this can go live
1. **Compulife credentials**: only the PHP sample kit is in hand
   (`compulife-api-samples/`), `config.php` still has the `INSERT_ID`
   placeholder. Compulife authorizes exactly one server IP per
   `COMPULIFEAUTHORIZATIONID` — decide which host will hold the real ID
   (this Next.js app on Vercel, or a small proxy with a fixed IP) *before*
   requesting the ID, since moving servers later means calling Compulife to
   reset it.
2. **Repo ownership**: this repo has no `git remote` configured yet — it only
   exists locally. Local commits are authored under a personal-looking GitHub
   identity (`gisellesand22-max`), and `gh auth status` on this machine is
   logged into that same personal account. Per PRD Section 5, the real repo
   must live under the client's own GitHub org/account, not KOKO's or a
   personal one.
3. **Supabase**: no Supabase project exists for this app yet (leads live in a
   local JSON file). Create it directly under the client's Supabase
   organization once decided (see Section 5).
4. **WordPress vs. Vercel**: PRD Section 12 calls for migrating
   firstavenuefinancial.com DNS off WordPress onto Vercel. If the plan is
   instead to publish this landing as a new page inside the existing
   WordPress/Divi site, that's a different technical approach (static export
   or manual HTML/CSS port) and should be confirmed before more landing work
   continues.

## Next recommended steps
1. Resolve the four open items above with the client/KOKO.
2. Connect lead capture to Supabase once the project exists.
3. Add authentication for the CRM.
4. Wire the real Compulife credentials into `/api/quote`.
5. Add email notifications (Resend) and the Meta webhook flow.
