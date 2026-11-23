import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Radar,
  FolderKanban,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  PlaySquare,
  Cpu,
  Layers,
  Database,
  Gauge,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { computeTotalAllocated } from '../algorithms/validation';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    systemState,
    activeScenarioName,
    bankerResult,
    deadlockResult,
    lastSummary,
    recordSimulationRun,
    resetSimulation,
    setSimulationMode,
  } = useSimulator();

  const totalAllocatedByResource = computeTotalAllocated(
    systemState.allocation,
    systemState.resourceNames.length
  );
  const totalAllocatedSum = totalAllocatedByResource.reduce((acc, v) => acc + v, 0);
  const totalAvailableSum = systemState.available.reduce((acc, v) => acc + v, 0);
  const totalCapacitySum = systemState.totalCapacity.reduce((acc, v) => acc + v, 0);
  const overallUtilization =
    totalCapacitySum > 0 ? Math.min(100, Math.round((totalAllocatedSum / totalCapacitySum) * 100)) : 0;

  const safetyStatus = !bankerResult.valid
    ? {
        label: 'Invalid Configuration',
        subtext: bankerResult.validationIssues[0]?.message ?? 'Fix matrix inputs',
        tone: 'text-red-700 dark:text-red-400',
        surface: 'bg-red-100/80 dark:bg-red-950/60',
        Icon: XOctagon,
      }
    : bankerResult.isSafe
    ? {
        label: 'Safe State',
        subtext: `Sequence: <${bankerResult.safeSequence.join(', ')}>`,
        tone: 'text-emerald-700 dark:text-emerald-400',
        surface: 'bg-emerald-100/80 dark:bg-emerald-950/60',
        Icon: CheckCircle2,
      }
    : {
        label: 'Unsafe State',
        subtext: `${bankerResult.unfinishedProcesses.length} process(es) cannot finish safely`,
        tone: 'text-amber-700 dark:text-amber-400',
        surface: 'bg-amber-100/80 dark:bg-amber-950/60',
        Icon: AlertTriangle,
      };

  const handleStartBankers = () => {
    recordSimulationRun('bankers');
    navigate('/bankers');
  };

  const handleDetectDeadlock = () => {
    recordSimulationRun('deadlock');
    navigate('/deadlock-detection');
  };

  const handleOpenStepByStep = () => {
    setSimulationMode('bankers');
    navigate('/simulation');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header Banner */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-[#08132a] via-[#0e2249] to-[#133369] text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="text-xs font-medium text-cyan-200/95 flex flex-wrap items-center gap-2">
              <span>Operating System Laboratory Simulator</span>
              <span aria-hidden="true">·</span>
              <span>B.Tech CSE Group 9</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              Deadlock Detection and Banker&apos;s Algorithm Simulator
            </h1>
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
              Analyze multi-process resource allocation, verify safe execution sequences with
              Banker&apos;s Safety Algorithm, detect active deadlocks, and trace every Work and
              Finish state update step by step.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleStartBankers}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1834] hover:bg-cyan-50 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <span>Start Banker&apos;s Algorithm</span>
            </button>
            <button
              type="button"
              onClick={handleDetectDeadlock}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Radar className="h-4 w-4 text-cyan-300" />
              <span>Detect Deadlock</span>
            </button>
          </div>
        </div>
      </section>

      {/* Primary KPI Grid */}
      <section aria-label="System metrics overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Processes
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-950 dark:text-white">
                {systemState.processNames.length}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {systemState.processNames[0]}–
                {systemState.processNames[systemState.processNames.length - 1]}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Active processes competing in lab
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Resource Types
              </span>
              <div className="h-8 w-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-950 dark:text-white">
                {systemState.resourceNames.length}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {systemState.resourceNames.join(', ')}
              </span>
            </div>
            <div
              className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate"
              title={systemState.resourceDescriptions.join(' · ')}
            >
              {systemState.resourceDescriptions.join(' · ')}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Allocated Resources
              </span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Database className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-950 dark:text-white">
                {totalAllocatedSum}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                of {totalCapacitySum} units ({overallUtilization}%)
              </span>
            </div>
            <div className="mt-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
              Vector: [{totalAllocatedByResource.join(', ')}]
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Available Resources
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Gauge className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-950 dark:text-white">
                {totalAvailableSum}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Free units
              </span>
            </div>
            <div className="mt-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
              Vector: [{systemState.available.join(', ')}]
            </div>
          </div>
        </div>
      </section>

      {/* Safety Status + Last Simulation Result */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              System Safety Status (Live Banker&apos;s Check)
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${safetyStatus.surface} ${safetyStatus.tone}`}
              >
                <safetyStatus.Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className={`font-display text-xl font-bold ${safetyStatus.tone}`}>
                  {safetyStatus.label}
                </h2>
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-words">
                  {safetyStatus.subtext}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>
              Deadlock Detection:{' '}
              <span
                className={`font-semibold ${
                  !deadlockResult.valid || deadlockResult.hasDeadlock
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {!deadlockResult.valid
                  ? 'Invalid Configuration'
                  : deadlockResult.hasDeadlock
                  ? `${deadlockResult.deadlockedProcesses.length} Deadlocked (${deadlockResult.deadlockedProcesses.join(', ')})`
                  : 'No Active Deadlock'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenStepByStep}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 dark:text-cyan-400 hover:underline whitespace-nowrap cursor-pointer"
            >
              <PlaySquare className="h-3.5 w-3.5" />
              <span>Trace Step-by-Step</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Last Simulation Result</span>
              <span className="font-mono tabular-nums">{lastSummary.timestamp}</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  lastSummary.status === 'safe' || lastSummary.status === 'no-deadlock'
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : lastSummary.status === 'unsafe'
                    ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    : 'bg-red-100/80 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                }`}
              >
                {lastSummary.status === 'safe' || lastSummary.status === 'no-deadlock' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : lastSummary.status === 'unsafe' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <XOctagon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h2
                  className={`font-display text-xl font-bold ${
                    lastSummary.status === 'safe' || lastSummary.status === 'no-deadlock'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : lastSummary.status === 'unsafe'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {lastSummary.headline}
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                  {lastSummary.detail}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Mode:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {lastSummary.mode === 'bankers' ? "Banker's Safety" : 'Deadlock Detection'}
              </strong>
            </span>
            <span className="truncate max-w-xs" title={activeScenarioName}>
              Dataset: {activeScenarioName}
            </span>
          </div>
        </div>
      </section>

      {/* Resource Allocation Utilization + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
                Resource Pool Utilization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Allocated versus free capacity across each configured laboratory device
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/resource-allocation')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-cyan-400 hover:underline whitespace-nowrap cursor-pointer"
            >
              <span>Edit Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {totalCapacitySum === 0 && totalAllocatedSum === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#091329] p-8 text-center space-y-3">
              <div className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                No resource instances allocated yet
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Configure resource capacities in Resource Allocation or load a verified textbook
                sample to visualize utilization.
              </p>
              <button
                type="button"
                onClick={() => navigate('/samples')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1834] dark:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#142a58] dark:hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                <span>Browse Sample Problems</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {systemState.resourceNames.map((res, j) => {
                const allocated = totalAllocatedByResource[j] ?? 0;
                const avail = systemState.available[j] ?? 0;
                const capacity = systemState.totalCapacity[j] ?? allocated + avail;
                const safeDenom = Math.max(capacity, allocated, 1);
                const pct = Math.min(100, Math.round((allocated / safeDenom) * 100));
                const isOverCap = allocated > capacity;

                return (
                  <div key={`${res}-${j}`} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          Resource {res}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {systemState.resourceDescriptions[j] ?? ''}
                        </span>
                      </div>
                      <div
                        className={`font-mono text-xs tabular-nums ${
                          isOverCap
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {allocated} allocated · {avail} free · {capacity} total ({pct}%)
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/90 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverCap || pct >= 95
                            ? 'bg-red-600 dark:bg-red-500'
                            : pct >= 75
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : 'bg-gradient-to-r from-[#0b1834] to-blue-600 dark:from-blue-500 dark:to-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      {!isOverCap && avail > 0 && pct < 100 && (
                        <div
                          className="h-full bg-cyan-200/80 dark:bg-cyan-900/50 transition-all duration-300"
                          style={{ width: `${Math.max(0, 100 - pct)}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Aggregate utilization:{' '}
                  <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {overallUtilization}%
                  </strong>{' '}
                  ({totalAllocatedSum} of {totalCapacitySum} instances in use)
                </span>
                <span className="font-mono tabular-nums">
                  {totalAvailableSum} free across {systemState.resourceNames.length} pools
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick-Access Actions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Quick Actions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
              Jump directly to a simulation module or reset the workspace
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleStartBankers}
                className="w-full flex items-center justify-between gap-3 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Start Banker&apos;s Algorithm</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDetectDeadlock}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#091329] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#11244b] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Radar className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
                  <span>Detect Deadlock</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/samples')}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#091329] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#11244b] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FolderKanban className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
                  <span>Load Sample Data</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={resetSimulation}
                title="Restore default Example 1 dataset"
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <RotateCcw className="h-4 w-4 text-slate-500" />
                  <span>Reset Simulation</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
