'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-5 w-5',
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
};

const textSizeClasses = {
  xs: 'text-[8px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const imagePadding = {
  xs: 'p-0.5',
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-1.5',
  xl: 'p-2',
};

const radiusClasses = {
  xs: 'rounded-md',
  sm: 'rounded-2xl',
  md: 'rounded-2xl',
  lg: 'rounded-2xl',
  xl: 'rounded-2xl',
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function BrandLogo({
  name,
  logoUrl,
  size = 'md',
  className,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden border border-[var(--shell-border)] bg-white shadow-sm dark:bg-white',
        sizeClasses[size],
        radiusClasses[size],
        className,
      )}
      title={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl!}
          alt={`${name} logo`}
          className={cn('h-full w-full object-contain', imagePadding[size])}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'font-bold tracking-tight text-primary',
            textSizeClasses[size],
          )}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
