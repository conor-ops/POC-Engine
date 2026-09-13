import React, { useState, useEffect, useTransition } from 'react';
import { Header } from './components/Header';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { ProofTimeline } from './components/ProofTimeline';
import { SupplyChainTracker } from './components/SupplyChainTracker';
import { PublicVerifier } from './components/PublicVerifier';
import { TamperSimulator } from './components/TamperSimulator';
import { GoogleTosShield } from './components/GoogleTosShield';
import { AiNoveltyAuditor } from './components/AiNoveltyAuditor';
import { ProofCreatorModal } from './components/ProofCreatorModal';
import { ProofCertificateModal } from './components/ProofCertificateModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { Block, TransactionPayload, AiPriorArtAnalysis, ConnectedAccount } from './types';
import { INITIAL_SAMPLE_BLOCKS, DEFAULT_CONNECTED_ACCOUNTS } from './data/sampleProofs';
import { mineBlock, validateChain, sha256 } from './crypto/blockchain';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'provenance_chain_blocks_v1';
const ACCOUNTS_STORAGE_KEY = 'provenance_connected_accounts_v1';

export default function App() {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load blocks from localStorage, using initial sample:', e);
    }
    return INITIAL_SAMPLE_BLOCKS;
  });

  // Connected Enterprise, Organization, and Personal accounts
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load connected accounts:', e);
    }
    return DEFAULT_CONNECTED_ACCOUNTS;
  });

  const [activeAccount, setActiveAccount] = useState<ConnectedAccount>(() => {
    return connectedAccounts.find(a => a.isCurrent) || connectedAccounts[0];
  });

  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'TIMELINE' | 'VERIFIER' | 'TAMPER_LAB' | 'SUPPLY_CHAIN' | 'TOS_SHIELD' | 'AI_AUDITOR'>('EXPLORER');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState<{ tx: TransactionPayload; block: Block } | null>(null);
  const [isChainValid, setIsChainValid] = useState(true);
  const [tamperedIndices, setTamperedIndices] = useState<number[]>([]);
  const creatorWallet = activeAccount.walletAddress;

  const handleSelectAccount = (account: ConnectedAccount) => {
    setActiveAccount(account);
    const updated = connectedAccounts.map(a => ({
      ...a,
      isCurrent: a.id === account.id
    }));
    setConnectedAccounts(updated);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddAccount = (newAccount: ConnectedAccount) => {
    const updated = [...connectedAccounts, newAccount];
    setConnectedAccounts(updated);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Verify chain on every block change
  useEffect(() => {
    validateChain(blocks).then(result => {
      setIsChainValid(result.isValid);
      setTamperedIndices(result.tamperedBlockIndices);
    });
  }, [blocks]);

  // Handle minting a new proof block
  const handleMintProof = async (tx: TransactionPayload) => {
    const previousBlock = blocks[blocks.length - 1];
    const previousHash = previousBlock ? previousBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const nextIndex = blocks.length;

    const newBlock = await mineBlock(
      nextIndex,
      'PROOF_OF_CONCEPT',
      [tx],
      previousHash,
      2,
      `Node_Validator_${Math.floor(Math.random() * 10 + 1)}`
    );

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlocks));
    } catch (e) {
      console.warn('Failed to save blocks to localStorage:', e);
    }
  };

  // Handle Tamper Simulation (to demonstrate immutability)
  const handleApplyTamper = async (blockIndex: number, txIndex: number, newRawText: string, newAuthor?: string) => {
    const updatedBlocks = JSON.parse(JSON.stringify(blocks)) as Block[];
    if (updatedBlocks[blockIndex] && updatedBlocks[blockIndex].transactions[txIndex]) {
      const targetTx = updatedBlocks[blockIndex].transactions[txIndex];
      targetTx.contentRaw = newRawText;
      targetTx.contentHash = await sha256(newRawText);
      if (newAuthor) {
        targetTx.author = newAuthor;
        targetTx.ipDeclaration.creatorName = newAuthor;
      }
      setBlocks(updatedBlocks);
    }
  };

  // Reset chain back to pristine truth
  const handleResetChain = () => {
    setBlocks(INITIAL_SAMPLE_BLOCKS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    setIsChainValid(true);
    setTamperedIndices([]);
  };

  // Mint proof directly from AI Novelty Auditor
  const handleMintAuditedProof = async (analysis: AiPriorArtAnalysis, rawText: string, title: string) => {
    const contentHash = await sha256(rawText);
    const timestamp = new Date().toISOString();
    const txId = `tx-ai-novelty-${Date.now().toString(36)}`;

    const newTx: TransactionPayload = {
      txId,
      category: 'SOFTWARE_IP',
      title,
      description: analysis.summary,
      author: `${activeAccount.name} (${activeAccount.email})`,
      authorWallet: activeAccount.walletAddress,
      contentRaw: rawText,
      contentHash,
      tags: ['AI Audited', 'Prior Art', 'Technical Effect', activeAccount.orgName],
      version: '1.0.0',
      ipDeclaration: {
        title,
        creatorName: activeAccount.name,
        creatorWallet: activeAccount.walletAddress,
        licenseType: 'Creator Exclusive Copyright & Trade Secret',
        technicalEffectDescription: analysis.technicalEffectAssessment,
        priorArtTimestamp: timestamp,
        noveltyDeclaration: analysis.bulletproofPriorArtStatement,
        isZeroKnowledgeHash: true
      },
      googleTos: {
        ipOwnershipRetained: true,
        licenseScope: 'CREATOR_EXCLUSIVE',
        privacyCompliant: true,
        consentProvided: true,
        termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
        immutableProtectionNote: 'AI-evaluated novelty claims permanently sealed on blockchain.'
      },
      timestamp
    };

    await handleMintProof(newTx);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    setActiveTab('EXPLORER');
  };

  return (
    <div id="provenance-chain-root" className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        blockCount={blocks.length}
        isChainValid={isChainValid}
        creatorWallet={creatorWallet}
        activeAccount={activeAccount}
      />

      {/* Main Content Viewport */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'EXPLORER' && (
          <BlockchainExplorer
            blocks={blocks}
            onSelectProof={(tx, block) => setCertificateData({ tx, block })}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenDriveModal={() => setIsDriveModalOpen(true)}
            tamperedIndices={tamperedIndices}
          />
        )}

        {activeTab === 'TIMELINE' && (
          <ProofTimeline
            blocks={blocks}
            onSelectProof={(tx, block) => setCertificateData({ tx, block })}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'SUPPLY_CHAIN' && (
          <SupplyChainTracker
            blocks={blocks}
            onSelectProof={(tx, block) => setCertificateData({ tx, block })}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onMintProof={handleMintProof}
            activeAccount={activeAccount}
          />
        )}

        {activeTab === 'VERIFIER' && (
          <PublicVerifier
            blocks={blocks}
            onSelectProof={(tx, block) => setCertificateData({ tx, block })}
          />
        )}

        {activeTab === 'AI_AUDITOR' && (
          <AiNoveltyAuditor
            onMintAuditedProof={handleMintAuditedProof}
            creatorWallet={creatorWallet}
          />
        )}

        {activeTab === 'TAMPER_LAB' && (
          <TamperSimulator
            blocks={blocks}
            onApplyTamper={handleApplyTamper}
            onResetChain={handleResetChain}
            isChainValid={isChainValid}
            tamperedIndices={tamperedIndices}
          />
        )}

        {activeTab === 'TOS_SHIELD' && (
          <GoogleTosShield />
        )}
      </main>

      {/* Proof Creator Modal */}
      <ProofCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMintProof={handleMintProof}
        creatorWallet={creatorWallet}
      />

      {/* Google Drive & Multi-Account Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onMintProof={handleMintProof}
        connectedAccounts={connectedAccounts}
        activeAccount={activeAccount}
        onSelectAccount={handleSelectAccount}
        onAddAccount={handleAddAccount}
      />

      {/* Proof Certificate Modal */}
      <ProofCertificateModal
        isOpen={!!certificateData}
        onClose={() => setCertificateData(null)}
        transaction={certificateData?.tx || null}
        block={certificateData?.block || null}
      />

      {/* Footer */}
      <footer id="app-footer" className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-300">ProvenanceChain Subsystem</span>
            <span>• Immutable Creator Prior Art & Supply Traceability</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Google TOS: July 30, 2026</span>
            <span>•</span>
            <span>Zero-Knowledge SHA-256</span>
            <span>•</span>
            <span>"Your Content Remains Yours"</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

