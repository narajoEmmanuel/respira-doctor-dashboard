import type { TemporalChartBucket } from './temporalMetrics';

export function sessionStatusLabel(row: {
  interrupted?: boolean;
  perfect?: boolean;
  completed?: boolean;
  completedCount?: number;
  interruptedCount?: number;
  perfectCount?: number;
  sessionsCount?: number;
}): string {
  const interrupted =
    row.interrupted === true || (row.interruptedCount ?? 0) > 0;
  const perfect = row.perfect === true || (row.perfectCount ?? 0) > 0;
  const completed =
    row.completed === true ||
    (row.completedCount ?? 0) >= (row.sessionsCount ?? 1);

  if (interrupted) return 'Interrumpida';
  if (perfect) return 'Perfecta';
  if (completed) return 'Completada';
  return 'No completada';
}

export function clinicalInterpretationNote(row: TemporalChartBucket): string | null {
  const isSingleSession = row.sessionsCount === 1 && row.sessionStatus;

  if (isSingleSession) {
    if (
      row.sessionStatus === 'Interrumpida' &&
      row.avgCompliancePercent === 0 &&
      row.maxVolumeMl === 0 &&
      row.avgVolumeMl === 0 &&
      row.totalAttempts === 0
    ) {
      return 'Sesión interrumpida sin medición útil.';
    }

    if (row.maxVolumeMl > 0 && row.avgCompliancePercent === 0) {
      if (row.sessionStatus === 'Interrumpida') {
        return 'Hubo volumen registrado, pero la sesión fue interrumpida.';
      }
      if (row.sessionStatus === 'No completada') {
        return 'Hubo volumen registrado, pero la sesión no fue completada.';
      }
    }
    return null;
  }

  if (row.maxVolumeMl > 0 && row.avgCompliancePercent < 50 && row.interruptedCount > 0) {
    return 'Hay volumen registrado en sesiones con cumplimiento bajo (p. ej. interrumpidas o incompletas).';
  }

  return null;
}
