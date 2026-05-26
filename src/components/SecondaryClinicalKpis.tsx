import type { DashboardMetrics } from '../types/export';
import { formatPercent, formatSeconds, formatVolumeMl } from '../utils/format';
import { KpiCard } from './KpiCard';

type SecondaryClinicalKpisProps = {
  metrics: DashboardMetrics;
};

export function SecondaryClinicalKpis({ metrics }: SecondaryClinicalKpisProps) {
  return (
    <section className="clinical-secondary" aria-label="Contexto clínico">
      <div className="section-intro section-intro--compact">
        <h2>Contexto clínico</h2>
        <p>Capacidad respiratoria y desempeño técnico con sensor</p>
      </div>

      <div className="kpi-grid kpi-grid--secondary">
        <KpiCard
          label="VIM actual"
          value={metrics.lastVimMl != null ? formatVolumeMl(metrics.lastVimMl) : 'Sin registro'}
          hint="Referencia inspiratoria"
        />
        <KpiCard label="Nivel actual" value={metrics.currentLevelLabel} />
        <KpiCard
          label="Meta del nivel activo"
          value={
            metrics.activeLevelTargetMl != null
              ? formatVolumeMl(metrics.activeLevelTargetMl)
              : 'Sin meta'
          }
        />
        <KpiCard
          label="Volumen máximo registrado"
          value={formatVolumeMl(metrics.maxVolumeMl)}
        />
        <KpiCard
          label="Cumplimiento promedio"
          value={formatPercent(metrics.avgCompliancePercent)}
          hint="Todas las sesiones clínicas con sensor"
        />
        <KpiCard
          label="Mejor tiempo de sostén"
          value={formatSeconds(metrics.bestHoldSeconds)}
          hint="Máximo entre intentos"
        />
      </div>
    </section>
  );
}
