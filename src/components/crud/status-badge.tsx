import { cn } from '@/lib/utils';
import { ActiveStatus } from '@/lib/api';

interface StatusBadgeProps {
  status: ActiveStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        isActive
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        className,
      )}
    >
      {status}
    </span>
  );
}
