'use client';

import { Icon } from '@/components/ui/Icon';

interface LightboxControlsProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Previous and Next.
 *
 * MEASURED (LIGHT-3, LIGHT-5): 40 × 40, 20px from each viewport edge,
 * vertically centred — at 1339 Previous sits at x 20 and Next's right edge at
 * 1319; at 2005, x 20 and 1985. Both y 628 in a 1296-tall viewport, so their
 * centres are the viewport's.
 *
 * **They disable; they do not wrap.** Capture E caught photo 43 of 43 with Next
 * `disabled` and Previous enabled, while captures at photos 25, 28 and 40 had
 * both enabled. Photo 1 follows by symmetry. A real `disabled` attribute rather
 * than a styled-out class, so the control leaves the tab order and is announced
 * as unavailable — and so `useKeyboardNav`'s hard stop and this button's state
 * are driven by the same two booleans and cannot disagree.
 */
export function LightboxControls({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: LightboxControlsProps) {
  return (
    <>
      <button
        type="button"
        className="icon-button lightbox__nav lightbox__nav--previous"
        aria-label="Previous photo"
        disabled={!hasPrevious}
        onClick={onPrevious}
      >
        <Icon name="chevron-left" size={16} />
      </button>

      <button
        type="button"
        className="icon-button lightbox__nav lightbox__nav--next"
        aria-label="Next photo"
        disabled={!hasNext}
        onClick={onNext}
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </>
  );
}
