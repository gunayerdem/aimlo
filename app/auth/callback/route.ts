import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[Aimlo] Auth callback error:", error.message);
        return NextResponse.redirect(
          `${origin}?verified=error&message=${encodeURIComponent(error.message)}`,
        );
      }

      // Success — redirect to app with verified flag
      return NextResponse.redirect(`${origin}?verified=true`);
    }
  }

  // No code — redirect to home
  return NextResponse.redirect(`${origin}?verified=error`);
}
