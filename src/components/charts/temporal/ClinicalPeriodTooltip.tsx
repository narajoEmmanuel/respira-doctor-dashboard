import type { TemporalChartBucket } from '../../../utils/temporalMetrics';
import { clinicalInterpretationNote, sessionStatusLabel } from '../../../utils/chartTooltipHelpers';

type ClinicalPeriodTooltipProps = {
  row: TemporalChartBucket;
  targetMl?: number | null;
  extraLines?: string[];
};

export function ClinicalPeriodTooltip({ row, targetMl, extraLines = [] }: ClinicalPeriodTooltipProps) {
  const note = clinicalInterpretationNote(row);
  const status =
    row.sessionStatus ??
    (row.sessionsCount === 1 ? sessionStatusLabel(row) : undefined);

  return (
    <div className="chart-tooltip">
      <strong>{row.label}</strong>
      {targetMl != null && targetMl > 0 ? (
        <p>Meta del nivel activo: {Math.round(targetMl)} ml</p>
      ) : null}
      <p>Volumen máximo: {Math.round(row.maxVolumeMl)} ml</p>
      <p>
        Volumen promedio:{' '}
        {row.avgVolumeMl > 0 ? `${Math.round(row.avgVolumeMl)} ml` : 'Sin dato'}
      </p>
      <p>Cumplimiento: {row.avgCompliancePercent.toFixed(1)}%</p>
      <p>Sesiones clínicas: {row.sessionsCount}</p>
      <p>
        Completadas: {row.completedCount} · Perfectas: {row.perfectCount} · Interrumpidas:{' '}
        {row.interruptedCount}
      </p>
      <p>
        Intentos válidos / totales: {row.validAttempts} / {row.totalAttempts}
      </p>
      {status ? <p>Estado: {status}</p> : null}
      {extraLines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {note ? <p className="chart-tooltip__note">{note}</p> : null}
    </div>
  );
}
