import type { ExportSessionWithAttempts } from '../types/export';
import type { TemporalViewMode } from '../types/temporal';
import { sessionLocalDayKey, weekDayKeysFromWeekKey } from './dateKeys';
import { sessionsOnDay } from './intraDayMetrics';

export function getVisibleClinicalSessions(
  viewMode: TemporalViewMode,
  clinical: ExportSessionWithAttempts[],
  visibleDayKey: string | undefined,
  visibleWeekKey: string | undefined,
): ExportSessionWithAttempts[] {
  if (viewMode === 'session-day' && visibleDayKey) {
    return sessionsOnDay(clinical, visibleDayKey);
  }

  if (viewMode === 'week-days' && visibleWeekKey) {
    const dayKeys = new Set(weekDayKeysFromWeekKey(visibleWeekKey));
    return clinical.filter((item) => {
      const dayKey = sessionLocalDayKey(item.session.session_date);
      return dayKey != null && dayKeys.has(dayKey);
    });
  }

  return clinical;
}
