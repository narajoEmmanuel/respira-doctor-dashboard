import type { AdherenceSummary as AdherenceSummaryData } from '../types/adherence';

type AdherenceSummaryProps = {
  summary: AdherenceSummaryData;
};

export function AdherenceSummary({ summary }: AdherenceSummaryProps) {
  return (
    <section className="panel adherence-summary" aria-label="Resumen de adherencia">
      <div className="panel__header">
        <h2>Resumen de adherencia</h2>
        <p>Interpretación rápida para la consulta</p>
      </div>
      <ul className="adherence-summary__list">
        {summary.insights.map((item) => (
          <li key={item.id} className={`adherence-summary__item adherence-summary__item--${item.tone}`}>
            <span className="adherence-summary__tag">{item.tag}</span>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
