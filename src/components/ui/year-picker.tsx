'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';

interface YearPickerProps {
  value: number | '';
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  className?: string;
}

export function YearPicker({
  value,
  onChange,
  minYear = 1980,
  maxYear = new Date().getFullYear() + 1,
  placeholder = 'Select year',
  disabled,
  error,
  id,
  className,
}: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) list.push(year);
    return list;
  }, [minYear, maxYear]);

  const position = useFloatingPosition({
    open,
    triggerRef,
    matchTriggerWidth: true,
    maxHeight: 280,
  });

  useDismissibleLayer({
    enabled: open,
    onDismiss: () => setOpen(false),
    containerRef: triggerRef,
    extraRefs: [menuRef],
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setTimeout(() => selectedRef.current?.scrollIntoView({ block: 'center' }), 0);
    }
  }, [open]);

  const menu =
    open && mounted && position
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              zIndex: 120,
            }}
            className="ui-overlay-menu overflow-auto p-1.5"
            data-floating-layer="true"
          >
            <ul role="listbox" className="space-y-0.5">
              {years.map((year) => {
                const isSelected = year === value;
                return (
                  <li key={year} role="presentation">
                    <button
                      ref={isSelected ? selectedRef : undefined}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(year);
                        setOpen(false);
                      }}
                      className={cn(
                        'ui-select-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm',
                        isSelected && 'ui-select-option-active',
                      )}
                    >
                      <span className="font-medium">{year}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          'ui-select-trigger flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-input px-3.5 text-left text-sm shadow-sm transition-all duration-200',
          error
            ? 'border-destructive'
            : 'border-[var(--input-border)] hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
          disabled && 'cursor-not-allowed opacity-60',
          open && !error && 'border-primary ring-4 ring-primary/10',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>
      {menu}
    </div>
  );
}
