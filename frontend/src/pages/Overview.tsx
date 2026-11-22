import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  FileText,
  Gauge,
  Clock,
  ArrowRight,
  Zap,
  Layers,
  Target,
  Sparkles,
} from 'lucide-react';
import type { HistoryItem, HealthCheck } from '../types';
import { getHistory, healthCheck } from '../services/api';

const steps = [
  {
    icon: FileText,
    title: 'Input',
    description: 'Enter a sentence containing an ambiguous word you want to disambiguate.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'NLP Processing',
    description: 'Tokenization, POS tagging, and context window extraction using spaCy.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Layers,
    title: 'Semantic Analysis',
    description: 'First and second-order similarity scoring using Word2Vec embeddings.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Target,
    title: 'Prediction',
    description: 'Combined scoring selects the most probable word sense from WordNet.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export default function Overview() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [h, hc] = await Promise.allSettled([getHistory(), healthCheck()]);
        if (h.status === 'fulfilled') setHistory(h.value);
        if (hc.status === 'fulfilled') setHealth(hc.value);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalPredictions = history.length;
  const avgConfidence =
    history.length > 0
      ? (history.reduce((s, h) => s + h.confidence, 0) / history.length) * 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-violet-600/20 border border-slate-700/50 p-8 lg:p-12">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Brain size={26} className="text-white" />
            </div>
            <Sparkles size={20} className="text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            Second-Order Semantic Modeling for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Context-Aware Meaning Prediction
            </span>
          </h1>
          <p className="text-slate-300 text-lg mb-6 leading-relaxed">
            An advanced Word Sense Disambiguation system leveraging second-order
            co-occurrence vectors and Word2Vec embeddings to accurately predict
            word meanings in context.
          </p>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            Try it now <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Gauge size={22} className="text-blue-400" />}
          label="Total Predictions"
          value={loading ? '—' : String(totalPredictions)}
        />
        <StatCard
          icon={<Target size={22} className="text-cyan-400" />}
          label="Average Confidence"
          value={loading ? '—' : `${avgConfidence.toFixed(1)}%`}
        />
        <StatCard
          icon={<Clock size={22} className="text-violet-400" />}
          label="System Status"
          value={
            loading
              ? '—'
              : health?.status === 'healthy'
              ? 'Online'
              : 'Offline'
          }
          valueColor={health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}
        />
      </div>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-100">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-5 hover:border-slate-600 transition-colors group"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-white/[0.04] select-none">
                {i + 1}
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} mb-3`}
              >
                <step.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Predictions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100">Recent Predictions</h2>
          <Link
            to="/history"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="text-slate-400 text-sm animate-pulse">Loading recent predictions…</div>
        ) : history.length === 0 ? (
          <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-8 text-center">
            <p className="text-slate-400 mb-4">No predictions yet. Run your first analysis!</p>
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
            >
              <Zap size={16} /> Go to Predictor
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-3 text-slate-400 font-medium">Sentence</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Target</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {item.sentence}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-medium">
                        {item.target_word}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-cyan-400 font-mono">
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueColor = 'text-white',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-5 flex items-center gap-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-white/5 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
