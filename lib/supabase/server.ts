import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Reads the CRM session from cookies. Used in Server Components and Route
// Handlers to check who's logged in — never bypasses RLS (uses the anon
// key), unlike lib/leads-store.ts's service-role client which writes on
// behalf of the public landing form.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies — the
            // middleware below refreshes the session on every request, so
            // this is safe to ignore.
          }
        },
      },
    },
  );
}
