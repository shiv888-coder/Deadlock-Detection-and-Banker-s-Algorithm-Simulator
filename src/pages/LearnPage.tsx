import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sigma } from 'lucide-react';
import {
  AVOIDANCE_VS_DETECTION_TABLE,
  LEARNING_SECTIONS,
} from '../data/learningContent';

export function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Operating System Concepts &amp; Algorithm Explanation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Clear, plain-English explanations of processes, deadlocks, safe vs. unsafe states,
            Banker&apos;s Algorithm, and deadlock detection.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/simulation')}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0b1834] to-[#17336b] dark:from-blue-600 dark:to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 self-start md:self-auto cursor-pointer shadow-xs"
        >
          <span>Try Interactive Visualizer</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Chapter Index */}
      <nav
        aria-label="Concept chapters"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
          <BookOpen className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          <span>Jump to Topic</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-2 text-sm">
          {LEARNING_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-cyan-400 hover:underline transition-colors truncate"
            >
              <span className="font-mono text-xs text-blue-700/80 dark:text-cyan-400/90 mr-1.5">
                {sec.number}.
              </span>
              {sec.title.replace(/^What is (an |a )?/, '').replace(/\?$/, '')}
            </a>
          ))}
        </div>
      </nav>

      {/* Visual State Space Diagram: Safe vs Unsafe vs Deadlock */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
              Visualizing Safe, Unsafe, and Deadlocked States
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every possible allocation state of an operating system falls into either the{' '}
              <strong>Safe</strong> region or the <strong>Unsafe</strong> region. Notice that{' '}
              <strong>Deadlock</strong> is a strict subset inside the Unsafe region.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong className="text-emerald-700 dark:text-emerald-400">Safe State:</strong>{' '}
                Guaranteed deadlock-free; Banker&apos;s Algorithm keeps the system here.
              </li>
              <li>
                <strong className="text-amber-700 dark:text-amber-400">Unsafe State:</strong>{' '}
                No guaranteed safe sequence, but processes are not necessarily deadlocked yet.
              </li>
              <li>
                <strong className="text-red-700 dark:text-red-400">Deadlock:</strong>{' '}
                Processes are actively stuck waiting in a cycle; detected via Request ≤ Work.
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <svg
              viewBox="0 0 420 220"
              role="img"
              aria-label="Diagram showing Safe State, Unsafe State, and Deadlock as a subset inside Unsafe State"
              className="w-full max-w-md h-auto"
            >
              <rect
                x="10"
                y="10"
                width="400"
                height="200"
                rx="14"
                className="fill-emerald-50 dark:fill-emerald-950/35 stroke-emerald-500/70"
                strokeWidth="1.5"
              />
              <text
                x="28"
                y="36"
                className="fill-emerald-800 dark:fill-emerald-300 text-[13px] font-bold"
              >
                SAFE STATE REGION
              </text>
              <text
                x="28"
                y="54"
                className="fill-emerald-700/80 dark:fill-emerald-400/80 text-[11px]"
              >
                Guaranteed safe sequence exists · Zero deadlock possible
              </text>

              <rect
                x="155"
                y="72"
                width="240"
                height="124"
                rx="12"
                className="fill-amber-50 dark:fill-amber-950/45 stroke-amber-500/80"
                strokeWidth="1.5"
              />
              <text
                x="173"
                y="96"
                className="fill-amber-900 dark:fill-amber-300 text-[12px] font-bold"
              >
                UNSAFE STATE REGION
              </text>
              <text
                x="173"
                y="113"
                className="fill-amber-800/80 dark:fill-amber-400/80 text-[10.5px]"
              >
                Deadlock possible if max claims requested
              </text>

              <rect
                x="220"
                y="126"
                width="160"
                height="56"
                rx="10"
                className="fill-red-100 dark:fill-red-950/70 stroke-red-500"
                strokeWidth="1.5"
              />
              <text
                x="300"
                y="151"
                textAnchor="middle"
                className="fill-red-900 dark:fill-red-200 text-[12px] font-bold"
              >
                DEADLOCK
              </text>
              <text
                x="300"
                y="168"
                textAnchor="middle"
                className="fill-red-800 dark:fill-red-300 text-[10px]"
              >
                Actively blocked cycle
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Structured Concept Sections */}
      <div className="space-y-6">
        {LEARNING_SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 sm:p-7 shadow-xs space-y-4"
          >
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-semibold text-blue-700 dark:text-cyan-400">
                Topic {section.number}
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                {section.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {section.summary}
              </p>
            </div>

            <div className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {section.formula && (
              <div className="rounded-xl border border-cyan-200/80 dark:border-cyan-900/70 bg-gradient-to-br from-slate-50 to-cyan-50/40 dark:from-[#081226] dark:to-cyan-950/25 p-4 max-w-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-900 dark:text-cyan-300">
                  <Sigma className="h-3.5 w-3.5" />
                  <span>{section.formula.label}</span>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-[#0b1834] dark:text-white">
                  {section.formula.expression}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {section.formula.note}
                </div>
              </div>
            )}

            {section.keyPoints && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {section.keyPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-slate-200/80 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#081226] px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {/* Comparison Table attached to Section 08 */}
            {section.id === 'avoidance-vs-detection' && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full min-w-[560px] text-left border-collapse text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#081226] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <th className="py-3 px-4">Aspect</th>
                      <th className="py-3 px-4">Deadlock Avoidance (Banker&apos;s)</th>
                      <th className="py-3 px-4">Deadlock Detection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {AVOIDANCE_VS_DETECTION_TABLE.map((row) => (
                      <tr
                        key={row.aspect}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/25"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {row.aspect}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {row.avoidance}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {row.detection}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
