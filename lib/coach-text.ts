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
// finalizeCoachText (denetim B82, 2026-07-31) — 4 route'un temizleyici zincirini
// tek yerde toplayan yardımcı için. Döngüsel import YOK (agent-abilities hiçbir
// şey import etmez). reality-checker BİLEREK import EDİLMEDİ: app/page.tsx bir
// "use client" bileşeni ve bu dosyadan trLocative alıyor — 48 KB'lık
// reality-checker'ı statik bağlamak landing bundle'ına girme riski taşır.
// Onun yerine realityCheck halkası çağrı-yerinden ENJEKTE edilir (opts.check).
import { enforceAgentKit } from "@/lib/agent-abilities";
// Sayı sonlu kelimede bulunma eki (TR-KALAN-27): sıfır-import yaprak modül —
// landing bundle politikası (yukarıdaki not) bozulmaz.
import { trNumberLocative } from "@/lib/tr-suffix";
// Komp arketipi slug → sade ad (yaprak modül; client bundle'a güvenle girer).
import { COMP_ARCHETYPE_PLAIN } from "@/lib/comp-archetypes";

// Ajan/silah ad tabloları TR_JARGON'un ÜSTÜNE taşındı (B01, 2026-09-23): TR_JARGON
// artık bu tablolardan türetilen kurallar içeriyor (araç ekli "seni … Vandal'la
// aldı" + ajan-öznesi "X roster'ı … yor → kadrosu"); const TDZ yüzünden tablo
// kuralın ÖNÜNDE tanımlı olmalı. İçerik aynı, yalnız 'Miks' ve 'KAY/O' eklendi:
// TR-KALAN-20 — reality-checker.ts:692 / agent-abilities.ts / knowledge-loader.ts
// tablolarında vardı, burada YOKTU → "miks seni vurdu" küçük harf kalıyordu ve
// enforceSuppliedCallout'un koruma listesine girmiyordu. RegExp "\bKAY/O\b" güvenli
// ("/" RegExp kurucusunda düz karakter).
const CLEAN_AGENT_NAMES = ["Jett","Raze","Phoenix","Reyna","Yoru","Neon","Iso","Waylay","Sage","Killjoy","Cypher","Chamber","Deadlock","Vyse","Omen","Brimstone","Viper","Astra","Harbor","Clove","Miks","Sova","Breach","Skye","Fade","Gekko","KAY/O","Tejo","Veto"];
// Silah adları — ajan adlarıyla aynı tutarlılık disiplini (dil denetimi 2026-07-25):
// canlı çıktıda "vandal/Vandal", "sheriff/Sheriff", "operator/operatör" karışıyordu.
const CLEAN_WEAPON_NAMES = ["Vandal","Phantom","Operator","Sheriff","Guardian","Spectre","Judge","Odin","Ares","Bulldog","Marshal","Outlaw","Stinger","Ghost","Classic","Shorty","Frenzy","Bucky"];
const escapeReCt = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const AGENT_ALT_CT = [...CLEAN_AGENT_NAMES].sort((a, b) => b.length - a.length).map(escapeReCt).join("|");
const WEAPON_ALT_CT = [...CLEAN_WEAPON_NAMES].sort((a, b) => b.length - a.length).map(escapeReCt).join("|");

const TR_JARGON: [RegExp, string][] = [
  [/\bpredict edilebilir(sin)?\b/gi, "tahmin edilebilirsin"],
  [/\bpredict\b/gi, "tahmin edilebilir"],
  [/\bduel['’]?(le|la|de|da|ler)?\b/gi, "teke tek"],
  // Verb Tarzanca. NOTE: JS \b breaks on Turkish letters (ı/ş…), so use a
  // negative-lookahead boundary. Direction matters: "frag/kill ALDI" = killed
  // → öldür-; "frag VERDİ" = died → öl-.
  [/\b(kill|frag) ald[ıi](?![a-zçğıöşü])/gi, "öldürdü"],
  // 🔴 GRUP-NUMARASI BUG'I FIX (dil denetimi 2026-07-25): (kill|frag) YAKALAMA grubuydu,
  // yani $1 = "kill" → "kill alıyor" çıktısı "öldürüyorkill" oluyordu (yakalanan kelime
  // geri yapışıyordu). Niyet açıkça kişi ekiydi. Yakalamayan gruba çevrildi → $1 artık
  // doğru ek. "alıyordu" biçimi de eklendi (eskiden hiç yakalanmıyordu).
  [/\b(?:kill|frag) al[ıi]yor(du|lar|sunuz|sun)?\b/gi, "öldürüyor$1"],
  // 🔴 İÇ ETİKET SIZINTISI (2026-07-25): prompt'taki analiz notlarının başlıkları
  // ("Position pattern", "Death zone pattern", "Pattern:") modelin çıktısına birebir
  // sızıyordu — 31 örneğin 15'inde görüldü. Bunlar İÇ NOT; oyuncu görmemeli.
  // Prompt'ta da yasaklandı ama deterministik süzgeç savunma katmanı: etiketi (varsa
  // parantezli niteleyicisiyle ve ardındaki iki nokta/tire ile) söker, cümlenin geri
  // kalanını KORUR. Cümle başındaysa kalan ilk harf büyütülür.
  // Etiket + (varsa) parantezli niteleyici + ardından gelen bağlaç/edat birlikte sökülür;
  // yoksa "Position pattern (GÜÇLÜ) nedeniyle X" → "nedeniyle X" gibi öksüz bir bağlaç
  // cümle başında kalıyordu.
  [/\b(?:position pattern|death zone pattern|ölüm bölgesi (?:deseni|pattern'i))\s*(?:\([^)]*\))?\s*(?:ve\s+(?:death zone pattern|position pattern)\s*(?:\([^)]*\))?\s*)?[:—-]?\s*(?:nedeniyle|sebebiyle|raporunda belirtildiği gibi|olduğu için|göz önüne alarak)?[,\s]*/gi, ""],
  [/(^|[.!?]\s+)pattern\s*[:—-]\s*/gi, "$1"],
  // Sökme sonrası cümle başında kalan öksüz bağlaç ("ve ", "ile ") temizliği.
  [/(^|[.!?]\s+)(?:ve|ile)\s+(?=[a-zçğıöşüA-ZÇĞİÖŞÜ])/g, "$1"],
  // "kill al-" ailesi (dil denetimi 2026-07-25): ai-policy.ts:59 BANNED_PHRASES'te
  // TARZANCA olarak yasaklı ("kill aldı" → "öldürdü") ama YALNIZ tek çekimi listede
  // olduğu için diğer çekimler süzülmüyordu; ayrıca aktif KB (retake-playbook.md) ve
  // temizleyicinin kendi cezalandır-kuralı bu ifadeyi ÜRETİYORDU. Kaynaklar
  // düzeltildi + burada deterministik ağ kuruldu (kaynak ne olursa olsun yakalar).
  [/\bkill ald[ıi](?![a-zçğıöşü])/gi, "öldürdü"],
  [/\bkill al[ıi]yor(du|lar)?(?![a-zçğıöşü])/gi, "öldürüyor$1"],
  [/\bkill al[ıi]r(lar|sın|sınız)?(?![a-zçğıöşü])/gi, "öldürür$1"],
  [/\bkill alma(sın|dan|ya)?(?![a-zçğıöşü])/gi, "öldürme$1"],
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
  // 🔴 ÖZ-ÇELİŞKİ FIX (dil denetimi 2026-07-25): bu iki kural "cezalandır-"ı
  // "bedavaya kill alıyor/aldı" diye düzeltiyordu — oysa "kill aldı" ai-policy.ts:59
  // BANNED_PHRASES listesinde TARZANCA olarak yasaklı ("kill aldı" → "öldürdü").
  // Yani TEMİZLEYİCİNİN KENDİSİ yasak ifadeyi ÜRETİYORDU. Canlı eval'de 2 senaryoda
  // "kill aldı" çıktı. Düz Türkçeye çevrildi (alttaki geniş-zaman kuralı zaten
  // "bedavaya öldürür" diyordu — tutarlılık da sağlandı).
  [/\bcezaland[ıi]r[ıi]yor(du|lar)?(?![a-zçğıöşü])/gi, "bedavaya öldürüyor$1"],
  [/\bcezaland[ıi]rd[ıi](?![a-zçğıöşün])/gi, "bedavaya öldürdü"],
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
  // ÜNLÜ-UYUMLU EK (dil denetimi 2026-07-25): "front-right'ı" gibi formlarda yukarıdaki
  // kurallar yalnız yön kelimesini çevirip eki HAM bırakıyordu → ekranda "sağ önı"
  // (ünlü uyumu YANLIŞ; doğrusu "sağ önü"). "ön" ince-yuvarlak ünlüyle biter.
  // ⚠ Sıra ÖNEMLİ: uzun ekler (dan/da) önce, yoksa kısa kural onları parçalar.
  // ⚠ \b KULLANILMAZ — "ı" ASCII \w değil (bu dosyanın 191. satırındaki aynı tuzak).
  [/(sağ|sol)\s+ön['’]?dan(?![a-zçğıöşü])/gi, "$1 önden"],
  [/(sağ|sol)\s+ön['’]?da(?![a-zçğıöşü])/gi, "$1 önde"],
  [/(sağ|sol)\s+ön['’]?ı(?![a-zçğıöşü])/gi, "$1 önü"],
  [/(sağ|sol)\s+ön['’]?a(?![a-zçğıöşü])/gi, "$1 öne"],
  // ÇIPLAK İNGİLİZCE YÖN BACKSTOP: yukarıdaki kurallar yalnız bilinen kalıpları
  // (yön+açı, yön+ek) yakalıyordu; "front hattı", "back tarafı" gibi serbest
  // tamlamalar sızıyordu (canlı çıktıda "front hattı kontrol ediyor" görüldü).
  // Türkçe metinde İngilizce yön kelimesi ASLA kalmamalı.
  [/\bfront\s+(?=[a-zçğıöşü])/gi, "ön "],
  [/\bback\s+(?=[a-zçğıöşü])/gi, "arka "],
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
  // 🔴 TÜRKÇE-\b TUZAĞI FIX (B3 kanıtı 2026-09-16) — crosshair (:245-251) ve
  // sightline (:257) için ZATEN belgeli olan tuzağın roster'da unutulmuş hâli.
  // Sondaki \b, JS'te \w=[A-Za-z0-9_] tanımına dayanır; "ı" bu kümede DEĞİL.
  // "roster'ı " eşleşmesi "ı"da biter, ardından gelen boşluk da \w-dışı olduğu
  // için SINIR OLUŞMAZ → kural atlanır, metin çıplak kurala düşer ve ekrana
  // "kadro'ı" (apostroflu, bozuk) çıkar. Gerçek çıktı: cycletr-posters4 skye-i
  // "Jett ve Reyna kadro'ı".
  //
  // ⚠ SINIRI TEK BAŞINA DÜZELTMEK YETMEZ — YENİ SIZINTI AÇAR (ölçüldü):
  // "roster'ından" bugün (yanlışlıkla) 4. kurala düşüp "kadrosunundan" veriyor;
  // sınır düzeltilince o kural da elenir ve metin çıplak kurala düşerek
  // "kadro'ından" üretir — yani kapatılmak istenen apostrof sınıfının ta kendisi.
  // Bu yüzden ayrılma/yönelme/vasıta hâlleri de tabloya alındı. Semantik
  // DEĞİŞMEDİ: mevcut dört kuralın İYELİK okuması ("kadrosu-") aynen sürdürüldü.
  // SIRA: en uzun ek ÖNCE.
  [/\broster['’]?(?:ından|inden|undan|ünden)(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosundan"],
  [/\broster['’]?(?:ınd[ae]|ind[ae]|und[ae]|ünd[ae])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosunda"],
  [/\broster['’]?(?:ıyla|iyle|uyla|üyle)(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosuyla"],
  [/\broster['’]?(?:ın[ıi]|in[ıi]|unu|ünü)(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosunu"],
  [/\broster['’]?(?:ın[ae]|in[ae]|un[ae]|ün[ae])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosuna"],
  [/\broster['’]?(?:ın|in|un|ün)(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosunun"],
  [/\broster['’]?(?:d[ae]n|t[ae]n)(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosundan"],
  [/\broster['’]?(?:d[ae]|t[ae])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosunda"],
  [/\broster['’]?(?:yl[ae]|l[ae])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosuyla"],
  // 🔴 EK KANIT (replay-tr, cycletr-posters3/phoenix-h): çıplak -ı eki Türkçede İKİ
  // ANLAMLI — belirtme ("roster'ı kontrol et" → kadrosuNU) ya da 3. tekil İYELİK
  // ("tek bir düşman rosterı var" → kadroSU). Varlık yüklemi (var/yok) geldiğinde
  // okuma DAİMA iyeliktir; alttaki genel kural oraya "kadrosunu var" (bozuk) yazıyordu.
  // Eski hâli de bozuktu ("kadroı var") → bu satır o sınıfı kapatır, regresyon DEĞİL.
  // DAR: yalnız hemen ardından var/yok gelirken ateşlenir; başka hiçbir bağlamı etkilemez.
  [/\broster['’]?[ıiuü](?=\s+(?:var|yok)(?![a-zçğıöşüA-ZÇĞİÖŞÜ]))/gi, "kadrosu"],
  // 🔴 ÖZNE KONUMU (TR-KALAN-23, 2026-09-23): "-ı" iyeliği yalnız var/yok önünde
  // okunuyordu; belirtisiz tamlama ÖZNE olduğunda da iyeliktir. Canlı kanıt
  // (replay skye-i EA0 / cyclefix1 S12): "Jett ve Reyna roster'ı hızla … seni
  // yakalayabilir." → "Jett ve Reyna kadroSUNU …" (iki belirtme, özne kayboldu);
  // "Chamber roster'ı uzun menzile izin vermiyor." → "Chamber kadrosunu … vermiyor".
  // İKİ ŞART BİRLİKTE (dar): (i) hemen önünde ajan adı / rakip / düşman öbeği,
  // (ii) aynı yan-cümlenin SON sözcüğü 3. şahıs çekimli. Emir ("oku", "kontrol et",
  // "bekle") ve 2. şahıs ("okudun") şartı sağlamaz → alttaki kural "kadrosunu" yazar.
  // SAPMA (plan'dan, bilinçli): geniş-zaman/-DIr ekleri (ar/er/ır/ir/ur/ür) YALNIZ
  // ≥5 harfli sözcükte sayılır — 3 harfli emirler "gir/ver/kur/dur" de bu eklerle
  // biter ("Rakip roster'ı görüp gir" → yanlış "kadrosu" olurdu; guard kendi
  // regresyonunu üretmesin). Kaçan geniş-zaman ("atar") eski davranışa düşer.
  [new RegExp(
    String.raw`(?<=(?:${AGENT_ALT_CT}|[Rr]akip|[Dd]üşman)(?:\s+(?:ve|ile)\s+(?:${AGENT_ALT_CT}))*\s)roster['’]?[ıiuü](?![\p{L}])` +
    // BAĞLAÇ KAPISI (B01 inceleme): köprü alt-bağlaç/karşıtlık bağlacı içeremez —
    // ardından YENİ özneli yan-cümle başlar ("Rakip roster'ı takip et çünkü Jett
    // agresif oynuyor." → "oynuyor" Jett'in yüklemi; eskiden "kadrosu takip et").
    // "ve" BİLEREK listede YOK: aynı öznenin iki yüklemini bağlar ("Rakip roster'ı
    // Jett'i korur ve agresif oynar") — dışlamak o doğru okumayı bozardı.
    String.raw`(?=(?:(?!(?<![\p{L}])(?:çünkü|zira|ama|fakat|ancak|lakin|yoksa|oysa|ki)(?![\p{L}]))[^.,;:!?—\n])*?(?<![\p{L}])(?:\p{L}*(?:yor|abilir|ebilir|amaz|emez|dı|di|du|dü|tı|ti|tu|tü)|\p{L}{3,}(?:ar|er|ır|ir|ur|ür))(?:lar|ler)?\s*(?:[.,;:!?—\n]|$))`,
    "giu"), "kadrosu"],
  [/\broster['’]?[ıiuü](?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosunu"],
  [/\broster['’]?(?:y[ae]|[ae])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "kadrosuna"],
  // APOSTROF SIZINTI BACKSTOP: yukarıdaki hiçbir ek eşleşmezse bile çıktıda
  // "kadro'<ek>" ASLA oluşmasın (softi'nin yasakladığı biçim).
  [/\broster['’]/gi, "kadro"],
  [/\broster\b/gi, "kadro"],
  // Eşi (TR-KALAN-05 derinlik savunması, 2026-09-23): veri-etiketi ikamesi
  // (stripFieldLabelTokens) eki artık Türkçeleştiriyor; yine de model TR karşılığı
  // kendisi kesmeyle yazarsa ("kadro'da", "ölüm yeri'nde", "ekonomi'yi") kesme
  // düşer. Bu gövdeler Türkçe sözcük → Türkçe yazımda kesme ALMAZ.
  // YALNIZ ÜNSÜZLE başlayan ekte (korpus ölçümü): gövdelerin hepsi ünlüyle bittiği
  // için ünlüyle başlayan ek kaynaştırma harfi ister — kesmeyi düşürmek "kadro'ı" →
  // "kadroı" üretiyordu (eski boru hattının final artığı, cyclefix1 S12). O biçim
  // eski hâliyle kalır (daha kötüsü üretilmez).
  [/(?<![a-zçğıöşü])(bilgisi|yeri|yönü|kadro|ekonomi)['’](?=[bcçdfgğhjklmnprsştvyz])/gi, "$1"],
  [/\bTP['’]?(yi|yı|si|ler|ini)?\b/g, "teleport"],         // S9: Chamber "TP" kısaltması (case-sensitive)
  // crosshair → nişangâh. ESKİ tek-satır ham-ek yapıştırıyordu: "crosshair'i"→"nişangâhi"
  // (YANLIŞ — â art-ünlü, ek "ı" olmalı), "crosshair'in"→"nişangâhin" (audit 2026-06-30,
  // S8/S11/S14 gerçek gramer hatası). 'nişangâh' TR_TERMS'te olmadığı için fixTurkishApostrophe
  // de kurtaramıyor. Vokal-uyumlu açık eşleme (â → ı/a/ta), ÖNCE-spesifik sıra:
  [/\bcrosshair['’]?(ın[ıi]|in[ıi])\b/gi, "nişangâhını"],
  [/\bcrosshair['’]?(ın|in)\b/gi, "nişangâhın"],
  [/\bcrosshair['’]?(d[ae]|t[ae])\b/gi, "nişangâhta"],
  [/\bcrosshair['’]?(y[ae]|[ae])\b/gi, "nişangâha"],
  // 🔴 TÜRKÇE-\b TUZAĞI FIX (dil denetimi 2026-07-25): sondaki \b, JS'te \w=[A-Za-z0-9_]
  // tanımına dayanır; "ı" bu kümede DEĞİL. "crosshair'ı"da eşleşme "ı"da biter, ardından
  // gelen boşluk da \w-dışı olduğu için SINIR OLUŞMAZ → kural atlanır, metin bir alttaki
  // çıplak kurala düşer ve ekrana "nişangâh'ı" (apostroflu, bozuk) çıkardı. Canlı çıktıda
  // 4 kez görüldü. Aynı tuzak bu dosyanın 197-199. satırlarında `sightline` için zaten
  // belgeliydi ama bu satır düzeltilmemişti. Çözüm: \b yerine Türkçe-duyarlı lookahead.
  [/\bcrosshair['’]?([ıi])(?![a-zçğıöşüA-ZÇĞİÖŞÜ])/gi, "nişangâhı"],
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
  // ── ABARTILI FİİL NETİ (canlı-test #8, 2026-08-03) ──────────────────────
  // softi'nin canlı çıktısı: "A Nest'te bilgi beklemeden İNFİLAK ETMİŞSİN, Jett
  // seni oradan öldürdü." Şikâyet birebir: "yakalanmalı, GİRMİŞSİN gibi SADE
  // olmalı." "infilak et-" ne KB'de ne prompt'ta geçiyor (repo geneli grep: 0
  // eşleşme) — modelin kendi ürettiği edebi abartı, yani prompt katmanıyla
  // kapatılamaz; deterministik net ŞART.
  // HEDEF FİİL "gir-": (a) softi'nin kendi verdiği karşılık, (b) "et-" ile aynı
  // ünlü sınıfında (ince-düz) olduğu için ekler AYNEN taşınır — "dal-" seçilseydi
  // ünlü uyumu bozulup "dalmişsin" çıkardı. Tek istisna ünsüz benzeşmesi:
  // et+ti → gir+di (ilk kural bunu ayrı ele alır).
  // SIRA: spesifik (ett-/etm-/ed-) ÖNCE, catch-all EN SONDA — "etti"nin
  // catch-all'a düşüp "girti" olmasını engeller.
  // Türkçe-\b tuzağı: sol sınır \b DEĞİL, lookbehind (dosya başındaki nota bak);
  // ayrıca /i bayrağı "İ" (U+0130) ile "i"yi EŞLEŞTİRMEZ → [İi] açıkça yazıldı.
  // NOT: cümle başındaki "İnfilak etmişsin" → "girmişsin" (küçük harf) çıkar;
  // TR_JARGON [RegExp,string] tipi olduğu için büyük-harf koruma yapılamıyor.
  // Türkçe fiil-sonlu bir dil olduğundan cümleye fiille başlamak nadir; yasak
  // kelimeyi bırakmaktansa kozmetik küçük harf tercih edildi.
  [/(?<![a-zçğıöşüA-ZÇĞİÖŞÜ])[İi]nfilak\s+ett([ıi][a-zçğıöşü]*)/gi, "gird$1"],   // etti/ettin/ettiğin → girdi/girdin/girdiğin
  [/(?<![a-zçğıöşüA-ZÇĞİÖŞÜ])[İi]nfilak\s+et(m[ei][a-zçğıöşü]*)/gi, "gir$1"],    // etmiş(sin)/etme/etmeden/etmek/etmiyor → gir…
  [/(?<![a-zçğıöşüA-ZÇĞİÖŞÜ])[İi]nfilak\s+ed([ei][a-zçğıöşü]*)/gi, "gir$1"],     // ediyor(sun)/eder(sen)/edeceksin → gir…
  [/(?<![a-zçğıöşüA-ZÇĞİÖŞÜ])[İi]nfilak\s+et([a-zçğıöşü]*)/gi, "gir$1"],         // backstop: "infilak et"/"etsen" → "gir"/"girsen"
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
  // "round'ta/round'tan" ek hatası (canlı-test #7, 2026-07-31): model DB'de "Bu
  // round'ta" üretti — "round" (raund) yumuşak d ile biter → ünsüz benzeşmesi YOK,
  // doğrusu "round'da/round'dan". Yanlış uyum ("round'te/ten") de aynı hedefe
  // düzelir. $1 büyük/küçük harfi korur; Türkçe-\b tuzağına karşı lookahead sınırı.
  [/(?<![a-zçğıöşü])(round)['’]t[ae]n(?![a-zçğıöşü])/gi, "$1'dan"],
  [/(?<![a-zçğıöşü])(round)['’]t[ae](?![a-zçğıöşü])/gi, "$1'da"],
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
  // ── YER-EKLİ "al-" KAÇAĞI (TR-KALAN-06 / B5, 2026-09-23) ──────────────────
  // KANIT: replay phoenix-d DA "Jett seni oradan aldı" süzgeçten SAĞ çıktı. Üstteki
  // yön kuralı KAPALI liste ("oradan"/"A Main'den" yok), bir üstteki yalnız BİTİŞİK
  // "seni aldı". ÇAPA = SÖZCÜK SAYISI: "seni" ile ablatif sözcük arasında EN FAZLA
  // 1 sözcük. Salt ablatif şartı şu MEŞRU cümleleri katlediyordu (doğrulayıcı
  // ölçümü): "Rakip seni yavaşlatıp alanı A Main'den aldı", "Seni öldürdükten
  // sonra Operator'ü senden aldı", "Düşman seni gördükten sonra bilgiyi oradan
  // alıyor" — "seni" orada fiilin nesnesi DEĞİL. "-madan/-meden" ulacı hariç
  // ("seni trade etmeden önce kişi bilgisi aldı" dokunulmaz).
  [/((?<![a-zçğıöşü])seni\s+(?:[A-Za-zÇĞİÖŞÜçğıöşü][\wçğıöşüÇĞİÖŞÜ'’]*\s+)?[A-Za-zÇĞİÖŞÜçğıöşü][\wçğıöşüÇĞİÖŞÜ'’]*['’]?[dt][ae]n(?<!m[ae]d[ae]n)\s+)ald[ıi](?![a-zçğıöşü])/gi, "$1öldürdü"],
  [/((?<![a-zçğıöşü])seni\s+(?:[A-Za-zÇĞİÖŞÜçğıöşü][\wçğıöşüÇĞİÖŞÜ'’]*\s+)?[A-Za-zÇĞİÖŞÜçğıöşü][\wçğıöşüÇĞİÖŞÜ'’]*['’]?[dt][ae]n(?<!m[ae]d[ae]n)\s+)al[ıi]yor(?![a-zçğıöşü])/gi, "$1öldürüyor"],
  // ARAÇ EKİ biçimi (daraltılmış): korpusta bu sınıfın en sık biçimi ablatif değil
  // SİLAH + araç eki ("Jett seni B Site sol açıdan Vandal ile aldı", "Raze seni …
  // Phantom'la aldı"). Aralık ≤45 karakter AMA fiilden HEMEN önceki sözcük tablodaki
  // bir silah + araç eki olmalı — "baskıyla aldı" gibi silahsız biçim BİLİNÇLİ dışarıda.
  [new RegExp(String.raw`((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?(?<![a-zçğıöşü])(?:${WEAPON_ALT_CT})(?:['’]?(?:yla|yle|la|le)|\s+ile)\s+)ald[ıi](?![a-zçğıöşü])`, "gi"), "$1öldürdü"],
  // ── "düş-" YUMUŞATMASI (TR-KALAN-06 / B5) — "A Site'ta düşmüşsün" → "öldün".
  // ÇAPA: fiilden önceki sözcük BULUNMA ekli (-da/-de/-ta/-te) ya da orada/burada/
  // yine/tekrar → "aynı tuzağa düştün" (yönelme) ve 3. şahıs "düştü" dokunulmaz.
  // SOYUT-DURUM KALKANI: "geride/skorda/ekonomide…" ölüm değil durum anlatır.
  // ÇİFT-FİİL KALKANI: aynı CÜMLEDE zaten "öld-" varsa kural ATEŞLENMEZ —
  // koşulsuz ikame ölçülen 41 eşleşmenin 30'unda (%73) aynı cümlede iki "öldün"
  // üretiyordu (tekrar softi'nin bir numaralı şikâyeti). Sınır YALNIZ [.!?\n]
  // (spec TR-KALAN-06 "aynı CÜMLEDE"): ilk sürüm ;/:/— işaretlerini de cümle sonu
  // sayıyordu ve korpusta ateşlenen 18 dönüşümün 16'sı aynı nokta-cümlesinde yine
  // iki ölüm fiili üretiyordu ("…hepsinde öldün; bu round da Mid Link'te öldün").
  // Model "düştün"ü tam bu yapıda tekrardan kaçmak için kullanıyor → dokunulmaz.
  // Bilinen boşluk (kasıtlı): "B'ye sık düştün", "erken düştün".
  [/((?:[A-ZÇĞİÖŞÜa-zçğıöşü][\wçğıöşüÇĞİÖŞÜ'’]*['’]?[dt][ae]|orada|burada|yine|tekrar)\s+)(?<!öld[^.!?\n]{0,160})(?<!(?:geride|önde|arkada|skorda|rankta|sıralamada|ekonomide|dezavantajda|avantajda|tempoda|moralde|zorda)\s)düş(?:tün|müşsün)(?![a-zçğıöşü])(?![^.!?\n]{0,160}öld)/gi, "$1öldün"],
  // "avla-" ailesi (2026-07-24, softi canlı şikayeti "avladı falan diyor"). NESNE
  // "seni" ŞART → yalnız oyuncu-nesnesi olan öldürme-euphemizmi düzleştirilir.
  // KB'nin MEŞRU "düşman dağınık oyuncuları avlar" kavramına (nesne = "seni" değil)
  // DOKUNMAZ. "seni oradan avladı" → "seni oradan öldürdü".
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?)avlad[ıi](?![a-zçğıöşü])/gi, "$1öldürdü"],
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?)avl(?:ıyor|uyor)(?![a-zçğıöşü])/gi, "$1öldürüyor"],
  [/((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,45}?)avlar(?![a-zçğıöşü])/gi, "$1öldürür"],
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
  // BOŞLUKLU/BÜYÜK-HARFLİ FORM (dil denetimi 2026-07-25): eski kural yalnız bitişik-küçük
  // harf formunu yakalıyordu; canlı çıktıda "crossfire/ trade" (boşluklu) ekrana çöp gibi
  // düştü. Artık boşluk toleranslı + büyük harf dahil.
  // İSTİSNA: "A/B split" gibi TEK-HARFLİ site adları terimdir, bozulmamalı — onları
  // dışarıda bırakmak için iki yanda da en az 2 harf şartı (tek harf → dokunma).
  [/(?<=[a-zçğıöşüA-ZÇĞİÖŞÜ]{2})\s*\/\s*(?=[a-zçğıöşüA-ZÇĞİÖŞÜ]{2})/g, " ya da "],
  // '+' birleştirmesi: eski kural KAPALI token listesiyle çalışıyordu; listede olmayan
  // "tuzak+ult", "bilgi+trade" ekrana '+' işaretiyle çıktı. Genel kurala çevrildi.
  [/(?<=[a-zçğıöşü'’])\s*\+\s*(?=[a-zçğıöşü])/gi, " ve "],
  // em-dash boşluk normalize (S2 "yüklenme—Showers")
  [/\s*—\s*/g, " — "],
];

/**
 * 2. ÇOĞUL → 2. TEKİL emir kipi neti (denetim B25, 2026-07-31).
 *
 * ai-policy OUTPUT_FOCUS_RULE_VISION "TEK KİŞİ — 2. TEKİL: sen→siz kayması YASAK
 * ('temizleyin', 'girin', 'kurun', 'edin' YAZMA)" diyor ama bu ihlal için
 * DETERMİNİSTİK net YOKTU — prompt katmanı delinince ihlal doğrudan kullanıcıya
 * ulaşıyordu. (Kök neden ayrıca vision-prompt few-shot'larının çoğul örnekleriydi;
 * onlar da B25'te tekile çevrildi — bu net ikinci savunma hattı.)
 *
 * KAPSAM DAR: yalnız politikanın adıyla saydığı ve few-shot'ların öğrettiği 4
 * yüksek-frekanslı çekim. "edin" BİLEREK YOK — "edin-" (edinmek) fiiliyle
 * çakışır. Türkçe-\b tuzağı: JS \b "ı/ç/ş" harflerinde kırılır → iki yanda da
 * lookbehind/lookahead sınırı (dosya başındaki nota bak).
 */
const TR_PLURAL_IMPERATIVES: [RegExp, string][] = [
  [/(?<![a-zçğıöşü])aç[ıi]l[ıi]n(?![a-zçğıöşü])/gi, "açıl"],
  [/(?<![a-zçğıöşü])girin(?![a-zçğıöşü])/gi, "gir"],
  [/(?<![a-zçğıöşü])kurun(?![a-zçğıöşü])/gi, "kur"],
  [/(?<![a-zçğıöşü])temizleyin(?![a-zçğıöşü])/gi, "temizle"],
];

/** Cümle başındaki büyük harfi koruyarak çoğul emri tekile çevirir. */
function singularizeTrImperatives(text: string): string {
  let t = text;
  for (const [re, rep] of TR_PLURAL_IMPERATIVES) {
    t = t.replace(re, (m) => (/^[A-ZÇĞİÖŞÜ]/.test(m) ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep));
  }
  return t;
}

/**
 * EN HEDGE NETİ (denetim B84, 2026-07-31).
 *
 * TR tarafında hedge 3 katmanla engelleniyordu (BANNED_PHRASES + VERİ SEVİYESİ
 * talimatı + yukarıdaki TR_JARGON hedge bloğu); EN tarafında yalnız şema
 * description'ı vardı, yani "maybe they were watching mid" tarzı tahmin dili
 * EN kullanıcıya ulaşabiliyordu. Koç KESİN konuşur: hedge ibaresi SİLİNİR,
 * cümle korunur ("Maybe you peeked early" → "You peeked early").
 * "likely" BİLEREK yok — "unlikely" yanlış-pozitifi üretirdi.
 */
const EN_HEDGE: [RegExp, string][] = [
  [/\bit (?:seems|looks) (?:like|as if|that)\s+/gi, ""],
  [/\bit (?:seems|looks)\s+/gi, ""],
  [/\b(?:maybe|perhaps|probably|possibly)\s+/gi, ""],
  [/\bi think\s+/gi, ""],
  // 🔴 KALDIRILDI (karşı-denetim, 2026-07-31 gecesi) — buraya İKİ satır daha vardı:
  //     [/\b(?:might|may|could) have been\b/gi, "was"]
  //     [/\b(?:might|may|could) be\b/gi,        "is"]
  // Modal fiili ÖZNEYE BAKMADAN "is"/"was" ile değiştiriyorlardı. Gerçek koşumla
  // ölçüldü — bu ürünün EN SIK kurduğu cümlelerde bozuk İngilizce üretiyordu:
  //     "You might be over-peeking B Main."   → "You is over-peeking B Main."
  //     "They may be rotating."               → "They is rotating."
  //     "Your teammates may have been trading you." → "...teammates was trading you."
  // Özne-yüklem uyumu ("you/they/enemies/teammates") regexle güvenilir kurulamaz;
  // dahası modal→kesinlik dönüşümü bir TAHMİNİ kanıtlanmış olguya çeviriyordu ki
  // bu, uydurmayı önlemeye çalışan katmanın kendi kuralına aykırı.
  // Hedge bastırma bu formlar için PROMPT katmanına bırakıldı (ai-policy).
  // Kalan dört satır özneye dokunmadan SİLME yapar → dilbilgisi güvenli.
];

/**
 * EN hedge ibarelerini siler; hedge düşen HER cümlenin başını yeniden büyütür.
 * (karşı-denetim 2026-07-31: eskiden yalnız metnin EN BAŞINA bakılıyordu; ikinci
 * cümle "Maybe you..." ile başlıyorsa "... . you peeked early" gibi küçük harfle
 * kalıyordu. B97 ile 1-2 cümlelik çıktı teşvik edildiği için bu artık sık.)
 * `t !== text` koşulu korunur: hedge yoksa modelin metnine HİÇ dokunulmaz.
 */
function stripEnHedges(text: string): string {
  let t = text;
  for (const [re, rep] of EN_HEDGE) t = t.replace(re, rep);
  if (t !== text) {
    t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());
  }
  return t;
}

// CLEAN_AGENT_NAMES / CLEAN_WEAPON_NAMES: dosyanın başına (TR_JARGON'un üstüne)
// taşındı — gerekçe orada.

/**
 * Numeric-HP stripper (live-test #5, 2026-07-09). The instantaneous HP OCR
 * sample is unreliable (last-alive-sample can be seconds stale — log showed
 * "HP 100" on a death), so a numeric HP claim in coach text is treated as a
 * fabricated fact. Rewrites "41 HP ile / (41 HP) / 30 canla / HP: 41" into the
 * natural qualitative bucket (aligned with classifyDeath: <50 düşük, 50-80
 * orta, >80 sağlam). Language-scoped: TR patterns never touch EN text and
 * vice versa. Bucket forms rewrite in place; the parenthetical/label forms
 * DELETE, so a string that was ONLY an HP label ("HP: 41") comes back empty —
 * callers that must never show an empty field keep their own fallback.
 */
const HP_BUCKET_TR = (n: number) => (n < 50 ? "düşük canla" : n <= 80 ? "orta canla" : "sağlam canla");
const HP_BUCKET_EN = (n: number) => (n < 50 ? "at low HP" : n <= 80 ? "at half HP" : "at high HP");

export function stripNumericHp(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  // Parenthetical "(41 HP)" / "(41 can)" — pure deletion, both langs' safest form.
  let t = text.replace(/\s*\(\s*\d{1,3}\s*(?:hp|can)\s*\)/gi, "");
  if (lang === "tr") {
    // "41 HP ile direnip" / "30 canla" / "100 HP'yle" / "41 HP'den" → bucket.
    // Suffix group covers attached ("canla") and apostrophe ("HP'yle") forms.
    // can(?!l[ıiuü]): "2 canlı düşman" (alive-count) must NOT match — only HP phrases.
    t = t.replace(
      /(?<![a-zçğıöşü0-9])(\d{1,3})\s*(?:hp(?:['’]?[a-zçğıöşü]{1,6})?|can(?!l[ıiuü])(?:['’]?[a-zçğıöşü]{1,6})?)(?:\s+ile)?(?![0-9a-zçğıöşü])/gi,
      (_m, n) => HP_BUCKET_TR(parseInt(n, 10)),
    );
    // Label form "HP: 41" / "can=30" — deletion.
    t = t.replace(/\b(?:hp|can)\s*[:=]\s*\d{1,3}\b/gi, "");
  } else {
    // "at/with/on 41 hp" → bucket (parseInt — NOT string compare; "41">="100" is a lexicographic trap).
    t = t.replace(/\b(?:at|with|on)\s+(\d{1,3})\s*hp\b/gi, (_m, n) => HP_BUCKET_EN(parseInt(n, 10)));
    // Bare "41 hp" → bucket adjective ("low HP" / "half HP" / "high HP").
    t = t.replace(/(?<![a-z0-9])(\d{1,3})\s*hp\b/gi, (_m, n) => HP_BUCKET_EN(parseInt(n, 10)).replace(/^at /, ""));
    t = t.replace(/\bhp\s*[:=]\s*\d{1,3}\b/gi, "");
  }
  return t;
}

/**
 * CAN/HP iddiası süzgeci (canlı-test #8, softi 2026-07-19: "tam canla çatışırken
 * 'az canla peek attın' geldi"). Ölüm anındaki tek HP örneği çatışma-ÖNCESİ canı
 * kanıtlayamaz → nitel can iddiaları ("az canla", "tam canla", "at low HP"...)
 * TAMAMEN yasak; prompt yasağını delen her form burada deterministik silinir.
 * stripNumericHp'nin ürettiği kova ifadeleri ("düşük canla") de dahil — sayısal
 * form da nihai olarak silinmiş olur. Yalnız İFADE silinir, cümle korunur
 * ("az canla peek attın" → "peek attın").
 */
export function stripHpClaims(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  let t = text;
  if (lang === "tr") {
    // "az canla / çok az canla / düşük canla / tam canla / full canla / yarım
    // canla / düşük HP'yle" — sıfat + can/hp + Türkçe ek kuyruğu.
    // Denetim 2026-07-19: (a) orta|sağlam EKLENDİ — stripNumericHp'nin ≥50 kovası
    // ("orta canla"/"sağlam canla") listede yoktu, sayısaldan türetilen nitel can
    // iddiası çıktıya sızıyordu (TR kova sızıntısı); (b) baştaki \b → lookbehind
    // (JS \b "ç"de kırılır — "çok az canla"da "çok" sarkıyordu, dosya başı tuzak
    // notuyla aynı kök); (c) can(?!avar) — "tam canavar gibi" övgüsü yutulmasın.
    // Denetim dalga-6 (2026-07-19): erimiş|eriyen|eksik EKLENDİ — Clove decay
    // anlatan matchup KB'si bu sıfatları öğretiyor ("erimiş canla girme");
    // model kopyalarsa süzgeçten kaçıyordu.
    t = t.replace(/(?<![a-zçğıöşü])(?:çok\s+)?(?:az|düşük|orta|sağlam|tam|full|yarım|erimiş|eriyen|eksik)\s*(?:can(?!avar)|hp)['’]?[a-zçğıöşü]*/gi, "");
    // "canın azken / canı düşükken / canın azdı" kalıpları. KAPALI ek listesi
    // (denetim 2026-07-19): eski açık kuyruk [a-zçğıöşü]* "azal-" fiil kökünü de
    // yutuyor, koşullu ÖĞÜDÜN koşulunu siliyordu ("canın azalınca save et" →
    // " save et"). Yalnız iddia-ekleri kapalı listede; "az önce" (zaman zarfı,
    // can iddiası değil) lookahead ile dışarıda.
    t = t.replace(/(?<![a-zçğıöşü])can[ıi]n?[ıi]?\s+(?:az(?:ken|d[ıi])?(?!\s*önce)|düşük(?:ken|tü)?|eri(?:yor(?:du)?|di|miş(?:ti|ken)?))(?![a-zçğıöşü])/gi, "");
  } else {
    // "at/with/on low|full|half|high HP/health" + bare "low HP" + "low on health".
    t = t.replace(/\b(?:at|with|on)\s+(?:low|full|half|high)\s+(?:hp|health)\b/gi, "");
    t = t.replace(/\b(?:low|full|half|high)\s+(?:hp|health)\b/gi, "");
    t = t.replace(/\blow\s+on\s+health\b/gi, "");
  }
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// META-DİL SÜZGECİ (canli-test #10 kalite dalgasi, 2026-08-05)
//
// SORUN (S1, log-kanıtlı — 5 round'un 4'ünde): model, olgu-listesinin KAYNAK
// dilini (sistem-içi meta-dil) kullanıcı metnine taşıyor. Canlı çıktıdan birebir:
//   "katil olarak Iso OCR'da kesin."
//   "Bir düşman seni A Tower'da öldürdü; öldüğün yer OCR'da kayıtlı."
//   "katil bilgisi Phoenix olarak kayıtta var."
//   "Phoenix seni B Exit'te yakaladı; katil Phoenix olarak kayıtta var."
// Oyuncu "OCR/kayıt/sistem/veri" kelimelerini ASLA görmemeli — bunlar iç mutfak.
//
// TASARIM — CÜMLE-PARÇASI CERRAHİSİ, silme değil kurtarma:
//   1) Ayraç (;:—) sonrası SAF-META yan-cümle komple atılır, bilgilendirici ana
//      cümle korunur ("...yakaladı; katil Phoenix olarak kayıtta var." → "...yakaladı.").
//   2) Öznesi olgu-referansı, yüklemi meta olan TÜM cümle atılır ("öldüğün yer
//      OCR'da kayıtlı." → "") — bu cümle sınıfında koçluk bilgisi SIFIR.
//   3) "X olarak kayıtta/kesin/tespit edildi" kuyrukları sökülür, olgu KALIR
//      ("katil bilgisi Phoenix olarak kayıtta var." → "Katil Phoenix.").
//   4) Çıplak "OCR" token'ı EN SON backstop olarak silinir (koç metninde meşru
//      kullanımı YOKTUR — repo genelinde tek meşru bağlam iç loglar).
// MEŞRU KORUMA: desenler DAR — yalnız "kayıtta/kayıtlı/kayıtlarda" ekli biçimler
// ("kayıp/kayarak/kaydırma"ya DOKUNMAZ); "bilgi" çıplak hâliyle serbest (koçluk
// dili: "bilgi almadan girme"), yalnız "katil bilgisi ... olarak" kalıbı hedef.
// "tespit et-" emir kipi (meşru: "Drone'la tespit et") KORUNUR — yalnız edilgen
// geçmiş "tespit edildi" (sistem sesi) hedef.
// Türkçe-\b tuzağı: JS \b, ı/ç/ş... harflerinde kırılır → tüm sınırlar
// (?<![a-zçğıöşü]) / (?![a-zçğıöşü]) (dosyadaki yerleşik konvansiyon, satır 27).
// SAHTE ÇIKTI YOK: hiçbir metin üretilmez; yalnız meta parça silinir/sadeleşir.
// ─────────────────────────────────────────────────────────────────────────────

/** Ayraç-sonrası meta yan-cümle: içinde sistem-içi işaret geçen ;/:/— parçası.
 *  'raporlan-/rapor edil-/rapora göre' ailesi eklendi (canli-test #11, 2026-08-05):
 *  canlı sızıntı "Katil Jett olarak raporlanmış" iki katmanı da atlamıştı. Kalıp
 *  DAR: yalnız 'raporlan' gövdesi + edilgen 'rapor edil-' + 'rapora göre' —
 *  ürün terimi "maç raporu/raporunda/rapor oluştur" EŞLEŞMEZ (l/a-göre şartı). */
const TR_META_CLAUSE_RE = new RegExp(
  String.raw`\s*[;:—]\s*[^.;:!?\n—]*(?<![a-zçğıöşü])(?:ocr|kayıt(?:ta|lı|larda)|kayda\s+geçti|sistemde|tespit\s+edildi|veri(?:de|lerde)|telemetri|raporlan|rapor\s+edil|rapor(?:lar)?a\s+göre)[^.;:!?\n—]*`,
  "giu",
);
/** Saf-meta cümle: öznesi ölüm-yeri/konum, yüklemi kayıt/OCR — bilgi değeri sıfır. */
const TR_META_SENTENCE_RE =
  /(^|[.!?]\s+)(?:öl(?:üm|düğün)\s+yer|ölüm\s+konum|konum)[a-zçğıöşü]*['’]?[a-zçğıöşü]*[^.!?\n]*(?:ocr|kayıt|sistemde|veride|tespit|raporlan)[^.!?\n]*[.!?]?/giu;
/** "X olarak <meta>" kuyruğu — olgu (X) korunur, meta kuyruk düşer.
 *  'raporlan-/rapor edil-' eklendi (canli-test #11, 2026-08-05): "Katil Jett
 *  olarak raporlanmış" → "Katil Jett". Açık ek kuyruğu GÜVENLİ — "olarak
 *  raporlan"/"olarak rapor edil" öneki tek başına meta bağlam garantisi. */
/*  B4 GENİŞLETMESİ (TR-KALAN-04, 2026-09-23 — TR pipeline denetimi 39 gerçek çağrı):
 *  (1) fiil listesi eksikti: "öldüren ajan Yoru olarak kaydedildi" (r2-c),
 *      "öldüren olarak doğrulanmış düşman Jett" (omen-b) süzülmeden gitti.
 *      Yeni fiiller "olarak" ÖNEKİNE bağlı → tejo.md:26 "doğrulanmış düşman"
 *      gibi meşru kullanım ETKİLENMEZ.
 *  (2) süzgecin kendi regresyonu: "Katil Jett olarak kayıtlarda görünüyor"
 *      yarım sökülüp "Katil Jett görünüyor" kalıyordu (omen-c, phoenix-i). */
const TR_OLARAK_META_RE =
  /\s+olarak\s+(?:kayıt(?:ta|larda)(?:\s+(?:var|kayıtlı|görünüyor|geçiyor|mevcut|duruyor))?|kayıtlı|kayda geçti|kaydedil(?:di|miş)|sistemde(?:\s+(?:var|görünüyor|kayıtlı|mevcut))?|ocr['’]?d[ae]n?(?:\s+(?:kesin|kayıtlı|var|doğrulandı))?|tespit edildi|doğrulan(?:dı|mış|an)|teyit edil(?:di|miş)|onaylan(?:dı|mış)|belirlen(?:di|miş)|işaretlen(?:di|miş)|raporlan[a-zçğıöşü]*|rapor\s+edil[a-zçğıöşü]*|kesin(?:leşti)?|var|net)(?![a-zçğıöşü])/giu;
/** "OCR'da kesin/kayıtlı/..." zarf öbeği (olarak'sız biçim — F1 fixture'ı). */
const TR_OCR_ADVERB_RE =
  /\s*,?\s*ocr['’]?(?:d[ae]n?)?\s+(?:kesin(?:dir)?|kayıtlı|kayıtta|doğrulandı|net|görünüyor|okundu|geldi|var)(?![a-zçğıöşü])/giu;
/** "katil(in) bilgisi X" → "katil X" (F3: bilgi-sarmalayıcı söküm; çıplak "bilgi" SERBEST).
 *  KESME-EKLİ HÂL (TR-KALAN-04): eski desen "bilgisi" ardından BOŞLUK şart koştuğu
 *  için "katil bilgisi'da Raze" (know-g, canlı final) kaçıyordu. Sağ sınır ZORUNLU:
 *  sınırsız \s* olsaydı "katil bilgisini takımına ver" → "katil ni ver" olurdu.
 *  "nde(ki)" (plandan SAPMA, bilinçli): TR-KALAN-05 ile stripFieldLabelTokens
 *  "killerInfo'da" etiketini artık "katil bilgisinde" diye Türkçeleştiriyor; bu
 *  biçim eklenmeseydi know-g ham metni zincirde "…, katil bilgisinde Raze." diye
 *  meta kuyrukla kalırdı. "bilgisini/bilgisinden" DOKUNULMAZ (sağ sınır). */
//  KESMELİ DAL YALNIZ BULUNMA EKİ (B01 inceleme): eski ['’][a-zçğıöşü]{1,4} dalı
//  ayrılma/belirtme ekini de yutuyordu → "Katil bilgisi'nden anlaşılan Raze." →
//  "Katil anlaşılan Raze." (ek ve anlam kayboluyordu). Canlı sızıntı biçimi
//  ("katil bilgisi'da", know-g) bulunma ekidir; diğer ekler bayt-aynı kalır.
//  SAĞ SINIR kesmeyi de kapsar ve veri-yokluğu yüklemi öncesinde ATEŞLENMEZ:
//  "Katil bilgisi yok ama …" (MISSING_DATA'nın bilerek bıraktığı öğüt cümlesi)
//  "Katil yok ama …" diye ANLAM DEĞİŞTİRİYORDU (katil yok ≠ katil bilgisi yok).
const TR_KATIL_BILGISI_RE =
  /(?<![a-zçğıöşü])katil(?:in)?\s+bilgisi(?:['’](?:[dt][ae](?:ki)?|nd[ae](?:ki)?)|nde(?:ki)?)?(?![a-zçğıöşü'’])(?!\s*(?:gelmedi|yok|eksik|alınamadı|okunamadı|bulunamadı)(?![a-zçğıöşü]))\s*/giu;

// ── B4: TUTANAK DİLİ AİLESİ (TR-KALAN-04, 2026-09-23) ───────────────────────
// 39 gerçek çağrının 12 çıktısında meta süzgeci GEÇİLDİ. Tasarım eskisiyle aynı:
// OLGU kurtarılır, meta parça düşer, hiçbir metin ÜRETİLMEZ.
// REGRESYON DERSİ (iki doğrulayıcı): bütün köprü karakter sınıfları VİRGÜLÜ de
// dışlar ([^.,;:!?\n—]) — virgül geçirgenken desen komşu MEŞRU yan-cümleyi
// yutuyordu ("…, takımın trade alamadı, katil Jett doğrulandı." → trade bilgisi
// siliniyordu; "…bilgisi yok, o yüzden geniş açıyla peek at." → öğüt siliniyordu).
const TR_SUBJ_PRONOUN_RE = /^(?:sen|siz|biz|ben|onlar|takım|ekip|rakip)(?![a-zçğıöşü])/iu;
const trLowerCt = (s: string) => s.toLocaleLowerCase("tr");
/** Bir KONUM metnin ÖNCEKİ kısmında zaten geçiyor mu? Tekrar-kuyruğunu YENİ bilgi
 *  taşıyan kuyruktan ayırır — silme kararının tek ölçütü budur.
 *  TAM ÖBEK (B01 inceleme): eski hâli ≥3 harfli sözcüklerden BİRİNİN ilk 4 harfini
 *  arıyordu (.some) ve site harfini hiç karşılaştırmıyordu → "B Main'e rotasyon
 *  yaparken seni yakaladılar, ölüm A Main'de gerçekleşti." cümlesinde "main" ortak
 *  diye GERÇEK (tek) ölüm yeri siliniyordu. Artık öbeğin TÜM sözcükleri (tek harfli
 *  site harfi dahil, kesme-ekleri soyulmuş) aynı sırayla ve sözcük başı sınırıyla
 *  geçmeli; meta sözcükler ("callout", "bölgesi") karşılaştırmaya girmez. */
const TR_LOC_META_WORD_RE = /^(?:callout|bölge|bölgesi|bölgesinde|nokta|noktası|noktasında|civarı|civarında|tarafı|tarafında|yakınında)$/u;
const escCt = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function mentionedBefore(prefix: string, phrase: string): boolean {
  const words = trLowerCt(phrase)
    .split(/\s+/)
    .map((w) => w.replace(/['’][\p{L}]*$/u, "").replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w && !TR_LOC_META_WORD_RE.test(w));
  if (!words.length) return false;
  return new RegExp(`(?<![\\p{L}\\p{N}])${words.map(escCt).join("\\s+")}`, "u").test(trLowerCt(prefix));
}
/** Katil kuyruğunun OLGULARI önceden geçiyor mu? Müttefik iyeliğiyle anılan ad
 *  ("Takımın Jett'i") katil tekrarı SAYILMAZ — ayna eşleşmede (iki takımda da Jett)
 *  katil bilgisi YENİdir. Silah verilmişse o da geçmiş olmalı: "Takımın Jett'i
 *  kaybetti, öldüren Jett ve silah Vandal." eskiden ad-tekrarı sayılıp siliniyordu. */
function factsMentionedBefore(prefix: string, name: string, weapon?: string): boolean {
  const p = trLowerCt(prefix);
  let named = false;
  for (const m of p.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escCt(trLowerCt(name))}`, "gu"))) {
    const before = p.slice(0, m.index ?? 0);
    if (!/(?<![\p{L}])(?:takım(?:ın|ının)?|takım\s+arkadaşın(?:ın)?|müttefik(?:in)?)\s+$/u.test(before)) { named = true; break; }
  }
  if (!named) return false;
  return !weapon || new RegExp(`(?<![\\p{L}\\p{N}])${escCt(trLowerCt(weapon))}`, "u").test(p);
}
/** (A) "katil/öldüren (ajan|bilgisi)? olarak <Ad> <kayıt-fiili>" — kayıt-fiili
 *  ZORUNLU: fiilsiz "katil olarak Iso" mevcut F1 fixture'ı, ona DOKUNULMAZ.
 *  'i' bayrağı YOK (büyük-harf ad şartı korunsun). */
const TR_ROL_OLARAK_KAYIT_RE =
  /(?<![a-zçğıöşü])(?:[kK]atil|[öÖ]ldüren)(?:\s+(?:ajan|bilgisi|kişi|oyuncu|düşman))?\s+olarak\s+([\p{Lu}][\p{L}]{1,14})\s+(?:var|kayıtlı|kayıtta|kayıtlarda|geçiyor|görünüyor|mevcut|kaydedildi|doğrulandı|doğrulanmış|belirlendi)(?![a-zçğıöşü])(\s+ve\s+)?/gu;
/** (B) "katil net/kesin olarak <Ad>" (astra-e). */
const TR_ROL_NET_OLARAK_RE =
  /(?<![a-zçğıöşü])(?:[kK]atil|[öÖ]ldüren)(?:\s+(?:ajan|bilgisi|kişi|oyuncu|düşman))?\s+(?:net|kesin)\s+olarak\s+([\p{Lu}][\p{L}]{1,14})(?![a-zçğıöşü])/gu;
/** (C1) Cümle-SONU onay yan-cümlesi komple düşer (S29). Köprü VİRGÜLSÜZ.
 *  ÖZNE KAPISI (B01 inceleme): köprüde rol/meta öznesi (katil/öldüren/öldürülme/
 *  silah/ölüm/kayıt/veri/bilgi) YOKSA dokunulmaz — "Omen smoke'u attı ve pozisyonun
 *  belirlendi." (Sova oku / kamera bağlamında OYUN olgusu) ve "Spike kuruldu ve site
 *  onaylandı." siliniyordu. Tek istisna: salt VERİ-SESİ fiilleri (doğrulan-/teyit
 *  edil-/kaydedil-) konum/pozisyon öznesiyle de meta sayılır ("…, pozisyonun
 *  doğrulandı." — R4 fixture'ı); "belirlen-/onaylan-" oyun anlamı taşıyabildiği
 *  için yalnız rol/meta öznesiyle düşer. Korpusun 6 eşleşmesinin 6'sı rol/meta özneli
 *  (S29 "öldürülme silah ve konumuyla doğrulanmış", "öldüren ajan Yoru olarak
 *  kaydedildi"). "katil <Ad> doğrulandı" biçiminde yalnız FİİL düşer; ad önceden
 *  geçmiyorsa "katil <Ad>" KALIR (TR_ROL_TAIL tekrarsa siler). */
const TR_ONAY_META_SUBJ_RE =
  /(?<![\p{L}])(?:katil|öldüren|öldürül\p{L}*|silah\p{L}*|ölüm\p{L}*|kayıt\p{L}*|kill\p{L}*|veri\p{L}*|ocr|bilgi\p{L}*)(?![\p{L}])/iu;
const TR_ONAY_DATA_VERB_POS_RE =
  /(?<![\p{L}])(?:konum\p{L}*|pozisyon\p{L}*)(?![\p{L}])[^.,;:!?\n—]*?(?<![a-zçğıöşü])(?:doğrulan(?:mış|dı|an)|teyit\s+edil(?:di|miş)|kaydedil(?:di|miş))\s*$/iu;
const TR_ONAY_VERB_TAIL_RE =
  /\s*(?<![a-zçğıöşü])(?:doğrulan(?:mış|dı|an)|teyit\s+edil(?:di|miş)|onaylan(?:mış|dı)|kaydedil(?:di|miş)|belirlen(?:di|miş))\s*$/iu;
const TR_ONAY_ROLE_NAME_RE =
  /^\s*(?:,|;|\s+ve)\s*(?:[kK]atil|[öÖ]ldüren)(?:\s+(?:ajan|kişi|oyuncu|düşman))?\s+[\p{Lu}][\p{L}]{1,14}(?:\s+ve\s+(?:silah\s+)?[\p{Lu}][\p{L}]{1,14})?$/u;
const TR_ONAY_CLAUSE_RE =
  /\s*(?:,|;|\s+ve)\s*[^.,;:!?\n—]{0,90}?(?<![a-zçğıöşü])(?:doğrulan(?:mış|dı|an)|teyit\s+edil(?:di|miş)|onaylan(?:mış|dı)|kaydedil(?:di|miş)|belirlen(?:di|miş))\s*(?=[.!?]|$)/giu;
/** (C2) Özel ad sonrası çıplak onay ortacı düşer, olgu KALIR (r3-b). */
const TR_ONAY_ORTAC_RE =
  /(?<=[\p{Lu}][\p{L}]{1,14})\s+(?:doğrulan(?:mış|dı)|teyit\s+edil(?:di|miş)|onaylan(?:mış|dı)|kaydedil(?:di|miş)|belirlen(?:di|miş))(?=\s*[;,.!?]|$)/gu;
/** (E) "…, ölüm A Site'te gerçekleşti" — konum YAKALANIR; yalnız o konum metinde
 *  ZATEN geçiyorsa silinir. Koşulsuz silmek gerçek korpusta TEK ölüm-yerini yok
 *  edip sarkan "oradan" bırakıyordu (cyclereal-r3b M1-R18 "Mid Link"). */
const TR_OLUM_GERCEKLESTI_RE =
  /\s*(?:,|;|\s+ve)\s*ölüm(?:ün|ü)?\s+([^.;:!?\n—]{0,40}?)gerçekleşti(?![a-zçğıöşü])/giu;
/** (D) Veri-yokluğu yan-cümlesi ("öldüren ajan/cihaz bilgisi gelmedi", "veri
 *  setinde öldüren bilgi yok"). Rol listesinde çıplak 'silah' YOK: "Silah sesi
 *  dışında bilgi yok, ortayı kontrol et." meşru.
 *  KAPALI TUTANAK GRAMERİ (B01 inceleme — ilk sürüm açık uçluydu): "bilgi" Valorant
 *  koçluğunda INTEL demektir. Rol sözcüğünün sağ sınırı yoktu, köprü sınırsızdı ve
 *  kuyruk fiilden sonra noktalamaya kadar her şeyi alıyordu → "Katil bilgisi yok ama
 *  açıyı tutarken crosshair'i kafa hizasında tut." öğüdü, "Seni öldüren Jett'in
 *  pozisyonu hakkında takımında bilgi yok, bu yüzden …" gerekçesi siliniyordu. Artık:
 *   · rol HEMEN "bilgi(si)"ye bağlanır — yalnız "ajan/oyuncu/kişi" ve "/ ve veya ya da
 *     + silah/cihaz/ajan/konum" araya girebilir (korpusun 15 eşleşmesinin tümü bu
 *     biçimde: "öldüren ajan/cihaz bilgisi", "ölüm yeri veya silah bilgisi");
 *   · önek ≤32 karakter ve bağlaç içeremez (replacer kapısı) — "…vurdu ve katil
 *     bilgisi yok" koordinatlı olgu yan-cümlesini yutmaz;
 *   · yan-cümle FİİLDE biter: ardından yalnız [.,;!?—] ya da metin sonu gelebilir →
 *     "bilgi yok ama …", "bilgi yok o yüzden …" bayt-aynı kalır.
 *  Grup 1 = ayraç (boşsa eşleşme CÜMLE BAŞINDA), grup 2 = önek, grup 3 = cümle-başı
 *  eşleşmenin terminatörü (cümle başındaysa O DA tüketilir; aksi hâlde metin ". Kimse
 *  seni öldürmedi." diye noktayla başlıyordu). */
const TR_MISSING_DATA_CLAUSE_RE =
  /(^|(?<=[.!?]\s)|\s*[;,—]\s*)([^.,;:!?\n—]{0,32}?)(?<![a-zçğıöşü])(?:öldüren|katil|ölüm\s+yeri)(?:\s+(?:ajan|oyuncu|kişi))?(?:\s*(?:\/|ve|veya|ya\s+da)\s*(?:silah|cihaz|ajan|konum))?\s+bilgi(?:si)?\s+(?:gelmedi|yok|eksik|alınamadı|okunamadı|bulunamadı)(?![\p{L}])(?=\s*(?:[.,;!?—]|$))(\s*[.!?](?:\s+|$))?/giu;
/** MISSING_DATA önekinde koordinasyon/karşıtlık bağlacı → önek kendi olgusunu taşıyan
 *  ayrı bir yan-cümledir ("Jett seni vurdu ve katil bilgisi yok") → dokunulmaz. */
const TR_MISSING_PREFIX_CONJ_RE = /(?<![\p{L}])(?:ve|ama|fakat|ancak|lakin|çünkü|yoksa|oysa|ki)(?![\p{L}])/iu;
/** Önek çekimli bir yüklemle mi bitiyor (geçmiş -DI(k/n/m/lar), -yor, -mIş, -mAz,
 *  -mAlI)? Virgülün yan-cümle mi liste mi ayırdığını belirler (MISSING_DATA kalkanı). */
const TR_FINITE_VERB_END_RE =
  /(?:[dt][ıiuü](?:n|m|k|nız|niz|nuz|nüz|lar|ler)?|yor(?:du|sun|lar)?|m[ıiuü]ş(?:s[ıiuü]n)?|m[ae]z|m[ae]l[ıi])\s*$/iu;
/** Cümle-sonu tutanak kuyruğu — ad YAKALANIR; yalnız TEKRAR ise silinir.
 *  ("Açıyı çok geniş tuttun, öldüren Chamber." → Chamber başka yerde yok → KALIR.) */
const TR_ROL_TAIL_RE =
  /\s*(?:,|;|\s+ve)\s*(?:[kK]atil|[öÖ]ldüren)(?:\s+(?:ajan|bilgisi|kişi|oyuncu|düşman))?\s+([\p{Lu}][\p{L}]{1,14})(?:\s+ve\s+silah\s+([\p{Lu}][\p{L}]{1,14}))?\s*(?=[.!?]|$)/gu;
/** Form-alanı iki noktası, YALNIZ alan başında ("Katil: Miks, …" — r1-c). */
const TR_ROL_ETIKET_RE = /^(katil|öldüren)(\s+(?:ajan|bilgisi))?\s*:\s*/iu;
/** "veri seti/setinde/setini…" (M0-R0). Uzun ekler önce — sağ sınır korur. */
const TR_VERI_SETI_RE = /(?<![a-zçğıöşü])veri\s+set(?:inden|inde|iyle|imiz|ini|ine|in|i)(?![a-zçğıöşü])\s*/giu;
/** "verilere/kayıtlara/sisteme/rapora göre" cümle-başı önekleri — komple düşer.
 *  'rapor(lar)a göre' eklendi (canli-test #11, 2026-08-05). "maç raporuna göre"
 *  EŞLEŞMEZ ("raporuna" ≠ "rapora") — ürün terimi korunur. */
const TR_GORE_PREFIX_RE = /(?<![a-zçğıöşü])(?:veri(?:ye|lere)|kayıtlara|sisteme|rapor(?:lar)?a|ocr['’]?[ae])\s+göre\s*/giu;
/** "-dığı tespit edildi" → "-dığı net" (dilbilgisi korunur: ortaç özneyi taşır). */
const TR_TESPIT_PARTICIPLE_RE =
  /([\p{L}'’]*(?:dığı|diği|duğu|düğü|tığı|tiği|tuğu|tüğü)(?:n|nız|niz|nuz|nüz)?)\s+tespit edildi(?![a-zçğıöşü])/giu;
/** Kalan "X tespit edildi" → "X var" (sistem sesi → düz saptama; emir "tespit et" KORUNUR). */
const TR_TESPIT_FALLBACK_RE = /\s+tespit edildi(?![a-zçğıöşü])/giu;
/** Kalan "kayıtta/sistemde/veride var|görünüyor|..." öbeği — silinir. */
const TR_LEFTOVER_META_RE =
  /(?<![a-zçğıöşü])(?:kayıtta|kayıtlarda|sistemde|veride|verilerde)\s+(?:var|kayıtlı|görünüyor|mevcut|net|kesin)(?![a-zçğıöşü])/giu;
/** EN SON backstop: çıplak "OCR" token'ı (opsiyonel apostrof-ekiyle) — koç metninde asla meşru değil. */
const TR_OCR_BARE_RE = /(?<![\p{L}\p{N}])ocr(?:['’][a-zçğıöşü]{1,6})?(?![\p{L}\p{N}])/giu;
/** EN aynası (canli-test #11, 2026-08-05): "was reported as Jett" → "was Jett" —
 *  kopula korunur, meta fiil düşer. NOT: cleanCoachText zincirinde stripMetaTerms
 *  yalnız TR dalında koşar; bu desenler TR metinde ASLA eşleşmez (İngilizce
 *  kelimeler), EN dalına bağlanırsa hazır. Prompt yasağı + findMetaTermHits
 *  ölçümü EN'i bugün de kapsıyor. */
const EN_REPORTED_AS_RE = /\b(is|was)\s+reported\s+as\b/gi;
/** ", as reported" kuyruğu — yalnız cümle-sonu biçimi (DAR: "was reported as"
 *  içindeki "as"e sol-sınır \s+ şartı yüzünden ASLA yapışmaz). */
const EN_AS_REPORTED_RE = /,?\s+as\s+reported(?=\s*[.!?;]|$)/gi;

// ══════════════════════════════════════════════════════════════════════════════
// ÖLÜM-TİPİ KOD-ADI SÜZGECİ (canlı-test #14, 2026-09-01)
//
// Kaan'ın TR metnine enum slug'ı 3 kez VERBATIM sızdı: R11 "over-peek-advantage
// hatasını yaptın", R23 "over peek advantage yüzünden öldün", R7 "def-geniş-hold
// tipi ile" (YARI-ÇEVRİLİ — tam-eşleşme listesi onu kaçırırdı). Kaynak kurutuldu
// (death-type.ts direktiflerinden slug cümlesi silindi); burası SINIR SAVUNMASI.
// KURTARMA YOLU: cümle SİLİNMEZ — slug öbeği elle yazılmış düzyazı karşılığıyla
// değiştirilir (DEATH_TYPE_GUIDE.concept alanı KULLANILMAZ — o da kod-ad).
// Desen disiplini: tireli slug zinciri hiçbir dilde doğal düzyazı değildir;
// meşru tireli koç terimleri (post-plant, off-angle, anti-eco, re-peek) hiçbir
// desenin TAM eşleşmesi değildir (tek tek kontrol edildi). Ateşlenmezse bayt-aynı.
// ══════════════════════════════════════════════════════════════════════════════
const DEATH_TYPE_TOKEN_REWRITES: ReadonlyArray<[RegExp, { tr: string; en: string }]> = [
  // Gözlenen sızıntı ailesi — tire/boşluk/yarı-çeviri toleranslı (R11+R23+R7 fixture).
  [/\bover[-\s]?peek[-\s]advantage\b/giu, { tr: "avantajı yakma", en: "over-peeking your advantage" }],
  [/\bdef[-–][\p{L}]{1,12}[-–]hold\b/giu, { tr: "geniş savunma açısı tutma", en: "wide defensive hold" }],
  // Kalan enum slug'ları — YALNIZ tam tireli biçim (doğal metinde geçmez).
  [/\brepeat-angle\b/giu, { tr: "aynı açıdan ölme", en: "dying to the same angle" }],
  [/\bop-angle\b/giu, { tr: "Operator açısına yakalanma", en: "getting caught by the Operator angle" }],
  [/\bpistol-round\b/giu, { tr: "pistol round açılışı", en: "pistol-round opening" }],
  [/\beco-force-loss\b/giu, { tr: "ekonomi kararı", en: "economy call" }],
  [/\bentry-no-trade\b/giu, { tr: "trade'siz giriş", en: "untraded entry" }],
  [/\bentry-traded\b/giu, { tr: "trade'lenmiş giriş", en: "traded entry" }],
  [/\bpost-plant-solo\b/giu, { tr: "post-plant'te tek kalma", en: "playing the post-plant alone" }],
  [/\bretake-no-util\b/giu, { tr: "util'siz retake", en: "retake without utility" }],
  [/\bretake-advantage-thrown\b/giu, { tr: "retake avantajını eritme", en: "throwing the retake advantage" }],
  [/\bnumbers-down-carry\b/giu, { tr: "sayı azken silahı taşımama", en: "not saving while down numbers" }],
  [/\bcrosshair-loss\b/giu, { tr: "düello kaybı", en: "losing the duel" }],
  [/\btiming-window\b/giu, { tr: "erken çıkış", en: "peeking into the timing window" }],
  [/\blate-def-no-plant\b/giu, { tr: "geç round savunma sabrı", en: "late-round defensive patience" }],
  [/\blate-no-plant\b/giu, { tr: "geç round kararı", en: "late-round call" }],
  [/\bfull-buy-first-contact\b/giu, { tr: "tam alımda ilk temas", en: "first contact on a full buy" }],
  [/\bop-loss\b/giu, { tr: "Operator kaybı", en: "losing the Operator" }],
  [/\blow-hp-no-save\b/giu, { tr: "save etmeme", en: "not saving" }],
  [/\bclutch-lost\b/giu, { tr: "clutch kaybı", en: "lost clutch" }],
  [/\bult-in-pocket\b/giu, { tr: "kullanılmamış ult", en: "unused ult" }],
  [/\blurk-caught\b/giu, { tr: "kopuk lurk", en: "disconnected lurk" }],
  [/\bloss-streak\b/giu, { tr: "kayıp serisi", en: "loss streak" }],
  [/\bwin-streak-comfort\b/giu, { tr: "seri rahatlığı", en: "win-streak comfort" }],
  [/\bovertime-matchpoint\b/giu, { tr: "yüksek ağırlıklı round", en: "high-stakes round" }],
  [/\bdef-no-crossfire\b/giu, { tr: "crossfire'sız savunma", en: "defending without a crossfire" }],
  [/\binfo-less-push\b/giu, { tr: "tetikleyicisiz basma", en: "pushing without a trigger" }],
];

/** Ölüm-tipi kod-adlarını koç metninden söker (dil-BAĞIMSIZ — cleanCoachText'in
 *  her iki dalında da koşar). Slug öbeği düzyazıyla değiştirilir; ardından kalan
 *  " tipi" meta-kuyruğu düşürülür ("geniş savunma açısı tutma tipi ile" →
 *  "geniş savunma açısı tutma ile"). Değişiklik yoksa bayt-aynı döner. */
export function stripDeathTypeTokens(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  let t = text;
  for (const [re, rep] of DEATH_TYPE_TOKEN_REWRITES) {
    t = t.replace(re, lang === "en" ? rep.en : rep.tr);
  }
  if (t !== text && lang === "tr") {
    // Yeniden yazım sonrası sarkan tip-meta kuyruğu (yalnız bizim ikamelerimizin
    // hemen ardından — genel " tipi" avı DEĞİL, meşru "post-plant tipi" sınıfına
    // dokunmaz çünkü yalnız ikame metinlerimizi hedefler).
    for (const [, rep] of DEATH_TYPE_TOKEN_REWRITES) {
      t = t.replace(new RegExp(rep.tr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+tipi(?![a-zçğıöşü])", "giu"), rep.tr);
    }
    t = t.replace(/\s{2,}/g, " ");
  }
  return t;
}

// ── KOMP ARKETİPİ KOD-ADI SÜZGECİ (W2 followup #70 / W2 inceleme B06-F6, 2026-09-24) ──
// KANIT: user-message [SİLAH+KOMP İPUCU] işaretçisi modele KB bölüm adı olarak slug
// veriyor ("Düşman komp arketipi: double-duelist-dive") ve model onu kullanıcı metnine
// kopyalıyor — canlı: aimlo-runtimeKAAN.txt 18 satır ("Rakip kadrosunda double-duelist-
// dive var"), eval: 13 tekil ham alan (op-comp ×6, double-duelist-dive ×4,
// double-controller ×3; cycleb06-parity-syn final'lerinin 7/17'si). Kod-ad yasağı ihlali.
// Ölüm-tipi slug'larıyla (stripDeathTypeTokens) AYNI sınıf → aynı yöntem: TAM tireli slug
// sade adla değiştirilir (lib/comp-archetypes.ts tek tablo). Tireli slug doğal düzyazıda
// geçmez; "standart" tabloda YOK (sıradan Türkçe sözcük). Büyük harfle başlayan eşleşme
// büyük harfle kalır ("Op-comp var" → "Op'lu komp var", "Double-controller on…" →
// "Two-controller on…"). Kesme-ekli biçimde ("op-comp'u") karşılık "komp" ile bitiyorsa
// ek bitiştirilir ("Op'lu kompu" — komp ile comp aynı ünlü/sertlikte okunur); diğerlerinde
// kesme kalır. Korpusta ekli biçim 0. Prompt kökü (işaretçide slug) B09 prompt dalgasına
// followup; bu SINIR savunmasıdır. Temiz metinde bayt-aynı.
const COMP_SLUG_RE = new RegExp(
  // Slug'lar yalnız [a-z-] içerir; "-" karakter sınıfı DIŞINDA özel değil (u kipinde
  // "\-" kaçışı GEÇERSİZ) → ham birleştirme güvenli.
  `(?<![\\p{L}\\p{N}-])(${Object.keys(COMP_ARCHETYPE_PLAIN).join("|")})` +
    `(?:(['’])([a-zçğıöşü]{1,8}))?(?![\\p{L}\\p{N}-])`,
  "giu",
);
export function stripCompArchetypeTokens(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  return text.replace(COMP_SLUG_RE, (m: string, slug: string, apos: string | undefined, suffix: string | undefined) => {
    const plain = COMP_ARCHETYPE_PLAIN[slug.toLowerCase() as keyof typeof COMP_ARCHETYPE_PLAIN];
    if (!plain) return m;
    let out = lang === "en" ? plain.en : plain.tr;
    if (/^\p{Lu}/u.test(m)) out = (lang === "tr" ? out.charAt(0).toLocaleUpperCase("tr") : out.charAt(0).toUpperCase()) + out.slice(1);
    if (suffix) out += /komp$/i.test(out) ? suffix : `${apos ?? "'"}${suffix}`;
    return out;
  });
}

// ── VERİ-ETİKETİ SÜZGECİ (canlı-test #15 DC8, 2026-09-01) ────────────────────
// Kaan'ın maç raporu kullanıcıya "birkaç round'da ultReady varken risk alıp
// öldün" yazdı — model, isteğin JSON alan adını (ultReady) koç cümlesine
// kopyaladı. Alan adları VERİ ETİKETİDİR, koç dili değil. Dil-BAĞIMSIZ süzgeç:
// etiketler İngilizce-camelCase olduğundan TR meta süzgeci onları göremez
// (stripDeathTypeTokens ile aynı sınıf). Yalnız BİLİNEN etiketler, whole-token
// ve BÜYÜK/küçük-duyarlı (meşru "ult ready" ifadesine dokunmaz); ikameler akan
// cümlede gramer-güvenli kısa adlar ("ultReady varken" → "ult varken").
// Temiz metinde bayt-aynı döner.
// İlk harf iki-vaka ([dD] gibi): A/B ölçümünde model etiketi cümle başında
// PascalCase yazdı ("DeathTiming erken") ve salt-camelCase desen kaçırdı.
// Gövde büyük/küçük-duyarlı kalır ("ult ready" gibi meşru doğal dile dokunulmaz).
// EK UYUMU (TR-KALAN-05, 2026-09-23): ikame eskiden yalnız GÖVDEYİ değiştirip
// kesme ekini aynen taşıyordu → "katil bilgisi'da", "rakip kadro'da", "ölüm
// yeri'da", "ekonomi'ı" (HEAD probe; know-g canlı final). Türkçe karşılıkların
// çoğu İYELİKLİ tamlama ("katil bilgisi") → ek kaynaştırma n'si ister
// ("bilgisinde"). Etiket regex'i artık opsiyonel kesme-ekini de yakalar; ek,
// karşılığın türüne ve son ünlüsüne göre Türkçeleştirilir:
//   poss  = iyelik sonlu ("bilgisi","yeri") → -nDA / -nDAn / -nDAki / -nI / -nA / -nIn / -ylA
//   vowel = ünlü sonlu, iyeliksiz ("kadro","ekonomi","hata") → -DA / … / -yI / -yA / -nIn / -ylA
//   loan  = yabancı sözcük ("ult","trade") → kesme KALIR (Türkçe yazım kuralı), ek uyumlanır
// Tanınmayan ekte poss/vowel için yalnız kesme düşer; ASLA "X'<ek>" bırakılmaz.
// EN dalı BAYT-AYNI: gövde değişir, ek olduğu gibi kalır (eski davranış).
type LabelKind = "poss" | "vowel" | "loan";
const FIELD_LABEL_REWRITES: Array<[RegExp, { tr: string; en: string; kind: LabelKind }]> = [
  [/\b[uU]ltReady(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "ult", en: "ult", kind: "loan" }],
  [/\b[dD]eathTiming(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "ölüm zamanlaması", en: "death timing", kind: "poss" }],
  [/\b[kK]illerInfo(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "katil bilgisi", en: "killer info", kind: "poss" }],
  [/\b[dD]eathLocation(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "ölüm yeri", en: "death location", kind: "poss" }],
  [/\b[dD]eathAngle(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "ölüm yönü", en: "death angle", kind: "poss" }],
  [/\b[eE]conomyType(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "ekonomi", en: "economy", kind: "vowel" }],
  [/\b[eE]nemyComp(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "rakip kadro", en: "enemy comp", kind: "vowel" }],
  [/\b[eE]nemyRoster(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "rakip kadro", en: "enemy roster", kind: "vowel" }],
  [/\b[sS]pikePlanted(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "spike kurulumu", en: "spike plant", kind: "poss" }],
  [/\b[aA]lliesAlive(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "yaşayan takım arkadaşı sayısı", en: "allies alive", kind: "poss" }],
  [/\b[eE]nemiesAlive(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "yaşayan düşman sayısı", en: "enemies alive", kind: "poss" }],
  [/\b[rR]oundTimerAtDeath(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "round zamanı", en: "the round timer", kind: "poss" }],
  [/\b[tT]radedByAlly(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "trade", en: "trade", kind: "loan" }],
  [/\b[pP]atternContext(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "tekrarlayan hata", en: "recurring pattern", kind: "vowel" }],
  // W2 followup #63(c) (2026-09-24): rapor şemasının alan adı. Ücretli eval-report R3
  // summary ham çıktısı "…hayatta kalma %50; decisionScore orta (5/10)." ve refine çıktısı
  // "…decisionScore 5/10." (scripts/eval-out/report-samples.json) — kullanıcıya giden
  // final'de aynen kaldı. Aynı sınıf (JSON alan adı → koç cümlesi), whole-token camelCase.
  [/\b[dD]ecisionScore(?:(['’])([a-zçğıöşü]{1,8}))?(?![A-Za-z0-9_çğıöşüÇĞİÖŞÜ])/g, { tr: "karar puanı", en: "decision score", kind: "poss" }],
];
/** Yabancı karşılıkların OKUNUŞ ünlüsü/sertliği (yazımdan türetilemez: trade=treyd). */
const LOAN_SOUND: Record<string, { vowel: string; hard: boolean }> = {
  ult: { vowel: "u", hard: true },
  trade: { vowel: "e", hard: false },
};

/** Etiketin kesme-sonrası ekini (İngilizce etikete yazılmış hâliyle) Türkçe karşılığa
 *  uyar. Tanınmayan ek → null (çağıran kesmeyi düşürüp eki yapıştırır).
 *  İYELİK ÖNEKLİ ve ÇOĞUL EKLER (B01 inceleme): ilk sürüm yalnız çıplak hâl eklerini
 *  tanıyordu; "deathLocation'ında" → "Ölüm yeriında", "killerInfo'sunda" → "Katil
 *  bilgisisunda", "enemyComp'unda" → "Rakip kadrounda", "deathLocation'ları" →
 *  "Ölüm yeriları" (Türkçede olmayan sözcükler) çıkıyordu. Artık:
 *   · iyelik önekli ek (s?I + n-kaynaştırmalı hâl ya da -ylA): poss karşılık zaten
 *     iyelikli → yalnız hâl ("ölüm yerinde"); vowel → "sI"+hâl ("kadrosunda"); loan
 *     → "'I"+hâl ("ult'unda");
 *   · çoğul (lAr + …): poss → gövde çoğullanır, tamlama iyeliği korunur ("ölüm
 *     yerleri/yerlerini/yerlerinde"); vowel → "kadrolar/kadroları/kadrolarda"; loan
 *     çoğulu tanınmaz (null). Çıplak "-lArI" belirtme okunur ("… kullan" nesnesi —
 *     prompt'un kendi biçimi lib/report-prompt.ts "deathLocation'ları kullanabilirsin"). */
type LabelCase = "none" | "loc" | "abl" | "locki" | "acc" | "dat" | "gen" | "ins";
const lastVowelCt = (w: string) => { const vs = w.match(/[aıoueiöü]/g); return vs ? vs[vs.length - 1] : "e"; };
const harmA = (v: string) => (/[aıou]/.test(v) ? "a" : "e");
const harmI = (v: string) => (v === "a" || v === "ı" ? "ı" : v === "o" || v === "u" ? "u" : v === "e" || v === "i" ? "i" : "ü");
/** Çıplak hâl eki (kaynaştırma harfi opsiyonel). */
function plainLabelCase(s: string): LabelCase | null {
  if (/^[dt][ae]$/.test(s)) return "loc";
  if (/^[dt][ae]n$/.test(s)) return "abl";
  if (/^[dt][ae]ki$/.test(s)) return "locki";
  if (/^[yn]?[ıiuü]$/.test(s)) return "acc";
  if (/^[yn]?[ae]$/.test(s)) return "dat";
  if (/^n?[ıiuü]n$/.test(s)) return "gen";
  if (/^y?l[ae]$/.test(s)) return "ins";
  return null;
}
/** İyelik ünlüsünden SONRAKİ parça (n-kaynaştırmalı hâl / -ylA / boş). */
function possRestCase(r: string): LabelCase | null {
  if (r === "") return "none";
  if (/^nd[ae]$/.test(r)) return "loc";
  if (/^nd[ae]n$/.test(r)) return "abl";
  if (/^nd[ae]ki$/.test(r)) return "locki";
  if (/^n[ıiuü]$/.test(r)) return "acc";
  if (/^n[ae]$/.test(r)) return "dat";
  if (/^n[ıiuü]n$/.test(r)) return "gen";
  if (/^yl[ae]$/.test(r)) return "ins";
  return null;
}
/** İyelikli gövdeden sonraki hâl eki (n-kaynaştırmalı). */
const possCaseTail = (c: LabelCase, A: string, I: string): string =>
  ({ none: "", loc: `nd${A}`, abl: `nd${A}n`, locki: `nd${A}ki`, acc: `n${I}`, dat: `n${A}`, gen: `n${I}n`, ins: `yl${A}` })[c];
function harmonizeLabelSuffix(tr: string, kind: LabelKind, suffix: string): string | null {
  const s = suffix.toLocaleLowerCase("tr");
  let lastV: string;
  let hard = false;
  if (kind === "loan") {
    const snd = LOAN_SOUND[tr] ?? { vowel: "e", hard: false };
    lastV = snd.vowel; hard = snd.hard;
  } else {
    lastV = lastVowelCt(tr);
  }
  const A = harmA(lastV);
  const I = harmI(lastV);
  const D = kind === "loan" && hard ? "t" : "d";
  const c = plainLabelCase(s);
  if (c && c !== "none") {
    if (kind === "poss") return possCaseTail(c, A, I);
    if (kind === "vowel") {
      return { loc: `d${A}`, abl: `d${A}n`, locki: `d${A}ki`, acc: `y${I}`, dat: `y${A}`, gen: `n${I}n`, ins: `yl${A}` }[c];
    }
    return "'" + { loc: `${D}${A}`, abl: `${D}${A}n`, locki: `${D}${A}ki`, acc: I, dat: A, gen: `${I}n`, ins: `l${A}` }[c];
  }
  // İyelik önekli ek: "ında", "sında", "unda", "sı", "ını", "ıyla", "sındaki"…
  const pm = /^s?[ıiuü](.*)$/.exec(s);
  const pc = pm ? possRestCase(pm[1]) : null;
  if (pc) {
    const head = kind === "poss" ? "" : kind === "vowel" ? `s${I}` : `'${I}`;
    return head + possCaseTail(pc, A, I);
  }
  // Çoğul: "ları", "larda", "larında", "leri"…
  const pl = /^l[ae]r(.*)$/.exec(s);
  if (!pl || kind === "loan") return null;
  const rest = pl[1];
  if (kind === "poss") {
    const stem = tr.replace(/s?[ıiuü]$/, "");
    const A2 = harmA(lastVowelCt(stem));
    const I2 = A2 === "a" ? "ı" : "i";
    let rc: LabelCase | null;
    if (rest === "") rc = "none";
    else if (/^[ıiuü]$/.test(rest)) rc = "acc";
    else if (/^[ıiuü]n$/.test(rest)) rc = "gen";
    else if (/^[ıiuü]/.test(rest)) rc = possRestCase(rest.slice(1));
    else rc = plainLabelCase(rest);
    if (!rc) return null;
    // Gövde çoğullanır → çağıran tr'yi değil bu tam biçimi kullansın diye "\u0000" işareti.
    return "\u0000" + stem + `l${A2}r${I2}` + possCaseTail(rc, A2, I2);
  }
  // vowel: "kadrolar" + ek (lAr'a göre yeniden uyumlanır)
  const A2 = A;
  const I2 = A2 === "a" ? "ı" : "i";
  let tail: string | null = null;
  const prc = rest === "" ? "none" : plainLabelCase(rest);
  if (prc) {
    tail = ({ none: "", loc: `d${A2}`, abl: `d${A2}n`, locki: `d${A2}ki`, acc: I2, dat: A2, gen: `${I2}n`, ins: `l${A2}` })[prc];
  } else if (/^[ıiuü]/.test(rest)) {
    const rc = possRestCase(rest.slice(1));
    tail = rc ? I2 + possCaseTail(rc, A2, I2) : null;
  }
  return tail === null ? null : `l${A2}r${tail}`;
}

export function stripFieldLabelTokens(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  let t = text;
  for (const [re, rep] of FIELD_LABEL_REWRITES) {
    t = t.replace(re, (_m: string, apos?: string, suf?: string) => {
      if (lang === "en") return rep.en + (apos && suf ? apos + suf : "");
      if (!apos || !suf) return rep.tr;
      const h = harmonizeLabelSuffix(rep.tr, rep.kind, suf);
      // "\u0000" = çoğulda gövde de değişti → tam biçim (ör. "ölüm yerlerini").
      if (h !== null) return h.startsWith("\u0000") ? h.slice(1) : rep.tr + h;
      // Tanınmayan ek: poss/vowel → yalnız kesme düşer; loan → Türkçe kesme kuralı.
      return rep.kind === "loan" ? rep.tr + apos + suf : rep.tr + suf;
    });
  }
  if (t !== text) {
    // İkame cümle başına düştüyse baş harfi büyüt ("DeathTiming erken" →
    // "Ölüm zamanlaması erken") — stripMetaTerms'teki desenin eşi.
    t = t.replace(/(^|[.!?]\s+)([a-zçğıöşü])/g, (_m, p: string, c: string) =>
      p + (lang === "tr" ? c.toLocaleUpperCase("tr") : c.toUpperCase()));
  }
  return t;
}

/**
 * Sistem-içi meta-dili (OCR/kayıt/sistemde/tespit edildi/veride...) koç
 * metninden cerrahi olarak ayıklar (canli-test #10 kalite dalgasi, 2026-08-05).
 * Bilgilendirici kısım KORUNUR; metin tümüyle meta ise "" döner — dizi
 * alanlarında (enemyAnalysis) çağıran taraf boş elemanı atmalıdır.
 * DEĞİŞİKLİK OLMADIYSA metin bayt-aynı döner (meşru cümleye dokunulmaz).
 * cleanCoachText'in TR dalının İLK halkası → cleanCoachText kullanan TÜM
 * route'lar (vision/report/feedback/insight/ask) otomatik kapsanır.
 */
export function stripMetaTerms(text: string): string {
  if (!text) return text;
  let t = text;
  // SIRA ÖNEMLİ: önce yan-cümle/cümle cerrahisi (bağlam bütünken), sonra
  // öbek-söküm, en sonda çıplak-OCR backstop'u. Ters sıra F4'te ayracı
  // marker'sız bırakıp gereksiz "katil Phoenix" kuyruğu üretiyordu.
  t = t.replace(TR_META_CLAUSE_RE, "");
  t = t.replace(TR_META_SENTENCE_RE, "$1");
  t = t.replace(TR_OLARAK_META_RE, "");
  t = t.replace(TR_OCR_ADVERB_RE, "");
  // ── B4 TUTANAK DİLİ (TR-KALAN-04) — SIRA KİLİDİ ─────────────────────────────
  // MISSING_DATA, KATIL_BILGISI'nden ÖNCE: aksi hâlde "katil bilgisi yok" önce
  // "katil yok"a iner ve veri-yokluğu deseni ("bilgi(si) yok" şart) onu ARTIK
  // göremez (canlı korpusta 3 kayıt "…; katil yok." diye bozuk çıkıyordu).
  // TAM-METİN GUARD'I: eşleşme metnin TAMAMI ise silinmez — tek cümlelik "Bu
  // round'da öldüren bilgi yok." BİLEREK dokunulmaz (dedektör işaretler).
  // VİRGÜL-LİSTE KALKANI (B01 korpus ölçümü, plandan SAPMA): virgülle başlayan
  // eşleşme yalnız virgülden ÖNCEKİ kısım çekimli bir yüklemle bitiyorsa silinir.
  // Aksi hâlde virgül bir LİSTE ayırıcısıdır ve silme cümleyi kırar — ölçülen
  // gerçek vaka (cycleab-luna-none M0-R0): "Bu round düşman öldürmesi, ölüm yeri
  // veya silah bilgisi yok." → "Bu round düşman öldürmesi." (anlamsız). Kalkanla
  // bayt-aynı kalır; "…kimse seni öldürmedi, dolayısıyla katil bilgisi yok." yine
  // temizlenir (önek "öldürmedi" ile bitiyor).
  t = t.replace(TR_MISSING_DATA_CLAUSE_RE,
    (m: string, lead: string, pre: string, term: string | undefined, off: number, full: string) => {
      if (off === 0 && m.trim().length >= full.trim().replace(/[.!?]+$/, "").length) return m;
      if (TR_MISSING_PREFIX_CONJ_RE.test(pre)) return m;
      if (/^\s*,/.test(m) && !TR_FINITE_VERB_END_RE.test(full.slice(0, off))) return m;
      // Cümle BAŞINDAKİ eşleşme terminatörüyle birlikte gider (öksüz "." kalmaz);
      // ayraçla başlayan eşleşmede terminatör ÖNCEKİ yan-cümlenindir → geri yazılır.
      if (!lead) return "";
      return term ? term.replace(/^\s+/, "") : "";
    });
  t = t.replace(TR_KATIL_BILGISI_RE, "katil ");
  t = t.replace(TR_ONAY_CLAUSE_RE, (m: string) => {
    if (!TR_ONAY_META_SUBJ_RE.test(m) && !TR_ONAY_DATA_VERB_POS_RE.test(m)) return m;
    const bare = m.replace(TR_ONAY_VERB_TAIL_RE, "");
    return TR_ONAY_ROLE_NAME_RE.test(bare) ? bare : "";
  });
  t = t.replace(TR_ONAY_ORTAC_RE, "");
  // OLUM_GERCEKLESTI, ROL_OLARAK_KAYIT'TAN ÖNCE: "…; katil olarak Raze var ve
  // ölüm A Site'te gerçekleşti." cümlesinde " ve " ayracı önce tüketilirse kuyruk
  // deseni bir daha eşleşmez. Konum yalnız metinde ZATEN geçiyorsa silinir.
  t = t.replace(TR_OLUM_GERCEKLESTI_RE, (m: string, loc: string, off: number, full: string) =>
    mentionedBefore(full.slice(0, off), loc) ? "" : m);
  t = t.replace(TR_ROL_OLARAK_KAYIT_RE,
    (m: string, ad: string, ve: string | undefined, off: number, full: string) => {
      if (!ve) return `katil ${ad}`;
      // " ve " + KENDİ ÖZNESİ olan yan-cümle → virgül-splice üretme, cümleyi böl
      // ("Katil olarak Jett var ve sen açıkta kaldın." → "Katil Jett. Sen …").
      // Öznesiz devamda ADI ÖZNE yap: etiket tümden kalkar, düz eylem cümlesi kalır
      // ("Katil olarak Miks var ve Classic'le … aldı." → "Miks Classic'le … aldı.").
      const rest = full.slice(off + m.length);
      return TR_SUBJ_PRONOUN_RE.test(rest) ? `katil ${ad}. ` : `${ad} `;
    });
  t = t.replace(TR_ROL_NET_OLARAK_RE, (_m: string, ad: string) => `katil ${ad}`);
  // Kuyruk EN SONDA (meta ekleri söküldükten sonra görsün); yalnız TEKRAR silinir.
  t = t.replace(TR_ROL_TAIL_RE,
    (m: string, ad: string, silah: string | undefined, off: number, full: string) =>
      factsMentionedBefore(full.slice(0, off), ad, silah) ? "" : m);
  t = t.replace(TR_ROL_ETIKET_RE, (_m: string, rol: string, mod?: string) =>
    (mod ? rol + mod : rol) + " ");
  t = t.replace(TR_VERI_SETI_RE, "");
  t = t.replace(TR_GORE_PREFIX_RE, "");
  t = t.replace(TR_TESPIT_PARTICIPLE_RE, "$1 net");
  t = t.replace(TR_TESPIT_FALLBACK_RE, " var");
  t = t.replace(TR_LEFTOVER_META_RE, "");
  t = t.replace(TR_OCR_BARE_RE, "");
  // EN aynası (canli-test #11): sıra önemli — önce "was reported as" (kopula
  // korunur), sonra cümle-sonu ", as reported" kuyruğu.
  t = t.replace(EN_REPORTED_AS_RE, "$1");
  t = t.replace(EN_AS_REPORTED_RE, "");
  if (t !== text) {
    // Söküm artıkları: sarkan virgül/ayraç, çift boşluk, öksüz noktalama.
    t = t.replace(/\s*,\s*(?=[.!?;])/g, "");
    t = t.replace(/\s*;\s*(?=[.!?])/g, "");
    t = t.replace(/(^|[.!?]\s+)[,;:]\s*/g, "$1");
    t = t.replace(/\s+([.,;!?])/g, "$1");
    t = t.replace(/\.{2,}/g, ".");
    // Metin başında öksüz terminatör ASLA kalmaz (savunma katmanı; kök yukarıdaki
    // MISSING_DATA replacer'ında — koç metni "." / "!" ile başlayamaz).
    t = t.replace(/^[\s.!?]+/, "");
    t = t.replace(/\s{2,}/g, " ").trim();
    // Yalnız noktalama kaldıysa eleman tümüyle meta idi → boş dön (çağıran atar).
    if (/^[\s.,;:!?—-]*$/.test(t)) return "";
    // Söküm cümle başını açıkta bırakabilir → TR-duyarlı yeniden büyütme
    // (toLocaleUpperCase("tr"): i→İ doğru; stripEnHedges'teki desenin TR eşi).
    t = t.replace(/(^|[.!?]\s+)([a-zçğıöşü])/g, (_m, p: string, c: string) => p + c.toLocaleUpperCase("tr"));
  }
  return t;
}

/**
 * META-TERİM DEDEKTÖRÜ — ölçüm tarafının kaynağı (canli-test #10, 2026-08-05).
 * stripMetaTerms'ün CERRAHİ desenlerinden BİLEREK daha GENİŞ: süzgecin kaçırdığı
 * her varyantı ölçüm yakalasın diye çıplak işaretleyici bazlı tarar (bu gece
 * ölçüm korpusu bu sınıfı hiç yakalamamıştı — scripts/eval-score.ts buradan
 * import eder, kopya liste tutulmaz). Temiz koç metninde 0 dönmesi beklenir.
 */
export function findMetaTermHits(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  const detectors: RegExp[] = [
    /(?<![\p{L}\p{N}])ocr(?![\p{L}\p{N}])/giu,
    /(?<![a-zçğıöşü])kayıt(?:ta|lı|larda|lara göre)(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])kayda geçti(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])sistem(?:de|e göre)(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])tespit edildi(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])veri(?:de|lerde|ye göre|lere göre)(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])telemetri[a-zçğıöşü]*/giu,
    /(?<![a-zçğıöşü])bilgisi\s+[\p{L}'’-]+\s+olarak\s+(?:var|kayıtlı|kesin|geçiyor)(?![a-zçğıöşü])/giu,
    // 'raporlan-' ailesi (canli-test #11, 2026-08-05): süzgeçle eş-genişlikte
    // ölçüm. DAR: 'raporlan' gövdesi + edilgen 'rapor edil-' + 'rapor(lar)a
    // göre' — ürün terimleri ("maç raporu", "raporunda", "rapor oluştur")
    // EŞLEŞMEZ (l-şartı / -a-göre şartı sağlanmaz).
    /(?<![a-zçğıöşü])raporlan[a-zçğıöşü]*/giu,
    /(?<![a-zçğıöşü])rapor\s+edil[a-zçğıöşü]*/giu,
    /(?<![a-zçğıöşü])rapor(?:lar)?a\s+göre(?![a-zçğıöşü])/giu,
    // Ölüm-tipi kod-adları (canlı-test #14 — süzgeçle eş-genişlik kuralı):
    // gözlenen varyant ailesi + tam tireli slug'lar (stripDeathTypeTokens listesi).
    /\bover[-\s]?peek[-\s]advantage\b/giu,
    /\bdef[-–][\p{L}]{1,12}[-–]hold\b/giu,
    /\b(?:repeat-angle|op-angle|pistol-round|eco-force-loss|entry-no-trade|entry-traded|post-plant-solo|retake-no-util|retake-advantage-thrown|numbers-down-carry|crosshair-loss|timing-window|late-no-plant|late-def-no-plant|full-buy-first-contact|op-loss|low-hp-no-save|clutch-lost|ult-in-pocket|lurk-caught|loss-streak|win-streak-comfort|overtime-matchpoint|def-no-crossfire|info-less-push)\b/giu,
    // B4 TUTANAK DİLİ (TR-KALAN-04) — süzgeçle eş-genişlik + biraz daha geniş
    // (tek-cümlelik "… bilgi yok" ve korunan "ölüm X'te gerçekleşti" biçimleri
    // silinmez ama ölçümde görünür). TÜM desenlerde /g ZORUNLU: aşağıdaki
    // while(re.exec()) döngüsü global olmayan regex'te SONSUZ döner (doğrulayıcı
    // ölçümü: "Katil: Miks…" girdisinde node heap OOM ile ölüyordu).
    /\s+olarak\s+(?:kaydedil(?:di|miş)|doğrulan(?:dı|mış|an)|teyit\s+edil(?:di|miş)|onaylan(?:dı|mış)|belirlen(?:di|miş))(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])(?:[kK]atil|[öÖ]ldüren)(?:\s+(?:ajan|bilgisi|kişi|oyuncu|düşman))?\s+olarak\s+[\p{Lu}][\p{L}]{1,14}\s+(?:var|kayıtlı|kayıtta|kayıtlarda|geçiyor|görünüyor|mevcut|kaydedildi|doğrulandı|doğrulanmış|belirlendi)(?![a-zçğıöşü])/gu,
    /(?<![a-zçğıöşü])(?:katil|öldüren)(?:\s+(?:ajan|bilgisi|kişi|oyuncu|düşman))?\s+(?:net|kesin)\s+olarak(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])katil(?:in)?\s+bilgisi['’]/giu,
    /(?<![a-zçğıöşü])veri\s+set(?:inden|inde|iyle|imiz|ini|ine|in|i)(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])(?:doğrulan(?:mış|dı)|teyit\s+edil(?:di|miş)|onaylan(?:mış|dı))(?=\s*[;,.!?]|$)/giu,
    /^(?:katil|öldüren)(?:\s+(?:ajan|bilgisi))?\s*:\s/giu,
    /(?<![a-zçğıöşü])(?:öldüren|katil|ölüm\s+yeri)[^.,;:!?\n]{0,30}bilgi(?:si)?\s+(?:gelmedi|yok|eksik|alınamadı|okunamadı|bulunamadı)(?![a-zçğıöşü])/giu,
    /(?<![a-zçğıöşü])ölüm(?:ün|ü)?\s+[^.;:!?\n]{0,40}gerçekleşti(?![a-zçğıöşü])/giu,
    // EN aynası — "reported as" / "as reported" (koç metninde meşru kullanımı yok).
    /\breported\s+as\b/gi,
    /\bas\s+reported\b/gi,
  ];
  for (const re of detectors) {
    // DÖNGÜ SAVUNMASI (derinlik): ileride bir desende /g unutulursa süreç ölmesin;
    // sıfır-genişlikli eşleşme de lastIndex'i ilerletir.
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      hits.push(m[0]);
      if (!re.global) break;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERİLEN-CALLOUT KORUYUCU (S5, canli-test #10 kalite dalgasi, 2026-08-05)
//
// SORUN (log-kanıtlı, düşük): model verilen callout'u AYNI cevapta bozabiliyor —
// deathLocation="a lamps" verildi; cevapta önce "A Lamps'ta" doğru, sonra aynı
// cümlede "Lambs gibi" bozuk çıktı. Bu, OCR gerçeğinin sessizce çarpıtılmasıdır
// (OCR-only sözleşmesi ihlali).
// KAPSAM BİLEREK ÇOK DAR (yanlış-pozitif = yeni regresyon):
//   - yalnız TEK KELİMELİK, BAŞ HARFİ BÜYÜK token'lar (koç metninde callout'lar
//     Title-Case; küçük harfli meşru sözcükler — "lamba" — böylece korunur);
//   - edit-mesafesi 1-2 + aynı baş harf + token ≥4 harf;
//   - ajan/silah/harita adları DOKUNULMAZ (yakın-mesafe tuzağı: "Ares"↔"apps"
//     d=2, "Haven"↔"heaven" d=1 — korumasız versiyonda gerçek ad bozulurdu);
//   - callout'un bitişik-ekli hâli ("Sitede" = site+de) startsWith ile atlanır.
// Route bağlantısı ana oturumda (vision route supplied değeri verir); burada
// yalnız saf fonksiyon export edilir.
// ─────────────────────────────────────────────────────────────────────────────

// Harita adları — CLEAN_AGENT_NAMES/CLEAN_WEAPON_NAMES ile aynı koruma disiplini.
// map-callouts.ts'ten import EDİLMEDİ: bu dosya app/page.tsx ("use client")
// tarafından da bağlanıyor; callout tablosunu landing bundle'ına sokma riski
// (dosya başındaki reality-checker gerekçesinin aynısı). 12 sabit isim yeterli.
const PROTECTED_MAP_NAMES = [
  "ascent", "bind", "haven", "split", "icebox", "breeze",
  "fracture", "pearl", "lotus", "sunset", "abyss", "corrode",
  // Koç-alanı terimleri (B1 sınır savunması, 2026-09-16): callout-düzeltici
  // (enforceSuppliedCallout, :886) bunları GERÇEK callout'a çevirmemeli.
  // Mekanizma bu denetimde doğrulandı — :907 d≤2 Levenshtein:
  //   plant↔plaza=2 → supplied "a plaza" + "Plant sonrası…" → "Plaza sonrası…"
  //   plant↔point=2 → supplied "b point"                   → "Point sonrası…"
  //   post ↔plat =2 → supplied "plat" (Haven) + "Post-plant'te…" → "Plat-plant'te…"
  // Bu sınıf BUGÜN de var (korpusta cümle başı "Plant " ile başlayan final'ler);
  // B1 nötrlemesi "plant sonrası"/"post-plant'te" ürettiği için frekansı artırır
  // → kök fixle AYNI commit'te gitmeli. Yalnız ENGELLER, yeni ikame üretmez.
  "plant", "post", "spike",
];

/** Sınırlı Levenshtein — |len farkı| > max ise erken çık (max+1 döner). */
function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[a.length];
}

/**
 * Cevap metnindeki, VERİLEN callout'a çok yakın bozuk varyantları ("Lambs")
 * orijinal görünümle ("Lamps") değiştirir. supplied = OCR'dan gelen ham
 * deathLocation (ör. "a lamps"); yoksa/boşsa metin bayt-aynı döner.
 * Yalnız düzeltir, asla metin üretmez; başka kelimeye DOKUNMAZ.
 */
export function enforceSuppliedCallout(text: string, supplied: string | null | undefined): string {
  if (!text || !supplied) return text;
  const lowerTr = (s: string) => s.toLocaleLowerCase("tr");
  // "a lamps" → ["lamps"]: tek harfli site önekleri (a/b/c) ve kısa token'lar
  // (<4 harf) atlanır — kısa kelimede d≤2 neredeyse her şeyi eşler (tuzak).
  const words = supplied.trim().split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w.length >= 4);
  if (!words.length) return text;
  const protectedNames = new Set(
    [...CLEAN_AGENT_NAMES, ...CLEAN_WEAPON_NAMES, ...PROTECTED_MAP_NAMES].map(lowerTr),
  );
  return text.replace(/[A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü]+/g, (tok) => {
    if (tok.length < 4) return tok;
    const lt = lowerTr(tok);
    if (protectedNames.has(lt)) return tok;                // ajan/silah/harita adı — asla
    for (const w of words) {
      const lw = lowerTr(w);
      if (lt === lw) return tok;                           // zaten doğru — dokunma
      if (lt[0] !== lw[0]) continue;                       // aynı baş harf şartı
      if (lt.startsWith(lw)) continue;                     // callout+bitişik ek ("Sitede") — dokunma
      const d = editDistance(lt, lw);
      if (d >= 1 && d <= 2) {
        // Orijinal görünüm: supplied kelime Title-Case'e çekilir (token zaten
        // büyük harfle başlıyordu — regex bunu garanti eder).
        return w[0].toLocaleUpperCase("tr") + w.slice(1);
      }
    }
    return tok;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AJAN-ADI KİLİDİ (TR-KALAN-09, 2026-09-23)
//
// SORUN (replay kanıtlı): gpt-5-mini Türkçe cümle içinde nadir ajan adını HARF
// düzeyinde bozuyor — skye-i "Rejyna hattı", skye-b "Reına varsa…"/"Reğu varsa…",
// cyclereal-r3d3 M1-R2 "Cyclpher/Killjoy". 947 raw örnekte Reyna 3/73 bozuk; girdi
// enemyComp doğru, KB'de bozuk varyant 0 → kaynak MODEL. Zincirdeki bütün ad-bazlı
// korumalar (katil-guard, casing, protectedNames) TAM yazıma bağlı: bozuk ad hepsini
// atlatıyor ve katil bilinmezken bile "Rejyna seni vurdu" iddiası kullanıcıya gidiyor
// (HEAD: "Reyna seni vurdu" nötrleniyor, "Rejyna seni vurdu" DEĞİŞMEDEN geçiyor).
// ÇÖZÜM: realityCheck'ten ÖNCE ad kanonikleştirilir; katil-guard kanonik adı görür.
//   (a) Bilinen bozulma tablosu — roster'dan bağımsız (Reğu d=3, Reay/Cyclpher d=2:
//       yalnız tablo yakalar). MAP, object literal DEĞİL ("constructor" tuzağı).
//   (b) Roster-çapalı bulanık eşleme, çok dar: çapa ≥5 harf (4 harfliler "Yorum→
//       Yoru", "Jetti→Jett" üretirdi), token büyük harfli ve ≥5 harf, ilk 2 harf
//       aynı, düzeltme mesafesi TAM 1, korumalı ad ya da dur-listesi değil
//       ("Close/Clone/Astral" ↔ Clove/Astra d=1).
// Yalnız DÜZELTİR, asla metin üretmez; eşleşme yoksa metin bayt-aynı döner.
// Route bağlantısı B03'te (vision, realityCheck'ten önce); burada saf fonksiyon.
// ─────────────────────────────────────────────────────────────────────────────
const KNOWN_AGENT_GARBLES = new Map<string, string>([
  ["reına", "Reyna"],
  ["rejyna", "Reyna"],
  ["reğu", "Reyna"],
  ["reay", "Reyna"],
  ["cyclpher", "Cypher"],
]);
const AGENT_FUZZY_STOP = new Set(["close", "astral", "clone"]);

/**
 * Metindeki bozuk ajan adlarını kanonik yazıma çevirir. anchors = bu round'un
 * gerçek ajanları (katil + rakip kadro + oyuncunun ajanı); yalnız tanınan ajan
 * adları çapa olur. Ek korunur ("Reına'ya" → "Reyna'ya"). Değişiklik yoksa
 * metin bayt-aynı döner. Her düzeltme loglanır.
 */
export function enforceAgentNames(text: string, anchors: ReadonlyArray<string | null | undefined> = []): string {
  if (!text) return text;
  const lowerTr = (s: string) => s.toLocaleLowerCase("tr");
  const canonByLower = new Map(CLEAN_AGENT_NAMES.map((a) => [lowerTr(a), a] as const));
  const fuzzyAnchors = [...new Set(
    anchors
      .map((a) => (typeof a === "string" ? canonByLower.get(lowerTr(a.trim())) : undefined))
      .filter((a): a is string => !!a && /^\p{L}{5,}$/u.test(a)),
  )];
  const protectedNames = new Set(
    [...CLEAN_AGENT_NAMES, ...CLEAN_WEAPON_NAMES, ...PROTECTED_MAP_NAMES].map(lowerTr),
  );
  // EK KORUMASI (B01 inceleme): token çapayla BAŞLIYORSA (çapa + kesmesiz Türkçe
  // ek: "Viperı", "Chambere", "Breachi") bozulma değil ektir — mesafe-1 eşleşmesi
  // eki silip nesneyi özneye çeviriyordu ("Viperı gördün." → "Viper gördün.").
  // Yalnız iç harf bozulması (eşit uzunlukta yer değiştirme / eksik harf) düzeltilir.
  return text.replace(/(?<![\p{L}\p{N}])\p{L}+/gu, (tok) => {
    const lt = lowerTr(tok);
    const known = KNOWN_AGENT_GARBLES.get(lt);
    if (known) {
      console.log(`[Aimlo AI] agent-name fix: ${tok}→${known}`);
      return known;
    }
    if (tok.length < 5 || !/^\p{Lu}/u.test(tok)) return tok;
    if (protectedNames.has(lt) || AGENT_FUZZY_STOP.has(lt)) return tok;
    for (const a of fuzzyAnchors) {
      const la = lowerTr(a);
      if (lt.slice(0, 2) !== la.slice(0, 2)) continue;
      if (lt.startsWith(la)) continue;
      if (editDistance(lt, la, 1) === 1) {
        console.log(`[Aimlo AI] agent-name fix: ${tok}→${a}`);
        return a;
      }
    }
    return tok;
  });
}

/**
 * Türkçe lokatif ek seçici (beta cilası 2026-07-09): "X'da/de/ta/te" eklerini
 * sabit kodlamak ünlü uyumunu bozuyordu ("Ascent'da" ✗ → "Ascent'te" ✓).
 * Kural: son ünlü kalın (a/ı/o/u) → -da, ince (e/i/ö/ü) → -de; son harf sert
 * ünsüzse (f s t k ç ş h p + İngilizce x) d→t. İngilizce okunuşu yazılıştan
 * sapan bilinen Valorant terimleri istisna tablosunda ("Bind" → baynd → 'da).
 * Apostroflu biçim korunur — improvement-plan previousPlan eşleştirmesi
 * split("'") kullanıyor, biçim değişmemeli.
 */
const TR_LOCATIVE_EXCEPTIONS: Record<string, string> = {
  bind: "da", icebox: "ta", abyss: "te", site: "ta", showers: "ta",
  hookah: "da", pearl: "de", corrode: "da", fracture: "da", haven: "da",
  cave: "de", garage: "da", spike: "ta",
};

// ── TANI-ETİKETİ + KB-BAŞLIĞI SOYUCU (TR-KALAN-07 sınır savunması, 2026-09-23) ──
// KANIT: HEAD replay'de 91 TR senaryonun 12 deathAnalysis'i rapor etiketiyle
// başlıyor ("En kritik neden:", "Kök neden:", M1-R3b "En kritik kök: okunabilirlik
// sızıntısı —"); raw==final → süzgeç BİREBİR geçiriyor. KÖK PROMPT'ta
// (route.ts [AÇILIŞ] "(a) en kritik KÖK neden", ai-policy OUTPUT_FOCUS_RULE_VISION),
// o düzeltme B09'da. Burası SINIR SAVUNMASI; zincire bağlama B03'te (yalnız
// deathAnalysis). DAR: yalnız metnin BAŞINDA ve İKİ NOKTA ile; cümle içi meşru
// "round'un en kritik anı" DOKUNULMAZ.
// [iİ] SINIFI ZORUNLU: /u bayrağında "İ" (U+0130) basit case-fold'la "i"ye inmez
// → "EN KRİTİK" ve "İlk temas hatası:" düz /i ile kaçıyordu (Türkçe-İ tuzağı).
const TR_DIAG_LABEL_RE =
  /^\s*(?:en\s+kr[iİ]t[iİ]k(?:\s+(?:kök|temel|asıl|ana))?(?:\s*(?:neden|sebep|sorun|hata|kök|nokta))?|(?:kök|temel|asıl|ana)\s+(?:neden|sebep|sorun|hata))\s*:\s*/iu;
// AÇIK SINIF AYRI ve KAPALI ADLI (B01 inceleme): "<1-3 sözcük> hatası/sorunu:"
// biçimi büyük/küçük harf duyarsız ve içeriksizdi → "A Site sorunu: …" (KONUM) ve
// "Takım arkadaşının hatası: …" (ATIF) etiketlerini silip bilgi düşürüyordu. Artık:
// ilk sözcük dışında büyük harf YOK ("A Site", callout'lar), tek harfli sözcük YOK
// (site harfi), tamlayan ekli sözcük YOK ("arkadaşının", "takımın") ve öbek KAPALI
// listeden bir teşhis adı içermeli. Korpusta açık sınıfın tek eşleşmesi "Açı tutma
// hatası:" (+ test [17] "İlk temas hatası:") — ikisi de bu kapıdan geçer.
const TR_DIAG_OPEN_LABEL_RE =
  /^\s*([\p{L}]{2,}(?:\s+[a-zçğıöşüâîû]{2,}){0,2})\s+(?:hatası|sorunu|nedeni|sebebi)\s*:\s*/u;
const TR_DIAG_NOUN_RE =
  /^(?:açı|pozisyon|konum|crosshair|nişan|zamanlama|timing|temas|trade|rotasyon|ekonomi|peek|karar|aim|util|yetenek|iletişim|okuma|tempo|giriş|mesafe|hareket|spray|tutma|tutuş)/u;
function trOpenDiagLabelLen(text: string): number {
  const m = TR_DIAG_OPEN_LABEL_RE.exec(text);
  if (!m) return 0;
  const words = m[1].split(/\s+/).map((w) => w.toLocaleLowerCase("tr"));
  if (words.some((w) => /(?:n[ıiuü]n|[ıiuü]n)$/u.test(w) && w.length > 4)) return 0;   // tamlayan eki (atıf)
  if (!words.some((w) => TR_DIAG_NOUN_RE.test(w))) return 0;
  return m[0].length;
}
// KB BÖLÜM BAŞLIĞI — KAPALI LİSTE (death-type kbBlock başlıkları + korpusta
// gözlenen parafrazlar). AÇIK SINIF KULLANILMADI: "(…){2,34}(kaybı|hatası)—"
// biçimi "En kritik neden: erken peek yüzünden tempo kaybı — takım geride
// kaldı." cümlesinde meşru yan-cümleyi siliyordu (doğrulayıcı ölçümü).
const TR_KB_HEADING_FRAG_RE =
  /^(?:okunabilirlik(?:\s+ve\s+bilgi)?\s+sızıntısı|bilgi\s+sızıntısı|(?:crosshair|nişangâh|nişan)\s+kaybı|(?:pozisyon\s+ve\s+açı|aim\s+ve\s+crosshair|karar\s+ve\s+ekonomi|erken\s+round|zamanlama|post-plant|retake|lurk)\s+ölümleri|avantaj\s+yönetimi|takım\s+koordinasyonu)\s*[—–]\s*/iu;
// EN aynası. Çıplak tire ancak ÖNÜNDE BOŞLUK varsa ayraç: "Core problem-solving
// becomes easier" → "Solving becomes easier" olmasın.
const EN_DIAG_LABEL_RE =
  /^\s*(?:the\s+)?(?:most\s+critical|root|main|core|biggest|key)\s+(?:root\s+)?(?:cause|reason|issue|problem|mistake|factor)(?:\s*:|\s+[—–-])\s*/i;

/**
 * Metnin BAŞINDAKİ tanı-etiketini ("En kritik neden:", "Root cause:") ve onu
 * izleyen KB bölüm-başlığı parçasını ayıklar, baş harfi dile göre büyütür.
 * CÜMLE-KORUMA: soyma sonrası 12 karakterden kısa kalan metin DEĞİŞTİRİLMEZ
 * (kurtarma yolu). Eşleşme yoksa metin BAYT-AYNI döner.
 */
export function stripDiagnosisLabel(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  const labelRe = lang === "en" ? EN_DIAG_LABEL_RE : TR_DIAG_LABEL_RE;
  let t = text.replace(labelRe, "");
  if (t === text && lang === "tr") {
    const n = trOpenDiagLabelLen(text);
    if (n > 0) t = text.slice(n);
  }
  if (t === text) return text;
  if (lang === "tr") t = t.replace(TR_KB_HEADING_FRAG_RE, "");
  t = t.trimStart();
  if (t.length < 12) return text;
  return t.replace(/^([a-zçğıöşüâîû])/u, (c) =>
    (lang === "tr" ? c.toLocaleUpperCase("tr") : c.toUpperCase()));
}

export function trLocative(word: string): string {
  const w = (word || "").trim();
  if (!w) return w;
  // SAYI SONLU (TR-KALAN-27): ek sayının OKUNUŞUNA uyar (üç→3'te, altı→6'da,
  // kırk→40'ta). Eski harf-ünlü yolu rakamda ünlü bulamayıp hep "'de" veriyordu
  // (3'de/6'de/40'de). Bugünkü çağıranlar callout/harita adı verdiği için canlı
  // etkisi yoktu; gizli tuzak kapatıldı. Callout yolu aşağıda AYNEN.
  const num = /(\d+)$/.exec(w);
  if (num) return w.slice(0, w.length - num[1].length) + trNumberLocative(num[1]);
  const last = w.split(/\s+/).pop()!.toLowerCase();
  const exc = TR_LOCATIVE_EXCEPTIONS[last];
  if (exc) return `${w}'${exc}`;
  const vowels = last.match(/[aıouâûeiöüî]/g);
  const back = vowels ? /[aıouâû]/.test(vowels[vowels.length - 1]) : false;
  const hard = /[fstkçşhpx]$/.test(last);
  return `${w}'${hard ? "t" : "d"}${back ? "a" : "e"}`;
}

/**
 * Deterministic coach-voice cleaner. string → string.
 * - stripNumericHp: numeric HP claims → qualitative bucket (both langs)
 * - plainifyAbilities: ability codenames → plain Silver term (both langs)
 * - agent-name casing fix (phoenix → Phoenix, both langs)
 * - TR only: TR_JARGON tarzanca→koç-Türkçesi + apostrophe fix
 * Never invents text — only rewrites banned patterns with synonyms.
 */
/**
 * HP SÜZGECİ ARTIĞI ONARIMI (W1 followup #50 / W2 inceleme RW1-F1, 2026-09-24).
 * KANIT (probe, HEAD 8afefe8): HP'den İBARET bir cümle silinince terminatörü geride
 * kalıyordu: "41 HP ile. Açıyı tut." → ". Açıyı tut."; "Açıyı tut. 41 HP ile." →
 * "Açıyı tut.."; "Low HP. Hold the angle." → ". Hold the angle."; "41 HP ile, açıyı
 * tut." → ", açıyı tut.". NR kurtarma yolu (lib/vision-postprocess.ts) bu artığı
 * overlay plan satırına taşıyabiliyordu (". Savunma B Site …").
 * KÖK: stripNumericHp/stripHpClaims yalnız İFADEYİ siler (cümle korunur — doğru);
 * ifade cümlenin TAMAMIYSA geride içeriksiz "cümle" (yalnız terminatör/ayraç) kalır.
 * KAPSAM DAR: yalnız HP süzgeci metni DEĞİŞTİRDİYSE çağrılır (çağıran kapısı) ve
 * yalnız İÇERİKSİZ cümle artığına dokunur:
 *   · iki terminatör arasında yalnız boşluk ("bekliyor. . Açıyı") → tek terminatör;
 *   · metin başında öksüz terminatör/ayraç (". Açıyı", ", açıyı") → düşer;
 *   · cümle başında öksüz ayraç ("Bekle. , açıyı") → düşer, harf büyür (TR i→İ).
 * Bitişik "?!"/"..." gibi meşru noktalamaya DOKUNMAZ (arada boşluk şartı).
 * Ölçüm: scripts/eval-out 3916 tekil ham alanda HP süzgeci 59 alanı değiştiriyor;
 * bunların HİÇBİRİNDE artık üretmiyor → korpus çıktısı bayt-aynı (0 fark).
 * Sahte metin YOK: yalnız artık noktalama silinir.
 */
function tidyHpStripResidue(t: string): string {
  return t
    .replace(/([.!?])[ \t]+[.!?]+(?=\s|$)/g, "$1")
    .replace(/^[\s.!?,;:]+/, "")
    .replace(/([.!?][ \t]+)[,;:][ \t]*(\S)/g, (_m, p: string, c: string) => p + c.toLocaleUpperCase("tr"));
}

export function cleanCoachText(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  // Sıra: sayısal HP → kova ifadesi (stripNumericHp) → kova dahil TÜM nitel
  // can iddiaları silinir (stripHpClaims, canlı-test #8) → ability düzlemesi.
  const hpStripped = stripHpClaims(stripNumericHp(text, lang), lang);
  let t = plainifyAbilities(hpStripped === text ? text : tidyHpStripResidue(hpStripped), lang);
  for (const a of CLEAN_AGENT_NAMES) {               // phoenix → Phoenix (both langs)
    t = t.replace(new RegExp("\\b" + a + "\\b", "gi"), a);
  }
  // SİLAH ADI NORMALİZASYONU (dil denetimi 2026-07-25): ajan adları normalize
  // ediliyordu ama silah adları edilmiyordu. Canlı çıktıda AYNI CÜMLEDE hem
  // "operator" hem "operatör" geçti — üstelik "operatör" Türkçede MAKİNE
  // OPERATÖRÜ demek, silah adı değil. Önce yanlış-çeviriyi düzelt, sonra
  // tüm silah adlarını tek biçime getir.
  // "operatör" + Türkçe ek → "Operator" + apostroflu doğru ek (ünlü uyumu: son ünlü
  // "o" kalın-yuvarlak → a/ı/u serisi). Ek eşlemesi açık tutulur; bilinmeyen ekte
  // yalnız gövde düzeltilir.
  t = t.replace(/\boperatör(e|ü|ün|le|den|de)?(?![a-zçğıöşü])/gi, (_m, ek) => {
    const map: Record<string, string> = { e: "'a", "ü": "'ı", "ün": "'ın", le: "'la", den: "'dan", de: "'da" };
    return "Operator" + (ek ? (map[ek.toLowerCase()] ?? "") : "");
  });
  for (const w of CLEAN_WEAPON_NAMES) {
    t = t.replace(new RegExp("\\b" + w + "\\b", "gi"), w);
  }
  // ÖLÜM-TİPİ KOD-ADI SÜZGECİ (canlı-test #14): dil-BAĞIMSIZ — slug'lar İngilizce
  // olduğundan TR dalındaki stripMetaTerms onları göremezdi; her iki dilde de
  // dil dallarından ÖNCE koşar (Kaan R7/R11/R23 sızıntı fixture'ları).
  t = stripDeathTypeTokens(t, lang);
  // KOMP ARKETİPİ KOD-ADI SÜZGECİ (W2 followup #70): aynı sınıf (İngilizce tireli slug,
  // dil-bağımsız), aynı sıra — TR meta süzgeci/TR_JARGON'dan ÖNCE.
  t = stripCompArchetypeTokens(t, lang);
  // VERİ-ETİKETİ SÜZGECİ (canlı-test #15 DC8): JSON alan adları ("ultReady")
  // koç cümlesine kopyalanıyordu — aynı dil-bağımsız sınıf, aynı sıra. Merkezi
  // katman olduğu için vision/report/feedback/insight yolları otomatik kapsanır.
  t = stripFieldLabelTokens(t, lang);
  if (lang === "tr") {
    // ── META-DİL SÜZGECİ (canli-test #10 kalite dalgasi, 2026-08-05) ───────
    // TR_JARGON'dan ÖNCE koşar: işaretleyiciler ("OCR'da", "telemetri...")
    // henüz bozulmamışken cerrahi yapılmalı — TR_JARGON'un telemetr→bilgi
    // dönüşümü marker'ı yok edip yan-cümle cerrahisini kör bırakırdı.
    // cleanCoachText merkezi katman olduğu için vision/report/feedback/
    // insight/ask çıktı yolları otomatik kapsanır (S1 kök kapama).
    t = stripMetaTerms(t);
    for (const [re, rep] of TR_JARGON) t = t.replace(re, rep);
    // 2. çoğul → 2. tekil (B25, 2026-07-31): TR_JARGON'dan SONRA — jargon
    // dönüşümleri de çoğul çekim üretebiliyor ("swing yapın" → "swing atın").
    t = singularizeTrImperatives(t);
    t = fixTurkishApostrophe(t);                     // duvar'i → duvarı (TR plain terms)
    // ── KIRIK-KELİME ARTIĞI GUARD'I (canlı-test #8, 2026-08-03) ────────────
    // softi'nin canlı çıktısı: "...retake'i planla: ğunda bir kişi defuse
    // hattını...". KÖK NEDEN BU DOSYADA DEĞİL, zincirin ÖNCEKİ halkasında:
    // lib/reality-checker.ts SPIKE_PATTERNS (`/\bspike\s*['’]?\s*(kuruldu|…)/gi`)
    // SAĞ SINIRSIZ olduğu için "spike kurulduğunda" içinden "spike kuruldu"yu
    // söküp "ğunda"yı bırakıyor. Birebir üretildi:
    //   "Retake'i planla: spike kurulduğunda bir kişi defuse hattını tut."
    //   → "Retake'i planla: ğunda bir kişi defuse hattını tut."   (canlı metnin AYNISI)
    // Kök fix reality-checker'ın sahibinde; burası SINIR SAVUNMASI (defense-in-
    // depth): hangi üst katman keserse kessin, kullanıcıya kırık kelime gitmez.
    // YANLIŞ-POZİTİF RİSKİ SIFIR: Türkçede HİÇBİR kelime "ğ" ile BAŞLAMAZ; token
    // "ğ" ile başlıyorsa kesinlikle bir ekin artığıdır ("ğunda", "ğinde").
    // Aynı gerekçe "ı" için GEÇERSİZ ("ışık/ılık/ısrar" var) → kapsam DAR tutuldu,
    // genel bir "kırık kelime onarıcısı" YAZILMADI (doğru metni bozma riski).
    // Artık SİLİNİR, cümlenin kalanı korunur → "planla: bir kişi defuse hattını tut."
    t = t.replace(/(^|[\s:;,—(])ğ[a-zçğıöşü]{1,8}(?![a-zçğıöşü])/gi, "$1");
  } else {
    // META-DİL SÜZGECİ — EN dalı bağlantısı (canlı-test #11, 2026-08-05):
    // E paketi EN desenlerini ('reported as', 'as reported', 'recorded as')
    // stripMetaTerms'e eklemişti ama zincirde yalnız TR dalı çağırıyordu —
    // EN çıktıda aynı sınıf sızıntı süzülmeden geçerdi. TR desenleri EN
    // metinde eşleşmez (zararsız), EN desenleri artık burada da çalışır.
    t = stripMetaTerms(t);
    // EN hedge neti (B84, 2026-07-31): TR'deki 3 katmanlı hedge korumasının
    // EN karşılığı — koç EN'de de KESİN konuşur.
    t = stripEnHedges(t);
  }
  // Cycle 3b: collapse an accidental adjacent duplicate of the SAME long word
  // ("utility'siz utility'siz tutma" → "utility'siz tutma"). ≥5 chars only, so
  // legitimate short reduplication ("tek tek", "yan yan") is untouched.
  t = t.replace(/\b([^\s]{5,})\s+\1\b/giu, "$1");
  // ── YAZIM TUTARLILIĞI (canlı eval 2026-08-01) ──────────────────────────────
  // 36 örneklik gerçek koşumda iki özensizlik kaldı; ikisi de deterministik:
  //  1) Kesme işareti: 281 kullanımın 279'u düz ('), 2'si eğri (’) çıktı
  //     ("Cypher’in"). Görsel tutarsızlık; ayrıca improvement-plan eşleştirmesi
  //     split("'") ile çalıştığı için düz biçim daha güvenilir. Tek yöne normalize.
  //  2) Eksik Türkçe harf: model "taret destegi" yazdı ("desteği" olmalı).
  //     Liste BİLEREK çok dar — yalnız diakritiksiz hâli BAŞKA bir Türkçe sözcük
  //     OLMAYAN kelimeler girer. ("acisi" GİRMEZ: "acısı"=ağrı ile karışır.)
  //     Canlı çıktıda yenisi görülürse buraya eklenir, genel bir "diakritik
  //     onarıcı" YAZILMAZ — o, doğru yazılmış kelimeleri bozma riski taşır.
  t = t.replace(/[’‘]/g, "'");
  t = t.replace(/(?<![a-zçğıöşü])deste(g)(i|in|e|imiz)(?![a-zçğıöşü])/gi,
    (_m, _g, suf: string) => "desteğ" + suf);
  // Strip a dangling clause separator left when the model started a 2nd clause
  // then stopped ("...aynı açıyı tutuyor;" → "...aynı açıyı tutuyor.").
  t = t.replace(/\s*;\s*$/, ".").replace(/\s+([.,!?])/g, "$1");
  t = t.replace(/\s{2,}/g, " ").trim();
  // METİN BAŞI BÜYÜK HARF (TR-KALAN-24, 2026-09-23): TR_JARGON ikameleri /gi ile
  // büyük harfli kaynağı küçük harfli karşılıkla değiştiriyor ("Roster'da Jett
  // var" → "kadrosunda Jett var", "Info al" → "bilgi al"). Tarihsel korpusta
  // raw'ların 1/3776'sı küçük harfle başlıyor, final'lerin 31'i → bozulmayı süzgeç
  // üretiyor. YALNIZ 0. konum (global DEĞİL — K5); TR'de tr-TR locale (i→İ).
  return t.replace(/^([a-zçğıöşü])/u, (c) => (lang === "tr" ? c.toLocaleUpperCase("tr") : c.toUpperCase()));
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

// ── CÜMLE-SINIRLI KAPAK (TR-KALAN-08 / B7, 2026-09-23) ──────────────────────────
// KANIT: enemyAnalysis[1] noktalamasız bitiyordu ("…böylece Yoru'nun tek", "…fake
// ataklarına", "…tek kişiyi izole") — replay-tr (85 senaryo) süzgeç kesiği 8 alan;
// scripts/eval-out 944 ham örnekte EA[1] noktasız final 49. Modern korpusta HAM
// model çıktısının 1900/1900 alanı noktalamayla bitiyor → kesen şey MODEL DEĞİL
// SÜZGEÇ: cleanCoachText slash'ı "/" → " ya da " (+6 kr) açıyor, realityCheck
// katil adını "bir düşman" ile değiştiriyor (r2-b süzülmüş hâli 212 kr) ve
// clampWords 180 KARAKTER kapağında yalnız kelime sınırına sarıp cümleyi ortadan
// kesiyor. clampWords AYNEN kalır (report/ask finalizeCoachText yolu bayt-aynı);
// vision bu sarmalayıcıyı kullanır.
// MONOTON SÖZLEŞME (doğrulayıcı V1; "guard'ın kendisi regresyon üretir" dersi):
//   • Kapısı clampWords'ünkiyle AYNI (s.length <= max) → kırpılmayan metin bayt-aynı.
//   • ASLA boş dönmez, ASLA madde düşürmez, ASLA kelime/nokta ÜRETMEZ.
//   • Sınır kümesi yalnız . ! ? … ; — –. VİRGÜL ve İKİ NOKTA sınır DEĞİL: "X değil,
//     Y kullan" yapısında yüklem Y'dedir; "…girmeden," ulaç yan-cümlesi ana cümle
//     ister (virgülden kesmek "…ilk temasta değil." gibi ters anlam üretiyordu).
//   • Rakamdan sonraki nokta ("aynı açıya 3. kez") ve kısaltma noktası (vb./vs./
//     örn./ör./sn./dk./etc./e.g./i.e.) cümle sonu DEĞİL — eski yama "…aynı açıya
//     3." üretiyordu; B03 inceleme: "…use utility first, e.g." ve "…öne sür (ör."
//     cümle sonu sanılıyordu.
//   • Solunda KAPANMAMIŞ "(" olan sınır cümle sonu DEĞİL (B03 inceleme): "(ör. Sova
//     oku…)" içindeki nokta kabul edilince çıktı açık parantezle bitiyordu.
//   • %65 koruma tabanı: son sınır clampWords çıktısının %65'inden azını
//     bırakıyorsa bilgi kaybı kesiklikten ağır → clampWords çıktısı döner
//     (koçluk emri kesik de olsa kalır). ; — – sınırında ayraç atılır, yerine nokta
//     KONMAZ; tam cümle sınırında noktalama (ve ardından gelen kapanış tırnağı/
//     parantezi) korunur.
//     NEDEN ";" SINIRINDA NOKTA YOK (cleanCoachText sarkan ";"i "." yapar — bilinçli
//     fark, B03 inceleme): kapağın çıktısı HER ZAMAN girdinin ÖNEKİDİR (sondaki
//     ayraç/bağlaç kırpması hariç); "uydurma yok" kanıtı bu önek değişmezidir
//     (scripts/test-pipeline-chain.ts "girdinin öneki" iddiaları). cleanCoachText'teki
//     kural modelin KENDİ bitirdiği sarkan ayraç içindir; burada ";" sonrasındaki
//     yan-cümle vardı ve kapak onu kesti. "—"/"–" sonrası da bağımsız cümle
//     garantisi taşımaz → üç ayraç tek kuralla (nokta eklemeden) ele alınır.
//   • Sınır yoksa/taban tutmazsa: clampWords çıktısından yalnız sarkan bağlaç
//     ("…bekle ve") atılır — iki dil aynı liste, \b YOK (Türkçe-\b tuzağı).
const SENTENCE_END_CHARS = ".!?…";
const CLAUSE_SEP_CHARS = ";—–";
const CLOSING_AFTER_END = "\"'”’)]";
const SENTENCE_FLOOR = 0.65;
const ABBREV_BEFORE_DOT_RE = /(?<![\p{L}\p{N}])(?:vb|vs|örn|ör|sn|dk|etc|e\.g|i\.e)$/iu;
/** Önekte kapanmamış "(" var mı? (sınır parantez İÇİNDE → cümle sonu değil) */
const hasUnclosedParen = (x: string): boolean => {
  let depth = 0;
  for (const ch of x) {
    if (ch === "(") depth++;
    else if (ch === ")" && depth > 0) depth--;
  }
  return depth > 0;
};
const DANGLING_CONNECTOR_RE =
  /\s+(?:ve|veya|ya\s+da|ama|ancak|fakat|çünkü|hem|and|or|but|so|then|because)$/iu;
const stripDanglingTail = (x: string): string =>
  x.replace(/[\s,;:—–-]+$/u, "").replace(DANGLING_CONNECTOR_RE, "").replace(/[\s,;:—–-]+$/u, "").trim();

/**
 * clampWords + cümle bütünlüğü (vision alanları). Kırpma yoksa girdinin KENDİSİ
 * döner; kırpma varsa son tam cümle / yan-cümle sınırına sarar (yukarıdaki sözleşme).
 */
export function clampToSentence(s: string, max: number): string {
  if (!s || s.length <= max) return s;
  const clamped = clampWords(s, max);
  const t = clamped.trimEnd();
  if (!t) return clamped;
  // t, s'nin baştaki boşluğu atılmış önekidir (clampWords yalnız uçları kırpar).
  const base = s.length - s.trimStart().length;
  for (let i = t.length - 1; i >= 0; i--) {
    const ch = t[i];
    let kept: string | null = null;
    if (SENTENCE_END_CHARS.includes(ch)) {
      if (ch === "." && i > 0 && /\p{N}/u.test(t[i - 1])) continue;          // "3." / "1.5"
      if (ch === "." && ABBREV_BEFORE_DOT_RE.test(t.slice(0, i))) continue;  // "vb." / "örn." / "e.g."
      let j = i + 1;
      while (j < t.length && CLOSING_AFTER_END.includes(t[j])) j++;
      const next = s.charAt(base + j);
      if (next && !/\s/u.test(next)) continue;                              // "A.Main" — cümle sonu değil
      if (hasUnclosedParen(t.slice(0, j))) continue;                        // "(ör. Sova oku" — parantez içi
      kept = t.slice(0, j).trim();
    } else if (CLAUSE_SEP_CHARS.includes(ch)) {
      if (hasUnclosedParen(t.slice(0, i))) continue;                        // parantez içi ayraç
      kept = stripDanglingTail(t.slice(0, i));
    } else {
      continue;
    }
    // İlk (en sondaki) geçerli sınır: taban tutarsa o; tutmazsa daha öndeki
    // sınırlar daha da kısa kalır → clampWords yoluna düş.
    if (kept && kept.length >= t.length * SENTENCE_FLOOR) return kept;
    break;
  }
  return stripDanglingTail(t) || clamped;
}

/** Metin koç içeriği taşıyor mu (en az bir harf/rakam)? Noktalama-yalnız çıktı
 *  (".", "()") "dolu" sayılmaz — CANLI-TEST-07 boş-guard'ının TEK tanımı;
 *  finalizeCoachText ve vision son-işlemi (lib/vision-postprocess.ts) aynı
 *  yardımcıyı kullanır. */
export function hasCoachContent(s: string): boolean {
  return /[\p{L}\p{N}]/u.test(s);
}

/**
 * TEK TEMİZLEYİCİ ZİNCİR (denetim B82, 2026-07-31).
 *
 * KÖK NEDEN: aynı çıktı guard'ları 4 route'ta 4 FARKLI derinlikte uygulanıyordu —
 * vision tam zincir (realityCheck→cleanCoachText→enforceAgentKit→clampWords),
 * report enforceAgentKit'siz, feedback yalnız cleanCoachText + ham `.slice(0,500)`
 * (report'ta canlı kanıtla düzeltilen "kelime ortasından kesme" bug'ının kopyası),
 * insight yalnız cleanCoachTextDeep. Eksik halkalar tam da geçmiş canlı bug'ların
 * yamalarıydı. Bu yardımcı zinciri TEK YERDE sabitler; route'lar buna geçince
 * drift sınıfı yapısal olarak ölür.
 *
 * SIRA vision route'un kanıtlanmış sırasıdır ve DEĞİŞTİRİLMEMELİDİR:
 *   check (opsiyonel realityCheck) → cleanCoachText → boş-guard → enforceAgentKit → clampWords
 * `check` verilmezse o halka atlanır (feedback/insight'ta round hafızası yok) ve
 * davranış eskisiyle aynı kalır. realityCheck çağrı-yerinden ENJEKTE edilir —
 * gerekçe yukarıdaki import notunda (client-bundle).
 * SAHTE ÇIKTI YOK: hiçbir metin üretilmez, yalnız süzülür. Süzgeç metni boşaltırsa
 * (ya da geriye yalnız noktalama kalırsa) `fallback` — o da AYNI süzgeçten geçip
 * anlamlı kalırsa — döner; aksi hâlde "" döner (CANLI-TEST-07: ham girdiye düşmek
 * YASAK — bkz. fonksiyon içindeki not). Çağıran "" için yapısal hata döner.
 *
 * NOT (2026-07-31): route'lar HENÜZ bu fonksiyona geçirilmedi (dosya sahipliği) —
 * geçiş app/api/ai/{vision,report,feedback,insight}/route.ts tarafında yapılacak.
 * Örnek çağrı (vision):
 *   finalizeCoachText(fb.deathAnalysis, { lang: reqLang, cap: 350, agent: reqAgent,
 *     check: (t) => realityCheck(t, memoryForCheck, factGround, "death", reqLang, reqMap).text });
 */
export function finalizeCoachText(
  text: string,
  opts: {
    lang: "tr" | "en";
    /** clampWords üst sınırı (report 500/600, ask vb.). VISION bu fonksiyonu
     *  kullanmaz: zinciri lib/vision-postprocess.ts'te, kapağı clampToSentence
     *  (DA 400 / NR 350 / enemyAnalysis 240) — TR-KALAN-08 + B03 inceleme, 2026-09-23. */
    cap: number;
    /** oyuncunun ajanı — verilirse kit-dışı yetenek önerisi ayıklanır */
    agent?: string | null;
    /** realityCheck sarmalayıcısı; VERİLİRSE zincirin ilk halkası olarak çalışır */
    check?: (text: string) => string;
    /** süzgeç (check ya da cleanCoachText) metni boşaltırsa dönülecek yedek; o da
     *  süzgeçten geçer. Verilmezse sonuç "" (çağıran yapısal hata döner). */
    fallback?: string;
    /** Kapak biçimi. "words" (varsayılan — ask yolu bayt-aynı) = clampWords;
     *  "sentence" = clampToSentence (kırpılmayan metin bayt-aynı, kırpılırsa son tam
     *  cümle/yan-cümle sınırı). Rapor bunu kullanır: W2 followup #63(a) — ücretli
     *  eval-report'ta refine 6 kabulün 2'sinde alanı 600 kapağında cümle ortasından
     *  kesiyordu (R2 summary "…Chamber'ın kesişlerini kısaltacak", ER2 adjustment
     *  "…as a lurk: delay your"). */
    clamp?: "words" | "sentence";
  },
): string {
  if (!text) return text;
  const { lang, cap, agent, check } = opts;
  const checked = check ? (check(text) || "") : text;
  // CHECK HALKASI BOŞALTTIYSA ham metne DÜŞÜLMEZ (B01 inceleme): eski `?? text`
  // realityCheck'in kanıtsız diye sildiği metni (uydurma katil/konum) süzülmüş ama
  // doğrulanmamış hâliyle geri döndürüyordu — docstring'in "ham girdi ASLA dönmez"
  // sözünün tek istisnasıydı. Bugün tek check'li çağıran (report) daima fallback
  // veriyor → davranışı bayt-aynı; fallback'siz yeni bir çağıran artık "" alır.
  const base = checked && checked.trim() ? checked : (opts.fallback ?? (check ? "" : text));
  if (!base) return "";
  const cleaned = cleanCoachText(base, lang);
  // BOŞ-GUARD (CANLI-TEST-07, 2026-09-23): eskiden `cleaned` boşsa SÜZÜLMEMİŞ `base`
  // dönüyordu — yani süzgecin sildiği yasaklı içerik GERİ geliyordu. Probe:
  // "(41 HP)" → "(41 HP)" (HP yasağı delindi), "Ölüm yeri OCR verisinde yok." →
  // aynen (META "OCR" sızdı), "41 HP ile." → "." (tek noktalık alan "dolu" sayıldı).
  // Ayrıca ask route'un `if (!answer) aiFailed("empty")` dalı bu yüzden ÖLÜYDÜ.
  // Artık: anlamlı (harf/rakam içeren) süzülmüş metin → o; değilse süzülmüş
  // fallback anlamlıysa → o; ikisi de değilse "" (ham metin ASLA). "" → çağıran
  // yapısal hata döner (NO fake AI: sentetik koç metni ÜRETİLMEZ).
  const meaningful = hasCoachContent;
  let safe = "";
  if (cleaned && meaningful(cleaned)) safe = cleaned;
  else if (opts.fallback !== undefined) {
    const fb = cleanCoachText(opts.fallback, lang);
    if (fb && meaningful(fb)) safe = fb;
  }
  if (!safe) return "";
  // Zincir tek ifadede kalır (scripts/test-pipeline-chain G1 grep-guard'ı bu dosyada
  // kapak+kit iç içe çağrısını TEK tanım olarak arar). "sentence" kipinde
  // clampWords sınırsız çağrılır (s.length <= Infinity → girdi AYNEN döner) ve kapağı
  // clampToSentence uygular — "words" kipi bayt-aynı.
  const kitted = clampWords(enforceAgentKit(safe, agent), opts.clamp === "sentence" ? Number.POSITIVE_INFINITY : cap);
  const out = opts.clamp === "sentence" ? clampToSentence(kitted, cap) : kitted;
  return meaningful(out) ? out : "";
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
