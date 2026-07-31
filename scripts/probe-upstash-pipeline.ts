/**
 * CANLI PROVA — Upstash /pipeline yanıt şekli (B102 doğrulaması, 2026-07-31).
 *
 * NEDEN VAR: rate-limit sayacı ardışık iki REST çağrısından tek /pipeline
 * çağrısına taşındı. Bu kod PRODUCTION'da HER AI isteğinin önünde çalışıyor ve
 * hata durumunda fail-closed → yanlış bir yanıt-şekli varsayımı tüm koçluğu
 * 503'e düşürürdü. Varsayımı kanıta çevirmek için gerçek Upstash'e atılan
 * tek seferlik prova.
 *
 * NE YAPAR: geçici bir anahtarda (aimlo:probe:*) INCR+EXPIRE pipeline'ı koşar,
 * dönen gövdenin lib/api-auth.ts'in beklediği şekle uyduğunu doğrular, TTL'in
 * gerçekten kurulduğunu okur ve anahtarı siler. Kalıcı etkisi YOKTUR; gerçek
 * rate-limit anahtarlarına DOKUNMAZ.
 *
 * Koşum:  npx tsx --env-file=.env.local scripts/probe-upstash-pipeline.ts
 */
const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!URL_ || !TOKEN) {
  console.error("UPSTASH_* yok — .env.local ile koş: npx tsx --env-file=.env.local scripts/probe-upstash-pipeline.ts");
  process.exit(1);
}

let fail = 0;
const t = (name: string, ok: boolean, extra = "") => {
  console.log(`  ${ok ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`);
  if (!ok) fail++;
};

async function pipeline(cmds: string[][]): Promise<unknown> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  // Sabit ama çakışmayan prova anahtarı (Date.now() yerine pid — deterministik yeter).
  const key = `aimlo:probe:pipeline:${process.pid}`;
  console.log(`\n══ Upstash /pipeline prova — anahtar ${key} ══\n`);

  // 1) lib/api-auth.ts upstashIncr ile BİREBİR aynı gövde
  const data = (await pipeline([
    ["INCR", key],
    ["EXPIRE", key, "60"],
  ])) as Array<{ result?: unknown; error?: string }>;

  console.log("  ham yanıt:", JSON.stringify(data), "\n");

  t("yanıt bir DİZİ", Array.isArray(data), typeof data);
  t("en az 2 giriş", Array.isArray(data) && data.length >= 2, `uzunluk=${(data as unknown[])?.length}`);
  t("data[0].error yok", !data?.[0]?.error, String(data?.[0]?.error ?? ""));
  t("data[0].result SAYI (kod bunu bekliyor)", typeof data?.[0]?.result === "number", `tip=${typeof data?.[0]?.result}`);
  t("ilk INCR 1 döndürdü", data?.[0]?.result === 1, `değer=${String(data?.[0]?.result)}`);
  t("data[1] (EXPIRE) hatasız", !data?.[1]?.error, String(data?.[1]?.error ?? ""));

  // 2) TTL gerçekten kuruldu mu — fail-closed kilit riskinin asıl kanıtı
  const ttlRes = (await pipeline([["TTL", key]])) as Array<{ result?: number }>;
  const ttl = ttlRes?.[0]?.result;
  t("TTL kuruldu (0 < ttl <= 60)", typeof ttl === "number" && ttl > 0 && ttl <= 60, `ttl=${String(ttl)}`);

  // 3) Sayaç gerçekten artıyor mu (rate-limit'in çalışması buna bağlı)
  const second = (await pipeline([
    ["INCR", key],
    ["EXPIRE", key, "60"],
  ])) as Array<{ result?: unknown }>;
  t("ikinci çağrı 2 döndürdü", second?.[0]?.result === 2, `değer=${String(second?.[0]?.result)}`);

  // 4) Temizlik — prova anahtarı kalmasın
  await pipeline([["DEL", key]]);
  const after = (await pipeline([["EXISTS", key]])) as Array<{ result?: number }>;
  t("prova anahtarı silindi", after?.[0]?.result === 0, `exists=${String(after?.[0]?.result)}`);

  console.log(
    `\n${fail === 0
      ? "✅ PROVA GEÇTİ — lib/api-auth.ts'in /pipeline yanıt varsayımı GERÇEKle uyuşuyor."
      : `❌ ${fail} KONTROL DÜŞTÜ — pipeline'a geçiş prod'da rate-limit'i fail-closed'a düşürür, GERİ AL.`}\n`,
  );
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("\n❌ PROVA ÇALIŞTIRILAMADI:", e instanceof Error ? e.message : e);
  process.exit(1);
});
