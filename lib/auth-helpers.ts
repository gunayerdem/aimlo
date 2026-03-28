import { supabase } from "@/lib/supabase";
import type { Lang, RoundFeedback } from "@/types";
import type { genMatchReport } from "@/lib/generators";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // First try getSession for the token (fast, from memory)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  } else {
    // Fallback: getUser forces a fresh token fetch
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data: { session: freshSession },
        } = await supabase.auth.getSession();
        if (freshSession?.access_token) {
          headers["Authorization"] = `Bearer ${freshSession.access_token}`;
        }
      }
    } catch {
      // No valid session
    }
  }
  return headers;
}
/* ══════════════════════════════════════════════════════════
   RESPONSE VALIDATORS
   ══════════════════════════════════════════════════════════ */
export function isValidFeedback(obj: unknown): obj is RoundFeedback {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.deathAnalysis === "string" &&
    Array.isArray(o.enemyPatterns) &&
    o.enemyPatterns.every((p: unknown) => typeof p === "string") &&
    typeof o.nextRoundPlan === "string"
  );
}
export function isValidReport(obj: unknown): obj is ReturnType<typeof genMatchReport> {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.summary === "string" &&
    typeof o.scoreStr === "string" &&
    typeof o.winPct === "number"
  );
}

export async function upsertProfile(
  userId: string,
  data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const payload = {
    user_id: userId,
    username: data.username.toLowerCase().trim(),
    email: data.email.toLowerCase().trim(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (!error) return { ok: true };
      console.error(
        `[Aimlo] Profile upsert attempt ${attempt + 1} failed`,
      );
      if (attempt === 1) return { ok: false, error: error.message };
    } catch (err) {
      console.error(
        `[Aimlo] Profile upsert exception attempt ${attempt + 1}`,
      );
      if (attempt === 1)
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
    }
  }
  return { ok: false, error: "Profile creation failed" };
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    // Use secure RPC function instead of direct table query
    const { data: foundEmail, error } = await supabase.rpc(
      "lookup_email_by_username",
      { lookup_username: username.toLowerCase().trim() },
    );
    if (error) {
      console.error("[Aimlo] Username check failed");
      return true; // allow attempt, DB constraint will catch duplicates
    }
    return !foundEmail; // null means username is available
  } catch {
    return true;
  }
}

export function localizeAuthError(msg: string, lang: Lang): string {
  if (lang !== "tr") return msg;
  const m: Record<string, string> = {
    "Invalid login credentials": "Geçersiz e-posta veya şifre",
    "Email not confirmed": "E-posta adresi henüz doğrulanmadı",
    "User already registered": "Bu e-posta zaten kayıtlı",
    "Password should be at least 6 characters": "Şifre en az 6 karakter olmalı",
    "Unable to validate email address: invalid format":
      "Geçersiz e-posta formatı",
    "Signup requires a valid password": "Geçerli bir şifre girin",
    "Email rate limit exceeded":
      "Çok fazla deneme yapıldı. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
    "For security purposes, you can only request this after 60 seconds":
      "Güvenlik nedeniyle 60 saniye beklemeniz gerekiyor. Lütfen biraz sonra tekrar deneyin.",
    "over_email_send_rate_limit":
      "E-posta gönderim limiti aşıldı. Lütfen birkaç dakika bekleyin.",
    "Too many requests":
      "Çok fazla istek gönderildi. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
    "Network error": "Bağlantı hatası. İnterneti kontrol edin.",
    "Username not found": "Kullanıcı adı bulunamadı",
  };
  for (const [key, val] of Object.entries(m)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return msg;
}
