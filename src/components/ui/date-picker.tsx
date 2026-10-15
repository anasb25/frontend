'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismissibleLayer } from '@/hooks/use-dismissible-layer';
import { useFloatingPosition } from '@/hooks/use-floating-position';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

type CalendarPanel = 'days' | 'months' | 'years';

const sizeClasses = {
  sm: 'h-8 rounded-lg px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-3.5 text-sm',
};

const iconSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
};

export function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getYearPageStart(year: number) {
  return Math.floor(year / 12) * 12;
}

function NavButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--shell-border)] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      aria-label={label}
    >
      {label.includes('Previous') ? (
        <ChevronLeft className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function PickerCell({
  children,
  active,
  today: isToday,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  today?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 items-center justify-center rounded-md text-xs font-medium transition-all',
        active && 'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
        !active &&
          !disabled &&
          'text-foreground hover:bg-primary/10 hover:text-primary',
        !active && isToday && 'border border-primary/30 text-primary',
        disabled && 'cursor-not-allowed opacity-35',
      )}
    >
      {children}
    </button>
  );
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  disabled,
  error,
  size = 'md',
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panel, setPanel] = useState<CalendarPanel>('days');
  const [viewDate, setViewDate] = useState(() => parseISODate(value) ?? new Date());
  const [yearPageStart, setYearPageStart] = useState(() =>
    getYearPageStart(parseISODate(value)?.getFullYear() ?? new Date().getFullYear()),
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseISODate(value);
  const min = minDate ? parseISODate(minDate) : null;
  const max = maxDate ? parseISODate(maxDate) : null;
  const today = useMemo(() => startOfDay(new Date()), []);

  const position = useFloatingPosition({
    open,
    triggerRef,
    matchTriggerWidth: false,
    minWidth: 252,
    maxHeight: 300,
  });

  useDismissibleLayer({
    enabled: open,
    onDismiss: () => setOpen(false),
    containerRef: triggerRef,
    extraRefs: [menuRef],
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      const base = selectedDate ?? new Date();
      setViewDate(base);
      setPanel('days');
      setYearPageStart(getYearPageStart(base.getFullYear()));
    }
  }, [open, selectedDate]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate);
  const viewYear = viewDate.getFullYear();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date } | null> = [];

    for (let i = 0; i < startOffset; i += 1) cells.push(null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day) });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewDate]);

  const years = useMemo(
    () => Array.from({ length: 12 }, (_, index) => yearPageStart + index),
    [yearPageStart],
  );

  const isDayDisabled = (date: Date) => {
    const normalized = startOfDay(date);
    if (min && normalized < startOfDay(min)) return true;
    if (max && normalized > startOfDay(max)) return true;
    return false;
  };

  const isYearDisabled = (year: number) => {
    if (min && year < min.getFullYear()) return true;
    if (max && year > max.getFullYear()) return true;
    return false;
  };

  const isMonthDisabled = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    if (min && last < startOfDay(min)) return true;
    if (max && first > startOfDay(max)) return true;
    return false;
  };

  const shiftMonth = (delta: number) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  const shiftYear = (delta: number) => {
    setViewDate((current) => new Date(current.getFullYear() + delta, current.getMonth(), 1));
  };

  const menu =
    open && mounted && position
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 120,
            }}
            className="ui-overlay-menu overflow-hidden p-2.5"
            data-floating-layer="true"
          >
            {panel === 'days' && (
              <>
                <div className="mb-2 flex items-center justify-between gap-1.5">
                  <NavButton label="Previous month" onClick={() => shiftMonth(-1)} />
                  <div className="flex min-w-0 items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPanel('months')}
                      className="truncate rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {monthName}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setYearPageStart(getYearPageStart(viewYear));
                        setPanel('years');
                      }}
                      className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {viewYear}
                    </button>
                  </div>
                  <NavButton label="Next month" onClick={() => shiftMonth(1)} />
                </div>

                <div className="mb-0.5 grid grid-cols-7 gap-0.5">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((cell, index) => {
                    if (!cell) {
                      return <div key={`empty-${index}`} className="h-7" />;
                    }

                    const { date } = cell;
                    const disabledDay = isDayDisabled(date);
                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                    const isToday = isSameDay(date, today);

                    return (
                      <PickerCell
                        key={toISODate(date)}
                        active={isSelected}
                        today={isToday}
                        disabled={disabledDay}
                        onClick={() => {
                          onChange(toISODate(date));
                          setOpen(false);
                        }}
                      >
                        {date.getDate()}
                      </PickerCell>
                    );
                  })}
                </div>
              </>
            )}

            {panel === 'months' && (
              <>
                <div className="mb-2 flex items-center justify-between gap-1.5">
                  <NavButton label="Previous year" onClick={() => shiftYear(-1)} />
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(getYearPageStart(viewYear));
                      setPanel('years');
                    }}
                    className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {viewYear}
                  </button>
                  <NavButton label="Next year" onClick={() => shiftYear(1)} />
                </div>

                <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Select month
                </p>

                <div className="grid grid-cols-3 gap-1">
                  {MONTHS.map((label, monthIndex) => {
                    const disabledMonth = isMonthDisabled(viewYear, monthIndex);
                    const isActive =
                      selectedDate?.getFullYear() === viewYear &&
                      selectedDate.getMonth() === monthIndex;
                    const isCurrent =
                      today.getFullYear() === viewYear && today.getMonth() === monthIndex;

                    return (
                      <PickerCell
                        key={label}
                        active={isActive}
                        today={isCurrent}
                        disabled={disabledMonth}
                        onClick={() => {
                          setViewDate(new Date(viewYear, monthIndex, 1));
                          setPanel('days');
                        }}
                      >
                        {label}
                      </PickerCell>
                    );
                  })}
                </div>
              </>
            )}

            {panel === 'years' && (
              <>
                <div className="mb-2 flex items-center justify-between gap-1.5">
                  <NavButton
                    label="Previous years"
                    onClick={() => setYearPageStart((current) => current - 12)}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {yearPageStart} – {yearPageStart + 11}
                  </span>
                  <NavButton
                    label="Next years"
                    onClick={() => setYearPageStart((current) => current + 12)}
                  />
                </div>

                <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Select year
                </p>

                <div className="grid grid-cols-3 gap-1">
                  {years.map((year) => {
                    const disabledYear = isYearDisabled(year);
                    const isActive = selectedDate?.getFullYear() === year;
                    const isCurrent = today.getFullYear() === year;

                    return (
                      <PickerCell
                        key={year}
                        active={isActive}
                        today={isCurrent}
                        disabled={disabledYear}
                        onClick={() => {
                          setViewDate(
                            (current) => new Date(year, current.getMonth(), 1),
                          );
                          setPanel('months');
                        }}
                      >
                        {year}
                      </PickerCell>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-2 flex items-center justify-between border-t border-[var(--shell-border)] pt-2">
              <button
                type="button"
                onClick={() => {
                  const iso = toISODate(today);
                  if (!isDayDisabled(today)) {
                    onChange(iso);
                    setOpen(false);
                  }
                }}
                disabled={isDayDisabled(today)}
                className="text-[11px] font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                {panel !== 'days' && (
                  <button
                    type="button"
                    onClick={() => setPanel('days')}
                    className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Back
                  </button>
                )}
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                    }}
                    className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          'ui-select-trigger flex w-full items-center justify-between gap-1.5 border bg-input text-left shadow-sm transition-all duration-200',
          size === 'sm' ? 'rounded-lg' : 'rounded-xl',
          sizeClasses[size],
          error
            ? 'border-destructive focus-visible:ring-destructive/15'
            : 'border-[var(--input-border)] hover:border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10',
          disabled && 'cursor-not-allowed opacity-60',
          open && !error && 'border-primary ring-2 ring-primary/10',
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <CalendarDays
            className={cn('shrink-0 text-muted-foreground', iconSizeClasses[size])}
          />
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-200',
            iconSizeClasses[size],
            open && 'rotate-180 text-primary',
          )}
        />
      </button>
      {menu}
    </div>
  );
}
