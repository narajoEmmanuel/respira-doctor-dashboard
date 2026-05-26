import { useMemo, useState } from 'react';
import type { ClinicalExportSnapshot } from '../types/export';
import type { TemporalViewMode } from '../types/temporal';
import { buildSessionBucketsForDay } from '../utils/intraDayMetrics';
import { getClinicalSessions } from '../utils/metrics';
import {
  buildClinicalTimeline,
  dayLabelForNav,
  weekLabelForNav,
} from '../utils/temporalNavigation';
import { buildSessionQualityBreakdown } from '../utils/sessionQualityMetrics';
import {
  buildDayAdherenceChartBucket,
  computeTemporalAnalysis,
  toChartBuckets,
} from '../utils/temporalMetrics';
import { getVisibleClinicalSessions } from '../utils/visibleClinicalSessions';
import { buildWeekDayBucketsFromSnapshot } from '../utils/weeklyDayView';
import { formatNumber } from '../utils/format';
import { ClinicalEmptyState } from './ClinicalEmptyState';
import { PeriodRangeNavigator } from './PeriodRangeNavigator';
import { TemporalChartsGrid } from './TemporalChartsGrid';
import { TemporalSessionsDetailTable } from './TemporalSessionsDetailTable';
import { TemporalWeekDaysDetailTable } from './TemporalWeekDaysDetailTable';

type TemporalSectionProps = {
  snapshot: ClinicalExportSnapshot;
  hasClinicalSessions: boolean;
  activeLevelTargetMl: number | null;
};

const TABS: { id: TemporalViewMode; label: string }[] = [
  { id: 'session-day', label: 'Sesiones del día' },
  { id: 'week-days', label: 'Días de la semana' },
];

export function TemporalSection({
  snapshot,
  hasClinicalSessions,
  activeLevelTargetMl,
}: TemporalSectionProps) {
  const [viewMode, setViewMode] = useState<TemporalViewMode>('week-days');
  /** -1 = mostrar el periodo más reciente hasta que el usuario navegue. */
  const [dayIndex, setDayIndex] = useState(-1);
  const [weekIndex, setWeekIndex] = useState(-1);

  const clinical = useMemo(() => getClinicalSessions(snapshot), [snapshot]);
  const timeline = useMemo(() => buildClinicalTimeline(clinical), [clinical]);

  const weeklyAnalysis = useMemo(() => computeTemporalAnalysis(snapshot), [snapshot]);

  const resolvedDayIndex =
    timeline.navigableDayKeys.length === 0
      ? 0
      : dayIndex < 0
        ? timeline.navigableDayKeys.length - 1
        : Math.min(dayIndex, timeline.navigableDayKeys.length - 1);

  const resolvedWeekIndex =
    timeline.navigableWeekKeys.length === 0
      ? 0
      : weekIndex < 0
        ? timeline.navigableWeekKeys.length - 1
        : Math.min(weekIndex, timeline.navigableWeekKeys.length - 1);

  const visibleDayKey = timeline.navigableDayKeys[resolvedDayIndex];
  const visibleWeekKey = timeline.navigableWeekKeys[resolvedWeekIndex];

  const sessionBuckets = useMemo(() => {
    if (!visibleDayKey) return [];
    return buildSessionBucketsForDay(clinical, visibleDayKey);
  }, [clinical, visibleDayKey]);

  const weekDayBuckets = useMemo(() => {
    if (!visibleWeekKey) return [];
    return buildWeekDayBucketsFromSnapshot(snapshot, visibleWeekKey);
  }, [snapshot, visibleWeekKey]);

  const chartBuckets = useMemo(() => {
    if (viewMode === 'session-day') return toChartBuckets(sessionBuckets);
    if (viewMode === 'week-days') return toChartBuckets(weekDayBuckets);
    return [];
  }, [viewMode, sessionBuckets, weekDayBuckets]);

  const visibleClinicalSessions = useMemo(
    () =>
      getVisibleClinicalSessions(viewMode, clinical, visibleDayKey, visibleWeekKey),
    [viewMode, clinical, visibleDayKey, visibleWeekKey],
  );

  const adherenceChartBuckets = useMemo(() => {
    if (viewMode === 'session-day' && visibleDayKey) {
      return [
        buildDayAdherenceChartBucket(
          visibleDayKey,
          dayLabelForNav(visibleDayKey),
          visibleClinicalSessions,
        ),
      ];
    }
    if (viewMode === 'week-days') return toChartBuckets(weekDayBuckets);
    return [];
  }, [viewMode, visibleDayKey, visibleClinicalSessions, weekDayBuckets]);

  const qualityBreakdown = useMemo(
    () => buildSessionQualityBreakdown(visibleClinicalSessions),
    [visibleClinicalSessions],
  );

  const adherenceGoalMode = 'day';
  const compactLabels = viewMode === 'week-days';

  const navLabel =
    viewMode === 'session-day' && visibleDayKey
      ? dayLabelForNav(visibleDayKey)
      : viewMode === 'week-days' && visibleWeekKey
        ? weekLabelForNav(visibleWeekKey)
        : '';

  const showNavigator = viewMode === 'session-day' || viewMode === 'week-days';
  const canGoPrevious =
    viewMode === 'session-day'
      ? resolvedDayIndex > 0
      : viewMode === 'week-days'
        ? resolvedWeekIndex > 0
        : false;
  const canGoNext =
    viewMode === 'session-day'
      ? resolvedDayIndex < timeline.navigableDayKeys.length - 1
      : viewMode === 'week-days'
        ? resolvedWeekIndex < timeline.navigableWeekKeys.length - 1
        : false;

  const handlePrevious = () => {
    if (viewMode === 'session-day') setDayIndex(Math.max(0, resolvedDayIndex - 1));
    if (viewMode === 'week-days') setWeekIndex(Math.max(0, resolvedWeekIndex - 1));
  };

  const handleNext = () => {
    if (viewMode === 'session-day') {
      setDayIndex(Math.min(timeline.navigableDayKeys.length - 1, resolvedDayIndex + 1));
    }
    if (viewMode === 'week-days') {
      setWeekIndex(Math.min(timeline.navigableWeekKeys.length - 1, resolvedWeekIndex + 1));
    }
  };

  const handleTabChange = (mode: TemporalViewMode) => {
    setViewMode(mode);
    if (mode === 'session-day') setDayIndex(-1);
    if (mode === 'week-days') setWeekIndex(-1);
  };

  const dayHasSessions = sessionBuckets.length > 0;

  return (
    <section className="temporal-section" aria-label="Evolución temporal">
      <div className="temporal-section__head panel">
        <div className="panel__header temporal-section__intro">
          <div>
            <h2>Evolución por periodo</h2>
            <p>Explora sesiones, días y semanas con medición por sensor.</p>
          </div>
          <div className="period-tabs" role="tablist" aria-label="Vista temporal">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={viewMode === tab.id}
                className={`period-tabs__btn${viewMode === tab.id ? ' period-tabs__btn--active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {weeklyAnalysis.skippedSessionsCount > 0 ? (
          <p className="temporal-skipped" role="status">
            {formatNumber(weeklyAnalysis.skippedSessionsCount)} sesión(es) sin fecha válida no
            se incluyeron.
          </p>
        ) : null}

        {!hasClinicalSessions ? (
          <div className="temporal-empty-wrap">
            <ClinicalEmptyState />
          </div>
        ) : (
          <>
            {showNavigator && navLabel ? (
              <div className="temporal-nav-wrap">
                <PeriodRangeNavigator
                  label={navLabel}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  canGoPrevious={canGoPrevious}
                  canGoNext={canGoNext}
                />
              </div>
            ) : null}

            {viewMode === 'session-day' && !dayHasSessions ? (
              <p className="temporal-empty temporal-empty--padded">
                No hay sesiones clínicas con sensor para este periodo.
              </p>
            ) : chartBuckets.length === 0 ? (
              <p className="temporal-empty temporal-empty--padded">
                No hay sesiones clínicas con sensor para este periodo.
              </p>
            ) : (
              <>
                <TemporalChartsGrid
                  viewMode={viewMode}
                  chartBuckets={chartBuckets}
                  adherenceBuckets={adherenceChartBuckets}
                  adherenceGoalMode={adherenceGoalMode}
                  qualityBreakdown={qualityBreakdown}
                  targetMl={activeLevelTargetMl}
                  compactLabels={compactLabels}
                />

                <article className="panel temporal-table-panel">
                  <div className="panel__header">
                    <h3>Detalle</h3>
                    <p>
                      {viewMode === 'session-day'
                        ? `${formatNumber(visibleClinicalSessions.length)} sesión(es) en el día visible`
                        : 'Resumen diario (7 días) de la semana visible'}
                    </p>
                  </div>

                  {viewMode === 'session-day' ? (
                    <TemporalSessionsDetailTable sessions={visibleClinicalSessions} />
                  ) : (
                    <TemporalWeekDaysDetailTable buckets={weekDayBuckets} />
                  )}
                </article>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
