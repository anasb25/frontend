import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[96px] w-full resize-y rounded-xl border bg-input px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200',
        'border-[var(--input-border)] hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
        error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
