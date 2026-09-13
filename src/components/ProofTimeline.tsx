import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Calendar, 
  User, 
  Hash, 
  ArrowRight, 
  Cpu, 
  FileCode, 
  Truck, 
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Block, TransactionPayload } from '../types';

interface ProofTimelineProps {
  blocks: Block[];
  onSelectProof: (tx: TransactionPayload, block: Block) => void;
  onOpenCreateModal: () => void;
}

export const ProofTimeline: React.FC<ProofTimelineProps> = ({
  blocks,
  onSelectProof,
  onOpenCreateModal,
}) => {
  // Collect all transactions in chronological order
  const allProofs: { tx: TransactionPayload; block: Block }[] = [];
  blocks.forEach(block => {
    block.transactions.forEach(tx => {
      allProofs.push({ tx, block });
    });
  });

  return (
    <div id="proof-timeline" className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Layers className="h-3.5 w-3.5" />
              <span>Prior Art Milestone Lineage & Evolution</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Creator Proof Lineage & Work History
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track the iterative evolution of your inventions, codebases, media assets, and hardware deliverables. Each milestone is permanently sealed with its own cryptographic hash.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            + Timestamp New Milestone
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8 ml-2 sm:ml-4 py-4">
        {allProofs.map(({ tx, block }, idx) => (
          <div key={tx.txId} className="relative group">
            
            {/* Timeline Node Icon */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 h-8 w-8 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950">
              <span className="font-mono text-xs font-bold">{idx}</span>
            </div>

            {/* Content Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-md">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tx.category}
                    </span>
                    <h3 className="text-base font-bold text-white">{tx.title}</h3>
                    <span className="text-xs font-mono text-slate-400">v{tx.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Anchored on {new Date(tx.timestamp).toUTCString()} • Block #{block.index}
                  </p>
                </div>

                <button
                  onClick={() => onSelectProof(tx, block)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors self-start sm:self-center"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>View Proof Certificate</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tx.description}
              </p>

              {tx.ipDeclaration.technicalEffectDescription && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                    Technical Effect & Patent Contribution (UK/US Criteria)
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {tx.ipDeclaration.technicalEffectDescription}
                  </p>
                </div>
              )}

              {/* Hashes and tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-200">{tx.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">SHA-256 Digest:</span>
                  <span className="text-emerald-400 font-medium text-[11px]">
                    {tx.contentHash.slice(0, 18)}...
                  </span>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
