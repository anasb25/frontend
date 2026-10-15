'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';
import { SearchableSelectOption } from '@/components/ui/searchable-select';

interface CreatableSearchableSelectProps {
  value: string;
  onChange: (value: string, meta: { isNew: boolean; option?: SearchableSelectOption }) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  createLabel?: (query: string) => string;
  className?: string;
  id?: string;
}

export function CreatableSearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select or type a name',
  searchPlaceholder = 'Search...',
  disabled,
  error,
  createLabel = (q) => `Add new "${q}"`,
  className,
  id,
}: CreatableSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? (value || '');

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === query.trim().toLowerCase(),
  );
  const canCreate = query.trim().length >= 2 && !exactMatch;

  const position = useFloatingPosition({
    open,
    triggerRef,
    matchTriggerWidth: true,
    maxHeight: 320,
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
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 0);
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
            className="ui-overlay-menu flex flex-col overflow-hidden p-0"
            data-floating-layer="true"
          >
            <div className="border-b border-[var(--shell-border)] p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-lg border border-[var(--input-border)] bg-input pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
            <ul role="listbox" className="max-h-56 overflow-auto p-1.5">
              {canCreate && (
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    onClick={() => {
                      onChange(query.trim(), { isNew: true });
                      setOpen(false);
                    }}
                    className="ui-select-option flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-primary"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{createLabel(query.trim())}</span>
                  </button>
                </li>
              )}
              {filteredOptions.length === 0 && !canCreate ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results found
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => {
                          if (option.disabled) return;
                          onChange(option.value, { isNew: false, option });
                          setOpen(false);
                        }}
                        className={cn(
                          'ui-select-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                          isSelected && 'ui-select-option-active',
                          option.disabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          {option.icon}
                          <span className="min-w-0">
                            <span className="block font-medium">{option.label}</span>
                            {option.description && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    </li>
                  );
                })
              )}
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
            ? 'border-destructive focus-visible:ring-destructive/15'
            : 'border-[var(--input-border)] hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
          disabled && 'cursor-not-allowed opacity-60',
          open && !error && 'border-primary ring-4 ring-primary/10',
        )}
      >
        <span className={cn('truncate', !displayLabel && 'text-muted-foreground')}>
          {displayLabel || placeholder}
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
