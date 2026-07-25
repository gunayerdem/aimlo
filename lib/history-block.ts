/**
 * ROUND-GEÇMİŞİ BLOĞU — TEK KAYNAK (route + eval aynı metni kursun)
 * ═══════════════════════════════════════════════════════════════════════════
 * NEDEN AYRI MODÜL: lib/vision-prompt.ts'in amaç beyanı route ile
 * scripts/eval-vision.ts'in AYNI prompt'u kurmasını şart koşuyor. Geçmiş bloğu bu
 * kurala UYMUYORDU: route patternNote + posNote + deathZoneNote üretirken eval
 * yalnız patternNote üretiyordu. Sonuç: eval, canlıda modelin GÖRDÜĞÜ kanıtın bir
 * kısmını hiç göstermiyordu → ölçüm canlıyı yansıtmıyordu (KB 10h nöbeti
 * 2026-07-25). Mantık buraya taşındı; iki taraf da bunu çağırır, sapma bir daha
 * oluşamaz.
 *
 * DİREKTİF (yeni): blok eskiden SALT VERİ olarak bitiyordu — "bunu çıktında kullan"
 * diyen tek satır yoktu (oysa desktop'tan gelen patternContext'in yumuşak bir
 * talimatı vardı). Ölçüm: nextRoundSuggestion en zayıf alan (65.8/100), en sık
 * kusur "veri referansı yok" (59 kez). Yani model kanıtı ALIYOR ama dersi ona
 * BAĞLAMIYORDU — softi'nin "çok genel" şikayetinin ölçülmüş kaynağı.
 *
 * ⚠ UYDURMA RİSKİ: direktif bilinçli olarak "SAYI ÜRET" DEMİYOR — "YAZILANI
 * KOPYALA" diyor ve saymayı/toplamayı emir kipiyle YASAKLIYOR. Sebep: ai-policy.ts
 * kayıtlarına göre "her cümlede sayı zorunlu" kuralı geçmişte modeli sayı
 * UYDURMAYA itmişti (reality-checker'ın TR metni bozmasının 1 numaralı nedeni).
 * Bu formülasyonla modelin erişebildiği tek sayı kaynağı posNote/deathZoneNote'tur
 * ve bunlar reality-checker'ın validateClaims penceresiyle AYNI filtreden geçer.
 */

export type RoundHistoryEntry = Record<string, unknown>;

/** Geçmiş VARKEN eklenen kullanım direktifi (kısa — her istekte gider). */
// ⚠ ETİKET SIZINTISI DERSİ (2026-07-25, ilk sürümün ölçülen regresyonu): direktifin
// ilk hâli "Position pattern satırını ADIYLA kullan" diyordu → model etiketi BİREBİR
// çıktıya kopyaladı ("Position pattern: b main bölgesinde…"). 31 örneğin 15'inde
// görüldü (öncesinde 0). Üstelik detector puanı bundan YAPAY yükseldi (etiket callout
// ve sayı içerdiği için ölçüt kandırılıyordu) — yani metrik iyileşirken GERÇEK kalite
// düşmüştü. Artık: etiketi YAZMA, içindeki callout+sayıyı KENDİ cümlende kullan.
export const HISTORY_USE_DIRECTIVE =
  `\n[GEÇMİŞİ KULLAN] Yukarıdaki pattern satırlarında callout ve sayı varsa nextRoundSuggestion bunları KENDİ cümlesinde kullansın ("B Main'de 3 kez aynı açıya gittin — bu round…"). Sayıyı yazıldığı gibi al; kendin sayma, toplama, pencere daraltma. ⚠ "Position pattern", "Death zone pattern", "Pattern:" gibi ETİKETLERİ ÇIKTIYA YAZMA — bunlar iç not, oyuncu görmemeli. Pattern satırı yoksa round etiketiyle bağlan ("R7'de de orada öldün"). Listede YAZMAYAN sayı/callout UYDURMA.`;

export const HISTORY_USE_DIRECTIVE_EN =
  `\n[USE THE HISTORY] If the pattern lines above contain a callout and a number, nextRoundSuggestion must weave them into ITS OWN sentence ("you went to that same B Main angle 3 times — this round…"). Take the number exactly as written; never count, add up or narrow the window yourself. ⚠ NEVER print the labels "Position pattern", "Death zone pattern" or "Pattern:" in the output — they are internal notes the player must not see. If there is no pattern line, tie it to a round label ("you died there in R7 too"). Never invent a number or callout that is not listed.`;

/** Geçmiş YOKKEN (R1 / calibrating) eklenen çapa direktifi. */
export const NO_HISTORY_ANCHOR =
  `\n\n[GEÇMİŞ YOK] Bu maçtan geçmiş round verisi gelmedi. nextRoundSuggestion'ı geçmişe değil BU round'un verisine çıpala: skor, öldüren ajan + silah, ölüm yeri, ekonomi, side. Geçmiş/pattern/sayı iddiası UYDURMA.`;

export const NO_HISTORY_ANCHOR_EN =
  `\n\n[NO HISTORY] No prior-round data was sent for this match. Anchor nextRoundSuggestion to THIS round's data, not the past: score, killer agent + weapon, death location, economy, side. Never claim a past pattern or number.`;

/**
 * Round geçmişi bloğunu kurar. Davranış route.ts'teki özgün mantıkla BİREBİR
 * aynıdır; tek fark (a) pencere-tutarlı sayı ve (b) sondaki direktif.
 */
export function buildHistoryBlock(
  roundHistory: RoundHistoryEntry[] | undefined,
  lang: "tr" | "en",
): string {
  const en = lang === "en";
  if (!roundHistory || !Array.isArray(roundHistory) || roundHistory.length === 0) {
    return en ? NO_HISTORY_ANCHOR_EN : NO_HISTORY_ANCHOR;
  }

  const historyLines = roundHistory.map((r) => {
    const status = r.died ? (en ? "died" : "öldü") : en ? "survived" : "hayatta kaldı";
    const confidence =
      r.death_detected_confidence === "observed"
        ? en
          ? " (confidence: observed)"
          : " (güven: observed)"
        : "";
    const posInfo = r.death_position ? ` @ ${r.death_position}` : "";
    return `R${r.round_index}: ${status}${confidence}${posInfo}`;
  });

  const deathCount = roundHistory.filter((r) => r.died).length;
  const total = roundHistory.length;
  const patternNote =
    deathCount >= total * 0.5
      ? en
        ? `Pattern: died in ${deathCount} of the last ${total} rounds → a repeating problem is proven`
        : `Pattern: Son ${total} round'un ${deathCount}'${deathCount > 1 ? "inde" : "unda"} ölüm → tekrar eden sorun kanıtlanmış`
      : en
        ? `${deathCount} death(s) in the last ${total} rounds`
        : `Son ${total} round'da ${deathCount} ölüm`;

  const posEntries = roundHistory
    .filter(
      (r) =>
        r.died &&
        r.death_position &&
        (r.position_confidence === "high" || r.position_confidence === "medium"),
    )
    .map((r) => ({
      pos: (r.death_position as string).toLowerCase(),
      round: r.round_index as number,
    }));

  const posCounts: Record<string, number> = {};
  posEntries.forEach((e) => {
    posCounts[e.pos] = (posCounts[e.pos] || 0) + 1;
  });
  const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0];

  let posNote = "";
  if (topPos && topPos[1] >= 2) {
    const matchingRounds = posEntries.filter((e) => e.pos === topPos[0]).map((e) => e.round);
    const recentRounds = matchingRounds.slice(-3);
    const span =
      recentRounds.length >= 2 ? recentRounds[recentRounds.length - 1] - recentRounds[0] : 0;
    const isRecent = span <= 5;
    // 🔴 Sayı da PENCEREDEN sayılır: eskiden TOPLAM sayı ile DAR pencere yan yana
    // yazılıp "6 kez, son 5 round içinde" gibi matematiksel olarak İMKÂNSIZ cümle
    // çıkıyordu (prompt modele uydurma sayı besliyordu). Artık validateClaims'in
    // pencere hesabıyla birebir uyuşur.
    const recentCount =
      recentRounds.length >= 1
        ? matchingRounds.filter((r) => r >= recentRounds[0]).length
        : topPos[1];

    if (topPos[1] >= 3 && isRecent) {
      posNote = en
        ? `\nPosition pattern (STRONG — ${recentCount} times within the last ${span + 1} rounds): repeated deaths in the ${topPos[0]} area. The timing of this pattern is consistent too.`
        : `\nPosition pattern (GÜÇLÜ — ${recentCount} kez, son ${span + 1} round içinde): ${topPos[0]} bölgesinde tekrar eden ölüm. Bu pattern zamanlama olarak da tutarlı.`;
    } else if (topPos[1] >= 2) {
      posNote = en
        ? `\nPosition pattern (PROVEN): you died ${topPos[1]} times in the ${topPos[0]} area`
        : `\nPosition pattern (KANITLANMIŞ): ${topPos[0]} bölgesinde ${topPos[1]} kez öldün`;
    }
  }

  let deathZoneNote = "";
  if (posEntries.length >= 2) {
    let consecutiveCount = 1;
    let consecutivePos = "";
    for (let i = 1; i < posEntries.length; i++) {
      if (
        posEntries[i].pos === posEntries[i - 1].pos &&
        posEntries[i].round - posEntries[i - 1].round <= 2
      ) {
        consecutiveCount++;
        consecutivePos = posEntries[i].pos;
      } else {
        consecutiveCount = 1;
      }
    }
    const lastPos = posEntries[posEntries.length - 1]?.pos;
    const prevPositions = posEntries.slice(0, -1).map((e) => e.pos);
    const isNewArea = lastPos && prevPositions.length > 0 && !prevPositions.includes(lastPos);

    if (consecutiveCount >= 3) {
      deathZoneNote = en
        ? `\nDeath zone pattern (STRONG): you died ${consecutiveCount} rounds in a row in the ${consecutivePos} area — you keep getting killed for free from that angle.`
        : `\nDeath zone pattern (GÜÇLÜ): ${consecutivePos} bölgesinde ${consecutiveCount} round art arda öldün — bu açıdan tekrar tekrar bedavaya öldürülüyorsun.`;
    } else if (consecutiveCount >= 2) {
      deathZoneNote = en
        ? `\nDeath zone pattern: back-to-back deaths in the ${consecutivePos} area — this area may be a problem.`
        : `\nDeath zone pattern: ${consecutivePos} bölgesinde art arda ölüm — bu bölge sorun oluşturuyor olabilir.`;
    } else if (isNewArea) {
      deathZoneNote = en
        ? `\nDeath area changed: in earlier rounds you were in the ${prevPositions[prevPositions.length - 1]} area, now ${lastPos}.`
        : `\nÖlüm bölgesi değişti: önceki round'larda ${prevPositions[prevPositions.length - 1]} bölgesindeydin, şimdi ${lastPos}.`;
    }
  }

  const header = en ? "Recent round history (observed):" : "Son round geçmişi (gözlemlenmiş):";
  const directive = en ? HISTORY_USE_DIRECTIVE_EN : HISTORY_USE_DIRECTIVE;
  return `\n\n${header}\n${historyLines.join("\n")}\n${patternNote}${posNote}${deathZoneNote}${directive}`;
}
