import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, CheckCircle2, Circle, X } from 'lucide-react';
import { VIVA_CATEGORIES, VIVA_QUESTIONS, type VivaCategory } from '../data/vivaQuestions';

export function VivaPage() {
  const [selectedCategory, setSelectedCategory] = useState<VivaCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set([1, 2, 5]));
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('os-sim-viva-reviewed-v1');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = new Set(VIVA_QUESTIONS.map((q) => q.id));
          return new Set(
            parsed.filter(
              (id): id is number =>
                typeof id === 'number' && Number.isInteger(id) && validIds.has(id)
            )
          );
        }
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: VIVA_QUESTIONS.length };
    for (const q of VIVA_QUESTIONS) {
      counts[q.category] = (counts[q.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VIVA_QUESTIONS.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesText =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReviewed = (id: number) => {
    setReviewedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('os-sim-viva-reviewed-v1', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(filteredQuestions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  const reviewedPct = Math.round((reviewedIds.size / VIVA_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Study Progress */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Operating System Viva Preparation ({VIVA_QUESTIONS.length} Questions)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Curated oral exam questions and concise textbook answers covering Deadlocks,
            Banker&apos;s Algorithm, Resource Allocation, and Process Management.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] px-4 py-3 shadow-xs min-w-[220px] space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-400">Study Progress</span>
            <span className="font-mono font-bold tabular-nums text-slate-950 dark:text-white">
              {reviewedIds.size} / {VIVA_QUESTIONS.length} ({reviewedPct}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 transition-all duration-300"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search viva questions"
              placeholder="Search topics, terms, or formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] pl-9 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081226] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13254a] transition-colors whitespace-nowrap cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div
          role="group"
          aria-label="Filter viva questions by topic"
          className="flex flex-wrap gap-1.5"
        >
          {VIVA_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] text-white dark:from-blue-600 dark:to-cyan-600 shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#081226] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#13254a]'
                }`}
              >
                {category}{' '}
                <span className="font-mono opacity-75">({categoryCounts[category] ?? 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Accordion List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1a35] p-8 text-center space-y-3 shadow-xs">
          <div className="font-display font-semibold text-slate-900 dark:text-white">
            No matching viva questions found
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try clearing your search filter or switching to the All category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredQuestions.map((item) => {
            const isOpen = openIds.has(item.id);
            const isReviewed = reviewedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-white dark:bg-[#0d1a35] overflow-hidden shadow-2xs transition-colors ${
                  isReviewed
                    ? 'border-emerald-200/90 dark:border-emerald-900/70'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleOpen(item.id)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#112244]/60 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-bold text-blue-700 dark:text-cyan-400">
                        Q{String(item.id).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.difficulty}</span>
                      {isReviewed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Reviewed</span>
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-sm sm:text-base font-semibold text-slate-950 dark:text-white leading-snug">
                      {item.question}
                    </h2>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 mt-1 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-700 dark:text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#081226]/50 space-y-3">
                    <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                      {item.answer}
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleReviewed(item.id)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                          isReviewed
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                        }`}
                      >
                        {isReviewed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                        <span>{isReviewed ? 'Marked as Reviewed' : 'Mark as Reviewed'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
