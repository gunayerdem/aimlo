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

const CLEAN_AGENT_NAMES = ["Jett","Raze","Phoenix","Reyna","Yoru","Neon","Iso","Waylay","Sage","Killjoy","Cypher","Chamber","Deadlock","Vyse","Omen","Brimstone","Viper","Astra","Harbor","Clove","Sova","Breach","Skye","Fade","Gekko","Tejo","Veto"];
// Silah adları — ajan adlarıyla aynı tutarlılık disiplini (dil denetimi 2026-07-25):
// canlı çıktıda "vandal/Vandal", "sheriff/Sheriff", "operator/operatör" karışıyordu.
const CLEAN_WEAPON_NAMES = ["Vandal","Phantom","Operator","Sheriff","Guardian","Spectre","Judge","Odin","Ares","Bulldog","Marshal","Outlaw","Stinger","Ghost","Classic","Shorty","Frenzy","Bucky"];

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

/** Ayraç-sonrası meta yan-cümle: içinde sistem-içi işaret geçen ;/:/— parçası. */
const TR_META_CLAUSE_RE = new RegExp(
  String.raw`\s*[;:—]\s*[^.;:!?\n—]*(?<![a-zçğıöşü])(?:ocr|kayıt(?:ta|lı|larda)|kayda\s+geçti|sistemde|tespit\s+edildi|veri(?:de|lerde)|telemetri)[^.;:!?\n—]*`,
  "giu",
);
/** Saf-meta cümle: öznesi ölüm-yeri/konum, yüklemi kayıt/OCR — bilgi değeri sıfır. */
const TR_META_SENTENCE_RE =
  /(^|[.!?]\s+)(?:öl(?:üm|düğün)\s+yer|ölüm\s+konum|konum)[a-zçğıöşü]*['’]?[a-zçğıöşü]*[^.!?\n]*(?:ocr|kayıt|sistemde|veride|tespit)[^.!?\n]*[.!?]?/giu;
/** "X olarak <meta>" kuyruğu — olgu (X) korunur, meta kuyruk düşer. */
const TR_OLARAK_META_RE =
  /\s+olarak\s+(?:kayıt(?:ta|larda)(?:\s+var)?|kayıtlı|kayda geçti|sistemde(?:\s+(?:var|görünüyor|kayıtlı|mevcut))?|ocr['’]?d[ae]n?(?:\s+(?:kesin|kayıtlı|var|doğrulandı))?|tespit edildi|kesin(?:leşti)?|var|net)(?![a-zçğıöşü])/giu;
/** "OCR'da kesin/kayıtlı/..." zarf öbeği (olarak'sız biçim — F1 fixture'ı). */
const TR_OCR_ADVERB_RE =
  /\s*,?\s*ocr['’]?(?:d[ae]n?)?\s+(?:kesin(?:dir)?|kayıtlı|kayıtta|doğrulandı|net|görünüyor|okundu|geldi|var)(?![a-zçğıöşü])/giu;
/** "katil(in) bilgisi X" → "katil X" (F3: bilgi-sarmalayıcı söküm; çıplak "bilgi" SERBEST). */
const TR_KATIL_BILGISI_RE = /(?<![a-zçğıöşü])katil(?:in)?\s+bilgisi\s+/giu;
/** "verilere/kayıtlara/sisteme göre" cümle-başı önekleri — komple düşer. */
const TR_GORE_PREFIX_RE = /(?<![a-zçğıöşü])(?:veri(?:ye|lere)|kayıtlara|sisteme|ocr['’]?[ae])\s+göre\s*/giu;
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
  t = t.replace(TR_KATIL_BILGISI_RE, "katil ");
  t = t.replace(TR_GORE_PREFIX_RE, "");
  t = t.replace(TR_TESPIT_PARTICIPLE_RE, "$1 net");
  t = t.replace(TR_TESPIT_FALLBACK_RE, " var");
  t = t.replace(TR_LEFTOVER_META_RE, "");
  t = t.replace(TR_OCR_BARE_RE, "");
  if (t !== text) {
    // Söküm artıkları: sarkan virgül/ayraç, çift boşluk, öksüz noktalama.
    t = t.replace(/\s*,\s*(?=[.!?;])/g, "");
    t = t.replace(/\s*;\s*(?=[.!?])/g, "");
    t = t.replace(/(^|[.!?]\s+)[,;:]\s*/g, "$1");
    t = t.replace(/\s+([.,;!?])/g, "$1");
    t = t.replace(/\.{2,}/g, ".");
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
  ];
  for (const re of detectors) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) hits.push(m[0]);
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

export function trLocative(word: string): string {
  const w = (word || "").trim();
  if (!w) return w;
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
export function cleanCoachText(text: string, lang: "tr" | "en"): string {
  if (!text) return text;
  // Sıra: sayısal HP → kova ifadesi (stripNumericHp) → kova dahil TÜM nitel
  // can iddiaları silinir (stripHpClaims, canlı-test #8) → ability düzlemesi.
  let t = plainifyAbilities(stripHpClaims(stripNumericHp(text, lang), lang), lang);
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
 * SAHTE ÇIKTI YOK: hiçbir metin üretilmez, yalnız süzülür; süzgeç metni boşaltırsa
 * `fallback` (ya da girdi) korunur.
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
    /** clampWords üst sınırı (vision 350/180, report 500 vb.) */
    cap: number;
    /** oyuncunun ajanı — verilirse kit-dışı yetenek önerisi ayıklanır */
    agent?: string | null;
    /** realityCheck sarmalayıcısı; VERİLİRSE zincirin ilk halkası olarak çalışır */
    check?: (text: string) => string;
    /** süzgeç metni boşaltırsa dönülecek yedek (verilmezse girdi metni) */
    fallback?: string;
  },
): string {
  if (!text) return text;
  const { lang, cap, agent, check } = opts;
  const checked = check ? (check(text) || "") : text;
  const base = checked && checked.trim() ? checked : (opts.fallback ?? text);
  const cleaned = cleanCoachText(base, lang);
  // Boş-guard: stripNumericHp/stripHpClaims silme formları metni TAMAMEN
  // boşaltabilir (yalnız HP etiketi olan metin) — o zaman bir önceki hâli korunur.
  const safe = cleaned && cleaned.trim() ? cleaned : base;
  return clampWords(enforceAgentKit(safe, agent), cap);
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
