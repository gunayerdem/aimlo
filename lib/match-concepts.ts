/**
 * Maç-içi kavram hafızası (rank-4, 2026-08-24) — cross-round ban FALLBACK'i.
 *
 * NEDEN: buildDeathTypeDirective'in ban-satırı prevDeathTypes'a bakar; o liste
 * BUGÜN yalnız roundHistory[].death_type'tan doluyor ve desktop echo'su Faz2'de
 * (route.ts prevDeathTypes yorumu: "Until the desktop sends it this is empty")
 * → ban-satırı canlıda HİÇ ateşlenmiyor, maç-içi aynı-kavram tekrarı ölçülü
 * (real-korpus repeatScore m3, kb-findings "rotation" bulgusu). Bu modül
 * sunucu-yanı fallback: her died-yanıtında death-type matchId+userId anahtarlı
 * Upstash SET'ine yazılır (SADD, TTL 2h); sonraki round'da roundHistory'de
 * death_type BOŞSA buradan okunur (SMEMBERS). Desktop echo'su gelince (Faz2)
 * roundHistory kazanır — fallback o istekte hiç okunmaz, kablo kendiliğinden
 * emekliye ayrılır. Desktop kontratı DEĞİŞMEZ (deathType yanıtta zaten dönüyor).
 *
 * GÜVENLİK / DAYANIKLILIK (playerMemory + lib/api-auth.ts emsalleri):
 *  - Okuma/yazma hatası SESSİZ no-op / boş liste → bugünkü davranış birebir;
 *    canlı feedback ASLA bu kablo yüzünden bloklanmaz (rate-limit'in aksine
 *    fail-OPEN bilinçli: bu bir kota değil, çeşitlilik ipucu).
 *  - Okunan değerler DEATH_TYPE_GUIDE anahtar ALLOWLIST'inden geçer — Redis'ten
 *    dönen serbest metin prompt'a GİREMEZ (prompt-safety disiplinine dokunmadan
 *    aynı katılık). hasOwnProperty ile: "toString" sınıfı prototype anahtarı
 *    allowlist'i geçemez (agent-slug aramasındaki emsal).
 *  - Anahtar bileşenleri güvenli: userId Supabase JWT'den (uuid), matchId
 *    route.ts isUuidV4 doğrulamasından geçmiş — keyOf'a serbest metin girmez.
 *  - Dev'de (UPSTASH_* yok) in-memory fallback — api-auth memoryStore emsali;
 *    TTL süpürmeli, sınırlı büyüme.
 */

import { DEATH_TYPE_GUIDE, type DeathType } from "@/lib/death-type";

// 2 saat: bir Valorant maçının ömrünü fazlasıyla kapsar; anahtar kendini siler.
const TTL_SEC = 2 * 60 * 60;

// Upstash REST zaman aşımı: OKUMA istek yolunda (prompt kurulmadan önce) →
// api-auth'un 4000ms'inden kısa tutuldu; aşarsa sessiz boş liste, feedback
// gecikmesine tavan koyar. Yazma zaten fire-and-forget.
const FETCH_TIMEOUT_MS = 2500;

function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function keyOf(userId: string, matchId: string): string {
  return `aimlo:mc:${userId}:${matchId}`;
}

/** Allowlist süzgeci — SET'ten (ya da bellekten) dönen her değer DEATH_TYPE_GUIDE
 *  anahtarı olmak ZORUNDA; olmayan sessizce düşer (serbest metin prompt'a giremez). */
function toKnownTypes(values: unknown[]): DeathType[] {
  return values.filter(
    (s): s is DeathType =>
      typeof s === "string" && Object.prototype.hasOwnProperty.call(DEATH_TYPE_GUIDE, s),
  );
}

// ── Dev in-memory fallback (api-auth memoryStore emsali) ──
const memorySets = new Map<string, { types: Set<DeathType>; expiresAt: number }>();
const MEMORY_MAX_KEYS = 500; // sınırsız büyüme yok (dev-only zaten)

function memorySweep(now: number): void {
  if (memorySets.size < MEMORY_MAX_KEYS) return;
  for (const [k, v] of memorySets) {
    if (now > v.expiresAt) memorySets.delete(k);
  }
  // Süpürme yetmediyse en eskiden sil — Map ekleme sıralıdır.
  while (memorySets.size >= MEMORY_MAX_KEYS) {
    const first = memorySets.keys().next().value;
    if (first === undefined) break;
    memorySets.delete(first);
  }
}

// ── Upstash REST pipeline (api-auth upstashIncr ile aynı gövde şekli —
//    scripts/probe-upstash-pipeline.ts canlı provasıyla kanıtlı yanıt biçimi) ──
async function pipeline(cmds: string[][]): Promise<Array<{ result?: unknown; error?: string }>> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmds),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Upstash pipeline HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`Upstash pipeline unexpected body`);
    return data as Array<{ result?: unknown; error?: string }>;
  } finally {
    clearTimeout(tid);
  }
}

/** Bu round'un death-type'ını maç set'ine yaz — fire-and-forget (saveMatchEvent
 *  emsali: yanıtı BLOKLAMAZ, her hata sessiz warn). */
export async function recordMatchConcept(
  userId: string,
  matchId: string,
  dtype: DeathType,
): Promise<void> {
  const key = keyOf(userId, matchId);
  try {
    if (!isUpstashConfigured()) {
      const now = Date.now();
      memorySweep(now);
      const entry = memorySets.get(key);
      if (!entry || now > entry.expiresAt) {
        memorySets.set(key, { types: new Set([dtype]), expiresAt: now + TTL_SEC * 1000 });
      } else {
        entry.types.add(dtype);
      }
      return;
    }
    const data = await pipeline([
      ["SADD", key, dtype],
      ["EXPIRE", key, String(TTL_SEC)],
    ]);
    if (data[0]?.error) {
      console.warn(`[Aimlo] match-concepts SADD failed (silent): ${data[0].error}`);
    }
  } catch (e) {
    console.warn("[Aimlo] match-concepts write failed (silent):", (e as Error).message);
  }
}

/** Maçın önceki round'larında verilen death-type'ları oku. HER hata yolunda
 *  boş liste = bugünkü davranış (ban-satırı eklenmez); asla throw etmez. */
export async function readMatchConcepts(userId: string, matchId: string): Promise<DeathType[]> {
  const key = keyOf(userId, matchId);
  try {
    if (!isUpstashConfigured()) {
      const entry = memorySets.get(key);
      if (!entry || Date.now() > entry.expiresAt) return [];
      return toKnownTypes([...entry.types]);
    }
    const data = await pipeline([["SMEMBERS", key]]);
    const arr = data[0]?.result;
    if (data[0]?.error || !Array.isArray(arr)) return [];
    return toKnownTypes(arr);
  } catch (e) {
    console.warn("[Aimlo] match-concepts read failed (silent):", (e as Error).message);
    return [];
  }
}
