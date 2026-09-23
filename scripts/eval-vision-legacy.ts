/**
 * DONDURULMUŞ ESKİ AYNA (pre-parity) — B06 (2026-09-24). GÜNCELLENMEZ.
 * ─────────────────────────────────────────────────────────────────────────
 * scripts/eval-vision.ts'in B06 ÖNCESİ (HEAD 9e8aa54) prompt/çağrı/son-işlem
 * aynası, kod AYNEN taşındı (yalnız export + sim/apiKey parametresi). Tek amacı
 * eski cycle'larla (cycle*-samples.json, B06'dan önce koşulanlar) kıyaslanabilir
 * yeni koşu üretmek: EVAL_LEGACY_MIRROR=1 npx tsx scripts/eval-vision.ts
 *
 * ⚠ BU AYNA PROD'U YANSITMAZ (ölçüldü, 85 korpus senaryosu): sistem mesajı
 * senaryo başına ~82,8 KB eksik (static/scenario/profile/profile2 + karşı-ajan),
 * kullanıcı mesajında 11 direktif yok, ders tipi 7 round'da farklı, 350 token +
 * çıplak şema + çıplak JSON.parse. Yeni ölçüm VARSAYILAN yoldan (prod kurucusu,
 * lib/vision-prompt-builder.ts) yapılır. Buraya yeni direktif/blok EKLEME —
 * eklenirse eski tabanla kıyaslanabilirlik (tek varlık nedeni) biter.
 */
import { SYSTEM_PROMPT, SYSTEM_PROMPT_EN_ADDENDUM, USER_PROMPT, USER_PROMPT_EN, buildRoundFeedbackSchema } from "../lib/vision-prompt";
import { buildPolicyBlock } from "../lib/ai-policy";
import { loadVisionKnowledge } from "../lib/knowledge-loader";
import { buildFactGround } from "../lib/reality-checker";
import { stripNumericHp } from "../lib/coach-text";
import { finalizeVisionFeedback } from "../lib/vision-postprocess";
import { buildAgentAbilityHint } from "../lib/agent-abilities";
import { sanitizePromptInput } from "../lib/prompt-safety";
import { classifyDeathVaried, buildDeathTypeDirective, sanitizeAliveCount, ALLIES_ALIVE_MAX, ENEMIES_ALIVE_MAX, type DeathType } from "../lib/death-type";
import { buildHistoryBlock, type RoundHistoryEntry } from "../lib/history-block";
import type { Scenario } from "./eval-vision";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/** Senaryonun istek dili — eval-vision langOf ile aynı sözleşme (varsayılan tr). */
function langOf(s: Scenario): "tr" | "en" {
  return s.lang === "en" ? "en" : "tr";
}

// ── confidence derivation (route 725-730) ──
export function deriveConfidence(rh: unknown): "calibrating" | "low" | "medium" | "high" {
  const arr = Array.isArray(rh) ? rh : null;
  if (!arr || !arr.length) return "calibrating";
  if (arr.length < 4) return "low";
  if (arr.length < 8) return "medium";
  return "high";
}

// ── system message assembly (route 731-792) ──
export function buildSystemMessage(s: Scenario): string {
  const b = s.body;
  const lang = langOf(s);                            // B57 (2026-07-31)
  const confidence = deriveConfidence(b.roundHistory);
  const sections: string[] = [
    // route.ts:639 — EN'de sistem prompt'una EN eklentisi biner.
    lang === "en" ? SYSTEM_PROMPT + SYSTEM_PROMPT_EN_ADDENDUM : SYSTEM_PROMPT,
    buildPolicyBlock({
      confidence, tone: "strict", lang,
      includeEnemyGate: true, includeDecisionRubric: false,
      // Rank-5 (2026-08-24) sadakat: route.ts langRulesMode:'dedupe' — aynı commit.
      anchorMode: "ocr", outputFocusMode: "single", enemyGateMode: "vision",
      langRulesMode: "dedupe",
    }),
  ];
  const kb = loadVisionKnowledge({
    map: b.map as string | undefined,
    agent: b.agent as string | undefined,
    rank: b.rank as string | undefined,
    enemyAgents: b.enemyComp as string[] | undefined,
    spikePlanted: typeof b.spikePlanted === "boolean" ? (b.spikePlanted as boolean) : undefined,
    economyType: b.economyType as string | undefined,
    side: b.side as string | undefined,
  });
  if (kb.blocks.agent) sections.push(kb.blocks.agent);
  if (kb.blocks.map) sections.push(kb.blocks.map);
  if (kb.blocks.contextual) sections.push(kb.blocks.contextual);
  const abilityHint = buildAgentAbilityHint(b.agent as string | undefined, lang);
  if (abilityHint) sections.push(abilityHint);
  if (s.memoryContext) {
    const capped = s.memoryContext.trim().slice(0, 1200);
    // route.ts:707-715 — sarmalayıcı reqLang'de (EN'de Türkçe örnek cümle
    // modelce taklit ediliyordu, canlı-test 2026-07-18 dil sızıntısı).
    sections.push(
      lang === "en"
        ? `[CROSS-MATCH HISTORY — long-term player profile (from persisted data, NOT this round)]\n` +
          `This is the player's accumulated profile from past matches. You may reference it like a coach when relevant ` +
          `(e.g. "you died at A Short again — that is your recurring spot"); but this round's OCR data always takes priority. ` +
          `Do NOT alter these numbers, do NOT invent new statistics.\n${capped}`
        : `[CROSS-MATCH GEÇMİŞİ — uzun vadeli oyuncu profili (kalıcı veriden, bu round'a ait DEĞİL)]\n` +
          `Bu, oyuncunun geçmiş maçlardan birikmiş profilidir. İlgiliyse koç gibi referans verebilirsin ` +
          `(ör. "yine A Short'ta öldün — bu senin tekrar eden noktan"); ama bu round'un OCR verisi her zaman önceliklidir. ` +
          `Buradaki sayıları DEĞİŞTİRME, yeni istatistik UYDURMA.\n${capped}`,
    );
  }
  if (typeof b.patternContext === "string" && b.patternContext) {
    const clean = sanitizePromptInput(b.patternContext, { max: 2000 });
    if (clean) sections.push(`[PATTERN CONTEXT — Rust Client]\n${clean}`);
  }
  return { msg: sections.join("\n\n---\n\n"), confidence, kb } as unknown as string;
}

// ── ctx + user prompt assembly (route 769-1101, fields-present subset) ──
//
// ⚠ AÇIK SADAKAT BOŞLUĞU — B83 denetimi sırasında ÖLÇÜLDÜ (2026-07-31).
// B83'ün asıl derdi (factGround eval'de elle kuruluyor) postProcess'te ZATEN
// kapalı (aşağıya bak). Ama aynı sınıftan bir sapma PROMPT tarafında duruyor:
// prod'un user mesajı (route.ts:1062-1080) burada ÜRETİLMEYEN iki blok taşıyor:
//   • factSheet = buildFactSheet(factGround, ctx, lang) — TR'de EN BAŞTA gelir;
//     "BİLİNEN/BİLİNMEYEN" olgu sözleşmesi, HER round dolu (vision-prompt.ts:21).
//   • weaponCompDirective = buildWeaponCompDirective(killerWeapon, compArchetype,
//     loadout, lang) — killerInfo'da silah varken dolu (comp-weapon.ts:117,125).
// Sapma OLMAYANLAR (yanlış alarm üretmesin diye ölçüldü): mapUnknown/locUnknown
// direktifleri bu korpusun TAMAMINDA boş çıkar (her senaryonun haritası + ölüm
// yeri var); confidence direktifi eval'de system prefix'inde (buildPolicyBlock
// varsayılanı confidenceInPrefix!==false), prod'da user mesajında — İÇERİK aynı,
// yalnız KONUM farklı.
// SONUÇ: eval modeli prod'dan DAHA AZ kısıtlar → uydurma oranı prod'dakinden
// YÜKSEK ölçülür (yanlış-kötümser, yanlış-iyimser değil).
// NEDEN KAPATILMADI: bu bloklar prompt'a eklenince ölçüm TABANI değişir ve eski
// cycle'larla A/B kıyaslanabilirlik kırılır — B83'ün tarifi dışı, bilinçli olarak
// ANA OTURUMA bırakıldı; sessizce yapılmadı.
export function buildUserPrompt(s: Scenario, MATCH_CONCEPT_SIM: Map<string, DeathType[]>): string {
  const b = s.body;
  const lang = langOf(s);                            // B57 (2026-07-31)
  const ctx: Record<string, unknown> = {};
  if (typeof b.round === "number") ctx.round = b.round;
  if (typeof b.score === "string") ctx.score = b.score;
  if (typeof b.result === "string") ctx.result = (b.result as string).toUpperCase();
  if (typeof b.map === "string") ctx.map = b.map;
  if (typeof b.agent === "string") ctx.agent = b.agent;
  if (typeof b.side === "string") {
    // route.ts:764-766 — side etiketi de reqLang'de.
    ctx.side = b.side === "attack"
      ? (lang === "en" ? "attack (ATTACK — you are entering the site)" : "attack (SALDIRI — sen siteye giriyorsun)")
      : b.side === "defense"
        ? (lang === "en" ? "defense (DEFENSE — you are holding the site)" : "defense (SAVUNMA — sen siteyi tutuyorsun)")
        : b.side;
  }
  if (typeof b.mode === "string") ctx.mode = b.mode;
  if (Array.isArray(b.enemyComp) && (b.enemyComp as string[]).length) ctx.enemyRoster = (b.enemyComp as string[]).slice(0, 5);
  if (b.died === true) {
    ctx.died = true;
    if (typeof b.killerInfo === "string") ctx.killerInfo = sanitizePromptInput(b.killerInfo, { max: 120, collapseWhitespace: true });
    if (typeof b.deathLocation === "string") ctx.deathLocation = sanitizePromptInput(b.deathLocation, { max: 50, collapseWhitespace: true });
    if (typeof b.deathAngle === "string") ctx.deathAngle = sanitizePromptInput(b.deathAngle, { max: 30, collapseWhitespace: true });
    // MIRROR route.ts (2026-07-09): healthAtDeath is no longer put into ctx —
    // numeric HP stays out of the prompt (classifyDeath below still gets the number).
    // MIRROR route.ts (LOGLAR-03, 2026-09-23): aralık dışı canlı sayısı ctx'e yazılmaz.
    const alliesAliveOk = sanitizeAliveCount(b.alliesAlive, ALLIES_ALIVE_MAX);
    const enemiesAliveOk = sanitizeAliveCount(b.enemiesAlive, ENEMIES_ALIVE_MAX);
    if (alliesAliveOk !== undefined) ctx.alliesAlive = alliesAliveOk;
    if (enemiesAliveOk !== undefined) ctx.enemiesAlive = enemiesAliveOk;
    if (b.spikePlanted === true) ctx.spikePlanted = true;
    if (typeof b.tradedByAlly === "boolean") ctx.tradedByAlly = b.tradedByAlly;
    if (typeof b.playerRoute === "string") {
      ctx.playerRoute = sanitizePromptInput(b.playerRoute, { max: 120, collapseWhitespace: true });
      if (b.routeConfidence) ctx.routeConfidence = b.routeConfidence;
    }
  } else if (b.died === false) {
    ctx.died = false;
  }
  if (typeof b.economyType === "string") ctx.economyType = (b.economyType as string).slice(0, 20);
  if (typeof b.credits === "number") ctx.credits = b.credits;
  if (typeof b.loadout === "string") ctx.loadout = sanitizePromptInput(b.loadout, { max: 30, collapseWhitespace: true });
  if (typeof b.playerKills === "number") ctx.playerKills = b.playerKills;
  if (typeof b.playerDeaths === "number") ctx.playerDeaths = b.playerDeaths;
  if (typeof b.playerAssists === "number") ctx.playerAssists = b.playerAssists;
  if (Array.isArray(b.killfeedOrder) && (b.killfeedOrder as string[]).length) {
    ctx.killfeedOrder = (b.killfeedOrder as string[]).slice(0, 10).map((e) => sanitizePromptInput(e, { max: 60, collapseWhitespace: true }));
  }

  const ctxJson = Object.keys(ctx).length ? JSON.stringify(ctx, null, 2) : "";
  const patternBlock = typeof b.patternContext === "string" && b.patternContext ? stripNumericHp(sanitizePromptInput(b.patternContext, { max: 2000 }) || "", lang) : "";

  // DEATH-TYPE directive — MIRROR route.ts (variety fix 2026-06-30) so the eval measures
  // the SAME pipeline the desktop hits. Without this the eval would test the OLD behavior.
  let deathTypeDirective = "";
  if (b.died === true) {
    const rh2 = b.roundHistory as Record<string, unknown>[] | undefined;
    const loc = (typeof b.deathLocation === "string" ? b.deathLocation : "").toLowerCase();
    const repeatedPosition = !!loc && Array.isArray(rh2) && rh2.some((r) =>
      r.died === true && typeof r.death_position === "string" &&
      (r.death_position as string).toLowerCase().includes(loc) &&
      (r.position_confidence === "high" || r.position_confidence === "medium"));
    // (canlı-test #14) MIRROR route.ts: prev artık SINIFLANDIRMADAN ÖNCE —
    // classifyDeathVaried aile-tekrarını görebilsin (route ile birebir sıra).
    const prevFromRh = (Array.isArray(rh2) ? rh2 : [])
      .map((r) => (typeof r.death_type === "string" ? r.death_type : ""))
      .filter((s): s is string => s.length > 0) as DeathType[];
    const mcKey = /^(M\d+)-R\d+/.exec(s.id)?.[1] ?? "";
    const prevTypes = prevFromRh.length > 0
      ? prevFromRh
      : mcKey ? [...(MATCH_CONCEPT_SIM.get(mcKey) ?? [])] : [];
    const dtype = classifyDeathVaried({
      side: b.side as string | undefined,
      killerInfo: b.killerInfo as string | undefined,
      deathLocation: b.deathLocation as string | undefined,
      deathTiming: b.deathTiming as string | undefined,
      // MIRROR route.ts stale-gate (2026-07-09): stale HP (>4s sample age) is
      // dropped as a classifier signal, exactly like the prod route.
      healthAtDeath:
        typeof b.hpSampleAgeSec !== "number" ||
        (Number.isFinite(b.hpSampleAgeSec) && (b.hpSampleAgeSec as number) >= 0 && (b.hpSampleAgeSec as number) <= 4)
          ? (b.healthAtDeath as number | undefined)
          : undefined,
      alliesAlive: b.alliesAlive as number | undefined,
      enemiesAlive: b.enemiesAlive as number | undefined,
      spikePlanted: b.spikePlanted as boolean | undefined,
      economyType: b.economyType as string | undefined,
      tradedByAlly: b.tradedByAlly as boolean | undefined,
      repeatedPosition,
    }, prevTypes);
    deathTypeDirective = buildDeathTypeDirective(dtype, prevTypes, lang);
    if (mcKey) {
      // (canlı-test #14) SET→LIST aynası: tekrarlar KORUNUR (match-concepts
      // RPUSH göçünün simülasyonu — repeatCount gerçek sayıya kavuşur).
      const list = MATCH_CONCEPT_SIM.get(mcKey) ?? [];
      list.push(dtype);
      MATCH_CONCEPT_SIM.set(mcKey, list);
    }
  }

  // AÇILIŞ-ROTASYONU — MIRROR route.ts (rank-3, 2026-08-24): round % 3 seed'li
  // deterministik iskelet seçimi; sadakat sözleşmesi B9 — iki dosya AYNI commit'te
  // AYNI direktifi kurar, yoksa ölçüm canlıyı yansıtmaz. died=false / round yoksa boş.
  let openerDirective = "";
  if (b.died === true && typeof b.round === "number" && Number.isFinite(b.round)) {
    const oi = ((Math.trunc(b.round as number) % 3) + 3) % 3;
    openerDirective = lang === "en"
      ? `\n[OPENER] This round open deathAnalysis with: ${["(a) the most critical ROOT cause", "(b) the lesson as an imperative, with its own verb", "(c) what the enemy did — make the ENEMY the subject"][oi]}. The [DEATH-TYPE HINT] picks the lesson; this line only picks the opener.`
      : `\n[AÇILIŞ] deathAnalysis açılışı bu round: ${["(a) en kritik KÖK neden", "(b) dersin EMİR hali, dersin kendi fiiliyle", "(c) düşmanın yaptığı — öznen RAKİP olsun"][oi]}. [ÖLÜM-TİPİ İPUCU] dersi seçer; bu satır yalnız açılışı seçer.`;
  }

  // [BAĞLAMSIZ ÖLÜM] — MIRROR route.ts (canlı-test #15 DC4, 2026-09-01): killer +
  // deathLocation ikisi de boşken roster'ın round-gözlemi gibi sunulmasını menet
  // (komp-yankısı nakaratı: 8 ölümün 6'sında "kadroda Chamber var, uzun hat").
  // Sadakat sözleşmesi B9 — route ile AYNI commit'te aynı direktif; mevcut korpus
  // senaryolarının killer/loc'u dolu → oralarda boş string, ölçüm tabanı değişmez.
  const contextlessDeathDirective = (b.died === true && !ctx.killerInfo && !ctx.deathLocation)
    ? (lang === "en"
        ? `\n[CONTEXTLESS DEATH] Neither the killer nor the death location could be read this round. The enemy ROSTER is static match data, NOT an observation about THIS round — do not present a roster agent as this round's finding ("they have Chamber, watch long angles" style repeats every round and is banned as the main point). Anchor point 1 of enemyAnalysis and the deathAnalysis lesson to the death-type hint, side, timing and numbers (allies/enemies alive). You may mention ONE roster agent at most ONCE, only inside the counter-move (point 2), and only with a concrete action.`
        : `\n[BAĞLAMSIZ ÖLÜM] Bu round ne katil ne ölüm yeri okunabildi. Rakip KADRO maçın sabit verisidir, BU round'un gözlemi DEĞİL — roster'dan bir ajanı bu round'un bulgusu gibi sunma ("kadroda Chamber var, uzun hatlara dikkat" kalıbı her round aynı çıkar ve ana madde olarak YASAK). enemyAnalysis Madde 1'i ve deathAnalysis dersini ölüm-tipi ipucuna, side'a, timing'e ve sayı durumuna (allies/enemiesAlive) çapala. Roster'dan EN FAZLA BİR ajanı, yalnız Madde 2'nin karşı-hamlesi içinde ve somut bir eylemle anabilirsin.`)
    : "";

  // B57 (2026-07-31): dil direktifi — route.ts:1013-1014. EN'de EN BAŞA gelir
  // (route.ts:1048-1049: "model önce dili görsün"); TR'de boş → bayt-aynı.
  const langDirective = lang === "en"
    ? `\n[LANGUAGE] The player's language is ENGLISH. Write deathAnalysis, enemyAnalysis and nextRoundSuggestion ONLY in natural English coach language (keep universal game terms: peek, trade, smoke, eco...). The knowledge blocks and some context/instruction lines are in Turkish — use them as source FACTS and LESSONS but always RESTATE them in English. NEVER copy a Turkish sentence or word into your output.`
    : "";

  let prompt = (lang === "en" ? USER_PROMPT_EN : USER_PROMPT) +
    langDirective +
    contextlessDeathDirective + // BAĞLAMSIZ ÖLÜM — route aynası (canlı-test #15 DC4)
    deathTypeDirective +
    openerDirective + // AÇILIŞ BİÇİMİ — route ile aynı rotasyon (rank-3, per-round)
    (ctxJson
      ? (lang === "en"
          ? `\n\n[ROUND CONTEXT — OCR pixel truth, more reliable than the screenshot]\n${ctxJson}`
          : `\n\n[ROUND CONTEXT — OCR pixel truth, screenshot'tan güvenilir]\n${ctxJson}`)
      : "") +
    (patternBlock
      ? (lang === "en"
          ? `\n\n[PATTERN — recurring mistake across recent rounds. If present, reference it like a coach inside deathAnalysis or nextRoundSuggestion — do not open an extra field]\n${patternBlock}`
          : `\n\n[PATTERN — son round'lardaki tekrar eden hata. Bu varsa deathAnalysis veya nextRoundSuggestion'da koç gibi referans ver — extra alan açma]\n${patternBlock}`)
      : "");

  // GECMIS BLOGU: route ile AYNI fonksiyon (lib/history-block.ts). Eskiden burada
  // EKSIK bir kopya vardi (yalniz patternNote) → eval, canlida modelin gordugu
  // posNote/deathZoneNote kanitini hic gostermiyordu ve olcum canliyi yansitmiyordu.
  prompt += buildHistoryBlock(
    b.roundHistory as RoundHistoryEntry[] | undefined,
    lang,
  );
  // Sandviç tekniği (route.ts:1085-1087): EN'de üretimden hemen önceki SON
  // satır dil emri olsun. TR'de eklenmez → bayt-aynı.
  if (lang === "en") {
    prompt += `\n\n[REMINDER] Output language: ENGLISH ONLY. All three fields in natural English coach voice — never a Turkish word.`;
  }
  return prompt;
}

// ── OpenAI call (route 1002-1064) ──
// B57 (2026-07-31): şema da dile bağlı — route.ts:1140 buildRoundFeedbackSchema(reqLang).
// json_schema description'ları üretimden hemen önceki EN GÜÇLÜ sinyal (vision-prompt.ts:108-113),
// EN aynası TR şemayla koşarsa ölçüm prod'u yansıtmaz.
export async function callModel(apiKey: string, systemMessage: string, userPrompt: string, lang: "tr" | "en" = "tr"): Promise<unknown> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      // EVAL_MODEL (model A/B, 2026-09-16): varsayılan prod modeli (gpt-5-mini) —
      // sadakat korunur; aday model kıyası için env ile değiştirilir. EVAL_EFFORT=omit
      // → reasoning_effort GÖNDERİLMEZ (parametreyi tanımayan adaylar 400 dönmesin);
      // EVAL_EFFORT=none → "none" değeri GÖNDERİLİR (5.6 ailesinde geçerli seviye).
      model: process.env.EVAL_MODEL || "gpt-5-mini",
      // EVAL_MAX_TOKENS / EVAL_EFFORT (KB 10h nöbeti 2026-07-25): canlı route'un
      // değerleri VARSAYILAN (minimal / 350) — sadakat korunur. Env ile
      // değiştirilebilir ki "reasoning_effort kaliteyi ne kadar taşıyor?" sorusu
      // KB değişikliğinden AYRI bir değişken olarak ölçülebilsin (route.ts:1057'deki
      // "kalite düşerse low/medium'a çıkar" notunun ampirik sınaması).
      max_completion_tokens: Number(process.env.EVAL_MAX_TOKENS || 350),
      response_format: { type: "json_schema", json_schema: buildRoundFeedbackSchema(lang) },
      ...(process.env.EVAL_EFFORT === "omit"
        ? {}
        : { reasoning_effort: (process.env.EVAL_EFFORT || "minimal") as "none" | "minimal" | "low" | "medium" | "high" }),
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "unreadable");
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return { parsed: JSON.parse(text), usage: data?.usage };
}

/* ── post-process — PROD ZİNCİRİNİN KENDİSİ (lib/vision-postprocess.ts) ─────────
 * OLCUM-ARACI-08 (2026-09-23): bu fonksiyon eskiden route.ts:1788-1848'in ELLE
 * kopyasıydı ve B9 (2026-07-31) + 9355dec (2026-09-16) dahil YEDİ kez prod'dan
 * sapmıştı (kind/lang/map eksikliği, elle factGround, .slice, empty-guard,
 * enemyAnalysis reality-check'i, fixCallout, .filter). Zincir artık route ile
 * AYNI fonksiyondan geçer: finalizeVisionFeedback (lib/vision-postprocess.ts).
 * Bir halka değişirse eval kendiliğinden aynı zinciri ölçer — ayna sapması
 * yapısal olarak imkânsız. ÖLÇÜM TABANI: taşıma commit'i (B03/1) bayt-aynıydı (944
 * kayıtlı ham örnek × 4 gövde = 3776 koşuda eski ayna ile birebir); B03/2 zincire
 * ajan-adı kilidi, DA tanı-etiketi soyucu, boş-guard, EA kanıtsız-madde düşürme ve
 * cümle-sınırlı kapak (EA 240) ekledi → o commit'ten sonraki cycle'lar eski
 * cycle'larla doğrudan kıyaslanmaz; replay-tr ile ham örnekten yeniden ölçülür.
 *
 * Buradaki TEK eval-özgü parça factGround kurulumudur (route ctx'i elde yok);
 * route/eval factGround paritesi B06'nın (prompt-builder tek kaynak) işidir. */
export function postProcess(s: Scenario, fb: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) {
  const b = s.body;
  const lang = langOf(s);
  const map = typeof b.map === "string" ? (b.map as string) : undefined;
  const agent = typeof b.agent === "string" ? (b.agent as string) : undefined;

  // factGround: route.ts:894-897 ile AYNI fonksiyon. ctx alanları buildUserPrompt
  // ile aynı sanitize + aynı died-koşulu altında kurulur (buildFactGround yalnız
  // ctx.deathLocation / ctx.deathAngle / ctx.playerRoute okur).
  //
  // B83 DOĞRULAMASI (2026-07-31): 1. dalgada reality-checker'a eklenen YENİ
  // FactGround alanları — killerAgent (katil-tutarlılığı guard'ı, reality-checker.ts:
  // 673-697) ve hasEnemyUtil (düşman-util guard'ı, :854) — burada AYRICA KURULMAZ:
  // buildFactGround onları killerInfo'dan (extractKillerAgent) ve sabit sözleşmeden
  // kendisi türetir, yani her iki yeni guard eval'de ZATEN çalışıyor. Elle kurulan
  // eski nesne B9'da kaldırıldığı için alan-sızması yapısal olarak imkânsız; tip
  // her zaman tam uyumlu ve reality-checker'a yeni alan eklendiğinde eval onu
  // kendiliğinden ölçer. BURAYA ELLE ALAN EKLEME — sapma tam oradan doğar.
  const ctxForFacts: Record<string, unknown> = {};
  if (b.died === true) {
    if (typeof b.deathLocation === "string") ctxForFacts.deathLocation = sanitizePromptInput(b.deathLocation, { max: 50, collapseWhitespace: true });
    if (typeof b.deathAngle === "string") ctxForFacts.deathAngle = sanitizePromptInput(b.deathAngle, { max: 30, collapseWhitespace: true });
    if (typeof b.playerRoute === "string") ctxForFacts.playerRoute = sanitizePromptInput(b.playerRoute, { max: 120, collapseWhitespace: true });
  }
  const factGround = buildFactGround(b as Record<string, unknown>, ctxForFacts);

  return finalizeVisionFeedback(fb, {
    roundHistory: b.roundHistory as Record<string, unknown>[] | undefined,
    factGround,
    lang,
    map,
    agent,
    enemyComp: b.enemyComp as unknown[] | undefined,
    suppliedLoc: typeof b.deathLocation === "string" ? String(b.deathLocation) : "",
  });
}
