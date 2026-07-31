import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border bg-input px-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200',
        'border-[var(--input-border)] hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
        error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
