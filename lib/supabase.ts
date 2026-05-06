"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses cookies for session storage so it
 * stays in sync with the server's `createServerClient` (lib/supabase/server.ts).
 *
 * Why not the basic `createClient` from @supabase/supabase-js?
 *   That client stores sessions in localStorage. Our server actions
 *   (e.g. login) write the session to cookies via @supabase/ssr.
 *   The two would diverge — the user signs in successfully, the cookie
 *   is set, but the client component still reads localStorage (empty)
 *   and thinks the user is signed out. createBrowserClient reads/writes
 *   the same cookies, so onAuthStateChange / getSession / getUser pick
 *   up the new session immediately after redirect.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
