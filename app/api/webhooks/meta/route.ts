import crypto from "node:crypto";
import { NextResponse, after } from "next/server";
import { addLead } from "@/lib/leads-store";

// Receives native Meta/Instagram Lead Ads submissions — forms filled out
// inside Facebook/Instagram itself, not on our landing page. This is
// separate from lib/attribution.ts, which only tracks fbclid/UTMs for
// visitors who land on OUR page. The webhook payload only ever carries a
// leadgen_id; the actual answers are fetched via a follow-up Graph API call
// (PRD Section 8).
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = "v21.0";

// Meta calls this once, at subscription time, to confirm we control this URL.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && META_VERIFY_TOKEN && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed." }, { status: 403 });
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!META_APP_SECRET || !signatureHeader) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", META_APP_SECRET).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

type MetaFieldData = { name: string; values?: string[] };

// Native Meta forms let the page owner name fields freely, so we match on the
// common variants rather than one fixed key.
// TODO: once the client's actual Meta lead form is built, confirm the real
// field names here (PRD Section 3).
function fieldValue(fieldData: MetaFieldData[], ...candidates: string[]): string {
  for (const candidate of candidates) {
    const match = fieldData.find((field) => field.name.toLowerCase() === candidate);
    if (match?.values?.[0]) return match.values[0];
  }
  return "";
}

type LeadgenChange = {
  leadgen_id: string;
  form_id?: string;
  ad_id?: string;
  adgroup_id?: string;
};

async function processLeadgenChange(change: LeadgenChange) {
  const { leadgen_id: leadgenId } = change;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${META_PAGE_ACCESS_TOKEN}`,
    );
    if (!response.ok) {
      console.error("Failed to fetch Meta lead", leadgenId, await response.text());
      return;
    }

    const data = await response.json();
    const fieldData: MetaFieldData[] = data.field_data ?? [];

    await addLead({
      fullName: fieldValue(fieldData, "full_name", "name") || "Unknown",
      email: fieldValue(fieldData, "email"),
      phone: fieldValue(fieldData, "phone_number", "phone"),
      product: "Life insurance",
      message: `Submitted via native Meta/Instagram lead form (leadgen_id: ${leadgenId}).`,
      // Native Meta lead forms carry their own platform consent screen, not
      // our CASL checkbox — treated as consented. Confirm with the client
      // that this satisfies their CASL obligations (PRD Section 16).
      consent: true,
      source: "meta_lead_ads",
      meta_leadgen_id: leadgenId,
      meta_form_id: change.form_id ?? data.form_id ?? null,
      meta_ad_id: change.ad_id ?? data.ad_id ?? null,
      meta_adset_id: change.adgroup_id ?? null,
      // Campaign/adset/ad display names require a separate Marketing API
      // call (ads_read) per ad_id — deferred until that permission is
      // granted in App Review (PRD Section 8, "Enrichment").
    });
  } catch (error) {
    console.error("Error processing Meta lead", leadgenId, error);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!META_APP_SECRET || !META_PAGE_ACCESS_TOKEN) {
    console.warn(
      "Meta webhook received but META_APP_SECRET/META_PAGE_ACCESS_TOKEN are not configured; dropping.",
    );
    return NextResponse.json({ ok: true });
  }

  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const changes: LeadgenChange[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === "leadgen" && change.value?.leadgen_id) {
        changes.push(change.value as LeadgenChange);
      }
    }
  }

  // Acknowledge immediately — Meta retries and eventually disables
  // subscriptions that time out or error, so retrieval/insert must not block
  // the response (PRD Section 8, "Immediate acknowledgment").
  after(async () => {
    for (const change of changes) {
      await processLeadgenChange(change);
    }
  });

  return NextResponse.json({ ok: true });
}
