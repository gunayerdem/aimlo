import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { getInfraStatus } from "@/lib/admin-infra";

// Canlı sağlık kontrolü — her istekte yeniden koşmalı, ASLA cache'lenmemeli
// (cache'lenmiş "yeşil" kart, düşmüş bir servisi saatlerce gizler).
export const dynamic = "force-dynamic";

type Infra = Awaited<ReturnType<typeof getInfraStatus>>;
type Service = Infra["services"][number];
type EnvRow = Infra["envs"][number];

/* ------------------------------------------------------------------ *
 * Altyapı paneli, 2026-08-04.
 * NEDEN: bugün `vercel env rm X preview` scope argümanını yok sayıp 6
 * değişkeni Production dahil sildi. Canlı site etkilenmedi (env değişimi
 * çalışan deployment'a işlemez) ama UPSTASH_* yalnız Vercel'de yaşadığı
 * için geri konamadı → bir sonraki deploy'da rate-limit fail-closed
 * davranıp TÜM AI route'larını 503'e düşürecekti. Bu ekranın tek işi:
 * "deploy etmeden önce hangi kritik env eksik / hangi servis düşük"
 * sorusunu tek bakışta yanıtlamak ve konsollara tek tıkla götürmek.
 *
 * 🔴 GÜVENLİK: burada HİÇBİR sır değeri render EDİLMEZ — ne değer, ne
 * ilk/son karakter, ne uzunluk, ne hash. Yalnız boolean "tanımlı mı".
 * Bu bir sır-kurtarma aracı değil, bir VARLIK göstergesidir; admin
 * oturumu ele geçse bile buradan sır sızmaz. Aşağıdaki JSX yalnız
 * key / present / critical / purpose alanlarına dokunur.
 * ------------------------------------------------------------------ */

const OK = "#4ADE80";
const FAIL = "#FF4655";
const MUTED = "rgba(238,240,248,0.34)";

function dotColor(status: Service["status"]): string {
  if (status === "ok") return OK;
  if (status === "fail") return FAIL;
  return MUTED;
}

/** Sahte veri YOK: kontrol yapılamadıysa "iyi" değil "bilinmiyor" denir. */
function statusText(status: Service["status"]): string {
  if (status === "ok") return "çalışıyor";
  if (status === "fail") return "erişilemedi";
  return "bilinmiyor";
}

/** Ortam kodunu panelin diline çevir; tanımadığımızı olduğu gibi göster. */
function envLabel(env: string | null | undefined): string {
  if (!env) return "bilinmiyor";
  if (env === "production") return "production (canlı)";
  if (env === "preview") return "preview";
  if (env === "development") return "development (yerel)";
  return env;
}

/**
 * Sözleşme dışı alanları GÜVENLİ okuma. lib/admin-infra.ts paralel
 * yazılıyor; `deploy` sürüm alanını hangi adla verirse versin (ya da hiç
 * vermezse) bu sayfa patlamasın diye tip-bağımsız okuyoruz. Bulunamazsa
 * "bilinmiyor" yazarız — uydurmayız.
 */
function readText(source: unknown, ...keys: string[]): string | null {
  if (!source || typeof source !== "object") return null;
  const rec = source as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/** releases/latest.json sürümü deploy'da yoksa, ilgili servis notundan çıkar. */
function versionFrom(infra: Infra): string | null {
  const direct = readText(infra.deploy, "version", "latestVersion", "release", "desktopVersion");
  if (direct) return direct;
  const rel = infra.services.find((s) => /release|latest|updater/i.test(s.key));
  const m = rel?.note ? /v?\d+\.\d+\.\d+/.exec(rel.note) : null;
  return m ? m[0] : null;
}

function ServiceCard({ s }: { s: Service }) {
  const failed = s.status === "fail";
  // Kırmızı kart DİKKAT ÇEKMELİ — bu ekranın tek işi bu. Kenarlık + zemin +
  // glow üçlüsü, sayfayı tararken gözü doğrudan düşmüş servise çeker.
  return (
    <div
      className="adm-card"
      style={
        failed
          ? {
              borderColor: "rgba(255,70,85,0.5)",
              background: "rgba(255,70,85,0.07)",
              boxShadow: "0 0 26px rgba(255,70,85,0.13)",
            }
          : undefined
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            flex: "0 0 auto",
            background: dotColor(s.status),
            boxShadow: s.status === "unknown" ? "none" : `0 0 10px ${dotColor(s.status)}`,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(238,240,248,0.9)" }}>{s.label}</span>
        <span
          className="adm-num"
          style={{ marginLeft: "auto", fontSize: 12, color: "rgba(238,240,248,0.5)" }}
        >
          {typeof s.latencyMs === "number" ? `${s.latencyMs} ms` : "—"}
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 600,
          color: failed ? "#ff9aa3" : s.status === "ok" ? "#86efac" : "rgba(238,240,248,0.5)",
        }}
      >
        {statusText(s.status)}
      </div>

      {s.note ? <p className="adm-stat-sub" style={{ marginTop: 6 }}>{s.note}</p> : null}
    </div>
  );
}

export default async function AdminAltyapiPage() {
  // Layout gate'i Partial Rendering'de page'in veri çekimini durdurmaz
  // (bkz. revenue/page.tsx). Sağlık kontrolleri ağ çağrısı yapıyor ve env
  // varlığını okuyor — admin kapısının ARKASINDA kalmalı, o yüzden burada da.
  const admin = await getAdminUser();
  if (!admin) notFound();

  // Sayfa ASLA patlamamalı: tek bir kontrol hatası bütün ekranı götürmesin.
  let infra: Infra | null = null;
  try {
    infra = await getInfraStatus();
  } catch {
    infra = null;
  }

  if (!infra) {
    return (
      <>
        <h1 className="adm-h1">Altyapı</h1>
        <p className="adm-sub">Servis sağlığı, kritik env denetimi ve dış konsollar</p>
        <div className="adm-note">
          <b>Kontroller çalıştırılamadı.</b> Durum bilinmiyor — bu <i>&quot;her şey yolunda&quot;</i> demek DEĞİL.
          Sayfayı yenile; sorun sürerse Vercel fonksiyon loglarına bak.
        </div>
      </>
    );
  }

  const { services, envs, deploy, links } = infra;

  // Sıralama: önce kritik+eksik (yangın), sonra kritik, sonra kalanlar.
  const sortedEnvs: EnvRow[] = [...envs].sort((a, b) => {
    if (a.critical !== b.critical) return a.critical ? -1 : 1;
    if (a.present !== b.present) return a.present ? 1 : -1;
    return a.key.localeCompare(b.key, "tr");
  });
  const missingCritical = envs.filter((e) => e.critical && !e.present).length;
  const failing = services.filter((s) => s.status === "fail").length;
  const unknownCount = services.filter((s) => s.status === "unknown").length;
  // "hepsi çalışıyor" cümlesini yalnız GERÇEKTEN ölçülmüş servis varsa kur —
  // boş liste ya da bilinmeyen durum asla yeşil anlatılmaz (sahte veri yok).
  const serviceSummary =
    services.length === 0
      ? "kontrol tanımlı değil"
      : failing > 0
        ? `${failing} servise erişilemedi`
        : unknownCount > 0
          ? `${unknownCount} servisin durumu bilinmiyor`
          : "hepsi çalışıyor";
  const version = versionFrom(infra);
  const commit = readText(deploy, "commit");
  const region = readText(deploy, "region");
  const envName = readText(deploy, "env", "environment");

  return (
    <>
      <h1 className="adm-h1">Altyapı</h1>
      <p className="adm-sub">
        Servis sağlığı, kritik env denetimi ve dış konsollar — sayfa her açıldığında canlı ölçülür
      </p>

      {/* Kritik env uyarı şeridi: 2026-08-04'teki env-silme olayının tekrarını
          deploy ÖNCESİ yakalayan tek gösterge. Değer değil, yalnız sayı. */}
      {missingCritical > 0 ? (
        <div
          className="adm-card"
          style={{
            marginBottom: 14,
            borderColor: "rgba(255,70,85,0.5)",
            background: "rgba(255,70,85,0.09)",
            boxShadow: "0 0 26px rgba(255,70,85,0.14)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ff9aa3" }}>
            {missingCritical} kritik değişken eksik — deploy etmeden önce tamamla.
          </div>
          <p className="adm-stat-sub" style={{ marginTop: 6 }}>
            Eksik kritik env ile yapılan bir deploy, rate-limit fail-closed davrandığı için AI
            route&apos;larını 503&apos;e düşürebilir. Aşağıdaki tabloda kırmızı satırları Vercel &rarr;
            Settings &rarr; Environment Variables altında yeniden ekle.
          </p>
        </div>
      ) : null}

      {/* ------------------------------ SERVİSLER ------------------------------ */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "0 0 10px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "rgba(238,240,248,0.86)" }}>
          Servisler
        </h2>
        <span style={{ fontSize: 12, color: failing > 0 ? "#ff9aa3" : "rgba(238,240,248,0.45)" }}>
          {serviceSummary}
        </span>
        <a href="/admin/altyapi" className="adm-link" style={{ marginLeft: "auto" }}>
          Yeniden ölç &rarr;
        </a>
      </div>

      {services.length === 0 ? (
        <div className="adm-note">Tanımlı servis kontrolü yok.</div>
      ) : (
        <div className="adm-grid cols-3">
          {services.map((s) => (
            <ServiceCard key={s.key} s={s} />
          ))}
        </div>
      )}

      {/* ------------------------------- DAĞITIM ------------------------------- */}
      <div className="adm-chip-row" style={{ marginTop: 14 }}>
        <span className="adm-chip">
          commit: <b>{commit ? commit.slice(0, 7) : "bilinmiyor"}</b>
        </span>
        <span className="adm-chip">
          ortam: <b>{envLabel(envName)}</b>
        </span>
        <span className="adm-chip">
          bölge: <b>{region ?? "bilinmiyor"}</b>
        </span>
        <span className="adm-chip">
          masaüstü sürümü: <b>{version ?? "bilinmiyor"}</b>
        </span>
      </div>

      {/* --------------------------- ENV VARLIK DENETİMİ --------------------------- */}
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "26px 0 4px", color: "rgba(238,240,248,0.86)" }}>
        Ortam değişkenleri
      </h2>
      <p className="adm-sub" style={{ marginBottom: 12 }}>
        Yalnız <b>tanımlı mı</b> gösterilir — değerler, uzunluklar ve önekler dahil hiçbir sır bu
        sayfaya asla düşmez.
      </p>

      <div className="adm-card" style={{ padding: 4 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Env anahtarı</th>
              <th>Durum</th>
              <th>Önem</th>
              <th>Amaç</th>
            </tr>
          </thead>
          <tbody>
            {sortedEnvs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: "rgba(238,240,248,0.4)", padding: 18 }}>
                  Denetlenecek değişken tanımlı değil.
                </td>
              </tr>
            ) : (
              sortedEnvs.map((e) => {
                const danger = e.critical && !e.present;
                return (
                  <tr
                    key={e.key}
                    style={danger ? { background: "rgba(255,70,85,0.09)" } : undefined}
                  >
                    <td>
                      <code style={{ fontSize: 12.5, color: danger ? "#ff9aa3" : "rgba(238,240,248,0.88)" }}>
                        {e.key}
                      </code>
                    </td>
                    <td>
                      {/* Bilinçli olarak sadece iki durum: var / yok. */}
                      <span className={e.present ? "adm-badge ok" : danger ? "adm-badge bad" : "adm-badge warn"}>
                        {e.present ? "tanımlı" : "eksik"}
                      </span>
                    </td>
                    <td style={{ color: "rgba(238,240,248,0.6)" }}>
                      {e.critical ? "kritik" : "opsiyonel"}
                    </td>
                    <td style={{ color: "rgba(238,240,248,0.6)" }}>{e.purpose}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------------------ HIZLI LİNKLER ------------------------------ */}
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "26px 0 4px", color: "rgba(238,240,248,0.86)" }}>
        Konsollar
      </h2>
      <p className="adm-sub" style={{ marginBottom: 12 }}>
        Eksik bir değişkeni ya da düşmüş bir servisi düzeltmek için gideceğin yer — yeni sekmede açılır.
      </p>

      {links.length === 0 ? (
        <div className="adm-note">Tanımlı konsol bağlantısı yok.</div>
      ) : (
        <div className="adm-grid cols-3">
          {/* rel="noopener noreferrer" ZORUNLU: dış konsola açılan sekme
              window.opener üzerinden admin sayfasını yönlendiremesin. */}
          {links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-card adm-fb"
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(238,240,248,0.9)" }}>
                  {l.label}
                </span>
                <span style={{ marginLeft: "auto", color: "var(--iris-violet)", fontSize: 13 }} aria-hidden>
                  ↗
                </span>
              </div>
              {l.note ? <p className="adm-stat-sub" style={{ marginTop: 6 }}>{l.note}</p> : null}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
