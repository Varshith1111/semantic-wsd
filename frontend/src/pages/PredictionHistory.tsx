import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Trash2,
  Search,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getHistory, clearHistory, getHistoryItem } from '../services/api';
import { usePredictionContext } from '../context/PredictionContext';
import type { HistoryItem } from '../types';

export default function PredictionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const { setPrediction } = usePredictionContext();
  const navigate = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch prediction history.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await clearHistory();
      setHistory([]);
      setShowClearModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to clear history.');
      }
    } finally {
      setClearing(false);
    }
  };

  const handleInspect = async (item: HistoryItem) => {
    try {
      const fullItem = await getHistoryItem(item.id);
      setPrediction(fullItem);
      navigate('/predict');
    } catch {
      // If fetching full item fails, construct partial prediction response
      setPrediction({
        id: item.id,
        sentence: item.sentence,
        target_word: item.target_word,
        predicted_meaning: item.predicted_meaning,
        confidence: item.confidence,
        similarity_score: item.similarity_score,
        first_order_score: item.similarity_score,
        second_order_score: item.similarity_score,
        alternative_meanings: [],
        explanation: `Restored prediction record #${item.id} for "${item.target_word}".`,
        context_words: [],
        pos_tags: [],
        processing_time: 0,
      });
      navigate('/predict');
    }
  };

  const filteredHistory = history.filter(
    (h) =>
      h.sentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.target_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.predicted_meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <History size={16} />
            Persistent SQLite Records
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Prediction History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse, re-inspect, and manage past Word Sense Disambiguation runs.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium transition-colors self-start sm:self-auto"
          >
            <Trash2 size={16} />
            Clear All History
          </button>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search words, sentences..."
            className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-auto">
          Showing <span className="text-white font-semibold">{filteredHistory.length}</span> of{' '}
          <span className="text-white font-semibold">{history.length}</span> records
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table / Loading / Empty */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-400 mb-3" />
          <p className="text-sm">Retrieving prediction history from SQLite...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#111827] border border-slate-700/60">
          <History size={40} className="mx-auto text-slate-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">
            {searchTerm ? 'No matching predictions found' : 'No predictions recorded yet'}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            {searchTerm
              ? 'Try modifying your search term or clearing the filter.'
              : 'Predictions made through the Meaning Predictor will automatically be preserved here.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 shadow-md"
            >
              Start Disambiguation
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-slate-700/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-[#0f172a]/60">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Target Word</th>
                  <th className="py-3 px-4">Context Sentence</th>
                  <th className="py-3 px-4">Disambiguated Meaning</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleInspect(item)}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{item.id}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                        {item.target_word}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                      "{item.sentence}"
                    </td>

                    <td className="py-3.5 px-4 max-w-sm truncate text-slate-300">
                      {item.predicted_meaning}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                        {(item.similarity_score * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400 flex items-center gap-1.5 mt-3.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{item.created_at || 'Just now'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Re-open Analysis"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-2">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Clear All Prediction Records?</h3>
            <p className="text-sm text-slate-400">
              This will permanently delete all {history.length} stored prediction records from the SQLite database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {clearing && <Loader2 size={16} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
