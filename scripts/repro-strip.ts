import { stripForeignCallouts } from "../lib/reality-checker";

// GERÇEK feedback biçimindeki metinler — canlı bug'ı yeniden üretmek için.
const ornekler: [string, string][] = [
  ["Lotus", "C Mound'da tek başına kaldın, düşman seni oradan avladı."],
  ["Lotus", "Tepe'de ult'un hazırken riskli açıda kaldın ve düştün."],
  ["Lotus", "A Main'e utility'siz girdin, Tree'den gelen çapraz ateşte öldün."],
  ["Lotus", "C Waterfall yakınında spike ekerken arkadan vuruldun."],
  ["Split", "A Ramp'tan çıkarken Heaven'daki düşman seni headshot'ladı."],
  ["Split", "B Tower'da beklerken Sewer'dan gelen flanka yakalandın."],
  ["Ascent", "A Short'ta geniş açı aldın, Wine'dan gelen op seni aldı."],
  ["Haven", "C Long'da tek kaldın, Garage'dan rotasyon yapmalıydın."],
];

let gutted = 0;
for (const [map, txt] of ornekler) {
  const sonra = stripForeignCallouts(txt, map);
  const bozuldu = sonra !== txt;
  const kayip = txt.split(/\s+/).length - sonra.split(/\s+/).length;
  console.log(`\n[${map}] ${bozuldu ? "⚠️ DEĞİŞTİ (-" + kayip + " kelime)" : "✅ aynı"}`);
  console.log(`  ÖNCE : ${txt}`);
  if (bozuldu) { console.log(`  SONRA: ${sonra}`); gutted++; }
}
console.log(`\n═══ ${gutted}/${ornekler.length} feedback DEĞİŞTİRİLDİ ═══`);
