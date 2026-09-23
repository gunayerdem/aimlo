import { TELEMETRY_WINDOWS, type TelemetrySummary } from "@/lib/admin-telemetry";

/* ------------------------------------------------------------------ *
 * Telemetri kartı — B08 (2026-09-24 · A064/A006).
 * NEDEN: telemetry_events 31.07'den beri yazılıyor ama hiçbir ekran onu
 * okumuyordu; app_open/login_ok/watch_started 6+ hafta `invalid_type` ile
 * sessizce düştü ve ancak elle SQL ile fark edildi. Bu kart hunideki, hata
 * kodlarındaki, gecikmedeki ve REDDEDİLEN olaylardaki değişimi tek bakışta
 * gösterir. Sahte veri YOK: ölçülemeyen bölüm "bilinmiyor", tavana dayanan
 * sayı "≥" ile yazılır. Yalnız sayı/kod gösterilir — kullanıcı kimliği yok.
 * ------------------------------------------------------------------ */

const UNKNOWN_NOTE = "bilinmiyor — sorgu başarısız ya da zaman aşımı (0 DEĞİL)";

function fmtCount(n: number, truncated: boolean): string {
  return `${truncated ? "≥" : ""}${n.toLocaleString("tr-TR")}`;
}

function fmtMs(ms: number): string {
  return `${Math.round(ms).toLocaleString("tr-TR")} ms`;
}

function TelemetryStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="adm-card">
      <p className="adm-stat-label">{label}</p>
      <div className="adm-stat-num" style={value === "bilinmiyor" ? { fontSize: 18, color: "rgba(238,240,248,0.5)" } : undefined}>
        {value}
      </div>
      {sub ? <p className="adm-stat-sub">{sub}</p> : null}
    </div>
  );
}

function TelemetryTableCard({
  title,
  sub,
  headers,
  rows,
  empty,
  unknown,
  truncated,
}: {
  title: string;
  sub?: string;
  headers: string[];
  rows: (string | number)[][];
  empty: string;
  unknown: boolean;
  truncated: boolean;
}) {
  return (
    <div className="adm-card" style={{ padding: 4 }}>
      <div style={{ padding: "12px 14px 4px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(238,240,248,0.9)" }}>{title}</div>
        {sub ? <p className="adm-stat-sub" style={{ marginTop: 4 }}>{sub}</p> : null}
        {truncated ? (
          <p className="adm-stat-sub" style={{ marginTop: 4, color: "#fcd28a" }}>
            Satır tavanına dayanıldı — sayılar EKSİK olabilir (alt sınır).
          </p>
        ) : null}
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {unknown ? (
            <tr>
              <td colSpan={headers.length} style={{ color: "#ff9aa3", padding: 18 }}>
                {UNKNOWN_NOTE}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ color: "rgba(238,240,248,0.4)", padding: 18 }}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={typeof c === "number" ? "adm-num" : undefined}>
                    {j === 0 ? <code style={{ fontSize: 12.5 }}>{c}</code> : c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TelemetrySectionView({ t }: { t: TelemetrySummary | null }) {
  const W = TELEMETRY_WINDOWS;
  const heading = (
    <>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "26px 0 4px", color: "rgba(238,240,248,0.86)" }}>
        Telemetri
      </h2>
      <p className="adm-sub" style={{ marginBottom: 12 }}>
        Masaüstü <code>telemetry_events</code> tablosundan. Masaüstü olayları ~30 dk&apos;lık partilerle
        gönderir — bu kart <b>canlı değil</b>, gecikmelidir.
      </p>
    </>
  );
  if (!t) {
    return (
      <>
        {heading}
        <div className="adm-note">
          <b>Telemetri okunamadı.</b> Durum bilinmiyor — bu <i>&quot;hiç olay yok&quot;</i> demek DEĞİL.
        </div>
      </>
    );
  }

  const funnel = t.funnel;
  const f = (n: number | undefined) => (funnel && n !== undefined ? fmtCount(n, funnel.truncated) : "bilinmiyor");

  const errorRows = (t.errors?.data ?? []).slice(0, 20).map((r) => [
    r.code,
    r.appVersion ?? "— (sürüm yok)",
    r.hitsShort,
    r.hitsLong,
  ]);
  const latencyRows = (t.latency?.data ?? []).map((r) => [r.route, r.n, fmtMs(r.p50), fmtMs(r.p95)]);
  const rejectedRows = (t.rejected?.data ?? []).slice(0, 20).map((r) => [r.reason, r.type, r.hits]);

  return (
    <>
      {heading}
      <div className="adm-grid cols-4">
        <TelemetryStat label={`UYGULAMAYI AÇAN · ${W.funnelDays}G`} value={f(funnel?.data.appOpen)} sub="ayrık kullanıcı (app_open)" />
        <TelemetryStat label={`GİRİŞ YAPAN · ${W.funnelDays}G`} value={f(funnel?.data.loginOk)} sub="ayrık kullanıcı (login_ok)" />
        <TelemetryStat
          label={`İZLEMEYİ BAŞLATAN · ${W.funnelDays}G`}
          value={f(funnel?.data.watchStarted)}
          sub="ayrık kullanıcı (watch_started)"
        />
        <TelemetryStat
          label={`İZLEME NABZI · SON ${W.watchingMinutes} DK`}
          value={t.watching ? fmtCount(t.watching.data, t.watching.truncated) : "bilinmiyor"}
          sub="watch_health gönderen ayrık kullanıcı — 'şu an online' DEĞİL"
        />
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <TelemetryTableCard
          title={`AI gecikmesi · son ${W.latencyHours} saat`}
          sub="ai_call_duration_ms, route bazlı percentile_cont"
          headers={["Route", "n", "p50", "p95"]}
          rows={latencyRows}
          empty={`Son ${W.latencyHours} saatte ölçüm yok.`}
          unknown={!t.latency}
          truncated={!!t.latency?.truncated}
        />
        <TelemetryTableCard
          title={`Reddedilen olaylar · son ${W.rejectedDays} gün`}
          sub="Route'un reddettiği olaylar (sebep × gelen tip). Sürekli invalid_type = desktop↔backend tip kayması."
          headers={["Sebep", "Tip", "Adet"]}
          rows={rejectedRows}
          empty={`Son ${W.rejectedDays} günde reddedilen olay yok.`}
          unknown={!t.rejected}
          truncated={!!t.rejected?.truncated}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <TelemetryTableCard
          title={`Hata kodları · kod × sürüm`}
          sub={`error_code_count, sum(count) — son ${W.errorsShortHours} saat ve ${W.errorsLongDays} gün (en çok 20 satır)`}
          headers={["Kod", "Sürüm", `${W.errorsShortHours}s`, `${W.errorsLongDays}g`]}
          rows={errorRows}
          empty={`Son ${W.errorsLongDays} günde hata kodu yok.`}
          unknown={!t.errors}
          truncated={!!t.errors?.truncated}
        />
      </div>
    </>
  );
}
