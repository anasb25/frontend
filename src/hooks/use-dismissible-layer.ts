'use client';

import { useEffect } from 'react';

interface UseDismissibleLayerOptions {
  enabled: boolean;
  onDismiss: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  extraRefs?: React.RefObject<HTMLElement | null>[];
}

function isInsideRefs(
  target: Node,
  refs: Array<React.RefObject<HTMLElement | null> | undefined>,
) {
  return refs.some((ref) => ref?.current?.contains(target));
}

export function useDismissibleLayer({
  enabled,
  onDismiss,
  containerRef,
  extraRefs = [],
}: UseDismissibleLayerOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        target instanceof Element &&
        target.closest('.ui-overlay-menu, [data-floating-layer="true"]')
      ) {
        return;
      }

      const refs = [containerRef, ...extraRefs];

      if (!isInsideRefs(target, refs)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onDismiss, containerRef, extraRefs]);
}

interface UseBodyScrollLockOptions {
  enabled: boolean;
}

export function useBodyScrollLock({ enabled }: UseBodyScrollLockOptions) {
  useEffect(() => {
    if (!enabled) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}
