'use client';

import { LucideIcon, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { cn } from '@/lib/utils';

export type AlertModalVariant = 'success' | 'info' | 'warning' | 'danger';

const VARIANT_CONFIG: Record<
  AlertModalVariant,
  {
    icon: LucideIcon;
    iconWrap: string;
    iconColor: string;
    accent: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-emerald-500/15 ring-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'from-emerald-500/10 via-transparent to-primary/5',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-primary/15 ring-primary/20',
    iconColor: 'text-primary',
    accent: 'from-primary/10 via-transparent to-cyan-500/5',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-500/15 ring-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'from-amber-500/10 via-transparent to-primary/5',
  },
  danger: {
    icon: AlertCircle,
    iconWrap: 'bg-destructive/15 ring-destructive/20',
    iconColor: 'text-destructive',
    accent: 'from-destructive/10 via-transparent to-primary/5',
  },
};

export interface AlertModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  className?: string;
}

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  variant?: AlertModalVariant;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  primaryAction?: AlertModalAction;
  secondaryAction?: AlertModalAction;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function AlertModal({
  open,
  onClose,
  variant = 'info',
  title,
  description,
  icon,
  children,
  primaryAction,
  secondaryAction,
  closeOnBackdrop = false,
  showCloseButton = false,
  className,
}: AlertModalProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon ?? config.icon;
  const PrimaryIcon = primaryAction?.icon;

  return (
    <Modal
      open={open}
      onClose={closeOnBackdrop ? onClose : () => {}}
      className={className}
    >
      <ModalHeader
        showClose={showCloseButton}
        className={cn('bg-gradient-to-r', config.accent)}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4',
              config.iconWrap,
            )}
          >
            <Icon className={cn('h-6 w-6', config.iconColor)} />
          </div>
          <div className="min-w-0 pt-0.5">
            <ModalTitle>{title}</ModalTitle>
            {description && <ModalDescription>{description}</ModalDescription>}
          </div>
        </div>
      </ModalHeader>

      {children && <ModalBody className="py-4">{children}</ModalBody>}

      {(primaryAction || secondaryAction) && (
        <ModalFooter className="gap-2 sm:justify-stretch">
          {secondaryAction && (
            <Button
              type="button"
              variant={secondaryAction.variant ?? 'secondary'}
              className="flex-1 sm:flex-none"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              type="button"
              variant={primaryAction.variant ?? 'primary'}
              className={cn('flex-1 sm:flex-none', primaryAction.className)}
              onClick={primaryAction.onClick}
            >
              {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
}
