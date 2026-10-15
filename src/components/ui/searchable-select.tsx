'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';

export interface SearchableSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SearchableSelectProps<T extends string = string> {
  value: T | '';
  onChange: (value: T) => void;
  options: SearchableSelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  displayLabel?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  'aria-label'?: string;
  remoteSearch?: boolean;
  onSearchQueryChange?: (query: string) => void;
  isLoadingOptions?: boolean;
  emptyMessage?: string;
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-11 px-4 text-sm',
};

const iconSlotClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
};

function SelectIconSlot({
  icon,
  size,
}: {
  icon?: React.ReactNode;
  size: 'sm' | 'md' | 'lg';
}) {
  if (!icon) return null;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden [&>*]:max-h-full [&>*]:max-w-full',
        iconSlotClasses[size],
      )}
    >
      {icon}
    </span>
  );
}

export function SearchableSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled,
  error,
  size = 'md',
  className,
  id,
  'aria-label': ariaLabel,
  displayLabel,
  remoteSearch = false,
  onSearchQueryChange,
  isLoadingOptions = false,
  emptyMessage = 'No results found',
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (remoteSearch) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.description?.toLowerCase().includes(q),
    );
  }, [options, query, remoteSearch]);

  useEffect(() => {
    if (!remoteSearch || !onSearchQueryChange) return;
    onSearchQueryChange(query);
  }, [query, remoteSearch, onSearchQueryChange]);

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
      if (remoteSearch) onSearchQueryChange?.('');
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, remoteSearch, onSearchQueryChange]);

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
              {isLoadingOptions ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </li>
              ) : filteredOptions.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
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
                          onChange(option.value);
                          setOpen(false);
                        }}
                        className={cn(
                          'ui-select-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                          isSelected && 'ui-select-option-active',
                          option.disabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <SelectIconSlot icon={option.icon} size={size} />
                          <span className="min-w-0">
                            <span className="block font-medium">{option.label}</span>
                            {option.description && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
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
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          'ui-select-trigger flex w-full items-center justify-between gap-2 rounded-xl border bg-input text-left shadow-sm transition-all duration-200',
          sizeClasses[size],
          error
            ? 'border-destructive focus-visible:ring-destructive/15'
            : 'border-[var(--input-border)] hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
          disabled && 'cursor-not-allowed opacity-60',
          open && !error && 'border-primary ring-4 ring-primary/10',
        )}
      >
        <span className={cn('flex min-w-0 items-center gap-2', !selected && 'text-muted-foreground')}>
          <SelectIconSlot icon={selected?.icon} size={size} />
          <span className="truncate">
            {selected?.label ?? displayLabel ?? placeholder}
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
