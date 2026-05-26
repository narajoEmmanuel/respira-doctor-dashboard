import { useCallback, useRef, useState } from 'react';
import { brand } from '../theme/tokens';

type UploadScreenProps = {
  onFileSelected: (file: File) => void;
  loading: boolean;
  error: string | null;
  onLocalError: (message: string | null) => void;
};

export function UploadScreen({
  onFileSelected,
  loading,
  error,
  onLocalError,
}: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.json')) {
        onLocalError('Seleccione un archivo con extensión .json');
        return;
      }
      onLocalError(null);
      onFileSelected(file);
    },
    [onFileSelected, onLocalError],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="upload-screen">
      <header className="upload-hero">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-mark__icon">+</span>
        </div>
        <p className="brand-eyebrow">{brand.name}</p>
        <h1>Doctor Dashboard</h1>
        <p className="upload-hero__subtitle">
          Visualice el progreso clínico de un paciente a partir del archivo JSON exportado desde
          la app. Todo el procesamiento ocurre en su navegador; ningún dato sale de este
          dispositivo.
        </p>
      </header>

      <div
        className={`dropzone${dragOver ? ' dropzone--active' : ''}${loading ? ' dropzone--loading' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        aria-label="Zona para subir archivo JSON de exportación clínica"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="dropzone__input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="dropzone__content">
          <div className="dropzone__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
              <path
                d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Subir exportación JSON</h2>
          <p>Arrastre el archivo aquí o haga clic para seleccionarlo</p>
          <span className="dropzone__hint">Formato: respira_export.json · Solo lectura local</span>
          {loading ? <p className="dropzone__status">Procesando archivo…</p> : null}
        </div>
      </div>

      {error ? (
        <div className="upload-error" role="alert">
          <strong>No se pudo cargar el archivo</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <ul className="upload-features">
        <li>
          <strong>Privado</strong>
          <span>Sin servidor ni base de datos</span>
        </li>
        <li>
          <strong>Clínico</strong>
          <span>KPIs, gráficas y tabla de sesiones</span>
        </li>
        <li>
          <strong>Compatible</strong>
          <span>Exportación clínica Respira+ v2.x</span>
        </li>
      </ul>
    </div>
  );
}
