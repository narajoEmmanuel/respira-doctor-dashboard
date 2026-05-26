import type { ClinicalExportSnapshot } from '../types/export';

export type ValidationResult =
  | { ok: true; data: ClinicalExportSnapshot }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateSessionEntry(entry: unknown, index: number): string | null {
  if (!isObject(entry)) {
    return `sessions[${index}] debe ser un objeto con session y attempts.`;
  }
  if (!isObject(entry.session)) {
    return `sessions[${index}].session es obligatorio.`;
  }
  if (!isArray(entry.attempts)) {
    return `sessions[${index}].attempts debe ser un arreglo.`;
  }
  const session = entry.session;
  if (typeof session.session_id !== 'number') {
    return `sessions[${index}].session.session_id debe ser numérico.`;
  }
  if (!isNonEmptyString(session.session_date)) {
    return `sessions[${index}].session.session_date es obligatorio.`;
  }
  return null;
}

export function validateClinicalExport(raw: unknown): ValidationResult {
  if (!isObject(raw)) {
    return { ok: false, error: 'El archivo no contiene un objeto JSON válido.' };
  }

  if (!isNonEmptyString(raw.export_version)) {
    return { ok: false, error: 'Falta export_version en el archivo.' };
  }

  if (!isNonEmptyString(raw.exported_at)) {
    return { ok: false, error: 'Falta exported_at en el archivo.' };
  }

  if (raw.patient !== null && !isObject(raw.patient)) {
    return { ok: false, error: 'El campo patient debe ser un objeto o null.' };
  }

  if (!isArray(raw.diagnostics)) {
    return { ok: false, error: 'El campo diagnostics debe ser un arreglo.' };
  }

  if (!isArray(raw.patient_levels)) {
    return { ok: false, error: 'El campo patient_levels debe ser un arreglo.' };
  }

  if (!isArray(raw.sessions)) {
    return { ok: false, error: 'El campo sessions debe ser un arreglo.' };
  }

  for (let i = 0; i < raw.sessions.length; i += 1) {
    const sessionError = validateSessionEntry(raw.sessions[i], i);
    if (sessionError) {
      return { ok: false, error: sessionError };
    }
  }

  if (raw.patient === null) {
    return { ok: false, error: 'No hay datos de paciente en la exportación.' };
  }

  return { ok: true, data: raw as ClinicalExportSnapshot };
}

export function parseClinicalExportJson(text: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es JSON válido. Verifique el formato.' };
  }
  return validateClinicalExport(parsed);
}
