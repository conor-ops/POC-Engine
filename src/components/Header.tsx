import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  PlusCircle, 
  Boxes, 
  FileCheck2, 
  Flame, 
  Truck, 
  Sparkles,
  Search,
  ExternalLink,
  UploadCloud,
  Building2,
  Database
} from 'lucide-react';
import { ConnectedAccount } from '../types';

interface HeaderProps {
  activeTab: 'EXPLORER' | 'TIMELINE' | 'VERIFIER' | 'TAMPER_LAB' | 'SUPPLY_CHAIN' | 'TOS_SHIELD' | 'AI_AUDITOR';
  setActiveTab: (tab: 'EXPLORER' | 'TIMELINE' | 'VERIFIER' | 'TAMPER_LAB' | 'SUPPLY_CHAIN' | 'TOS_SHIELD' | 'AI_AUDITOR') => void;
  onOpenCreateModal: () => void;
  onOpenDriveModal: () => void;
  blockCount: number;
  isChainValid: boolean;
  creatorWallet: string;
  activeAccount: ConnectedAccount;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenDriveModal,
  blockCount,
  isChainValid,
  creatorWallet,
  activeAccount,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Boxes className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">ProvenanceChain</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  PoCW Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Immutable Proof of Work & Supply Logistics • Google TOS Compliant
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Height:</span>
              <span className="text-emerald-300 font-semibold">#{blockCount - 1} Blocks</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <ShieldCheck className={`h-3.5 w-3.5 ${isChainValid ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className="text-slate-400">Integrity:</span>
              <span className={isChainValid ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-bold'}>
                {isChainValid ? '100% Cryptographic Valid' : 'TAMPER DETECTED'}
              </span>
            </div>

            <button 
              id="header-tos-badge"
              onClick={() => setActiveTab('TOS_SHIELD')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-sans font-medium text-xs">Google TOS: "Content Stays Yours"</span>
            </button>
          </div>

          {/* Right Action Buttons & Multi-Account Switcher */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-header-drive-sync"
              onClick={onOpenDriveModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 text-xs transition-all shadow-sm"
              title="Manage connected Google Drive & Enterprise accounts"
            >
              <div className="h-5 w-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Database className="h-3 w-3" />
              </div>
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span>{activeAccount.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    {activeAccount.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                  {activeAccount.email}
                </div>
              </div>
            </button>

            <button
              id="btn-mint-proof"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Timestamp Proof</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav id="app-nav-tabs" className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          <button
            id="tab-explorer"
            onClick={() => setActiveTab('EXPLORER')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'EXPLORER'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Block Explorer</span>
          </button>

          <button
            id="tab-timeline"
            onClick={() => setActiveTab('TIMELINE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'TIMELINE'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Creator Proof Lineage</span>
          </button>

          <button
            id="tab-supply-chain"
            onClick={() => setActiveTab('SUPPLY_CHAIN')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'SUPPLY_CHAIN'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Supply Chain Tracking</span>
          </button>

          <button
            id="tab-verifier"
            onClick={() => setActiveTab('VERIFIER')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'VERIFIER'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Zero-Knowledge Verifier</span>
          </button>

          <button
            id="tab-ai-auditor"
            onClick={() => setActiveTab('AI_AUDITOR')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'AI_AUDITOR'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Novelty & Prior Art</span>
          </button>

          <button
            id="tab-tamper-lab"
            onClick={() => setActiveTab('TAMPER_LAB')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'TAMPER_LAB'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>"Try To Purge Me" Tamper Lab</span>
          </button>

          <button
            id="tab-tos-shield"
            onClick={() => setActiveTab('TOS_SHIELD')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'TOS_SHIELD'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Google TOS Rights Shield</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
