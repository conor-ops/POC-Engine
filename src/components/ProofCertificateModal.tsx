import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Hash, 
  Calendar, 
  User, 
  Lock, 
  QrCode, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink,
  Truck
} from 'lucide-react';
import { Block, TransactionPayload } from '../types';

interface ProofCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionPayload | null;
  block: Block | null;
}

export const ProofCertificateModal: React.FC<ProofCertificateModalProps> = ({
  isOpen,
  onClose,
  transaction,
  block,
}) => {
  const [copied, setCopied] = React.useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction || !block) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(transaction.contentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const proofObject = {
      certificateType: 'CERTIFICATE_OF_IMMUTABLE_PROVENANCE',
      standard: 'ProvenanceChain-PoCW-v1.0',
      compliance: 'Google Terms of Service (July 30, 2026)',
      blockHeight: block.index,
      blockHash: block.hash,
      merkleRoot: block.merkleRoot,
      timestamp: transaction.timestamp,
      proofId: transaction.txId,
      title: transaction.title,
      author: transaction.author,
      authorWallet: transaction.authorWallet,
      contentHashSha256: transaction.contentHash,
      googleTosRights: {
        ownershipRetained: transaction.googleTos.ipOwnershipRetained,
        licenseScope: transaction.googleTos.licenseScope,
        immutableGuarantee: transaction.googleTos.immutableProtectionNote,
      },
      ipDeclaration: transaction.ipDeclaration,
      supplyChain: transaction.supplyChain,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proofObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Proof_Certificate_${transaction.txId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="proof-certificate-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Official Cryptographic Certificate of Provenance</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON-LD</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div ref={certRef} className="p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 space-y-6 text-slate-100">
          
          {/* Certificate Border & Header */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest">
              <Lock className="h-3 w-3" />
              <span>Immutable Chain of Prior Art</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Certificate of Intellectual Provenance & Work
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Decentralized cryptographic timestamp asserting priority, author authenticity, and tamper-proof custody.
            </p>
          </div>

          {/* Core Artifact Details */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Artifact Title
                </span>
                <span className="text-base font-bold text-white">{transaction.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  Block #{block.index}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  v{transaction.version}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Author / Registered Creator</span>
                <span className="text-slate-200 font-semibold">{transaction.author}</span>
                <span className="font-mono text-[10px] text-slate-500 block">{transaction.authorWallet}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Anchored Timestamp (UTC)</span>
                <span className="font-mono text-slate-200">{new Date(transaction.timestamp).toUTCString()}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Prior Art & Novelty Summary</span>
                <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {transaction.description}
                </p>
              </div>

              {/* Supply Chain IoT & Smart Contract metadata if present */}
              {transaction.supplyChain && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      <span>Supply Chain Custody & IoT Sensor Telemetry</span>
                    </span>
                    <span className="text-cyan-300">
                      Batch #{transaction.supplyChain.batchId || '804'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Origin:</span>
                      <span className="truncate block font-semibold">{transaction.supplyChain.originLocation || 'Enclave Fab'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Current Custodian:</span>
                      <span className="text-cyan-300 truncate block">{transaction.supplyChain.currentCustodian || 'Carrier'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Temp & Humidity:</span>
                      <span className="text-purple-300 block">{transaction.supplyChain.temperatureReading || 'Nominal'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Smart Contract:</span>
                      <span className="text-amber-300 truncate block">{transaction.supplyChain.smartContractAddress || 'Autonomous'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Digests Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider">
                Cryptographic Evidence Digests
              </span>
              <button
                onClick={copyHash}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Payload SHA-256'}</span>
              </button>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Payload SHA-256 Digest (Zero-Knowledge Hash):</span>
              <span className="text-emerald-300 break-all text-[11px] select-all font-medium">
                {transaction.contentHash}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">Block Merkle Root:</span>
                <span className="text-slate-300 break-all text-[10px]">{block.merkleRoot}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Block Hash:</span>
                <span className="text-slate-300 break-all text-[10px]">{block.hash}</span>
              </div>
            </div>
          </div>

          {/* Google TOS & Rights Shield Affirmation */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-cyan-200">
                Google Terms of Service Rights Affirmation
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Under the official Google Terms of Service (July 30, 2026), <strong>"Your content remains yours"</strong>. This cryptographic certificate serves as indisputable proof of author precedence without relinquishing proprietary IP rights or granting non-operating commercial claims.
              </p>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>VERIFIED IMMUTABLE ON-CHAIN</span>
            </div>
            <span>ProvenanceChain Protocol • Decentralized PoCW</span>
          </div>

        </div>

      </div>
    </div>
  );
};
