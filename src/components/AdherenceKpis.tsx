import type { AdherenceMetrics } from '../types/adherence';
import { DAILY_SESSION_GOAL } from '../types/adherence';
import { formatNumber, formatPercent } from '../utils/format';
import { KpiCard } from './KpiCard';

type AdherenceKpisProps = {
  adherence: AdherenceMetrics;
};

export function AdherenceKpis({ adherence }: AdherenceKpisProps) {
  const n = adherence.activeDays;
  const dayLabel = (count: number) =>
    n > 0 ? `${formatNumber(count)} de ${formatNumber(n)} días activos` : undefined;

  if (n === 0) {
    return (
      <section className="adherence-primary" aria-label="Adherencia al tratamiento">
        <div className="section-intro">
          <h2>Adherencia al tratamiento</h2>
          <p>Meta diaria: {DAILY_SESSION_GOAL} sesiones con sensor</p>
        </div>
        <p className="temporal-empty">Sin días con actividad clínica en esta exportación.</p>
      </section>
    );
  }

  return (
    <section className="adherence-primary" aria-label="Adherencia al tratamiento">
      <div className="section-intro">
        <h2>Adherencia al tratamiento</h2>
        <p>Meta diaria: {DAILY_SESSION_GOAL} sesiones con sensor · seguimiento postoperatorio</p>
      </div>

      <div className="kpi-grid kpi-grid--adherence">
        <KpiCard
          label="Días con entrenamiento completo"
          value={formatPercent(adherence.percentDaysComplete)}
          hint={dayLabel(adherence.daysComplete)}
          accent
        />
        <KpiCard
          label="Días con entrenamiento perfecto"
          value={formatPercent(adherence.percentDaysPerfect)}
          hint={dayLabel(adherence.daysPerfect)}
        />
        <KpiCard
          label="Promedio sesiones / día activo"
          value={adherence.avgSessionsPerActiveDay.toFixed(1)}
          hint={`Meta: ${DAILY_SESSION_GOAL} sesiones/día`}
        />
        <KpiCard
          label="Mejor racha de adherencia"
          value={formatNumber(adherence.bestStreakDays)}
          hint={
            adherence.bestStreakDays > 0
              ? `${formatNumber(adherence.bestStreakDays)} día${adherence.bestStreakDays === 1 ? '' : 's'} seguidos cumpliendo 6/6`
              : 'Sin racha registrada'
          }
        />
        <KpiCard
          label="Racha actual"
          value={formatNumber(adherence.currentStreakDays)}
          hint={
            adherence.currentStreakDays > 0
              ? 'Días consecutivos recientes con 6/6 completadas'
              : 'Sin racha activa'
          }
        />
        <KpiCard
          label="Días con interrupciones"
          value={formatPercent(adherence.percentDaysWithInterruption)}
          hint={dayLabel(adherence.daysWithInterruption)}
        />
      </div>
    </section>
  );
}
