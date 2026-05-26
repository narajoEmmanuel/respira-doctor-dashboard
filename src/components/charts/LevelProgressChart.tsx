import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LevelProgressPoint } from '../../types/export';
import { brand, dashboard } from '../../theme/tokens';

type LevelProgressChartProps = {
  levels: LevelProgressPoint[];
};

function barColor(status: LevelProgressPoint['status']): string {
  if (status === 'completed') return brand.accent;
  if (status === 'active') return '#5bbfb9';
  if (status === 'locked') return '#D1D5DB';
  return dashboard.textMuted;
}

const statusLabels: Record<LevelProgressPoint['status'], string> = {
  active: 'Activo',
  completed: 'Completado',
  locked: 'Bloqueado',
};

export function LevelProgressChart({ levels }: LevelProgressChartProps) {
  const data = levels.map((level) => ({
    name: level.label,
    perfectSessions: level.perfectSessions,
    targetVolume: level.targetVolume,
    status: level.status,
    statusLabel: statusLabels[level.status],
  }));

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
            formatter={(value, _name, item) => {
              const payload = item?.payload as { statusLabel: string; targetVolume: number };
              return [
                `${Number(value ?? 0)} sesiones perfectas · meta ${payload.targetVolume} ml`,
                payload.statusLabel,
              ];
            }}
          />
          <Bar dataKey="perfectSessions" name="Sesiones perfectas" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={barColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
