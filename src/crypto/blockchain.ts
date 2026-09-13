import { Block, BlockType, ChainValidationResult, GoogleTosCompliance, TransactionPayload } from '../types';

/**
 * Real Web Crypto SHA-256 Hashing
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Buffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Merkle Tree Root calculation
 */
export async function calculateMerkleRoot(transactions: TransactionPayload[]): Promise<string> {
  if (transactions.length === 0) {
    return sha256('EMPTY_MERKLE_ROOT');
  }

  let currentLevel = await Promise.all(
    transactions.map(tx => sha256(JSON.stringify({
      txId: tx.txId,
      contentHash: tx.contentHash,
      authorWallet: tx.authorWallet,
      timestamp: tx.timestamp,
      version: tx.version
    })))
  );

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = await sha256(currentLevel[i] + currentLevel[i + 1]);
        nextLevel.push(combined);
      } else {
        // Odd node duplicated as in Bitcoin Merkle tree standard
        const combined = await sha256(currentLevel[i] + currentLevel[i]);
        nextLevel.push(combined);
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * Calculate standard block hash
 */
export async function calculateBlockHash(
  index: number,
  timestamp: string,
  merkleRoot: string,
  previousHash: string,
  nonce: number,
  difficulty: number
): Promise<string> {
  const headerString = `${index}:${timestamp}:${merkleRoot}:${previousHash}:${nonce}:${difficulty}`;
  return sha256(headerString);
}

/**
 * Proof of Work Mining
 */
export async function mineBlock(
  index: number,
  blockType: BlockType,
  transactions: TransactionPayload[],
  previousHash: string,
  difficulty: number = 2,
  minedBy: string = 'ProvenanceNode_01 (Creator Signature)'
): Promise<Block> {
  const timestamp = new Date().toISOString();
  const merkleRoot = await calculateMerkleRoot(transactions);
  let nonce = 0;
  const targetPrefix = '0'.repeat(difficulty);
  let hash = '';

  while (true) {
    hash = await calculateBlockHash(index, timestamp, merkleRoot, previousHash, nonce, difficulty);
    if (hash.startsWith(targetPrefix)) {
      break;
    }
    nonce++;
    // Safety cap for browser responsiveness
    if (nonce > 1000000) {
      break;
    }
  }

  return {
    index,
    timestamp,
    blockType,
    transactions,
    merkleRoot,
    previousHash,
    nonce,
    hash,
    difficulty,
    minedBy
  };
}

/**
 * Full Blockchain Validation Engine
 */
export async function validateChain(chain: Block[]): Promise<ChainValidationResult> {
  const tamperedIndices: number[] = [];
  const errors: string[] = [];

  if (chain.length === 0) {
    return { isValid: false, tamperedBlockIndices: [], errorDetails: ['Blockchain is empty.'] };
  }

  for (let i = 0; i < chain.length; i++) {
    const currentBlock = chain[i];

    // Check Merkle Root
    const computedMerkle = await calculateMerkleRoot(currentBlock.transactions);
    if (computedMerkle !== currentBlock.merkleRoot) {
      tamperedIndices.push(i);
      errors.push(`Block #${i}: Merkle root mismatch (computed: ${computedMerkle.slice(0, 10)}..., header: ${currentBlock.merkleRoot.slice(0, 10)}...)`);
    }

    // Check Header Hash
    const computedHash = await calculateBlockHash(
      currentBlock.index,
      currentBlock.timestamp,
      currentBlock.merkleRoot,
      currentBlock.previousHash,
      currentBlock.nonce,
      currentBlock.difficulty
    );

    if (computedHash !== currentBlock.hash) {
      if (!tamperedIndices.includes(i)) tamperedIndices.push(i);
      errors.push(`Block #${i}: Hash corruption detected (computed: ${computedHash.slice(0, 10)}..., recorded: ${currentBlock.hash.slice(0, 10)}...)`);
    }

    // Check Link to Previous Block
    if (i > 0) {
      const prevBlock = chain[i - 1];
      if (currentBlock.previousHash !== prevBlock.hash) {
        if (!tamperedIndices.includes(i)) tamperedIndices.push(i);
        errors.push(`Block #${i}: Broken cryptographic link! previousHash does not match Block #${i - 1} hash.`);
      }
    } else {
      // Genesis Block
      if (currentBlock.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        if (!tamperedIndices.includes(0)) tamperedIndices.push(0);
        errors.push('Genesis Block previousHash is invalid.');
      }
    }
  }

  return {
    isValid: tamperedIndices.length === 0,
    tamperedBlockIndices: tamperedIndices,
    errorDetails: errors
  };
}

/**
 * Standard Google TOS Compliance Manifest Template
 */
export function createGoogleTosCompliance(): GoogleTosCompliance {
  return {
    ipOwnershipRetained: true,
    licenseScope: 'CREATOR_EXCLUSIVE',
    privacyCompliant: true,
    consentProvided: true,
    termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
    immutableProtectionNote: 'Cryptographic proof of work permanently establishes timestamped prior art; content ownership remains 100% with the creator.'
  };
}
