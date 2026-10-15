'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock, useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { Button } from '@/components/ui/button';

interface ModalContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within Modal');
  }
  return context;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useBodyScrollLock({ enabled: visible });
  useDismissibleLayer({
    enabled: visible && !closing,
    onDismiss: onClose,
    containerRef: panelRef,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    if (open) {
      setVisible(true);
      setClosing(false);
      return;
    }

    if (visible) {
      setClosing(true);
      const timer = window.setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 220);
      return () => window.clearTimeout(timer);
    }
  }, [open, mounted, visible]);

  if (!visible || !mounted) return null;

  return createPortal(
    <ModalContext.Provider value={{ onClose, titleId, descriptionId }}>
      <div className={cn('fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center', className)}>
        <button
          type="button"
          aria-label="Close modal"
          className={cn(
            'ui-overlay-backdrop absolute inset-0',
            closing ? 'animate-fade-out' : 'animate-fade-in',
          )}
          onClick={onClose}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            'ui-overlay-panel relative w-full max-w-lg overflow-hidden rounded-3xl',
            closing ? 'animate-fade-out-scale' : 'animate-fade-in-scale',
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
}

export function ModalHeader({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const { onClose } = useModalContext();

  return (
    <div
      className={cn(
        'flex items-start justify-between border-b border-[var(--shell-border)] bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 px-6 py-5 rounded-t-3xl',
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {showClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ml-3 h-9 w-9 shrink-0 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function ModalTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { titleId } = useModalContext();

  return (
    <h2
      id={titleId}
      className={cn('text-lg font-bold tracking-tight text-foreground', className)}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { descriptionId } = useModalContext();

  return (
    <p
      id={descriptionId}
      className={cn('mt-1 text-sm text-muted-foreground', className)}
    >
      {children}
    </p>
  );
}

export function ModalBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-[var(--shell-border)] bg-[var(--surface)]/40 px-6 py-4 sm:flex-row sm:justify-end rounded-b-3xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SimpleModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SimpleModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: SimpleModalProps) {
  return (
    <Modal open={open} onClose={onClose} className={className}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        {description && <ModalDescription>{description}</ModalDescription>}
      </ModalHeader>
      <ModalBody className={contentClassName}>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
}
