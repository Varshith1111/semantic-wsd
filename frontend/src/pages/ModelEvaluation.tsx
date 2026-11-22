import { useState } from 'react';
import {
  FlaskConical,
  Play,
  Loader2,
  BarChart,
  Grid,
  FileText,
  AlertCircle,
  Award,
} from 'lucide-react';
import { getEvaluation } from '../services/api';
import type { EvaluationResult } from '../types';
import PerWordAccuracyChart from '../charts/PerWordAccuracyChart';
import ConfusionMatrix from '../charts/ConfusionMatrix';

export default function ModelEvaluation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunEvaluation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluation();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Evaluation run failed. Please ensure backend is operational.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <FlaskConical size={16} />
            Empirical Validation Suite
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Model Evaluation</h1>
          <p className="text-slate-400 text-sm mt-1">
            Run real-time accuracy, precision, recall, and F1 benchmarks across polysemous test sets.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Evaluating Corpus...
            </>
          ) : (
            <>
              <Play size={18} className="fill-current" />
              Run Model Evaluation
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Benchmark Dataset Info Notice */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <FileText size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-white">Curated Word Sense Disambiguation Benchmark</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evaluation evaluates real sentences across 20+ ambiguous English polysemes (e.g., <span className="text-slate-200">bank, bat, crane, spring, bark, bass, bow, chip, club, diamond, fan, jam, mole, nail, palm, pitcher, plant, ring, rock, seal, star, tank</span>). Each test sample contains an annotated ground-truth WordNet synset.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                Ground Truth: Princeton WordNet
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                Metric Computation: Scikit-learn Macro/Weighted
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                Embeddings: sentence-transformers/all-MiniLM-L6-v2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="py-24 text-center space-y-4 rounded-2xl bg-[#111827] border border-slate-700/60">
          <Loader2 size={40} className="animate-spin text-purple-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Running Model Inference Across Dataset</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Computing first-order contextual embeddings and second-order semantic neighborhood similarities for all test sentences...
          </p>
        </div>
      ) : result ? (
        <div className="space-y-8 animate-fade-in">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall Accuracy</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                {(result.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {result.correct_predictions} of {result.total_samples} test sentences correct
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Precision</span>
              <div className="text-3xl font-extrabold text-blue-400 mt-2 font-mono">
                {(result.precision * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Weighted precision across all target senses
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Recall</span>
              <div className="text-3xl font-extrabold text-cyan-400 mt-2 font-mono">
                {(result.recall * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                True positive capture rate
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">F1-Score</span>
              <div className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">
                {(result.f1_score * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Harmonic mean of precision and recall
              </p>
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per-Word Accuracy */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart size={18} className="text-emerald-400" />
                  <h3 className="font-semibold text-white">Per-Word Disambiguation Accuracy</h3>
                </div>
                <span className="text-xs text-slate-400">By Lexical Target</span>
              </div>
              <div className="flex-1 w-full min-h-[340px]">
                <PerWordAccuracyChart perWordAccuracy={result.per_word_accuracy} />
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Grid size={18} className="text-purple-400" />
                  <h3 className="font-semibold text-white">Confusion Matrix Heatmap</h3>
                </div>
                <span className="text-xs text-slate-400">Actual vs Predicted Senses</span>
              </div>
              <div className="flex-1 w-full overflow-auto">
                <ConfusionMatrix matrix={result.confusion_matrix} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-[#111827] border border-slate-700/60 space-y-4">
          <Award size={48} className="mx-auto text-purple-400/60" />
          <h3 className="text-lg font-semibold text-white">Ready for Empirical Benchmark</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click "Run Model Evaluation" above to execute the real evaluation suite. All metrics are computed dynamically on actual inference runs.
          </p>
        </div>
      )}
    </div>
  );
}
