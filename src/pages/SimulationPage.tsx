import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  XOctagon,
  ShieldCheck,
  Radar,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { MatrixTable } from '../components/MatrixTable';
import type { SimulationMode } from '../types/simulator';

export function SimulationPage() {
  const navigate = useNavigate();
  const {
    systemState,
    bankerResult,
    deadlockResult,
    simulationMode,
    setSimulationMode,
  } = useSimulator();

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1400);

  const isBankers = simulationMode === 'bankers';
  const steps = isBankers ? bankerResult.steps : deadlockResult.steps;
  const isValid = isBankers ? bankerResult.valid : deadlockResult.valid;
  const maxStep = Math.max(0, steps.length - 1);

  // Reset step index when mode or dataset changes
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [simulationMode, systemState]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= maxStep) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, maxStep));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, maxStep, speedMs]);

  const currentStep = steps[Math.min(stepIndex, maxStep)];

  const handleModeChange = (mode: SimulationMode) => {
    setSimulationMode(mode);
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handlePlayToggle = () => {
    if (stepIndex >= maxStep) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.min(maxStep, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const sequenceSoFar =
    currentStep && isBankers
      ? 'safeSequenceSoFar' in currentStep
        ? currentStep.safeSequenceSoFar
        : []
      : currentStep && 'completedSequenceSoFar' in currentStep
      ? currentStep.completedSequenceSoFar
      : [];

  const deadlockedNow =
    currentStep && !isBankers && 'deadlockedProcesses' in currentStep
      ? currentStep.deadlockedProcesses
      : [];

  const deadlockedSet = new Set(
    systemState.processNames
      .map((name, idx) => (deadlockedNow.includes(name) ? idx : -1))
      .filter((i) => i >= 0)
  );

  const waitingSet = new Set(
    currentStep
      ? currentStep.checkedProcesses
          .filter((chk) => !chk.satisfied)
          .map((chk) => chk.processIndex)
      : []
  );

  const progressPct = maxStep > 0 ? Math.round((stepIndex / maxStep) * 100) : 100;
  const isFinalStep = stepIndex === maxStep && steps.length > 0;

  return (
    <div className="space-y-6">
      {/* Header + Mode Segmented Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Step-by-Step Simulation Visualizer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect every real algorithm comparison check, process execution, resource release, and
            Work vector update step by step.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Simulation algorithm mode"
          className="inline-flex items-center p-1 rounded-lg bg-slate-200/80 dark:bg-[#0d1a35] border border-slate-200 dark:border-slate-800 shrink-0 self-start md:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isBankers}
            onClick={() => handleModeChange('bankers')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              isBankers
                ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] text-white dark:from-blue-600 dark:to-cyan-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Banker&apos;s Algorithm
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isBankers}
            onClick={() => handleModeChange('deadlock')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              !isBankers
                ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] text-white dark:from-blue-600 dark:to-cyan-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Deadlock Detection
          </button>
        </div>
      </div>

      {!isValid || !currentStep ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/35 p-6 space-y-3 text-sm text-red-800 dark:text-red-200"
        >
          <div className="font-display font-bold">
            Cannot visualize step-by-step execution due to invalid input configuration
          </div>
          <p>
            Resolve the matrix or capacity validation errors first in Resource Allocation or
            Banker&apos;s Algorithm.
          </p>
          <button
            type="button"
            onClick={() => navigate('/resource-allocation')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-800 transition-colors cursor-pointer"
          >
            <span>Open Resource Allocation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Playback Control Bar */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={stepIndex <= 0}
                  aria-label="Previous Step"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                  <span>Previous Step</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap cursor-pointer shadow-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Play Simulation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={stepIndex >= maxStep}
                  aria-label="Next Step"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Next Step</span>
                  <SkipForward className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset playback to Step 0"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>Speed</span>
                  <select
                    aria-label="Simulation playback speed"
                    value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))}
                    className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={2200}>0.5x</option>
                    <option value={1400}>1.0x</option>
                    <option value={1000}>1.5x</option>
                    <option value={650}>2.0x</option>
                  </select>
                </label>

                <div className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  Step {stepIndex} / {maxStep}
                </div>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0b1834] via-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Process Execution Timeline Rail */}
            <div
              aria-label="Process execution timeline"
              className="flex items-center gap-1.5 overflow-x-auto pb-1"
            >
              {steps.map((st, idx) => {
                const active = idx === stepIndex;
                const visited = idx < stepIndex;
                const activeClasses =
                  st.kind === 'deadlock'
                    ? 'border-red-600 bg-red-600 text-white'
                    : st.kind === 'unsafe'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : st.kind === 'complete' || st.kind === 'no-deadlock'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-[#0b1834] bg-gradient-to-r from-[#0b1834] to-[#17336b] text-white dark:border-cyan-500 dark:from-blue-600 dark:to-cyan-600';

                return (
                  <React.Fragment key={st.stepNumber}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setStepIndex(idx);
                      }}
                      aria-current={active ? 'step' : undefined}
                      className={`flex-1 min-w-[82px] rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        active
                          ? activeClasses
                          : visited
                          ? 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/75 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#081226] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#122244]'
                      }`}
                    >
                      <div className="font-mono text-[10px] opacity-85">Step {st.stepNumber}</div>
                      <div className="font-mono text-xs font-bold truncate mt-0.5">
                        {st.processName
                          ? `Run ${st.processName}`
                          : st.kind === 'init'
                          ? 'Init'
                          : st.kind === 'complete'
                          ? 'Safe'
                          : st.kind === 'no-deadlock'
                          ? 'Clear'
                          : st.kind === 'unsafe'
                          ? 'Unsafe'
                          : 'Deadlock'}
                      </div>
                    </button>
                    {idx < steps.length - 1 && (
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 shrink-0 hidden sm:block"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Primary Step Inspection Stage */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div
                  className={`text-xs font-mono font-semibold ${
                    currentStep.kind === 'deadlock'
                      ? 'text-red-700 dark:text-red-400'
                      : currentStep.kind === 'unsafe'
                      ? 'text-amber-700 dark:text-amber-400'
                      : currentStep.kind === 'complete' || currentStep.kind === 'no-deadlock'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-blue-700 dark:text-cyan-400'
                  }`}
                >
                  Step {currentStep.stepNumber} of {maxStep} ·{' '}
                  {currentStep.kind === 'init'
                    ? 'Initialization'
                    : currentStep.kind === 'execute'
                    ? `Process Selected: ${currentStep.processName}`
                    : currentStep.kind === 'complete'
                    ? 'SYSTEM IS IN SAFE STATE'
                    : currentStep.kind === 'no-deadlock'
                    ? 'NO DEADLOCK DETECTED'
                    : currentStep.kind === 'unsafe'
                    ? 'SYSTEM IS IN UNSAFE STATE'
                    : 'DEADLOCK DETECTED'}
                </div>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentStep.explanation}
                </p>
              </div>

              {currentStep.processName && (
                <div className="rounded-xl border border-cyan-300 dark:border-cyan-700 bg-cyan-50/80 dark:bg-cyan-950/50 px-4 py-2.5 text-center shrink-0">
                  <div className="text-[11px] font-medium text-cyan-800 dark:text-cyan-300">
                    Executing Process
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#0b1834] dark:text-white">
                    {currentStep.processName}
                  </div>
                </div>
              )}
            </div>

            {/* Resource Release Visualization (Equation Cards + Per-Resource Growth Bars) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#081226] p-4">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Previous Work
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                    [{currentStep.previousWork.join(', ')}]
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {systemState.resourceNames
                      .map((r, j) => `${r}=${currentStep.previousWork[j]}`)
                      .join(' · ')}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#081226] p-4">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Resources Released{' '}
                    {currentStep.processName ? `(Allocation[${currentStep.processName}])` : ''}
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    + [{currentStep.releasedResources.join(', ')}]
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {currentStep.processName
                      ? `Freed when ${currentStep.processName} finishes`
                      : 'No process released resources in this step'}
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-200 dark:border-cyan-800/80 bg-cyan-50/60 dark:bg-cyan-950/30 p-4">
                  <div className="text-xs font-medium text-cyan-900 dark:text-cyan-300">
                    Current / Updated Work
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold tabular-nums text-[#0b1834] dark:text-white">
                    [{currentStep.updatedWork.join(', ')}]
                  </div>
                  <div className="mt-1 text-xs font-mono text-cyan-800/80 dark:text-cyan-300/80">
                    {systemState.resourceNames
                      .map((r, j) => `${r}=${currentStep.updatedWork[j]}`)
                      .join(' · ')}
                  </div>
                </div>
              </div>

              {/* Per-Resource Visual Release Bars */}
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#081226]/70 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Resource Pool Release Visualization
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Navy: Prior Work · Emerald: Released in Step {currentStep.stepNumber}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {systemState.resourceNames.map((res, j) => {
                    const prevVal = currentStep.previousWork[j] ?? 0;
                    const relVal = currentStep.releasedResources[j] ?? 0;
                    const nextVal = currentStep.updatedWork[j] ?? 0;
                    const maxCap = Math.max(systemState.totalCapacity[j] ?? 0, nextVal, 1);
                    const prevPct = Math.min(100, Math.round((prevVal / maxCap) * 100));
                    const relPct = Math.min(100 - prevPct, Math.round((relVal / maxCap) * 100));

                    return (
                      <div key={`${res}-${j}`} className="space-y-1">
                        <div className="flex items-baseline justify-between font-mono text-xs tabular-nums">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {res}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {prevVal}
                            {relVal > 0 && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                +{relVal}
                              </span>
                            )}{' '}
                            = <strong>{nextVal}</strong>/{maxCap}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden flex">
                          <div
                            className="h-full bg-[#0b1834] dark:bg-blue-500 transition-all duration-300"
                            style={{ width: `${prevPct}%` }}
                          />
                          {relPct > 0 && (
                            <div
                              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                              style={{ width: `${relPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Process Eligibility Checks Performed in This Step */}
            {currentStep.checkedProcesses.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
                  Comparison Checks ({isBankers ? 'Need[i] <= Work' : 'Request[i] <= Work'})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {currentStep.checkedProcesses.map((chk) => {
                    const vec = 'need' in chk ? chk.need : chk.request;
                    return (
                      <div
                        key={chk.processName}
                        className={`rounded-lg border px-3 py-2 text-xs font-mono flex items-center justify-between gap-2 ${
                          chk.satisfied
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/75 dark:bg-emerald-950/35 text-emerald-900 dark:text-emerald-200'
                            : 'border-amber-200/90 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300'
                        }`}
                      >
                        <span className="truncate">
                          <strong>{chk.processName}</strong> [{vec.join(', ')}] ≤ [
                          {currentStep.previousWork.join(', ')}]
                        </span>
                        <span className="font-bold shrink-0">
                          {chk.satisfied ? 'PASS' : 'WAIT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finish Array & Visual Sequence Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
                  Finish Status Array
                </div>
                <div className="flex flex-wrap gap-2">
                  {systemState.processNames.map((proc, idx) => {
                    const done = currentStep.finishSnapshot[idx];
                    const isCurrent = currentStep.processIndex === idx;
                    const isDeadlocked = deadlockedSet.has(idx);
                    return (
                      <div
                        key={proc}
                        className={`rounded-lg border px-3 py-2 text-xs font-mono flex items-center gap-2 transition-colors ${
                          isCurrent
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-950 dark:text-cyan-100 font-bold'
                            : isDeadlocked
                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 font-semibold'
                            : done
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/75 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081226] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{proc}:</span>
                        {done ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>true</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>false</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
                  {deadlockedNow.length > 0
                    ? 'Deadlocked Processes'
                    : isBankers
                    ? 'Safe Sequence Progression'
                    : 'Completed Execution Order'}
                </div>

                {deadlockedNow.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <XOctagon className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    {deadlockedNow.map((proc) => (
                      <span
                        key={proc}
                        className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/45 px-3 py-1.5 font-mono text-sm font-bold text-red-800 dark:text-red-200"
                      >
                        {proc}
                      </span>
                    ))}
                  </div>
                ) : currentStep.kind === 'unsafe' ? (
                  <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Halted after [{sequenceSoFar.join(', ') || 'none'}] — no safe sequence exists.
                    </span>
                  </div>
                ) : sequenceSoFar.length === 0 ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    No processes executed yet. Press Next Step or Play Simulation to begin.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {sequenceSoFar.map((proc, idx) => (
                      <React.Fragment key={`${proc}-${idx}`}>
                        <span className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-200">
                          {proc}
                        </span>
                        {idx < sequenceSoFar.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Final Execution Summary Panel (displayed on final step or quick-jumpable) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Final Execution Summary</span>
                  <span aria-hidden="true">·</span>
                  <span>{isFinalStep ? 'Simulation Complete' : `Viewing Step ${stepIndex} of ${maxStep}`}</span>
                </div>
                <div className="font-display text-base font-bold text-slate-950 dark:text-white">
                  {isBankers
                    ? bankerResult.isSafe
                      ? `Safe State Verified — Sequence <${bankerResult.safeSequence.join(', ')}>`
                      : `Unsafe State — ${bankerResult.unfinishedProcesses.length} Unfinished Process(es)`
                    : deadlockResult.hasDeadlock
                    ? `Deadlock Detected — Blocked: ${deadlockResult.deadlockedProcesses.join(', ')}`
                    : 'No Deadlock Detected — All Processes Clear'}
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  Initial Available [{systemState.available.join(', ')}] → Final Work [
                  {(isBankers ? bankerResult.finalWork : deadlockResult.finalWork).join(', ')}] ·
                  Total Trace Steps: {maxStep}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isFinalStep && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex(maxStep);
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13254a] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Jump to Final Step
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(isBankers ? '/bankers' : '/deadlock-detection')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-2 text-xs font-semibold text-blue-700 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isBankers ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Radar className="h-3.5 w-3.5" />
                  )}
                  <span>Edit Matrices</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Highlighted Matrices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MatrixTable
              title="Allocation Matrix"
              subtitle="Cyan row: executing · Amber: waiting · Emerald: finished"
              processNames={systemState.processNames}
              resourceNames={systemState.resourceNames}
              matrix={systemState.allocation}
              highlightedRow={currentStep.processIndex}
              finishedRows={currentStep.finishSnapshot}
              waitingRows={waitingSet}
              deadlockedRows={deadlockedSet}
              compact
            />

            <MatrixTable
              title={isBankers ? 'Need Matrix' : 'Current Request Matrix'}
              subtitle="Compared against Previous Work at each step"
              processNames={systemState.processNames}
              resourceNames={systemState.resourceNames}
              matrix={isBankers ? bankerResult.need : systemState.request}
              highlightedRow={currentStep.processIndex}
              finishedRows={currentStep.finishSnapshot}
              waitingRows={waitingSet}
              deadlockedRows={deadlockedSet}
              compact
            />
          </div>
        </>
      )}
    </div>
  );
}
