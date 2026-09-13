import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Code, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Hash, 
  Cpu, 
  FileText, 
  Truck, 
  Lock,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sha256, sha256Buffer } from '../crypto/blockchain';
import { ProofCategory, TransactionPayload } from '../types';

interface ProofCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMintProof: (tx: TransactionPayload) => Promise<void>;
  creatorWallet: string;
}

export const ProofCreatorModal: React.FC<ProofCreatorModalProps> = ({
  isOpen,
  onClose,
  onMintProof,
  creatorWallet,
}) => {
  const [category, setCategory] = useState<ProofCategory>('SOFTWARE_IP');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('Jay Lang (Enterprise Lead)');
  const [version, setVersion] = useState('1.0.0');
  const [tagsInput, setTagsInput] = useState('Prior Art, Cryptographic Proof, Novelty, Master Recovery Hub');
  
  // Content input mode: text/code vs file
  const [inputMode, setInputMode] = useState<'TEXT' | 'FILE'>('TEXT');
  const [rawText, setRawText] = useState(`// Master Recovery Hub 2026: Zero-Trust Multi-Cloud Recovery Protocol
// Cryptographic Proof of Architecture & Algorithmic Key Orchestration
function orchestrateFailoverState(clusterNodeId: string) {
  const entropyBuffer = new Uint8Array(64);
  crypto.getRandomValues(entropyBuffer);
  return { nodeId: clusterNodeId, stateProofDigest: entropyBuffer };
}`);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string; hash: string } | null>(null);
  
  // Computed live hash
  const [computedHash, setComputedHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);

  // Supply Chain specific fields
  const [batchId, setBatchId] = useState('');
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [currentCustodian, setCurrentCustodian] = useState('');

  // AI Assist state
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiPriorArtNotes, setAiPriorArtNotes] = useState('');
  const [technicalEffect, setTechnicalEffect] = useState('');

  // Google TOS confirmation
  const [agreeTos, setAgreeTos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate live hash when text changes
  React.useEffect(() => {
    if (inputMode === 'TEXT') {
      setIsHashing(true);
      sha256(rawText || 'empty').then(h => {
        setComputedHash(h);
        setIsHashing(false);
      });
    }
  }, [rawText, inputMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await sha256Buffer(buffer);
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        hash: hash
      });
      setComputedHash(hash);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err) {
      console.error('File hash error:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!title && !rawText) return;
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/gemini/analyze-poc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Work',
          description,
          contentRaw: rawText,
          category,
          author: authorName
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setTechnicalEffect(data.analysis.technicalEffectAssessment || '');
        setAiPriorArtNotes(data.analysis.bulletproofPriorArtStatement || '');
        if (!description) {
          setDescription(data.analysis.summary || '');
        }
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !agreeTos || !computedHash) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const timestamp = new Date().toISOString();
      const txId = `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const newTx: TransactionPayload = {
        txId,
        category,
        title,
        description: description || 'Immutable Proof of Concept registration.',
        author: authorName,
        authorWallet: creatorWallet,
        contentRaw: inputMode === 'TEXT' ? rawText : undefined,
        contentHash: computedHash,
        fileName: uploadedFile?.name,
        fileSize: uploadedFile?.size,
        mimeType: uploadedFile?.type,
        tags,
        version: version || '1.0.0',
        ipDeclaration: {
          title,
          creatorName: authorName,
          creatorWallet,
          licenseType: 'Creator Copyright Retained',
          technicalEffectDescription: technicalEffect || 'Provides verified reproducible prior art and proof of creation timestamp.',
          priorArtTimestamp: timestamp,
          noveltyDeclaration: aiPriorArtNotes || `Sole creation registered by ${authorName}.`,
          isZeroKnowledgeHash: true
        },
        supplyChain: category === 'SUPPLY_CHAIN' ? {
          batchId: batchId || `BATCH-${Date.now().toString().slice(-4)}`,
          originLocation: originLocation || 'Manufacturing Hub Alpha',
          destinationLocation: destinationLocation || 'Global Logistics Terminal',
          currentCustodian: currentCustodian || authorName,
          logisticsStatus: 'PRODUCED'
        } : undefined,
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'Proof is cryptographically anchored. Creator retains 100% IP ownership.'
        },
        timestamp
      };

      await onMintProof(newTx);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
    } catch (err) {
      console.error('Minting error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="proof-creator-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register Proof of Concept & Work (PoCW)</h2>
              <p className="text-xs text-slate-400">Timestamp prior art & logistics onto the immutable ledger</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Verification Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'SOFTWARE_IP', label: 'Software & Code IP', icon: Code },
                { id: 'CREATIVE_MEDIA', label: 'Media & Documents', icon: FileText },
                { id: 'SUPPLY_CHAIN', label: 'Supply Logistics', icon: Truck },
                { id: 'EMPLOYMENT_MILESTONE', label: 'Milestone / Work', icon: CheckCircle2 },
                { id: 'RESEARCH_PAPER', label: 'Research & Science', icon: Sparkles },
              ].map(item => {
                const Icon = item.icon;
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as ProofCategory)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1.5" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Proof Title / Artifact Name *
              </label>
              <input
                id="input-proof-title"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus Engine v1.2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Author / Creator Name
              </label>
              <input
                id="input-author-name"
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Summary & Innovation Notes
              </label>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzingAI}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              >
                {isAnalyzingAI ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>Auto-Extract with Gemini AI</span>
              </button>
            </div>
            <textarea
              id="input-proof-desc"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the functional novelty, technical mechanism, or milestone deliverable..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Supply Chain Specific Fields */}
          {category === 'SUPPLY_CHAIN' && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Truck className="h-4 w-4" />
                <span>Supply Chain Logistics Parameters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Batch / Lot ID</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    placeholder="BATCH-2026-904"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Current Custodian</label>
                  <input
                    type="text"
                    value={currentCustodian}
                    onChange={e => setCurrentCustodian(e.target.value)}
                    placeholder="TransLogistics Global Agent"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Origin Point</label>
                  <input
                    type="text"
                    value={originLocation}
                    onChange={e => setOriginLocation(e.target.value)}
                    placeholder="Kyoto Synthesis Lab, Japan"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Destination Facility</label>
                  <input
                    type="text"
                    value={destinationLocation}
                    onChange={e => setDestinationLocation(e.target.value)}
                    placeholder="Munich Gigafactory Cleanroom"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content / Proof Source */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Proof Payload / Source Material
              </label>
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'TEXT' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Code / Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('FILE')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'FILE' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Binary / File
                </button>
              </div>
            </div>

            {inputMode === 'TEXT' ? (
              <textarea
                id="input-proof-raw"
                rows={4}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste code snippet, mathematical formula, research findings, or deliverable output..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl bg-slate-950/60 text-center transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-emerald-400 mb-2" />
                  <p className="font-medium text-white text-xs">Click or drag file to hash locally</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Documents, PDFs, 3D CAD, APKs, Audio Stems, or Images (Zero-Knowledge Hash)
                  </p>
                  {uploadedFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Cryptographic SHA-256 Live Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Hash className="h-3.5 w-3.5 text-emerald-400" />
                <span>Computed SHA-256 Digest (Zero-Knowledge Fingerprint):</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                WebCrypto Native
              </span>
            </div>
            <p className="text-emerald-300 break-all select-all font-medium text-[11px]">
              {isHashing ? 'Computing hash...' : (computedHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
            </p>
          </div>

          {/* Google TOS Rights & Compliance Box */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-cyan-200">
                  Google Terms of Service Rights Compliance (July 30, 2026)
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong>"Your content remains yours"</strong> — You retain 100% intellectual property rights. By broadcasting this cryptographic hash, you anchor permanent timestamped proof of prior art. Only the zero-knowledge mathematical digest is recorded on-chain, keeping private proprietary data secure.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 pt-2 border-t border-cyan-500/20 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTos}
                onChange={e => setAgreeTos(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span>I confirm full intellectual property ownership and author consent for immutable blockchain registration.</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-mint"
              type="submit"
              disabled={isSubmitting || !title || !agreeTos}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mining Block & Merkle Bundling...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Mine & Anchor Proof On-Chain</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
