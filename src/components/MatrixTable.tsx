import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ValidationIssue } from '../types/simulator';

interface MatrixTableProps {
  title: string;
  subtitle?: string;
  processNames: string[];
  resourceNames: string[];
  matrix: number[][];
  editable?: boolean;
  fieldKey?: 'allocation' | 'maximum' | 'request';
  onChangeCell?: (processIndex: number, resourceIndex: number, value: number) => void;
  highlightedRow?: number | null;
  selectedRow?: number | null;
  onSelectRow?: (processIndex: number) => void;
  finishedRows?: boolean[];
  waitingRows?: Set<number>;
  deadlockedRows?: Set<number>;
  validationIssues?: ValidationIssue[];
  compact?: boolean;
}

export function MatrixTable({
  title,
  subtitle,
  processNames,
  resourceNames,
  matrix,
  editable = false,
  fieldKey,
  onChangeCell,
  highlightedRow = null,
  selectedRow = null,
  onSelectRow,
  finishedRows,
  waitingRows,
  deadlockedRows,
  validationIssues = [],
  compact = false,
}: MatrixTableProps) {
  const relevantIssues = fieldKey
    ? validationIssues.filter((issue) => issue.field === fieldKey)
    : [];

  const getCellIssue = (pIdx: number, rIdx: number) =>
    validationIssues.find(
      (issue) =>
        (!fieldKey || issue.field === fieldKey) &&
        issue.processIndex === pIdx &&
        issue.resourceIndex === rIdx
    );

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-xs transition-colors ${
        editable
          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35]'
          : 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#0a152c]'
      }`}
    >
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
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
        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
          {processNames.length} × {resourceNames.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#081226]">
              <th className="sticky left-0 z-10 bg-slate-50/95 dark:bg-[#081226] py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-20">
                Process
              </th>
              {resourceNames.map((res, j) => (
                <th
                  key={`${res}-${j}`}
                  className="py-2.5 px-2 text-center text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 min-w-[58px]"
                >
                  {res}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {processNames.map((proc, i) => {
              const isHighlighted = highlightedRow === i;
              const isSelected = selectedRow === i;
              const isFinished = finishedRows?.[i] === true;
              const isWaiting = waitingRows?.has(i) === true;
              const isDeadlocked = deadlockedRows?.has(i) === true;

              const rowBg = isHighlighted
                ? 'bg-cyan-50/90 dark:bg-cyan-950/45'
                : isSelected
                ? 'bg-blue-50/85 dark:bg-blue-950/40'
                : isDeadlocked
                ? 'bg-red-50/75 dark:bg-red-950/35'
                : isWaiting
                ? 'bg-amber-50/65 dark:bg-amber-950/25'
                : isFinished
                ? 'bg-emerald-50/45 dark:bg-emerald-950/20'
                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30';

              const stickyCellBg = isHighlighted
                ? 'bg-cyan-50 dark:bg-[#0e2d45]'
                : isSelected
                ? 'bg-blue-50 dark:bg-[#10254a]'
                : isDeadlocked
                ? 'bg-red-50 dark:bg-[#2a131c]'
                : isWaiting
                ? 'bg-amber-50 dark:bg-[#261e11]'
                : isFinished
                ? 'bg-emerald-50/80 dark:bg-[#0d2426]'
                : editable
                ? 'bg-white dark:bg-[#0d1a35]'
                : 'bg-slate-50 dark:bg-[#0a152c]';

              return (
                <tr
                  key={proc}
                  onClick={onSelectRow ? () => onSelectRow(i) : undefined}
                  className={`transition-colors ${rowBg} ${onSelectRow ? 'cursor-pointer' : ''}`}
                >
                  <td
                    className={`sticky left-0 z-10 ${stickyCellBg} ${
                      compact ? 'py-1.5 px-3' : 'py-2 px-3'
                    } font-mono text-xs font-semibold whitespace-nowrap transition-colors ${
                      isHighlighted
                        ? 'text-cyan-900 dark:text-cyan-200'
                        : isSelected
                        ? 'text-blue-800 dark:text-blue-200'
                        : isDeadlocked
                        ? 'text-red-700 dark:text-red-300'
                        : isWaiting
                        ? 'text-amber-800 dark:text-amber-300'
                        : isFinished
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {onSelectRow ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRow(i);
                        }}
                        aria-pressed={isSelected}
                        title={`Highlight process ${proc}`}
                        className="font-mono font-bold hover:underline cursor-pointer"
                      >
                        {proc}
                      </button>
                    ) : (
                      proc
                    )}
                  </td>
                  {resourceNames.map((res, j) => {
                    const value = matrix[i]?.[j] ?? 0;
                    const cellIssue = getCellIssue(i, j);
                    const cellErr = Boolean(cellIssue);
                    const isNegative = value < 0;

                    return (
                      <td
                        key={`${proc}-${res}-${j}`}
                        className={`${compact ? 'py-1.5 px-1.5' : 'py-2 px-2'} text-center`}
                      >
                        {editable && onChangeCell ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            aria-label={`${title} ${proc} ${res}`}
                            aria-invalid={cellErr || isNegative || undefined}
                            title={cellIssue?.message}
                            value={Number.isFinite(value) ? value : ''}
                            onFocus={onSelectRow ? () => onSelectRow(i) : undefined}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                onChangeCell(i, j, 0);
                                return;
                              }
                              const parsed = Number(raw);
                              onChangeCell(i, j, Number.isNaN(parsed) ? 0 : parsed);
                            }}
                            className={`w-14 mx-auto block rounded-md border px-2 py-1 text-center font-mono text-sm tabular-nums transition-colors focus:outline-none focus:ring-2 ${
                              cellErr || isNegative
                                ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-500/40 dark:border-red-600 dark:bg-red-950/50 dark:text-red-100'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081226] text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-cyan-600 dark:focus:border-cyan-400 focus:ring-cyan-500/25'
                            }`}
                          />
                        ) : (
                          <span
                            title={cellIssue?.message}
                            className={`inline-block min-w-[2.25rem] rounded px-1.5 py-0.5 font-mono text-sm tabular-nums ${
                              cellErr || isNegative
                                ? 'font-bold text-red-600 dark:text-red-400'
                                : isHighlighted
                                ? 'font-bold text-cyan-900 dark:text-cyan-200'
                                : isSelected
                                ? 'font-bold text-blue-800 dark:text-blue-200'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inline contextual validation errors near this specific matrix */}
      {relevantIssues.length > 0 && (
        <div
          role="alert"
          className="px-4 py-2.5 border-t border-red-200 dark:border-red-900/70 bg-red-50/80 dark:bg-red-950/35 space-y-1"
        >
          {relevantIssues.slice(0, 3).map((issue) => (
            <div
              key={issue.id}
              className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{issue.message}</span>
            </div>
          ))}
          {relevantIssues.length > 3 && (
            <div className="text-[11px] font-medium text-red-600 dark:text-red-400 pl-5">
              +{relevantIssues.length - 3} additional error(s) listed in the summary above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
