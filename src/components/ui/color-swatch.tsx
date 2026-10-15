import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  hexCode: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

function isLightColor(hex: string) {
  const value = hex.replace('#', '');
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.82;
}

export function ColorSwatch({
  hexCode,
  name,
  size = 'md',
  className,
}: ColorSwatchProps) {
  const hex = hexCode?.startsWith('#') ? hexCode : `#${hexCode || '64748B'}`;

  return (
    <span
      title={name ?? hex}
      aria-hidden={!name}
      aria-label={name ? `${name} color swatch` : undefined}
      className={cn(
        'inline-block shrink-0 rounded-full border shadow-sm',
        sizeClasses[size],
        isLightColor(hex)
          ? 'border-slate-300 dark:border-slate-500'
          : 'border-black/15 dark:border-white/20',
        className,
      )}
      style={{ backgroundColor: hex }}
    />
  );
}
