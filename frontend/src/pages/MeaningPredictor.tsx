import { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, Tag, ArrowRight } from 'lucide-react';
import { usePredictionContext } from '../context/PredictionContext';
import { analyzeMeaning } from '../services/api';
import type { PredictionResponse } from '../types';
import { useNavigate } from 'react-router-dom';

export default function MeaningPredictor() {
  const { prediction, setPrediction } = usePredictionContext();
  const navigate = useNavigate();

  const [sentence, setSentence] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ambiguousWords, setAmbiguousWords] = useState<string[]>([]);
  const [detectingWords, setDetectingWords] = useState(false);

  const handleAnalyze = async () => {
    if (!sentence.trim() || !targetWord.trim()) {
      setError('Please enter both a sentence and a target word.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMeaning(sentence.trim(), targetWord.trim());
      setPrediction(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Analysis failed. Make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetectWords = async () => {
    if (!sentence.trim()) {
      setError('Please enter a sentence first.');
      return;
    }
    setDetectingWords(true);
    setError(null);
    try {
      // Use simple heuristic: split words and show content words as potentially ambiguous
      const words = sentence
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
        .filter((w) => w.length > 2);
      const unique = [...new Set(words)];
      setAmbiguousWords(unique);
    } finally {
      setDetectingWords(false);
    }
  };

  const result: PredictionResponse | null = prediction;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search size={24} className="text-blue-400" />
          Meaning Predictor
        </h1>
        <p className="text-slate-400 mt-1">
          Enter a sentence and target word to predict its contextual meaning.
        </p>
      </div>

      {/* Input Panel */}
      <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Sentence</label>
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="e.g. The bank by the river was covered in wildflowers."
            rows={3}
            className="w-full rounded-lg bg-[#0f172a] border border-slate-600 text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Word</label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="e.g. bank"
              className="w-full rounded-lg bg-[#0f172a] border border-slate-600 text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Ambiguous word chips */}
        {ambiguousWords.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Click a word to select it as target:</p>
            <div className="flex flex-wrap gap-2">
              {ambiguousWords.map((w) => (
                <button
                  key={w}
                  onClick={() => setTargetWord(w)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    targetWord === w
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/5 text-slate-300 border border-slate-600 hover:border-blue-500/50 hover:text-blue-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDetectWords}
            disabled={detectingWords || !sentence.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {detectingWords ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
            Detect Ambiguous Words
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading || !sentence.trim() || !targetWord.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            Analyze Meaning
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="space-y-4">
          {/* Predicted Meaning */}
          <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Predicted Meaning</h2>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-cyan-300 text-sm font-semibold">
                {(result.confidence * 100).toFixed(1)}% confidence
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed mb-4">{result.predicted_meaning}</p>

            {/* Score bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreBar
                label="First-Order Score"
                value={result.first_order_score}
                color="bg-blue-500"
              />
              <ScoreBar
                label="Second-Order Score"
                value={result.second_order_score}
                color="bg-cyan-500"
              />
              <ScoreBar
                label="Similarity Score"
                value={result.similarity_score}
                color="bg-violet-500"
              />
              <ScoreBar
                label="Processing Time"
                value={null}
                display={`${result.processing_time.toFixed(2)}s`}
                color="bg-emerald-500"
              />
            </div>
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20 p-5">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Explanation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
            </div>
          )}

          {/* Context Words & POS Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Context words */}
            <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Context Words</h3>
              <div className="flex flex-wrap gap-2">
                {result.context_words.length === 0 ? (
                  <span className="text-slate-500 text-sm">No context words extracted.</span>
                ) : (
                  result.context_words.map((w, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                    >
                      {w}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* POS Tags */}
            <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">POS Tags</h3>
              <div className="flex flex-wrap gap-2">
                {result.pos_tags.length === 0 ? (
                  <span className="text-slate-500 text-sm">No POS tags available.</span>
                ) : (
                  result.pos_tags.map(([word, tag], i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-slate-600 text-xs"
                    >
                      <span className="text-white font-medium">{word}</span>
                      <span className="text-cyan-400">{tag}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Alternative Meanings */}
          {result.alternative_meanings.length > 0 && (
            <div className="rounded-xl bg-[#1e293b]/80 border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Alternative Meanings</h3>
                <button
                  onClick={() => navigate('/analysis')}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  Full Analysis <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {result.alternative_meanings.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/[0.02] border border-slate-700/40 p-4 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {m.synset_name}
                          </span>
                          <span className="text-xs text-slate-500 uppercase">{m.pos}</span>
                        </div>
                        <p className="text-sm text-slate-300">{m.definition}</p>
                        {m.examples.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            &quot;{m.examples[0]}&quot;
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-mono text-blue-400 shrink-0">
                        {(m.combined_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
  display,
}: {
  label: string;
  value: number | null;
  color: string;
  display?: string;
}) {
  const pct = value !== null ? Math.min(value * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-mono">
          {display ?? `${pct.toFixed(1)}%`}
        </span>
      </div>
      {value !== null && (
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
