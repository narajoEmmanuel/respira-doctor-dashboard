import type { ExportSessionWithAttempts } from '../types/export';
import type { SessionBucketMetrics } from '../types/temporal';
import { getEffectiveCompliancePercent } from './complianceMetrics';
import { sessionLocalDayKey } from './dateKeys';

export function sessionsOnDay(
  clinicalSessions: ExportSessionWithAttempts[],
  dayKey: string,
): ExportSessionWithAttempts[] {
  return clinicalSessions
    .filter((item) => sessionLocalDayKey(item.session.session_date) === dayKey)
    .sort((a, b) => {
      const ta = Date.parse(a.session.session_date);
      const tb = Date.parse(b.session.session_date);
      if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return ta - tb;
      return a.session.session_id - b.session.session_id;
    });
}

export function buildSessionBucketsForDay(
  clinicalSessions: ExportSessionWithAttempts[],
  dayKey: string,
): SessionBucketMetrics[] {
  const daySessions = sessionsOnDay(clinicalSessions, dayKey);

  return daySessions.map((item) => {
    const { session, attempts } = item;
    let maxHoldMs = 0;
    for (const attempt of attempts) {
      if (attempt.hold_ms > maxHoldMs) maxHoldMs = attempt.hold_ms;
    }

    const interrupted = session.interrupted === true;

    return {
      key: String(session.session_id),
      sortKey: String(session.session_id).padStart(8, '0'),
      label: `#${session.session_id}`,
      sessionId: session.session_id,
      sessionsCount: 1,
      completedCount: session.completed ? 1 : 0,
      perfectCount: session.perfect ? 1 : 0,
      interruptedCount: interrupted ? 1 : 0,
      avgCompliancePercent: getEffectiveCompliancePercent(item),
      maxVolumeMl: session.max_volume,
      avgVolumeMl: session.avg_volume,
      bestHoldSeconds: maxHoldMs / 1000,
      validAttempts: session.valid_attempts,
      invalidAttempts: session.invalid_attempts,
      totalAttempts: session.total_attempts,
      completed: session.completed,
      perfect: session.perfect,
      interrupted,
    };
  });
}
