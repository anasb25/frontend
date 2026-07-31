'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'shell';
}

export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 w-9 rounded-lg',
          variant === 'shell'
            ? 'border border-[var(--shell-border)] bg-card'
            : 'border border-border bg-surface',
          className,
        )}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150',
        variant === 'shell'
          ? 'border border-[var(--shell-border)] bg-card shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]'
          : 'border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
