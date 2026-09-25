'use client';

import { useEffect, type RefObject } from 'react';

interface UseKeyboardNavOptions {
  /** Only bind while the surface is open and owns the keyboard. */
  enabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** No-ops at the ends: navigation does not wrap (LIGHT-5, MEASURED). */
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * ArrowLeft / ArrowRight stepping for the lightbox (E3.4).
 *
 * Bound to the lightbox element rather than to `window` for two reasons: the
 * photo tour underneath is a scroll container, and an arrow key that reached it
 * would scroll 43 photos behind a covering overlay; and a window listener would
 * keep firing after the lightbox closed unless it were carefully torn down.
 *
 * `preventDefault` matters even so — with focus on a button, the arrow keys are
 * the browser's own scroll keys, and suppressing them is what keeps the page
 * still while the photo changes.
 *
 * The ends are hard stops, not wraps: at photo 43 ArrowRight does nothing,
 * exactly as the measured `disabled` Next does (LIGHT-5).
 */
export function useKeyboardNav(
  ref: RefObject<HTMLElement | null>,
  { enabled, onPrevious, onNext, hasPrevious, hasNext }: UseKeyboardNavOptions,
): void {
  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      event.preventDefault();
      if (event.key === 'ArrowLeft' && hasPrevious) onPrevious();
      if (event.key === 'ArrowRight' && hasNext) onNext();
    };

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [ref, enabled, onPrevious, onNext, hasPrevious, hasNext]);
}
