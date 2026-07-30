import { NextResponse } from "next/server";
import { addLead, readLeads, type LeadSource } from "@/lib/leads-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("view") === "crm") {
    const leads = await readLeads();
    return NextResponse.json({ leads });
  }

  return NextResponse.json({ leads: [] });
}

// PRD Section 3 classification rule, priority order (Meta webhook / meta_lead_ads
// is populated by a separate integration, not this route):
// 2. fbclid or utm_source in facebook/instagram/meta -> meta_paid
// 3. gclid or utm_source = google -> google_ads
// 4. no paid-traffic markers -> organic
function classifySource(input: {
  utm_source: string | null;
  gclid: string | null;
  fbclid: string | null;
}): LeadSource {
  const utmSource = input.utm_source?.toLowerCase() ?? "";
  if (input.fbclid || ["facebook", "instagram", "meta"].includes(utmSource)) {
    return "meta_paid";
  }
  if (input.gclid || utmSource === "google") {
    return "google_ads";
  }
  return "organic";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Hidden honeypot field: real visitors never fill it. Bots that fill every
    // field will populate it, so we accept silently (no error hint) and drop it.
    if (typeof body?.company_website === "string" && body.company_website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const product = typeof body?.product === "string" ? body.product.trim() : "";
    const consent = Boolean(body?.consent);

    if (!fullName || !email || !consent) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }

    const utm_source = typeof body?.utm_source === "string" ? body.utm_source : null;
    const gclid = typeof body?.gclid === "string" ? body.gclid : null;
    const fbclid = typeof body?.fbclid === "string" ? body.fbclid : null;

    const lead = await addLead({
      fullName,
      email,
      phone,
      product,
      message: typeof body?.message === "string" ? body.message : "",
      consent,
      source: body?.source === "manual" ? "manual" : classifySource({ utm_source, gclid, fbclid }),
      utm_source,
      utm_medium: typeof body?.utm_medium === "string" ? body.utm_medium : null,
      utm_campaign: typeof body?.utm_campaign === "string" ? body.utm_campaign : null,
      utm_content: typeof body?.utm_content === "string" ? body.utm_content : null,
      gclid,
      fbclid,
      landing_url: typeof body?.landing_url === "string" ? body.landing_url : null,
      referrer: typeof body?.referrer === "string" ? body.referrer : null,
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("lead submission failed", error);
    return NextResponse.json({ error: "We could not save your request right now." }, { status: 500 });
  }
}
