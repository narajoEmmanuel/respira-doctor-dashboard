/** Meta terapéutica diaria postoperatoria (sesiones clínicas con sensor). */
export const DAILY_SESSION_GOAL = 6;

export type DayAdherenceStat = {
  dayKey: string;
  sessionCount: number;
  completedCount: number;
  perfectCount: number;
  hasInterruption: boolean;
  isCompleteDay: boolean;
  isPerfectDay: boolean;
  isIncompleteDay: boolean;
};

export type AdherenceMetrics = {
  activeDays: number;
  totalClinicalSessions: number;
  daysComplete: number;
  daysPerfect: number;
  daysIncomplete: number;
  daysWithInterruption: number;
  percentDaysComplete: number;
  percentDaysPerfect: number;
  percentDaysIncomplete: number;
  percentDaysWithInterruption: number;
  avgSessionsPerActiveDay: number;
  bestStreakDays: number;
  currentStreakDays: number;
  dailyStats: DayAdherenceStat[];
};

export type AdherenceInsight = {
  id: string;
  text: string;
  tag: string;
  tone: 'success' | 'warning' | 'info' | 'neutral';
};

export type AdherenceSummary = {
  insights: AdherenceInsight[];
};
