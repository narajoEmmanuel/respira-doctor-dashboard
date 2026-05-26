type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

export function KpiCard({ label, value, hint, accent = false }: KpiCardProps) {
  return (
    <article className={`kpi-card${accent ? ' kpi-card--accent' : ''}`}>
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
      {hint ? <span className="kpi-card__hint">{hint}</span> : null}
    </article>
  );
}
