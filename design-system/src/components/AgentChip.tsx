export interface AgentChipProps {
  /** Ajan görseli URL'i */
  src: string;
  /** Ajan adı (erişilebilirlik + alt) */
  name: string;
  /** İdle yüzme varyasyonu 0-4 (spotlight sahnesinde farklı ritim) */
  floatIndex?: 0 | 1 | 2 | 3 | 4;
}

/** Ajan spotlight kartı — hover'da iris ışığıyla canlanır, idle'da yüzer. */
export function AgentChip({ src, name, floatIndex = 0 }: AgentChipProps) {
  return (
    <div className={`agent-card agent-float-${floatIndex}`} aria-label={name}>
      <img src={src} alt={name} />
    </div>
  );
}
