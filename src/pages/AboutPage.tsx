import React from 'react';
import { Users, BookOpen, Clock, Layers, GraduationCap } from 'lucide-react';

const TEAM_MEMBERS = [
  { serial: 1, name: 'VIKASH KUMAR', rollNo: '27600124044', section: 'A', initials: 'VK' },
  { serial: 2, name: 'VIKASH KUMAR', rollNo: '27600124045', section: 'A', initials: 'VK' },
  { serial: 3, name: 'SANIYA PRAVEEN', rollNo: '27600124046', section: 'A', initials: 'SP' },
  { serial: 4, name: 'RUPESH KUMAR KHAIRWAR', rollNo: '27600124047', section: 'A', initials: 'RK' },
  { serial: 5, name: 'SHIVSHANKAR MAL', rollNo: '27600124048', section: 'A', initials: 'SM' },
];

const TECH_STACK = [
  { name: 'React 19', role: 'Component-driven interactive UI architecture' },
  { name: 'TypeScript', role: 'Strict static typing for matrix algorithms & state' },
  { name: 'Vite', role: 'Fast static bundling compatible with Render Static Sites' },
  { name: 'Tailwind CSS', role: 'Responsive dark navy & white design system with dual themes' },
  { name: 'React Router', role: 'Client-side SPA routing with Render rewrite support' },
  { name: 'Lucide React', role: 'Consistent technical iconography across navigation and states' },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-[#08132a] via-[#0e2249] to-[#133369] text-white p-6 sm:p-8 space-y-3 shadow-sm">
        <div className="text-xs font-medium text-cyan-200 flex flex-wrap items-center gap-2">
          <span>3rd Year B.Tech Computer Science</span>
          <span aria-hidden="true">·</span>
          <span>Operating System Mini-Project</span>
          <span aria-hidden="true">·</span>
          <span>Group 9</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
          Deadlock Detection and Banker&apos;s Algorithm Simulator
        </h1>
        <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-3xl">
          Multiple processes in a computing laboratory compete for limited resources such as
          printers, memory units, and other devices. Improper allocation may cause deadlock. This
          interactive simulator implements Banker&apos;s Safety Algorithm and Deadlock Detection to
          determine system safety, discover valid safe sequences, and visualize resource transitions
          step by step.
        </p>
      </section>

      {/* Project Metadata Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Project Group</span>
            <Users className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          </div>
          <div className="font-display text-xl font-bold text-slate-950 dark:text-white">
            Group 9
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Section A · 5 Members</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Subject</span>
            <BookOpen className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          </div>
          <div className="font-display text-xl font-bold text-slate-950 dark:text-white">
            Operating System
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">B.Tech CSE 3rd Year</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Project Duration</span>
            <Clock className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          </div>
          <div className="font-display text-xl font-bold font-mono tabular-nums text-slate-950 dark:text-white">
            25 Hours
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Design, implementation &amp; audit
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Execution Model</span>
            <GraduationCap className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          </div>
          <div className="font-display text-xl font-bold text-slate-950 dark:text-white">
            100% Client-Side
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Static Render deploy ready
          </div>
        </div>
      </section>

      {/* Group Members Section */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Group 9 Project Team
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official student roster for the Operating System mini-project
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            5 Members · Section A
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#081226] text-xs font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3 px-6 w-20">S.No.</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">University Roll Number</th>
                <th className="py-3 px-6">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TEAM_MEMBERS.map((member) => (
                <tr
                  key={member.rollNo}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {String(member.serial).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-8 w-8 rounded-lg bg-[#0b1834] dark:bg-blue-950/90 border border-slate-200/20 dark:border-cyan-800/60 text-cyan-200 font-mono text-xs font-bold flex items-center justify-center shrink-0"
                      >
                        {member.initials}
                      </span>
                      <span className="font-display font-semibold text-slate-950 dark:text-white">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-sm font-semibold text-blue-800 dark:text-cyan-300 tabular-nums">
                    {member.rollNo}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-600 dark:text-slate-300">
                    Section {member.section}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture & Technology Stack */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-700 dark:text-cyan-400" />
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
            Technology Stack &amp; Deployment Compatibility
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK.map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#081226] p-4 space-y-1"
            >
              <div className="font-display text-sm font-bold text-slate-950 dark:text-white">
                {item.name}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.role}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
