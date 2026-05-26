import type { PeriodBucketMetrics } from '../types/temporal';
import { formatNumber, formatSeconds, formatVolumeMl } from '../utils/format';
import { formatDayLabel } from '../utils/dateKeys';

type TemporalWeekDaysDetailTableProps = {
  buckets: PeriodBucketMetrics[];
};

function formatIntPercent(value: number): string {
  return `${formatNumber(value, 0)}%`;
}

export function TemporalWeekDaysDetailTable({ buckets }: TemporalWeekDaysDetailTableProps) {
  if (buckets.length === 0) {
    return (
      <p className="temporal-empty temporal-empty--padded">
        No hay sesiones clínicas con sensor para este periodo.
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table className="sessions-table temporal-table">
        <thead>
          <tr>
            <th>Día / Fecha</th>
            <th>Sesiones clínicas</th>
            <th>Completadas</th>
            <th>Perfectas</th>
            <th>Interrumpidas</th>
            <th>Cumplimiento promedio</th>
            <th>Vol. máx. del día</th>
            <th>Vol. prom. del día</th>
            <th>Mejor sostén</th>
            <th>Intentos</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((row) => (
            <tr key={row.key}>
              <td>{formatDayLabel(row.key)}</td>
              <td>{formatNumber(row.sessionsCount)}</td>
              <td>{formatNumber(row.completedCount)}</td>
              <td>{formatNumber(row.perfectCount)}</td>
              <td>{formatNumber(row.interruptedCount)}</td>
              <td>{formatIntPercent(row.avgCompliancePercent)}</td>
              <td>{formatVolumeMl(row.maxVolumeMl)}</td>
              <td>{formatVolumeMl(row.avgVolumeMl)}</td>
              <td>{formatSeconds(row.bestHoldSeconds)}</td>
              <td>
                {row.validAttempts}/{row.totalAttempts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

