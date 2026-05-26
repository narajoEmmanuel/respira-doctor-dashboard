const shortWeekdayFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short' });

const LOCALE = 'es-MX';

/** Día calendario local YYYY-MM-DD (alineado con Respira+). */
export function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Día local para session_date (ISO o YYYY-MM-DD legacy).
 * No usa toISOString().slice(0, 10) para evitar desfase UTC.
 */
export function sessionLocalDayKey(sessionDate: string | null | undefined): string | null {
  if (sessionDate == null) return null;
  const trimmed = String(sessionDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const ms = Date.parse(trimmed);
  if (!Number.isNaN(ms)) {
    return getLocalDateKey(new Date(ms));
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  return null;
}

function parseYmd(ymd: string): Date | null {
  const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function addDaysLocal(ymd: string, deltaDays: number): string {
  const date = parseYmd(ymd);
  if (!date) return ymd;
  date.setDate(date.getDate() + deltaDays);
  return getLocalDateKey(date);
}

/** Días calendario entre dos claves YYYY-MM-DD (inclusive). */
export function dayKeysBetween(start: string, end: string): string[] {
  if (start > end) return [];
  const keys: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(cursor);
    cursor = addDaysLocal(cursor, 1);
  }
  return keys;
}

/** Lunes de la semana ISO (año + número de semana, lunes–domingo). */
export function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7;
  const mondayWeek1 = new Date(year, 0, 4 - dayOfWeek);
  const monday = new Date(mondayWeek1);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}

/** Clave ISO YYYY-Www (semana lunes–domingo). */
export function isoWeekKeyFromDayKey(dayKey: string): string | null {
  const date = parseYmd(dayKey);
  if (!date) return null;

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const weekYear = d.getFullYear();

  const week1Monday = mondayOfIsoWeek(weekYear, 1);
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const diffDays = Math.round((monday.getTime() - week1Monday.getTime()) / 86400000);
  const week = 1 + Math.floor(diffDays / 7);

  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}

export function monthKeyFromDayKey(dayKey: string): string | null {
  const match = dayKey.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

export function periodKeyForSession(sessionDate: string): { key: string; sortKey: string } | null {
  const dayKey = sessionLocalDayKey(sessionDate);
  if (!dayKey) return null;

  const weekKey = isoWeekKeyFromDayKey(dayKey);
  if (!weekKey) return null;
  return { key: weekKey, sortKey: weekKey };
}

export function weekDayKeysFromWeekKey(weekKey: string): string[] {
  return weekDayKeys(weekKey);
}

function weekDayKeys(weekKey: string): string[] {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return [];
  const monday = mondayOfIsoWeek(Number(match[1]), Number(match[2]));
  const keys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    keys.push(getLocalDateKey(d));
  }
  return keys;
}

function parseWeekKey(weekKey: string): { year: number; week: number } | null {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), week: Number(match[2]) };
}

const shortMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
});

export function formatShortWeekdayLabel(dayKey: string): string {
  const date = parseYmd(dayKey);
  if (!date) return dayKey;
  const raw = shortWeekdayFormatter.format(date).replace(/\.$/, '');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatDayLabel(dayKey: string): string {
  const date = parseYmd(dayKey);
  if (!date) return dayKey;
  return shortMonthFormatter.format(date);
}

export function formatWeekLabel(weekKey: string): string {
  const parsed = parseWeekKey(weekKey);
  if (!parsed) return weekKey;
  const monday = mondayOfIsoWeek(parsed.year, parsed.week);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const start = shortMonthFormatter.format(monday);
  const endDay = sunday.getDate();
  const endMonth = sunday.toLocaleDateString(LOCALE, { month: 'short' });
  const endYear = sunday.getFullYear();
  const startYear = monday.getFullYear();

  if (startYear === endYear && monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${endDay} ${endMonth} ${endYear}`;
  }

  return `${start} – ${shortMonthFormatter.format(sunday)}`;
}

export function formatMonthLabel(monthKey: string): string {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return monthKey;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return monthYearFormatter.format(date);
}

export function formatPeriodLabel(key: string): string {
  return formatWeekLabel(key);
}
