import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TemporalChartBucket } from '../../../utils/temporalMetrics';
import { brand } from '../../../theme/tokens';

type VolumeVsTargetChartProps = {
  buckets: TemporalChartBucket[];
  targetMl: number | null;
  compactLabels?: boolean;
};

export function VolumeVsTargetChart({
  buckets,
  targetMl,
  compactLabels = false,
}: VolumeVsTargetChartProps) {
  const data = buckets.map((b) => ({
    ...b,
    maxVolume: b.maxVolumeMl,
    avgVolume: Math.round(b.avgVolumeMl),
  }));

  const hasTarget = targetMl != null && targetMl > 0;
  const tiltLabels = !compactLabels && buckets.length > 4;

  return (
    <div className="chart-box">
      <div className="chart-legend-custom" aria-hidden="true">
        <span className="chart-legend-custom__item">
          <i className="chart-legend-custom__bar" /> Volumen máximo
        </span>
        <span className="chart-legend-custom__item">
          <i className="chart-legend-custom__line chart-legend-custom__line--avg" /> Volumen
          promedio
        </span>
        {hasTarget ? (
          <span className="chart-legend-custom__item">
            <i className="chart-legend-custom__line chart-legend-custom__line--meta" /> Meta del
            nivel activo
          </span>
        ) : null}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            interval={0}
            angle={tiltLabels ? -25 : 0}
            textAnchor={tiltLabels ? 'end' : 'middle'}
            height={tiltLabels ? 56 : 32}
          />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v} ml`} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload as TemporalChartBucket;
              return (
                <div className="chart-tooltip chart-tooltip--compact">
                  <strong>{row.label}</strong>
                  {targetMl != null && targetMl > 0 ? (
                    <p>Meta del nivel: {Math.round(targetMl)} ml</p>
                  ) : null}
                  <p>Volumen máximo: {Math.round(row.maxVolumeMl)} ml</p>
                  <p>
                    Volumen promedio:{' '}
                    {row.avgVolumeMl > 0 ? `${Math.round(row.avgVolumeMl)} ml` : 'Sin dato'}
                  </p>
                  <p>Sesiones clínicas: {row.sessionsCount}</p>
                </div>
              );
            }}
            cursor={false}
            offset={10}
          />
          {hasTarget ? (
            <ReferenceLine
              y={targetMl}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          ) : null}
          <Bar
            dataKey="maxVolume"
            name="Volumen máximo"
            fill={brand.accent}
            radius={[6, 6, 0, 0]}
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="avgVolume"
            name="Volumen promedio"
            stroke="#2a8f8a"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2a8f8a' }}
            activeDot={{ r: 6 }}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
