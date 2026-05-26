import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TemporalChartBucket } from '../../../utils/temporalMetrics';
import { brand } from '../../../theme/tokens';

type CompliancePerPeriodChartProps = {
  buckets: TemporalChartBucket[];
  compactLabels?: boolean;
};

export function CompliancePerPeriodChart({
  buckets,
  compactLabels = false,
}: CompliancePerPeriodChartProps) {
  const tiltLabels = !compactLabels && buckets.length > 4;
  const data = buckets.map((b) => ({
    ...b,
    compliance: b.avgCompliancePercent,
  }));

  return (
    <div className="chart-box">
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
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload as TemporalChartBucket;
              return (
                <div className="chart-tooltip chart-tooltip--compact">
                  <strong>{row.label}</strong>
                  <p>Cumplimiento: {row.avgCompliancePercent.toFixed(1)}%</p>
                  <p>Sesiones clínicas: {row.sessionsCount}</p>
                </div>
              );
            }}
            cursor={false}
            offset={10}
          />
          <Bar
            dataKey="compliance"
            name="Cumplimiento"
            fill={brand.accent}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
