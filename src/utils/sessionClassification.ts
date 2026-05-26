import type { ExportSessionWithAttempts, SessionRecord } from '../types/export';

export type ResolvedSessionClassification = {
  inputMode: string;
  dataSource: string;
  isPracticeSession: boolean;
  isClassified: boolean;
};

export function resolveSessionClassification(
  record: SessionRecord,
): ResolvedSessionClassification {
  if (record.input_mode != null && record.data_source != null) {
    return {
      inputMode: record.input_mode,
      dataSource: record.data_source,
      isPracticeSession: record.is_practice_session === true,
      isClassified: true,
    };
  }

  return {
    inputMode: 'unclassified',
    dataSource: 'unclassified',
    isPracticeSession: false,
    isClassified: false,
  };
}

/** Sesión de práctica — excluida del análisis clínico. */
export function isPracticeSessionExcluded(record: SessionRecord): boolean {
  return (
    record.is_practice_session === true ||
    record.input_mode === 'touch_practice' ||
    record.data_source === 'touch_simulation'
  );
}

/**
 * Sesión válida para métricas clínicas del doctor (Opción A: sensor clínico estricto).
 */
export function isClinicalSensorSession(record: SessionRecord): boolean {
  if (isPracticeSessionExcluded(record)) return false;

  return (
    record.input_mode === 'sensor' &&
    record.data_source === 'sensor_model' &&
    record.is_practice_session === false &&
    record.official_validation_source === 'sensor_model'
  );
}

export function sessionClassificationLabel(record: SessionRecord): string {
  if (isClinicalSensorSession(record)) return 'Sensor';
  const classification = resolveSessionClassification(record);
  if (!classification.isClassified) return 'Sin clasificar';
  return classification.inputMode;
}

/** @deprecated Usar isClinicalSensorSession para el dashboard clínico. */
export function isSensorSession(record: SessionRecord): boolean {
  return isClinicalSensorSession(record);
}

/** @deprecated Usar isPracticeSessionExcluded. */
export function isPracticeSession(record: SessionRecord): boolean {
  return isPracticeSessionExcluded(record);
}

export function partitionSessionsByClinicalRelevance(
  sessions: ExportSessionWithAttempts[],
): {
  clinical: ExportSessionWithAttempts[];
  practice: ExportSessionWithAttempts[];
} {
  const clinical: ExportSessionWithAttempts[] = [];
  const practice: ExportSessionWithAttempts[] = [];

  for (const item of sessions) {
    if (isClinicalSensorSession(item.session)) {
      clinical.push(item);
    } else if (isPracticeSessionExcluded(item.session)) {
      practice.push(item);
    }
  }

  return { clinical, practice };
}
