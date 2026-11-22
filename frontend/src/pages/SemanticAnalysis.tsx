import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { usePredictionContext } from '../context/PredictionContext';
import SimilarityBarChart from '../charts/SimilarityBarChart';
import ScoreRadarChart from '../charts/ScoreRadarChart';

export default function SemanticAnalysis() {
  const { prediction } = usePredictionContext();
  const navigate = useNavigate();

  // Dynamic weights for interactive exploration
  const [firstWeight, setFirstWeight] = useState(0.6);
  const secondWeight = +(1 - firstWeight).toFixed(2);

  if (!prediction || !prediction.alternative_meanings || prediction.alternative_meanings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 rounded-2xl bg-[#111827]/60 border border-slate-700/50 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
          <BarChart3 size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Prediction Analysis</h2>
        <p className="text-slate-400 max-w-md mb-6">
          To inspect first-order and second-order semantic scores, candidate meanings, and relational weights, analyze a sentence first.
        </p>
        <button
          onClick={() => navigate('/predict')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/20 transition-all"
        >
          Go to Meaning Predictor
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Recalculate combined scores if the user adjusts the interactive weight slider
  const recomputedMeanings = prediction.alternative_meanings.map((m) => {
    const combined = firstWeight * m.first_order_score + secondWeight * m.second_order_score;
    return {
      ...m,
      combined_score: +combined.toFixed(4),
    };
  }).sort((a, b) => b.combined_score - a.combined_score);

  const topSense = recomputedMeanings[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <BarChart3 size={16} />
            Deep Semantic Profiling
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Semantic Analysis & Meaning Comparison
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyzing target word <span className="text-cyan-400 font-semibold underline decoration-cyan-400/30">"{prediction.target_word}"</span> within: <span className="italic text-slate-300">"{prediction.sentence}"</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/visualization')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
        >
          View Context Network
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Interactive Weight Simulator */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Semantic Weight Balance Simulator</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            Real-time score recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-400 font-medium">First-Order (Direct): {(firstWeight * 100).toFixed(0)}%</span>
              <span className="text-cyan-400 font-medium">Second-Order (Relational): {(secondWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={firstWeight}
              onChange={(e) => setFirstWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-slate-400">
              Slide to simulate how changing the balance between direct context-to-definition embeddings (1st order) and semantic neighborhood relational overlap (2nd order) impacts ranking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1e293b]/70 border border-slate-700/60 flex flex-col justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Top-Ranked Sense</span>
            <span className="text-sm font-semibold text-white truncate mt-1">{topSense.synset_name}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Combined: {(topSense.combined_score * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Lead
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Candidate Senses Score Comparison
            </h3>
            <span className="text-xs text-slate-400">First vs Second vs Combined</span>
          </div>
          <div className="flex-1 w-full min-h-[340px]">
            <SimilarityBarChart meanings={recomputedMeanings} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              Multi-Metric Semantic Profile
            </h3>
            <span className="text-xs text-slate-400">Top 5 Candidates</span>
          </div>
          <div className="flex-1 w-full min-h-[340px]">
            <ScoreRadarChart meanings={recomputedMeanings} />
          </div>
        </div>
      </div>

      {/* Detailed Candidate Meanings Comparison Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Full Candidate Meanings Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              WordNet synsets evaluated with contextual embeddings and relational neighborhoods
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
            {recomputedMeanings.length} Candidate Senses Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">WordNet Synset & POS</th>
                <th className="py-3 px-4">Definition & Examples</th>
                <th className="py-3 px-4 text-center">First-Order</th>
                <th className="py-3 px-4 text-center">Second-Order</th>
                <th className="py-3 px-4 text-center">Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recomputedMeanings.map((m, idx) => {
                const isSelected = idx === 0;
                return (
                  <tr
                    key={m.synset_name}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-500/10 hover:bg-blue-500/15' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-4 px-4 font-mono">
                      {isSelected ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/30">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{m.synset_name}</div>
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                        {m.pos}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <p className="text-slate-300 leading-relaxed">{m.definition}</p>
                      {m.examples && m.examples.length > 0 && (
                        <div className="mt-1 text-xs italic text-slate-400 flex items-start gap-1">
                          <span className="text-slate-500 not-italic">e.g.</span>
                          <span>"{m.examples[0]}"</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-mono">
                      <span className="text-blue-400 font-medium">
                        {(m.first_order_score * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono">
                      <span className="text-cyan-400 font-medium">
                        {(m.second_order_score * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {(m.combined_score * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
