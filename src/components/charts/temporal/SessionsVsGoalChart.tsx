import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DAILY_SESSION_GOAL } from '../../../types/adherence';
import type { TemporalChartBucket } from '../../../utils/temporalMetrics';
import { brand } from '../../../theme/tokens';

export type AdherenceChartGoalMode = 'day' | 'week';

const WEEKLY_SESSION_GOAL = DAILY_SESSION_GOAL * 7;

type SessionsVsGoalChartProps = {
  buckets: TemporalChartBucket[];
  goalMode: AdherenceChartGoalMode;
  compactLabels?: boolean;
};

export function SessionsVsGoalChart({
  buckets,
  goalMode,
  compactLabels = false,
}: SessionsVsGoalChartProps) {
  const goal = goalMode === 'week' ? WEEKLY_SESSION_GOAL : DAILY_SESSION_GOAL;
  const goalLabel =
    goalMode === 'week'
      ? `${WEEKLY_SESSION_GOAL} sesiones/semana (6×7)`
      : `${DAILY_SESSION_GOAL} sesiones/día`;

  const data = buckets.map((b) => ({
    ...b,
    sessions: b.sessionsCount,
    goal,
    pctOfGoal: goal > 0 ? Math.round((b.sessionsCount / goal) * 100) : 0,
  }));

  const tiltLabels = !compactLabels && buckets.length > 4;
  const yMax = Math.max(goal, ...data.map((d) => d.sessions), 1);

  return (
    <div className="chart-box">
      <div className="chart-legend-custom" aria-hidden="true">
        <span className="chart-legend-custom__item">
          <i className="chart-legend-custom__bar" /> Sesiones clínicas
        </span>
        <span className="chart-legend-custom__item">
          <i className="chart-legend-custom__line chart-legend-custom__line--meta" /> Meta:{' '}
          {goalLabel}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            interval={0}
            angle={tiltLabels ? -25 : 0}
            textAnchor={tiltLabels ? 'end' : 'middle'}
            height={tiltLabels ? 56 : 32}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, yMax]}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload as TemporalChartBucket & {
                pctOfGoal: number;
              };
              return (
                <div className="chart-tooltip chart-tooltip--compact">
                  <strong>{row.label}</strong>
                  <p>Sesiones clínicas: {row.sessionsCount}</p>
                  <p>Meta esperada: {goal} sesiones</p>
                  <p>Cumplimiento: {row.pctOfGoal}%</p>
                </div>
              );
            }}
            cursor={false}
            offset={10}
          />
          <ReferenceLine
            y={goal}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Meta ${goal}`,
              position: 'insideTopRight',
              fill: '#6B7280',
              fontSize: 11,
            }}
          />
          <Bar
            dataKey="sessions"
            name="Sesiones clínicas"
            fill={brand.accent}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
