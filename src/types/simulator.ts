export interface SystemState {
  processNames: string[];
  resourceNames: string[];
  resourceDescriptions: string[];
  allocation: number[][];
  maximum: number[][];
  request: number[][];
  available: number[];
  /** Optional explicit system total capacity per resource type (total >= sum(allocation)). */
  totalCapacity: number[];
}

export type ValidationScope = 'bankers' | 'deadlock' | 'all';

export interface ValidationIssue {
  id: string;
  field: 'allocation' | 'maximum' | 'request' | 'available' | 'capacity' | 'dimensions';
  processIndex?: number;
  resourceIndex?: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface BankerStep {
  stepNumber: number;
  kind: 'init' | 'execute' | 'complete' | 'unsafe';
  processIndex: number | null;
  processName: string | null;
  checkedProcesses: Array<{
    processIndex: number;
    processName: string;
    need: number[];
    satisfied: boolean;
  }>;
  previousWork: number[];
  releasedResources: number[];
  updatedWork: number[];
  finishSnapshot: boolean[];
  safeSequenceSoFar: string[];
  explanation: string;
}

export interface BankerResult {
  valid: boolean;
  validationIssues: ValidationIssue[];
  isSafe: boolean;
  need: number[][];
  initialAvailable: number[];
  finalWork: number[];
  finish: boolean[];
  safeSequence: string[];
  unfinishedProcesses: string[];
  steps: BankerStep[];
}

export interface ResourceRequestResult {
  processIndex: number;
  processName: string;
  requestVector: number[];
  granted: boolean;
  reason: string;
  errorType: 'none' | 'invalid-input' | 'exceeds-need' | 'exceeds-available' | 'unsafe-state';
  resultingBankerCheck?: BankerResult;
}

export interface DeadlockStep {
  stepNumber: number;
  kind: 'init' | 'execute' | 'no-deadlock' | 'deadlock';
  processIndex: number | null;
  processName: string | null;
  checkedProcesses: Array<{
    processIndex: number;
    processName: string;
    request: number[];
    satisfied: boolean;
  }>;
  previousWork: number[];
  releasedResources: number[];
  updatedWork: number[];
  finishSnapshot: boolean[];
  completedSequenceSoFar: string[];
  deadlockedProcesses: string[];
  explanation: string;
}

export interface DeadlockResult {
  valid: boolean;
  validationIssues: ValidationIssue[];
  hasDeadlock: boolean;
  initialAvailable: number[];
  finalWork: number[];
  initialFinish: boolean[];
  finish: boolean[];
  executionSequence: string[];
  deadlockedProcesses: string[];
  steps: DeadlockStep[];
}

export interface SampleScenario {
  id: string;
  name: string;
  subtitle: string;
  category: 'safe' | 'unsafe' | 'deadlock' | 'custom';
  recommendedMode: 'bankers' | 'deadlock';
  description: string;
  expectedOutcome: string;
  state: SystemState;
  isCustom?: boolean;
  createdAt?: string;
}

export interface LastSimulationSummary {
  mode: 'bankers' | 'deadlock';
  timestamp: string;
  scenarioName: string;
  status: 'safe' | 'unsafe' | 'no-deadlock' | 'deadlock';
  headline: string;
  detail: string;
}

export type SimulationMode = 'bankers' | 'deadlock';
