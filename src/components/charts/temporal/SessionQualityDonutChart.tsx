import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SessionQualityBreakdown } from '../../../utils/sessionQualityMetrics';

type SessionQualityDonutChartProps = {
  breakdown: SessionQualityBreakdown;
};

type DonutRow = {
  name: string;
  value: number;
  color: string;
};

function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: DonutRow }[];
  total: number;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  const pct = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';

  return (
    <div className="chart-tooltip chart-tooltip--compact">
      <strong>{row.name}</strong>
      <p>
        {row.value} sesión(es) ({pct}%)
      </p>
    </div>
  );
}

export function SessionQualityDonutChart({ breakdown }: SessionQualityDonutChartProps) {
  if (breakdown.total === 0) {
    return (
      <p className="temporal-empty temporal-empty--chart">Sin sesiones en este periodo visible.</p>
    );
  }

  const data: DonutRow[] = breakdown.segments.map((s) => ({
    name: s.label,
    value: s.count,
    color: s.color,
  }));

  return (
    <div className="chart-box chart-box--donut">
      <div className="donut-chart-layout">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip total={breakdown.total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-chart-center" aria-hidden="true">
          <span className="donut-chart-center__value">{breakdown.total}</span>
          <span className="donut-chart-center__label">sesiones</span>
        </div>
      </div>
      <ul className="donut-legend">
        {breakdown.segments.map((s) => {
          const pct = breakdown.total > 0 ? ((s.count / breakdown.total) * 100).toFixed(0) : '0';
          return (
            <li key={s.id} className="donut-legend__item">
              <span className="donut-legend__swatch" style={{ background: s.color }} />
              <span>
                {s.label}: {s.count} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
