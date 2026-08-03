import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Gatekeeper for the CRM (PRD Section 11: "every CRM route ... requires a
// valid session"). The public landing page and its API routes (/api/quote,
// /api/leads POST) are untouched — only /crm/* goes through this check.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/crm/login";

  if (!user && pathname.startsWith("/crm") && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/crm/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const crmUrl = request.nextUrl.clone();
    crmUrl.pathname = "/crm";
    return NextResponse.redirect(crmUrl);
  }

  return response;
}
