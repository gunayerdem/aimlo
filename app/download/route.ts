import { NextResponse } from "next/server";

// aimlo.gg/download — her zaman EN SON sürümün MSI'ına yönlendirir.
// Kaynak-of-truth = updater'ın kendi latest.json'u (Supabase releases bucket'ı,
// release-desktop.ps1 her sürümde yazar) → site butonu ile updater asla
// birbirinden kopamaz. latest.json fetch'i başarısızsa ana sayfaya düşer
// (kırık indirme linki asla gösterme).
export const dynamic = "force-dynamic";

const SUPABASE_STORAGE = "https://bzwnchzetebwrdedkjkq.supabase.co/storage/v1/object/public/";
const LATEST_URL = `${SUPABASE_STORAGE}releases/latest.json`;

export async function GET() {
  try {
    const r = await fetch(LATEST_URL, { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as {
        platforms?: Record<string, { url?: string }>;
        url?: string;
      };
      const url = j?.platforms?.["windows-x86_64"]?.url ?? j?.url;
      // Güvenlik: yalnız kendi storage host'umuza yönlendir (latest.json ele
      // geçirilse bile kullanıcı yabancı bir hosta gönderilemez).
      if (typeof url === "string" && url.startsWith(SUPABASE_STORAGE)) {
        return NextResponse.redirect(url, 302);
      }
    }
  } catch {
    // sessiz düş — aşağıdaki fallback
  }
  return NextResponse.redirect("https://aimlo.gg/", 302);
}
