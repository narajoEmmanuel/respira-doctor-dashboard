import type { ExportSessionWithAttempts } from '../types/export';
import {
  dayKeysBetween,
  formatDayLabel,
  formatWeekLabel,
  isoWeekKeyFromDayKey,
  sessionLocalDayKey,
} from './dateKeys';

export type ClinicalTimeline = {
  navigableDayKeys: string[];
  navigableWeekKeys: string[];
};

export function buildClinicalTimeline(
  clinicalSessions: ExportSessionWithAttempts[],
): ClinicalTimeline {
  const sessionDays = new Set<string>();

  for (const { session } of clinicalSessions) {
    const dayKey = sessionLocalDayKey(session.session_date);
    if (dayKey) sessionDays.add(dayKey);
  }

  const sortedDays = [...sessionDays].sort();
  if (sortedDays.length === 0) {
    return { navigableDayKeys: [], navigableWeekKeys: [] };
  }

  const navigableDayKeys = dayKeysBetween(sortedDays[0]!, sortedDays[sortedDays.length - 1]!);

  const weekSet = new Set<string>();
  for (const dayKey of sortedDays) {
    const weekKey = isoWeekKeyFromDayKey(dayKey);
    if (weekKey) weekSet.add(weekKey);
  }

  const navigableWeekKeys = [...weekSet].sort();

  return { navigableDayKeys, navigableWeekKeys };
}

export function dayLabelForNav(dayKey: string): string {
  return formatDayLabel(dayKey);
}

export function weekLabelForNav(weekKey: string): string {
  return formatWeekLabel(weekKey);
}
