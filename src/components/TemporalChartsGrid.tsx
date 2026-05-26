import type { TemporalViewMode } from '../types/temporal';
import type { SessionQualityBreakdown } from '../utils/sessionQualityMetrics';
import type { TemporalChartBucket } from '../utils/temporalMetrics';
import { CompliancePerPeriodChart } from './charts/temporal/CompliancePerPeriodChart';
import { DailyAdherenceGoalCard } from './charts/temporal/DailyAdherenceGoalCard';
import { SessionQualityDonutChart } from './charts/temporal/SessionQualityDonutChart';
import {
  SessionsVsGoalChart,
  type AdherenceChartGoalMode,
} from './charts/temporal/SessionsVsGoalChart';
import { VolumeVsTargetChart } from './charts/temporal/VolumeVsTargetChart';

type TemporalChartsGridProps = {
  viewMode: TemporalViewMode;
  chartBuckets: TemporalChartBucket[];
  adherenceBuckets: TemporalChartBucket[];
  adherenceGoalMode: AdherenceChartGoalMode;
  qualityBreakdown: SessionQualityBreakdown;
  targetMl: number | null;
  compactLabels?: boolean;
};

export function TemporalChartsGrid({
  viewMode,
  chartBuckets,
  adherenceBuckets,
  adherenceGoalMode,
  qualityBreakdown,
  targetMl,
  compactLabels = false,
}: TemporalChartsGridProps) {
  const daySessionsCount = adherenceBuckets[0]?.sessionsCount ?? 0;
  return (
    <div className="charts-grid temporal-charts">
      <article className="panel chart-panel">
        <div className="panel__header">
          <h3>Cumplimiento promedio</h3>
          <p>Promedio de cumplimiento de sesiones clínicas con sensor</p>
        </div>
        <CompliancePerPeriodChart buckets={chartBuckets} compactLabels={compactLabels} />
      </article>

      <article className="panel chart-panel">
        <div className="panel__header">
          <h3>Volumen máximo y promedio vs meta</h3>
          <p>Referencia: meta del nivel activo</p>
        </div>
        <VolumeVsTargetChart
          buckets={chartBuckets}
          targetMl={targetMl}
          compactLabels={compactLabels}
        />
      </article>

      <article className="panel chart-panel">
        <div className="panel__header">
          <h3>Sesiones clínicas vs meta esperada</h3>
          <p>
            {viewMode === 'session-day'
              ? 'Resumen del día — el detalle por sesión está en la tabla inferior'
              : adherenceGoalMode === 'week'
                ? 'Meta semanal: 42 sesiones (6 por día × 7 días)'
                : 'Meta diaria: 6 sesiones clínicas con sensor'}
          </p>
        </div>
        {viewMode === 'session-day' ? (
          <DailyAdherenceGoalCard sessionsCount={daySessionsCount} />
        ) : (
          <SessionsVsGoalChart
            buckets={adherenceBuckets}
            goalMode={adherenceGoalMode}
            compactLabels={compactLabels}
          />
        )}
      </article>

      <article className="panel chart-panel">
        <div className="panel__header">
          <h3>Calidad de sesiones</h3>
          <p>Distribución en el periodo visible</p>
        </div>
        <SessionQualityDonutChart breakdown={qualityBreakdown} />
      </article>
    </div>
  );
}
