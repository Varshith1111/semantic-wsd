import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  perWordAccuracy: Record<string, number>;
}

export default function PerWordAccuracyChart({ perWordAccuracy }: Props) {
  const data = Object.entries(perWordAccuracy)
    .map(([word, accuracy]) => ({
      word,
      accuracy: +(accuracy * 100).toFixed(1),
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const getColor = (accuracy: number) => {
    if (accuracy >= 80) return '#22c55e';
    if (accuracy >= 60) return '#3b82f6';
    if (accuracy >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="word" stroke="#94a3b8" tick={{ fontSize: 12 }} width={80} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#f1f5f9',
          }}
          formatter={(value: any) => [`${value}%`, 'Accuracy']}
        />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.accuracy)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
