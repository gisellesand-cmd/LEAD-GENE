import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// /api/leads is deliberately NOT matched here: its POST is the public
// landing form's submit endpoint (must stay unauthenticated). The GET
// (?view=crm) checks the session itself in app/api/leads/route.ts instead,
// since a redirect response doesn't make sense for an API call.
export const config = {
  matcher: ["/crm/:path*"],
};
