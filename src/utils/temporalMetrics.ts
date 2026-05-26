import type { ClinicalExportSnapshot, ExportSessionWithAttempts, LevelId } from '../types/export';
import type { DayAdherenceStat } from '../types/adherence';
import type { PeriodBucketMetrics, TemporalAnalysis } from '../types/temporal';
import { aggregateDayStatsForKeys, computeAdherenceMetrics } from './adherenceMetrics';
import { formatWeekLabel } from './dateKeys';
import { formatLevelLabel } from './format';
import { periodKeyForSession, sessionLocalDayKey, weekDayKeysFromWeekKey } from './dateKeys';
import { averageEffectiveCompliancePercent, getEffectiveCompliancePercent } from './complianceMetrics';
import { getClinicalSessions } from './metrics';

type MutableBucket = Omit<
  PeriodBucketMetrics,
  | 'label'
  | 'topLevelLabel'
  | 'avgCompliancePercent'
  | 'avgVolumeMl'
  | 'bestHoldSeconds'
  | 'activeDaysInPeriod'
  | 'daysComplete'
  | 'daysPerfect'
  | 'daysIncomplete'
  | 'daysWithInterruption'
  | 'avgSessionsPerActiveDay'
> & {
  complianceSum: number;
  complianceCount: number;
  volumeSum: number;
  volumeCount: number;
  maxHoldMs: number;
  levelCounts: Map<string, number>;
  dayKeysInBucket: Set<string>;
};

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

function finalizeBucket(
  raw: MutableBucket,
  dailyStats: DayAdherenceStat[],
): PeriodBucketMetrics {
  const adherence = aggregateDayStatsForKeys(dailyStats, [...raw.dayKeysInBucket]);

  return {
    key: raw.key,
    sortKey: raw.sortKey,
    label: formatWeekLabel(raw.key),
    sessionsCount: raw.sessionsCount,
    completedCount: raw.completedCount,
    perfectCount: raw.perfectCount,
    interruptedCount: raw.interruptedCount,
    avgCompliancePercent:
      raw.complianceCount > 0 ? raw.complianceSum / raw.complianceCount : 0,
    maxVolumeMl: raw.maxVolumeMl,
    avgVolumeMl: raw.volumeCount > 0 ? raw.volumeSum / raw.volumeCount : 0,
    bestHoldSeconds: raw.maxHoldMs / 1000,
    topLevelLabel: resolveTopLevel(raw.levelCounts),
    validAttempts: raw.validAttempts,
    invalidAttempts: raw.invalidAttempts,
    totalAttempts: raw.totalAttempts,
    activeDaysInPeriod: adherence.activeDaysInPeriod,
    daysComplete: adherence.daysComplete,
    daysPerfect: adherence.daysPerfect,
    daysIncomplete: adherence.daysIncomplete,
    daysWithInterruption: adherence.daysWithInterruption,
    avgSessionsPerActiveDay: adherence.avgSessionsPerDay,
  };
}

function emptyBucket(key: string, sortKey: string): MutableBucket {
  return {
    key,
    sortKey,
    sessionsCount: 0,
    completedCount: 0,
    perfectCount: 0,
    interruptedCount: 0,
    maxVolumeMl: 0,
    complianceSum: 0,
    complianceCount: 0,
    volumeSum: 0,
    volumeCount: 0,
    maxHoldMs: 0,
    validAttempts: 0,
    invalidAttempts: 0,
    totalAttempts: 0,
    levelCounts: new Map(),
    dayKeysInBucket: new Set(),
  };
}

function aggregateWeeklySessions(
  clinicalSessions: ExportSessionWithAttempts[],
  dailyStats: DayAdherenceStat[],
): TemporalAnalysis {
  const map = new Map<string, MutableBucket>();
  let skippedSessionsCount = 0;

  for (const { session, attempts } of clinicalSessions) {
    const period = periodKeyForSession(session.session_date);
    if (!period) {
      skippedSessionsCount += 1;
      continue;
    }

    const dayKey = sessionLocalDayKey(session.session_date);
    if (!dayKey) {
      skippedSessionsCount += 1;
      continue;
    }

    let bucket = map.get(period.key);
    if (!bucket) {
      bucket = emptyBucket(period.key, period.sortKey);
      for (const k of weekDayKeysFromWeekKey(period.key)) {
        bucket.dayKeysInBucket.add(k);
      }
      map.set(period.key, bucket);
    }

    bucket.sessionsCount += 1;
    if (session.completed) bucket.completedCount += 1;
    if (session.perfect) bucket.perfectCount += 1;
    if (session.interrupted === true) bucket.interruptedCount += 1;

    bucket.complianceSum += getEffectiveCompliancePercent({ session, attempts });
    bucket.complianceCount += 1;

    if (session.max_volume > bucket.maxVolumeMl) {
      bucket.maxVolumeMl = session.max_volume;
    }

    if (session.avg_volume > 0) {
      bucket.volumeSum += session.avg_volume;
      bucket.volumeCount += 1;
    }

    bucket.validAttempts += session.valid_attempts;
    bucket.invalidAttempts += session.invalid_attempts;
    bucket.totalAttempts += session.total_attempts;

    const prevLevel = bucket.levelCounts.get(session.level_id) ?? 0;
    bucket.levelCounts.set(session.level_id, prevLevel + 1);

    for (const attempt of attempts) {
      if (attempt.hold_ms > bucket.maxHoldMs) {
        bucket.maxHoldMs = attempt.hold_ms;
      }
    }
  }

  for (const bucket of map.values()) {
    const activeInWeek = dailyStats
      .filter((d) => {
        const dayKeys = weekDayKeysFromWeekKey(bucket.key);
        return dayKeys.includes(d.dayKey);
      })
      .map((d) => d.dayKey);
    bucket.dayKeysInBucket = new Set(activeInWeek);
  }

  const buckets = [...map.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((raw) => finalizeBucket(raw, dailyStats));

  return {
    granularity: 'week',
    buckets,
    skippedSessionsCount,
  };
}

export function computeTemporalAnalysis(snapshot: ClinicalExportSnapshot): TemporalAnalysis {
  const clinical = getClinicalSessions(snapshot);
  const { dailyStats } = computeAdherenceMetrics(clinical);
  return aggregateWeeklySessions(clinical, dailyStats);
}

/** Buckets con campos de gráfica (sesión o periodo). */
export type TemporalChartBucket = {
  label: string;
  sessionsCount: number;
  completedCount: number;
  perfectCount: number;
  interruptedCount: number;
  avgCompliancePercent: number;
  maxVolumeMl: number;
  avgVolumeMl: number;
  validAttempts: number;
  totalAttempts: number;
  sessionStatus?: string;
};

function sessionStatusFromCounts(
  completedCount: number,
  perfectCount: number,
  interruptedCount: number,
  sessionsCount: number,
): string {
  if (interruptedCount > 0) return 'Interrumpida';
  if (perfectCount >= sessionsCount && sessionsCount > 0) return 'Perfecta';
  if (completedCount >= sessionsCount && sessionsCount > 0) return 'Completada';
  if (completedCount > 0) return 'Parcialmente completada';
  return 'No completada';
}

export function buildDayAdherenceChartBucket(
  _dayKey: string,
  label: string,
  daySessions: import('../types/export').ExportSessionWithAttempts[],
): TemporalChartBucket {
  const records = daySessions.map((item) => item.session);
  const volumeSamples = records.filter((s) => s.avg_volume > 0);
  const completedCount = records.filter((s) => s.completed).length;
  const perfectCount = records.filter((s) => s.perfect).length;
  const interruptedCount = records.filter((s) => s.interrupted === true).length;

  return {
    label,
    sessionsCount: daySessions.length,
    completedCount,
    perfectCount,
    interruptedCount,
    avgCompliancePercent: averageEffectiveCompliancePercent(daySessions),
    maxVolumeMl: Math.max(0, ...records.map((s) => s.max_volume)),
    avgVolumeMl:
      volumeSamples.length > 0
        ? volumeSamples.reduce((sum, s) => sum + s.avg_volume, 0) / volumeSamples.length
        : 0,
    validAttempts: records.reduce((sum, s) => sum + s.valid_attempts, 0),
    totalAttempts: records.reduce((sum, s) => sum + s.total_attempts, 0),
  };
}

export function toChartBuckets(
  buckets: PeriodBucketMetrics[] | import('../types/temporal').SessionBucketMetrics[],
): TemporalChartBucket[] {
  return buckets.map((b) => {
    const sessionStatus =
      'completed' in b
        ? sessionStatusFromCounts(
            b.completedCount,
            b.perfectCount,
            b.interruptedCount,
            b.sessionsCount,
          )
        : undefined;

    return {
      label: b.label,
      sessionsCount: b.sessionsCount,
      completedCount: b.completedCount,
      perfectCount: b.perfectCount,
      interruptedCount: b.interruptedCount,
      avgCompliancePercent: b.avgCompliancePercent,
      maxVolumeMl: b.maxVolumeMl,
      avgVolumeMl: b.avgVolumeMl,
      validAttempts: b.validAttempts,
      totalAttempts: b.totalAttempts,
      sessionStatus:
        'completed' in b
          ? b.interrupted
            ? 'Interrumpida'
            : b.perfect
              ? 'Perfecta'
              : b.completed
                ? 'Completada'
                : 'No completada'
          : sessionStatus,
    };
  });
}
