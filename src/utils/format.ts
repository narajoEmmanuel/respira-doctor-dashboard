import type { LevelId } from '../types/export';

export function formatLevelLabel(levelId: string | null | undefined): string {
  if (!levelId) return 'Sin nivel';
  const match = /^level-(\d+)$/.exec(levelId);
  return match ? `Nivel ${match[1]}` : levelId;
}

export function formatLevelId(levelId: LevelId): string {
  return formatLevelLabel(levelId);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(ms));
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatVolumeMl(value: number): string {
  return `${formatNumber(value)} ml`;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function formatSeconds(value: number): string {
  return `${formatNumber(value, 1)} s`;
}
