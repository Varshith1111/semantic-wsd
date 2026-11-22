import {
  Brain,
  Cpu,
  Layers,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Brain size={14} />
          NLP Research & Engineering
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
          Second-Order Semantic Modeling for Context-Aware Meaning Prediction
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base lg:text-lg leading-relaxed">
          An advanced Word Sense Disambiguation (WSD) system utilizing multi-tier semantic representations, deep contextual embeddings, and lexical relational graphs.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="p-8 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase tracking-wide">
          <BookOpen size={18} />
          1. Problem Statement & Motivation
        </div>
        <h2 className="text-xl font-bold text-white">The Challenge of Lexical Polysemy</h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          Natural human language is full of polysemous words—words whose definitions branch radically depending on their surrounding context. For instance, consider the word <span className="font-semibold text-cyan-300">"bank"</span>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-1">
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Sentence Context A</span>
            <p className="text-sm text-white font-medium">"The bank approved my loan application yesterday."</p>
            <p className="text-xs text-emerald-400 pt-1 font-mono">Disambiguated: Financial institution / lending repository</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-1">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Sentence Context B</span>
            <p className="text-sm text-white font-medium">"We sat near the river bank watching the sunset."</p>
            <p className="text-xs text-emerald-400 pt-1 font-mono">Disambiguated: Sloping land adjoining a waterway</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed pt-2">
          Simple keyword matching fails when words have subtle co-occurrences or when sentences contain metaphorical usage. A system must evaluate both direct contextual embeddings and second-order semantic associations to provide accurate disambiguation.
        </p>
      </div>

      {/* Methodology Section */}
      <div className="p-8 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wide">
          <Layers size={18} />
          2. Mathematical Methodology
        </div>
        <h2 className="text-xl font-bold text-white">First-Order vs Second-Order Modeling</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-[#0f172a] border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">1</span>
              First-Order Semantic Similarity
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Computes the direct cosine similarity between the dense embedding vector of the input sentence context <span className="font-mono text-blue-300">v_ctx</span> and the semantic representation of each candidate WordNet synset definition and gloss <span className="font-mono text-blue-300">v_sense_i</span>:
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-center text-blue-300">
              Score_1st(s_i) = cos(v_context, v_sense_i)
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0f172a] border border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
              Second-Order Semantic Modeling
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traces relational neighborhoods: captures hypernyms, hyponyms, and coordinate terms of surrounding context words <span className="font-mono text-cyan-300">C</span> and computes their maximal intersection similarity with candidate sense neighborhoods <span className="font-mono text-cyan-300">R(s_i)</span>:
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-center text-cyan-300">
              Score_2nd(s_i) = (1/|C|) Σ max cos(v_c, v_r)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Final Combined Ranking</span>
            <div className="font-mono text-sm text-white font-bold mt-0.5">
              Score_Final(s_i) = w₁ · Score_1st(s_i) + w₂ · Score_2nd(s_i)
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Default: w₁ = 0.6, w₂ = 0.4</span>
        </div>
      </div>

      {/* Technologies Used Grid */}
      <div className="p-8 rounded-2xl bg-[#111827] border border-slate-700/60 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold uppercase tracking-wide">
          <Cpu size={18} />
          3. Technology Stack
        </div>
        <h2 className="text-xl font-bold text-white">Full-Stack AI Architecture</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
            <span className="text-xs text-blue-400 font-semibold">NLP & Embeddings</span>
            <p className="text-sm font-bold text-white">Sentence Transformers</p>
            <p className="text-xs text-slate-400">all-MiniLM-L6-v2 dense 384-dimensional contextual vectors</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
            <span className="text-xs text-cyan-400 font-semibold">Lexical Knowledge</span>
            <p className="text-sm font-bold text-white">Princeton WordNet</p>
            <p className="text-xs text-slate-400">Synsets, hypernyms, hyponyms, and sense definitions</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
            <span className="text-xs text-emerald-400 font-semibold">Backend Engine</span>
            <p className="text-sm font-bold text-white">FastAPI & Python 3.12</p>
            <p className="text-xs text-slate-400">Asynchronous REST APIs with Swagger OpenAPI documentation</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
            <span className="text-xs text-purple-400 font-semibold">Frontend Dashboard</span>
            <p className="text-sm font-bold text-white">React 18 + Vite + TS</p>
            <p className="text-xs text-slate-400">Tailwind CSS, Recharts visual analytics, Lucide Icons</p>
          </div>
        </div>
      </div>

      {/* Engineering Highlights */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1e293b] border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-wide">
          <CheckCircle2 size={18} />
          4. Reliability & Scientific Rigor
        </div>
        <h2 className="text-xl font-bold text-white">Production-Grade Design</h2>
        <ul className="space-y-2.5 text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>True mathematical calculations:</strong> Vector cosine similarities and real relational graphs—zero hardcoded mock predictions.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Persistent SQLite storage:</strong> Async database persistence of prediction history with filtering and detailed retrieval.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Empirical evaluation:</strong> Complete benchmark test suite reporting real precision, recall, accuracy, and confusion matrix.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Explainable AI:</strong> Every disambiguation includes natural-language justifications detailing which contextual tokens and semantic relationships contributed.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
