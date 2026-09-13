import { IoTSensorReading, SmartContractState, SmartContractVerificationStep, StakeholderRole, TransactionPayload } from '../types';
import { sha256 } from '../crypto/blockchain';

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'ORIGIN' | 'TRANSIT_HUB' | 'CUSTOMS_CHECKPOINT' | 'DESTINATION';
  description: string;
  targetArrival: string;
}

export const SUPPLY_ROUTE_WAYPOINTS: RouteWaypoint[] = [
  {
    id: 'wp-01',
    name: 'Master Recovery Hub Secure Manufacturing Enclave (Hillsboro, OR)',
    lat: 45.5229,
    lng: -122.9898,
    type: 'ORIGIN',
    description: 'Hardware synthesis, cleanroom calibration, and cryptographic tamper-seal application.',
    targetArrival: '2026-09-12T08:00:00Z'
  },
  {
    id: 'wp-02',
    name: 'Pacific Northwest Intermodal Freight Terminal (Portland, OR)',
    lat: 45.5898,
    lng: -122.6884,
    type: 'TRANSIT_HUB',
    description: 'Custody handoff to TransSecure AeroLogistics; shock & vibration dampening container seal verified.',
    targetArrival: '2026-09-12T14:30:00Z'
  },
  {
    id: 'wp-03',
    name: 'Interstate Cold-Chain Relay Facility (Boise, ID)',
    lat: 43.6150,
    lng: -116.2023,
    type: 'TRANSIT_HUB',
    description: 'Active temperature sensor telemetry upload via 5G NB-IoT; battery backup auxiliary test.',
    targetArrival: '2026-09-13T01:15:00Z'
  },
  {
    id: 'wp-04',
    name: 'Federal Trade & Regulatory Customs Port (Reno-Tahoe Border, NV)',
    lat: 39.5296,
    lng: -119.8138,
    type: 'CUSTOMS_CHECKPOINT',
    description: 'FIPS 140-3 Level 4 export validation, electronic Bill of Lading clearance, cryptographic inspector signature.',
    targetArrival: '2026-09-13T08:45:00Z'
  },
  {
    id: 'wp-05',
    name: 'Master Recovery Hub Primary Disaster Recovery Datacenter (Las Vegas, NV)',
    lat: 36.1699,
    lng: -115.1398,
    type: 'DESTINATION',
    description: 'Cleanroom facility receipt, zero-touch rack provisioning, smart contract automated delivery release.',
    targetArrival: '2026-09-13T16:00:00Z'
  }
];

export interface TrackedSupplyBatch {
  batchId: string;
  productName: string;
  serialNumber: string;
  category: string;
  originFacility: string;
  destinationFacility: string;
  manufacturingDate: string;
  bomHash: string;
  slaRules: {
    minTemp: number;
    maxTemp: number;
    maxHumidity: number;
    maxShock: number;
  };
  iotDeviceId: string;
  rfidTag: string;
}

export const SAMPLE_SUPPLY_BATCHES: TrackedSupplyBatch[] = [
  {
    batchId: 'MRH-HSM-804',
    productName: 'FIPS 140-3 Level 4 Hardware Security Module (HSM) Enclave Cluster',
    serialNumber: 'MRH-ENC-2026-9941',
    category: 'Hardware Security / DR Enclave',
    originFacility: 'Master Recovery Hub Enclave, Hillsboro OR',
    destinationFacility: 'Master Recovery Hub DR Datacenter, Las Vegas NV',
    manufacturingDate: '2026-09-12 07:30 UTC',
    bomHash: 'c4ca4238a0b923820dcc509a6f75849b45c9284109283019283019283019283',
    slaRules: {
      minTemp: 15.0,
      maxTemp: 25.0,
      maxHumidity: 60.0,
      maxShock: 1.8
    },
    iotDeviceId: 'IOT-NORDIC-BLE-9482',
    rfidTag: 'RFID-MRH-2026-HSM-804'
  },
  {
    batchId: 'QKD-OPTIC-302',
    productName: 'Quantum Key Distribution (QKD) Entangled Photon Optic Transceiver',
    serialNumber: 'QKD-PHOTON-4820',
    category: 'Quantum Cryptography Hardware',
    originFacility: 'Advanced Quantum Fab, Kyoto JP',
    destinationFacility: 'Global Vault Interconnect, Zurich CH',
    manufacturingDate: '2026-09-10 11:00 UTC',
    bomHash: '8f92140a83b271d9810239102938102938102938102938102938102938102938',
    slaRules: {
      minTemp: 2.0,
      maxTemp: 8.0,
      maxHumidity: 45.0,
      maxShock: 1.2
    },
    iotDeviceId: 'IOT-SEMITRON-QKD-1104',
    rfidTag: 'RFID-QKD-CRYPTO-302'
  },
  {
    batchId: 'BIO-VAX-771',
    productName: 'Lyophilized mRNA Disaster Response Antigen Serum (Deep Freeze)',
    serialNumber: 'BIO-SERUM-7718',
    category: 'Pharmaceutical Cold-Chain',
    originFacility: 'BioSynthetics Enclave, Basel CH',
    destinationFacility: 'Emergency Strategic Reserve, Washington DC',
    manufacturingDate: '2026-09-11 04:15 UTC',
    bomHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    slaRules: {
      minTemp: -25.0,
      maxTemp: -15.0,
      maxHumidity: 50.0,
      maxShock: 2.0
    },
    iotDeviceId: 'IOT-CRYOSENSE-8839',
    rfidTag: 'RFID-BIO-CRYOSENSE-771'
  }
];

export function createInitialSmartContract(batch: TrackedSupplyBatch): SmartContractState {
  const contractAddress = `0x71a${batch.batchId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}...${Math.random().toString(16).slice(2, 6)}`;
  
  const steps: SmartContractVerificationStep[] = [
    {
      id: 'step-origin',
      stage: 'ORIGIN_CONFIRMATION',
      title: 'Product Origin & Genesis BOM Authentication',
      description: 'Verifies manufacturer cryptographic credentials, hardware Bill of Materials (BOM) hash, and active electronic tamper seal.',
      requiredStakeholder: 'MANUFACTURER',
      status: 'VERIFIED',
      verifiedAt: '2026-09-12T08:15:00Z',
      verifiedBy: 'Jay Lang (Master Recovery Hub Enclave Lead)',
      verifierWallet: '0x94B2d1...38e0',
      verifierSignature: 'SIG-ECDSA-ORIGIN-984019284019',
      contractAddress,
      gasUsedGwei: 42150,
      txHash: '0x3a4b910293840192830192830192830192830192830192830192830192830192',
      automatedRule: 'REQUIRE(msg.sender == MANUFACTURER_REGISTRY && sha256(BOM) == STORED_BOM_HASH && TAMPER_SEAL == INTACT)',
      criteriaEvaluated: [
        { name: 'Manufacturer Identity Registry', requiredValue: 'VALIDATED_ENTERPRISE_ORG', actualValue: 'VALIDATED_ENTERPRISE_ORG', passed: true },
        { name: 'Hardware BOM Hash Match', requiredValue: batch.bomHash.slice(0, 16) + '...', actualValue: batch.bomHash.slice(0, 16) + '...', passed: true },
        { name: 'Cryptographic Tamper Seal State', requiredValue: 'SEAL_INTACT_GENESIS', actualValue: 'SEAL_INTACT_GENESIS', passed: true }
      ]
    },
    {
      id: 'step-transit',
      stage: 'IN_TRANSIT_MONITORING',
      title: 'Continuous IoT Sensor Telemetry & Custody Stream',
      description: 'Stream live GPS location, ambient temperature, humidity, and 3-axis shock measurements to the blockchain ledger.',
      requiredStakeholder: 'CARRIER',
      status: 'VERIFIED',
      verifiedAt: '2026-09-13T02:00:00Z',
      verifiedBy: 'TransSecure AeroLogistics Fleet IoT Gateway',
      verifierWallet: '0x45a901...99e1',
      verifierSignature: 'SIG-IOT-TELEMETRY-774910283019',
      contractAddress,
      gasUsedGwei: 28400,
      txHash: '0x5c8e102938401928301928301928301928301928301928301928301928301928',
      automatedRule: 'REQUIRE(telemetry.temp >= MIN_TEMP && telemetry.temp <= MAX_TEMP && telemetry.shock < MAX_SHOCK)',
      criteriaEvaluated: [
        { name: '5G NB-IoT Sensor Handshake', requiredValue: 'AUTHENTICATED_SECURE_KEY', actualValue: 'AUTHENTICATED_SECURE_KEY', passed: true },
        { name: 'GPS Waypoint Check', requiredValue: 'PACIFIC_NW_TO_NEVADA_CORRIDOR', actualValue: 'PACIFIC_NW_TO_NEVADA_CORRIDOR', passed: true },
        { name: 'Cryptographic Packet Digest', requiredValue: 'VERIFIED_ECDSA_SENSOR_SIGNATURE', actualValue: 'VERIFIED_ECDSA_SENSOR_SIGNATURE', passed: true }
      ]
    },
    {
      id: 'step-quality',
      stage: 'QUALITY_CHECK_SIGNOFF',
      title: 'Automated Cold-Chain & Environmental QA Sign-Off',
      description: 'Smart contract automatically verifies that all logged IoT sensor readings complied with SLA thresholds with zero excursions.',
      requiredStakeholder: 'QA_AUDITOR',
      status: 'VERIFIED',
      verifiedAt: '2026-09-13T09:30:00Z',
      verifiedBy: 'Eurofins / ISO 9001 Automated Quality Oracle',
      verifierWallet: '0x88c241...71fa',
      verifierSignature: 'SIG-QA-ORACLE-661928401928',
      contractAddress,
      gasUsedGwei: 56900,
      txHash: '0x7e11029384019283019283019283019283019283019283019283019283019283',
      automatedRule: 'REQUIRE(excursion_count == 0 && max_recorded_shock < 1.8G && humidity < 60%)',
      criteriaEvaluated: [
        { name: 'Cold-Chain SLA Range Check', requiredValue: `${batch.slaRules.minTemp}°C to ${batch.slaRules.maxTemp}°C`, actualValue: '19.8°C (Nominal)', passed: true },
        { name: 'Max Humidity Threshold', requiredValue: `< ${batch.slaRules.maxHumidity}%`, actualValue: '44.2% RH', passed: true },
        { name: 'Vibration & Shock Integrity', requiredValue: `< ${batch.slaRules.maxShock} G`, actualValue: '0.42 G (Smooth Transit)', passed: true }
      ]
    },
    {
      id: 'step-customs',
      stage: 'CUSTOMS_CLEARANCE',
      title: 'Customs Clearance & Regulatory Border Stamp',
      description: 'Validates export/import declarations, FIPS 140-3 Level 4 compliance certification, electronic Bill of Lading, and border inspector sign-off.',
      requiredStakeholder: 'CUSTOMS',
      status: 'VERIFIED',
      verifiedAt: '2026-09-13T10:45:00Z',
      verifiedBy: 'Federal Customs & Border Authority (Inspector Node #09)',
      verifierWallet: '0x12d890...44bb',
      verifierSignature: 'SIG-CUSTOMS-AUTH-882910293841',
      contractAddress,
      gasUsedGwei: 63100,
      txHash: '0x9b33029384019283019283019283019283019283019283019283019283019283',
      automatedRule: 'REQUIRE(regulatoryCert == FIPS_140_3_COMPLIANT && electronicManifestHash != 0 && customsDutySettled == TRUE)',
      criteriaEvaluated: [
        { name: 'Harmonized Tariff (HTS) Code', requiredValue: 'HTS 8471.80 (Hardware Security)', actualValue: 'HTS 8471.80 (Hardware Security)', passed: true },
        { name: 'FIPS 140-3 Enclave Certification', requiredValue: 'CERT_NIST_CMVP_4091', actualValue: 'CERT_NIST_CMVP_4091', passed: true },
        { name: 'Electronic Bill of Lading (eBL)', requiredValue: 'MATCH_CARRIER_MANIFEST', actualValue: 'MATCH_CARRIER_MANIFEST', passed: true }
      ]
    },
    {
      id: 'step-delivery',
      stage: 'FINAL_DELIVERY_RELEASE',
      title: 'Multi-Sig Custody Handoff & Escrow Delivery Release',
      description: 'Recipient datacenter performs final physical inspection, confirms RFID seal, and releases smart contract escrow payment to carrier.',
      requiredStakeholder: 'RECEIVER',
      status: 'PENDING',
      contractAddress,
      automatedRule: 'REQUIRE(ORIGIN_CONFIRMED && QA_APPROVED && CUSTOMS_CLEARED && msg.sender == RECEIVER_SIGNER)',
      criteriaEvaluated: [
        { name: 'Prior Verification Gates Completed', requiredValue: '4/4 STAGES PASSED', actualValue: '4/4 STAGES PASSED', passed: true },
        { name: 'Physical Tamper Seal Scan', requiredValue: 'MATCH_RFID_CHIP_UID', actualValue: 'PENDING_PHYSICAL_DOCK_SCAN', passed: false },
        { name: 'Receiver Multi-Sig Approval', requiredValue: '2-OF-3 KEYS REQUIRED', actualValue: 'AWAITING_RECEIVER_SIGNATURE', passed: false }
      ]
    }
  ];

  return {
    contractAddress,
    contractName: 'AutonomousSupplyChainEscrow',
    contractVersion: 'v2.4-ERC4337',
    batchId: batch.batchId,
    createdAt: '2026-09-12T07:45:00Z',
    status: 'ACTIVE',
    currentStageIndex: 4,
    steps,
    slaRules: {
      maxTempCelsius: batch.slaRules.maxTemp,
      minTempCelsius: batch.slaRules.minTemp,
      maxHumidityPercent: batch.slaRules.maxHumidity,
      maxShockGForce: batch.slaRules.maxShock,
      maxTransitHours: 48
    }
  };
}

export async function generateIoTPacket(
  batch: TrackedSupplyBatch,
  waypointIndex: number,
  anomalyType: 'NONE' | 'TEMP_SPIKE' | 'TEMP_DROP' | 'HIGH_SHOCK' | 'TAMPER_SEAL' = 'NONE'
): Promise<IoTSensorReading> {
  const waypoint = SUPPLY_ROUTE_WAYPOINTS[Math.min(waypointIndex, SUPPLY_ROUTE_WAYPOINTS.length - 1)];
  
  // Calculate baseline readings with minor jitter
  let temp = (batch.slaRules.minTemp + batch.slaRules.maxTemp) / 2 + (Math.random() * 1.6 - 0.8);
  let humidity = 42 + (Math.random() * 6 - 3);
  let shock = 0.2 + (Math.random() * 0.35);
  let tamperSeal: 'INTACT' | 'BREACHED' = 'INTACT';
  let isExcursionAlert = false;
  let excursionDetails = undefined;

  // Inject anomalies if triggered
  if (anomalyType === 'TEMP_SPIKE') {
    temp = batch.slaRules.maxTemp + 7.5 + (Math.random() * 2);
    isExcursionAlert = true;
    excursionDetails = `CRITICAL SLA VIOLATION: Temperature reached ${temp.toFixed(1)}°C (Max allowed: ${batch.slaRules.maxTemp}°C). Refrigeration cycle malfunction detected.`;
  } else if (anomalyType === 'TEMP_DROP') {
    temp = batch.slaRules.minTemp - 6.2;
    isExcursionAlert = true;
    excursionDetails = `CRITICAL SLA VIOLATION: Temperature dropped to ${temp.toFixed(1)}°C (Min allowed: ${batch.slaRules.minTemp}°C). Cryogenic overcooling detected.`;
  } else if (anomalyType === 'HIGH_SHOCK') {
    shock = 3.6 + (Math.random() * 1.2);
    isExcursionAlert = true;
    excursionDetails = `SEVERE IMPACT DETECTED: 3-Axis Accelerometer recorded ${shock.toFixed(2)}G shock (Threshold: ${batch.slaRules.maxShock}G). Possible cargo drop or collision.`;
  } else if (anomalyType === 'TAMPER_SEAL') {
    tamperSeal = 'BREACHED';
    isExcursionAlert = true;
    excursionDetails = `TAMPER SEAL BREACHED: Active RFID optical loop circuit broken at ${waypoint.name}. Potential physical interception!`;
  }

  const timestamp = new Date().toISOString();
  
  // Cryptographic sensor signature
  const rawPayload = `${batch.iotDeviceId}:${timestamp}:${temp.toFixed(2)}:${humidity.toFixed(1)}:${shock.toFixed(2)}:${tamperSeal}:${waypoint.lat}:${waypoint.lng}`;
  const signatureHash = await sha256(rawPayload);
  const deviceSignature = `SIG-ECDSA-${signatureHash.slice(0, 32)}`;

  return {
    deviceId: batch.iotDeviceId,
    deviceType: 'Nordic nRF9160 Multi-Sensor Telemetry Beacon',
    timestamp,
    gps: {
      lat: waypoint.lat + (Math.random() * 0.008 - 0.004),
      lng: waypoint.lng + (Math.random() * 0.008 - 0.004),
      locationName: waypoint.name,
      altitudeMeters: Math.round(450 + (Math.random() * 50)),
      speedKmh: waypoint.type === 'ORIGIN' || waypoint.type === 'DESTINATION' ? 0 : Math.round(85 + (Math.random() * 15)),
      bearing: '135° SE'
    },
    temperatureCelsius: parseFloat(temp.toFixed(2)),
    humidityPercent: parseFloat(humidity.toFixed(1)),
    shockGForce: parseFloat(shock.toFixed(2)),
    batteryLevelPercent: 94,
    signalStrengthDbm: -68,
    connectionType: '5G_NB_IOT',
    tamperSealState: tamperSeal,
    deviceSignature,
    isExcursionAlert,
    excursionDetails
  };
}
