import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Pinned to canonical site URL — prevents host-header injection / open-redirect
// vectors via X-Forwarded-Host on misconfigured proxies. Falls back to NEXT_PUBLIC_SITE_URL
// for staging/preview deploys, then to aimlo.gg as production default.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aimlo.gg";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = SITE_URL;

  if (!code) {
    return NextResponse.redirect(`${origin}?verified=error`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Aimlo] Missing Supabase env vars in auth callback");
    return NextResponse.redirect(`${origin}?verified=error`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Aimlo] Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}?verified=error`);
  }

  return NextResponse.redirect(`${origin}?verified=true`);
}
