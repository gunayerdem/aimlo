// HARD GUARD: this module exports the service-role-key client which bypasses
// RLS. Importing it from a Client Component would leak the key into the
// browser bundle. The "server-only" sentinel makes the build crash with a
// clear error if that ever happens.
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase clients.
 *
 *   createServerSupabase()  — anon key + cookie-bound session.
 *                             Use in Server Components, route handlers,
 *                             and Server Actions whenever you want the
 *                             request's signed-in user (RLS applies).
 *
 *   createServiceSupabase() — SERVICE_ROLE key. Bypasses RLS. Used
 *                             only by OTP server actions to call
 *                             auth.admin.* APIs (createUser,
 *                             updateUserById, generateLink).
 *                             NEVER pass to a client component.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
if (!SUPABASE_ANON_KEY) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");

export async function createServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            // HARDEN auth cookies: @supabase/ssr defaults to
            // { httpOnly: false, sameSite: "lax" } which makes the
            // session token JS-readable. Combined with our prod CSP
            // permitting `script-src 'unsafe-inline'` for RSC hydration,
            // any XSS would exfiltrate the session in one line. Override
            // before write — applies to BOTH session cookies (sb-*) and
            // any incidental Supabase cookies we set.
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
        } catch {
          // Server Components cannot mutate cookies. Route handlers /
          // server actions can. This catch makes the same helper safe
          // to call from RSC for read-only purposes.
        }
      },
    },
  });
}

export function createServiceSupabase(): SupabaseClient {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing — required for OTP server actions",
    );
  }
  return createClient(SUPABASE_URL!, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
