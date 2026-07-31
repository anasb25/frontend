import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function UserAvatar({ name, size = 'md', className }: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl brand-icon font-bold',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
