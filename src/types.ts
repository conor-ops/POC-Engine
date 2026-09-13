/**
 * ProvenanceChain - Core Data Types & Schema
 */

export type ProofCategory = 
  | 'SOFTWARE_IP' 
  | 'CREATIVE_MEDIA' 
  | 'RESEARCH_PAPER' 
  | 'SUPPLY_CHAIN' 
  | 'EMPLOYMENT_MILESTONE';

export type BlockType = 
  | 'GENESIS'
  | 'PROOF_OF_CONCEPT'
  | 'MILESTONE_COMMIT'
  | 'SUPPLY_CUSTODY'
  | 'IP_TIMESTAMP'
  | 'RESEARCH_NOTE';

export interface GoogleTosCompliance {
  ipOwnershipRetained: boolean;       // "Your content remains yours"
  licenseScope: 'CREATOR_EXCLUSIVE' | 'NON_EXCLUSIVE_OPERATING_ONLY';
  privacyCompliant: boolean;          // Zero-knowledge payload hash
  consentProvided: boolean;           // Explicit creator broadcast
  termsReference: string;             // Reference to Google TOS July 30, 2026
  immutableProtectionNote: string;    // "Immutable cryptographic proof prevents post-hoc theft or unauthorized purging"
}

export interface IoTSensorReading {
  deviceId: string;
  deviceType: string;
  timestamp: string;
  gps: {
    lat: number;
    lng: number;
    locationName: string;
    altitudeMeters: number;
    speedKmh: number;
    bearing: string;
  };
  temperatureCelsius: number;
  humidityPercent: number;
  shockGForce: number;
  batteryLevelPercent: number;
  signalStrengthDbm: number;
  connectionType: '5G_NB_IOT' | 'LORAWAN' | 'SATELLITE_IRIDIUM';
  tamperSealState: 'INTACT' | 'BREACHED';
  deviceSignature: string; // Cryptographic device signature proving authentic transmission
  isExcursionAlert?: boolean;
  excursionDetails?: string;
}

export type SmartContractStage = 
  | 'ORIGIN_CONFIRMATION'
  | 'IN_TRANSIT_MONITORING'
  | 'QUALITY_CHECK_SIGNOFF'
  | 'CUSTOMS_CLEARANCE'
  | 'FINAL_DELIVERY_RELEASE';

export type SmartContractStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'BREACH_PENALTY';

export type StakeholderRole = 'MANUFACTURER' | 'CARRIER' | 'QA_AUDITOR' | 'CUSTOMS' | 'RECEIVER';

export interface SmartContractVerificationStep {
  id: string;
  stage: SmartContractStage;
  title: string;
  description: string;
  requiredStakeholder: StakeholderRole;
  status: SmartContractStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  verifierWallet?: string;
  verifierSignature?: string;
  criteriaEvaluated: {
    name: string;
    requiredValue: string;
    actualValue: string;
    passed: boolean;
  }[];
  contractAddress: string;
  gasUsedGwei?: number;
  txHash?: string;
  automatedRule: string;
  failureReason?: string;
}

export interface SmartContractState {
  contractAddress: string;
  contractName: string;
  contractVersion: string;
  batchId: string;
  createdAt: string;
  status: 'ACTIVE' | 'SETTLED' | 'BREACHED';
  currentStageIndex: number;
  steps: SmartContractVerificationStep[];
  slaRules: {
    maxTempCelsius: number;
    minTempCelsius: number;
    maxHumidityPercent: number;
    maxShockGForce: number;
    maxTransitHours: number;
  };
  penaltyTriggered?: boolean;
  penaltyDescription?: string;
}

export interface SupplyChainMetadata {
  batchId?: string;
  originLocation?: string;
  destinationLocation?: string;
  currentCustodian?: string;
  custodianRole?: string;
  temperatureReading?: string;
  humidityReading?: string;
  gpsCoordinates?: string;
  rfidTag?: string;
  hardwareBOMHash?: string;
  logisticsStatus?: 'PRODUCED' | 'IN_TRANSIT' | 'QUALITY_PASSED' | 'CUSTOMS_CLEARED' | 'WAREHOUSE_STOCKED' | 'DELIVERED' | 'SLA_BREACH';
  iotReading?: IoTSensorReading;
  smartContractAddress?: string;
  contractStage?: SmartContractStage;
  smartContractStatus?: SmartContractStatus;
}

export interface IPDeclaration {
  title: string;
  creatorName: string;
  creatorWallet: string;
  licenseType: string;
  technicalEffectDescription?: string; // UK/US patentability technical effect
  priorArtTimestamp: string;
  repositoryOrSourceUrl?: string;
  noveltyDeclaration: string;
  isZeroKnowledgeHash: boolean;
}

export interface TransactionPayload {
  txId: string;
  category: ProofCategory;
  title: string;
  description: string;
  author: string;
  authorWallet: string;
  contentRaw?: string; // Optional raw data (or snippet)
  contentHash: string; // SHA-256 of raw data/file
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags: string[];
  version: string;
  parentTxId?: string; // For lineage / version trees
  ipDeclaration: IPDeclaration;
  supplyChain?: SupplyChainMetadata;
  googleTos: GoogleTosCompliance;
  timestamp: string;
}

export interface Block {
  index: number;
  timestamp: string;
  blockType: BlockType;
  transactions: TransactionPayload[];
  merkleRoot: string;
  previousHash: string;
  nonce: number;
  hash: string;
  difficulty: number;
  minedBy: string;
  isTampered?: boolean;
}

export interface ChainValidationResult {
  isValid: boolean;
  tamperedBlockIndices: number[];
  errorDetails: string[];
}

export interface AiPriorArtAnalysis {
  technicalNoveltyScore: number; // 0 - 100
  summary: string;
  keyClaims: string[];
  technicalEffectAssessment: string;
  jurisdictionRecommendations: {
    region: string;
    filingAdvice: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  googleTosOwnershipVerdict: string;
  bulletproofPriorArtStatement: string;
}

export interface NodePeer {
  id: string;
  name: string;
  region: string;
  status: 'SYNCED' | 'VALIDATING' | 'MINING';
  latencyMs: number;
  blocksValidated: number;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  email: string;
  type: 'ENTERPRISE' | 'ORGANIZATION' | 'PERSONAL';
  orgName: string;
  role: string;
  walletAddress: string;
  accountSource: 'GOOGLE_WORKSPACE' | 'GOOGLE_CLOUD_IDENTITY' | 'PERSONAL_GOOGLE' | 'LEDGER_KEYS';
  verifiedAt: string;
  isCurrent: boolean;
}

