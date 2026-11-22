import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Share2,
  Info,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { usePredictionContext } from '../context/PredictionContext';
import SimilarityBarChart from '../charts/SimilarityBarChart';

export default function ContextVisualization() {
  const { prediction } = usePredictionContext();
  const navigate = useNavigate();

  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: 'target' | 'context' | 'sense';
    details?: string;
  } | null>(null);

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 rounded-2xl bg-[#111827]/60 border border-slate-700/50 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
          <Network size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Context Graph Available</h2>
        <p className="text-slate-400 max-w-md mb-6">
          To visualize contextual co-occurrences, semantic neighborhood nodes, and relational vectors, run a meaning prediction first.
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

  const targetWord = prediction.target_word;
  const contextWords = prediction.context_words.length > 0
    ? prediction.context_words
    : ['context', 'sentence', 'text'];

  const candidateSenses = prediction.alternative_meanings.slice(0, 5);

  // Layout math for SVG interactive canvas
  const centerX = 380;
  const centerY = 260;
  const contextRadius = 140;
  const senseRadius = 230;

  // Context word node coordinates (inner ring)
  const contextNodes = contextWords.map((word, index) => {
    const angle = (index / contextWords.length) * 2 * Math.PI - Math.PI / 2;
    return {
      id: `ctx-${word}-${index}`,
      word,
      type: 'context' as const,
      x: centerX + contextRadius * Math.cos(angle),
      y: centerY + contextRadius * Math.sin(angle),
    };
  });

  // Candidate sense node coordinates (outer ring)
  const senseNodes = candidateSenses.map((sense, index) => {
    const angle = (index / candidateSenses.length) * 2 * Math.PI - Math.PI / 4;
    return {
      id: `sense-${sense.synset_name}`,
      synset: sense.synset_name,
      definition: sense.definition,
      score: sense.combined_score,
      isTop: index === 0,
      type: 'sense' as const,
      x: centerX + senseRadius * Math.cos(angle),
      y: centerY + senseRadius * Math.sin(angle),
    };
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <Network size={16} />
            Relational Graph Modeling
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Contextual Network & Semantic Neighborhood
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Interactive graph showing second-order co-occurrence links and candidate sense alignments.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-[#111827] border border-slate-700 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <span className="text-xs text-slate-400 px-2 font-mono">{(zoom * 100).toFixed(0)}%</span>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => { setZoom(1); setSelectedNode(null); }}
            title="Reset"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 border-l border-slate-700"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Interactive Visualizer Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-cyan-400" />
              <h3 className="font-semibold text-white">Semantic Neighborhood Graph</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Target
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Context
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Candidate Senses
              </span>
            </div>
          </div>

          <div className="w-full h-[520px] bg-[#0a0f1e] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 760 520"
              className="w-full h-full transition-transform duration-200 select-none"
              style={{ transform: `scale(${zoom})` }}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Gradients */}
                <linearGradient id="edge-target-ctx" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="edge-target-sense" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Background Orbit Guides */}
              <circle cx={centerX} cy={centerY} r={contextRadius} fill="none" stroke="#1e293b" strokeDasharray="4 4" />
              <circle cx={centerX} cy={centerY} r={senseRadius} fill="none" stroke="#1e293b" strokeDasharray="6 6" />

              {/* Edge Lines: Center to Context Words */}
              {contextNodes.map((node) => (
                <line
                  key={`edge-${node.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke="url(#edge-target-ctx)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              ))}

              {/* Edge Lines: Center to Candidate Senses */}
              {senseNodes.map((node) => (
                <line
                  key={`edge-${node.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke={node.isTop ? '#06b6d4' : 'url(#edge-target-sense)'}
                  strokeWidth={node.isTop ? '2.5' : '1.5'}
                />
              ))}

              {/* Edge Lines: Second-Order Links (Context to Senses) */}
              {contextNodes.slice(0, 3).map((cNode, i) => {
                const sNode = senseNodes[i % senseNodes.length];
                if (!sNode) return null;
                return (
                  <line
                    key={`second-order-${i}`}
                    x1={cNode.x}
                    y1={cNode.y}
                    x2={sNode.x}
                    y2={sNode.y}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                    strokeDasharray="1 3"
                  />
                );
              })}

              {/* Context Word Nodes */}
              {contextNodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() =>
                    setSelectedNode({
                      id: node.id,
                      label: node.word,
                      type: 'context',
                      details: `Context token extracted from sentence window. Contributes to second-order co-occurrence profiling.`,
                    })
                  }
                  className="cursor-pointer group"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="16"
                    fill="#0f172a"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    className="transition-all group-hover:scale-125"
                  />
                  <text
                    x={node.x}
                    y={node.y + 28}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {node.word}
                  </text>
                </g>
              ))}

              {/* Candidate Sense Nodes */}
              {senseNodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() =>
                    setSelectedNode({
                      id: node.id,
                      label: node.synset,
                      type: 'sense',
                      details: `${node.definition} (Score: ${(node.score * 100).toFixed(1)}%)`,
                    })
                  }
                  className="cursor-pointer group"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.isTop ? 22 : 18}
                    fill={node.isTop ? '#1e1b4b' : '#0f172a'}
                    stroke={node.isTop ? '#38bdf8' : '#8b5cf6'}
                    strokeWidth={node.isTop ? '3' : '2'}
                    filter={node.isTop ? 'url(#glow)' : undefined}
                    className="transition-all group-hover:scale-110"
                  />
                  <text
                    x={node.x}
                    y={node.y + (node.isTop ? 34 : 30)}
                    textAnchor="middle"
                    fill={node.isTop ? '#38bdf8' : '#c084fc'}
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {node.synset}
                  </text>
                </g>
              ))}

              {/* Target Word Center Node */}
              <g
                onClick={() =>
                  setSelectedNode({
                    id: 'target',
                    label: targetWord,
                    type: 'target',
                    details: `Target polysemous word undergoing disambiguation across candidate senses.`,
                  })
                }
                className="cursor-pointer"
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="32"
                  fill="url(#edge-target-ctx)"
                  stroke="#60a5fa"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
                <text
                  x={centerX}
                  y={centerY + 5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {targetWord}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Node Inspector / Relationship Details */}
        <div className="space-y-6 flex flex-col">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Info size={18} className="text-blue-400" />
              Node Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      selectedNode.type === 'target'
                        ? 'bg-blue-500/20 text-blue-300'
                        : selectedNode.type === 'context'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {selectedNode.type} Node
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">{selectedNode.label}</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a] p-3.5 rounded-xl border border-slate-800">
                  {selectedNode.details}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 text-sm">
                Click any node in the graph (center target, context tokens, or candidate senses) to inspect relational attributes and semantic weights.
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Layers size={18} className="text-cyan-400" />
                How Second-Order Modeling Works
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Rather than evaluating purely whether <span className="text-slate-200">"{targetWord}"</span> embeddings directly match a dictionary definition, the second-order model traces the semantic hypernyms, hyponyms, and contextual neighbors of each surrounding word.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                  <span>1st Order: Cosine distance between sentence embedding and sense glosses.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                  <span>2nd Order: Relational overlap across context word semantic neighborhoods.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/analysis')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Examine Full Score Metrics
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Similarity Chart */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl">
        <h3 className="font-semibold text-white mb-2">Sense Comparison Summary</h3>
        <p className="text-xs text-slate-400 mb-6">Comparative ranking of all candidate senses evaluated in this context</p>
        <SimilarityBarChart meanings={prediction.alternative_meanings} />
      </div>
    </div>
  );
}
