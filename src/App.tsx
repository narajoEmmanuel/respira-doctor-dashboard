import { useCallback, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { UploadScreen } from './components/UploadScreen';
import type { ClinicalExportSnapshot, DashboardMetrics } from './types/export';
import { readFileAsText } from './utils/fileReader';
import { computeDashboardMetrics } from './utils/metrics';
import { parseClinicalExportJson } from './utils/validation';
import './App.css';

type AppView =
  | { kind: 'upload' }
  | {
      kind: 'dashboard';
      snapshot: ClinicalExportSnapshot;
      metrics: DashboardMetrics;
      fileName: string;
    };

function App() {
  const [view, setView] = useState<AppView>({ kind: 'upload' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await readFileAsText(file);
      const result = parseClinicalExportJson(text);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const metrics = computeDashboardMetrics(result.data);
      setView({
        kind: 'dashboard',
        snapshot: result.data,
        metrics,
        fileName: file.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al procesar el archivo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setView({ kind: 'upload' });
    setError(null);
  }, []);

  return (
    <div className="app-shell">
      {view.kind === 'upload' ? (
        <UploadScreen
          onFileSelected={handleFileSelected}
          loading={loading}
          error={error}
          onLocalError={setError}
        />
      ) : (
        <Dashboard
          snapshot={view.snapshot}
          metrics={view.metrics}
          fileName={view.fileName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
