import type { AdherenceMetrics, AdherenceSummary } from './adherence';

export type LevelId = 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5';

export type PatientLevelStatus = 'active' | 'locked' | 'completed';

export type SessionInputMode = 'sensor' | 'touch' | string;
export type SessionDataSource = 'sensor_model' | 'touch_estimate' | string;

export type PatientRecord = {
  paciente_id: number;
  clave: string;
  nombre_completo: string;
  edad: number;
  current_level_id: LevelId | null;
  racha_actual: number;
  ultima_fecha_cumplida: string | null;
  fecha_creacion: string;
};

export type DiagnosticRecord = {
  diagnostic_id: number;
  patient_id: number;
  diagnostic_number: number;
  diagnostic_date: string;
  max_inspiratory_volume: number;
};

export type PatientLevelRecord = {
  patient_level_id: number;
  patient_id: number;
  level_id: LevelId;
  diagnostic_id: number;
  target_volume: number;
  level_status: PatientLevelStatus;
  perfect_sessions_completed: number;
  sessions_completed_today: number;
  last_session_date: string | null;
};

export type SessionRecord = {
  session_id: number;
  patient_id: number;
  patient_level_id: number;
  level_id: LevelId;
  session_date: string;
  valid_attempts: number;
  total_attempts: number;
  invalid_attempts: number;
  compliance_percent: number;
  max_volume: number;
  avg_volume: number;
  avg_hold_seconds: number;
  completed: boolean;
  perfect: boolean;
  interrupted?: boolean;
  input_mode?: SessionInputMode;
  data_source?: SessionDataSource;
  is_practice_session?: boolean;
  official_validation_source?: string;
  max_sensor_estimated_volume_ml?: number | null;
  max_sensor_u95_ml?: number | null;
};

export type AttemptRecord = {
  attempt_id: number;
  session_id: number;
  hold_ms: number;
  peak_volume: number;
  valid: boolean;
  created_at: string;
  input_mode?: SessionInputMode;
  data_source?: SessionDataSource;
  official_volume_ml?: number | null;
  sensor_estimated_volume_ml?: number | null;
  sensor_u95_ml?: number | null;
  sensor_confidence_label?: string | null;
  sensor_volume_reached_conservatively?: boolean;
  sensor_attempt_status?: string | null;
};

export type ExportSessionWithAttempts = {
  session: SessionRecord;
  attempts: AttemptRecord[];
};

export type ClinicalExportSnapshot = {
  export_version: string;
  exported_at: string;
  patient: PatientRecord | null;
  diagnostics: DiagnosticRecord[];
  patient_levels: PatientLevelRecord[];
  sessions: ExportSessionWithAttempts[];
};

export type LevelProgressPoint = {
  levelId: LevelId;
  label: string;
  status: PatientLevelStatus;
  targetVolume: number;
  perfectSessions: number;
  lastSessionDate: string | null;
};

export type SessionTableRow = {
  sessionId: number;
  date: string;
  dateFormatted: string;
  levelLabel: string;
  completed: boolean;
  perfect: boolean;
  interrupted: boolean;
  classification: string;
  compliancePercent: number;
  maxVolume: number;
  avgVolume: number;
  avgHoldSeconds: number;
  validAttempts: number;
  totalAttempts: number;
};

export type DashboardMetrics = {
  patientName: string;
  patientKey: string;
  age: number | null;
  currentLevelLabel: string;
  lastVimMl: number | null;
  activeLevelTargetMl: number | null;
  exportedAt: string;
  exportedAtFormatted: string;
  hasClinicalSessions: boolean;
  adherence: AdherenceMetrics;
  adherenceSummary: AdherenceSummary;
  maxVolumeMl: number;
  avgCompliancePercent: number;
  bestHoldSeconds: number;
  sessionRows: SessionTableRow[];
};
