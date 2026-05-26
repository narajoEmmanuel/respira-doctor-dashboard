import type { PeriodBucketMetrics } from '../types/temporal';
import {
  formatNumber,
  formatPercent,
  formatSeconds,
  formatVolumeMl,
} from '../utils/format';

type TemporalTableProps = {
  buckets: PeriodBucketMetrics[];
  tableMode: 'day' | 'week';
};

export function TemporalTable({ buckets, tableMode }: TemporalTableProps) {
  if (buckets.length === 0) {
    return (
      <p className="temporal-empty">
        No hay sesiones clínicas con sensor para este periodo.
      </p>
    );
  }

  const periodCol = tableMode === 'day' ? 'Día' : 'Semana';

  return (
    <div className="table-wrap">
      <table className="sessions-table temporal-table">
        <thead>
          <tr>
            <th>{periodCol}</th>
            <th>Sesiones</th>
            <th>Días activos</th>
            <th>Días completos</th>
            <th>Días perfectos</th>
            <th>Días incompletos</th>
            <th>Prom. ses./día</th>
            <th>Días c/ interrup.</th>
            <th>Completadas</th>
            <th>Perfectas</th>
            <th>Vol. máx.</th>
            <th>Cumpl. prom.</th>
            <th>Mejor sostén</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{formatNumber(row.sessionsCount)}</td>
              <td>{formatNumber(row.activeDaysInPeriod)}</td>
              <td>{formatNumber(row.daysComplete)}</td>
              <td>{formatNumber(row.daysPerfect)}</td>
              <td>{formatNumber(row.daysIncomplete)}</td>
              <td>{row.avgSessionsPerActiveDay.toFixed(1)}</td>
              <td>{formatNumber(row.daysWithInterruption)}</td>
              <td>{formatNumber(row.completedCount)}</td>
              <td>{formatNumber(row.perfectCount)}</td>
              <td>{formatVolumeMl(row.maxVolumeMl)}</td>
              <td>{formatPercent(row.avgCompliancePercent)}</td>
              <td>{formatSeconds(row.bestHoldSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
