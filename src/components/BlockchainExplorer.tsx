import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  FileCheck2, 
  ShieldCheck, 
  Hash, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Cpu,
  Clock,
  Eye,
  FileCode,
  Truck,
  Sparkles,
  AlertTriangle,
  Download,
  UploadCloud,
  FileJson,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Block, ProofCategory, TransactionPayload } from '../types';
import confetti from 'canvas-confetti';

interface BlockchainExplorerProps {
  blocks: Block[];
  onSelectProof: (tx: TransactionPayload, block: Block) => void;
  onOpenCreateModal: () => void;
  tamperedIndices: number[];
  onOpenDriveModal?: () => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  blocks,
  onSelectProof,
  onOpenCreateModal,
  tamperedIndices,
  onOpenDriveModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedBlockDetail, setSelectedBlockDetail] = useState<Block | null>(null);
  const [showJsonPreviewModal, setShowJsonPreviewModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute total transactions
  const totalTxsCount = blocks.reduce((acc, b) => acc + b.transactions.length, 0);

  // Generate complete ledger export payload
  const generateExportPayload = () => {
    return {
      exportMetadata: {
        exportTimestamp: new Date().toISOString(),
        ledgerTitle: "ProvenanceChain - Creator Proof of Concept & Work (PoCW) Ledger",
        protocolVersion: "2.0.0-ENTERPRISE",
        cryptographicStandard: "NIST FIPS 180-4 SHA-256 with Merkle Tree Digests",
        organization: "Master Recovery Hub Enterprise (GCP Project: master-recovery-hub-2026)",
        primaryAuthor: "Jay Lang (jaylang085@gmail.com)",
        chainIntegrityStatus: tamperedIndices.length === 0 ? "CRYPTOGRAPHICALLY_VALID_100_PERCENT" : "TAMPER_DETECTED",
        totalBlocksCount: blocks.length,
        totalProofsAnchored: totalTxsCount,
        googleTosComplianceAffirmation: "Full Creator Exclusive IP Retained (Google Terms of Service July 30, 2026: 'Your content remains yours')",
        latestBlockHash: blocks[blocks.length - 1]?.hash || "",
        latestMerkleRoot: blocks[blocks.length - 1]?.merkleRoot || ""
      },
      blocks: blocks
    };
  };

  // Handle downloading chain state as JSON file
  const handleExportLedger = () => {
    try {
      const payload = generateExportPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `provenance_chain_proof_ledger_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice(`Proof Ledger exported successfully! (${blocks.length} blocks, ${totalTxsCount} proofs downloaded as JSON)`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setExportNotice(null), 6000);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const handleCopyJson = () => {
    const payload = generateExportPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Filter blocks or transactions
  const filteredBlocks = blocks.filter(block => {
    if (categoryFilter !== 'ALL') {
      const hasCategory = block.transactions.some(tx => tx.category === categoryFilter);
      if (!hasCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inHash = block.hash.toLowerCase().includes(q) || block.previousHash.toLowerCase().includes(q);
      const inTx = block.transactions.some(tx => 
        tx.title.toLowerCase().includes(q) ||
        tx.author.toLowerCase().includes(q) ||
        tx.contentHash.toLowerCase().includes(q) ||
        tx.txId.toLowerCase().includes(q)
      );
      return inHash || inTx;
    }
    return true;
  });

  return (
    <div id="blockchain-explorer" className="space-y-6">
      
      {/* Top Banner / Metrics */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Permanent Decentralized Provenance Subsystem</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Creator Proof of Concept & Work (PoCW) Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Here, this is on the blockchain forever — good luck purging my data and stealing it."
              Every commit, research note, and supply logistics batch is anchored by real SHA-256 Merkle trees in full compliance with Google's Terms of Service.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenDriveModal && (
              <button
                id="btn-import-google-drive"
                onClick={onOpenDriveModal}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
                title="Browse and anchor files directly from Google Drive"
              >
                <UploadCloud className="h-4 w-4 text-blue-400" />
                <span>Google Drive Sync</span>
              </button>
            )}

            <button
              id="btn-inspect-json-ledger"
              onClick={() => setShowJsonPreviewModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
              title="Inspect formatted raw JSON ledger in browser"
            >
              <FileJson className="h-4 w-4 text-amber-400" />
              <span>Inspect JSON</span>
            </button>

            <button
              id="btn-export-proof-ledger"
              onClick={handleExportLedger}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
              title="Download entire blockchain state as a JSON file"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Export Proof Ledger</span>
            </button>

            <button
              id="btn-anchor-new-proof"
              onClick={onOpenCreateModal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              + Anchor New Proof
            </button>
          </div>
        </div>

        {/* Export Proof Ledger Notification Toast */}
        {exportNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 shadow-md">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Cryptographic State Exported: </span>
                <span>{exportNotice}</span>
              </div>
            </div>
            <button
              onClick={() => setExportNotice(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Hash, TxID, Author, or Title..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Blocks' },
              { id: 'SOFTWARE_IP', label: 'Software IP' },
              { id: 'CREATIVE_MEDIA', label: 'Media & Docs' },
              { id: 'SUPPLY_CHAIN', label: 'Supply Logistics' },
              { id: 'EMPLOYMENT_MILESTONE', label: 'Milestones' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blocks Grid / Visual Chain */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-400" />
            <span>Anchored Blocks ({filteredBlocks.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Consensus: SHA-256 Proof-of-Work</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredBlocks.map((block) => {
            const isTampered = tamperedIndices.includes(block.index);

            return (
              <div
                key={block.index}
                className={`rounded-2xl border transition-all ${
                  isTampered
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Block Header Strip */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-inner ${
                      isTampered
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      #{block.index}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Block #{block.index} • {block.blockType}
                        </span>
                        {isTampered && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300 text-[10px] font-bold">
                            <AlertTriangle className="h-3 w-3" />
                            <span>TAMPER DETECTED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(block.timestamp).toUTCString()} • Mined by: {block.minedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Nonce: {block.nonce}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Diff: {block.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-300">
                      {block.transactions.length} Proof{block.transactions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Hashes Row */}
                <div className="p-4 sm:p-5 bg-slate-950/50 space-y-2 font-mono text-xs border-b border-slate-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500 text-[11px] shrink-0">Block Hash:</span>
                    <span className={`break-all text-[11px] font-medium select-all ${
                      isTampered ? 'text-rose-400' : 'text-emerald-300'
                    }`}>
                      {block.hash}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500 text-[11px] shrink-0">Previous Hash:</span>
                    <span className="break-all text-[11px] text-slate-400 select-all">
                      {block.previousHash}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500 text-[11px] shrink-0">Merkle Root:</span>
                    <span className="break-all text-[11px] text-slate-400 select-all">
                      {block.merkleRoot}
                    </span>
                  </div>
                </div>

                {/* Transactions / Proofs in Block */}
                <div className="p-4 sm:p-5 space-y-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Recorded Proofs of Concept & Deliverables
                  </span>

                  <div className="space-y-3">
                    {block.transactions.map((tx) => (
                      <div
                        key={tx.txId}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {tx.category}
                            </span>
                            <h3 className="text-sm font-bold text-white hover:text-emerald-300 transition-colors">
                              {tx.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">v{tx.version}</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {tx.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <span className="text-slate-500">Author:</span>
                              <span className="text-slate-200">{tx.author}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400/90">{tx.contentHash.slice(0, 14)}...</span>
                            </span>
                            {tx.supplyChain && (
                              <span className="flex items-center gap-1 text-cyan-300">
                                <Truck className="h-3 w-3" />
                                <span>Batch #{tx.supplyChain.batchId} ({tx.supplyChain.logisticsStatus})</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => onSelectProof(tx, block)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>View Certificate</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Raw JSON Proof Ledger Inspector Modal */}
      {showJsonPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Full Blockchain State • Raw JSON Ledger</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportLedger}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .JSON</span>
                </button>
                <button
                  onClick={() => setShowJsonPreviewModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 bg-slate-950/90 font-mono text-[11px] text-slate-300 select-all leading-relaxed">
              <pre>{JSON.stringify(generateExportPayload(), null, 2)}</pre>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{blocks.length} Blocks • {totalTxsCount} Cryptographic Proofs • SHA-256 Merkle Verification</span>
              <button
                onClick={() => setShowJsonPreviewModal(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
