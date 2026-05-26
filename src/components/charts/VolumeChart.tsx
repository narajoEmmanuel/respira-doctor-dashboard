import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { brand } from '../../theme/tokens';

type VolumeChartProps = {
  data: { label: string; maxVolume: number; avgVolume: number }[];
};

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(v) => `${v} ml`}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Math.round(Number(value ?? 0))} ml`,
              name === 'maxVolume' ? 'Volumen máximo' : 'Volumen promedio',
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="maxVolume"
            name="Volumen máximo"
            stroke={brand.accent}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="avgVolume"
            name="Volumen promedio"
            stroke="#6B7280"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
