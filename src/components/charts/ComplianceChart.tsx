import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { brand } from '../../theme/tokens';

type ComplianceChartProps = {
  data: { label: string; compliance: number }[];
};

export function ComplianceChart({ data }: ComplianceChartProps) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, 'Cumplimiento']}
          />
          <Bar dataKey="compliance" name="Cumplimiento" fill={brand.accent} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
