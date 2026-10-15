'use client';

import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormStep {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

interface FormStepperProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: FormStepperProps) {
  return (
    <nav aria-label="Form progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;
          const Icon = step.icon;
          const clickable = onStepClick && (isComplete || isCurrent);

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(index)}
                className={cn(
                  'group flex min-w-0 flex-col items-center gap-1.5',
                  clickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isComplete &&
                      'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                    isCurrent &&
                      'border-primary bg-primary/10 text-primary ring-4 ring-primary/15',
                    !isComplete &&
                      !isCurrent &&
                      'border-[var(--shell-border)] bg-card text-muted-foreground',
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="hidden max-w-[4.5rem] truncate text-center text-[10px] font-semibold uppercase tracking-wide sm:block sm:max-w-none">
                  <span
                    className={cn(
                      isCurrent && 'text-primary',
                      isComplete && 'text-foreground',
                      !isCurrent && !isComplete && 'text-muted-foreground',
                    )}
                  >
                    {step.shortLabel ?? step.label}
                  </span>
                </span>
              </button>
              {!isLast && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-2',
                    index < currentStep ? 'bg-primary' : 'bg-[var(--shell-border)]',
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-xs font-medium text-muted-foreground sm:hidden">
        {steps[currentStep]?.label}
      </p>
    </nav>
  );
}
