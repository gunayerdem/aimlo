// AI MODEL KİMLİĞİ — TEK KAYNAK (OLCUM-ARACI-17, B07 2026-09-24)
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN: model id "gpt-5-mini" 5 route'ta (vision/report/insight/ask/feedback),
// saveAiUsage fallback'lerinde, VISION_CALL/REPORT_CALL/REFINE_CALL'da, eval
// aynalarında ve fiyat tablosunun FALLBACK_MODEL'ında elle yazılmıştı. Model
// göçü (gpt-5-mini-2025-08-07 snapshot'ı 11.12.2026'da KAPANIYOR — bkz.
// lib/openai-pricing.ts GÖÇ TAKVİMİ) 14+ noktada elle değişiklik isterdi; birini
// atlamak = route'lar arasında karışık model, eval ile prod arasında model
// uyumsuzluğu ve saveAiUsage'da yanlış model etiketi (→ yanlış fiyat).
//
// KURAL: model değişimi TEK SATIR + TEK COMMIT. AI_MODEL'i değiştirirken
// lib/openai-pricing.ts PRICING tablosuna yeni id'nin satırı AYNI commit'te
// eklenmeli — scripts/test-billing.ts `PRICING[AI_MODEL]` tanımlı değilse kırılır.
// scripts/test-billing.ts grep-guard'ı app/ + scripts/ + lib/ altında bu id'nin
// tırnaklı literal'ini arar (izinli: bu dosya + fiyat tablosu anahtarı).
//
// YAPRAK MODÜL: hiçbir şey import etmez (route/lib/script/client hepsi güvenle
// import edebilsin, döngü riski yok). Sır değil — client bundle'a girmesi zararsız.

/** Tüm AI route'larının (vision, report + refine, insight, ask, feedback) OpenAI model id'si. */
export const AI_MODEL = "gpt-5-mini" as const;

/** Tüm AI route'larının reasoning_effort değeri (koç çıktısı şablon doldurma; zincirleme düşünme değil). */
export const AI_REASONING_EFFORT = "minimal" as const;
