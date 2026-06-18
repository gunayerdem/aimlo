export interface FeedbackCardProps {
  /** Kısa başlık (callout içerir), örn. "A Main utility'siz giriş" */
  title: string;
  /** Ajan adı, örn. "Jett" */
  agent: string;
  /** Harita, örn. "Ascent" */
  map: string;
  /** Callout/konum, örn. "A Main" */
  location: string;
  /** Ölüm Nedeni metni (1-3 cümle) */
  deathAnalysis: string;
  /** Düşman Analizi metni (1-2 cümle) */
  enemyPatterns: string;
  /** Sonraki Round planı (1-2 cümle, emir) */
  nextRoundPlan: string;
  /** Bölüm başlıkları dili (varsayılan TR) */
  lang?: "tr" | "en";
}

/**
 * AIMLO imza bileşeni — maç-sonu koç feedback kartı.
 * Üç bölüm: Ölüm Nedeni (kırmızı) / Düşman Analizi (amber) / Sonraki Round (camgöbeği).
 * Üstte iris-spektrum hairline. K/D yok — değer koçlukta.
 */
export function FeedbackCard({
  title, agent, map, location,
  deathAnalysis, enemyPatterns, nextRoundPlan,
  lang = "tr",
}: FeedbackCardProps) {
  const L = lang === "tr"
    ? { death: "Ölüm Nedeni", enemy: "Düşman Analizi", next: "Sonraki Round" }
    : { death: "Death Cause", enemy: "Enemy Read", next: "Next Round" };
  return (
    <div className="fb-card">
      <div className="fb-card-spectrum" />
      <div className="fb-card-head">
        <span className="fb-card-title">{title}</span>
        <span className="fb-card-meta">{agent} · {map} · {location}</span>
      </div>
      <div className="fb-card-body">
        <div className="fb-section">
          <p className="fb-label fb-label-death">{L.death}</p>
          <p className="fb-text">{deathAnalysis}</p>
        </div>
        <div className="fb-section">
          <p className="fb-label fb-label-enemy">{L.enemy}</p>
          <p className="fb-text">{enemyPatterns}</p>
        </div>
        <div className="fb-section">
          <p className="fb-label fb-label-next">{L.next}</p>
          <p className="fb-text">{nextRoundPlan}</p>
        </div>
      </div>
    </div>
  );
}
