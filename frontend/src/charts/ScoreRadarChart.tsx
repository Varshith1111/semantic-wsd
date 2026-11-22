import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CandidateMeaning } from '../types';

interface Props {
  meanings: CandidateMeaning[];
}

export default function ScoreRadarChart({ meanings }: Props) {
  const top = meanings.slice(0, 5);
  const metrics = ['first_order_score', 'second_order_score', 'combined_score'] as const;
  const metricLabels: Record<string, string> = {
    first_order_score: 'First Order',
    second_order_score: 'Second Order',
    combined_score: 'Combined',
  };

  const data = metrics.map((m) => {
    const entry: Record<string, string | number> = { metric: metricLabels[m] };
    top.forEach((sense, i) => {
      entry[`Sense ${i + 1}`] = +(sense[m] * 100).toFixed(1);
    });
    return entry;
  });

  const palette = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#f1f5f9',
          }}
          formatter={(value: any) => `${value}%`}
        />
        {top.map((_, i) => (
          <Radar
            key={i}
            name={`Sense ${i + 1}`}
            dataKey={`Sense ${i + 1}`}
            stroke={palette[i]}
            fill={palette[i]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
