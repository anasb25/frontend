'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps<T extends string = string> {
  value: T | '';
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-11 px-4 text-sm',
};

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled,
  error,
  size = 'md',
  className,
  id,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selected = options.find((option) => option.value === value);

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

  const menu =
    open && mounted && position
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
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
            {options.map((option) => {
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
                      'ui-select-option flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected && 'ui-select-option-active',
                      option.disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{option.label}</span>
                      {option.description && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
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
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected?.label ?? placeholder}
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
