/** Vista temporal en “Evolución por periodo”. */
export type TemporalViewMode = 'session-day' | 'week-days';

/** Granularidad interna para agregación semanal (histórica) */
export type PeriodGranularity = 'week';

export type PeriodBucketMetrics = {
  key: string;
  label: string;
  sortKey: string;
  sessionsCount: number;
  completedCount: number;
  perfectCount: number;
  interruptedCount: number;
  avgCompliancePercent: number;
  maxVolumeMl: number;
  avgVolumeMl: number;
  bestHoldSeconds: number;
  topLevelLabel: string;
  validAttempts: number;
  invalidAttempts: number;
  totalAttempts: number;
  activeDaysInPeriod: number;
  daysComplete: number;
  daysPerfect: number;
  daysIncomplete: number;
  daysWithInterruption: number;
  avgSessionsPerActiveDay: number;
};

/** Bucket por sesión (vista Sesiones del día). Compatible con gráficas temporales. */
export type SessionBucketMetrics = {
  key: string;
  label: string;
  sortKey: string;
  sessionId: number;
  sessionsCount: number;
  completedCount: number;
  perfectCount: number;
  interruptedCount: number;
  avgCompliancePercent: number;
  maxVolumeMl: number;
  avgVolumeMl: number;
  bestHoldSeconds: number;
  validAttempts: number;
  invalidAttempts: number;
  totalAttempts: number;
  completed: boolean;
  perfect: boolean;
  interrupted: boolean;
};

export type ChartBucket = PeriodBucketMetrics | SessionBucketMetrics;

export type TemporalAnalysis = {
  granularity: PeriodGranularity;
  buckets: PeriodBucketMetrics[];
  skippedSessionsCount: number;
};
