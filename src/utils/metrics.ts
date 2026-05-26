import type {
  ClinicalExportSnapshot,
  DashboardMetrics,
  ExportSessionWithAttempts,
  SessionTableRow,
} from '../types/export';
import { buildAdherenceSummary, computeAdherenceMetrics } from './adherenceMetrics';
import { averageEffectiveCompliancePercent, getEffectiveCompliancePercent } from './complianceMetrics';
import { formatDateTime, formatLevelLabel } from './format';
import {
  partitionSessionsByClinicalRelevance,
  sessionClassificationLabel,
} from './sessionClassification';

function latestVimMl(snapshot: ClinicalExportSnapshot): number | null {
  if (snapshot.diagnostics.length === 0) return null;
  const sorted = [...snapshot.diagnostics].sort(
    (a, b) => Date.parse(b.diagnostic_date) - Date.parse(a.diagnostic_date),
  );
  return sorted[0]?.max_inspiratory_volume ?? null;
}

function activeLevelTargetMl(snapshot: ClinicalExportSnapshot): number | null {
  const active = snapshot.patient_levels.find((l) => l.level_status === 'active');
  if (active) return active.target_volume;

  const currentId = snapshot.patient?.current_level_id;
  if (currentId) {
    const match = snapshot.patient_levels.find((l) => l.level_id === currentId);
    return match?.target_volume ?? null;
  }

  return null;
}

function maxHoldSecondsFromSessions(sessions: ExportSessionWithAttempts[]): number {
  let maxMs = 0;
  for (const { attempts } of sessions) {
    for (const attempt of attempts) {
      if (attempt.hold_ms > maxMs) maxMs = attempt.hold_ms;
    }
  }
  return maxMs / 1000;
}

function buildSessionRows(sessions: ExportSessionWithAttempts[]): SessionTableRow[] {
  return [...sessions]
    .sort((a, b) => {
      const ta = Date.parse(a.session.session_date);
      const tb = Date.parse(b.session.session_date);
      if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return tb - ta;
      return b.session.session_id - a.session.session_id;
    })
    .map(({ session, attempts }) => ({
      sessionId: session.session_id,
      date: session.session_date,
      dateFormatted: formatDateTime(session.session_date),
      levelLabel: formatLevelLabel(session.level_id),
      completed: session.completed,
      perfect: session.perfect,
      interrupted: session.interrupted === true,
      classification: sessionClassificationLabel(session),
      compliancePercent: getEffectiveCompliancePercent({ session, attempts }),
      maxVolume: session.max_volume,
      avgVolume: session.avg_volume,
      avgHoldSeconds: session.avg_hold_seconds,
      validAttempts: session.valid_attempts,
      totalAttempts: session.total_attempts,
    }));
}

export function computeDashboardMetrics(snapshot: ClinicalExportSnapshot): DashboardMetrics {
  const patient = snapshot.patient!;
  const { clinical } = partitionSessionsByClinicalRelevance(snapshot.sessions);
  const hasClinicalSessions = clinical.length > 0;

  const adherence = computeAdherenceMetrics(clinical);
  const adherenceSummary = buildAdherenceSummary(adherence);

  const maxVolumeMl = clinical.reduce((max, s) => Math.max(max, s.session.max_volume), 0);
  const avgCompliancePercent = averageEffectiveCompliancePercent(clinical);

  return {
    patientName: patient.nombre_completo,
    patientKey: patient.clave,
    age: patient.edad,
    currentLevelLabel: formatLevelLabel(patient.current_level_id),
    lastVimMl: latestVimMl(snapshot),
    activeLevelTargetMl: activeLevelTargetMl(snapshot),
    exportedAt: snapshot.exported_at,
    exportedAtFormatted: formatDateTime(snapshot.exported_at),
    hasClinicalSessions,
    adherence,
    adherenceSummary,
    maxVolumeMl,
    avgCompliancePercent,
    bestHoldSeconds: maxHoldSecondsFromSessions(clinical),
    sessionRows: buildSessionRows(clinical),
  };
}

export function getClinicalSessions(
  snapshot: ClinicalExportSnapshot,
): ExportSessionWithAttempts[] {
  return partitionSessionsByClinicalRelevance(snapshot.sessions).clinical;
}
