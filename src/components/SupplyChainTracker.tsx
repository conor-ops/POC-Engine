import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Thermometer, 
  Droplets,
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Package, 
  Hash, 
  UserCheck, 
  PlusCircle,
  FileCheck,
  Building,
  Plane,
  Activity,
  Cpu,
  Radio,
  Wifi,
  Battery,
  Zap,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  FileText,
  FileCode2,
  Lock,
  Unlock,
  Check,
  X,
  ExternalLink,
  Sliders,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  Block, 
  TransactionPayload, 
  IoTSensorReading, 
  SmartContractState, 
  SmartContractVerificationStep, 
  StakeholderRole,
  ConnectedAccount
} from '../types';
import { 
  SAMPLE_SUPPLY_BATCHES, 
  SUPPLY_ROUTE_WAYPOINTS, 
  TrackedSupplyBatch,
  createInitialSmartContract, 
  generateIoTPacket 
} from '../services/supplyChainIoT';
import { sha256 } from '../crypto/blockchain';
import confetti from 'canvas-confetti';

interface SupplyChainTrackerProps {
  blocks: Block[];
  onSelectProof: (tx: TransactionPayload, block: Block) => void;
  onOpenCreateModal: () => void;
  onMintProof?: (tx: TransactionPayload) => Promise<void>;
  activeAccount?: ConnectedAccount;
}

export const SupplyChainTracker: React.FC<SupplyChainTrackerProps> = ({
  blocks,
  onSelectProof,
  onOpenCreateModal,
  onMintProof,
  activeAccount
}) => {
  // Active selected batch
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number>(0);
  const currentBatch = SAMPLE_SUPPLY_BATCHES[selectedBatchIndex];

  // Active stakeholder view role
  const [activeRole, setActiveRole] = useState<StakeholderRole>('QA_AUDITOR');

  // Active waypoint on the route (0 to 4)
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(3);

  // Live IoT sensor telemetry state
  const [iotReading, setIotReading] = useState<IoTSensorReading | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [anomalyMode, setAnomalyMode] = useState<'NONE' | 'TEMP_SPIKE' | 'TEMP_DROP' | 'HIGH_SHOCK' | 'TAMPER_SEAL'>('NONE');
  const [telemetryHistory, setTelemetryHistory] = useState<IoTSensorReading[]>([]);
  const [isMiningTx, setIsMiningTx] = useState<boolean>(false);
  const [lastCommittedTxHash, setLastCommittedTxHash] = useState<string | null>(null);

  // Smart Contract state for this batch
  const [smartContract, setSmartContract] = useState<SmartContractState>(() => 
    createInitialSmartContract(currentBatch)
  );

  // When batch changes, reset smart contract & telemetry
  useEffect(() => {
    const newContract = createInitialSmartContract(currentBatch);
    setSmartContract(newContract);
    setCurrentWaypointIndex(3);
    setAnomalyMode('NONE');
    setLastCommittedTxHash(null);

    // Initial IoT reading
    generateIoTPacket(currentBatch, 3, 'NONE').then(reading => {
      setIotReading(reading);
      setTelemetryHistory([reading]);
    });
  }, [selectedBatchIndex]);

  // Periodic IoT streaming interval
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      // Simulate minor progress or jitter along route
      setCurrentWaypointIndex(prev => {
        // Occasionally advance waypoint if not at destination
        if (Math.random() > 0.7 && prev < SUPPLY_ROUTE_WAYPOINTS.length - 1) {
          return prev + 1;
        }
        return prev;
      });

      const nextReading = await generateIoTPacket(currentBatch, currentWaypointIndex, anomalyMode);
      setIotReading(nextReading);
      setTelemetryHistory(prev => [nextReading, ...prev.slice(0, 14)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming, currentBatch, currentWaypointIndex, anomalyMode]);

  // Initial load of IoT reading if null
  useEffect(() => {
    if (!iotReading) {
      generateIoTPacket(currentBatch, currentWaypointIndex, anomalyMode).then(r => {
        setIotReading(r);
        setTelemetryHistory([r]);
      });
    }
  }, []);

  // Trigger manual IoT transmission ping
  const handleTriggerTelemetryPing = async (anomaly: 'NONE' | 'TEMP_SPIKE' | 'TEMP_DROP' | 'HIGH_SHOCK' | 'TAMPER_SEAL' = 'NONE') => {
    setAnomalyMode(anomaly);
    const reading = await generateIoTPacket(currentBatch, currentWaypointIndex, anomaly);
    setIotReading(reading);
    setTelemetryHistory(prev => [reading, ...prev.slice(0, 14)]);

    // Check if smart contract is affected by anomaly
    if (anomaly !== 'NONE') {
      // If QA check step was verified, mark as breach or trigger penalty
      setSmartContract(prev => {
        const updatedSteps = prev.steps.map(step => {
          if (step.stage === 'QUALITY_CHECK_SIGNOFF' && (anomaly === 'TEMP_SPIKE' || anomaly === 'TEMP_DROP')) {
            return {
              ...step,
              status: 'BREACH_PENALTY' as const,
              failureReason: `Smart Contract SLA Exception Triggered: ${reading.excursionDetails}`
            };
          }
          return step;
        });
        return {
          ...prev,
          status: 'BREACHED',
          penaltyTriggered: true,
          penaltyDescription: `Smart contract automated penalty triggered: SLA condition violated at ${reading.gps.locationName}. Escrow freeze activated.`
        };
      });
    }
  };

  // Record live IoT reading & Smart Contract status to blockchain
  const handleCommitTelemetryToBlockchain = async () => {
    if (!iotReading) return;
    setIsMiningTx(true);

    try {
      const timestamp = new Date().toISOString();
      const rawContent = JSON.stringify({
        batchId: currentBatch.batchId,
        productName: currentBatch.productName,
        iotReading,
        smartContractSummary: {
          address: smartContract.contractAddress,
          status: smartContract.status,
          verifiedStepsCount: smartContract.steps.filter(s => s.status === 'VERIFIED').length,
          totalSteps: smartContract.steps.length
        }
      }, null, 2);

      const contentHash = await sha256(rawContent);
      const txId = `tx-iot-${currentBatch.batchId.toLowerCase()}-${Date.now().toString(36)}`;

      const newTx: TransactionPayload = {
        txId,
        category: 'SUPPLY_CHAIN',
        title: `IoT Sensor Telemetry & Custody Ping - Batch #${currentBatch.batchId}`,
        description: `Cryptographically signed IoT sensor packet (Temp: ${iotReading.temperatureCelsius}°C, Humidity: ${iotReading.humidityPercent}%, Shock: ${iotReading.shockGForce}G) at ${iotReading.gps.locationName}. Smart contract status: ${smartContract.status}.`,
        author: activeAccount ? `${activeAccount.name} (${activeAccount.role})` : 'Fleet Logistics Gateway & IoT Mesh',
        authorWallet: activeAccount ? activeAccount.walletAddress : '0x45a901...99e1',
        contentRaw: rawContent,
        contentHash,
        tags: ['IoT Sensor', 'Supply Chain', 'Cold Chain', currentBatch.batchId, smartContract.contractName],
        version: '2.4.0',
        ipDeclaration: {
          title: `IoT Telemetry Proof for Batch #${currentBatch.batchId}`,
          creatorName: activeAccount ? activeAccount.name : 'Master Recovery Hub Logistics',
          creatorWallet: activeAccount ? activeAccount.walletAddress : '0x45a901...99e1',
          licenseType: 'Immutable Chain of Custody & Telemetry Record',
          priorArtTimestamp: timestamp,
          noveltyDeclaration: 'Tamper-evident real-time telemetry log sealed with cryptographic device signature on blockchain ledger.',
          isZeroKnowledgeHash: true
        },
        supplyChain: {
          batchId: currentBatch.batchId,
          originLocation: currentBatch.originFacility,
          destinationLocation: currentBatch.destinationFacility,
          currentCustodian: iotReading.gps.locationName,
          custodianRole: activeRole,
          temperatureReading: `${iotReading.temperatureCelsius}°C (SLA: ${currentBatch.slaRules.minTemp}°C to ${currentBatch.slaRules.maxTemp}°C)`,
          humidityReading: `${iotReading.humidityPercent}% RH`,
          gpsCoordinates: `${iotReading.gps.lat.toFixed(4)}, ${iotReading.gps.lng.toFixed(4)}`,
          rfidTag: currentBatch.rfidTag,
          hardwareBOMHash: currentBatch.bomHash,
          logisticsStatus: smartContract.status === 'BREACHED' ? 'SLA_BREACH' : 'IN_TRANSIT',
          iotReading,
          smartContractAddress: smartContract.contractAddress,
          contractStage: smartContract.steps[smartContract.currentStageIndex]?.stage || 'IN_TRANSIT_MONITORING',
          smartContractStatus: smartContract.status === 'BREACHED' ? 'BREACH_PENALTY' : 'VERIFIED'
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'Supply chain custody and IoT telemetry permanently timestamped.'
        },
        timestamp
      };

      if (onMintProof) {
        await onMintProof(newTx);
      }

      setLastCommittedTxHash(contentHash);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Failed to commit IoT telemetry block:', e);
    } finally {
      setIsMiningTx(false);
    }
  };

  // Execute an automated verification step in the smart contract
  const handleExecuteContractStep = async (stepId: string) => {
    setIsMiningTx(true);

    try {
      const stepIndex = smartContract.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return;

      const targetStep = smartContract.steps[stepIndex];
      const timestamp = new Date().toISOString();
      const mockTxHash = `0x${await sha256(stepId + timestamp + Math.random())}`;
      const verifierSig = `SIG-VERIFIED-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      // Mark all criteria as passed
      const updatedCriteria = targetStep.criteriaEvaluated.map(c => ({
        ...c,
        actualValue: c.requiredValue,
        passed: true
      }));

      const updatedStep: SmartContractVerificationStep = {
        ...targetStep,
        status: 'VERIFIED',
        verifiedAt: timestamp,
        verifiedBy: activeAccount ? `${activeAccount.name} (${activeRole})` : `${activeRole} Verified Oracle`,
        verifierWallet: activeAccount ? activeAccount.walletAddress : '0x94B2d1...38e0',
        verifierSignature: verifierSig,
        txHash: mockTxHash,
        gasUsedGwei: Math.floor(35000 + Math.random() * 25000),
        criteriaEvaluated: updatedCriteria
      };

      const updatedSteps = [...smartContract.steps];
      updatedSteps[stepIndex] = updatedStep;

      const allPassed = updatedSteps.every(s => s.status === 'VERIFIED');

      setSmartContract(prev => ({
        ...prev,
        steps: updatedSteps,
        status: allPassed ? 'SETTLED' : 'ACTIVE',
        currentStageIndex: Math.min(stepIndex + 1, updatedSteps.length - 1)
      }));

      // Commit smart contract milestone to blockchain
      const rawContent = JSON.stringify({
        event: 'SMART_CONTRACT_STEP_VERIFIED',
        contractAddress: smartContract.contractAddress,
        step: updatedStep,
        batch: currentBatch
      }, null, 2);

      const contentHash = await sha256(rawContent);

      const contractTx: TransactionPayload = {
        txId: `tx-contract-${targetStep.stage.toLowerCase()}-${Date.now().toString(36)}`,
        category: 'SUPPLY_CHAIN',
        title: `Smart Contract Verification: ${targetStep.title} - Batch #${currentBatch.batchId}`,
        description: `Automated smart contract stage [${targetStep.stage}] executed successfully by ${activeRole}. Rule enforced: ${targetStep.automatedRule}`,
        author: activeAccount ? `${activeAccount.name} (${activeRole})` : `${activeRole} Node`,
        authorWallet: activeAccount ? activeAccount.walletAddress : '0x94B2d1...38e0',
        contentRaw: rawContent,
        contentHash,
        tags: ['Smart Contract', 'Automated Verification', targetStep.stage, currentBatch.batchId],
        version: '2.4.0',
        ipDeclaration: {
          title: `Smart Contract Execution Receipt: ${targetStep.title}`,
          creatorName: activeAccount ? activeAccount.name : 'Master Recovery Hub Oracle',
          creatorWallet: activeAccount ? activeAccount.walletAddress : '0x94B2d1...38e0',
          licenseType: 'Smart Contract Event Receipt',
          priorArtTimestamp: timestamp,
          noveltyDeclaration: 'Autonomous smart contract execution state sealed on-chain.',
          isZeroKnowledgeHash: true
        },
        supplyChain: {
          batchId: currentBatch.batchId,
          originLocation: currentBatch.originFacility,
          destinationLocation: currentBatch.destinationFacility,
          currentCustodian: SUPPLY_ROUTE_WAYPOINTS[currentWaypointIndex].name,
          custodianRole: activeRole,
          temperatureReading: iotReading ? `${iotReading.temperatureCelsius}°C` : 'Nominal',
          rfidTag: currentBatch.rfidTag,
          hardwareBOMHash: currentBatch.bomHash,
          logisticsStatus: allPassed ? 'DELIVERED' : 'CUSTOMS_CLEARED',
          smartContractAddress: smartContract.contractAddress,
          contractStage: targetStep.stage,
          smartContractStatus: 'VERIFIED'
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026)',
          immutableProtectionNote: 'Smart contract verified event recorded on immutable ledger.'
        },
        timestamp
      };

      if (onMintProof) {
        await onMintProof(contractTx);
      }

      setLastCommittedTxHash(contentHash);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Failed to execute smart contract step:', e);
    } finally {
      setIsMiningTx(false);
    }
  };

  // Extract all supply chain transactions from the blockchain
  const supplyChainTxs: { tx: TransactionPayload; block: Block }[] = [];
  blocks.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.category === 'SUPPLY_CHAIN' || tx.supplyChain) {
        supplyChainTxs.push({ tx, block });
      }
    });
  });

  // Calculate temperature bounds percentage for gauge visual
  const tempMin = currentBatch.slaRules.minTemp;
  const tempMax = currentBatch.slaRules.maxTemp;
  const currentTemp = iotReading ? iotReading.temperatureCelsius : (tempMin + tempMax) / 2;
  const isTempSafe = currentTemp >= tempMin && currentTemp <= tempMax;
  const isHumiditySafe = iotReading ? iotReading.humidityPercent <= currentBatch.slaRules.maxHumidity : true;
  const isShockSafe = iotReading ? iotReading.shockGForce <= currentBatch.slaRules.maxShock : true;

  return (
    <div id="supply-chain-tracker" className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                <span>Active 5G NB-IoT Sensor Mesh</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Autonomous Smart Contract Engine</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                <span>{smartContract.contractAddress}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              IoT Sensor Telemetry & Smart Contract Supply Chain Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time multi-hop custody tracking, cryptographic GPS & environmental sensor streaming, automated smart contract origin & customs clearance verification, and zero-knowledge blockchain anchoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-stream-toggle"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isStreaming 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="h-4 w-4 text-amber-400" />
                  <span>Pause IoT Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-emerald-400" />
                  <span>Stream Live Telemetry</span>
                </>
              )}
            </button>

            <button
              id="btn-manual-telemetry-ping"
              onClick={() => handleTriggerTelemetryPing('NONE')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              title="Generate a real-time sensor reading ping"
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>IoT Ping</span>
            </button>

            <button
              id="btn-commit-iot-block"
              onClick={handleCommitTelemetryToBlockchain}
              disabled={isMiningTx}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isMiningTx ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Mining Block...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Seal Telemetry Block</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Batch Selector & Stakeholder Role Switcher Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Batch Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tracked Batch:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {SAMPLE_SUPPLY_BATCHES.map((batch, idx) => (
                <button
                  key={batch.batchId}
                  onClick={() => setSelectedBatchIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    selectedBatchIndex === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  #{batch.batchId}
                </button>
              ))}
            </div>
          </div>

          {/* Stakeholder Role Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Stakeholder Role:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              {(['MANUFACTURER', 'CARRIER', 'QA_AUDITOR', 'CUSTOMS', 'RECEIVER'] as StakeholderRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    activeRole === role
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role === 'MANUFACTURER' && '🏭 Supplier'}
                  {role === 'CARRIER' && '🚛 Carrier'}
                  {role === 'QA_AUDITOR' && '🔬 QA Lead'}
                  {role === 'CUSTOMS' && '🛃 Customs'}
                  {role === 'RECEIVER' && '🏥 Receiver'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly / Excursion Simulation Trigger Deck */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sliders className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-slate-300">IoT Simulation & Smart Contract Stress Lab:</span>
            <span className="text-slate-500 hidden sm:inline">Test automated SLA enforcement and emergency breach penalties</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTriggerTelemetryPing('TEMP_SPIKE')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium transition-colors"
              title="Simulate severe cold-chain temperature spike"
            >
              🔥 Temp Spike (+12°C)
            </button>
            <button
              onClick={() => handleTriggerTelemetryPing('HIGH_SHOCK')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors"
              title="Simulate high 3-axis shock impact"
            >
              ⚠️ Shock (3.8G)
            </button>
            <button
              onClick={() => handleTriggerTelemetryPing('TAMPER_SEAL')}
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium transition-colors"
              title="Simulate broken optical circuit tamper seal"
            >
              ⚡ Break Seal
            </button>
            <button
              onClick={() => handleTriggerTelemetryPing('NONE')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition-colors"
              title="Reset to nominal safe SLA parameters"
            >
              ✅ Reset Safe
            </button>
          </div>
        </div>
      </div>

      {/* Excursion / Breach Alert Banner if active */}
      {iotReading?.isExcursionAlert && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CRITICAL IOT EXCURSION & SMART CONTRACT SLA ALERT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 font-mono">
                PENALTY CLAUSE ACTIVE
              </span>
            </h4>
            <p className="text-xs text-rose-300 leading-relaxed">
              {iotReading.excursionDetails}
            </p>
          </div>
        </div>
      )}

      {/* Key Dashboard Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Product Origin */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" />
              <span>01. PRODUCT ORIGIN</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
              GENESIS SEALED
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white line-clamp-1">{currentBatch.productName}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{currentBatch.originFacility}</p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Batch ID:</span>
              <span className="text-slate-200 font-semibold">{currentBatch.batchId}</span>
            </div>
            <div className="flex justify-between">
              <span>BOM Digest:</span>
              <span className="text-emerald-300 truncate max-w-[120px]">{currentBatch.bomHash.slice(0, 14)}...</span>
            </div>
          </div>
        </div>

        {/* Card 2: Transit Status & GPS */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              <span>02. TRANSIT STATUS</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono">
              HOP {currentWaypointIndex + 1}/{SUPPLY_ROUTE_WAYPOINTS.length}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white line-clamp-1">
              {SUPPLY_ROUTE_WAYPOINTS[currentWaypointIndex].name}
            </h3>
            <p className="text-xs text-cyan-300 font-mono">
              {iotReading ? `${iotReading.gps.lat.toFixed(4)}° N, ${iotReading.gps.lng.toFixed(4)}° W` : 'Acquiring GPS...'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Velocity:</span>
              <span className="text-slate-200">{iotReading?.gps.speedKmh || 0} km/h • {iotReading?.gps.bearing || '135° SE'}</span>
            </div>
            <div className="flex justify-between">
              <span>Beacon Link:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>5G NB-IoT ({iotReading?.signalStrengthDbm || -68} dBm)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Live IoT Environmental Telemetry */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" />
              <span>03. IOT TELEMETRY</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              isTempSafe && isHumiditySafe && isShockSafe 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
            }`}>
              {isTempSafe && isHumiditySafe && isShockSafe ? 'SLA NOMINAL' : 'EXCURSION'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="space-y-0.5">
              <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
                <span className={isTempSafe ? 'text-white' : 'text-rose-400'}>
                  {iotReading ? `${iotReading.temperatureCelsius}°C` : '19.8°C'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Safe: {tempMin}°C to {tempMax}°C
              </p>
            </div>

            <div className="text-right font-mono text-xs space-y-0.5">
              <div className="flex items-center gap-1 text-slate-300 justify-end">
                <Droplets className="h-3 w-3 text-cyan-400" />
                <span>{iotReading?.humidityPercent || 44.2}% RH</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 justify-end text-[11px]">
                <Activity className="h-3 w-3 text-purple-400" />
                <span>{iotReading?.shockGForce || 0.42}G shock</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Battery className="h-3.5 w-3.5 text-emerald-400" />
              <span>{iotReading?.batteryLevelPercent || 94}% Bat</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span className={iotReading?.tamperSealState === 'INTACT' ? 'text-emerald-400' : 'text-rose-400'}>
                Seal: {iotReading?.tamperSealState || 'INTACT'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Smart Contract State */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileCode2 className="h-3.5 w-3.5" />
              <span>04. SMART CONTRACT</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              smartContract.status === 'SETTLED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : smartContract.status === 'BREACHED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}>
              {smartContract.status}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {smartContract.contractName}
            </h3>
            <p className="text-xs text-slate-400">
              {smartContract.steps.filter(s => s.status === 'VERIFIED').length} of {smartContract.steps.length} Gates Verified
            </p>
          </div>

          {/* Progress bar */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  smartContract.status === 'BREACHED' ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                }`}
                style={{
                  width: `${(smartContract.steps.filter(s => s.status === 'VERIFIED').length / smartContract.steps.length) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Next: {smartContract.steps.find(s => s.status === 'PENDING')?.title.slice(0, 18) || 'Settled'}...</span>
              <span className="text-emerald-400 font-bold">
                {Math.round((smartContract.steps.filter(s => s.status === 'VERIFIED').length / smartContract.steps.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Supply Chain Route Map & Waypoints Stepper */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Interstate Transit Corridor & Custody Waypoints</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 5-node cryptographic corridor tracking physical shipment progress with live GPS anchors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Active Waypoint: #{currentWaypointIndex + 1} ({SUPPLY_ROUTE_WAYPOINTS[currentWaypointIndex].type})
            </span>
          </div>
        </div>

        {/* Visual Waypoint Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {SUPPLY_ROUTE_WAYPOINTS.map((wp, idx) => {
            const isCompleted = idx < currentWaypointIndex;
            const isCurrent = idx === currentWaypointIndex;
            const isPending = idx > currentWaypointIndex;

            return (
              <div
                key={wp.id}
                onClick={() => setCurrentWaypointIndex(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : isCompleted
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Node marker & state */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    0{idx + 1}. {wp.type}
                  </span>

                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {isCurrent && <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />}
                  {isPending && <Clock className="h-4 w-4 text-slate-600" />}
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                  {wp.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {wp.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Target:</span>
                  <span className="text-slate-300">{wp.targetArrival.slice(11, 16)} UTC</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Smart Contract Engine (Left) & Real-Time IoT Hardware Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Smart Contracts Automated Verification Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-md">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Smart Contract Verification Gates ({smartContract.steps.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Automated validation rules executed on-chain with stakeholder cryptographic signatures.
                </p>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-slate-400">Contract: </span>
                <span className="text-cyan-300 font-semibold">{smartContract.contractAddress}</span>
              </div>
            </div>

            {/* Smart Contract Steps Accordion / List */}
            <div className="space-y-4">
              {smartContract.steps.map((step, idx) => {
                const isVerified = step.status === 'VERIFIED';
                const isBreached = step.status === 'BREACH_PENALTY';
                const isPending = step.status === 'PENDING';
                const canExecute = isPending && (activeRole === step.requiredStakeholder || activeRole === 'QA_AUDITOR');

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isVerified
                        ? 'bg-slate-950 border-emerald-500/30'
                        : isBreached
                        ? 'bg-rose-950/40 border-rose-500/40 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    {/* Step Top Line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isBreached
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span>{step.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                              Role: {step.requiredStakeholder}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : isBreached
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {isVerified && <Check className="h-3 w-3 text-emerald-400" />}
                          {isBreached && <AlertTriangle className="h-3 w-3 text-rose-400" />}
                          {isPending && <Clock className="h-3 w-3 text-amber-400" />}
                          <span>{step.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Automated Rule Code */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300 select-all">{step.automatedRule}</span>
                      </div>
                      {step.gasUsedGwei && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          Gas: {step.gasUsedGwei.toLocaleString()} Gwei
                        </span>
                      )}
                    </div>

                    {/* Criteria Evaluated Table */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block">
                        Verification Logic Criteria Checklist:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        {step.criteriaEvaluated.map((criterion, cIdx) => (
                          <div 
                            key={cIdx} 
                            className={`p-2 rounded-md border flex items-start justify-between gap-1.5 ${
                              criterion.passed 
                                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="space-y-0.5 overflow-hidden">
                              <span className="text-[10px] text-slate-400 block truncate">{criterion.name}</span>
                              <span className="font-mono text-[10px] font-bold block truncate text-white">
                                {criterion.actualValue}
                              </span>
                            </div>
                            {criterion.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verifier Receipt or Action Execution Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
                      {isVerified ? (
                        <div className="text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Verified by: <strong className="text-slate-200 font-semibold">{step.verifiedBy}</strong></span>
                          <span>Sig: <strong className="text-emerald-300">{step.verifierSignature?.slice(0, 16)}...</strong></span>
                          {step.verifiedAt && <span>At: {step.verifiedAt.slice(11, 19)} UTC</span>}
                        </div>
                      ) : isBreached ? (
                        <div className="text-rose-400 font-semibold">
                          {step.failureReason || 'Contract SLA Exception Triggered!'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-slate-400">
                            Required Signer: <strong className="text-amber-400 font-semibold">{step.requiredStakeholder}</strong>
                          </span>
                          <button
                            onClick={() => handleExecuteContractStep(step.id)}
                            disabled={isMiningTx}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Zap className="h-3.5 w-3.5 text-slate-950" />
                            <span>Sign & Execute Gate</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column (5 cols): Live Real-Time IoT Hardware Beacon Monitor */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Hardware Beacon Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live IoT Hardware Beacon</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                {currentBatch.iotDeviceId}
              </span>
            </div>

            {/* Gauge Display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Temp Gauge Box */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isTempSafe ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/30 border-rose-500/40 animate-pulse'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-purple-400" />
                    <span>Temperature</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isTempSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isTempSafe ? 'SAFE' : 'VIOLATION'}
                  </span>
                </div>
                <div className="text-xl font-extrabold font-mono text-white">
                  {iotReading ? `${iotReading.temperatureCelsius}°C` : '19.8°C'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Bounds: {tempMin}°C ~ {tempMax}°C
                </div>
              </div>

              {/* Humidity Gauge Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Relative Humidity</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {isHumiditySafe ? 'SAFE' : 'HIGH'}
                  </span>
                </div>
                <div className="text-xl font-extrabold font-mono text-white">
                  {iotReading ? `${iotReading.humidityPercent}%` : '44.2%'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Limit: &lt; {currentBatch.slaRules.maxHumidity}% RH
                </div>
              </div>

              {/* Shock / Vibration Gauge Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-amber-400" />
                    <span>3-Axis Shock</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isShockSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isShockSafe ? 'STABLE' : 'IMPACT'}
                  </span>
                </div>
                <div className="text-xl font-extrabold font-mono text-white">
                  {iotReading ? `${iotReading.shockGForce} G` : '0.42 G'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Threshold: &lt; {currentBatch.slaRules.maxShock} G
                </div>
              </div>

              {/* Tamper Seal Circuit Box */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                iotReading?.tamperSealState === 'INTACT' 
                  ? 'bg-slate-950 border-slate-800' 
                  : 'bg-rose-950/30 border-rose-500/40 animate-pulse'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Optical Seal</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    iotReading?.tamperSealState === 'INTACT' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {iotReading?.tamperSealState || 'INTACT'}
                  </span>
                </div>
                <div className="text-base font-extrabold font-mono text-white">
                  {iotReading?.tamperSealState === 'INTACT' ? 'SEAL VERIFIED' : 'BREACHED!'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  RFID: {currentBatch.rfidTag}
                </div>
              </div>
            </div>

            {/* Cryptographic Transmission Seal Inspector */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>ECDSA Device Signature:</span>
                </span>
                <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
              </div>
              <p className="text-[10px] text-emerald-300 break-all select-all leading-tight bg-slate-900 p-2 rounded border border-slate-800">
                {iotReading?.deviceSignature || 'SIG-ECDSA-PENDING-TELEMETRY'}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Protocol: 5G NB-IoT (3GPP Rel-14)</span>
                <span>Payload: AES-128-GCM</span>
              </div>
            </div>

            {/* Live Telemetry History Stream */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Telemetry Audit Feed ({telemetryHistory.length})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live FIFO Buffer</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {telemetryHistory.map((packet, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                  >
                    <div className="space-y-0.5">
                      <div className="text-slate-200 font-medium flex items-center gap-1.5">
                        <span className={packet.isExcursionAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {packet.temperatureCelsius}°C
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300">{packet.humidityPercent}% RH</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{packet.shockGForce}G</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {packet.gps.locationName}
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-500">
                      <span>{packet.timestamp.slice(11, 19)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Verified On-Chain Supply Ledger Feed */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <span>Immutable Supply Chain Ledger Entries ({supplyChainTxs.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Permanently mined blocks storing hardware custody handoffs, IoT telemetry packets, and smart contract verification receipts.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Record Manual Custody Hop</span>
          </button>
        </div>

        {supplyChainTxs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Truck className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">No supply chain blocks recorded yet.</p>
            <button
              onClick={handleCommitTelemetryToBlockchain}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Seal First IoT Telemetry Block
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {supplyChainTxs.map(({ tx, block }) => (
              <div
                key={tx.txId}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md hover:border-slate-750 transition-colors"
              >
                {/* Top header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                        Batch #{tx.supplyChain?.batchId || currentBatch.batchId}
                      </span>
                      <h3 className="text-sm font-bold text-white">{tx.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Author / Originator: <span className="text-slate-200 font-medium">{tx.author}</span> • Block #{block.index} • Mined by: <span className="text-slate-300 font-mono">{block.minedBy}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono">
                      {tx.supplyChain?.logisticsStatus || 'IN_TRANSIT'}
                    </span>
                    <button
                      onClick={() => onSelectProof(tx, block)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Description & Payload Details */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tx.description}
                </p>

                {/* Telemetry Snapshot Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Origin Facility:</span>
                    <span className="text-slate-200 block font-semibold truncate">
                      {tx.supplyChain?.originLocation || currentBatch.originFacility}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Current Custodian:</span>
                    <span className="text-cyan-300 block font-semibold truncate">
                      {tx.supplyChain?.currentCustodian || 'AeroLogistics Fleet'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Environmental Telemetry:</span>
                    <span className="text-purple-300 block font-semibold truncate">
                      {tx.supplyChain?.temperatureReading || '19.8°C'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Hardware BOM Hash:</span>
                    <span className="text-emerald-400 block font-semibold truncate">
                      {tx.supplyChain?.hardwareBOMHash?.slice(0, 14) || 'c4ca4238a0...'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Digest */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px]">Block Transaction Hash Digest:</span>
                  <span className="text-emerald-300 break-all select-all font-medium text-[11px]">
                    {tx.contentHash}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
