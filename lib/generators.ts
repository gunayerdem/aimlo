import type { Lang, SetupData, RoundForm, RoundResult, RoundData, RoundFeedback, MatchScore } from "@/types";
import { MAP_LOCATIONS } from "@/constants/game-data";

export function genRoundFeedback(
  setup: SetupData,
  form: RoundForm,
  result: RoundResult,
  allRounds: RoundData[],
  lang: Lang,
  survived: boolean,
): RoundFeedback {
  const isTr = lang === "tr";
  const loc = form.deathLocation;
  const cnt = form.enemyCount;
  const note = (form.yourNote || "").toLowerCase();
  const agent = setup.agent;
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "saldırı"
      : "savunma"
    : setup.side === "attack"
      ? "attack"
      : "defense";
  const enemyAgents = setup.unknownEnemyComp
    ? []
    : (setup.enemyComp || []).filter(Boolean);
  const prevDeaths = allRounds.filter(
    (r) => !r.skipped && !r.survived && r.deathLocation === loc,
  );
  const repeatCount = prevDeaths.length;
  const nonSkipped = allRounds.filter((r) => !r.skipped);

  // --- DEATH ANALYSIS ---
  let mainMistake: string;
  if (survived) {
    mainMistake =
      result === "win"
        ? isTr
          ? `${agent} olarak ${loc} civarında hayatta kaldın ve round kazanıldı. Pozisyon tutman ve trade setup'ın doğruydu.`
          : `As ${agent}, you survived near ${loc} and won the round. Your positioning and trade setup were correct.`
        : isTr
          ? `${agent} olarak hayatta kaldın ama round kaybedildi. Takım koordinasyonu eksik — retake sırasında trade pozisyonu kurulamamış olabilir.`
          : `As ${agent}, you survived but the round was lost. Team coordination was lacking — trade positions may not have been set up during retake.`;
  } else if (repeatCount >= 2) {
    mainMistake = isTr
      ? `${loc} konumunda ${repeatCount}. kez öldün — düşman bu açıyı okuyor. ${sideLabel} tarafında aynı peek noktasını tekrar kullanmak overpeek hatası. ${agent} olarak farklı bir angle'dan swing atmalısın.`
      : `Died at ${loc} for the ${repeatCount}th time — enemy is reading this angle. Repeating the same peek point on ${sideLabel} is an overpeek error. As ${agent}, you need to swing from a different angle.`;
  } else if (Number(cnt) >= 3) {
    mainMistake = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı izole kaldın — trade setup yoktu. ${sideLabel} tarafında ${cnt}v1 engage etmek sayısal dezavantaj.`
      : `Isolated at ${loc} against ${cnt} enemies — no trade setup. Engaging ${cnt}v1 on ${sideLabel} is a numbers disadvantage.`;
  } else if (
    note.includes("rotate") ||
    note.includes("rotasyon") ||
    note.includes("döndüm")
  ) {
    mainMistake = isTr
      ? `${loc} bölgesinde rotasyon sırasında yakalandın. ${sideLabel} tarafında timing hatası — rotasyon sırasında crosshair placement'ın hazır değildi.`
      : `Caught during rotation at ${loc}. Timing error on ${sideLabel} — your crosshair placement wasn't ready during rotation.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    mainMistake = isTr
      ? `${loc} bölgesinde solo anchor oynarken öldün — trade alacak teammate yoktu. ${agent} olarak izole pozisyonda kalmak riskli.`
      : `Died solo anchoring at ${loc} — no teammate to trade. As ${agent}, staying isolated is risky.`;
  } else if (
    note.includes("util") ||
    note.includes("ability") ||
    note.includes("yetenek")
  ) {
    mainMistake = isTr
      ? `${loc} konumunda utility kullandıktan sonra savunmasız kaldın. ${agent} ability'sini kullandıktan sonra reposition yapmalısın.`
      : `Vulnerable at ${loc} after using utility. After using ${agent} ability, you need to reposition.`;
  } else {
    mainMistake = isTr
      ? `${loc} konumunda ${sideLabel} tarafı için crosshair placement'ın ideal değildi. ${agent} olarak daha korunaklı bir off-angle tut.`
      : `Your crosshair placement at ${loc} wasn't ideal for ${sideLabel}. As ${agent}, hold a more covered off-angle.`;
  }

  // --- ENEMY PATTERNS ---
  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          Math.max(nonSkipped.length, 1)
        ).toFixed(1)
      : cnt || "0";

  const recentLosses = allRounds
    .filter((r) => !r.skipped && !r.survived && r.result === "loss")
    .slice(-3);
  const recentDeathLocs = recentLosses.map((r) => r.deathLocation).filter(Boolean);
  const enemyAgentStr = enemyAgents.length > 0 ? enemyAgents.join(", ") : (isTr ? "bilinmeyen" : "unknown");

  const patterns: string[] = [];
  if (isTr) {
    if (Number(cnt) >= 4) {
      patterns.push(`Düşman ${loc} bölgesine ${cnt} kişilik full execute yapıyor — ağır baskı paterni`);
    } else if (Number(cnt) >= 2) {
      patterns.push(`Düşman ${loc} bölgesine ${cnt} kişiyle peek atıyor — coordinated peek paterni`);
    }
    if (recentDeathLocs.length >= 2) {
      const uniqueLocs = [...new Set(recentDeathLocs)];
      if (uniqueLocs.length === 1) {
        patterns.push(`Son ${recentLosses.length} round'da düşman sürekli ${uniqueLocs[0]} bölgesine baskı yapıyor`);
      } else {
        patterns.push(`Düşman ${uniqueLocs.join(" ve ")} arasında split push deniyor`);
      }
    }
    patterns.push(`Düşman (${enemyAgentStr}) ortalama ${avgEnemy} kişilik gruplarla hareket ediyor`);
    if (enemyAgents.some((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a))) {
      const duelist = enemyAgents.find((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a));
      patterns.push(`${duelist} agresif entry atıyor — flash/smoke ile karşıla`);
    }
  } else {
    if (Number(cnt) >= 4) {
      patterns.push(`Enemy running ${cnt}-man full execute on ${loc} — heavy pressure pattern`);
    } else if (Number(cnt) >= 2) {
      patterns.push(`Enemy peeking ${loc} with ${cnt} players — coordinated peek pattern`);
    }
    if (recentDeathLocs.length >= 2) {
      const uniqueLocs = [...new Set(recentDeathLocs)];
      if (uniqueLocs.length === 1) {
        patterns.push(`Enemy has pushed ${uniqueLocs[0]} for the last ${recentLosses.length} rounds`);
      } else {
        patterns.push(`Enemy attempting split push between ${uniqueLocs.join(" and ")}`);
      }
    }
    patterns.push(`Enemy (${enemyAgentStr}) moving in groups averaging ${avgEnemy} players`);
    if (enemyAgents.some((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a))) {
      const duelist = enemyAgents.find((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a));
      patterns.push(`${duelist} taking aggressive entry — counter with flash/smoke`);
    }
  }
  while (patterns.length < 3) {
    patterns.push(
      isTr
        ? "Düşman hareket kalıplarını izlemeye devam et — daha fazla round verisi gerekli"
        : "Continue observing enemy movement patterns — more round data needed",
    );
  }

  // --- NEXT ROUND PLAN ---
  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter(
    (x) => x !== loc,
  );
  const locIndex =
    altLocations.length > 0
      ? ((setup.map.length + allRounds.length) % altLocations.length)
      : 0;
  const suggestedLoc =
    altLocations[locIndex] || loc || "a different position";

  let microPlan: string;
  if (survived && result === "win") {
    microPlan = isTr
      ? `Aynı ${loc} setup'ını koru ama açını hafifçe kaydır. ${agent} utility'sini round başında kullan, agresif peek yapma.`
      : `Keep the same ${loc} setup but shift your angle slightly. Use ${agent} utility early in the round, avoid aggressive peeks.`;
  } else if (survived && result === "loss") {
    microPlan = isTr
      ? `${agent} olarak daha erken bilgi ver. Trade pozisyonunu teammate'inin yanında kur. Retake'e hazır ol.`
      : `As ${agent}, share info earlier. Set up your trade position next to your teammate. Be ready for retake.`;
  } else if (result === "loss" && repeatCount >= 2) {
    microPlan = isTr
      ? `${suggestedLoc} konumuna geç, ${loc} artık okunuyor. ${agent} olarak off-angle tut, jiggle peek ile bilgi topla.`
      : `Switch to ${suggestedLoc}, ${loc} is being read. As ${agent}, hold an off-angle, jiggle peek for info.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    microPlan = isTr
      ? `Retake oyna — ${suggestedLoc} civarında geri pozisyon al. ${agent} utility'sini retake için sakla. Takımını bekle.`
      : `Play retake — fall back near ${suggestedLoc}. Save ${agent} utility for retake. Wait for team.`;
  } else if (result === "loss") {
    microPlan = isTr
      ? `${suggestedLoc} konumuna rotate et. ${agent} ability'lerini ${loc} girişini kontrol etmek için kullan, sonra geri çekil.`
      : `Rotate to ${suggestedLoc}. Use ${agent} abilities to control ${loc} entrance, then fall back.`;
  } else {
    microPlan = isTr
      ? `Aynı stratejiyi koru. ${suggestedLoc} alternatif olarak hazır tut. ${agent} utility'sini bilgi amaçlı kullan.`
      : `Keep the same strategy. Have ${suggestedLoc} ready as alternative. Use ${agent} utility for info.`;
  }

  return { deathAnalysis: mainMistake, enemyPatterns: patterns.slice(0, 4), nextRoundPlan: microPlan };
}
export function genMatchReport(
  setup: SetupData,
  rounds: RoundData[],
  lang: Lang,
  score: MatchScore,
) {
  const isTr = lang === "tr";
  const won = rounds.filter((r) => r.result === "win").length;
  const lost = rounds.filter((r) => r.result === "loss").length;
  const skipped = rounds.filter((r) => r.skipped).length;
  const survivedCount = rounds.filter((r) => r.survived && !r.skipped).length;
  const total = rounds.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const locationCounts: Record<string, number> = {};
  nonSkipped
    .filter((r) => !r.survived)
    .forEach((r) => {
      if (r.deathLocation)
        locationCounts[r.deathLocation] =
          (locationCounts[r.deathLocation] || 0) + 1;
    });
  const topLoc = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  const topDeathLoc = topLoc ? topLoc[0] : "N/A";
  const topDeathCount = topLoc ? topLoc[1] : 0;
  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          nonSkipped.length
        ).toFixed(1)
      : "0";
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "Saldırı"
      : "Savunma"
    : setup.side === "attack"
      ? "Attack"
      : "Defense";
  const scoreStr = `${score.yours} - ${score.enemy}`;
  const matchWon = Number(score.yours) > Number(score.enemy);
  const allNotes = nonSkipped.map((r) => (r.yourNote || "").toLowerCase()).join(" ");
  const hasRotateIssue = /rotat|rotasyon|döndüm/.test(allNotes);
  const hasSoloIssue = /solo|tek/.test(allNotes);
  const hasUtilIssue = /util|ability|yetenek/.test(allNotes);
  const survivedText =
    survivedCount > 0
      ? isTr
        ? ` ${survivedCount} round'da hayatta kaldın.`
        : ` Survived ${survivedCount} rounds.`
      : "";
  const summary = isTr
    ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Skor: ${scoreStr}. ${total} round (${skipped} atlanan).${survivedText} En çok ölüm: ${topDeathLoc} (${topDeathCount}x). Ort. düşman: ${avgEnemy}.`
    : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Score: ${scoreStr}. ${total} rounds (${skipped} skipped).${survivedText} Most deaths: ${topDeathLoc} (${topDeathCount}x). Avg enemy: ${avgEnemy}.`;
  let mistake: string;
  if (topDeathCount >= 3) {
    mistake = isTr
      ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar düşmana okuma kolaylığı sağlıyor.`
      : `You died at ${topDeathLoc} ${topDeathCount} times. This makes you predictable.`;
  } else if (hasRotateIssue) {
    mistake = isTr
      ? "Birden fazla round'da erken rotasyon sorunu yaşadın."
      : "Early rotation issues in multiple rounds.";
  } else if (hasSoloIssue) {
    mistake = isTr
      ? "Solo oynadığını belirttin. Takım koordinasyonu eksik."
      : "Playing solo noted. Team coordination lacking.";
  } else if (hasUtilIssue) {
    mistake = isTr
      ? "Utility zamanlamanla ilgili sorunlar tespit edildi."
      : "Issues with utility timing detected.";
  } else {
    mistake = isTr
      ? "Genel pozisyonlama sorunları göze çarpıyor."
      : "General positioning issues stand out.";
  }
  const enemyAgents = setup.unknownEnemyComp
    ? isTr
      ? "bilinmiyor"
      : "unknown"
    : setup.enemyComp.filter(Boolean).join(", ");
  const tendencies = isTr
    ? `Düşman (${enemyAgents}) ort. ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}`
    : `Enemy (${enemyAgents}) moved in groups avg ${avgEnemy}. ${matchWon ? "Despite pressure, team responded." : "Applied pressure with numbers."}`;
  const adjustment = isTr
    ? `${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna. ` : ""}${setup.agent} olarak utility'ni stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç."}`
    : `${topDeathLoc !== "N/A" ? `Play different angles instead of ${topDeathLoc}. ` : ""}As ${setup.agent}, time utility strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier."}`;

  // Best round — find a won round where player survived
  const bestRoundData = nonSkipped.find((r) => r.result === "win" && r.survived);
  const bestRound = bestRoundData
    ? isTr
      ? `Round ${bestRoundData.roundNumber} — ${bestRoundData.deathLocation || setup.map} bölgesinde hayatta kalarak round kazandın. Pozisyon tutma ve trade setup doğruydu.`
      : `Round ${bestRoundData.roundNumber} — Won the round surviving at ${bestRoundData.deathLocation || setup.map}. Positioning and trade setup were correct.`
    : isTr
      ? `Bu maçta öne çıkan bir round bulunamadı. Hayatta kalma oranını artırmaya odaklan.`
      : `No standout round found this match. Focus on improving survival rate.`;

  // Decision score
  const survivalPct = nonSkipped.length > 0 ? survivedCount / nonSkipped.length : 0;
  const deathVariety = Object.keys(locationCounts).length;
  let scoreNum = 5;
  if (winPct >= 60) scoreNum += 2;
  else if (winPct >= 45) scoreNum += 1;
  if (survivalPct >= 0.4) scoreNum += 1;
  if (deathVariety >= 3) scoreNum += 1;
  if (topDeathCount >= 4) scoreNum -= 2;
  else if (topDeathCount >= 3) scoreNum -= 1;
  scoreNum = Math.max(1, Math.min(10, scoreNum));
  const decisionScore = isTr
    ? `${scoreNum}/10 — ${scoreNum >= 7 ? "İyi karar verme, pozisyon çeşitliliği var" : scoreNum >= 5 ? "Ortalama karar verme, tekrarlayan hatalar var" : "Zayıf karar verme, aynı hataları tekrarlıyorsun"}`
    : `${scoreNum}/10 — ${scoreNum >= 7 ? "Good decision making with positional variety" : scoreNum >= 5 ? "Average decision making with recurring mistakes" : "Weak decision making, repeating the same errors"}`;

  return {
    summary,
    mistake,
    tendencies,
    adjustment,
    bestRound,
    decisionScore,
    won,
    lost,
    skipped,
    survivedCount,
    total,
    winPct,
    scoreStr,
    matchWon,
  };
}
