import type { ExportSessionWithAttempts } from '../types/export';

export function isClinicallyEmptyInterruptedSession(
  sessionWithAttempts: ExportSessionWithAttempts,
): boolean {
  const { session, attempts } = sessionWithAttempts;
  return (
    session.interrupted === true &&
    session.completed === false &&
    attempts.length === 0 &&
    session.max_volume === 0 &&
    session.avg_volume === 0
  );
}

/** Cumplimiento efectivo para evitar falsos 100% en sesiones vacías/interrumpidas. */
export function getEffectiveCompliancePercent(
  sessionWithAttempts: ExportSessionWithAttempts,
): number {
  const { session } = sessionWithAttempts;
  if (isClinicallyEmptyInterruptedSession(sessionWithAttempts)) return 0;
  return session.compliance_percent;
}

export function averageEffectiveCompliancePercent(
  sessionsWithAttempts: ExportSessionWithAttempts[],
): number {
  if (sessionsWithAttempts.length === 0) return 0;
  const sum = sessionsWithAttempts.reduce(
    (acc, item) => acc + getEffectiveCompliancePercent(item),
    0,
  );
  return sum / sessionsWithAttempts.length;
}
