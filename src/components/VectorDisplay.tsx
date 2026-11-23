import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ValidationIssue } from '../types/simulator';

interface VectorDisplayProps {
  title: string;
  subtitle?: string;
  resourceNames: string[];
  resourceDescriptions?: string[];
  values: number[];
  delta?: number[];
  editable?: boolean;
  onChangeValue?: (resourceIndex: number, value: number) => void;
  errorIndices?: Set<number>;
  validationIssues?: ValidationIssue[];
}

export function VectorDisplay({
  title,
  subtitle,
  resourceNames,
  resourceDescriptions,
  values,
  delta,
  editable = false,
  onChangeValue,
  errorIndices,
  validationIssues = [],
}: VectorDisplayProps) {
  const vectorIssues = validationIssues.filter(
    (issue) => issue.field === 'available' || issue.field === 'capacity'
  );

  return (
    <div
      className={`rounded-xl border p-4 shadow-xs transition-colors ${
        editable
          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35]'
          : 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#0a152c]'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600 text-xs">
              ·
            </span>
            <span
              className={`text-[11px] font-medium ${
                editable
                  ? 'text-blue-700 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {editable ? 'Editable' : 'Calculated'}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
          [{values.join(', ')}]
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {resourceNames.map((res, j) => {
          const val = values[j] ?? 0;
          const inc = delta?.[j] ?? 0;
          const hasErr = errorIndices?.has(j) || val < 0;

          return (
            <div
              key={`${res}-${j}`}
              className={`rounded-lg border px-3 py-2.5 transition-colors ${
                hasErr
                  ? 'border-red-300 bg-red-50/70 dark:border-red-700 dark:bg-red-950/35'
                  : editable
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#081226]'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0d1a35]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-1 mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {res}
                </span>
                {resourceDescriptions?.[j] && (
                  <span
                    className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                    title={resourceDescriptions[j]}
                  >
                    {resourceDescriptions[j]}
                  </span>
                )}
              </div>

              {editable && onChangeValue ? (
                <input
                  type="number"
                  min={0}
                  step={1}
                  aria-label={`${title} ${res}`}
                  aria-invalid={hasErr || undefined}
                  value={Number.isFinite(val) ? val : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      onChangeValue(j, 0);
                      return;
                    }
                    const parsed = Number(raw);
                    onChangeValue(j, Number.isNaN(parsed) ? 0 : parsed);
                  }}
                  className={`w-full rounded-md border px-2 py-1 font-mono text-base font-semibold tabular-nums transition-colors focus:outline-none focus:ring-2 ${
                    hasErr
                      ? 'border-red-400 bg-white dark:bg-red-950/50 text-red-800 dark:text-red-200 focus:ring-red-500/40'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a35] text-slate-900 dark:text-slate-100 focus:border-cyan-600 dark:focus:border-cyan-400 focus:ring-cyan-500/25'
                  }`}
                />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold tabular-nums text-slate-950 dark:text-white">
                    {val}
                  </span>
                  {inc > 0 && (
                    <span className="font-mono text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      +{inc}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editable && vectorIssues.length > 0 && (
        <div
          role="alert"
          className="mt-3 pt-2.5 border-t border-red-200 dark:border-red-900/60 space-y-1"
        >
          {vectorIssues.slice(0, 2).map((issue) => (
            <div
              key={issue.id}
              className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
