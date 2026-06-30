// ── Coach-voice OUTPUT cleaner (shared — council 2026-06-25, Cycle 2 fix #1) ──
// Single-source deterministic last-line defense for coach text. gpt-5-mini still
// leaks English jargon, ability codenames, lowercase agent names and apostrophe
// errors into the TR coach text. This net corrects the output ON THE WIRE — the
// guaranteed safety layer applied by EVERY AI route (vision/report/feedback/
// insight) so the same cleanup runs everywhere. Lang-aware: TR-jargon translation
// + apostrophe-fix run ONLY for tr. WHITELISTED English (ai-policy
// ENGLISH_WHITELIST_RULE — peek/swing/entry/default/util/molly/smoke/flash/op/
// off-angle...) is intentionally LEFT untouched.
//
// Moved verbatim from app/api/ai/vision/route.ts (was lines 21-126) — pure
// refactor, behavior bit-for-bit identical for vision. plainifyAbilities +
// fixTurkishApostrophe are imported from ability-plain-map (both exported there).
import { plainifyAbilities, fixTurkishApostrophe } from "@/lib/ability-plain-map";

const TR_JARGON: [RegExp, string][] = [
  [/\bpredict edilebilir(sin)?\b/gi, "tahmin edilebilirsin"],
  [/\bpredict\b/gi, "tahmin edilebilir"],
  [/\bduel['’]?(le|la|de|da|ler)?\b/gi, "teke tek"],
  // Verb Tarzanca. NOTE: JS \b breaks on Turkish letters (ı/ş…), so use a
  // negative-lookahead boundary. Direction matters: "frag/kill ALDI" = killed
  // → öldür-; "frag VERDİ" = died → öl-.
  [/\b(kill|frag) ald[ıi](?![a-zçğıöşü])/gi, "öldürdü"],
  [/\b(kill|frag) al[ıi]yor(lar|sunuz|sun)?\b/gi, "öldürüyor$1"],
  [/\bfrag verd[ıi](?![a-zçğıöşü])/gi, "öldü"],
  [/\bfrag ver[ıi]yor(lar|sunuz|sun)?\b/gi, "ölüyor$1"],
  // "swing yap-" Tarzanca: bare noun "swing" is WHITELISTED, but verb-ifying it
  // with "yap-" is banned (CLAUDE.md "swing yapıyor"). Rewrite to the approved
  // coach idiom "peek at-" / "geniş açıyla peek". Order: most-specific suffix
  // first (yapıyor* before yap, so the longer match wins). Right boundary is the
  // negative-lookahead (JS \b breaks on ı/ş…), NOT \b — same convention as above.
  [/\bswing yapma(?![a-zçğıöşü])/gi, "geniş açıyla peek atma"],          // olumsuz emir: "yapma"
  [/\bswing yapt[ıi]n(?![a-zçğıöşü])/gi, "geniş açıyla peek attın"],     // geçmiş 2.tekil: "yaptın"
  [/\bswing yapt[ıi](?![a-zçğıöşün])/gi, "geniş açıyla peek attı"],      // geçmiş 3.tekil: "yaptı" (n hariç → "yaptın" üstte)
  [/\bswing yap[ıi]yor(lar|sunuz|sun)?\b/gi, "peek atıyor$1"],           // şimdiki: "yapıyor(sun/lar)"
  [/\bswing yapar(?![a-zçğıöşü])/gi, "peek atar"],                       // geniş zaman: "yapar"
  [/\bswing yap(?![a-zçğıöşü])/gi, "geniş açıyla peek at"],              // emir / kök: "yap"
  // CATCH-ALL backstop (verify): yukarıdaki lookahead'ler "yaparsan/yapabilirsin/
  // yapmadan" gibi nadir ekleri kaçırır. "yap" ve "at" aynı ek-morfolojisini aldığı
  // için $1 (ek) korunarak yeniden eklenir → "yaparsan"→"atarsan", "yapmadan"→
  // "atmadan" doğru çıkar. EN SONDA: spesifik kalıplar metni zaten tüketmişse boşa düşer.
  [/\bswing yap([a-zçğıöşü]*)/gi, "geniş açıyla peek at$1"],
  // teammate + (apostrof?) + TR ek → düzgün AYRI-sözcük TR. Türkçede "takım
  // arkadaşı" iyelik/edat ekini ayrı alır; eki köke yapıştırmak "arkadaşı'le"
  // gibi bozuk çıkarıyordu (empirik S7/S8, council 2026-06-26). Ekli formlar
  // çıplak "teammate"ten ÖNCE gelmeli (uzun eşleşme kazanır).
  [/\bteammate['’]?(le|la|yle|yla|ile)\b/gi, "takım arkadaşı ile"],
  [/\bteammate['’]?(nin|nın|in|ın)\b/gi, "takım arkadaşının"],
  [/\bteammate['’]?(yi|yı|i|ı)\b/gi, "takım arkadaşını"],
  [/\bteammate['’]?(ye|ya|e|a)\b/gi, "takım arkadaşına"],
  [/\bteammate\b/gi, "takım arkadaşı"],            // ai-policy line 99: zorunlu çeviri
  // "ally" sızıntısı (KB-ton audit 2026-06-28: S6/S15/S16 — teammate çevriliyor, ally atlanmış)
  [/\bally['’]?(le|la|yle|yla|ile)\b/gi, "takım arkadaşı ile"],
  [/\bally['’]?(nin|nın|in|ın)\b/gi, "takım arkadaşının"],
  [/\bally['’]?(den|dan)\b/gi, "takım arkadaşından"],
  [/\bally['’]?(yi|yı|i|ı)\b/gi, "takım arkadaşını"],
  [/\bally['’]?(ye|ya|e|a)\b/gi, "takım arkadaşına"],
  [/\ballies\b/gi, "takım arkadaşları"],
  [/\bally\b/gi, "takım arkadaşı"],
  // "cover" jargonu (Cove map-kaydı kaldırıldı; cover'ı isim=siper / fiil=kapat yap — ASLA kelime-içi parça-replace)
  [/\bcover\s+et(?![a-zçğıöşü])/gi, "kapat"],
  [/\bcover\s+etmek\b/gi, "kapatmak"],
  [/\bcover\b/gi, "siper"],
  // "Counter:"/"Karşılık:" etiket-önekini SİL — koç etiket basmaz, direkt söyler
  // (empirik S1, council 2026-06-26). Sadece iki nokta varsa = etiket.
  [/\b(counter|karşılık)\s*:\s*/gi, ""],
  [/\bshift[- ]?walk\b/gi, "sessiz yürü"],
  [/\bdry\b/gi, "utility'siz"],                     // ai-policy line 99: dry→utility'siz

  // ── Post-audit Tarzanca net (council 2026-06-25) ────────────────────────
  // Deterministic last-line defense for jargon the model still leaks in TR
  // output: pre-aim / head+TR-verb / peek-hold "yap-ed-" / "X çekiyor" utility /
  // slang / "cezalandır-". Convention: JS \b breaks on Turkish letters, so use
  // the negative-lookahead boundary (?![a-zçğıöşü]). ORDER MATTERS — specific
  // patterns FIRST, catch-all / head / pre-aim backstops LAST.
  //
  // pre-aim (SYSTEM_PROMPT yasak listesi)
  [/\bhead pre[- ]?aim['’]?l[ae]\s*(vurdu|kesti)/gi, "açıyı önceden tutup kafadan $1"],
  [/\bpre[- ]?aim['’]?l[ae]\s*(vurdu|kesti|aldı)/gi, "açıyı önceden tutup $1"],
  [/\bpre[- ]?aim (ediyordu|çekiyordu)(?![a-zçğıöşü])/gi, "açıyı önceden tutuyordu"],
  [/\bpre[- ]?aim (ediyor|çekiyor|yapıyor)(?![a-zçğıöşü])/gi, "açıyı önceden tutuyor"],
  [/\bpre[- ]?aim (etti|çekti|yaptı)(?![a-zçğıöşü])/gi, "açıyı önceden tuttu"],
  [/\bpre[- ]?aim (eder|çeker|yapar)(?![a-zçğıöşü])/gi, "açıyı önceden tutar"],
  // head + TR fiil (SYSTEM_PROMPT yasak listesi)
  [/\bhead at[ıi]yordu(?![a-zçğıöşü])/gi, "kafadan vuruyordu"],
  [/\bhead at[ıi]yor(lar|sun)?(?![a-zçğıöşü])/gi, "kafadan vuruyor$1"],
  [/\bhead att[ıi]n(?![a-zçğıöşü])/gi, "kafadan vurdun"],
  [/\bhead att[ıi](?![a-zçğıöşün])/gi, "kafadan vurdu"],
  [/\bhead at[ıi]yor(?![a-zçğıöşü])/gi, "kafadan vuruyor"],
  [/\bhead bulu?yor(du)?(?![a-zçğıöşü])/gi, "kafadan vuruyor"],
  [/\bhead buldu(?![a-zçğıöşü])/gi, "kafadan vurdu"],
  [/\bhead aç[ıi]s[ıi]n[ıi] tut([a-zçğıöşü]*)/gi, "açıyı tut$1"],
  // peek / hold "yap-ed-"
  [/\bpeek yap([a-zçğıöşü]*)/gi, "peek at$1"],
  [/\bpeek ediyor(?![a-zçğıöşü])/gi, "peek atıyor"],
  [/\bpeek etti(?![a-zçğıöşü])/gi, "peek attı"],
  // "hold yap-/ed-" → "tut-" (object comes from context — NO "açıyı" prefix, else
  // "açıyı hold ediyor" → "açıyı açıyı tutuyor" duplication).
  [/\bhold yap[ıi]yor(?![a-zçğıöşü])/gi, "tutuyor"],
  [/\bhold yapt[ıi]n(?![a-zçğıöşü])/gi, "tuttun"],
  [/\bhold ediyor(?![a-zçğıöşü])/gi, "tutuyor"],
  [/\bhold (yap|ed)[a-zçğıöşü]*/gi, "tut"],
  // X çekiyor → X atıyor (utility). EXPLICIT conjugations (vowel harmony: çek→at,
  // "çekiyor"→"atıyor" not "atiyor"). Specific suffixes first, bare root last.
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çek[ıi]yor(lar|sun|sunuz)?(?![a-zçğıöşü])/gi, "$1 atıyor$2"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çekti(n|niz)?(?![a-zçğıöşü])/gi, "$1 attı$2"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çekmeden(?![a-zçğıöşü])/gi, "$1 atmadan"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çekme(?![a-zçğıöşü])/gi, "$1 atma"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çekecek(?![a-zçğıöşü])/gi, "$1 atacak"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çeker(?![a-zçğıöşü])/gi, "$1 atar"],
  [/\b(stun|flash|molly|smoke|util|utility)\s*['’]?\s*çek(?![a-zçğıöşü])/gi, "$1 at"],
  [/\bult çek[ıi]yor(?![a-zçğıöşü])/gi, "ult kullanıyor"],
  [/\bult çekti(?![a-zçğıöşü])/gi, "ult kullandı"],
  [/\bult bast[ıi](?![a-zçğıöşü])/gi, "ult kullandı"],
  // slang
  [/\bwide\s+swing\b/gi, "geniş açıyla peek"],
  [/\bop var\b/gi, "operator'la bekliyor"],
  [/\btrip(?!wire)\b/gi, "tuzak"],
  [/\bpick al([ıi]yor|d[ıi]n?|[ıi]r)(?![a-zçğıöşü])/gi, "kill al$1"],
  // cezalandır- (ai-policy NATURAL_COACH_RULE: "cezalandırıyor/cezalandırdı/cezalandıracak" yasak)
  [/\bcezaland[ıi]r[ıi]l[ıi]yorsun(?![a-zçğıöşü])/gi, "aynı açıdan bedavaya öldürülüyorsun"],
  [/\bcezaland[ıi]r[ıi]yor(du|lar)?(?![a-zçğıöşü])/gi, "bedavaya kill alıyor$1"],
  [/\bcezaland[ıi]rd[ıi](?![a-zçğıöşün])/gi, "bedavaya kill aldı"],
  [/\bcezaland[ıi]racak(?![a-zçğıöşü])/gi, "oradan kafadan vuracak"],
  // ── Cycle 2 fix #14 — KB'den sızan çekimleri net'te kapat (council 2026-06-25)
  // KB içeriğinden modele sızabilen ek formlar: cezalandırır (geniş zaman), wide
  // peek, stack yap-, frag verir(sin/siniz). Mevcut spesifik pattern'lerden SONRA
  // (sıra korunur). 'cezalandırır'→'bedavaya öldürür' bağlam-nötr; bare
  // 'stack'/'peek' isimleri whitelist'te, DOKUNULMUYOR.
  [/\bcezaland[ıi]r[ıi]r(lar)?(?![a-zçğıöşü])/gi, "bedavaya öldürür"],   // cezalandır- backstop (geniş zaman)
  [/\bwide[- ]?peek\b/gi, "geniş açıyla peek"],                          // slang: wide peek
  [/\bstack yap([ıi]n|[ıi]n[ıi]z)?(?![a-zçğıöşü])/gi, "hep birlikte yüklenin"], // emir: stack yapın
  [/\bstack yap(?![a-zçğıöşü])/gi, "hep birlikte yüklen"],              // emir/kök: stack yap
  [/\bfrag verirsin(?![a-zçğıöşü])/gi, "ölürsün"],                       // frag verir 2.tekil
  [/\bfrag verirsiniz(?![a-zçğıöşü])/gi, "ölürsünüz"],                   // frag verir 2.çoğul
  [/\bfrag verir(?![ia-zçğıöşü])/gi, "ölür"],                            // frag verir 3.tekil (sin/siniz hariç → üstte)
  // pre-aim İSİM bağlamı (C6 report: "pre-aim ile/ile kesiyor" → fiil-formu "açıyı
  // önceden tutuyor ile" bozuk çıkıyordu). Bare catch-all'dan ÖNCE, ulaç-form ver.
  [/\bhead pre[- ]?aim['’]?(le|la)\b/gi, "önceden kafa hizasına nişan alarak"],
  [/\bpre[- ]?aim['’]?(le|la)\b/gi, "önceden nişan alarak"],
  [/\bpre[- ]?aim\s+ile\b/gi, "önceden nişan alarak"],
  // CATCH-ALL backstops (head/pre-aim) — EN SONDA, spesifikler tüketmediyse devreye girer
  [/\bhead pre[- ]?aim\b/gi, "açıyı önceden tutarak"],
  [/\bpre[- ]?aim\b/gi, "açıyı önceden tutuyor"],

  // ── Cycle 3 net (council 2026-06-26) — empirik eval'de .final'e sızan jargon/yön/halüsinasyon ──
  // Yön (İngilizce → TR). Kombinasyonlar (front-left), apostrof+ek'i YUTARAK
  // (Cycle 3b: "front-right'tan" → "sağ önden", yoksa "sağ ön'tan" bozuğu çıkıyor).
  // Ablatif (-tan/-den) ve lokatif (-ta/-de) formlar ÖNCE, çıplak SONRA.
  [/\bfront[- ]?left['’]?(t[ae]n|d[ae]n)\b/gi, "sol önden"],
  [/\bfront[- ]?left['’]?(t[ae]|d[ae])\b/gi, "sol önde"],
  [/\bfront[- ]?left\b/gi, "sol ön"],
  [/\bfront[- ]?right['’]?(t[ae]n|d[ae]n)\b/gi, "sağ önden"],
  [/\bfront[- ]?right['’]?(t[ae]|d[ae])\b/gi, "sağ önde"],
  [/\bfront[- ]?right\b/gi, "sağ ön"],
  [/\bback[- ]?left['’]?(t[ae]n|d[ae]n)\b/gi, "sol arkadan"],
  [/\bback[- ]?left['’]?(t[ae]|d[ae])\b/gi, "sol arkada"],
  [/\bback[- ]?left\b/gi, "sol arka"],
  [/\bback[- ]?right['’]?(t[ae]n|d[ae]n)\b/gi, "sağ arkadan"],
  [/\bback[- ]?right['’]?(t[ae]|d[ae])\b/gi, "sağ arkada"],
  [/\bback[- ]?right\b/gi, "sağ arka"],
  [/\bleft\s+(açı)/gi, "sol $1"],          // "left açıda" → "sol açıda"
  [/\bright\s+(açı)/gi, "sağ $1"],
  [/\bfront\s+(açı)/gi, "ön $1"],          // "front açısıyla" → "ön açısıyla"
  [/\bback\s+(açı)/gi, "arka $1"],
  [/\bfront['’](tan|ten)\b/gi, "önden"],    // "front'tan" → "önden"
  // Jargon kısaltma / tarzanca-fiil / halüsinasyon terim / İngilizce sızıntı
  // "one-tap" → sade Türkçe. ESKİ "tek atışta kafadan" YASAK "kafadan"ı üretiyordu +
  // ek-almış "one-tap'ine"yi "kafadan'ine" gibi BOZUYORDU (audit 2026-06-30). Ek-farkında,
  // kafadan'sız. Sıra önemli: ekli formlar bare'den ÖNCE.
  [/\bone[- ]?tap['’]?(ine|ına|nesine)\b/gi, "tek atışta öldürmesine"],   // yönelme: "one-tap'ine karşı"
  [/\bone[- ]?tap['’]?(ini|ını|i|ı)\b/gi, "tek atışta öldürmesini"],      // belirtme
  [/\bone[- ]?tap\b/gi, "tek atışta öldürme"],                            // çıplak (kafadan YOK)
  [/\bone[- ]?on[- ]?one\b/gi, "teke tek"],                // S10: "one-on-one" → "teke tek"
  // Çıplak İngilizce sızıntısı (audit 2026-06-30 S2/S13/S14): info/roster whitelist'te DEĞİL.
  [/\binfo\b/gi, "bilgi"],
  [/\broster['’]?(ın[ıi]|in[ıi])\b/gi, "kadrosunu"],
  [/\broster['’]?(ınd[ae]|ind[ae]|d[ae]|t[ae])\b/gi, "kadrosunda"],
  [/\broster['’]?(ın|in)\b/gi, "kadrosunun"],
  [/\broster['’]?([ıi])\b/gi, "kadrosunu"],
  [/\broster\b/gi, "kadro"],
  [/\bTP['’]?(yi|yı|si|ler|ini)?\b/g, "teleport"],         // S9: Chamber "TP" kısaltması (case-sensitive)
  // crosshair → nişangâh. ESKİ tek-satır ham-ek yapıştırıyordu: "crosshair'i"→"nişangâhi"
  // (YANLIŞ — â art-ünlü, ek "ı" olmalı), "crosshair'in"→"nişangâhin" (audit 2026-06-30,
  // S8/S11/S14 gerçek gramer hatası). 'nişangâh' TR_TERMS'te olmadığı için fixTurkishApostrophe
  // de kurtaramıyor. Vokal-uyumlu açık eşleme (â → ı/a/ta), ÖNCE-spesifik sıra:
  [/\bcrosshair['’]?(ın[ıi]|in[ıi])\b/gi, "nişangâhını"],
  [/\bcrosshair['’]?(ın|in)\b/gi, "nişangâhın"],
  [/\bcrosshair['’]?(d[ae]|t[ae])\b/gi, "nişangâhta"],
  [/\bcrosshair['’]?(y[ae]|[ae])\b/gi, "nişangâha"],
  [/\bcrosshair['’]?([ıi])\b/gi, "nişangâhı"],
  [/\bcrosshair\b/gi, "nişangâh"],
  [/\bzonel[ae]y([ıi]p|arak)\b/gi, "alanı kapatıp"],       // S6: "zonelayıp" → "alanı kapatıp"
  [/\bzonel[ae][a-zçğıöşü]*/gi, "alanı kapat"],            // zone+TR fiil backstop
  [/\btelemetriyle\b/gi, "bilgisiyle"],                    // S10: halüsinasyon "telemetri"
  [/\btelemetr[a-zçğıöşü]*/gi, "bilgi"],                   // S8: "telemetreli" dahil tüm "telemetr-" stem (bitişik "bilgi bilgi" → dedup collapse)
  // NOT: JS \b Türkçe harfte (ı/ö/ş…) kırıldığı için ek-sonunda \b kullanma →
  // "sightline'ını" yanlış kesilip "görüş hattıı" üretiyordu. \S* ile ek+apostrofu
  // tümden yut (sightline İngilizce, boşluğa kadar güvenle tüketilir).
  // S9 (KB-ton audit 2026-06-28): bare \S* ek'i TÜMDEN yutup "görüş hattı direkt
  // girdin" (devrik, hâl-eki düşmüş) üretiyordu. Ek-koruyan formlar ÖNCE:
  [/\bsightline['’]?(ın[ae]|in[ae])\b/gi, "görüş hattına"],
  [/\bsightline['’]?(ını|ini)\b/gi, "görüş hattını"],
  [/\bsightline['’]?(ında|inde)\b/gi, "görüş hattında"],
  [/\bsightline['’]?(ından|inden)\b/gi, "görüş hattından"],
  [/\bsightline\S*/gi, "görüş hattı"],                     // bare backstop: "sightline" → "görüş hattı"
  [/\bwall(?![a-zçğıöşü])\S*/gi, "duvar"],                 // S9: Viper/Sage "wall('ı)" → "duvar"
  // C5: minor İngilizce sızıntılar ("contest et-" — vokal-uyumlu açık formlar)
  [/\bcontest\s+etmeden\b/gi, "zorlamadan"],
  [/\bcontest\s+etme\b/gi, "zorlama"],
  [/\bcontest\s+ediyor\b/gi, "zorluyor"],
  [/\bcontest\s+et\b/gi, "zorla"],
  [/\bsingle[- ]?entry\b/gi, "tek başına giriş"],          // "single-entry" → "tek başına giriş"
  // ── HEDGE/TAHMİN DİLİ NET (2026-06-26, son-savunma) — koç KESİN konuşur.
  //    Prompt+BANNED_PHRASES birincil; bu net olasılık modalını + evidential
  //    -miş'i + tahmin adverb'lerini siler/kesin'e çevirir. SIRA: önce olasılık
  //    modalı düşer ("vurmuş olabilirsin"→"vurmuş"), sonra -miş→-di ("vurdu").
  //    JS \b Türkçe harfte (ş/ı/ü) kırıldığı için -miş'te lookbehind/lookahead.
  [/\s+olabilirsiniz(?![a-zçğıöşü])/gi, ""],
  [/\s+olabilirsin(?![a-zçğıöşü])/gi, ""],
  [/\s+olabilirler(?![a-zçğıöşü])/gi, ""],
  [/\s+olabilir(?![a-zçğıöşü])/gi, ""],
  [/(?<![a-zçğıöşü])kesilmiş(?![a-zçğıöşü])/gi, "kesildin"],
  [/(?<![a-zçğıöşü])kesmiş(?![a-zçğıöşü])/gi, "kesti"],
  [/(?<![a-zçğıöşü])vurulmuş(?![a-zçğıöşü])/gi, "vuruldun"],
  [/(?<![a-zçğıöşü])vurmuş(?![a-zçğıöşü])/gi, "vurdu"],
  [/(?<![a-zçğıöşü])almış(?![a-zçğıöşü])/gi, "aldı"],
  [/(?<![a-zçğıöşü])yapmış(?![a-zçğıöşü])/gi, "yaptı"],
  [/(?<![a-zçğıöşü])atmış(?![a-zçğıöşü])/gi, "attı"],
  [/(?<![a-zçğıöşü])girmiş(?![a-zçğıöşü])/gi, "girdi"],
  [/(?<![a-zçğıöşü])gelmiş(?![a-zçğıöşü])/gi, "geldi"],
  [/(?<![a-zçğıöşü])tutmuş(?![a-zçğıöşü])/gi, "tuttu"],
  [/(?<![a-zçğıöşü])öldürmüş(?![a-zçğıöşü])/gi, "öldürdü"],
  [/(?<![a-zçğıöşü])basmış(?![a-zçğıöşü])/gi, "bastı"],
  [/(?<![a-zçğıöşü])kullanmış(?![a-zçğıöşü])/gi, "kullandı"],
  [/(?<![a-zçğıöşü])bırakmış(?![a-zçğıöşü])/gi, "bıraktı"],
  [/(?<![a-zçğıöşü])koymuş(?![a-zçğıöşü])/gi, "koydu"],
  [/(?<![a-zçğıöşü])dizmiş(?![a-zçğıöşü])/gi, "dizdi"],
  [/(?<![a-zçğıöşü])yakalamış(?![a-zçğıöşü])/gi, "yakaladı"],
  [/(?<![a-zçğıöşü])bekliyormuş(?![a-zçğıöşü])/gi, "bekliyordu"],
  [/(?<![a-zçğıöşü])tutuyormuş(?![a-zçğıöşü])/gi, "tutuyordu"],
  [/(?<![a-zçğıöşü])geliyormuş(?![a-zçğıöşü])/gi, "geliyordu"],
  [/(?<![a-zçğıöşü])yapıyormuş(?![a-zçğıöşü])/gi, "yapıyordu"],
  [/\bmuhtemelen\s+/gi, ""],
  [/\bbüyük ihtimalle\s+/gi, ""],
  [/\bgaliba\s+/gi, ""],
  [/\bsanırım\s+/gi, ""],
  [/\bbelki\s+/gi, ""],
  [/\bgörünüyor ki\s+/gi, ""],
  [/\s+gibi görünüyor(?![a-zçğıöşü])/gi, ""],
  // C6 report-surfaced sızıntılar
  [/\btrade\s+buddy\b/gi, "trade arkadaşı"],               // "trade buddy" → "trade arkadaşı"
  [/\bcezaland[ıi]r[ıi]ls[ıi]n\b/gi, "bedavaya ölsün"],    // S6: pasif "cezalandırılsın"
  [/\bcezaland[ıi]r[ıi]l[ıi]r\b/gi, "bedavaya ölür"],      // pasif "cezalandırılır"
  // bare "wide" (jargon) → "geniş" — EN SONDA, "wide swing/peek" spesifikleri zaten çevirdiyse boşa düşer
  [/\bwide\b/gi, "geniş"],                                 // "wide açıdan" → "geniş açıdan"
  // Türkçe yön + apostrof-ek backstop (Cycle 4): yön combo dönüşümü dative/acc
  // ekini ("front-right'e" → bare → "sağ ön'e") bırakabiliyor; apostrofu kaldırıp
  // birleştir ("ön'e"→"öne", "arka'dan"→"arkadan"). NOT: JS \b "ö"de kırıldığı için
  // lookbehind/lookahead sınırı kullan (\b ASLA çalışmaz — bu yüzden ilk denemede
  // "sağ ön'e" düzelmedi). EN SONDA çalışır.
  [/(?<![a-zçğıöşü])(ön|arka|sağ|sol)['’]([a-zçğıöşü]+)/gi, "$1$2"],
  // ── KILL-EUFEMİZM NET (2026-06-26, softi canlı-test) — ölümü DÜZ söyle, argo/
  //    yumuşatma YOK. "seni kafadan aldı/temizledi/kesti/götürdü/vurdu" → "kafadan
  //    vurup öldürdü"; yön+euph → "[yön] vurup öldürdü"; bare euph → "öldürdü".
  //    NESNE "seni" ŞART → "açıyı/görüş hattını/koridoru/alanı kesti" DOKUNULMAZ
  //    (lookbehind). Clause-sınırı (.;—!?\n) ile aynı cümlede tutulur. Evidential
  //    (-miş→-di) net'inden SONRA çalışır ("kafadan kesmiş"→"kesti"→"vurup öldürdü").
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?)kafadan (?:vurup öldürdü|vurdu|aldı|aldılar|temizledi|kesti|götürdü|biçti|düşürdü|indirdi|devirdi)(?![a-zçğıöşü])/gi, "$1kafadan vurup öldürdü"],
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?(?<![a-zçğıöşü])(?:arkadan|yandan|önden|uzaktan|yakından|sağdan|soldan|geriden)\s+)(?:aldı|aldılar|kesti|götürdü|temizledi|vurdu|biçti|düşürdü|indirdi|devirdi)(?![a-zçğıöşü])/gi, "$1vurup öldürdü"],
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,40}?)(?<!açıyı )(?<!açını )(?<!görüş )(?<!hattını )(?<!koridoru )(?<!alanı )(?<!bölgeyi )(?<!siteyi )(?<!trade )(?<!bilgi )(?<!round )(?<!kontrol )(?<!kontrolü )(?:kesti|kestiler|götürdü|götürdüler|biçti|devirdi)(?![a-zçğıöşü])/gi, "$1öldürdü"],
  [/(?<![a-zçğıöşü])seni ald[ıi](?![a-zçğıöşü])/gi, "seni öldürdü"],
  // varyant eufemizmler (canlı-test 2026-06-26): "öde-"(made pay), causative
  // "kestir-", "-ip öldürdü", potansiyel "kafadan al-". Hepsi düz öldür-/vur-.
  [/(seni[^.;:—!?\n]{0,45}?)öde(di|cek)(?![a-zçğıöşü])/gi, "$1öldür$2"],
  [/(seni[^.;:—!?\n]{0,45}?)öd(üyor|etiyor)(?![a-zçğıöşü])/gi, "$1öldürüyor"],
  [/(seni[^.;:—!?\n]{0,45}?)öde(r|tir)(?![a-zçğıöşü])/gi, "$1öldürür"],
  [/(seni[^.;:—!?\n]{0,45}?)kestir(di|iyor|ir)(?![a-zçğıöşü])/gi, "$1öldürdü"],
  [/(?<![a-zçğıöşü])(?:kes|al)(?:ip|erek|arak)\s+öldür/gi, "vurup öldür"],
  [/(?<![a-zçğıöşü])kafadan al(acak|abilir|abilece[kğ]i?)(?![a-zçğıöşü])/gi, "kafadan vur$1"],
  [/(?<![a-zçğıöşü])kafadan alır(?![a-zçğıöşü])/gi, "kafadan vurur"],
  [/(?<![a-zçğıöşü])kafadan alıyor(?![a-zçğıöşü])/gi, "kafadan vuruyor"],
  // ── KB-ton audit (2026-06-28) deterministik temizlikler ──
  // 'mollywood...' gpt halüsinasyon-birleşiği (S6) → molly; util-uydurma birleşik parçala
  [/\bmollywood[a-zçğıöşü]*/gi, "molly"],
  [/\bmolly\+[a-zçğıöşü]+/gi, "molly"],
  // calque + yazım (S15): "vücut avantajı" (body advantage) → "peek avantajı"; "menzaj" → "menzil"
  [/\bvücut avantaj(ı(?:n[ıi]|na|nda|ndan)?)?/gi, "peek avantaj$1"],
  [/(?<![a-zçğıöşü])menzaj(ın[ıi]|[ıi])?(?![a-zçğıöşü])/gi, "menzil$1"],
  // Deadlock GravNet düz-terim (S16 "netle ani tutuş" anlamsız) → "ağ"
  [/(?<![a-zçğıöşü])netle(?![a-zçğıöşü])/gi, "ağla"],
  // "utility'siz ... utility'siz" çift-tekrar (S9): apostrof-normalize sonra dedup
  [/(utility['’]?siz)(,?\s+\1)+/gi, "utility'siz"],
  // slash-liste: util/callout token'ları arasında '/' → ' ya da ' (S8/S16/S19; '+' liste de)
  [/(?<=[a-zçğıöşü])\/(?=[a-zçğıöşü])/gi, " ya da "],
  [/\b(bot|tuzak|molly|smoke|flash|duvar|tel|kamera|net|ağ)\s*\+\s*(bot|tuzak|molly|smoke|flash|duvar|tel|kamera|net|ağ)\b/gi, "$1 ve $2"],
  // em-dash boşluk normalize (S2 "yüklenme—Showers")
  [/\s*—\s*/g, " — "],
];

const CLEAN_AGENT_NAMES = ["Jett","Raze","Phoenix","Reyna","Yoru","Neon","Iso","Waylay","Sage","Killjoy","Cypher","Chamber","Deadlock","Vyse","Omen","Brimstone","Viper","Astra","Harbor","Clove","Sova","Breach","Skye","Fade","Gekko","Tejo","Veto"];

/**
 * Deterministic coach-voice cleaner. string → string.
 * - plainifyAbilities: ability codenames → plain Silver term (both langs)
 * - agent-name casing fix (phoenix → Phoenix, both langs)
 * - TR only: TR_JARGON tarzanca→koç-Türkçesi + apostrophe fix
 * Never invents text — only rewrites banned patterns with synonyms.
 */
export function cleanCoachText(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  let t = plainifyAbilities(text, lang);             // ability codenames → plain (both langs)
  for (const a of CLEAN_AGENT_NAMES) {               // phoenix → Phoenix (both langs)
    t = t.replace(new RegExp("\\b" + a + "\\b", "gi"), a);
  }
  if (lang === "tr") {
    for (const [re, rep] of TR_JARGON) t = t.replace(re, rep);
    t = fixTurkishApostrophe(t);                     // duvar'i → duvarı (TR plain terms)
  }
  // Cycle 3b: collapse an accidental adjacent duplicate of the SAME long word
  // ("utility'siz utility'siz tutma" → "utility'siz tutma"). ≥5 chars only, so
  // legitimate short reduplication ("tek tek", "yan yan") is untouched.
  t = t.replace(/\b([^\s]{5,})\s+\1\b/giu, "$1");
  // Strip a dangling clause separator left when the model started a 2nd clause
  // then stopped ("...aynı açıyı tutuyor;" → "...aynı açıyı tutuyor.").
  t = t.replace(/\s*;\s*$/, ".").replace(/\s+([.,!?])/g, "$1");
  return t.replace(/\s{2,}/g, " ").trim();
}

/**
 * Word-safe length clamp (Cycle 3b). The vision route caps each field at a byte
 * length for the overlay; a raw String.slice can cut mid-word ("...trade fırsatı
 * y"). This slices to max, then backs up to the last word boundary (only if that
 * keeps ≥60% of the budget, so a single very long word still gets cut) and trims
 * a trailing separator. Never adds an ellipsis (coach text stays clean).
 */
export function clampWords(s: string, max: number): string {
  if (!s || s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const out = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return out.replace(/[\s,;:–-]+$/, "").trim();
}

/**
 * Recursive variant for nested objects (insight output). Walks the structure,
 * runs cleanCoachText on every string leaf, and PRESERVES shape exactly (key
 * names, array order, object structure). skipKeys are returned untouched so
 * enum/label fields (confidence/category/frequency/matchIndex/title) are never
 * mangled. Read-only on shape — only string contents change.
 */
export function cleanCoachTextDeep(
  obj: unknown,
  lang: "tr" | "en",
  skipKeys: Set<string> = new Set(["confidence", "category", "frequency", "matchIndex", "title"]),
): unknown {
  if (typeof obj === "string") return cleanCoachText(obj, lang);
  if (Array.isArray(obj)) return obj.map((v) => cleanCoachTextDeep(v, lang, skipKeys));
  if (obj && typeof obj === "object") {
    const r: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      r[k] = skipKeys.has(k) ? v : cleanCoachTextDeep(v, lang, skipKeys);
    }
    return r;
  }
  return obj;
}
