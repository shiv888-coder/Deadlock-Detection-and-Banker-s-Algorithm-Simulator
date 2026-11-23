import type { SampleScenario, SystemState } from '../types/simulator';

export function cloneSystemState(state: SystemState): SystemState {
  return {
    processNames: [...state.processNames],
    resourceNames: [...state.resourceNames],
    resourceDescriptions: [...state.resourceDescriptions],
    allocation: state.allocation.map((row) => [...row]),
    maximum: state.maximum.map((row) => [...row]),
    request: state.request.map((row) => [...row]),
    available: [...state.available],
    totalCapacity: [...state.totalCapacity],
  };
}

export const PREDEFINED_SAMPLES: SampleScenario[] = [
  {
    id: 'sample-safe-classic',
    name: 'Example 1: Safe Computing Lab System',
    subtitle: '5 Processes · 3 Resource Types (Printers, Memory Units, Plotters)',
    category: 'safe',
    recommendedMode: 'bankers',
    description:
      'Classic 5-process operating system allocation snapshot (P0–P4) competing for 3 resource types A, B, and C with Available = [3, 3, 2]. Every process can finish in a valid safe sequence.',
    expectedOutcome: 'SYSTEM IS IN SAFE STATE — Safe Sequence: <P1, P3, P4, P0, P2>',
    state: {
      processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
      resourceNames: ['A', 'B', 'C'],
      resourceDescriptions: ['Printers', 'Memory Units', 'Plotters'],
      available: [3, 3, 2],
      totalCapacity: [10, 5, 7],
      allocation: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2],
      ],
      maximum: [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3],
      ],
      request: [
        [0, 0, 0],
        [1, 0, 2],
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    },
  },
  {
    id: 'sample-unsafe-bankers',
    name: 'Example 2: Unsafe System State (No Safe Sequence)',
    subtitle: '4 Processes · 3 Resource Types · Unsafe but Not Deadlocked',
    category: 'unsafe',
    recommendedMode: 'bankers',
    description:
      'Demonstrates an unsafe state in Banker’s Algorithm where P1 can execute and release resources to reach Work = [2, 1, 2], yet none of P0, P2, or P3 can satisfy their maximum Need vectors. Note that current Requests are small, so Deadlock Detection shows no immediate deadlock — illustrating why Unsafe != Deadlock.',
    expectedOutcome: 'SYSTEM IS IN UNSAFE STATE — P0, P2, P3 cannot finish safely',
    state: {
      processNames: ['P0', 'P1', 'P2', 'P3'],
      resourceNames: ['A', 'B', 'C'],
      resourceDescriptions: ['Printers', 'Memory Units', 'Tape Drives'],
      available: [1, 1, 0],
      totalCapacity: [6, 5, 4],
      allocation: [
        [2, 1, 1],
        [1, 0, 2],
        [2, 2, 0],
        [0, 1, 1],
      ],
      maximum: [
        [5, 3, 2],
        [2, 1, 2],
        [4, 4, 3],
        [3, 3, 3],
      ],
      request: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    },
  },
  {
    id: 'sample-deadlock-detected',
    name: 'Example 3: Active Deadlock Detection Scenario',
    subtitle: '5 Processes · 3 Resource Types · 4 Deadlocked Processes',
    category: 'deadlock',
    recommendedMode: 'deadlock',
    description:
      'All resource instances are currently allocated (Available = [0, 0, 0]). Process P0 has zero pending requests and completes, releasing [0, 1, 0]. However, P1, P2, P3, and P4 remain permanently blocked waiting for resources A and C held by one another.',
    expectedOutcome: 'DEADLOCK DETECTED — Deadlocked Processes: P1, P2, P3, P4',
    state: {
      processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
      resourceNames: ['A', 'B', 'C'],
      resourceDescriptions: ['Printers', 'Memory Units', 'Network Slots'],
      available: [0, 0, 0],
      totalCapacity: [7, 2, 6],
      allocation: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 3],
        [2, 1, 1],
        [0, 0, 2],
      ],
      maximum: [
        [0, 1, 0],
        [4, 0, 2],
        [3, 0, 4],
        [3, 1, 1],
        [0, 0, 4],
      ],
      request: [
        [0, 0, 0],
        [2, 0, 2],
        [0, 0, 1],
        [1, 0, 0],
        [0, 0, 2],
      ],
    },
  },
  {
    id: 'sample-lab-four-resource',
    name: 'Example 4: Computing Lab 4-Resource Allocation',
    subtitle: '4 Processes · 4 Resource Types (Printers, Memory, Scanners, Plotters)',
    category: 'safe',
    recommendedMode: 'bankers',
    description:
      'A 4-resource computing laboratory scenario showcasing multi-device allocation where P0 already holds its full maximum claim (Need = [0, 0, 0, 0]) and immediately unlocks resources for P2, P3, and P1.',
    expectedOutcome: 'SYSTEM IS IN SAFE STATE — Safe Sequence: <P0, P2, P3, P1>',
    state: {
      processNames: ['P0', 'P1', 'P2', 'P3'],
      resourceNames: ['A', 'B', 'C', 'D'],
      resourceDescriptions: ['Printers', 'Memory Units', 'Scanners', 'Plotters'],
      available: [1, 5, 2, 0],
      totalCapacity: [3, 14, 11, 8],
      allocation: [
        [0, 0, 1, 2],
        [1, 0, 0, 0],
        [1, 3, 5, 4],
        [0, 6, 3, 2],
      ],
      maximum: [
        [0, 0, 1, 2],
        [1, 7, 5, 0],
        [2, 3, 5, 6],
        [0, 6, 5, 2],
      ],
      request: [
        [0, 0, 0, 0],
        [0, 2, 1, 0],
        [1, 0, 0, 1],
        [0, 0, 2, 0],
      ],
    },
  },
];

export const DEFAULT_SYSTEM_STATE: SystemState = cloneSystemState(PREDEFINED_SAMPLES[0].state);
