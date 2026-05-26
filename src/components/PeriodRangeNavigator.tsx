type PeriodRangeNavigatorProps = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

export function PeriodRangeNavigator({
  label,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: PeriodRangeNavigatorProps) {
  return (
    <div className="period-navigator" role="group" aria-label="Navegación temporal">
      <button
        type="button"
        className="period-navigator__btn"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Periodo anterior"
      >
        ‹
      </button>
      <span className="period-navigator__label">{label}</span>
      <button
        type="button"
        className="period-navigator__btn"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Periodo siguiente"
      >
        ›
      </button>
    </div>
  );
}
