import type { SessionBucketMetrics } from '../types/temporal';
import { formatPercent, formatSeconds, formatVolumeMl } from '../utils/format';

type SessionDayTableProps = {
  rows: SessionBucketMetrics[];
};

function statusLabel(row: SessionBucketMetrics): string {
  if (row.interrupted) return 'Interrumpida';
  if (row.perfect) return 'Perfecta';
  if (row.completed) return 'Completada';
  return 'Incompleta';
}

export function SessionDayTable({ rows }: SessionDayTableProps) {
  return (
    <div className="table-wrap">
      <table className="sessions-table">
        <thead>
          <tr>
            <th>Sesión</th>
            <th>Estado</th>
            <th>Cumplimiento</th>
            <th>Vol. máx.</th>
            <th>Vol. prom.</th>
            <th>Mejor sostén</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sessionId}>
              <td>#{row.sessionId}</td>
              <td>{statusLabel(row)}</td>
              <td>{formatPercent(row.avgCompliancePercent)}</td>
              <td>{formatVolumeMl(row.maxVolumeMl)}</td>
              <td>{formatVolumeMl(row.avgVolumeMl)}</td>
              <td>{formatSeconds(row.bestHoldSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
