'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardList, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type OpenJobCardLinkProps = {
  estimateId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Shorter label for table rows */
  compact?: boolean;
};

export function OpenJobCardLink({
  estimateId,
  size = 'md',
  className,
  compact = false,
}: OpenJobCardLinkProps) {
  const label = compact ? 'Job Card' : 'Open Job Card';

  return (
    <Link
      href={`/dashboard/job-cards/open?estimateId=${estimateId}`}
      title="Open job card"
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold text-primary-foreground',
        'bg-gradient-to-br from-primary via-primary to-emerald-600',
        'shadow-md shadow-primary/30 ring-1 ring-white/10',
        'transition-all duration-200 hover:shadow-lg hover:shadow-primary/40 hover:brightness-105 active:scale-[0.98]',
        size === 'sm' && 'px-2.5 py-1.5 text-[11px]',
        size === 'md' && 'px-3.5 py-2 text-xs',
        size === 'lg' && 'px-5 py-2.5 text-sm',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.18)_50%,transparent_75%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-lg bg-white/20',
          size === 'lg' ? 'h-8 w-8' : 'h-6 w-6',
        )}
      >
        <ClipboardList className={cn(size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
      </span>
      <span className="relative">{label}</span>
      {!compact && (
        <Sparkles className="relative hidden h-3.5 w-3.5 text-white/70 sm:block" />
      )}
      <ArrowRight
        className={cn(
          'relative shrink-0 text-white/90 transition-transform duration-200 group-hover:translate-x-0.5',
          size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5',
        )}
      />
    </Link>
  );
}
