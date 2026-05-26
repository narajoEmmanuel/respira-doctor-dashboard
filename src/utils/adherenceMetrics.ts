import type { ExportSessionWithAttempts } from '../types/export';
import type {
  AdherenceInsight,
  AdherenceMetrics,
  AdherenceSummary,
  DayAdherenceStat,
} from '../types/adherence';
import { DAILY_SESSION_GOAL } from '../types/adherence';
import { addDaysLocal, sessionLocalDayKey } from './dateKeys';

type MutableDay = {
  sessionCount: number;
  completedCount: number;
  perfectCount: number;
  hasInterruption: boolean;
};

function buildDayMap(sessions: ExportSessionWithAttempts[]): Map<string, MutableDay> {
  const map = new Map<string, MutableDay>();

  for (const { session } of sessions) {
    const dayKey = sessionLocalDayKey(session.session_date);
    if (!dayKey) continue;

    let day = map.get(dayKey);
    if (!day) {
      day = {
        sessionCount: 0,
        completedCount: 0,
        perfectCount: 0,
        hasInterruption: false,
      };
      map.set(dayKey, day);
    }

    day.sessionCount += 1;
    if (session.completed) day.completedCount += 1;
    if (session.perfect) day.perfectCount += 1;
    if (session.interrupted === true) day.hasInterruption = true;
  }

  return map;
}

function toDayStats(map: Map<string, MutableDay>): DayAdherenceStat[] {
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, d]) => {
      const isCompleteDay = d.completedCount >= DAILY_SESSION_GOAL;
      const isPerfectDay = d.perfectCount >= DAILY_SESSION_GOAL;
      return {
        dayKey,
        sessionCount: d.sessionCount,
        completedCount: d.completedCount,
        perfectCount: d.perfectCount,
        hasInterruption: d.hasInterruption,
        isCompleteDay,
        isPerfectDay,
        isIncompleteDay: !isCompleteDay,
      };
    });
}

function bestCalendarStreak(
  minDay: string,
  maxDay: string,
  isCompliant: (dayKey: string) => boolean,
): number {
  let best = 0;
  let current = 0;
  let cursor = minDay;

  while (cursor <= maxDay) {
    if (isCompliant(cursor)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
    cursor = addDaysLocal(cursor, 1);
  }

  return best;
}

function currentStreakFromLastActive(
  lastActiveDay: string,
  dayMap: Map<string, MutableDay>,
): number {
  let streak = 0;
  let cursor = lastActiveDay;

  while (true) {
    const day = dayMap.get(cursor);
    if (!day) break;
    if (day.completedCount < DAILY_SESSION_GOAL) break;
    streak += 1;
    cursor = addDaysLocal(cursor, -1);
  }

  return streak;
}

export function computeAdherenceMetrics(
  clinicalSessions: ExportSessionWithAttempts[],
): AdherenceMetrics {
  const dayMap = buildDayMap(clinicalSessions);
  const dailyStats = toDayStats(dayMap);
  const activeDays = dailyStats.length;

  if (activeDays === 0) {
    return {
      activeDays: 0,
      totalClinicalSessions: 0,
      daysComplete: 0,
      daysPerfect: 0,
      daysIncomplete: 0,
      daysWithInterruption: 0,
      percentDaysComplete: 0,
      percentDaysPerfect: 0,
      percentDaysIncomplete: 0,
      percentDaysWithInterruption: 0,
      avgSessionsPerActiveDay: 0,
      bestStreakDays: 0,
      currentStreakDays: 0,
      dailyStats: [],
    };
  }

  const daysComplete = dailyStats.filter((d) => d.isCompleteDay).length;
  const daysPerfect = dailyStats.filter((d) => d.isPerfectDay).length;
  const daysIncomplete = dailyStats.filter((d) => d.isIncompleteDay).length;
  const daysWithInterruption = dailyStats.filter((d) => d.hasInterruption).length;
  const totalClinicalSessions = dailyStats.reduce((sum, d) => sum + d.sessionCount, 0);

  const minDay = dailyStats[0]!.dayKey;
  const maxDay = dailyStats[dailyStats.length - 1]!.dayKey;

  const isCompliantDay = (dayKey: string): boolean => {
    const day = dayMap.get(dayKey);
    return day != null && day.completedCount >= DAILY_SESSION_GOAL;
  };

  return {
    activeDays,
    totalClinicalSessions,
    daysComplete,
    daysPerfect,
    daysIncomplete,
    daysWithInterruption,
    percentDaysComplete: (daysComplete / activeDays) * 100,
    percentDaysPerfect: (daysPerfect / activeDays) * 100,
    percentDaysIncomplete: (daysIncomplete / activeDays) * 100,
    percentDaysWithInterruption: (daysWithInterruption / activeDays) * 100,
    avgSessionsPerActiveDay: totalClinicalSessions / activeDays,
    bestStreakDays: bestCalendarStreak(minDay, maxDay, isCompliantDay),
    currentStreakDays: currentStreakFromLastActive(maxDay, dayMap),
    dailyStats,
  };
}

function insight(
  id: string,
  text: string,
  tag: string,
  tone: AdherenceInsight['tone'],
): AdherenceInsight {
  return { id, text, tag, tone };
}

export function buildAdherenceSummary(adherence: AdherenceMetrics): AdherenceSummary {
  if (adherence.activeDays === 0) {
    return {
      insights: [
        insight(
          'no-data',
          'Sin días con sesiones clínicas registradas en este periodo.',
          'Sin datos de adherencia',
          'neutral',
        ),
      ],
    };
  }

  const insights: AdherenceInsight[] = [];
  const n = adherence.activeDays;

  insights.push(
    insight(
      'days-complete',
      `${adherence.percentDaysComplete.toFixed(0)}% de los días completó el entrenamiento diario (${adherence.daysComplete} de ${n} días activos).`,
      adherence.percentDaysComplete >= 70
        ? 'Buena adherencia diaria'
        : adherence.percentDaysComplete >= 50
          ? 'Constancia moderada'
          : 'Cumplimiento irregular',
      adherence.percentDaysComplete >= 70 ? 'success' : adherence.percentDaysComplete >= 50 ? 'info' : 'warning',
    ),
  );

  insights.push(
    insight(
      'days-perfect',
      `${adherence.percentDaysPerfect.toFixed(0)}% de los días logró 6/6 sesiones perfectas (${adherence.daysPerfect} de ${n}).`,
      adherence.percentDaysPerfect >= 50
        ? 'Buena calidad diaria'
        : 'Calidad variable',
      adherence.percentDaysPerfect >= 50 ? 'success' : 'info',
    ),
  );

  insights.push(
    insight(
      'days-incomplete',
      `${adherence.percentDaysIncomplete.toFixed(0)}% de los días quedaron con entrenamiento incompleto (${adherence.daysIncomplete} de ${n}).`,
      adherence.percentDaysIncomplete <= 30
        ? 'Pocos días incompletos'
        : 'Varios días incompletos',
      adherence.percentDaysIncomplete <= 30 ? 'success' : 'warning',
    ),
  );

  insights.push(
    insight(
      'avg-sessions',
      `Promedio de ${adherence.avgSessionsPerActiveDay.toFixed(1)} sesiones clínicas por día activo (meta: ${DAILY_SESSION_GOAL}/día).`,
      adherence.avgSessionsPerActiveDay >= DAILY_SESSION_GOAL
        ? 'Meta diaria alcanzada en promedio'
        : 'Por debajo de la meta diaria',
      adherence.avgSessionsPerActiveDay >= DAILY_SESSION_GOAL ? 'success' : 'warning',
    ),
  );

  insights.push(
    insight(
      'streaks',
      `Mejor racha: ${adherence.bestStreakDays} día${adherence.bestStreakDays === 1 ? '' : 's'} consecutivos · Racha actual: ${adherence.currentStreakDays} día${adherence.currentStreakDays === 1 ? '' : 's'}.`,
      adherence.bestStreakDays >= 5
        ? 'Buena consistencia postoperatoria'
        : adherence.currentStreakDays >= 3
          ? 'Racha reciente favorable'
          : 'Constancia limitada',
      adherence.bestStreakDays >= 5 || adherence.currentStreakDays >= 3 ? 'success' : 'info',
    ),
  );

  if (adherence.daysWithInterruption > 0) {
    insights.push(
      insight(
        'interruptions',
        `${adherence.percentDaysWithInterruption.toFixed(0)}% de los días presentaron al menos una interrupción (${adherence.daysWithInterruption} de ${n}).`,
        adherence.percentDaysWithInterruption >= 30
          ? 'Interrupciones frecuentes'
          : 'Interrupciones ocasionales',
        adherence.percentDaysWithInterruption >= 30 ? 'warning' : 'info',
      ),
    );
  }

  return { insights };
}

/** Agrega estadísticas diarias dentro de un bucket (día o semana). */
export function aggregateDayStatsForKeys(
  dailyStats: DayAdherenceStat[],
  dayKeys: string[],
): {
  activeDaysInPeriod: number;
  daysComplete: number;
  daysPerfect: number;
  daysIncomplete: number;
  daysWithInterruption: number;
  totalSessions: number;
  avgSessionsPerDay: number;
} {
  const keySet = new Set(dayKeys);
  const inPeriod = dailyStats.filter((d) => keySet.has(d.dayKey));
  const activeDaysInPeriod = inPeriod.length;
  const daysComplete = inPeriod.filter((d) => d.isCompleteDay).length;
  const daysPerfect = inPeriod.filter((d) => d.isPerfectDay).length;
  const daysIncomplete = inPeriod.filter((d) => d.isIncompleteDay).length;
  const daysWithInterruption = inPeriod.filter((d) => d.hasInterruption).length;
  const totalSessions = inPeriod.reduce((sum, d) => sum + d.sessionCount, 0);

  return {
    activeDaysInPeriod,
    daysComplete,
    daysPerfect,
    daysIncomplete,
    daysWithInterruption,
    totalSessions,
    avgSessionsPerDay:
      activeDaysInPeriod > 0 ? totalSessions / activeDaysInPeriod : 0,
  };
}
