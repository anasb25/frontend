'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  title: string;
  summary?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  title,
  summary,
  badge,
  defaultOpen = false,
  compact = false,
  children,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[var(--shell-border)] bg-card',
        compact && 'rounded-lg',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center gap-2 text-left transition-colors hover:bg-[var(--surface)]/60',
          compact ? 'px-3 py-2' : 'px-4 py-3.5',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className={cn('shrink-0 font-semibold', compact ? 'text-xs' : 'text-sm')}>
            {title}
          </p>
          {badge}
          {!open && summary && (
            <p className="min-w-0 truncate text-[11px] text-muted-foreground">{summary}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div
          className={cn(
            'border-t border-[var(--shell-border)]',
            compact ? 'px-3 py-2.5' : 'px-4 py-4',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
