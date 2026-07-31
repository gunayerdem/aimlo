import { NextResponse, after } from "next/server";

// aimlo.gg/download — her zaman EN SON sürümün MSI'ına yönlendirir.
// Kaynak-of-truth = updater'ın kendi latest.json'u (Supabase releases bucket'ı,
// release-desktop.ps1 her sürümde yazar) → site butonu ile updater asla
// birbirinden kopamaz. latest.json fetch'i başarısızsa ana sayfaya düşer
// (kırık indirme linki asla gösterme).
export const dynamic = "force-dynamic";

const SUPABASE_STORAGE = "https://bzwnchzetebwrdedkjkq.supabase.co/storage/v1/object/public/";
const LATEST_URL = `${SUPABASE_STORAGE}releases/latest.json`;

/**
 * B13 (2026-07-31): indirme sayacı.
 *
 * NEDEN: MSI dağıtım kanalı Supabase public bucket ve her indirme ~12MB
 * egress. Free plan 5GB/ay → ~430 indirmede link yavaşlar/ölür. Bugüne kadar
 * kaç indirme olduğunu ölçen HİÇBİR şey yoktu; duyuru günü tavana ne kadar
 * yaklaştığımızı göremezdik. Ayrıca hunideki ilk adım (indirme) tamamen
 * ölçüsüzdü.
 *
 * PII YOK: IP, user-agent, referer, çerez — hiçbiri okunmuyor/yazılmıyor.
 * Yalnız iki tamsayı: toplam ve gün bazlı sayaç (gün anahtarı 90 gün TTL).
 * Not: bot/prefetch trafiği sayacı şişirebilir — bu bir kapasite göstergesi,
 * kesin kullanıcı sayısı değil.
 *
 * Upstash yoksa (yerel dev) sessizce no-op. `after()` yanıt gönderildikten
 * SONRA koşar → 302 yönlendirmeyi asla geciktirmez.
 */
function countDownload(): void {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const dayKey = `aimlo:dl:${day}`;

  after(async () => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    try {
      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", "aimlo:dl:total"],
          ["INCR", dayKey],
          ["EXPIRE", dayKey, "7776000"], // 90 gün
        ]),
        signal: ctrl.signal,
      });
    } catch (e) {
      // Sayaç asla akışı etkilemez — yalnız iz bırak.
      console.error("[Aimlo download] sayaç yazılamadı:", (e as Error).message);
    } finally {
      clearTimeout(tid);
    }
  });
}

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
        // Yalnız GERÇEK indirmeyi say (fallback yönlendirmesini değil).
        countDownload();
        return NextResponse.redirect(url, 302);
      }
    }
  } catch {
    // sessiz düş — aşağıdaki fallback
  }
  return NextResponse.redirect("https://aimlo.gg/", 302);
}
