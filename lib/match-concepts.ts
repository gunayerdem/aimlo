/**
 * Maç-içi kavram hafızası (rank-4, 2026-08-24) — cross-round ban FALLBACK'i.
 *
 * NEDEN: buildDeathTypeDirective'in ban-satırı prevDeathTypes'a bakar.
 * PREMİS DÜZELTMESİ (canlı-test #14): desktop echo'su v1.0.17'de CANLI
 * (roundHistory[].death_type dolu geliyor, desktop commit 07a91b1) — bu modül
 * artık "echo gelene kadar tek kaynak" değil, echo BOŞKEN devreye giren YEDEK
 * katman (round-eşleşme kayması / geçici desktop bug'ı sınıfı). SET→LIST göçü
 * (canlı-test #14): SADD tekrarları yutuyordu → repeatCount 1'e sabitleniyor,
 * banLine eskalasyonu ölü kalıyordu. Artık RPUSH/LRANGE/LTRIM (sıra + tekrar
 * sayısı korunur). Desktop kontratı DEĞİŞMEZ (deathType yanıtta zaten dönüyor).
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
  // canlı-test #14: SET→LIST göçü — yeni önek 'mcl' (eski 'mc' SET anahtarlarıyla
  // WRONGTYPE çakışmasın; eskiler TTL ile 2 saatte kendiliğinden ölür, göç kodu yok).
  return `aimlo:mcl:${userId}:${matchId}`;
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
// canlı-test #14: Set→Array — tekrar SAYISI artık veri (repeatCount SET'te hep 1'e
// sabitleniyordu, banLine eskalasyonu ölüydü). Tavan LIST tarafıyla aynı (30).
const memorySets = new Map<string, { types: DeathType[]; expiresAt: number }>();
const MEMORY_MAX_KEYS = 500; // sınırsız büyüme yok (dev-only zaten)
const LIST_MAX_LEN = 30; // LTRIM tavanıyla aynı — bir maçın ölüm sayısını fazlasıyla kapsar

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
        memorySets.set(key, { types: [dtype], expiresAt: now + TTL_SEC * 1000 });
      } else {
        entry.types.push(dtype);
        if (entry.types.length > LIST_MAX_LEN) entry.types.splice(0, entry.types.length - LIST_MAX_LEN);
      }
      return;
    }
    // canlı-test #14 (SET→LIST): SADD tekrarları YUTUYORDU — repeatCount asla >1
    // olamıyor, banLine eskalasyonu ölü kalıyordu (Kaan 8/12 vakasının 2. katmanı).
    // RPUSH sırayı ve sayıyı korur; LTRIM -30 -1 tavanı sınırsız büyümeyi keser.
    const data = await pipeline([
      ["RPUSH", key, dtype],
      ["LTRIM", key, String(-LIST_MAX_LEN), "-1"],
      ["EXPIRE", key, String(TTL_SEC)],
    ]);
    if (data[0]?.error) {
      console.warn(`[Aimlo] match-concepts RPUSH failed (silent): ${data[0].error}`);
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
    // canlı-test #14: LRANGE 0 -1 — liste sıralı ve TEKRARLI döner (repeatCount
    // gerçek sayıya kavuşur); her hata yolu yine sessiz boş liste (fail-open).
    const data = await pipeline([["LRANGE", key, "0", "-1"]]);
    const arr = data[0]?.result;
    if (data[0]?.error || !Array.isArray(arr)) return [];
    return toKnownTypes(arr);
  } catch (e) {
    console.warn("[Aimlo] match-concepts read failed (silent):", (e as Error).message);
    return [];
  }
}
