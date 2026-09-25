'use client';

import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `threshold`.
 *
 * Uses a passive scroll listener read inside `requestAnimationFrame`, so the
 * handler never forces layout during the scroll itself and state updates at
 * most once per frame.
 */
export function useScrollThreshold(threshold: number): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      setPassed(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };

    read(); // in case the page loads already scrolled
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return passed;
}
