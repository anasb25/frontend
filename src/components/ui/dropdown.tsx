'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  align: 'start' | 'end';
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within Dropdown');
  }
  return context;
}

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end';
}

export function Dropdown({
  children,
  className,
  align = 'start',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismissibleLayer({
    enabled: open,
    onDismiss: () => setOpen(false),
    containerRef: triggerRef,
    extraRefs: [menuRef],
  });

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, triggerRef, menuRef, align }}
    >
      <div className={cn('relative inline-flex', className)}>{children}</div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        'ui-select-trigger inline-flex items-center justify-center rounded-xl border border-[var(--input-border)] bg-input px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200',
        'hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10',
        open && 'border-primary ring-4 ring-primary/10',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end';
  minWidth?: number;
}

export function DropdownContent({
  children,
  className,
  align: alignProp,
  minWidth = 200,
}: DropdownContentProps) {
  const { open, triggerRef, menuRef, align: contextAlign } = useDropdownContext();
  const [mounted, setMounted] = useState(false);
  const align = alignProp ?? contextAlign;

  const position = useFloatingPosition({
    open,
    triggerRef,
    align,
    matchTriggerWidth: false,
    minWidth,
    maxHeight: 320,
  });

  useEffect(() => setMounted(true), []);

  if (!open || !mounted || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        zIndex: 120,
      }}
      className={cn('ui-overlay-menu overflow-auto p-1.5', className)}
      data-floating-layer="true"
    >
      {children}
    </div>,
    document.body,
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled,
  destructive,
  className,
}: DropdownItemProps) {
  const { setOpen } = useDropdownContext();

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        'ui-dropdown-item flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-[var(--shell-hover)]',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn('my-1 h-px bg-[var(--shell-border)]', className)}
    />
  );
}

export function DropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}
