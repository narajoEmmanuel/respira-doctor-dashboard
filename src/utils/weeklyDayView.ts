import type { ExportSessionWithAttempts, LevelId } from '../types/export';
import type { DayAdherenceStat } from '../types/adherence';
import type { PeriodBucketMetrics } from '../types/temporal';
import { DAILY_SESSION_GOAL } from '../types/adherence';
import { computeAdherenceMetrics } from './adherenceMetrics';
import { averageEffectiveCompliancePercent } from './complianceMetrics';
import { formatShortWeekdayLabel, sessionLocalDayKey, weekDayKeysFromWeekKey } from './dateKeys';
import { formatLevelLabel } from './format';
import { getClinicalSessions } from './metrics';
import type { ClinicalExportSnapshot } from '../types/export';

function levelRank(levelId: string): number {
  const match = /^level-(\d+)$/.exec(levelId);
  return match ? Number(match[1]) : 0;
}

function resolveTopLevel(levelCounts: Map<string, number>): string {
  let bestId: LevelId | null = null;
  let bestCount = -1;
  let bestRank = -1;
  for (const [levelId, count] of levelCounts) {
    const rank = levelRank(levelId);
    if (count > bestCount || (count === bestCount && rank > bestRank)) {
      bestCount = count;
      bestRank = rank;
      bestId = levelId as LevelId;
    }
  }
  return bestId ? formatLevelLabel(bestId) : '—';
}

function aggregateDay(
  dayKey: string,
  clinicalSessions: ExportSessionWithAttempts[],
  dailyStats: DayAdherenceStat[],
): PeriodBucketMetrics {
  const dayStat = dailyStats.find((d) => d.dayKey === dayKey);
  const daySessions = clinicalSessions.filter(
    (item) => sessionLocalDayKey(item.session.session_date) === dayKey,
  );

  let maxVolumeMl = 0;
  let volumeSum = 0;
  let volumeCount = 0;
  let maxHoldMs = 0;
  let completedCount = 0;
  let perfectCount = 0;
  let interruptedCount = 0;
  let validAttempts = 0;
  let invalidAttempts = 0;
  let totalAttempts = 0;
  const levelCounts = new Map<string, number>();

  for (const { session, attempts } of daySessions) {
    if (session.completed) completedCount += 1;
    if (session.perfect) perfectCount += 1;
    if (session.interrupted === true) interruptedCount += 1;
    if (session.max_volume > maxVolumeMl) maxVolumeMl = session.max_volume;
    if (session.avg_volume > 0) {
      volumeSum += session.avg_volume;
      volumeCount += 1;
    }
    validAttempts += session.valid_attempts;
    invalidAttempts += session.invalid_attempts;
    totalAttempts += session.total_attempts;
    levelCounts.set(session.level_id, (levelCounts.get(session.level_id) ?? 0) + 1);
    for (const attempt of attempts) {
      if (attempt.hold_ms > maxHoldMs) maxHoldMs = attempt.hold_ms;
    }
  }

  const sessionsCount = daySessions.length;
  const isCompleteDay = completedCount >= DAILY_SESSION_GOAL;
  const isPerfectDay = perfectCount >= DAILY_SESSION_GOAL;

  return {
    key: dayKey,
    sortKey: dayKey,
    label: formatShortWeekdayLabel(dayKey),
    sessionsCount,
    completedCount,
    perfectCount,
    interruptedCount,
    avgCompliancePercent: averageEffectiveCompliancePercent(daySessions),
    maxVolumeMl,
    avgVolumeMl: volumeCount > 0 ? volumeSum / volumeCount : 0,
    bestHoldSeconds: maxHoldMs / 1000,
    topLevelLabel: resolveTopLevel(levelCounts),
    validAttempts,
    invalidAttempts,
    totalAttempts,
    activeDaysInPeriod: sessionsCount > 0 ? 1 : 0,
    daysComplete: isCompleteDay ? 1 : 0,
    daysPerfect: isPerfectDay ? 1 : 0,
    daysIncomplete: sessionsCount > 0 && !isCompleteDay ? 1 : 0,
    daysWithInterruption: dayStat?.hasInterruption || interruptedCount > 0 ? 1 : 0,
    avgSessionsPerActiveDay: sessionsCount,
  };
}

export function buildWeekDayBuckets(
  weekKey: string,
  clinicalSessions: ExportSessionWithAttempts[],
  dailyStats: DayAdherenceStat[],
): PeriodBucketMetrics[] {
  const dayKeys = weekDayKeysFromWeekKey(weekKey);
  return dayKeys.map((dayKey) => aggregateDay(dayKey, clinicalSessions, dailyStats));
}

export function buildWeekDayBucketsFromSnapshot(
  snapshot: ClinicalExportSnapshot,
  weekKey: string,
): PeriodBucketMetrics[] {
  const clinical = getClinicalSessions(snapshot);
  const { dailyStats } = computeAdherenceMetrics(clinical);
  return buildWeekDayBuckets(weekKey, clinical, dailyStats);
}
