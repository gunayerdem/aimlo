/**
 * DAĞITIM EGRESS KİLİDİ — F31 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-egress-estimate.ts   (exit 1 = kırık)
 *
 * KÖK (kanıtlı): app/download/route.ts:16-17 kapasite notu "her indirme ~12MB,
 * Free plan 5GB/ay → ~430 indirme" ve landing "~12MB" 1.0.0 dönemine aitti.
 * MSI 1.0.14'te 27.6 MB (widget-dist), D21 embedBootstrapper ile ~29.5 MB; auto-
 * updater de AYNI bucket'tan tam MSI indiriyor ve sayılmıyordu. Plan repodan
 * doğrulanamadığı için çözüm görünür uyarı: /admin/altyapi egress kartı.
 *
 *   [A] estimateEgress (saf): (indirme + update_started) × MSI boyutu / 5 GB;
 *       %60 ve üstü "warn". Plan örneği: 29.5 MB, 100 indirme + 50 güncelleme
 *       → %89 → warn. Eksik sayım "alt sınır": eşik altındaysa "ok" DENMEZ.
 *   [B] readMsiBytes: yalnız kendi storage host'una HEAD, Content-Length, URL
 *       başına önbellek, hata → null (sahte değer yok).
 *   [C] metin/kaynak: route yorumu + landing ~30MB, runbook 30.09 egress maddesi,
 *       admin sayfası kartı render ediyor.
 * ⚠ AĞ/DB YOK (fetch sahte), .env OKUNMAZ.
 */
import Module from "node:module";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
type ModuleInternals = { _resolveFilename: ResolveFn; _cache: Record<string, { exports: unknown }> };
const M = Module as unknown as ModuleInternals;
const origResolve = M._resolveFilename;
M._resolveFilename = function (this: unknown, ...args: unknown[]) {
  const req = args[0];
  // "path" — "node:path" DEĞİL (Node 22 CI ENOENT; bkz. test-entitlements.ts).
  if (req === "server-only") return origResolve.call(this, "path", ...args.slice(1));
  if (typeof req === "string" && req.startsWith("@/")) {
    return origResolve.call(this, path.join(REPO_ROOT, req.slice(2)), ...args.slice(1));
  }
  return origResolve.apply(this, args);
};
const supaFile = require.resolve(path.join(REPO_ROOT, "lib/supabase/server"));
M._cache[supaFile] = {
  id: supaFile, filename: supaFile, loaded: true, children: [], paths: [],
  exports: { createServiceSupabase: () => { throw new Error("bu testte DB yok"); } },
} as unknown as { exports: unknown };

let fail = 0;
let pass = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  if (kosul) { pass++; console.log(`  ✅ ${ad}`); }
  else { fail++; console.log(`  ❌ ${ad} ${detay}`); }
};

type Est = {
  status: "ok" | "warn" | "unknown"; ratio: number | null; estimatedBytes: number | null; lowerBound: boolean; note: string;
};
type InfraMod = {
  estimateEgress?: (i: { msiBytes: number | null; downloads: number | null; updates: number | null; countsTruncated?: boolean }) => Est;
  readMsiBytes?: (f: typeof fetch, nowMs?: number) => Promise<number | null>;
  EGRESS_QUOTA_BYTES?: number;
  EGRESS_WARN_RATIO?: number;
};

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const infra = require(path.join(REPO_ROOT, "lib/admin-infra")) as InfraMod;

  console.log("\n[A] estimateEgress — saf hesap");
  t("estimateEgress + readMsiBytes dışa aktarılıyor; kota 5 GB (ondalık), eşik %60",
    typeof infra.estimateEgress === "function" && typeof infra.readMsiBytes === "function" &&
      infra.EGRESS_QUOTA_BYTES === 5_000_000_000 && infra.EGRESS_WARN_RATIO === 0.6);
  if (typeof infra.estimateEgress === "function") {
    const est = infra.estimateEgress;
    const MB = 1_000_000;
    const a = est({ msiBytes: 29.5 * MB, downloads: 100, updates: 50 });
    t("plan örneği: 29.5 MB × (100 indirme + 50 güncelleme) = 4.425 GB → %89 → warn ('En az %89': güncelleme sayacı alt sınır)",
      a.status === "warn" && a.estimatedBytes === 4_425_000_000 && Math.round((a.ratio ?? 0) * 100) === 89 && a.lowerBound && /^En az %89/.test(a.note),
      JSON.stringify(a));
    // FB02 inceleme · F31 (2026-09-25): update_started yalnız 1.0.20+ istemcilerden gelir
    // (desktop updater.ts; olayı güncellemeyi yükleyen istemci atar) → iki sayaç da okunsa
    // bile güncelleme sayacı YAPISAL alt sınır. Eski kilit bu durumu yeşil "ok (tam sayım)"
    // diye kilitliyordu — fonksiyonun kendi "eksik sayımla ok denmez" ilkesine aykırı.
    const b = est({ msiBytes: 29.5 * MB, downloads: 50, updates: 20 });
    t("iki sayaç okundu, 29.5 MB × 70 = %41 → 'ok' DEĞİL: unknown + 'En az %41' + 1.0.20 notu (güncelleme sayacı yapısal alt sınır)",
      b.status === "unknown" && b.lowerBound && Math.round((b.ratio ?? 0) * 100) === 41 && /^En az %41/.test(b.note) && /1\.0\.20\+/.test(b.note),
      JSON.stringify(b));
    const statuses = new Set<string>();
    for (const d of [0, 1, 10, 50, 100, 500]) for (const u of [0, 5, 50, null]) {
      statuses.add(est({ msiBytes: 29.5 * MB, downloads: d, updates: u }).status);
    }
    t("hiçbir girdi 'ok' (yeşil 'eşiğin altında') üretmiyor", !statuses.has("ok") && statuses.has("warn") && statuses.has("unknown"), JSON.stringify([...statuses]));
    const edge = est({ msiBytes: 30 * MB, downloads: 100, updates: 0 });
    t("tam eşik (%60) → warn (>=)", edge.status === "warn" && edge.ratio === 0.6, JSON.stringify(edge));
    t("MSI boyutu yok → unknown (uydurma yok)", est({ msiBytes: null, downloads: 100, updates: 50 }).status === "unknown");
    t("iki sayaç da yok → unknown", est({ msiBytes: 29.5 * MB, downloads: null, updates: null }).status === "unknown");
    const lbWarn = est({ msiBytes: 29.5 * MB, downloads: 150, updates: null });
    t("güncelleme sayılamadı ama indirme tek başına eşiği aşıyor → warn + 'En az'",
      lbWarn.status === "warn" && lbWarn.lowerBound && /En az/.test(lbWarn.note), JSON.stringify(lbWarn));
    const lbLow = est({ msiBytes: 29.5 * MB, downloads: 10, updates: null });
    t("eksik sayım eşiğin altında → 'ok' DEĞİL, unknown (alt sınır)", lbLow.status === "unknown" && lbLow.lowerBound, JSON.stringify(lbLow));
    const trunc = est({ msiBytes: 29.5 * MB, downloads: 10, updates: 5, countsTruncated: true });
    t("sayaç tavana dayandı (truncated) → alt sınır, eşik altı → unknown", trunc.status === "unknown" && trunc.lowerBound);
    t("negatif/NaN girdi geçersiz sayılır → unknown", est({ msiBytes: Number.NaN, downloads: -1, updates: null }).status === "unknown");
  }

  console.log("\n[B] readMsiBytes — host kısıtı, HEAD, önbellek");
  if (typeof infra.readMsiBytes === "function") {
    const read = infra.readMsiBytes;
    const BASE = "https://bzwnchzetebwrdedkjkq.supabase.co/storage/v1/object/public/";
    const log: { url: string; method: string }[] = [];
    const mk = (latestUrl: string, head: { ok: boolean; len?: string }): typeof fetch =>
      (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        log.push({ url, method });
        if (url.endsWith("releases/latest.json")) {
          return new Response(JSON.stringify({ version: "1.0.20", platforms: { "windows-x86_64": { url: latestUrl } } }), { status: 200 });
        }
        const h = new Headers();
        if (head.len !== undefined) h.set("content-length", head.len);
        return new Response(null, { status: head.ok ? 200 : 404, headers: h });
      }) as typeof fetch;

    log.length = 0;
    const foreign = await read(mk("https://evil.example.com/Aimlo.msi", { ok: true, len: "1" }), 1_000);
    t("latest.json yabancı host gösterirse null ve o hosta HİÇ istek yok",
      foreign === null && !log.some((l) => l.url.includes("evil.example.com")), JSON.stringify(log));

    const msiUrl = `${BASE}releases/v1.0.20/Aimlo_1.0.20_x64_en-US.msi`;
    log.length = 0;
    const first = await read(mk(msiUrl, { ok: true, len: "29499392" }), 1_000);
    t("kendi host'unda HEAD → Content-Length (29 499 392)",
      first === 29_499_392 && log.some((l) => l.url === msiUrl && l.method === "HEAD"), JSON.stringify(log));
    log.length = 0;
    const cached = await read(mk(msiUrl, { ok: true, len: "1" }), 1_000 + 60_000);
    t("aynı URL 6 saat içinde → önbellekten, HEAD YOK",
      cached === 29_499_392 && !log.some((l) => l.method === "HEAD"), JSON.stringify(log));
    log.length = 0;
    const expired = await read(mk(msiUrl, { ok: true, len: "30000000" }), 1_000 + 7 * 3600_000);
    t("önbellek süresi dolunca yeniden HEAD", expired === 30_000_000 && log.some((l) => l.method === "HEAD"));

    const other = `${BASE}releases/v1.0.21/Aimlo_1.0.21_x64_en-US.msi`;
    t("HEAD 404 → null", (await read(mk(other, { ok: false, len: "5" }), 1_000)) === null);
    const other2 = `${BASE}releases/v1.0.22/Aimlo_1.0.22_x64_en-US.msi`;
    t("Content-Length yok → null (0 uydurulmaz)", (await read(mk(other2, { ok: true }), 1_000)) === null);
    const throwing = (async () => { throw new Error("ağ yok"); }) as unknown as typeof fetch;
    t("fetch istisnası → null", (await read(throwing, 1_000)) === null);
  } else {
    t("readMsiBytes mevcut", false);
  }

  console.log("\n[C] metin ve kaynak");
  const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
  const route = read("app/download/route.ts");
  t("download/route.ts: ~30MB + updater aynı bucket + ayrı cached/uncached havuz notu, ~12MB yok",
    /~30MB/.test(route) && !/~12MB/.test(route) && /updater/i.test(route) && /cached ve uncached/.test(route));
  const landingFile = fs.existsSync(path.join(REPO_ROOT, "app/LandingClient.tsx")) ? "app/LandingClient.tsx" : "app/page.tsx";
  const landing = read(landingFile);
  t("landing indirme satırı ~30MB (~12MB yok)", landing.includes("Windows 10+ · ~30MB · .msi") && !landing.includes("~12MB"));
  const runbook = read("docs/LAUNCH_RUNBOOK.md");
  t("LAUNCH_RUNBOOK: 30.09 öncesi Supabase Usage → egress kontrolü maddesi",
    /30\.09 ÖNCESİ: Supabase Usage → egress kontrolü/.test(runbook));
  const adminPage = read("app/admin/altyapi/page.tsx");
  t("/admin/altyapi egress kartını render ediyor", /<EgressCard e=\{infra\.egress\} \/>/.test(adminPage));
  const cardStart = adminPage.indexOf("function EgressCard");
  // Kart sonu satır sonundan BAĞIMSIZ aranır: autocrlf=true checkout'ta dosya CRLF gelir, "\n}\n"
  // bulunamayınca (-1) dilim dosya sonuna uzayıp başka kartların "adm-badge ok"unu yakalıyordu.
  const cardEnd = cardStart < 0 ? null : /\r?\n\}\r?\n/.exec(adminPage.slice(cardStart));
  const card = cardStart < 0 || !cardEnd ? "" : adminPage.slice(cardStart, cardStart + cardEnd.index);
  t("F31: EgressCard'da yeşil 'eşiğin altında' rozeti yok; eşik altı tahmin 'alt sınır', güncelleme sayacı hep '≥'",
    card.length > 0 && !/eşiğin altında/.test(card) && !/adm-badge ok/.test(card) && /"alt sınır"/.test(card) && /count\(e\.updates, true\)/.test(card),
    card.slice(0, 120));

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-egress-estimate: ${pass} geçti, ${fail} kırık`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("❌ test-egress-estimate beklenmeyen hata:", e);
  process.exit(1);
});
