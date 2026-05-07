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
  // ?next= lets us hop to /reset-password (password recovery), /verify, etc.
  // SAFE-RELATIVE only: must start with "/", must not start with "//", and
  // must not contain backslashes (browsers normalize `\` to `/`, so
  // "/\evil.com/x" resolves to "//evil.com/x" → cross-origin redirect).
  // Also reject percent-encoded variants. Final defense: parse against the
  // canonical SITE_URL and require the same origin to come back out.
  const rawNext = requestUrl.searchParams.get("next") ?? "";
  let next = "";
  if (
    rawNext.length > 0 &&
    rawNext.length < 200 &&
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.includes("\\") &&
    !/%5c/i.test(rawNext) && // percent-encoded backslash
    !/%2f%2f/i.test(rawNext) // percent-encoded double-slash
  ) {
    try {
      const candidate = new URL(rawNext, SITE_URL);
      if (candidate.origin === new URL(SITE_URL).origin) {
        next = candidate.pathname + candidate.search + candidate.hash;
      }
    } catch {
      next = "";
    }
  }
  const origin = SITE_URL;

  if (!code) {
    return NextResponse.redirect(`${origin}${next || "/"}?verified=error`);
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
    return NextResponse.redirect(`${origin}${next || "/"}?verified=error`);
  }

  // Recovery flow → land on /reset-password without ?verified=true so we
  // don't show the "verified" toast before the user has actually picked
  // a new password.
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}?verified=true`);
}
