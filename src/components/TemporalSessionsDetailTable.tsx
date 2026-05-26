import type { ExportSessionWithAttempts } from '../types/export';
import { getEffectiveCompliancePercent } from '../utils/complianceMetrics';
import { formatLevelLabel, formatPercent, formatSeconds, formatVolumeMl } from '../utils/format';

type TemporalSessionsDetailTableProps = {
  sessions: ExportSessionWithAttempts[];
};

function formatTimeOnly(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat('es-MX', { timeStyle: 'short' }).format(new Date(ms));
}

function statusLabel(session: ExportSessionWithAttempts['session']): string {
  if (session.interrupted === true) return 'Interrumpida';
  if (session.perfect === true) return 'Perfecta';
  if (session.completed === true) return 'Completada';
  return 'Incompleta';
}

function statusBadgeClass(session: ExportSessionWithAttempts['session']): string {
  if (session.interrupted === true) return 'badge badge--warning';
  if (session.perfect === true) return 'badge badge--success';
  if (session.completed === true) return 'badge badge--info';
  return 'badge badge--muted';
}

function bestHoldSeconds(attempts: ExportSessionWithAttempts['attempts']): number {
  let maxMs = 0;
  for (const attempt of attempts) {
    if (attempt.hold_ms > maxMs) maxMs = attempt.hold_ms;
  }
  return maxMs / 1000;
}

export function TemporalSessionsDetailTable({ sessions }: TemporalSessionsDetailTableProps) {
  if (sessions.length === 0) {
    return (
      <p className="temporal-empty temporal-empty--padded">
        No hay sesiones clínicas con sensor para este día.
      </p>
    );
  }

  const sorted = [...sessions].sort((a, b) => {
    const ta = Date.parse(a.session.session_date);
    const tb = Date.parse(b.session.session_date);
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return ta - tb;
    return a.session.session_id - b.session.session_id;
  });

  return (
    <div className="table-wrap">
      <table className="sessions-table temporal-table">
        <thead>
          <tr>
            <th>Sesión / ID</th>
            <th>Hora</th>
            <th>Nivel</th>
            <th>Estado</th>
            <th>Cumplimiento</th>
            <th>Vol. máx.</th>
            <th>Vol. prom.</th>
            <th>Mejor sostén</th>
            <th>Intentos</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ session, attempts }) => (
            <tr key={session.session_id}>
              <td>#{session.session_id}</td>
              <td>{formatTimeOnly(session.session_date)}</td>
              <td>{formatLevelLabel(session.level_id)}</td>
              <td>
                <span className={statusBadgeClass(session)}>{statusLabel(session)}</span>
              </td>
              <td>{formatPercent(getEffectiveCompliancePercent({ session, attempts }))}</td>
              <td>{formatVolumeMl(session.max_volume)}</td>
              <td>{formatVolumeMl(session.avg_volume)}</td>
              <td>{formatSeconds(bestHoldSeconds(attempts))}</td>
              <td>
                {session.valid_attempts}/{session.total_attempts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

