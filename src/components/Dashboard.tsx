import type { ClinicalExportSnapshot, DashboardMetrics } from '../types/export';
import { formatDateTime } from '../utils/format';
import { AdherenceKpis } from './AdherenceKpis';
import { AdherenceSummary } from './AdherenceSummary';
import { ClinicalEmptyState } from './ClinicalEmptyState';
import { SecondaryClinicalKpis } from './SecondaryClinicalKpis';
import { TemporalSection } from './TemporalSection';

type DashboardProps = {
  snapshot: ClinicalExportSnapshot;
  metrics: DashboardMetrics;
  fileName: string;
  onReset: () => void;
};

export function Dashboard({ snapshot, metrics, fileName, onReset }: DashboardProps) {
  const { hasClinicalSessions } = metrics;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="brand-eyebrow">RESPIRA+ · Doctor Dashboard</p>
          <h1>{metrics.patientName}</h1>
          <p className="dashboard-header__meta">
            <span>{metrics.patientKey}</span>
            <span aria-hidden="true">·</span>
            <span>
              {metrics.age != null ? `${metrics.age} años` : 'Edad no registrada'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Exportado {formatDateTime(snapshot.exported_at)}</span>
          </p>
        </div>
        <div className="dashboard-header__actions">
          <div className="file-pill" title={fileName}>
            {fileName}
          </div>
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            Cargar otro archivo
          </button>
        </div>
      </header>

      {hasClinicalSessions ? (
        <>
          <AdherenceKpis adherence={metrics.adherence} />
          <AdherenceSummary summary={metrics.adherenceSummary} />
          <SecondaryClinicalKpis metrics={metrics} />
        </>
      ) : (
        <ClinicalEmptyState />
      )}

      <TemporalSection
        key={`${snapshot.exported_at}-${snapshot.patient?.paciente_id ?? 'export'}`}
        snapshot={snapshot}
        hasClinicalSessions={hasClinicalSessions}
        activeLevelTargetMl={metrics.activeLevelTargetMl}
      />
    </div>
  );
}
