type ClinicalEmptyStateProps = {
  title?: string;
  message?: string;
};

export function ClinicalEmptyState({
  title = 'No hay sesiones clínicas con sensor disponibles',
  message = 'Los indicadores, gráficas y tablas clínicas requieren sesiones con sensor (input_mode sensor, data_source sensor_model).',
}: ClinicalEmptyStateProps) {
  return (
    <div className="clinical-empty panel" role="status">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
