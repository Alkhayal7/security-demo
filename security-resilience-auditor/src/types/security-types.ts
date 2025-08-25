// Core security and site interfaces for the MCX Security Resilience Auditor

export interface MCXSite {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    region: string;
  };
  infrastructure: {
    type: 'hospital' | 'power_plant' | 'emergency_services' | 'government' | 'other';
    criticality: 'high' | 'medium' | 'low';
  };
  security: {
    resilienceScore: number; // 0-100
    lastAuditDate: string;
    vulnerabilities: SecurityVulnerability[];
  };
  technical: {
    firmwareVersion: string;
    securitySettings: SecurityConfig;
    networkTopology: NetworkNode[];
  };
}

export interface SecurityVulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedComponents: string[];
  discoveredDate: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  authenticationMethod: string;
  firewallRules: string[];
  accessControlPolicies: string[];
}

export interface NetworkNode {
  id: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  connections: string[];
}

export interface SecurityTest {
  id: string;
  name: string;
  category: 'jamming' | 'flooding' | 'spoofing' | 'injection' | 'manipulation';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // in seconds
  parameters: TestParameter[];
}

export interface TestParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: string | number | boolean;
  options?: string[]; // for select type
  description: string;
  required: boolean;
}

export interface TestResult {
  testId: string;
  siteId: string;
  score: number; // 0-100
  status: 'passed' | 'failed' | 'warning';
  timestamp: string;
  details: string;
  recommendations: string[];
}

export interface SecurityTestSuite {
  siteId: string;
  tests: {
    jammingSSBPBCHPRACH: number;
    prachFlooding: number;
    gnssJamming: number;
    gnssSpoofing: number;
    beamformingExploits: number;
    replayInjection: number;
    rogueGNB: number;
    forgedNASRRC: number;
    packetManipulation: number;
    tunnelingMisuse: number;
    floodingUPF: number;
  };
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SiteLocation {
  id: string;
  coordinates: [number, number]; // Lat/Lng within Jeddah boundaries
  coverage: {
    radius: number; // in meters
    criticalInfrastructure: CriticalAsset[];
  };
  area: 'north_jeddah' | 'central_jeddah' | 'south_jeddah' | 'airport' | 'port' | 'industrial';
}

export interface CriticalAsset {
  id: string;
  name: string;
  type: 'hospital' | 'power_plant' | 'emergency_services' | 'government' | 'other';
  coordinates: [number, number];
  importance: 'critical' | 'high' | 'medium';
}

// UI and State Management Types
export interface SecurityKPIData {
  overallNetworkResilience: number;
  criticalVulnerabilities: number;
  sitesAtRisk: number;
  lastAuditCoverage: number;
}

export interface ThreatAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSites: string[];
  timestamp: string;
  recommendations: string[];
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  selectedSiteId: string | null;
  highlightedSites: string[];
  showCoverageAreas: boolean;
}

export interface TestExecutionState {
  isRunning: boolean;
  currentTest: SecurityTest | null;
  progress: number;
  status: string;
  results: TestResult[];
}