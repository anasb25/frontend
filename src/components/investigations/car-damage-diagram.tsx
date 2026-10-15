'use client';

import { cn } from '@/lib/utils';

export const DAMAGE_ZONES = [
  { id: 'front', label: 'Front' },
  { id: 'hood', label: 'Hood' },
  { id: 'roof', label: 'Roof' },
  { id: 'trunk', label: 'Trunk' },
  { id: 'rear', label: 'Rear' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'front-left', label: 'Front Left' },
  { id: 'front-right', label: 'Front Right' },
  { id: 'rear-left', label: 'Rear Left' },
  { id: 'rear-right', label: 'Rear Right' },
] as const;

export type DamageZoneId = (typeof DAMAGE_ZONES)[number]['id'];

interface CarDamageDiagramProps {
  selected: string[];
  onChange?: (zones: string[]) => void;
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
}

function zoneClass(active: boolean, readOnly?: boolean) {
  return cn(
    'transition-all duration-200',
    !readOnly && 'cursor-pointer',
    active
      ? 'fill-red-500/85 stroke-red-700 dark:fill-red-500/80 dark:stroke-red-300'
      : cn(
          'fill-slate-200/80 stroke-slate-400 dark:fill-slate-700/80 dark:stroke-slate-500',
          !readOnly && 'hover:fill-primary/20 hover:stroke-primary',
        ),
  );
}

export function CarDamageDiagram({
  selected,
  onChange,
  readOnly = false,
  compact = false,
  className,
}: CarDamageDiagramProps) {
  const active = new Set(selected);

  const toggle = (zone: string) => {
    if (readOnly || !onChange) return;
    if (active.has(zone)) {
      onChange(selected.filter((item) => item !== zone));
      return;
    }
    onChange([...selected, zone]);
  };

  return (
    <div className={cn(compact ? 'space-y-2.5' : 'space-y-4', className)}>
      <div
        className={cn(
          'rounded-xl border border-[var(--shell-border)] bg-gradient-to-b from-primary/5 to-transparent',
          compact ? 'p-2.5' : 'rounded-2xl p-4',
        )}
      >
        {!compact && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {readOnly ? 'Damage marked on vehicle' : 'Tap vehicle areas to mark damage'}
          </p>
        )}
        <svg
          viewBox="0 0 280 420"
          className={cn(
            'mx-auto h-auto w-full',
            compact ? 'max-w-[200px]' : 'max-w-[240px]',
          )}
        >
          {/* Front bumper */}
          <path
            d="M90 28 C110 12, 170 12, 190 28 L200 55 L80 55 Z"
            className={zoneClass(active.has('front'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('front')}
          />
          {/* Hood */}
          <rect
            x="85"
            y="58"
            width="110"
            height="70"
            rx="10"
            className={zoneClass(active.has('hood'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('hood')}
          />
          {/* Front left / right fenders */}
          <path
            d="M55 70 L85 60 L85 130 L48 145 Z"
            className={zoneClass(active.has('front-left'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('front-left')}
          />
          <path
            d="M225 70 L195 60 L195 130 L232 145 Z"
            className={zoneClass(active.has('front-right'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('front-right')}
          />
          {/* Roof */}
          <rect
            x="90"
            y="135"
            width="100"
            height="90"
            rx="12"
            className={zoneClass(active.has('roof'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('roof')}
          />
          {/* Left / right doors */}
          <path
            d="M48 150 L88 138 L88 250 L45 265 Z"
            className={zoneClass(active.has('left'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('left')}
          />
          <path
            d="M232 150 L192 138 L192 250 L235 265 Z"
            className={zoneClass(active.has('right'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('right')}
          />
          {/* Trunk */}
          <rect
            x="88"
            y="232"
            width="104"
            height="55"
            rx="10"
            className={zoneClass(active.has('trunk'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('trunk')}
          />
          {/* Rear quarters */}
          <path
            d="M45 270 L88 255 L88 330 L55 345 Z"
            className={zoneClass(active.has('rear-left'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('rear-left')}
          />
          <path
            d="M235 270 L192 255 L192 330 L225 345 Z"
            className={zoneClass(active.has('rear-right'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('rear-right')}
          />
          {/* Rear bumper */}
          <path
            d="M80 335 L200 335 L190 375 C170 392, 110 392, 90 375 Z"
            className={zoneClass(active.has('rear'), readOnly)}
            strokeWidth="2"
            onClick={() => toggle('rear')}
          />
          {/* Windshield hint */}
          <rect
            x="100"
            y="145"
            width="80"
            height="28"
            rx="6"
            className="pointer-events-none fill-sky-300/30 stroke-sky-500/40"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className={cn('flex flex-wrap', compact ? 'gap-1' : 'gap-2')}>
        {DAMAGE_ZONES.map((zone) => {
          const isActive = active.has(zone.id);
          const chipClass = cn(
            'rounded-full border font-semibold transition-colors',
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs',
            isActive
              ? 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300'
              : readOnly
                ? 'border-[var(--shell-border)] bg-card text-muted-foreground opacity-50'
                : 'border-[var(--shell-border)] bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
          );

          if (readOnly) {
            return isActive ? (
              <span key={zone.id} className={chipClass}>
                {zone.label}
              </span>
            ) : null;
          }

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => toggle(zone.id)}
              className={chipClass}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Marked: {selected.length} area{selected.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
