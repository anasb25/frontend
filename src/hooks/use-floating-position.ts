'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FloatingPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'top' | 'bottom';
}

interface UseFloatingPositionOptions {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  align?: 'start' | 'end';
  offset?: number;
  maxHeight?: number;
  minWidth?: number;
  matchTriggerWidth?: boolean;
}

export function useFloatingPosition({
  open,
  triggerRef,
  align = 'start',
  offset = 6,
  maxHeight = 240,
  minWidth = 192,
  matchTriggerWidth = true,
}: UseFloatingPositionOptions) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const placement =
      spaceBelow >= 160 || spaceBelow >= spaceAbove ? 'bottom' : 'top';

    const availableSpace =
      (placement === 'bottom' ? spaceBelow : spaceAbove) - offset;
    const computedMaxHeight = Math.min(
      maxHeight,
      Math.max(availableSpace, 120),
    );

    const width = matchTriggerWidth
      ? Math.max(rect.width, minWidth)
      : Math.max(minWidth, rect.width);

    let left = align === 'end' ? rect.right - width : rect.left;
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - width - viewportPadding),
    );

    const top =
      placement === 'bottom'
        ? rect.bottom + offset
        : Math.max(viewportPadding, rect.top - offset - computedMaxHeight);

    setPosition({
      top,
      left,
      width,
      maxHeight: computedMaxHeight,
      placement,
    });
  }, [
    triggerRef,
    align,
    offset,
    maxHeight,
    minWidth,
    matchTriggerWidth,
  ]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  return position;
}
