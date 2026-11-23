import type { DeadlockResult, DeadlockStep, SystemState } from '../types/simulator';
import { validateSystemState } from './validation';

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

function hasAnyAllocation(allocationRow: number[]): boolean {
  return allocationRow.some((val) => val > 0);
}

function formatVector(v: number[]): string {
  return `[${v.join(', ')}]`;
}

/**
 * Implements the standard Multi-Instance Deadlock Detection Algorithm
 * (Silberschatz OS Concepts):
 * 1. Work = Available
 * 2. For i = 0..n-1: if Allocation[i] != 0 then Finish[i] = false, else Finish[i] = true
 * 3. Find i such that Finish[i] == false and Request[i] <= Work
 * 4. Work = Work + Allocation[i]; Finish[i] = true; repeat step 3
 * 5. Any process with Finish[i] == false is deadlocked.
 */
export function runDeadlockDetectionAlgorithm(state: SystemState): DeadlockResult {
  const validation = validateSystemState(state, 'deadlock');
  const pCount = Array.isArray(state?.processNames) ? state.processNames.length : 0;
  const rCount = Array.isArray(state?.resourceNames) ? state.resourceNames.length : 0;
  const safeAvailable = Array.isArray(state?.available) ? [...state.available] : [];

  if (!validation.valid) {
    return {
      valid: false,
      validationIssues: validation.issues,
      hasDeadlock: false,
      initialAvailable: safeAvailable,
      finalWork: [...safeAvailable],
      initialFinish: Array.from({ length: pCount }, () => false),
      finish: Array.from({ length: pCount }, () => false),
      executionSequence: [],
      deadlockedProcesses: [],
      steps: [],
    };
  }

  let work = [...state.available];
  const initialFinish = state.allocation.map((row) => !hasAnyAllocation(row));
  const finish = [...initialFinish];
  const executionSequence: string[] = [];
  const steps: DeadlockStep[] = [];

  const zeroAllocProcesses = state.processNames.filter((_, idx) => initialFinish[idx]);
  const activeProcesses = state.processNames.filter((_, idx) => !initialFinish[idx]);

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
    completedSequenceSoFar: [],
    deadlockedProcesses: [],
    explanation:
      activeProcesses.length === 0
        ? `Initialize Work = Available = ${formatVector(work)}. All ${pCount} processes currently hold zero resources, so Finish[i] = true initially for every process.`
        : zeroAllocProcesses.length > 0
          ? `Initialize Work = Available = ${formatVector(work)}. Processes holding zero resources (${zeroAllocProcesses.join(', ')}) start with Finish = true; processes holding resources (${activeProcesses.join(', ')}) start with Finish = false.`
          : `Initialize Work = Available = ${formatVector(work)}. All ${pCount} processes currently hold allocated resources, so Finish[i] = false for every process.`,
  });

  let stepCounter = 1;
  let searchStart = 0;

  while (finish.some((done) => !done)) {
    let foundIndex = -1;
    const checkedThisRound: DeadlockStep['checkedProcesses'] = [];

    for (let offset = 0; offset < pCount; offset++) {
      const i = (searchStart + offset) % pCount;
      if (finish[i]) continue;

      const satisfied = vectorLessOrEqual(state.request[i], work);
      checkedThisRound.push({
        processIndex: i,
        processName: state.processNames[i],
        request: [...state.request[i]],
        satisfied,
      });

      if (satisfied) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      const deadlocked = state.processNames.filter((_, idx) => !finish[idx]);
      steps.push({
        stepNumber: stepCounter,
        kind: 'deadlock',
        processIndex: null,
        processName: null,
        checkedProcesses: checkedThisRound,
        previousWork: [...work],
        releasedResources: Array.from({ length: rCount }, () => 0),
        updatedWork: [...work],
        finishSnapshot: [...finish],
        completedSequenceSoFar: [...executionSequence],
        deadlockedProcesses: deadlocked,
        explanation: `No unfinished process has Request[i] <= Work ${formatVector(work)}. Deadlock detected involving: ${deadlocked.join(', ')}.`,
      });

      return {
        valid: true,
        validationIssues: [],
        hasDeadlock: true,
        initialAvailable: [...state.available],
        finalWork: [...work],
        initialFinish,
        finish,
        executionSequence,
        deadlockedProcesses: deadlocked,
        steps,
      };
    }

    const previousWork = [...work];
    const released = [...state.allocation[foundIndex]];
    work = addVectors(work, released);
    finish[foundIndex] = true;
    executionSequence.push(state.processNames[foundIndex]);

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
      completedSequenceSoFar: [...executionSequence],
      deadlockedProcesses: [],
      explanation: `${state.processNames[foundIndex]} satisfies Request ${formatVector(state.request[foundIndex])} <= Work ${formatVector(previousWork)}. Assume ${state.processNames[foundIndex]} completes, releasing Allocation ${formatVector(released)}. Updated Work = ${formatVector(work)}.`,
    });

    stepCounter += 1;
    searchStart = (foundIndex + 1) % pCount;
  }

  steps.push({
    stepNumber: stepCounter,
    kind: 'no-deadlock',
    processIndex: null,
    processName: null,
    checkedProcesses: [],
    previousWork: [...work],
    releasedResources: Array.from({ length: rCount }, () => 0),
    updatedWork: [...work],
    finishSnapshot: [...finish],
    completedSequenceSoFar: [...executionSequence],
    deadlockedProcesses: [],
    explanation:
      executionSequence.length > 0
        ? `All processes have Finish[i] = true. No deadlock exists in the current allocation state. Completion order: <${executionSequence.join(', ')}>.`
        : 'All processes hold zero resources (Finish[i] = true initially). No deadlock exists in the current allocation state.',
  });

  return {
    valid: true,
    validationIssues: [],
    hasDeadlock: false,
    initialAvailable: [...state.available],
    finalWork: [...work],
    initialFinish,
    finish,
    executionSequence,
    deadlockedProcesses: [],
    steps,
  };
}
