import { Block, ConnectedAccount } from '../types';

export const REAL_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc-enterprise-mrh',
    name: 'Jay Lang (Enterprise Lead)',
    email: 'jaylang085@gmail.com',
    type: 'ENTERPRISE',
    orgName: 'Master Recovery Hub Enterprise Systems',
    role: 'Principal Disaster Recovery & Distributed Systems Architect',
    walletAddress: '0x71C8e2...a49B',
    accountSource: 'GOOGLE_WORKSPACE',
    verifiedAt: '2026-09-13T11:22:32-07:00',
    isCurrent: true
  },
  {
    id: 'acc-org-mrh2026',
    name: 'Master Recovery Hub 2026 (GCP Org)',
    email: 'admin@master-recovery-hub-2026.cloud',
    type: 'ORGANIZATION',
    orgName: 'master-recovery-hub-2026 (Project #464046919021)',
    role: 'Organization Infrastructure & Security Vault Custodian',
    walletAddress: '0x94B2d1...38e0',
    accountSource: 'GOOGLE_CLOUD_IDENTITY',
    verifiedAt: '2026-09-13T11:22:37-07:00',
    isCurrent: false
  },
  {
    id: 'acc-personal-primary',
    name: 'Jay Lang (Personal Account)',
    email: 'jaylang085@gmail.com',
    type: 'PERSONAL',
    orgName: 'Personal Research & Software IP',
    role: 'Independent Software Engineer & Creator',
    walletAddress: '0x3F8c99...B91e',
    accountSource: 'PERSONAL_GOOGLE',
    verifiedAt: '2026-09-13T11:22:52-07:00',
    isCurrent: false
  },
  {
    id: 'acc-personal-dev',
    name: 'Jay Lang (Personal Dev Lab)',
    email: 'jaylang.dev@gmail.com',
    type: 'PERSONAL',
    orgName: 'Lang Open Systems Lab',
    role: 'Full-Stack & Cloud Engineer',
    walletAddress: '0x55B042...e843',
    accountSource: 'LEDGER_KEYS',
    verifiedAt: '2026-09-13T11:22:52-07:00',
    isCurrent: false
  }
];

export const DEFAULT_CONNECTED_ACCOUNTS = REAL_CONNECTED_ACCOUNTS;

export const INITIAL_SAMPLE_BLOCKS: Block[] = [
  {
    index: 0,
    timestamp: '2026-09-01T08:00:00.000Z',
    blockType: 'GENESIS',
    transactions: [
      {
        txId: 'tx-mrh-genesis-0001',
        category: 'SOFTWARE_IP',
        title: 'Master Recovery Hub Enterprise - Genesis Proof Ledger Root',
        description: 'Permanent cryptographic genesis block anchoring the Master Recovery Hub Enterprise architecture and organizational IP protection framework under Google Terms of Service rules.',
        author: 'Jay Lang (Master Recovery Hub Enterprise Lead)',
        authorWallet: '0x71C8e2...a49B',
        contentRaw: 'GENESIS MASTER RECOVERY HUB 2026: Permanent cryptographic proof of concept anchoring enterprise disaster recovery, high-availability architecture, and creator intellectual property.',
        contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        tags: ['Genesis', 'Master Recovery Hub', 'Enterprise Org', 'Google Drive OAuth'],
        version: '1.0.0',
        ipDeclaration: {
          title: 'Master Recovery Hub Enterprise Root Architecture',
          creatorName: 'Jay Lang',
          creatorWallet: '0x71C8e2...a49B',
          licenseType: 'Enterprise Proprietary & Creator Copyright',
          priorArtTimestamp: '2026-09-01T08:00:00.000Z',
          repositoryOrSourceUrl: 'https://master-recovery-hub-2026.cloud',
          noveltyDeclaration: 'Unified zero-trust multi-cloud disaster recovery orchestration and decentralized proof of work immutability ledger.',
          isZeroKnowledgeHash: true
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'Jay Lang and Master Recovery Hub retain 100% intellectual property rights across enterprise and personal accounts.'
        },
        timestamp: '2026-09-01T08:00:00.000Z'
      }
    ],
    merkleRoot: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 412,
    hash: '004a8b79213f0ce518749e1e2d41a980753066a988d55c709e3a6a12b6f12089',
    difficulty: 2,
    minedBy: 'MasterRecoveryHub_Validator_Node_01 (US-West2 Cloud Run)'
  },
  {
    index: 1,
    timestamp: '2026-09-04T14:22:10.000Z',
    blockType: 'PROOF_OF_CONCEPT',
    transactions: [
      {
        txId: 'tx-mrh-engine-902',
        category: 'SOFTWARE_IP',
        title: 'Master Recovery Hub 2026 - Zero-Trust Disaster Recovery & Failover Engine (v1.0.0)',
        description: 'Proprietary automated disaster recovery failover engine with sub-second replication, automated state synchronization, and zero-knowledge cryptographic integrity verification.',
        author: 'Jay Lang (jaylang085@gmail.com)',
        authorWallet: '0x3F8c99...B91e',
        contentRaw: 'class MasterRecoveryHubEngine {\n  async orchestrateFailover(clusterId: string): Promise<RecoveryReceipt> {\n    // Sub-second quorum election and state reconstruction\n    return await this.verifyZeroTrustIntegrity(clusterId);\n  }\n}',
        contentHash: 'a7c93f0b2611e405e32408c4b6932405a10984852378822501a3962b9a716801',
        fileName: 'master_recovery_hub_engine_v1.0.ts',
        fileSize: 86400,
        mimeType: 'text/typescript',
        tags: ['Master Recovery Hub', 'Disaster Recovery', 'Software IP', 'Zero Trust', 'Failover Engine'],
        version: '1.0.0',
        ipDeclaration: {
          title: 'Master Recovery Hub High-Availability Failover Engine',
          creatorName: 'Jay Lang',
          creatorWallet: '0x3F8c99...B91e',
          licenseType: 'Creator Copyright & Enterprise Trade Secret',
          technicalEffectDescription: 'Produces instantaneous sub-second failover recovery with zero packet drop and deterministic state reconstruction under UK/US patent technical effect benchmarks.',
          priorArtTimestamp: '2026-09-04T14:22:10.000Z',
          repositoryOrSourceUrl: 'https://github.com/jaylang085/master-recovery-hub-2026',
          noveltyDeclaration: 'First multi-cloud disaster recovery engine integrating distributed hash chain verification with live Google Drive enterprise sync.',
          isZeroKnowledgeHash: true
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'All code, algorithms, and architecture remain 100% owned by Jay Lang. Cryptographic proof permanently sealed.'
        },
        timestamp: '2026-09-04T14:22:10.000Z'
      }
    ],
    merkleRoot: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    previousHash: '004a8b79213f0ce518749e1e2d41a980753066a988d55c709e3a6a12b6f12089',
    nonce: 1530,
    hash: '006f890c9b13998b417e29aa0852d43105ff7ba0236a6cf49a0293da2774900a',
    difficulty: 2,
    minedBy: 'EnterpriseNode_GCP_MasterRecoveryHub_01'
  },
  {
    index: 2,
    timestamp: '2026-09-08T19:45:00.000Z',
    blockType: 'IP_TIMESTAMP',
    transactions: [
      {
        txId: 'tx-mrh-dossier-401',
        category: 'CREATIVE_MEDIA',
        title: 'Master Recovery Hub 2026 - Enterprise Disaster Recovery Playbook & Architecture Dossier',
        description: 'Comprehensive enterprise business continuity runbook, recovery point objective (RPO) benchmarks, and confidential architecture documentation stored securely in Google Drive.',
        author: 'Jay Lang (jaylang085@gmail.com)',
        authorWallet: '0x71C8e2...a49B',
        contentRaw: 'ENTERPRISE_ORG: Master Recovery Hub 2026\nDOC_TITLE: Global Recovery Playbook & Runbook v2.4\nAUTHOR: Jay Lang\nRPO_TARGET: < 15 seconds\nRTO_TARGET: < 60 seconds\nENCRYPTION: AES-256-GCM + Ed25519 Signatures\nGOOGLE_DRIVE_SYNC: Verified',
        contentHash: 'f412093849182309182309182039812093812093812093812093812093812093',
        fileName: 'Master_Recovery_Hub_Enterprise_Playbook_v2.4.pdf',
        fileSize: 14250000,
        mimeType: 'application/pdf',
        tags: ['Enterprise Playbook', 'Disaster Recovery', 'Master Recovery Hub', 'Architecture Runbook'],
        version: '2.4.0',
        ipDeclaration: {
          title: 'Master Recovery Hub Enterprise Playbook & Runbook',
          creatorName: 'Jay Lang',
          creatorWallet: '0x71C8e2...a49B',
          licenseType: 'Enterprise Proprietary Copyright',
          priorArtTimestamp: '2026-09-08T19:45:00.000Z',
          noveltyDeclaration: 'Original enterprise disaster recovery playbook with zero-knowledge cryptographic fingerprint ensuring verifiable audit trail against alteration or deletion.',
          isZeroKnowledgeHash: true
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'Permanent tamper-evident proof that protects author attribution and shields against unauthorized tampering.'
        },
        timestamp: '2026-09-08T19:45:00.000Z'
      }
    ],
    merkleRoot: '2c624232cdd221771294dfbb310aca000a0df6ec9b5feee62c0211e3e44ec3c2',
    previousHash: '006f890c9b13998b417e29aa0852d43105ff7ba0236a6cf49a0293da2774900a',
    nonce: 879,
    hash: '0011b938f90248a8019b88d4076a08625902187b5a8e7e1a0b3f810143891002',
    difficulty: 2,
    minedBy: 'MasterRecoveryHub_Validator_Node_02'
  },
  {
    index: 3,
    timestamp: '2026-09-10T11:15:30.000Z',
    blockType: 'MILESTONE_COMMIT',
    transactions: [
      {
        txId: 'tx-mrh-deliverable-772',
        category: 'EMPLOYMENT_MILESTONE',
        title: 'Master Recovery Hub - Multi-Region Secure Storage Mesh & LGPD/GDPR Privacy Compliance Audit',
        description: 'Verified deliverable milestone timestamping the multi-region storage encryption bridge across Google Cloud & Drive with European GDPR and Brazilian LGPD compliance seals.',
        author: 'Jay Lang (Personal Dev Lab - jaylang.dev@gmail.com)',
        authorWallet: '0x55B042...e843',
        contentRaw: 'DELIVERABLE: Master Recovery Hub Storage Mesh Gateway v3.1\nSECURITY_AUDIT: PASSED (Zero Data Leakage)\nPRIVACY_STANDARDS: GDPR Art. 32 & LGPD Art. 46 Compliant\nLEAD_DEV: Jay Lang',
        contentHash: '7362910293840192830192830192830192830192830192830192830192830192',
        fileName: 'mrh_storage_mesh_v3.1_release.tar.gz',
        fileSize: 9840210,
        mimeType: 'application/gzip',
        tags: ['Milestone Deliverable', 'Storage Mesh', 'LGPD Consent', 'GDPR Audit', 'Jay Lang Dev'],
        version: '3.1.0',
        ipDeclaration: {
          title: 'Master Recovery Hub Storage Mesh Gateway Deliverable',
          creatorName: 'Jay Lang',
          creatorWallet: '0x55B042...e843',
          licenseType: 'Commercial Milestone Delivery & Intellectual Property Retained',
          priorArtTimestamp: '2026-09-10T11:15:30.000Z',
          noveltyDeclaration: 'Certified completion of multi-region disaster recovery storage gateway with verifiable cryptographic proof of work.',
          isZeroKnowledgeHash: true
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'NON_EXCLUSIVE_OPERATING_ONLY',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Using Google services on behalf of an organization"',
          immutableProtectionNote: 'Confirms personal and enterprise deliverable completion with author attribution.'
        },
        timestamp: '2026-09-10T11:15:30.000Z'
      }
    ],
    merkleRoot: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    previousHash: '0011b938f90248a8019b88d4076a08625902187b5a8e7e1a0b3f810143891002',
    nonce: 2410,
    hash: '007a12bc98341029348120394810293481029348102934810293481029348102',
    difficulty: 2,
    minedBy: 'EnterpriseNode_MasterRecoveryHub_03'
  },
  {
    index: 4,
    timestamp: '2026-09-12T16:04:12.000Z',
    blockType: 'SUPPLY_CUSTODY',
    transactions: [
      {
        txId: 'tx-mrh-hsm-804',
        category: 'SUPPLY_CHAIN',
        title: 'Enterprise HSM Security Appliance Batch #MRH-804 - Datacenter Supply Chain Custody',
        description: 'End-to-end supply custody verification for Master Recovery Hub Hardware Security Module (HSM) appliances and secure enclave servers shipped to enterprise disaster recovery datacenters.',
        author: 'Master Recovery Hub Infrastructure Operations (Jay Lang)',
        authorWallet: '0x94B2d1...38e0',
        contentRaw: 'BATCH_ID: #MRH-HSM-804\nDEVICE_TYPE: FIPS 140-3 Level 4 Secure Enclave\nTEMPERATURE_MONITORING: 19.8°C (Nominal)\nRFID_SEAL_HASH: 78a9c283019283019283019283019283\nCUSTODIAN_CHAIN: TransSecure Logistics -> Master Recovery Hub Datacenter 1',
        contentHash: '9840192830192830192830192830192830192830192830192830192830192830',
        fileName: 'batch_MRH_804_hardware_enclave_manifest.json',
        fileSize: 156000,
        mimeType: 'application/json',
        tags: ['Supply Chain', 'Hardware Security Module', 'Master Recovery Hub', 'FIPS 140-3', 'Chain of Custody'],
        version: '1.4.0',
        ipDeclaration: {
          title: 'Master Recovery Hub Hardware Security Enclave Batch #804 Provenance',
          creatorName: 'Jay Lang (Master Recovery Hub Org)',
          creatorWallet: '0x94B2d1...38e0',
          licenseType: 'Enterprise Certified Hardware Batch Credential',
          priorArtTimestamp: '2026-09-12T16:04:12.000Z',
          noveltyDeclaration: 'Cryptographically sealed hardware bill of materials preventing unauthorized hardware tampering or supply chain injection attacks.',
          isZeroKnowledgeHash: true
        },
        supplyChain: {
          batchId: 'MRH-HSM-804',
          originLocation: 'Master Recovery Hub Secure Manufacturing Enclave, Oregon, USA',
          destinationLocation: 'Master Recovery Hub Primary Disaster Recovery Datacenter, Nevada, USA',
          currentCustodian: 'Master Recovery Hub Datacenter Operations',
          custodianRole: 'Datacenter Secure Facilities Lead',
          temperatureReading: '19.8°C (Safe Threshold: 15.0°C - 25.0°C)',
          rfidTag: 'RFID-MRH-2026-HSM-804',
          hardwareBOMHash: 'c4ca4238a0b923820dcc509a6f75849b45c9284109283019283019283019283',
          logisticsStatus: 'DELIVERED'
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'Ensures immutable chain of evidence for hardware authenticity and disaster recovery appliances.'
        },
        timestamp: '2026-09-12T16:04:12.000Z'
      }
    ],
    merkleRoot: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    previousHash: '007a12bc98341029348120394810293481029348102934810293481029348102',
    nonce: 3180,
    hash: '003d556819283019283019283019283019283019283019283019283019283019',
    difficulty: 2,
    minedBy: 'EnterpriseNode_MasterRecoveryHub_Vault_04'
  }
];
