import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CandidateMeaning } from '../types';

interface Props {
  meanings: CandidateMeaning[];
}

export default function SimilarityBarChart({ meanings }: Props) {
  const data = meanings.map((m, i) => ({
    name: `Sense ${i + 1}`,
    synset: m.synset_name,
    'First Order': +(m.first_order_score * 100).toFixed(1),
    'Second Order': +(m.second_order_score * 100).toFixed(1),
    Combined: +(m.combined_score * 100).toFixed(1),
  }));

  const colors = {
    'First Order': '#3b82f6',
    'Second Order': '#06b6d4',
    Combined: '#8b5cf6',
  };

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#f1f5f9',
          }}
          formatter={(value: any, name: any) => [`${value}%`, name]}
          labelFormatter={(label: any, payload: any) => {
            if (payload && payload.length > 0) {
              const item = payload[0].payload as { synset: string };
              return `${label} (${item.synset})`;
            }
            return String(label ?? '');
          }}
        />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        {Object.entries(colors).map(([key, color]) => (
          <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((_, index) => (
              <Cell key={index} fill={color} fillOpacity={0.85} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
