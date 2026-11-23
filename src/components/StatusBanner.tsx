import React from 'react';
import { CheckCircle2, AlertTriangle, XOctagon, ShieldAlert, ArrowRight } from 'lucide-react';

interface StatusBannerProps {
  variant: 'safe' | 'unsafe' | 'no-deadlock' | 'deadlock' | 'error';
  title: string;
  description: string;
  sequence?: string[];
  sequenceLabel?: string;
}

const VARIANT_STYLES: Record<
  StatusBannerProps['variant'],
  {
    container: string;
    iconWrap: string;
    titleColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  safe: {
    container:
      'bg-emerald-50/85 dark:bg-emerald-950/35 border-emerald-200/90 dark:border-emerald-800/70',
    iconWrap: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    titleColor: 'text-emerald-950 dark:text-emerald-200',
    Icon: CheckCircle2,
  },
  'no-deadlock': {
    container:
      'bg-emerald-50/85 dark:bg-emerald-950/35 border-emerald-200/90 dark:border-emerald-800/70',
    iconWrap: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    titleColor: 'text-emerald-950 dark:text-emerald-200',
    Icon: CheckCircle2,
  },
  unsafe: {
    container:
      'bg-amber-50/90 dark:bg-amber-950/35 border-amber-200/90 dark:border-amber-800/70',
    iconWrap: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
    titleColor: 'text-amber-950 dark:text-amber-200',
    Icon: AlertTriangle,
  },
  deadlock: {
    container: 'bg-red-50/90 dark:bg-red-950/35 border-red-200/90 dark:border-red-800/70',
    iconWrap: 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300',
    titleColor: 'text-red-950 dark:text-red-200',
    Icon: XOctagon,
  },
  error: {
    container: 'bg-red-50/90 dark:bg-red-950/35 border-red-200/90 dark:border-red-800/70',
    iconWrap: 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300',
    titleColor: 'text-red-950 dark:text-red-200',
    Icon: ShieldAlert,
  },
};

export function StatusBanner({
  variant,
  title,
  description,
  sequence,
  sequenceLabel,
}: StatusBannerProps) {
  const { container, iconWrap, titleColor, Icon } = VARIANT_STYLES[variant];
  const isSequenceOrdered = variant !== 'deadlock';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border p-5 shadow-xs transition-colors ${container}`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className={`font-display text-base sm:text-lg font-bold tracking-tight ${titleColor}`}>
            {title}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
            {description}
          </p>
          {sequence && sequence.length > 0 && (
            <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/10">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
                {sequenceLabel ?? 'Sequence'}
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm tabular-nums">
                {sequence.map((proc, idx) => (
                  <React.Fragment key={`${proc}-${idx}`}>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold border shadow-2xs ${
                        variant === 'deadlock'
                          ? 'bg-white dark:bg-red-950/70 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                          : 'bg-white dark:bg-[#0b1834] border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      {isSequenceOrdered && (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {idx + 1}.
                        </span>
                      )}
                      <span>{proc}</span>
                    </span>
                    {isSequenceOrdered && idx < sequence.length - 1 && (
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0"
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
