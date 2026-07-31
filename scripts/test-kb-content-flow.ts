/**
 * KB İÇERİK-AKIŞI TESTİ — "dosyada yazan şey gerçekten prompt'a gidiyor mu?"
 *
 * NEDEN VAR (2026-07-31, B37 doğrulama turu): bir KB dosyası bölündüğünde
 * (universal.md → universal-2.md) içerik eski dosyadan ÇIKARILDI ama yeni dosyayı
 * yükleyen kod yazılmadı. Sonuç: ~3,5 KB koçluk bilgisi her prompt'tan sessizce
 * düştü — build geçti, tsc geçti, verify-kb geçti, HİÇBİR test görmedi. Üstelik
 * hata İKİ AYRI yükleyicide vardı: loadVisionKnowledge düzeltilince report/feedback
 * yolundaki loadKnowledge hâlâ kaybediyordu.
 *
 * Yapısal guard (verify-kb [9]) "loader dosyanın ADINI içeriyor mu" diye bakar;
 * bu test ise içeriğin GERÇEKTEN üç yolun da çıktısında olduğunu kanıtlar.
 * Yeni bir KB dosyası eklendiğinde buraya da bir satır ekle.
 *
 * Koşum:  npx tsx scripts/test-kb-content-flow.ts   (npm test içinde)
 */
import path from "path";
import fs from "fs";
import { loadVisionKnowledge, loadKnowledge } from "../lib/knowledge-loader";

const CTX = { map: "Ascent", agent: "Jett", enemyAgents: ["Sova", "Killjoy", "Omen", "Reyna", "Sage"], side: "attack" };
const KB = path.join(process.cwd(), "knowledge") + path.sep;

const uni2raw = fs.readFileSync(path.join(KB, "ranks", "universal-2.md"), "utf8");
// Frontmatter'ı (--- ... ---) ATLA: stripKbWhitespace onu zaten söküyor, oradan
// seçilen bir işaretçi yanlış "kayıp" alarmı verir (ilk denemede tam bu oldu).
const uni2 = uni2raw.replace(/^---[\s\S]*?\n---\n/, "");
const marker = (uni2.split(/\r?\n/).find((l) => {
  const s = l.trim();
  return s.length > 40 && !s.startsWith("#") && !s.startsWith("-") && !s.startsWith("|") && !s.startsWith("═");
}) || "").trim().slice(0, 45);

const v = loadVisionKnowledge(CTX as never);
const rep = loadKnowledge("report", CTX as never);
const fb = loadKnowledge("feedback", CTX as never);

let fail = 0;
const t = (n: string, ok: boolean, x = "") => { console.log(`  ${ok ? "✅" : "❌"} ${n}${x ? " — " + x : ""}`); if (!ok) fail++; };

console.log("\n══ universal-2.md gerçekten prompt'a gidiyor mu ══");
console.log(`  işaretçi cümle: "${marker}"\n`);
t("vision: profile2 bloğu dolu", !!v.blocks.profile2, `${v.blocks.profile2?.length ?? 0}b`);
t("vision: içerik system KB'sinde", v.content.includes(marker));
t("vision: files listesinde", v.files.includes("ranks/universal-2.md"));
t("report: içerik KB'de", rep.includes(marker));
t("feedback: içerik KB'de", fb.includes(marker));

console.log("\n══ KB boyutları (B36/B41 diyeti sonrası) ══");
console.log(`  vision   : ${(Buffer.byteLength(v.content) / 1024).toFixed(0)} KB`);
console.log(`  report   : ${(Buffer.byteLength(rep) / 1024).toFixed(0)} KB  (denetimde 212 KB idi)`);
console.log(`  feedback : ${(Buffer.byteLength(fb) / 1024).toFixed(0)} KB  (denetimde 181 KB idi)`);

console.log(fail === 0 ? "\n✅ İÇERİK KAYBI YOK\n" : `\n❌ ${fail} KONTROL DÜŞTÜ\n`);
process.exit(fail ? 1 : 0);
