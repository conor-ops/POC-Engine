import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Scale, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Lock,
  PlusCircle,
  FileCode
} from 'lucide-react';
import { AiPriorArtAnalysis, TransactionPayload } from '../types';

interface AiNoveltyAuditorProps {
  onMintAuditedProof: (analysis: AiPriorArtAnalysis, rawText: string, title: string) => void;
  creatorWallet: string;
}

export const AiNoveltyAuditor: React.FC<AiNoveltyAuditorProps> = ({
  onMintAuditedProof,
  creatorWallet,
}) => {
  const [conceptTitle, setConceptTitle] = useState('Master Recovery Hub 2026: Zero-Knowledge Multi-Cloud Failover Orchestration');
  const [authorName, setAuthorName] = useState('Jay Lang (jaylang085@gmail.com)');
  const [conceptRawText, setConceptRawText] = useState(`// Master Recovery Hub 2026: Zero-Trust Multi-Cloud Recovery Protocol
// Cryptographic Proof of Architecture & Algorithmic Key Orchestration
// Implements verifiable polynomial commitments reducing cross-cloud recovery time objective (RTO) to under 120ms with mathematical consensus.`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiPriorArtAnalysis | null>(null);

  const handleRunAnalysis = async () => {
    if (!conceptTitle.trim() || !conceptRawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-poc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: conceptTitle,
          description: 'Novel cryptographic and distributed state mechanism.',
          contentRaw: conceptRawText,
          category: 'SOFTWARE_IP',
          author: authorName,
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="ai-novelty-auditor" className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gemini AI Prior Art & Novelty Benchmarking Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            AI Novelty & Cross-Border Prior Art Auditor
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluate whether your invention demonstrates a measurable "technical effect" (UK Patent Act standard), satisfies US Section 101 utility thresholds, and retains 100% creator ownership under Google Terms of Service before anchoring to the blockchain.
          </p>
        </div>
      </div>

      {/* Input Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Input Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="h-4 w-4 text-cyan-400" />
            <span>Invention / Proof of Concept Details</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Concept / Title *</label>
              <input
                type="text"
                value={conceptTitle}
                onChange={e => setConceptTitle(e.target.value)}
                placeholder="e.g. Zero-Knowledge Latency Reduction Protocol"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Author / Creator Name</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Technical Specification, Code Snippet, or Formulas *
              </label>
              <textarea
                rows={6}
                value={conceptRawText}
                onChange={e => setConceptRawText(e.target.value)}
                placeholder="Paste the core algorithm, mathematical logic, or architectural breakthrough..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !conceptTitle || !conceptRawText}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating Prior Art & Technical Novelty...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run AI Prior Art & Novelty Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Analysis Report */}
        <div className="space-y-4">
          {analysisResult ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
              
              {/* Novelty Score & Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                    Novelty Benchmark
                  </span>
                  <h3 className="text-base font-bold text-white">Prior Art Evaluation Report</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm">
                  <span>Score: {analysisResult.technicalNoveltyScore}/100</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block font-mono">Summary:</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Technical Effect */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-cyan-400 block font-mono flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Technical Effect Assessment (UK/US Standards):</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {analysisResult.technicalEffectAssessment}
                </p>
              </div>

              {/* Key Claims */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block font-mono">Patentable / Original Claims:</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {analysisResult.keyClaims.map((claim, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Jurisdiction Recommendations */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block font-mono flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-purple-400" />
                  <span>Jurisdiction Strategy:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {analysisResult.jurisdictionRecommendations.map((j, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{j.region}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          j.riskLevel === 'LOW' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {j.riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-tight">{j.filingAdvice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mint on Blockchain Action */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => onMintAuditedProof(analysisResult, conceptRawText, conceptTitle)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <Lock className="h-4 w-4" />
                  <span>Anchor Audited Prior Art as Block on Blockchain</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
              <Sparkles className="h-10 w-10 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Ready to audit prior art</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Enter your invention or code on the left and click "Run AI Prior Art & Novelty Evaluation" to generate structured legal claims and cryptographic statements.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
