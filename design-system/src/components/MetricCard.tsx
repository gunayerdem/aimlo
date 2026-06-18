export interface MetricCardProps {
  /** Üstteki küçük etiket, örn. "Karar Skoru" */
  label: string;
  /** Büyük değer, örn. "7.4" ya da "13-9" */
  value: string;
  /** Opsiyonel alt not, örn. "+0.6 son maç" */
  hint?: string;
}

/** KPI/metrik kartı — koyu yüzey, küçük etiket + büyük mono değer. Dashboard için. */
export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {hint ? <span className="metric-hint">{hint}</span> : null}
    </div>
  );
}
