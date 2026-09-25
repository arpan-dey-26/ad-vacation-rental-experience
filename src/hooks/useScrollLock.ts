'use client';

import { useEffect } from 'react';

/**
 * Locks body scroll while `locked` is true, and restores the exact scroll
 * position when the last holder releases it.
 *
 * Naïve `overflow: hidden` sends the page to the top when released, which is
 * the bug a user notices as "it lost my place". Capturing `scrollY` at lock
 * time and restoring it afterwards is the fix.
 *
 * **Reference-counted since Phase 5.** The overlays nest: the lightbox opens
 * over a tour that is still open, so two holders want the lock at once. With a
 * plain boolean the inner one's cleanup released the body while the outer one
 * was still using it — and restored a scroll position captured *after* the page
 * had already been locked. The count makes nesting correct without either
 * overlay having to know the other exists.
 *
 * `scrollbar-gutter: stable` on <html> (globals.css) keeps the page from
 * shifting sideways when the scrollbar disappears. The reference does not
 * reserve that gutter and does shift by ~7.5px — a deliberate divergence
 * recorded as LAY-7.
 */

/* Module-level, because the holders are sibling components that must not need
   a shared context just to agree on one boolean. */
let holders = 0;
let restoreTo = 0;

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    if (holders === 0) {
      restoreTo = window.scrollY;
      document.body.dataset.scrollLocked = 'true';
    }
    holders += 1;

    return () => {
      holders -= 1;
      if (holders === 0) {
        delete document.body.dataset.scrollLocked;
        window.scrollTo(0, restoreTo);
      }
    };
  }, [locked]);
}
