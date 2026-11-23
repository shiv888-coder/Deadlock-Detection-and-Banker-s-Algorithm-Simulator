import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Radar,
  PlaySquare,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  Bookmark,
} from 'lucide-react';
import { PREDEFINED_SAMPLES } from '../data/samples';
import { useSimulator } from '../context/SimulatorContext';
import type { SampleScenario } from '../types/simulator';

export function SamplesPage() {
  const navigate = useNavigate();
  const { loadScenario, setSimulationMode, customScenarios, deleteCustomScenario } = useSimulator();

  const handleLoad = (scenario: SampleScenario, target: 'bankers' | 'deadlock' | 'simulation') => {
    loadScenario(scenario);
    if (target === 'bankers') {
      setSimulationMode('bankers');
      navigate('/bankers');
    } else if (target === 'deadlock') {
      setSimulationMode('deadlock');
      navigate('/deadlock-detection');
    } else {
      setSimulationMode(scenario.recommendedMode);
      navigate('/simulation');
    }
  };

  const renderScenarioCard = (scenario: SampleScenario) => {
    const Icon =
      scenario.category === 'safe'
        ? CheckCircle2
        : scenario.category === 'unsafe'
        ? AlertTriangle
        : scenario.category === 'deadlock'
        ? XOctagon
        : Bookmark;

    const tone =
      scenario.category === 'safe'
        ? 'text-emerald-700 dark:text-emerald-400'
        : scenario.category === 'unsafe'
        ? 'text-amber-700 dark:text-amber-400'
        : scenario.category === 'deadlock'
        ? 'text-red-700 dark:text-red-400'
        : 'text-blue-700 dark:text-cyan-400';

    return (
      <article
        key={scenario.id}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className={`flex items-center gap-2 text-xs font-semibold ${tone}`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{scenario.subtitle}</span>
            </div>
            <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
              {scenario.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {scenario.description}
            </p>
          </div>

          {scenario.isCustom && (
            <button
              type="button"
              onClick={() => deleteCustomScenario(scenario.id)}
              aria-label={`Delete custom scenario ${scenario.name}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800/80 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Verified Outcome & Available Summary */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/85 dark:bg-[#081226] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Verified Outcome: </span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {scenario.expectedOutcome}
            </span>
          </div>
          <div className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
            Available = [{scenario.state.available.join(', ')}] (
            {scenario.state.resourceNames.join(', ')})
          </div>
        </div>

        {/* Compact Data Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-left border-collapse text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-sans font-semibold">Process</th>
                <th className="py-2 px-4 font-sans font-semibold">
                  Allocation ({scenario.state.resourceNames.join(' ')})
                </th>
                <th className="py-2 px-4 font-sans font-semibold">
                  Maximum ({scenario.state.resourceNames.join(' ')})
                </th>
                <th className="py-2 pl-4 font-sans font-semibold">
                  Current Request ({scenario.state.resourceNames.join(' ')})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-800 dark:text-slate-200">
              {scenario.state.processNames.map((proc, i) => (
                <tr key={proc}>
                  <td className="py-1.5 pr-4 font-bold">{proc}</td>
                  <td className="py-1.5 px-4">{scenario.state.allocation[i].join('   ')}</td>
                  <td className="py-1.5 px-4">{scenario.state.maximum[i].join('   ')}</td>
                  <td className="py-1.5 pl-4">{scenario.state.request[i].join('   ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleLoad(scenario, 'bankers')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              scenario.recommendedMode === 'bankers'
                ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 text-white hover:opacity-95 shadow-2xs'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081226] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#13254a]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Load in Banker&apos;s Algorithm</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoad(scenario, 'deadlock')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              scenario.recommendedMode === 'deadlock'
                ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 text-white hover:opacity-95 shadow-2xs'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081226] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#13254a]'
            }`}
          >
            <Radar className="h-3.5 w-3.5" />
            <span>Load in Deadlock Detection</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoad(scenario, 'simulation')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlaySquare className="h-3.5 w-3.5" />
            <span>Open Step-by-Step</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
          Mathematically Verified Sample Problems
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Load verified textbook datasets for Safe State, Unsafe State, and Deadlock Detection — or
          reopen your own saved scenarios from localStorage.
        </p>
      </div>

      {/* User Saved Custom Scenarios */}
      {customScenarios.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Your Saved Custom Scenarios ({customScenarios.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Persisted locally in browser storage
            </span>
          </div>
          <div className="space-y-5">{customScenarios.map(renderScenarioCard)}</div>
        </section>
      )}

      {/* Predefined Verified Examples */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
            Predefined Textbook Scenarios ({PREDEFINED_SAMPLES.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            All matrices verified via automated unit tests
          </span>
        </div>
        <div className="space-y-5">{PREDEFINED_SAMPLES.map(renderScenarioCard)}</div>
      </section>
    </div>
  );
}
