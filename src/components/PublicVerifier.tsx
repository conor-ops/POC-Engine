import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Hash, 
  ShieldCheck, 
  Calendar, 
  User, 
  ExternalLink,
  Lock,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { Block, TransactionPayload } from '../types';
import { sha256, sha256Buffer } from '../crypto/blockchain';

interface PublicVerifierProps {
  blocks: Block[];
  onSelectProof: (tx: TransactionPayload, block: Block) => void;
}

export const PublicVerifier: React.FC<PublicVerifierProps> = ({
  blocks,
  onSelectProof,
}) => {
  const [queryMode, setQueryMode] = useState<'TEXT' | 'FILE' | 'HASH'>('TEXT');
  const [textInput, setTextInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [calculatedHash, setCalculatedHash] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedRecord, setMatchedRecord] = useState<{ tx: TransactionPayload; block: Block } | null>(null);

  const handleVerifyText = async () => {
    if (!textInput.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    
    const hash = await sha256(textInput);
    setCalculatedHash(hash);

    findMatch(hash);
    setIsSearching(false);
  };

  const handleVerifyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSearching(true);
    setHasSearched(true);

    const buffer = await file.arrayBuffer();
    const hash = await sha256Buffer(buffer);
    setCalculatedHash(hash);

    findMatch(hash);
    setIsSearching(false);
  };

  const handleVerifyHash = () => {
    if (!hashInput.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    const cleanHash = hashInput.trim().toLowerCase();
    setCalculatedHash(cleanHash);

    findMatch(cleanHash);
    setIsSearching(false);
  };

  const findMatch = (targetHash: string) => {
    const clean = targetHash.toLowerCase();
    for (const block of blocks) {
      for (const tx of block.transactions) {
        if (tx.contentHash.toLowerCase() === clean) {
          setMatchedRecord({ tx, block });
          return;
        }
      }
    }
    setMatchedRecord(null);
  };

  return (
    <div id="public-verifier" className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Zero-Knowledge Public Verification Station</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Verify Authentic Prior Art & Supply Integrity
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Anyone can verify whether a file, code repository, or document has an authentic prior art timestamp on the blockchain without revealing the underlying private contents.
          </p>
        </div>

        {/* Query Mode Switcher */}
        <div className="mt-6 flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => { setQueryMode('TEXT'); setHasSearched(false); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              queryMode === 'TEXT' ? 'bg-slate-800 text-emerald-300 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text / Code
          </button>
          <button
            onClick={() => { setQueryMode('FILE'); setHasSearched(false); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              queryMode === 'FILE' ? 'bg-slate-800 text-emerald-300 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File (Zero-Knowledge)
          </button>
          <button
            onClick={() => { setQueryMode('HASH'); setHasSearched(false); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              queryMode === 'HASH' ? 'bg-slate-800 text-emerald-300 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct SHA-256 Hash
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {queryMode === 'TEXT' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste Text / Source Code to Verify
            </label>
            <textarea
              rows={4}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Paste algorithm snippet, document text, or manifest string..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleVerifyText}
              disabled={isSearching || !textInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Compute Hash & Verify Ledger</span>
            </button>
          </div>
        )}

        {queryMode === 'FILE' && (
          <div className="p-8 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl bg-slate-950/60 text-center transition-colors">
            <input
              type="file"
              id="verifier-file-upload"
              className="hidden"
              onChange={handleVerifyFile}
            />
            <label htmlFor="verifier-file-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">Select any file to check proof timestamp</p>
              <p className="text-xs text-slate-400 mt-1">
                Zero-knowledge: Hashing happens purely inside your browser; the file is never uploaded.
              </p>
            </label>
          </div>
        )}

        {queryMode === 'HASH' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Enter 64-Character SHA-256 Digest
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={hashInput}
                onChange={e => setHashInput(e.target.value)}
                placeholder="e.g. a7c93f0b2611e405e32408c4b6932405a10984852378822501a3962b9a716801"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleVerifyHash}
                disabled={isSearching || !hashInput.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Search className="h-4 w-4" />
                <span>Search Ledger</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Box */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-400 text-[11px]">Computed SHA-256:</span>
            <span className="text-emerald-300 break-all select-all font-medium text-[11px]">
              {calculatedHash}
            </span>
          </div>

          {matchedRecord ? (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                      Authentic Prior Art Verified
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {matchedRecord.tx.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onSelectProof(matchedRecord.tx, matchedRecord.block)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shrink-0"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>View Official Certificate</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Author / Creator</span>
                  <span className="text-white font-semibold">{matchedRecord.tx.author}</span>
                  <span className="text-[10px] font-mono text-slate-400 block">{matchedRecord.tx.authorWallet}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Immutable Timestamp</span>
                  <span className="text-white font-mono">{new Date(matchedRecord.tx.timestamp).toUTCString()}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Blockchain Location</span>
                  <span className="text-emerald-300 font-semibold font-mono">
                    Block #{matchedRecord.block.index} ({matchedRecord.block.blockType})
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-emerald-300">Google TOS Rights Shield Status</p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {matchedRecord.tx.googleTos.immutableProtectionNote} (Terms Ref: {matchedRecord.tx.googleTos.termsReference})
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <XCircle className="h-8 w-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Matching Proof Found on Ledger</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                This exact file or text has not been timestamped on the ProvenanceChain ledger. Even a single modified space, punctuation mark, or bit produces a different hash.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
