import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  PlaySquare,
  RotateCcw,
  CheckCircle2,
  XOctagon,
  AlertCircle,
  Scale,
  Clock,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { MatrixTable } from '../components/MatrixTable';
import { VectorDisplay } from '../components/VectorDisplay';
import { StatusBanner } from '../components/StatusBanner';

export function DeadlockDetectionPage() {
  const navigate = useNavigate();
  const {
    systemState,
    updateCell,
    updateAvailable,
    resizeSystem,
    deadlockResult,
    bankerResult,
    recordSimulationRun,
    resetSimulation,
    setSimulationMode,
  } = useSimulator();

  const [selectedProcessIdx, setSelectedProcessIdx] = useState(0);

  useEffect(() => {
    if (selectedProcessIdx >= systemState.processNames.length) {
      setSelectedProcessIdx(0);
    }
  }, [systemState.processNames.length, selectedProcessIdx]);

  const handleRunDetection = () => {
    recordSimulationRun('deadlock');
  };

  const handleOpenStepByStep = () => {
    recordSimulationRun('deadlock');
    setSimulationMode('deadlock');
    navigate('/simulation');
  };

  const deadlockedIndices = new Set(
    deadlockResult.valid
      ? systemState.processNames
          .map((name, idx) => (deadlockResult.deadlockedProcesses.includes(name) ? idx : -1))
          .filter((idx) => idx >= 0)
      : []
  );

  // Processes that waited during earlier rounds before eventually completing
  const waitingThenFinished = new Set<number>();
  if (deadlockResult.valid) {
    for (const step of deadlockResult.steps) {
      for (const chk of step.checkedProcesses) {
        if (!chk.satisfied && deadlockResult.finish[chk.processIndex]) {
          waitingThenFinished.add(chk.processIndex);
        }
      }
    }
  }

  const availErrors = new Set(
    deadlockResult.validationIssues
      .filter((i) => i.field === 'available' || i.field === 'capacity')
      .map((i) => i.resourceIndex ?? -1)
  );

  const completedCount = deadlockResult.valid
    ? deadlockResult.finish.filter(Boolean).length
    : 0;
  const deadlockedCount = deadlockResult.valid
    ? deadlockResult.deadlockedProcesses.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Deadlock Detection Algorithm
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect current Allocation and pending Request matrices against Available resources to
            identify actively deadlocked processes.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRunDetection}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Radar className="h-4 w-4" />
            <span>Run Deadlock Detection</span>
          </button>
          <button
            type="button"
            onClick={handleOpenStepByStep}
            disabled={!deadlockResult.valid}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a35] px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlaySquare className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
            <span>Step-by-Step View</span>
          </button>
          <button
            type="button"
            onClick={resetSimulation}
            title="Restore Example 1 default matrices"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Dimension Selector & State Legend */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Processes</span>
            <select
              aria-label="Number of processes"
              value={systemState.processNames.length}
              onChange={(e) => resizeSystem(Number(e.target.value), systemState.resourceNames.length)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Resource Types</span>
            <select
              aria-label="Number of resource types"
              value={systemState.resourceNames.length}
              onChange={(e) => resizeSystem(systemState.processNames.length, Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Visual Indicator Summary (Completed / Waited / Deadlocked / Invalid) */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {!deadlockResult.valid ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Invalid Configuration</span>
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed: {completedCount}</span>
              </span>
              {waitingThenFinished.size > 0 && (
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Waited then Cleared: {waitingThenFinished.size}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-medium">
                <XOctagon className="h-3.5 w-3.5" />
                <span>Deadlocked: {deadlockedCount}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Validation or Detection Outcome */}
      {!deadlockResult.valid ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/35 p-5 space-y-2 shadow-xs"
        >
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-display font-bold text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Invalid Configuration — Input Validation Errors ({deadlockResult.validationIssues.length})
            </span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-200 space-y-1">
            {deadlockResult.validationIssues.map((issue) => (
              <li key={issue.id}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <StatusBanner
          variant={deadlockResult.hasDeadlock ? 'deadlock' : 'no-deadlock'}
          title={
            deadlockResult.hasDeadlock
              ? `DEADLOCK DETECTED (${deadlockResult.deadlockedProcesses.length} Processes Blocked)`
              : 'NO DEADLOCK DETECTED'
          }
          description={
            deadlockResult.hasDeadlock
              ? `Processes ${deadlockResult.deadlockedProcesses.join(', ')} remain with Finish[i] = false because their current Request vectors exceed Work = [${deadlockResult.finalWork.join(', ')}].`
              : `Every process can satisfy its current Request vector using Work resources. Final Work vector: [${deadlockResult.finalWork.join(', ')}].`
          }
          sequence={
            deadlockResult.hasDeadlock
              ? deadlockResult.deadlockedProcesses
              : deadlockResult.executionSequence
          }
          sequenceLabel={
            deadlockResult.hasDeadlock
              ? 'Actively Deadlocked Processes (Finish[i] = false)'
              : 'Verified Non-Blocking Completion Order'
          }
        />
      )}

      {/* Unsafe State vs Active Deadlock Distinction Panel */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Scale className="h-4 w-4" />
          </div>
          <div className="space-y-1.5 text-sm">
            <h2 className="font-display font-bold text-slate-950 dark:text-white">
              Unsafe State vs. Actual Deadlock (Live Comparison for Current Data)
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Banker&apos;s Algorithm evaluates <strong>worst-case future Maximum claims</strong>{' '}
              (currently:{' '}
              <strong
                className={
                  !bankerResult.valid
                    ? 'text-red-700 dark:text-red-400'
                    : bankerResult.isSafe
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }
              >
                {bankerResult.valid
                  ? bankerResult.isSafe
                    ? 'SAFE STATE'
                    : 'UNSAFE STATE'
                  : 'INVALID MAX/ALLOC'}
              </strong>
              ), whereas Deadlock Detection evaluates only{' '}
              <strong>active Request vectors right now</strong> (currently:{' '}
              <strong
                className={
                  !deadlockResult.valid
                    ? 'text-red-700 dark:text-red-400'
                    : deadlockResult.hasDeadlock
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }
              >
                {!deadlockResult.valid
                  ? 'INVALID INPUT'
                  : deadlockResult.hasDeadlock
                  ? 'DEADLOCK DETECTED'
                  : 'NO DEADLOCK'}
              </strong>
              ). A system can be unsafe without being deadlocked right now, but any detected
              deadlock is always unsafe.
            </p>
          </div>
        </div>
      </div>

      {/* Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VectorDisplay
          title="Current Available Resources"
          subtitle="Free instances before running detection"
          resourceNames={systemState.resourceNames}
          resourceDescriptions={systemState.resourceDescriptions}
          values={systemState.available}
          editable
          onChangeValue={updateAvailable}
          errorIndices={availErrors}
          validationIssues={deadlockResult.validationIssues}
        />

        <VectorDisplay
          title="Final Work Vector"
          subtitle="Resources accumulated from all non-blocked processes"
          resourceNames={systemState.resourceNames}
          resourceDescriptions={systemState.resourceDescriptions}
          values={deadlockResult.finalWork}
        />
      </div>

      {/* Allocation & Request Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatrixTable
          title="Allocation Matrix"
          subtitle="Resources currently held by each process"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.allocation}
          editable
          fieldKey="allocation"
          onChangeCell={(i, j, val) => updateCell('allocation', i, j, val)}
          selectedRow={selectedProcessIdx}
          onSelectRow={setSelectedProcessIdx}
          finishedRows={deadlockResult.valid ? deadlockResult.finish : undefined}
          deadlockedRows={deadlockedIndices}
          validationIssues={deadlockResult.validationIssues}
        />

        <MatrixTable
          title="Current Request Matrix"
          subtitle="Additional resources currently requested by each process"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.request}
          editable
          fieldKey="request"
          onChangeCell={(i, j, val) => updateCell('request', i, j, val)}
          selectedRow={selectedProcessIdx}
          onSelectRow={setSelectedProcessIdx}
          finishedRows={deadlockResult.valid ? deadlockResult.finish : undefined}
          deadlockedRows={deadlockedIndices}
          validationIssues={deadlockResult.validationIssues}
        />
      </div>

      {/* Finish Array & Process Diagnosis Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-950 dark:text-white">
              Process Finish Array &amp; Deadlock Diagnosis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rule: Finish[i] starts as false if Allocation[i] ≠ 0, and true if Allocation[i] = 0.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {systemState.processNames.length} process(es)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#081226] text-xs font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-2.5 px-5">Process</th>
                <th className="py-2.5 px-5">Initial Finish</th>
                <th className="py-2.5 px-5">Final Finish</th>
                <th className="py-2.5 px-5">State Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {systemState.processNames.map((proc, i) => {
                const initF = deadlockResult.initialFinish[i];
                const finalF = deadlockResult.finish[i];
                const waitedFirst = waitingThenFinished.has(i);
                const isSelected = selectedProcessIdx === i;

                return (
                  <tr
                    key={proc}
                    onClick={() => setSelectedProcessIdx(i)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/75 dark:bg-blue-950/35'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                      {proc}
                    </td>
                    <td className="py-2.5 px-5 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {!deadlockResult.valid
                        ? '— (invalid input)'
                        : initF
                        ? 'true (zero allocation)'
                        : 'false (holds resources)'}
                    </td>
                    <td className="py-2.5 px-5 font-mono text-xs font-semibold">
                      {!deadlockResult.valid ? (
                        <span className="text-red-700 dark:text-red-400">invalid</span>
                      ) : (
                        <span
                          className={
                            finalF
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }
                        >
                          {finalF ? 'true' : 'false'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-5 text-xs">
                      {!deadlockResult.valid ? (
                        <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Invalid Configuration</span>
                        </span>
                      ) : finalF ? (
                        waitedFirst ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Waited → Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Completed (Not Deadlocked)</span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold">
                          <XOctagon className="h-3.5 w-3.5" />
                          <span>Deadlocked</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
