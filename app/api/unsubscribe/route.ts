import { NextResponse } from "next/server";
import { updateLead } from "@/lib/leads-store";
import { verifyUnsubscribeToken } from "@/lib/email";

// Linked from every confirmation email footer (PRD Section 13, CASL
// compliance) — no login required, so the token (HMAC of the lead id) is
// what proves the request came from that email rather than a guessed id.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead");
  const token = searchParams.get("token");

  if (!leadId || !token || !verifyUnsubscribeToken(leadId, token)) {
    return new NextResponse("Invalid or expired unsubscribe link.", { status: 400 });
  }

  const lead = await updateLead(leadId, { email_opt_out: true });

  if (!lead) {
    return new NextResponse("Lead not found.", { status: 404 });
  }

  return new NextResponse(
    "You have been unsubscribed from further emails from First Avenue Financial.",
    { status: 200, headers: { "Content-Type": "text/plain" } },
  );
}
