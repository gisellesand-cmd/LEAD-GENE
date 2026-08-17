import crypto from "node:crypto";
import { Resend } from "resend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/leads-store";

// Same "clearly labeled mock" pattern as lib/leads-store.ts and the Compulife
// route: emails only actually send once RESEND_API_KEY exists (client's own
// Resend account, PRD Section 6 — "created under the client's ownership").
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "First Avenue Financial <notifications@firstavefinancial.com>";
const NOTIFY_EMAILS = (process.env.NOTIFY_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstavefinancial.com";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

type EmailType = "internal_notification" | "lead_confirmation" | "application_submitted";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function logEmail(
  leadId: string,
  type: EmailType,
  status: "sent" | "failed",
  providerMessageId: string | null,
  attempts: number,
) {
  if (!supabase) return;
  await supabase.from("email_logs").insert({
    lead_id: leadId,
    type,
    status,
    provider_message_id: providerMessageId,
    attempts,
  });
}

// DB insert always precedes and never depends on email delivery (PRD Section
// 13) — a lead is never lost because Resend is down or unconfigured.
async function sendWithRetry(
  leadId: string,
  type: EmailType,
  send: () => Promise<{ data: { id: string } | null; error: unknown }>,
  maxAttempts = 3,
) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await send();
      if (error) throw error;
      await logEmail(leadId, type, "sent", data?.id ?? null, attempt);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(2 ** attempt * 500);
    }
  }

  console.error(`Failed to send ${type} for lead ${leadId} after ${maxAttempts} attempts`, lastError);
  await logEmail(leadId, type, "failed", null, maxAttempts);
}

export function unsubscribeToken(leadId: string): string {
  const secret = UNSUBSCRIBE_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(leadId).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(leadId: string, token: string): boolean {
  if (!UNSUBSCRIBE_SECRET) return false;
  const expected = unsubscribeToken(leadId);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

const sourceLabel: Record<Lead["source"], string> = {
  meta_lead_ads: "Paid ad · Meta (native form)",
  meta_paid: "Paid ad · Meta (landing)",
  google_ads: "Paid ad · Google",
  organic: "Organic",
  manual: "Manual entry",
};

async function sendInternalNotification(lead: Lead) {
  if (!resend || NOTIFY_EMAILS.length === 0) return;

  const campaignLine = lead.meta_campaign_name
    ? `Campaign: ${lead.meta_campaign_name}${lead.meta_adset_name ? ` / ${lead.meta_adset_name}` : ""}${lead.meta_ad_name ? ` / ${lead.meta_ad_name}` : ""}\n`
    : "";

  await sendWithRetry(lead.id, "internal_notification", () =>
    resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: NOTIFY_EMAILS,
      subject: `New Lead: ${lead.full_name} — ${sourceLabel[lead.source]}`,
      text:
        `New lead received.\n\n` +
        `Name: ${lead.full_name}\n` +
        `Email: ${lead.email}\n` +
        `Phone: ${lead.phone}\n` +
        `Source: ${sourceLabel[lead.source]}\n` +
        campaignLine +
        `Time: ${new Date(lead.created_at).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}\n`,
    }),
  );
}

async function sendLeadConfirmation(lead: Lead) {
  if (!resend || !UNSUBSCRIBE_SECRET) return;

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?lead=${lead.id}&token=${unsubscribeToken(lead.id)}`;

  await sendWithRetry(lead.id, "lead_confirmation", () =>
    resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: lead.email,
      subject: "Thanks for reaching out to First Avenue Financial",
      text:
        `Hi ${lead.full_name},\n\n` +
        `Thank you for requesting information about ${lead.product_interest || "our insurance products"}. ` +
        `A member of our team will contact you shortly to follow up.\n\n` +
        `First Avenue Financial\n` +
        `123 Main Street, Calgary, AB, Canada\n\n` +
        `If you'd rather not receive further emails from us, unsubscribe here: ${unsubscribeUrl}`,
    }),
  );
}

// Called right after a lead is persisted. Fire-and-forget from the caller's
// perspective — wrap in next/server's after() at the call site so it never
// delays the HTTP response (same pattern as the Meta webhook).
export async function queueLeadEmails(lead: Lead, options: { sendConfirmation: boolean }) {
  await Promise.all([
    sendInternalNotification(lead),
    options.sendConfirmation ? sendLeadConfirmation(lead) : Promise.resolve(),
  ]);
}

async function sendApplicationSubmittedNotification(lead: Lead) {
  if (!resend || NOTIFY_EMAILS.length === 0) return;

  const carrierLine = lead.applied_company_name
    ? `Applying for: ${lead.applied_company_name}${lead.applied_product_name ? ` (${lead.applied_product_name})` : ""}${lead.applied_monthly_premium ? ` — ${lead.applied_monthly_premium}/mo` : ""}\n`
    : "";

  await sendWithRetry(lead.id, "application_submitted", () =>
    resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: NOTIFY_EMAILS,
      subject: `Application submitted: ${lead.full_name}`,
      text:
        `${lead.full_name} just submitted a full application.\n\n` +
        `Name: ${lead.full_name}\n` +
        `Email: ${lead.email}\n` +
        `Phone: ${lead.phone}\n` +
        carrierLine +
        `Time: ${new Date(lead.application_submitted_at ?? lead.created_at).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}\n\n` +
        `View full details in the CRM.\n`,
    }),
  );
}

// Called right after an Apply Now submission is persisted.
export async function queueApplicationEmail(lead: Lead) {
  await sendApplicationSubmittedNotification(lead);
}
