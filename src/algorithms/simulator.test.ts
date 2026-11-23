import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runBankersSafetyAlgorithm,
  evaluateResourceRequest,
  isValidSafeSequence,
  findAllSafeSequences,
} from './bankers';
import { runDeadlockDetectionAlgorithm } from './deadlock';
import {
  validateSystemState,
  computeNeedMatrix,
  computeTotalAllocated,
  isValidNonNegativeInt,
} from './validation';
import { PREDEFINED_SAMPLES, cloneSystemState } from '../data/samples';
import type { SystemState } from '../types/simulator';

function makeState(overrides: Partial<SystemState> = {}): SystemState {
  const base: SystemState = {
    processNames: ['P0', 'P1'],
    resourceNames: ['A', 'B'],
    resourceDescriptions: ['Resource A', 'Resource B'],
    available: [1, 1],
    allocation: [
      [1, 0],
      [0, 1],
    ],
    maximum: [
      [2, 1],
      [1, 2],
    ],
    request: [
      [0, 0],
      [0, 0],
    ],
    totalCapacity: [2, 2],
  };
  return { ...base, ...overrides };
}

// ============================================================================
// 1. NEED MATRIX & BASIC CALCULATIONS
// ============================================================================

test('Need matrix calculation computes Need = Maximum - Allocation accurately', () => {
  assert.deepEqual(
    computeNeedMatrix(
      [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
      ],
      [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
      ]
    ),
    [
      [7, 4, 3],
      [1, 2, 2],
      [6, 0, 0],
    ]
  );

  // Maximum equal to Allocation yields all-zero Need
  assert.deepEqual(
    computeNeedMatrix(
      [
        [4, 2],
        [0, 5],
      ],
      [
        [4, 2],
        [0, 5],
      ]
    ),
    [
      [0, 0],
      [0, 0],
    ]
  );
});

test('computeTotalAllocated sums columns accurately across processes', () => {
  assert.deepEqual(
    computeTotalAllocated(
      [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2],
      ],
      3
    ),
    [7, 2, 5]
  );
});

// ============================================================================
// 2. VERIFICATION OF ALL 4 PREDEFINED SAMPLES
// ============================================================================

test('Sample 1 (Classic Safe System): exact Need, Work trace, Finish, and valid safe sequence', () => {
  const sample1 = PREDEFINED_SAMPLES[0].state;

  // Capacity invariant: TotalCapacity == TotalAllocated + Available
  const totals = computeTotalAllocated(sample1.allocation, sample1.resourceNames.length);
  assert.deepEqual(totals, [7, 2, 5]);
  assert.deepEqual(
    totals.map((t, j) => t + sample1.available[j]),
    sample1.totalCapacity
  );

  const result = runBankersSafetyAlgorithm(sample1);
  assert.equal(result.valid, true);
  assert.equal(result.isSafe, true);
  assert.deepEqual(result.initialAvailable, [3, 3, 2]);
  assert.deepEqual(result.need, [
    [7, 4, 3],
    [1, 2, 2],
    [6, 0, 0],
    [0, 1, 1],
    [4, 3, 1],
  ]);

  // Verify init step: Work = Available, Finish = all false
  assert.equal(result.steps[0].kind, 'init');
  assert.deepEqual(result.steps[0].updatedWork, [3, 3, 2]);
  assert.deepEqual(result.steps[0].finishSnapshot, [false, false, false, false, false]);

  // Verify deterministic sequence and every process appears exactly once
  assert.deepEqual(result.safeSequence, ['P1', 'P3', 'P4', 'P0', 'P2']);
  assert.equal(new Set(result.safeSequence).size, sample1.processNames.length);
  assert.equal(isValidSafeSequence(sample1, result.safeSequence), true);

  // Verify Work evolution at each execution step
  assert.deepEqual(result.steps[1].updatedWork, [5, 3, 2]); // + P1 [2,0,0]
  assert.deepEqual(result.steps[2].updatedWork, [7, 4, 3]); // + P3 [2,1,1]
  assert.deepEqual(result.steps[3].updatedWork, [7, 4, 5]); // + P4 [0,0,2]
  assert.deepEqual(result.steps[4].updatedWork, [7, 5, 5]); // + P0 [0,1,0]
  assert.deepEqual(result.steps[5].updatedWork, [10, 5, 7]); // + P2 [3,0,2]
  assert.deepEqual(result.finalWork, [10, 5, 7]);
  assert.deepEqual(result.finish, [true, true, true, true, true]);
  assert.deepEqual(result.unfinishedProcesses, []);
  assert.equal(result.steps.length, 7); // init + 5 execute + complete

  // Also verify Deadlock Detection reports no deadlock
  const dl = runDeadlockDetectionAlgorithm(sample1);
  assert.equal(dl.valid, true);
  assert.equal(dl.hasDeadlock, false);
  assert.deepEqual(dl.deadlockedProcesses, []);
});

test('Sample 2 (Unsafe System): Banker returns UNSAFE with empty safeSequence; Deadlock Detection finds NO deadlock', () => {
  const sample2 = PREDEFINED_SAMPLES[1].state;

  const totals = computeTotalAllocated(sample2.allocation, sample2.resourceNames.length);
  assert.deepEqual(totals, [5, 4, 4]);
  assert.deepEqual(
    totals.map((t, j) => t + sample2.available[j]),
    sample2.totalCapacity
  );

  const banker = runBankersSafetyAlgorithm(sample2);
  assert.equal(banker.valid, true);
  assert.equal(banker.isSafe, false);
  assert.deepEqual(banker.need, [
    [3, 2, 1],
    [1, 1, 0],
    [2, 2, 3],
    [3, 2, 2],
  ]);
  // Unsafe systems MUST NEVER receive a fabricated safe sequence
  assert.deepEqual(banker.safeSequence, []);
  assert.deepEqual(banker.unfinishedProcesses, ['P0', 'P2', 'P3']);
  assert.deepEqual(banker.finish, [false, true, false, false]);
  assert.deepEqual(banker.finalWork, [2, 1, 2]); // Only P1 executed: [1,1,0] + [1,0,2]
  assert.equal(banker.steps[banker.steps.length - 1].kind, 'unsafe');

  // Verify no safe sequence exists via exhaustive search
  assert.deepEqual(findAllSafeSequences(sample2), []);

  // Demonstrate critical OS distinction: Unsafe != Deadlock
  const deadlock = runDeadlockDetectionAlgorithm(sample2);
  assert.equal(deadlock.valid, true);
  assert.equal(deadlock.hasDeadlock, false);
  assert.deepEqual(deadlock.deadlockedProcesses, []);
  assert.deepEqual(deadlock.finish, [true, true, true, true]);
  assert.deepEqual(deadlock.finalWork, [6, 5, 4]);
});

test('Sample 3 (Deadlock Detected): identifies exact 4 deadlocked processes (P1, P2, P3, P4)', () => {
  const sample3 = PREDEFINED_SAMPLES[2].state;

  const totals = computeTotalAllocated(sample3.allocation, sample3.resourceNames.length);
  assert.deepEqual(totals, [7, 2, 6]);
  assert.deepEqual(
    totals.map((t, j) => t + sample3.available[j]),
    sample3.totalCapacity
  );

  const deadlock = runDeadlockDetectionAlgorithm(sample3);
  assert.equal(deadlock.valid, true);
  assert.equal(deadlock.hasDeadlock, true);
  assert.deepEqual(deadlock.initialAvailable, [0, 0, 0]);
  assert.deepEqual(deadlock.initialFinish, [false, false, false, false, false]);
  assert.deepEqual(deadlock.executionSequence, ['P0']);
  assert.deepEqual(deadlock.deadlockedProcesses, ['P1', 'P2', 'P3', 'P4']);
  assert.deepEqual(deadlock.finalWork, [0, 1, 0]); // P0 released [0,1,0]
  assert.deepEqual(deadlock.finish, [true, false, false, false, false]);
  assert.equal(deadlock.steps[deadlock.steps.length - 1].kind, 'deadlock');
});

test('Sample 4 (4-Resource Lab): produces exact Need and valid safe sequence <P0, P2, P3, P1>', () => {
  const sample4 = PREDEFINED_SAMPLES[3].state;

  const totals = computeTotalAllocated(sample4.allocation, sample4.resourceNames.length);
  assert.deepEqual(totals, [2, 9, 9, 8]);
  assert.deepEqual(
    totals.map((t, j) => t + sample4.available[j]),
    sample4.totalCapacity
  );

  const result = runBankersSafetyAlgorithm(sample4);
  assert.equal(result.valid, true);
  assert.equal(result.isSafe, true);
  assert.deepEqual(result.need, [
    [0, 0, 0, 0],
    [0, 7, 5, 0],
    [1, 0, 0, 2],
    [0, 0, 2, 0],
  ]);
  assert.deepEqual(result.safeSequence, ['P0', 'P2', 'P3', 'P1']);
  assert.equal(isValidSafeSequence(sample4, result.safeSequence), true);
  assert.deepEqual(result.finalWork, [3, 14, 11, 8]);
  assert.deepEqual(result.finish, [true, true, true, true]);
});

// ============================================================================
// 3. BANKER'S ALGORITHM — MULTIPLE SAFE SEQUENCES & ELIGIBILITY
// ============================================================================

test('Multiple valid safe sequences are recognized and validated accurately', () => {
  const sample1 = PREDEFINED_SAMPLES[0].state;
  const allSequences = findAllSafeSequences(sample1, 50);

  // Classic Silberschatz 5-process example has exactly 16 valid safe sequences
  assert.equal(allSequences.length, 16);
  for (const seq of allSequences) {
    assert.equal(isValidSafeSequence(sample1, seq), true);
    assert.equal(seq.length, 5);
    assert.equal(new Set(seq).size, 5);
  }

  // Known alternate valid sequences
  assert.equal(isValidSafeSequence(sample1, ['P1', 'P3', 'P4', 'P2', 'P0']), true);
  assert.equal(isValidSafeSequence(sample1, ['P3', 'P1', 'P4', 'P0', 'P2']), true);

  // Known invalid sequences (P0 cannot start since Need[0]=[7,4,3] > Work=[3,3,2])
  assert.equal(isValidSafeSequence(sample1, ['P0', 'P1', 'P2', 'P3', 'P4']), false);
  // Duplicate or partial sequences are invalid
  assert.equal(isValidSafeSequence(sample1, ['P1', 'P1', 'P3', 'P4', 'P2']), false);
  assert.equal(isValidSafeSequence(sample1, ['P1', 'P3', 'P4']), false);

  // Sample 4 also has multiple valid safe sequences (e.g., P0 and P3 both eligible at start)
  const sample4Seqs = findAllSafeSequences(PREDEFINED_SAMPLES[3].state, 20);
  assert.ok(sample4Seqs.length > 1);
  assert.equal(isValidSafeSequence(PREDEFINED_SAMPLES[3].state, ['P3', 'P0', 'P2', 'P1']), true);
});

test('Banker eligibility checks EVERY resource type (fails if even the last resource exceeds Work)', () => {
  const state = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A', 'B', 'C'],
    resourceDescriptions: ['A', 'B', 'C'],
    available: [5, 5, 0],
    allocation: [
      [1, 0, 1],
      [0, 1, 1],
    ],
    maximum: [
      [2, 1, 2], // Need = [1, 1, 1] -> C exceeds Available[2]=0
      [1, 2, 2], // Need = [1, 1, 1] -> C exceeds Available[2]=0
    ],
    request: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    totalCapacity: [6, 6, 2],
  });

  const result = runBankersSafetyAlgorithm(state);
  assert.equal(result.valid, true);
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.safeSequence, []);
  assert.deepEqual(result.unfinishedProcesses, ['P0', 'P1']);
  assert.deepEqual(result.finalWork, [5, 5, 0]);
});

// ============================================================================
// 4. RESOURCE-REQUEST ALGORITHM AUDIT
// ============================================================================

test('Resource-Request grants safe request and computes exact temporary state without mutating original', () => {
  const original = cloneSystemState(PREDEFINED_SAMPLES[0].state);
  const snapshotBefore = JSON.stringify(original);

  // Classic Silberschatz grantable request: P1 requests [1, 0, 2]
  const outcome = evaluateResourceRequest(original, 1, [1, 0, 2]);
  assert.equal(outcome.granted, true);
  assert.equal(outcome.errorType, 'none');
  assert.equal(outcome.resultingBankerCheck?.valid, true);
  assert.equal(outcome.resultingBankerCheck?.isSafe, true);
  assert.deepEqual(outcome.resultingBankerCheck?.initialAvailable, [2, 3, 0]);
  assert.deepEqual(outcome.resultingBankerCheck?.need[1], [0, 2, 0]);
  assert.equal(
    isValidSafeSequence(
      {
        ...original,
        available: [2, 3, 0],
        allocation: original.allocation.map((r, i) => (i === 1 ? [3, 0, 2] : [...r])),
      },
      outcome.resultingBankerCheck?.safeSequence ?? []
    ),
    true
  );

  // Original state must remain 100% untouched
  assert.equal(JSON.stringify(original), snapshotBefore);
});

test('Resource-Request rejects unsafe request (Req <= Need & Req <= Available) and preserves original state', () => {
  // Craft state where P0 request [0, 2, 0] satisfies Request <= Need & Request <= Available,
  // yet leaves Available = [1, 1, 2] -> unsafe for all remaining processes.
  const state = cloneSystemState(PREDEFINED_SAMPLES[0].state);
  // First simulate after P1 got [1, 0, 2]: Available = [2, 3, 0], Allocation[1] = [3, 0, 2]
  state.available = [2, 3, 0];
  state.allocation[1] = [3, 0, 2];

  // Now P0 requests [0, 2, 0]: Need[0]=[7,4,3], Avail=[2,3,0] -> both checks pass!
  // Resulting Avail = [2, 1, 0]:
  // Need[0]=[7,2,3], Need[1]=[0,2,0], Need[2]=[6,0,0], Need[3]=[0,1,1], Need[4]=[4,3,1]
  // None satisfy Need <= [2, 1, 0]! -> UNSAFE STATE
  const snapshotBefore = JSON.stringify(state);
  const denied = evaluateResourceRequest(state, 0, [0, 2, 0]);

  assert.equal(denied.granted, false);
  assert.equal(denied.errorType, 'unsafe-state');
  assert.equal(denied.resultingBankerCheck?.isSafe, false);
  assert.deepEqual(denied.resultingBankerCheck?.safeSequence, []);
  assert.ok(denied.reason.includes('DENIED'));

  // Original state MUST remain completely unchanged when rejected
  assert.equal(JSON.stringify(state), snapshotBefore);
});

test('Resource-Request rejects exceeds-need, exceeds-available, and invalid inputs with clear errors', () => {
  const sample1 = PREDEFINED_SAMPLES[0].state;

  // Exceeds Need: P1 Need is [1, 2, 2], request [2, 0, 0]
  const exceedsNeed = evaluateResourceRequest(sample1, 1, [2, 0, 0]);
  assert.equal(exceedsNeed.granted, false);
  assert.equal(exceedsNeed.errorType, 'exceeds-need');
  assert.ok(exceedsNeed.reason.toLowerCase().includes('exceeds its remaining maximum need'));

  // Exceeds Available: P0 Need is [7, 4, 3], Available is [3, 3, 2], request [4, 0, 0]
  const exceedsAvail = evaluateResourceRequest(sample1, 0, [4, 0, 0]);
  assert.equal(exceedsAvail.granted, false);
  assert.equal(exceedsAvail.errorType, 'exceeds-available');
  assert.ok(exceedsAvail.reason.toLowerCase().includes('exceeds currently available'));

  // Negative value
  const negReq = evaluateResourceRequest(sample1, 0, [-1, 0, 0]);
  assert.equal(negReq.granted, false);
  assert.equal(negReq.errorType, 'invalid-input');

  // Decimal value
  const decReq = evaluateResourceRequest(sample1, 0, [0.5, 0, 0]);
  assert.equal(decReq.granted, false);
  assert.equal(decReq.errorType, 'invalid-input');

  // Wrong vector length
  const wrongLen = evaluateResourceRequest(sample1, 0, [1, 0]);
  assert.equal(wrongLen.granted, false);
  assert.equal(wrongLen.errorType, 'invalid-input');

  // Invalid process index (out of range / non-integer)
  assert.equal(evaluateResourceRequest(sample1, -1, [0, 0, 0]).errorType, 'invalid-input');
  assert.equal(evaluateResourceRequest(sample1, 99, [0, 0, 0]).errorType, 'invalid-input');
  assert.equal(evaluateResourceRequest(sample1, 1.5, [0, 0, 0]).errorType, 'invalid-input');
});

// ============================================================================
// 5. DEADLOCK DETECTION ALGORITHM AUDIT
// ============================================================================

test('Deadlock Detection handles partial zero-allocation and all-zero-allocation correctly', () => {
  // Partial zero allocation: P4 holds [0,0,0] so initialFinish[4] = true
  const partialZero = cloneSystemState(PREDEFINED_SAMPLES[2].state);
  partialZero.allocation[4] = [0, 0, 0];
  partialZero.available = [0, 0, 2];
  const partialRes = runDeadlockDetectionAlgorithm(partialZero);
  assert.equal(partialRes.valid, true);
  assert.equal(partialRes.initialFinish[4], true);
  assert.equal(partialRes.finish[4], true);

  // All processes hold zero allocation (even with nonzero requests, they hold nothing so cannot deadlock)
  const allZero = makeState({
    processNames: ['P0', 'P1', 'P2'],
    resourceNames: ['A', 'B'],
    resourceDescriptions: ['A', 'B'],
    available: [0, 0],
    allocation: [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    maximum: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    request: [
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    totalCapacity: [0, 0],
  });

  const allZeroRes = runDeadlockDetectionAlgorithm(allZero);
  assert.equal(allZeroRes.valid, true);
  assert.equal(allZeroRes.hasDeadlock, false);
  assert.deepEqual(allZeroRes.initialFinish, [true, true, true]);
  assert.deepEqual(allZeroRes.finish, [true, true, true]);
  assert.deepEqual(allZeroRes.deadlockedProcesses, []);
  assert.deepEqual(allZeroRes.executionSequence, []);
  // Ensure clean explanation without empty brackets "<>" or "()"
  assert.ok(!allZeroRes.steps[0].explanation.includes('()'));
  assert.ok(!allZeroRes.steps[allZeroRes.steps.length - 1].explanation.includes('<>'));
});

test('Deadlock Detection checks Request <= Work across EVERY resource type', () => {
  const state = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A', 'B', 'C'],
    resourceDescriptions: ['A', 'B', 'C'],
    available: [2, 2, 0],
    allocation: [
      [1, 0, 1],
      [0, 1, 1],
    ],
    maximum: [
      [2, 1, 2],
      [1, 2, 2],
    ],
    request: [
      [1, 1, 1], // Fails only on C (1 > 0)
      [0, 0, 1], // Fails only on C (1 > 0)
    ],
    totalCapacity: [3, 3, 2],
  });

  const res = runDeadlockDetectionAlgorithm(state);
  assert.equal(res.valid, true);
  assert.equal(res.hasDeadlock, true);
  assert.deepEqual(res.deadlockedProcesses, ['P0', 'P1']);
  assert.deepEqual(res.executionSequence, []);
  assert.deepEqual(res.finalWork, [2, 2, 0]);
});

// ============================================================================
// 6. ALL 14 EDGE CASES
// ============================================================================

test('Edge Case 1: One process and one resource (1x1) — both safe and unsafe/deadlock', () => {
  const safe1x1 = makeState({
    processNames: ['P0'],
    resourceNames: ['A'],
    resourceDescriptions: ['Printer'],
    available: [2],
    allocation: [[1]],
    maximum: [[3]],
    request: [[2]],
    totalCapacity: [3],
  });

  const bankerSafe = runBankersSafetyAlgorithm(safe1x1);
  assert.equal(bankerSafe.valid, true);
  assert.equal(bankerSafe.isSafe, true);
  assert.deepEqual(bankerSafe.safeSequence, ['P0']);
  assert.deepEqual(bankerSafe.finalWork, [3]);

  const dlSafe = runDeadlockDetectionAlgorithm(safe1x1);
  assert.equal(dlSafe.valid, true);
  assert.equal(dlSafe.hasDeadlock, false);
  assert.deepEqual(dlSafe.executionSequence, ['P0']);

  const unsafe1x1 = makeState({
    processNames: ['P0'],
    resourceNames: ['A'],
    resourceDescriptions: ['Printer'],
    available: [0],
    allocation: [[1]],
    maximum: [[2]],
    request: [[1]],
    totalCapacity: [1],
  });

  const bankerUnsafe = runBankersSafetyAlgorithm(unsafe1x1);
  assert.equal(bankerUnsafe.valid, true);
  assert.equal(bankerUnsafe.isSafe, false);
  assert.deepEqual(bankerUnsafe.safeSequence, []);
  assert.deepEqual(bankerUnsafe.unfinishedProcesses, ['P0']);

  const dlDeadlock = runDeadlockDetectionAlgorithm(unsafe1x1);
  assert.equal(dlDeadlock.valid, true);
  assert.equal(dlDeadlock.hasDeadlock, true);
  assert.deepEqual(dlDeadlock.deadlockedProcesses, ['P0']);
});

test('Edge Case 2: Multiple processes and multiple resources (6x4)', () => {
  const state6x4 = makeState({
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'],
    resourceNames: ['A', 'B', 'C', 'D'],
    resourceDescriptions: ['A', 'B', 'C', 'D'],
    available: [1, 1, 1, 1],
    allocation: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
    ],
    maximum: [
      [2, 1, 0, 0],
      [1, 2, 1, 0],
      [1, 1, 2, 1],
      [2, 2, 1, 2],
      [3, 3, 2, 1],
      [3, 3, 3, 3],
    ],
    request: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
    ],
    totalCapacity: [3, 3, 3, 3],
  });

  const banker = runBankersSafetyAlgorithm(state6x4);
  assert.equal(banker.valid, true);
  assert.equal(banker.isSafe, true);
  assert.equal(banker.safeSequence.length, 6);
  assert.equal(isValidSafeSequence(state6x4, banker.safeSequence), true);
  assert.deepEqual(banker.finalWork, [3, 3, 3, 3]);
});

test('Edge Case 3 & 5: Zero available resources with Max == Allocation (Need == 0) finishes safely', () => {
  const state = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A', 'B'],
    resourceDescriptions: ['A', 'B'],
    available: [0, 0],
    allocation: [
      [2, 1],
      [1, 3],
    ],
    maximum: [
      [2, 1], // Need = [0, 0] <= [0, 0]
      [3, 4], // Need = [2, 1] <= [2, 1] after P0 finishes
    ],
    request: [
      [0, 0],
      [2, 1],
    ],
    totalCapacity: [3, 4],
  });

  const banker = runBankersSafetyAlgorithm(state);
  assert.equal(banker.valid, true);
  assert.equal(banker.isSafe, true);
  assert.deepEqual(banker.safeSequence, ['P0', 'P1']);
  assert.deepEqual(banker.finalWork, [3, 4]);

  const dl = runDeadlockDetectionAlgorithm(state);
  assert.equal(dl.valid, true);
  assert.equal(dl.hasDeadlock, false);
  assert.deepEqual(dl.executionSequence, ['P0', 'P1']);
});

test('Edge Case 4: Zero allocation across all processes in Banker Safety Algorithm', () => {
  const zeroAlloc = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A', 'B'],
    resourceDescriptions: ['A', 'B'],
    available: [4, 4],
    allocation: [
      [0, 0],
      [0, 0],
    ],
    maximum: [
      [3, 2],
      [4, 4],
    ],
    request: [
      [0, 0],
      [0, 0],
    ],
    totalCapacity: [4, 4],
  });

  const banker = runBankersSafetyAlgorithm(zeroAlloc);
  assert.equal(banker.valid, true);
  assert.equal(banker.isSafe, true);
  assert.deepEqual(banker.safeSequence, ['P0', 'P1']);
  assert.deepEqual(banker.finalWork, [4, 4]);
});

test('Edge Case 6: Maximum smaller than Allocation is rejected by Banker validation', () => {
  const invalidMax = cloneSystemState(PREDEFINED_SAMPLES[0].state);
  invalidMax.allocation[0][0] = 8; // Exceeds Max[0][0] = 7
  const val = validateSystemState(invalidMax, 'bankers');
  assert.equal(val.valid, false);
  assert.ok(val.issues.some((i) => i.message.includes('exceeds its maximum claim')));

  const banker = runBankersSafetyAlgorithm(invalidMax);
  assert.equal(banker.valid, false);
  assert.equal(banker.isSafe, false);
  assert.deepEqual(banker.safeSequence, []);
});

test('Edge Case 7 & 8: Negative inputs and decimal inputs are rejected cleanly without crash', () => {
  assert.equal(isValidNonNegativeInt(-1), false);
  assert.equal(isValidNonNegativeInt(1.5), false);
  assert.equal(isValidNonNegativeInt(Number.NaN), false);
  assert.equal(isValidNonNegativeInt(Number.POSITIVE_INFINITY), false);
  assert.equal(isValidNonNegativeInt(0), true);
  assert.equal(isValidNonNegativeInt(42), true);

  const negAvail = makeState({ available: [-1, 1] });
  assert.equal(validateSystemState(negAvail, 'all').valid, false);

  const negAlloc = makeState({
    allocation: [
      [-2, 0],
      [0, 1],
    ],
  });
  assert.equal(validateSystemState(negAlloc, 'all').valid, false);

  const decMax = makeState({
    maximum: [
      [2.5, 1],
      [1, 2],
    ],
  });
  assert.equal(validateSystemState(decMax, 'bankers').valid, false);
  assert.equal(runBankersSafetyAlgorithm(decMax).valid, false);

  const decReq = makeState({
    request: [
      [0.25, 0],
      [0, 0],
    ],
  });
  assert.equal(validateSystemState(decReq, 'deadlock').valid, false);
  assert.equal(runDeadlockDetectionAlgorithm(decReq).valid, false);
});

test('Edge Case 9: Very large safe integers succeed; unsafe/overflowing huge integers are rejected cleanly', () => {
  // Large safe integers (billions) work accurately
  const largeSafe = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A'],
    resourceDescriptions: ['RAM Bytes'],
    available: [1_000_000_000],
    allocation: [[2_000_000_000], [3_000_000_000]],
    maximum: [[3_000_000_000], [6_000_000_000]],
    request: [[1_000_000_000], [3_000_000_000]],
    totalCapacity: [6_000_000_000],
  });

  const safeRes = runBankersSafetyAlgorithm(largeSafe);
  assert.equal(safeRes.valid, true);
  assert.equal(safeRes.isSafe, true);
  assert.deepEqual(safeRes.safeSequence, ['P0', 'P1']);
  assert.deepEqual(safeRes.finalWork, [6_000_000_000]);

  // Unsafe huge integer beyond Number.MAX_SAFE_INTEGER is rejected
  const unsafeHuge = makeState({
    available: [1e20, 1],
    totalCapacity: [1e20, 2],
  });
  assert.equal(validateSystemState(unsafeHuge, 'all').valid, false);
  assert.equal(runBankersSafetyAlgorithm(unsafeHuge).valid, false);

  // Sum overflow (each cell safe, but totalAllocated + available exceeds MAX_SAFE_INTEGER)
  const overflowSum = makeState({
    processNames: ['P0', 'P1'],
    resourceNames: ['A'],
    resourceDescriptions: ['A'],
    available: [Number.MAX_SAFE_INTEGER - 10],
    allocation: [[100], [100]],
    maximum: [[200], [200]],
    request: [[0], [0]],
    totalCapacity: [Number.MAX_SAFE_INTEGER],
  });
  assert.equal(validateSystemState(overflowSum, 'all').valid, false);
});

test('Edge Case 10: No eligible process at step 0 halts cleanly in both Banker and Deadlock Detection', () => {
  const stuck = makeState({
    processNames: ['P0', 'P1', 'P2'],
    resourceNames: ['A', 'B'],
    resourceDescriptions: ['A', 'B'],
    available: [0, 0],
    allocation: [
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    maximum: [
      [2, 1],
      [1, 2],
      [2, 2],
    ],
    request: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    totalCapacity: [2, 2],
  });

  const banker = runBankersSafetyAlgorithm(stuck);
  assert.equal(banker.valid, true);
  assert.equal(banker.isSafe, false);
  assert.deepEqual(banker.safeSequence, []);
  assert.deepEqual(banker.unfinishedProcesses, ['P0', 'P1', 'P2']);
  assert.deepEqual(banker.finalWork, [0, 0]);
  assert.equal(banker.steps.length, 2); // init + unsafe

  const dl = runDeadlockDetectionAlgorithm(stuck);
  assert.equal(dl.valid, true);
  assert.equal(dl.hasDeadlock, true);
  assert.deepEqual(dl.deadlockedProcesses, ['P0', 'P1', 'P2']);
  assert.deepEqual(dl.executionSequence, []);
  assert.equal(dl.steps.length, 2); // init + deadlock
});

test('Edge Case 13: Invalid matrix dimensions and ragged arrays are rejected without throwing', () => {
  // Zero processes
  const zeroP = makeState({ processNames: [], allocation: [], maximum: [], request: [] });
  assert.equal(validateSystemState(zeroP, 'all').valid, false);
  assert.equal(runBankersSafetyAlgorithm(zeroP).valid, false);
  assert.equal(runDeadlockDetectionAlgorithm(zeroP).valid, false);

  // Zero resources
  const zeroR = makeState({
    resourceNames: [],
    resourceDescriptions: [],
    available: [],
    totalCapacity: [],
    allocation: [[], []],
    maximum: [[], []],
    request: [[], []],
  });
  assert.equal(validateSystemState(zeroR, 'all').valid, false);

  // Ragged Allocation row (missing column)
  const raggedAlloc = makeState({
    allocation: [[1], [0, 1]],
  });
  assert.equal(validateSystemState(raggedAlloc, 'all').valid, false);
  assert.equal(runBankersSafetyAlgorithm(raggedAlloc).valid, false);
  assert.equal(runDeadlockDetectionAlgorithm(raggedAlloc).valid, false);

  // Extra row in Maximum matrix
  const extraMaxRow = makeState({
    maximum: [
      [2, 1],
      [1, 2],
      [1, 1],
    ],
  });
  assert.equal(validateSystemState(extraMaxRow, 'bankers').valid, false);

  // Mismatched Available vector length
  const wrongAvailLen = makeState({ available: [1, 1, 1] });
  assert.equal(validateSystemState(wrongAvailLen, 'all').valid, false);

  // Mismatched Total Capacity length
  const wrongCapLen = makeState({ totalCapacity: [2] });
  assert.equal(validateSystemState(wrongCapLen, 'all').valid, false);
});

test('Edge Case 14: Total allocation exceeding system capacity is rejected by validation', () => {
  const invalidCap = cloneSystemState(PREDEFINED_SAMPLES[0].state);
  invalidCap.totalCapacity[0] = 5; // Total allocated for A is 7 > 5
  const capRes = validateSystemState(invalidCap, 'all');
  assert.equal(capRes.valid, false);
  assert.ok(capRes.issues.some((i) => i.message.includes('exceeds system capacity')));

  assert.equal(runBankersSafetyAlgorithm(invalidCap).valid, false);
  assert.equal(runDeadlockDetectionAlgorithm(invalidCap).valid, false);
});
