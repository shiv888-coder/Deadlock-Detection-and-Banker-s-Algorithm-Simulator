import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import {
  computeNeedMatrix,
  computeTotalAllocated,
  validateSystemState,
} from '../algorithms/validation';
import { MatrixTable } from '../components/MatrixTable';
import type { SimulationMode } from '../types/simulator';

export function ResourceAllocationPage() {
  const {
    systemState,
    updateCell,
    updateAvailable,
    updateTotalCapacity,
    updateResourceDescription,
    addProcess,
    removeProcess,
    addResourceType,
    removeResourceType,
    saveCustomScenario,
    resetSimulation,
  } = useSimulator();

  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [scenarioMode, setScenarioMode] = useState<SimulationMode>('bankers');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const validation = validateSystemState(systemState, 'all');
  const needMatrix = computeNeedMatrix(systemState.maximum, systemState.allocation);
  const totalAllocated = computeTotalAllocated(
    systemState.allocation,
    systemState.resourceNames.length
  );

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim() || !validation.valid) return;
    const created = saveCustomScenario(scenarioName, scenarioDesc, scenarioMode);
    setSaveFeedback(`Saved "${created.name}" to Sample Problems (localStorage).`);
    setScenarioName('');
    setScenarioDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Resource Allocation Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Add or remove processes and resource types, fine-tune capacities with stepper controls,
            and validate every allocation constraint in real time.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={addProcess}
            disabled={systemState.processNames.length >= 10}
            title="Add a new process row (max 10)"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-3.5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Process</span>
          </button>

          <button
            type="button"
            onClick={addResourceType}
            disabled={systemState.resourceNames.length >= 8}
            title="Add a new resource type column (max 8)"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a35] px-3.5 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
            <span>Add Resource Type</span>
          </button>

          <button
            type="button"
            onClick={resetSimulation}
            title="Restore Example 1 default matrices"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Validation Summary Banner */}
      {!validation.valid ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/40 p-5 space-y-2 shadow-xs"
        >
          <div className="flex items-center gap-2 font-display text-sm font-bold text-red-800 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Validation Failed — {validation.issues.length} Constraint Violation(s)</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-200 space-y-1">
            {validation.issues.map((issue) => (
              <li key={issue.id}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/25 px-4 py-3 flex items-center gap-2.5 text-sm text-emerald-900 dark:text-emerald-200 shadow-xs"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>
            All constraints satisfied: non-negative integers, Allocation ≤ Maximum, and Total
            Allocated ≤ System Capacity.
          </span>
        </div>
      )}

      {/* Resource Capacity & Availability Configuration Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-950 dark:text-white">
              Resource Types, Capacity &amp; Available Instances
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total Capacity must be at least Total Allocated. Adjusting Available automatically
              syncs Total Capacity.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {systemState.resourceNames.length} resource type(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#081226] text-xs font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-2.5 px-4">Resource</th>
                <th className="py-2.5 px-4">Device Label</th>
                <th className="py-2.5 px-4 text-center">Total Capacity</th>
                <th className="py-2.5 px-4 text-center">Allocated</th>
                <th className="py-2.5 px-4 text-center">Available</th>
                <th className="py-2.5 px-4 w-44">Capacity Usage</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {systemState.resourceNames.map((res, j) => {
                const cap = systemState.totalCapacity[j] ?? 0;
                const alloc = totalAllocated[j] ?? 0;
                const avail = systemState.available[j] ?? 0;
                const capExceeded = alloc > cap || cap < 0;
                const pct = cap > 0 ? Math.min(100, Math.round((alloc / cap) * 100)) : alloc > 0 ? 100 : 0;

                return (
                  <tr
                    key={`${res}-${j}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {res}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        aria-label={`Device label for resource ${res}`}
                        value={systemState.resourceDescriptions[j] ?? ''}
                        onChange={(e) => updateResourceDescription(j, e.target.value)}
                        className="w-36 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-2.5 py-1.5 text-sm text-slate-900 dark:text-white focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-1 mx-auto">
                        <button
                          type="button"
                          onClick={() => updateTotalCapacity(j, Math.max(0, cap - 1))}
                          disabled={cap <= 0}
                          aria-label={`Decrease total capacity for ${res}`}
                          className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-35 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          aria-label={`Total capacity for resource ${res}`}
                          aria-invalid={capExceeded || undefined}
                          value={Number.isFinite(cap) ? cap : ''}
                          onChange={(e) =>
                            updateTotalCapacity(j, e.target.value === '' ? 0 : Number(e.target.value))
                          }
                          className={`w-16 rounded-md border px-2 py-1 text-center font-mono text-sm tabular-nums ${
                            capExceeded
                              ? 'border-red-400 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-950/50 dark:text-red-100'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081226] text-slate-900 dark:text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateTotalCapacity(j, Math.max(0, cap) + 1)}
                          aria-label={`Increase total capacity for ${res}`}
                          className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13254a] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td
                      className={`py-3 px-4 text-center font-mono font-bold tabular-nums ${
                        capExceeded
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {alloc}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-1 mx-auto">
                        <button
                          type="button"
                          onClick={() => updateAvailable(j, Math.max(0, avail - 1))}
                          disabled={avail <= 0}
                          aria-label={`Decrease available instances for ${res}`}
                          className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13254a] disabled:opacity-35 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          aria-label={`Available instances for resource ${res}`}
                          aria-invalid={avail < 0 || undefined}
                          value={Number.isFinite(avail) ? avail : ''}
                          onChange={(e) =>
                            updateAvailable(j, e.target.value === '' ? 0 : Number(e.target.value))
                          }
                          className={`w-16 rounded-md border px-2 py-1 text-center font-mono text-sm tabular-nums ${
                            avail < 0
                              ? 'border-red-400 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-950/50 dark:text-red-100'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081226] text-slate-900 dark:text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateAvailable(j, Math.max(0, avail) + 1)}
                          aria-label={`Increase available instances for ${res}`}
                          className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13254a] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[11px] tabular-nums">
                          <span
                            className={
                              capExceeded
                                ? 'text-red-700 dark:text-red-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-300'
                            }
                          >
                            {capExceeded ? 'Over capacity' : `${pct}% used`}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {alloc}/{cap}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              capExceeded || pct >= 95
                                ? 'bg-red-600 dark:bg-red-500'
                                : pct >= 75
                                ? 'bg-amber-500 dark:bg-amber-400'
                                : 'bg-gradient-to-r from-[#0b1834] to-blue-600 dark:from-blue-500 dark:to-cyan-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeResourceType(j)}
                        disabled={systemState.resourceNames.length <= 1}
                        aria-label={`Remove resource ${res}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-35 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Management Strip */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Active Processes ({systemState.processNames.length} / 10)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Remove any individual process row or add a new process above
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {systemState.processNames.map((proc, idx) => (
            <div
              key={proc}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] pl-3 pr-1.5 py-1 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span>{proc}</span>
              <button
                type="button"
                onClick={() => removeProcess(idx)}
                disabled={systemState.processNames.length <= 1}
                aria-label={`Remove process ${proc}`}
                title={`Remove ${proc}`}
                className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-35 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Four Dependent Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatrixTable
          title="Allocation Matrix"
          subtitle="Currently allocated instances"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.allocation}
          editable
          fieldKey="allocation"
          onChangeCell={(i, j, val) => updateCell('allocation', i, j, val)}
          validationIssues={validation.issues}
        />

        <MatrixTable
          title="Maximum Claim Matrix"
          subtitle="Used by Banker's Algorithm (must be >= Allocation)"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.maximum}
          editable
          fieldKey="maximum"
          onChangeCell={(i, j, val) => updateCell('maximum', i, j, val)}
          validationIssues={validation.issues}
        />

        <MatrixTable
          title="Need Matrix"
          subtitle="Maximum − Allocation (auto-updated)"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={needMatrix}
        />

        <MatrixTable
          title="Current Request Matrix"
          subtitle="Used by Deadlock Detection Algorithm"
          processNames={systemState.processNames}
          resourceNames={systemState.resourceNames}
          matrix={systemState.request}
          editable
          fieldKey="request"
          onChangeCell={(i, j, val) => updateCell('request', i, j, val)}
          validationIssues={validation.issues}
        />
      </div>

      {/* Save Custom Scenario to localStorage */}
      <form
        onSubmit={handleSaveCustom}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-4"
      >
        <div>
          <h2 className="font-display text-sm font-bold text-slate-950 dark:text-white">
            Save Current Configuration as Custom Scenario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stored locally in your browser&apos;s localStorage and accessible anytime from the
            Sample Problems page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Scenario Title
            </span>
            <input
              type="text"
              required
              placeholder="e.g., Lab Test Case 5"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Description (Optional)
            </span>
            <input
              type="text"
              placeholder="Brief notes about this test case"
              value={scenarioDesc}
              onChange={(e) => setScenarioDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Primary Algorithm Mode
            </span>
            <select
              value={scenarioMode}
              onChange={(e) => setScenarioMode(e.target.value as SimulationMode)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="bankers">Banker&apos;s Safety Algorithm</option>
              <option value="deadlock">Deadlock Detection Algorithm</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={!validation.valid || !scenarioName.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Custom Scenario</span>
            </button>

            <button
              type="button"
              onClick={resetSimulation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {saveFeedback && (
            <span role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {saveFeedback}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
