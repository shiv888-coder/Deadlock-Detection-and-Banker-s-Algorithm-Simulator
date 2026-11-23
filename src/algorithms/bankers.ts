import type {
  BankerResult,
  BankerStep,
  ResourceRequestResult,
  SystemState,
} from '../types/simulator';
import { computeNeedMatrix, isValidNonNegativeInt, validateSystemState } from './validation';

function vectorLessOrEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let j = 0; j < a.length; j++) {
    if (a[j] > b[j]) {
      return false;
    }
  }
  return true;
}

function addVectors(a: number[], b: number[]): number[] {
  return a.map((val, idx) => val + b[idx]);
}

function formatVector(v: number[]): string {
  return `[${v.join(', ')}]`;
}

/**
 * Runs the standard Banker's Safety Algorithm and captures a deterministic
 * step-by-step trace suitable for visualization.
 */
export function runBankersSafetyAlgorithm(state: SystemState): BankerResult {
  const validation = validateSystemState(state, 'bankers');
  const pCount = Array.isArray(state?.processNames) ? state.processNames.length : 0;
  const rCount = Array.isArray(state?.resourceNames) ? state.resourceNames.length : 0;
  const safeAvailable = Array.isArray(state?.available) ? [...state.available] : [];
  const need = computeNeedMatrix(state?.maximum ?? [], state?.allocation ?? []);

  if (!validation.valid) {
    return {
      valid: false,
      validationIssues: validation.issues,
      isSafe: false,
      need,
      initialAvailable: safeAvailable,
      finalWork: [...safeAvailable],
      finish: Array.from({ length: pCount }, () => false),
      safeSequence: [],
      unfinishedProcesses: Array.isArray(state?.processNames) ? [...state.processNames] : [],
      steps: [],
    };
  }

  let work = [...state.available];
  const finish = Array.from({ length: pCount }, () => false);
  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];

  steps.push({
    stepNumber: 0,
    kind: 'init',
    processIndex: null,
    processName: null,
    checkedProcesses: [],
    previousWork: [...work],
    releasedResources: Array.from({ length: rCount }, () => 0),
    updatedWork: [...work],
    finishSnapshot: [...finish],
    safeSequenceSoFar: [],
    explanation: `Initialize Work = Available = ${formatVector(work)} and set Finish[i] = false for all ${pCount} processes.`,
  });

  let stepCounter = 1;
  let searchStart = 0;

  while (safeSequence.length < pCount) {
    let foundIndex = -1;
    const checkedThisRound: BankerStep['checkedProcesses'] = [];

    for (let offset = 0; offset < pCount; offset++) {
      const i = (searchStart + offset) % pCount;
      if (finish[i]) continue;

      const satisfied = vectorLessOrEqual(need[i], work);
      checkedThisRound.push({
        processIndex: i,
        processName: state.processNames[i],
        need: [...need[i]],
        satisfied,
      });

      if (satisfied) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      const remaining = state.processNames.filter((_, idx) => !finish[idx]);
      steps.push({
        stepNumber: stepCounter,
        kind: 'unsafe',
        processIndex: null,
        processName: null,
        checkedProcesses: checkedThisRound,
        previousWork: [...work],
        releasedResources: Array.from({ length: rCount }, () => 0),
        updatedWork: [...work],
        finishSnapshot: [...finish],
        safeSequenceSoFar: [...safeSequence],
        explanation: `No remaining unfinished process satisfies Need[i] <= Work ${formatVector(work)}. Remaining processes (${remaining.join(', ')}) cannot complete safely. System is in an UNSAFE STATE.`,
      });

      return {
        valid: true,
        validationIssues: [],
        isSafe: false,
        need,
        initialAvailable: [...state.available],
        finalWork: [...work],
        finish,
        safeSequence: [],
        unfinishedProcesses: remaining,
        steps,
      };
    }

    const previousWork = [...work];
    const released = [...state.allocation[foundIndex]];
    work = addVectors(work, released);
    finish[foundIndex] = true;
    safeSequence.push(state.processNames[foundIndex]);

    steps.push({
      stepNumber: stepCounter,
      kind: 'execute',
      processIndex: foundIndex,
      processName: state.processNames[foundIndex],
      checkedProcesses: checkedThisRound,
      previousWork,
      releasedResources: released,
      updatedWork: [...work],
      finishSnapshot: [...finish],
      safeSequenceSoFar: [...safeSequence],
      explanation: `${state.processNames[foundIndex]} satisfies Need ${formatVector(need[foundIndex])} <= Work ${formatVector(previousWork)}. Execute ${state.processNames[foundIndex]}, release Allocation ${formatVector(released)}, and update Work = ${formatVector(previousWork)} + ${formatVector(released)} = ${formatVector(work)}.`,
    });

    stepCounter += 1;
    searchStart = (foundIndex + 1) % pCount;
  }

  steps.push({
    stepNumber: stepCounter,
    kind: 'complete',
    processIndex: null,
    processName: null,
    checkedProcesses: [],
    previousWork: [...work],
    releasedResources: Array.from({ length: rCount }, () => 0),
    updatedWork: [...work],
    finishSnapshot: [...finish],
    safeSequenceSoFar: [...safeSequence],
    explanation: `All ${pCount} processes finished safely. Safe sequence found: <${safeSequence.join(', ')}>. Final Work = ${formatVector(work)}.`,
  });

  return {
    valid: true,
    validationIssues: [],
    isSafe: true,
    need,
    initialAvailable: [...state.available],
    finalWork: [...work],
    finish,
    safeSequence,
    unfinishedProcesses: [],
    steps,
  };
}

/**
 * Verifies whether a candidate sequence of process names is a mathematically
 * valid safe sequence for the given system state.
 */
export function isValidSafeSequence(state: SystemState, sequence: string[]): boolean {
  const validation = validateSystemState(state, 'bankers');
  if (!validation.valid) return false;
  if (!Array.isArray(sequence) || sequence.length !== state.processNames.length) return false;

  const need = computeNeedMatrix(state.maximum, state.allocation);
  const visited = new Set<number>();
  let work = [...state.available];

  for (const name of sequence) {
    const idx = state.processNames.indexOf(name);
    if (idx === -1 || visited.has(idx)) return false;
    if (!vectorLessOrEqual(need[idx], work)) return false;
    visited.add(idx);
    work = addVectors(work, state.allocation[idx]);
  }

  return visited.size === state.processNames.length;
}

/**
 * Enumerates valid safe sequences via backtracking (bounded by maxSequences to
 * prevent factorial blowup on large process counts).
 */
export function findAllSafeSequences(state: SystemState, maxSequences = 25): string[][] {
  const validation = validateSystemState(state, 'bankers');
  if (!validation.valid || maxSequences < 1) return [];

  const pCount = state.processNames.length;
  const need = computeNeedMatrix(state.maximum, state.allocation);
  const finish = Array.from({ length: pCount }, () => false);
  const current: string[] = [];
  const results: string[][] = [];

  const backtrack = (work: number[]) => {
    if (results.length >= maxSequences) return;
    if (current.length === pCount) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < pCount; i++) {
      if (finish[i]) continue;
      if (vectorLessOrEqual(need[i], work)) {
        finish[i] = true;
        current.push(state.processNames[i]);
        backtrack(addVectors(work, state.allocation[i]));
        current.pop();
        finish[i] = false;
        if (results.length >= maxSequences) return;
      }
    }
  };

  backtrack([...state.available]);
  return results;
}

/**
 * Evaluates a dynamic Resource-Request(i, Request) using Banker's Algorithm:
 * 1. Check Request <= Need[i]
 * 2. Check Request <= Available
 * 3. Pretend to allocate on an isolated copy and run Safety Algorithm
 */
export function evaluateResourceRequest(
  state: SystemState,
  processIndex: number,
  requestVector: number[]
): ResourceRequestResult {
  const pCount = Array.isArray(state?.processNames) ? state.processNames.length : 0;
  const rCount = Array.isArray(state?.resourceNames) ? state.resourceNames.length : 0;
  const processName = state?.processNames?.[processIndex] ?? `P${processIndex}`;

  if (
    !Number.isInteger(processIndex) ||
    processIndex < 0 ||
    processIndex >= pCount ||
    !Array.isArray(requestVector) ||
    requestVector.length !== rCount ||
    requestVector.some((v) => !isValidNonNegativeInt(v))
  ) {
    return {
      processIndex,
      processName,
      requestVector: Array.isArray(requestVector) ? [...requestVector] : [],
      granted: false,
      errorType: 'invalid-input',
      reason: 'Every requested resource quantity must be a non-negative integer for a valid process.',
    };
  }

  const baseValidation = validateSystemState(state, 'bankers');
  if (!baseValidation.valid) {
    return {
      processIndex,
      processName,
      requestVector: [...requestVector],
      granted: false,
      errorType: 'invalid-input',
      reason: 'Resolve matrix validation errors before testing a resource request.',
    };
  }

  const need = computeNeedMatrix(state.maximum, state.allocation);

  // Step 1: Request <= Need[i]
  if (!vectorLessOrEqual(requestVector, need[processIndex])) {
    return {
      processIndex,
      processName,
      requestVector: [...requestVector],
      granted: false,
      errorType: 'exceeds-need',
      reason: `Error: ${processName} requested ${formatVector(requestVector)}, which exceeds its remaining maximum need ${formatVector(need[processIndex])}.`,
    };
  }

  // Step 2: Request <= Available
  if (!vectorLessOrEqual(requestVector, state.available)) {
    return {
      processIndex,
      processName,
      requestVector: [...requestVector],
      granted: false,
      errorType: 'exceeds-available',
      reason: `${processName} must wait: request ${formatVector(requestVector)} exceeds currently Available resources ${formatVector(state.available)}.`,
    };
  }

  // Step 3: Pretend allocation on an isolated deep copy (original state is never mutated)
  const simulatedState: SystemState = {
    processNames: [...state.processNames],
    resourceNames: [...state.resourceNames],
    resourceDescriptions: [...state.resourceDescriptions],
    available: state.available.map((avail, j) => avail - requestVector[j]),
    allocation: state.allocation.map((row, i) =>
      i === processIndex ? row.map((val, j) => val + requestVector[j]) : [...row]
    ),
    maximum: state.maximum.map((row) => [...row]),
    request: state.request.map((row) => [...row]),
    totalCapacity: [...state.totalCapacity],
  };

  const safetyCheck = runBankersSafetyAlgorithm(simulatedState);

  if (safetyCheck.valid && safetyCheck.isSafe) {
    return {
      processIndex,
      processName,
      requestVector: [...requestVector],
      granted: true,
      errorType: 'none',
      reason: `Request ${formatVector(requestVector)} for ${processName} can be GRANTED safely. Resulting safe sequence: <${safetyCheck.safeSequence.join(', ')}>.`,
      resultingBankerCheck: safetyCheck,
    };
  }

  return {
    processIndex,
    processName,
    requestVector: [...requestVector],
    granted: false,
    errorType: 'unsafe-state',
    reason: `Request ${formatVector(requestVector)} for ${processName} is DENIED. Granting it leaves the system in an UNSAFE STATE (${safetyCheck.unfinishedProcesses.join(', ')} could not complete).`,
    resultingBankerCheck: safetyCheck,
  };
}
