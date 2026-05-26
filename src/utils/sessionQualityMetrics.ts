import type { ExportSessionWithAttempts } from '../types/export';

export type SessionQualitySegmentId =
  | 'perfect'
  | 'interrupted'
  | 'completed-not-perfect'
  | 'other';

export type SessionQualitySegment = {
  id: SessionQualitySegmentId;
  label: string;
  count: number;
  color: string;
};

export type SessionQualityBreakdown = {
  total: number;
  segments: SessionQualitySegment[];
};

const SEGMENT_META: Record<
  SessionQualitySegmentId,
  { label: string; color: string }
> = {
  perfect: { label: 'Perfectas', color: '#34aba5' },
  interrupted: { label: 'Interrumpidas', color: '#f59e0b' },
  'completed-not-perfect': { label: 'Completadas, no perfectas', color: '#60a5fa' },
  other: { label: 'Otras / incompletas', color: '#9ca3af' },
};

function classifySession(session: ExportSessionWithAttempts['session']): SessionQualitySegmentId {
  if (session.interrupted === true) return 'interrupted';
  if (session.perfect) return 'perfect';
  if (session.completed) return 'completed-not-perfect';
  return 'other';
}

export function buildSessionQualityBreakdown(
  clinicalSessions: ExportSessionWithAttempts[],
): SessionQualityBreakdown {
  const counts: Record<SessionQualitySegmentId, number> = {
    perfect: 0,
    interrupted: 0,
    'completed-not-perfect': 0,
    other: 0,
  };

  for (const { session } of clinicalSessions) {
    counts[classifySession(session)] += 1;
  }

  const order: SessionQualitySegmentId[] = [
    'perfect',
    'interrupted',
    'completed-not-perfect',
    'other',
  ];

  const segments = order
    .map((id) => ({
      id,
      label: SEGMENT_META[id].label,
      count: counts[id],
      color: SEGMENT_META[id].color,
    }))
    .filter((s) => s.count > 0);

  return {
    total: clinicalSessions.length,
    segments,
  };
}
