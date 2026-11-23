import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  BankerResult,
  DeadlockResult,
  LastSimulationSummary,
  SampleScenario,
  SimulationMode,
  SystemState,
} from '../types/simulator';
import { cloneSystemState, DEFAULT_SYSTEM_STATE, PREDEFINED_SAMPLES } from '../data/samples';
import { evaluateResourceRequest, runBankersSafetyAlgorithm } from '../algorithms/bankers';
import { runDeadlockDetectionAlgorithm } from '../algorithms/deadlock';
import { computeTotalAllocated, isValidNonNegativeInt } from '../algorithms/validation';

const STORAGE_KEYS = {
  theme: 'os-sim-theme-v1',
  customSamples: 'os-sim-custom-samples-v1',
  lastSummary: 'os-sim-last-summary-v1',
};

interface SimulatorContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  systemState: SystemState;
  activeScenarioName: string;
  setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;
  updateCell: (
    matrix: 'allocation' | 'maximum' | 'request',
    processIndex: number,
    resourceIndex: number,
    value: number
  ) => void;
  updateAvailable: (resourceIndex: number, value: number) => void;
  updateTotalCapacity: (resourceIndex: number, value: number) => void;
  updateResourceDescription: (resourceIndex: number, description: string) => void;
  resizeSystem: (processCount: number, resourceCount: number) => void;
  addProcess: () => void;
  removeProcess: (processIndex: number) => void;
  addResourceType: () => void;
  removeResourceType: (resourceIndex: number) => void;
  loadScenario: (scenario: SampleScenario) => void;
  resetSimulation: () => void;
  applyResourceRequest: (processIndex: number, requestVector: number[]) => boolean;
  bankerResult: BankerResult;
  deadlockResult: DeadlockResult;
  lastSummary: LastSimulationSummary;
  recordSimulationRun: (mode: SimulationMode) => void;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  customScenarios: SampleScenario[];
  saveCustomScenario: (name: string, description: string, recommendedMode: SimulationMode) => SampleScenario;
  deleteCustomScenario: (id: string) => void;
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

function makeResourceLabel(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < alphabet.length) return alphabet[index];
  return `R${index + 1}`;
}

function buildSummaryFromResults(
  mode: SimulationMode,
  scenarioName: string,
  banker: BankerResult,
  deadlock: DeadlockResult
): LastSimulationSummary {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (mode === 'bankers') {
    if (!banker.valid) {
      return {
        mode: 'bankers',
        timestamp,
        scenarioName,
        status: 'unsafe',
        headline: 'Validation Required',
        detail: banker.validationIssues[0]?.message ?? 'Invalid matrix input.',
      };
    }
    return banker.isSafe
      ? {
          mode: 'bankers',
          timestamp,
          scenarioName,
          status: 'safe',
          headline: 'SYSTEM IS IN SAFE STATE',
          detail: `Safe sequence: <${banker.safeSequence.join(', ')}>`,
        }
      : {
          mode: 'bankers',
          timestamp,
          scenarioName,
          status: 'unsafe',
          headline: 'SYSTEM IS IN UNSAFE STATE',
          detail: `Unfinished processes: ${banker.unfinishedProcesses.join(', ')}`,
        };
  }

  if (!deadlock.valid) {
    return {
      mode: 'deadlock',
      timestamp,
      scenarioName,
      status: 'deadlock',
      headline: 'Validation Required',
      detail: deadlock.validationIssues[0]?.message ?? 'Invalid matrix input.',
    };
  }
  return deadlock.hasDeadlock
    ? {
        mode: 'deadlock',
        timestamp,
        scenarioName,
        status: 'deadlock',
        headline: 'DEADLOCK DETECTED',
        detail: `Deadlocked processes: ${deadlock.deadlockedProcesses.join(', ')}`,
      }
    : {
        mode: 'deadlock',
        timestamp,
        scenarioName,
        status: 'no-deadlock',
        headline: 'NO DEADLOCK DETECTED',
        detail: `Completion order: <${deadlock.executionSequence.join(', ')}>`,
      };
}

function isValidMatrixShape(matrix: unknown, rows: number, cols: number): matrix is number[][] {
  return (
    Array.isArray(matrix) &&
    matrix.length === rows &&
    matrix.every(
      (row) =>
        Array.isArray(row) &&
        row.length === cols &&
        row.every((cell) => typeof cell === 'number' && Number.isFinite(cell))
    )
  );
}

function isValidNumberVector(vec: unknown, length: number): vec is number[] {
  return (
    Array.isArray(vec) &&
    vec.length === length &&
    vec.every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}

function isValidStoredScenario(item: unknown): item is SampleScenario {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.subtitle !== 'string' ||
    typeof candidate.description !== 'string' ||
    typeof candidate.expectedOutcome !== 'string' ||
    (candidate.recommendedMode !== 'bankers' && candidate.recommendedMode !== 'deadlock') ||
    !candidate.state ||
    typeof candidate.state !== 'object'
  ) {
    return false;
  }

  const state = candidate.state as Record<string, unknown>;
  if (
    !Array.isArray(state.processNames) ||
    !Array.isArray(state.resourceNames) ||
    !Array.isArray(state.resourceDescriptions)
  ) {
    return false;
  }

  const pCount = state.processNames.length;
  const rCount = state.resourceNames.length;
  if (pCount < 1 || rCount < 1) return false;
  if (
    !state.processNames.every((p) => typeof p === 'string') ||
    !state.resourceNames.every((r) => typeof r === 'string') ||
    state.resourceDescriptions.length !== rCount ||
    !state.resourceDescriptions.every((d) => typeof d === 'string')
  ) {
    return false;
  }

  return (
    isValidNumberVector(state.available, rCount) &&
    isValidNumberVector(state.totalCapacity, rCount) &&
    isValidMatrixShape(state.allocation, pCount, rCount) &&
    isValidMatrixShape(state.maximum, pCount, rCount) &&
    isValidMatrixShape(state.request, pCount, rCount)
  );
}

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  const [systemState, setSystemState] = useState<SystemState>(() =>
    cloneSystemState(DEFAULT_SYSTEM_STATE)
  );
  const [activeScenarioName, setActiveScenarioName] = useState<string>(PREDEFINED_SAMPLES[0].name);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('bankers');

  const [customScenarios, setCustomScenarios] = useState<SampleScenario[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.customSamples);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(isValidStoredScenario);
        }
      }
    } catch {
      // ignore parse errors
    }
    return [];
  });

  const bankerResult = useMemo(() => runBankersSafetyAlgorithm(systemState), [systemState]);
  const deadlockResult = useMemo(() => runDeadlockDetectionAlgorithm(systemState), [systemState]);

  const [lastRunTimestamp, setLastRunTimestamp] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const lastSummary = useMemo<LastSimulationSummary>(() => {
    const built = buildSummaryFromResults(
      simulationMode,
      activeScenarioName,
      bankerResult,
      deadlockResult
    );
    return { ...built, timestamp: lastRunTimestamp };
  }, [simulationMode, activeScenarioName, bankerResult, deadlockResult, lastRunTimestamp]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.customSamples, JSON.stringify(customScenarios));
    } catch {
      // ignore
    }
  }, [customScenarios]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const touchTimestamp = () => {
    setLastRunTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const recordSimulationRun = (mode: SimulationMode) => {
    setSimulationMode(mode);
    touchTimestamp();
  };

  const updateCell = (
    matrix: 'allocation' | 'maximum' | 'request',
    processIndex: number,
    resourceIndex: number,
    value: number
  ) => {
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const next = cloneSystemState(prev);
      next[matrix][processIndex][resourceIndex] = value;

      if (matrix === 'allocation' && isValidNonNegativeInt(value)) {
        const totals = computeTotalAllocated(next.allocation, next.resourceNames.length);
        const cap = next.totalCapacity[resourceIndex];
        if (isValidNonNegativeInt(cap) && Number.isSafeInteger(totals[resourceIndex])) {
          const remaining = cap - totals[resourceIndex];
          next.available[resourceIndex] = remaining >= 0 ? remaining : 0;
        }
      }
      return next;
    });
  };

  const updateAvailable = (resourceIndex: number, value: number) => {
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const next = cloneSystemState(prev);
      next.available[resourceIndex] = value;
      const totals = computeTotalAllocated(next.allocation, next.resourceNames.length);
      if (isValidNonNegativeInt(value) && Number.isSafeInteger(totals[resourceIndex] + value)) {
        next.totalCapacity[resourceIndex] = totals[resourceIndex] + value;
      }
      return next;
    });
  };

  const updateTotalCapacity = (resourceIndex: number, value: number) => {
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const next = cloneSystemState(prev);
      next.totalCapacity[resourceIndex] = value;
      const totals = computeTotalAllocated(next.allocation, next.resourceNames.length);
      if (isValidNonNegativeInt(value) && value >= totals[resourceIndex]) {
        next.available[resourceIndex] = value - totals[resourceIndex];
      }
      return next;
    });
  };

  const applyResourceRequest = (processIndex: number, requestVector: number[]): boolean => {
    const check = evaluateResourceRequest(systemState, processIndex, requestVector);
    if (!check.granted) return false;

    setActiveScenarioName('Custom Configuration');
    setSimulationMode('bankers');
    touchTimestamp();
    setSystemState((prev) => {
      const next = cloneSystemState(prev);
      for (let j = 0; j < next.resourceNames.length; j++) {
        next.allocation[processIndex][j] += requestVector[j];
        next.available[j] -= requestVector[j];
      }
      return next;
    });
    return true;
  };

  const updateResourceDescription = (resourceIndex: number, description: string) => {
    setSystemState((prev) => {
      const next = cloneSystemState(prev);
      next.resourceDescriptions[resourceIndex] = description;
      return next;
    });
  };

  const resizeSystem = (processCount: number, resourceCount: number) => {
    const pClamped = Math.max(1, Math.min(10, Math.floor(processCount)));
    const rClamped = Math.max(1, Math.min(8, Math.floor(resourceCount)));
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const processNames = Array.from({ length: pClamped }, (_, i) => `P${i}`);
      const resourceNames = Array.from({ length: rClamped }, (_, j) => makeResourceLabel(j));
      const resourceDescriptions = Array.from(
        { length: rClamped },
        (_, j) => prev.resourceDescriptions[j] ?? `Device ${makeResourceLabel(j)}`
      );

      const resizeMatrix = (mat: number[][]) =>
        Array.from({ length: pClamped }, (_, i) =>
          Array.from({ length: rClamped }, (_, j) => mat[i]?.[j] ?? 0)
        );

      const allocation = resizeMatrix(prev.allocation);
      const maximum = resizeMatrix(prev.maximum).map((row, i) =>
        row.map((val, j) => Math.max(val, allocation[i][j]))
      );
      const request = resizeMatrix(prev.request);
      const available = Array.from({ length: rClamped }, (_, j) => prev.available[j] ?? 2);
      const totals = computeTotalAllocated(allocation, rClamped);
      const totalCapacity = totals.map((t, j) => t + available[j]);

      return {
        processNames,
        resourceNames,
        resourceDescriptions,
        allocation,
        maximum,
        request,
        available,
        totalCapacity,
      };
    });
  };

  const addProcess = () => {
    resizeSystem(systemState.processNames.length + 1, systemState.resourceNames.length);
  };

  const removeProcess = (processIndex: number) => {
    if (systemState.processNames.length <= 1) return;
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const allocation = prev.allocation.filter((_, idx) => idx !== processIndex);
      const maximum = prev.maximum.filter((_, idx) => idx !== processIndex);
      const request = prev.request.filter((_, idx) => idx !== processIndex);
      const processNames = Array.from({ length: allocation.length }, (_, i) => `P${i}`);
      const totals = computeTotalAllocated(allocation, prev.resourceNames.length);
      const available = prev.totalCapacity.map((cap, j) => Math.max(0, cap - totals[j]));
      return {
        ...cloneSystemState(prev),
        processNames,
        allocation,
        maximum,
        request,
        available,
      };
    });
  };

  const addResourceType = () => {
    resizeSystem(systemState.processNames.length, systemState.resourceNames.length + 1);
  };

  const removeResourceType = (resourceIndex: number) => {
    if (systemState.resourceNames.length <= 1) return;
    setActiveScenarioName('Custom Configuration');
    touchTimestamp();
    setSystemState((prev) => {
      const keep = <T,>(arr: T[]) => arr.filter((_, idx) => idx !== resourceIndex);
      const rCount = prev.resourceNames.length - 1;
      return {
        processNames: [...prev.processNames],
        resourceNames: Array.from({ length: rCount }, (_, j) => makeResourceLabel(j)),
        resourceDescriptions: keep(prev.resourceDescriptions),
        allocation: prev.allocation.map(keep),
        maximum: prev.maximum.map(keep),
        request: prev.request.map(keep),
        available: keep(prev.available),
        totalCapacity: keep(prev.totalCapacity),
      };
    });
  };

  const loadScenario = (scenario: SampleScenario) => {
    const cloned = cloneSystemState(scenario.state);
    setSystemState(cloned);
    setActiveScenarioName(scenario.name);
    setSimulationMode(scenario.recommendedMode);
    touchTimestamp();
  };

  const resetSimulation = () => {
    loadScenario(PREDEFINED_SAMPLES[0]);
  };

  const saveCustomScenario = (
    name: string,
    description: string,
    recommendedMode: SimulationMode
  ): SampleScenario => {
    const bRes = runBankersSafetyAlgorithm(systemState);
    const dRes = runDeadlockDetectionAlgorithm(systemState);
    const expectedOutcome =
      recommendedMode === 'bankers'
        ? !bRes.valid
          ? 'INVALID INPUT — Requires matrix correction'
          : bRes.isSafe
          ? `SYSTEM IS IN SAFE STATE — Safe Sequence: <${bRes.safeSequence.join(', ')}>`
          : 'SYSTEM IS IN UNSAFE STATE'
        : !dRes.valid
        ? 'INVALID INPUT — Requires matrix correction'
        : dRes.hasDeadlock
        ? `DEADLOCK DETECTED — Deadlocked Processes: ${dRes.deadlockedProcesses.join(', ')}`
        : 'NO DEADLOCK DETECTED';

    const scenario: SampleScenario = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      subtitle: `${systemState.processNames.length} Processes · ${systemState.resourceNames.length} Resource Types · Saved Locally`,
      category: 'custom',
      recommendedMode,
      description:
        description.trim() ||
        'User-created custom allocation snapshot saved locally in this browser.',
      expectedOutcome,
      state: cloneSystemState(systemState),
      isCustom: true,
      createdAt: new Date().toLocaleDateString(),
    };

    setCustomScenarios((prev) => [scenario, ...prev]);
    setActiveScenarioName(scenario.name);
    return scenario;
  };

  const deleteCustomScenario = (id: string) => {
    setCustomScenarios((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SimulatorContext.Provider
      value={{
        theme,
        toggleTheme,
        systemState,
        activeScenarioName,
        setSystemState,
        updateCell,
        updateAvailable,
        updateTotalCapacity,
        updateResourceDescription,
        resizeSystem,
        addProcess,
        removeProcess,
        addResourceType,
        removeResourceType,
        loadScenario,
        resetSimulation,
        applyResourceRequest,
        bankerResult,
        deadlockResult,
        lastSummary,
        recordSimulationRun,
        simulationMode,
        setSimulationMode,
        customScenarios,
        saveCustomScenario,
        deleteCustomScenario,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimulatorContextValue {
  const ctx = useContext(SimulatorContext);
  if (!ctx) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return ctx;
}
