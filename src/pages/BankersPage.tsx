import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PlaySquare,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { evaluateResourceRequest } from '../algorithms/bankers';
import { MatrixTable } from '../components/MatrixTable';
import { VectorDisplay } from '../components/VectorDisplay';
import { StatusBanner } from '../components/StatusBanner';
import type { ResourceRequestResult } from '../types/simulator';

export function BankersPage() {
  const navigate = useNavigate();
  const {
    systemState,
    updateCell,
    updateAvailable,
    applyResourceRequest,
    resizeSystem,
    bankerResult,
    recordSimulationRun,
    resetSimulation,
    setSimulationMode,
  } = useSimulator();

  const [selectedProcessIdx, setSelectedProcessIdx] = useState(0);
  const [reqProcessIdx, setReqProcessIdx] = useState(0);
  const [reqVector, setReqVector] = useState<number[]>(() =>
    systemState.resourceNames.map(() => 0)
  );
  const [reqOutcome, setReqOutcome] = useState<ResourceRequestResult | null>(null);
  const [hasExplicitRun, setHasExplicitRun] = useState(true);

  useEffect(() => {
    setReqVector((prev) =>
      systemState.resourceNames.map((_, j) => (j < prev.length ? prev[j] : 0))
    );
    if (reqProcessIdx >= systemState.processNames.length) {
      setReqProcessIdx(0);
    }
    if (selectedProcessIdx >= systemState.processNames.length) {
      setSelectedProcessIdx(0);
    }
    setReqOutcome(null);
  }, [systemState, reqProcessIdx, selectedProcessIdx]);

  const handleSelectProcess = (idx: number) => {
    setSelectedProcessIdx(idx);
    setReqProcessIdx(idx);
    setReqOutcome(null);
  };

  const handleRunSafetyCheck = () => {
    setHasExplicitRun(true);
    recordSimulationRun('bankers');
  };

  const handleOpenStepByStep = () => {
    recordSimulationRun('bankers');
    setSimulationMode('bankers');
    navigate('/simulation');
  };

  const handleTestRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const outcome = evaluateResourceRequest(systemState, reqProcessIdx, reqVector);
    setReqOutcome(outcome);
  };

  const handleApplyGrantedRequest = () => {
    if (!reqOutcome || !reqOutcome.granted) return;
    const applied = applyResourceRequest(reqProcessIdx, reqVector);
    if (applied) {
      setReqOutcome(null);
    }
  };

  const availErrors = new Set(
    bankerResult.validationIssues
      .filter((i) => i.field === 'available' || i.field === 'capacity')
      .map((i) => i.resourceIndex ?? -1)
  );

  // Selected process details for live inspector strip
  const selName = systemState.processNames[selectedProcessIdx] ?? 'P0';
  const selAlloc = systemState.allocation[selectedProcessIdx] ?? [];
  const selMax = systemState.maximum[selectedProcessIdx] ?? [];
  const selNeed = bankerResult.need[selectedProcessIdx] ?? [];
  const selFinished = bankerResult.valid && bankerResult.finish[selectedProcessIdx];

  // Live pre-check hints for the Resource Request form
  const reqNeedRow = bankerResult.need[reqProcessIdx] ?? [];
  const reqLeNeed =
    reqVector.length === reqNeedRow.length &&
    reqVector.every((v, j) => Number.isSafeInteger(v) && v >= 0 && v <= (reqNeedRow[j] ?? 0));
  const reqLeAvail =
    reqVector.length === systemState.available.length &&
    reqVector.every(
      (v, j) => Number.isSafeInteger(v) && v >= 0 && v <= (systemState.available[j] ?? 0)
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Banker&apos;s Safety Algorithm
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure Allocation, Maximum, and Available resources. Need = Maximum − Allocation is
            computed automatically to determine system safety and safe sequences.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRunSafetyCheck}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Run Safety Check</span>
          </button>
          <button
            type="button"
            onClick={handleOpenStepByStep}
            disabled={!bankerResult.valid}
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

      {/* Dimension Selector + Selected Process Summary */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Processes</span>
            <select
              aria-label="Number of processes"
              value={systemState.processNames.length}
              onChange={(e) => resizeSystem(Number(e.target.value), systemState.resourceNames.length)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
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
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Highlighted Process Readout */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-600 dark:text-slate-300">
          <span className="font-sans text-slate-500 dark:text-slate-400">Selected:</span>
          <strong className="text-blue-700 dark:text-cyan-400">{selName}</strong>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
            ·
          </span>
          <span>Alloc [{selAlloc.join(', ')}]</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
            ·
          </span>
          <span>Max [{selMax.join(', ')}]</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
            ·
          </span>
          <span>Need [{selNeed.join(', ')}]</span>
          {bankerResult.valid && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span
                className={
                  selFinished
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-amber-700 dark:text-amber-400 font-semibold'
                }
              >
                {selFinished ? 'Finishes Safely' : 'Blocked / Unfinished'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Validation Errors or Result Status Banner */}
      {!bankerResult.valid ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/35 p-5 space-y-2 shadow-xs"
        >
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-display font-bold text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Input Validation Errors ({bankerResult.validationIssues.length})</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-200 space-y-1">
            {bankerResult.validationIssues.map((issue) => (
              <li key={issue.id}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        hasExplicitRun && (
          <StatusBanner
            variant={bankerResult.isSafe ? 'safe' : 'unsafe'}
            title={
              bankerResult.isSafe ? 'SYSTEM IS IN SAFE STATE' : 'SYSTEM IS IN UNSAFE STATE'
            }
            description={
              bankerResult.isSafe
                ? `Every process can satisfy Need[i] <= Work and release its allocated resources without deadlock. Final Work vector reaches [${bankerResult.finalWork.join(', ')}].`
                : `No valid safe sequence exists. Processes ${bankerResult.unfinishedProcesses.join(', ')} cannot satisfy their remaining Need vector with Work = [${bankerResult.finalWork.join(', ')}].`
            }
            sequence={bankerResult.isSafe ? bankerResult.safeSequence : undefined}
            sequenceLabel="Verified Safe Execution Sequence"
          />
        )
      )}

      {/* Available & Work Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VectorDisplay
          title="Available Resources Vector"
          subtitle="Currently free instances of each resource type"
          resourceNames={systemState.resourceNames}
          resourceDescriptions={systemState.resourceDescriptions}
          values={systemState.available}
          editable
          onChangeValue={updateAvailable}
          errorIndices={availErrors}
          validationIssues={bankerResult.validationIssues}
        />

        <VectorDisplay
          title="Final Work Vector"
          subtitle="Available pool after completing all eligible processes"
          resourceNames={systemState.resourceNames}
          resourceDescriptions={systemState.resourceDescriptions}
          values={bankerResult.finalWork}
        />
      </div>

      {/* Allocation, Maximum, Need Matrices (synchronized row selection) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <MatrixTable
          title="Allocation Matrix"
          subtitle="Click any row to highlight across all tables"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.allocation}
          editable
          fieldKey="allocation"
          onChangeCell={(i, j, val) => updateCell('allocation', i, j, val)}
          selectedRow={selectedProcessIdx}
          onSelectRow={handleSelectProcess}
          finishedRows={bankerResult.valid ? bankerResult.finish : undefined}
          validationIssues={bankerResult.validationIssues}
        />

        <MatrixTable
          title="Maximum Matrix"
          subtitle="Maximum declared claim per process"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.maximum}
          editable
          fieldKey="maximum"
          onChangeCell={(i, j, val) => updateCell('maximum', i, j, val)}
          selectedRow={selectedProcessIdx}
          onSelectRow={handleSelectProcess}
          finishedRows={bankerResult.valid ? bankerResult.finish : undefined}
          validationIssues={bankerResult.validationIssues}
        />

        <MatrixTable
          title="Need Matrix"
          subtitle="Need[i][j] = Maximum[i][j] − Allocation[i][j]"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={bankerResult.need}
          selectedRow={selectedProcessIdx}
          onSelectRow={handleSelectProcess}
          finishedRows={bankerResult.valid ? bankerResult.finish : undefined}
        />
      </div>

      {/* Finish Array & Dynamic Resource-Request Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs">
          <h2 className="font-display text-sm font-bold text-slate-950 dark:text-white mb-1">
            Finish Array
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Click a process to inspect its rows above
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {systemState.processNames.map((proc, i) => {
              const done = bankerResult.valid && bankerResult.finish[i];
              const isSelected = selectedProcessIdx === i;
              return (
                <button
                  key={proc}
                  type="button"
                  onClick={() => handleSelectProcess(i)}
                  className={`w-full py-2.5 px-2.5 -mx-2.5 rounded-lg flex items-center justify-between text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/45'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <span
                    className={`font-mono font-semibold ${
                      isSelected
                        ? 'text-blue-800 dark:text-cyan-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    Finish[{proc}]
                  </span>
                  {!bankerResult.valid ? (
                    <span className="font-mono text-xs font-medium text-red-600 dark:text-red-400">
                      invalid
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${
                        done
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {done ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>true</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>false</span>
                        </>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Resource-Request Tester */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-950 dark:text-white">
                Test a Resource Request (Banker&apos;s Resource-Request Algorithm)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Test whether granting an incoming request keeps the system in a safe state before
                applying it.
              </p>
            </div>
          </div>

          {/* Live Reference Strip for the Selected Requesting Process */}
          <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#081226] px-3.5 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
            <div className="font-mono text-slate-700 dark:text-slate-300">
              Need[{systemState.processNames[reqProcessIdx] ?? 'P0'}] ={' '}
              <strong className="text-slate-950 dark:text-white">
                [{reqNeedRow.join(', ')}]
              </strong>
            </div>
            <div className="font-mono text-slate-700 dark:text-slate-300">
              Available ={' '}
              <strong className="text-slate-950 dark:text-white">
                [{systemState.available.join(', ')}]
              </strong>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
              <span
                className={
                  reqLeNeed
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }
              >
                {reqLeNeed ? '✓' : '✕'} Request ≤ Need
              </span>
              <span
                className={
                  reqLeAvail
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }
              >
                {reqLeAvail ? '✓' : '✕'} Request ≤ Available
              </span>
            </div>
          </div>

          <form onSubmit={handleTestRequest} noValidate className="space-y-4">
            <div className="flex flex-wrap items-end gap-3.5">
              <label className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Requesting Process
                </span>
                <select
                  aria-label="Requesting Process"
                  value={reqProcessIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setReqProcessIdx(idx);
                    setSelectedProcessIdx(idx);
                    setReqOutcome(null);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 font-mono text-sm font-semibold text-slate-900 dark:text-white"
                >
                  {systemState.processNames.map((proc, idx) => (
                    <option key={proc} value={idx}>
                      {proc}
                    </option>
                  ))}
                </select>
              </label>

              {systemState.resourceNames.map((res, j) => (
                <label key={`${res}-${j}`} className="space-y-1.5">
                  <span className="block text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                    Request {res}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    aria-label={`Request resource ${res}`}
                    value={reqVector[j] ?? 0}
                    onChange={(e) => {
                      const next = [...reqVector];
                      next[j] = e.target.value === '' ? 0 : Number(e.target.value);
                      setReqVector(next);
                      setReqOutcome(null);
                    }}
                    className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 font-mono text-sm tabular-nums text-slate-900 dark:text-white focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                  />
                </label>
              ))}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Evaluate Request</span>
              </button>
            </div>
          </form>

          {reqOutcome && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-4 text-sm space-y-2.5 ${
                reqOutcome.granted
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                  : 'border-amber-200 dark:border-amber-800 bg-amber-50/85 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {reqOutcome.granted ? (
                  <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
                )}
                <span>
                  {reqOutcome.granted ? 'Request Safe — Can Be Granted' : 'Request Denied / Deferred'}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {reqOutcome.reason}
              </p>
              {reqOutcome.granted && (
                <button
                  type="button"
                  onClick={handleApplyGrantedRequest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <span>Apply Allocation to System</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
