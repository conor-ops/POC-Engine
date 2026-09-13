import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Hash, 
  Layers, 
  Unlock, 
  Lock, 
  Cpu, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Block, TransactionPayload } from '../types';
import { sha256, calculateMerkleRoot, calculateBlockHash } from '../crypto/blockchain';

interface TamperSimulatorProps {
  blocks: Block[];
  onApplyTamper: (blockIndex: number, txIndex: number, newRawText: string, newAuthor?: string) => void;
  onResetChain: () => void;
  isChainValid: boolean;
  tamperedIndices: number[];
}

export const TamperSimulator: React.FC<TamperSimulatorProps> = ({
  blocks,
  onApplyTamper,
  onResetChain,
  isChainValid,
  tamperedIndices,
}) => {
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(1);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAuthor, setEditedAuthor] = useState('Attacker (Data Thief)');
  const [editedContent, setEditedContent] = useState('// STOLEN CODE: Modified author signature to claim patent priority.');

  const targetBlock = blocks[selectedBlockIdx] || blocks[0];
  const targetTx = targetBlock?.transactions[0];

  return (
    <div id="tamper-simulator" className="space-y-6">
      
      {/* Hero Explainer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5" />
              <span>Interactive Cryptographic Defense Lab</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              "Good Luck Purging My Data" — The Immutability Test
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Why can't an unauthorized party, employer, or malicious actor secretly purge your proof of concept or claim credit? 
              Test it yourself below: alter just one character in a past block and watch how the SHA-256 Merkle chain mathematically exposes the tamper attempt across all network nodes.
            </p>
          </div>

          <button
            onClick={onResetChain}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all shrink-0"
          >
            <RotateCcw className="h-4 w-4 text-emerald-400" />
            <span>Restore Original Truth</span>
          </button>
        </div>
      </div>

      {/* Interactive Tamper Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Attack Vector Form */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Unlock className="h-4 w-4 text-amber-400" />
            <span>Simulate Hostile Edit / Data Theft</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Select Historical Block to Tamper
            </label>
            <select
              value={selectedBlockIdx}
              onChange={e => setSelectedBlockIdx(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {blocks.map(b => (
                <option key={b.index} value={b.index}>
                  Block #{b.index}: {b.transactions[0]?.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          {targetTx && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Original Creator</span>
              <p className="font-semibold text-emerald-400">{targetTx.author}</p>
              <p className="text-[11px] text-slate-300 font-mono break-all">{targetTx.contentHash.slice(0, 24)}...</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Malicious Name Substitution
            </label>
            <input
              type="text"
              value={editedAuthor}
              onChange={e => setEditedAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Malicious Code / Payload Modification
            </label>
            <textarea
              rows={4}
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => onApplyTamper(selectedBlockIdx, 0, editedContent, editedAuthor)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all"
          >
            <Flame className="h-4 w-4" />
            <span>Attempt Secret Tamper on Block #{selectedBlockIdx}</span>
          </button>
        </div>

        {/* Right Column: Real-time Mathematical Proof Cascade */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isChainValid
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/60 text-rose-200'
          }`}>
            {isChainValid ? (
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-sm">
                {isChainValid ? 'Ledger is 100% Intact and Verified' : 'CRYPTOGRAPHIC TAMPER DETECTED!'}
              </h3>
              <p className="leading-relaxed text-slate-300">
                {isChainValid
                  ? 'All block hashes match their Merkle trees and previous pointers. Historical prior art cannot be altered without computational consensus.'
                  : `Block #${tamperedIndices.join(', #')} has been tampered with. Because each block seals the previous block's SHA-256 hash, changing a single bit breaks all subsequent block headers.`}
              </p>
            </div>
          </div>

          {/* Mathematical Proof Steps */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>How Cryptographic Provenance Prevents Data Purging</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="text-emerald-400 font-bold font-mono">1. Avalanche Effect</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Changing just 1 letter in a 10,000-line codebase results in a completely unrecognizable 256-bit hash.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="text-cyan-400 font-bold font-mono">2. Merkle Root Sealing</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  All transactions are bundled into a Merkle tree. Altering any child leaves an immediate mismatch at the block root.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="text-purple-400 font-bold font-mono">3. Chain Backlink Lock</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Every subsequent block contains the hash of the previous block. Modifying past history requires rewriting all future blocks.
                </p>
              </div>
            </div>

            {/* Block Linkage Diagram */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 font-mono">
                Chain Verification Status:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-950 border border-slate-800 no-scrollbar">
                {blocks.map((b, idx) => {
                  const isTampered = tamperedIndices.includes(b.index);
                  return (
                    <React.Fragment key={b.index}>
                      <div className={`p-2.5 rounded-xl border font-mono text-center shrink-0 min-w-[90px] transition-all ${
                        isTampered
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}>
                        <span className="text-[10px] text-slate-500 block">Block</span>
                        <span className="text-sm font-bold">#{b.index}</span>
                        <span className={`text-[9px] block mt-0.5 ${isTampered ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                          {isTampered ? 'INVALID' : 'VALID'}
                        </span>
                      </div>
                      {idx < blocks.length - 1 && (
                        <ArrowRight className={`h-4 w-4 shrink-0 ${isTampered ? 'text-rose-500' : 'text-slate-600'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
