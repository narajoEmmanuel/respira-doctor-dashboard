import type { SessionTableRow } from '../types/export';
import { formatNumber, formatPercent, formatSeconds, formatVolumeMl } from '../utils/format';
import { ClinicalEmptyState } from './ClinicalEmptyState';

type SessionsTableProps = {
  rows: SessionTableRow[];
};

function statusBadge(row: SessionTableRow): string {
  if (row.interrupted) return 'Interrumpida';
  if (row.perfect) return 'Perfecta';
  if (row.completed) return 'Completada';
  return 'Incompleta';
}

function statusClass(row: SessionTableRow): string {
  if (row.interrupted) return 'badge badge--warning';
  if (row.perfect) return 'badge badge--success';
  if (row.completed) return 'badge badge--info';
  return 'badge badge--muted';
}

export function SessionsTable({ rows }: SessionsTableProps) {
  return (
    <section className="panel sessions-panel" aria-label="Tabla de sesiones clínicas con sensor">
      <div className="panel__header">
        <h2>Sesiones clínicas con sensor</h2>
        <p>
          {rows.length > 0
            ? `${formatNumber(rows.length)} sesiones con medición real`
            : 'Sin sesiones con sensor en esta exportación'}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="sessions-panel__empty">
          <ClinicalEmptyState />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Cumplimiento</th>
                <th>Vol. máx.</th>
                <th>Vol. prom.</th>
                <th>Sostén prom.</th>
                <th>Intentos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sessionId}>
                  <td>{row.sessionId}</td>
                  <td>{row.dateFormatted}</td>
                  <td>{row.levelLabel}</td>
                  <td>
                    <span className={statusClass(row)}>{statusBadge(row)}</span>
                  </td>
                  <td>{formatPercent(row.compliancePercent)}</td>
                  <td>{formatVolumeMl(row.maxVolume)}</td>
                  <td>{formatVolumeMl(row.avgVolume)}</td>
                  <td>{formatSeconds(row.avgHoldSeconds)}</td>
                  <td>
                    {row.validAttempts}/{row.totalAttempts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
