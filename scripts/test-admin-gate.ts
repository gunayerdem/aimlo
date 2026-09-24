/**
 * ADMİN KAPISI KİLİDİ — her app/admin/** /page.tsx kendi kapısını veri çekiminden ÖNCE koşmalı.
 *
 * NEDEN VAR (canlı sızıntı, 24.09.2026): /admin layout'u getAdminUser() + notFound()
 * ile korunuyordu ve 8 sayfa yalnız buna güveniyordu. Next 16 layout ve page
 * segmentlerini PARALEL render ediyor: layout notFound() attığında HTTP durumu 404
 * oluyor ama page segmentinin RSC (flight) verisi yanıttan ÇIKARILMIYOR. Kimliksiz
 * bir ziyaretçi düz GET'te 404 sayfasının kaynağında, "RSC: 1" başlıklı GET'te ise
 * 200 yanıtında sayfanın service-role ile çektiği veriyi (kullanıcı e-postaları,
 * destek mesajları) alabiliyordu. Canlı doğrulama: aimlo.gg/admin/cost, cookie'siz,
 * RSC:1 → HTTP 200 + sayfa içeriği. Next'in kendi rehberi de aynı şeyi söylüyor:
 * node_modules/next/dist/docs/01-app/02-guides/authentication.md "be cautious when
 * doing checks in Layouts ... do the checks close to your data source".
 *
 * Kural: her page'in default export gövdesinde, route parametrelerini açan
 * `await params` / `await searchParams` DIŞINDAKİ İLK await `await getAdminUser()`
 * olmalı ve hemen ardından `if (!admin) notFound();` gelmeli.
 *
 * Koşum: npx tsx scripts/test-admin-gate.ts   (npm test içinde)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "..", "app", "admin");
let fail = 0;
let n = 0;

function pages(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (e === "page.tsx") out.push(p);
  }
  return out;
}

const found = pages(ROOT);
for (const f of found) {
  n++;
  const rel = relative(join(__dirname, ".."), f).split(String.fromCharCode(92)).join("/");
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  const m = src.match(/export default async function \w+\([^)]*\)[^{]*\{/);
  if (!m || m.index === undefined) {
    console.log(`  FAIL ${rel} — default export async function bulunamadı`);
    fail++;
    continue;
  }
  const body = src.slice(m.index + m[0].length);
  const awaits = [...body.matchAll(/await\s+([^;\n]+)/g)].map((x) => x[1].trim());
  const firstReal = awaits.find((a) => !/^(params|searchParams|props\.params|props\.searchParams)\b/.test(a));
  const gated = firstReal !== undefined && /^getAdminUser\(\)/.test(firstReal);
  const guardLine = /const admin = await getAdminUser\(\);\s*\n\s*if \(!admin\) notFound\(\);/.test(body);
  const ok = gated && guardLine;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${rel}${ok ? "" : ` — ilk veri await'i: ${firstReal ?? "(yok)"}`}`);
  if (!ok) fail++;
}

// Negatif öz-test: kapısız bir gövde gerçekten yakalanıyor mu?
{
  n++;
  const bad = `export default async function X() {\n  const rows = await getUsersList();\n  return rows;\n}`;
  const body = bad.slice(bad.indexOf("{") + 1);
  const first = [...body.matchAll(/await\s+([^;\n]+)/g)].map((x) => x[1].trim())[0];
  const caught = !/^getAdminUser\(\)/.test(first);
  console.log(`  ${caught ? "ok  " : "FAIL"} öz-test: kapısız sayfa yakalanıyor`);
  if (!caught) fail++;
}

if (found.length < 10) {
  console.log(`  FAIL admin sayfa sayısı beklenenden az (${found.length}) — tarama yolu bozuk olabilir`);
  fail++;
}

console.log(`\n${fail === 0 ? "TAM YEŞİL" : "KIRMIZI"} — ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
