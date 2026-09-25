'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from '@/components/ui/ReferenceImage';
import { useDialog } from '@/hooks/useDialog';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { Icon } from '@/components/ui/Icon';
import { LightboxControls } from './LightboxControls';
import type { Photo, PhotoCategory } from '@/lib/types';

/* MEASURED: the image renders 1100px wide at every captured viewport. */
const IMAGE_SIZE = '1100px';

interface LightboxProps {
  open: boolean;
  /** Index into the flat 43-photo array — the single ordering for all views. */
  photoIndex: number;
  photos: Photo[];
  categories: PhotoCategory[];
  onClose: () => void;
  /** Relative step, so rapid repeats compose rather than cancel. */
  onStep: (delta: number) => void;
  /** The photo tile that opened it, for focus restoration. */
  returnFocusTo?: HTMLElement | null;
}

/**
 * The single-photo viewer.
 *
 * ## It is a layer, not a peer
 *
 * The tour stays mounted and scrolled underneath — every captured lightbox URL
 * was `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>`, never `modalItem` alone.
 * So this renders above `PhotoTour`, and `useDialog({ active })` hands the
 * keyboard to whichever layer is on top: while this is open the tour is `inert`,
 * traps nothing and answers no keys, and when this closes the tour takes the
 * keyboard back without its focus moving.
 *
 * The reference does not do this. With its lightbox open, its photo tour is
 * still `role="dialog" aria-modal="true"` — two modals claiming the screen at
 * once, and 43 tour photos still in the tab order behind the one on display.
 * Measured in captures C, E, F and G; deliberately not reproduced.
 *
 * ## MEASURED geometry
 *
 *   image   1100 wide, FIXED — 1100 × 617.2 for a 1440 × 808 source and
 *           1100 × 825 for a 1440 × 1080 one, so the height is the source's
 *           aspect and only the width is capped. Centred on both axes.
 *   arrows  40 × 40, 20px from each edge, vertically centred (LIGHT-3)
 *   exits   "Show all photos" at (16, 16); Close 40 × 40 with a 24px right
 *           inset at y 16 (LIGHT-9)
 *   caption category name then "N of 43" (LIGHT-6, LIGHT-7)
 */
export function Lightbox({
  open,
  photoIndex,
  photos,
  categories,
  onClose,
  onStep,
  returnFocusTo,
}: LightboxProps) {
  const dialogRef = useDialog({ open, onClose, returnFocusTo });
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* Everything shown is derived from the flat array and the index — there is no
     second copy of "which photo is current" to fall out of step. */
  const photo = photos[photoIndex];
  const total = photos.length;
  const hasPrevious = photoIndex > 0;
  const hasNext = photoIndex < total - 1;

  const categoryName = useMemo(() => {
    if (!photo) return null;
    return categories.find((category) => category.id === photo.categoryId)?.name ?? null;
  }, [categories, photo]);

  const goPrevious = useCallback(() => onStep(-1), [onStep]);
  const goNext = useCallback(() => onStep(1), [onStep]);

  useKeyboardNav(dialogRef, {
    enabled: open,
    onPrevious: goPrevious,
    onNext: goNext,
    hasPrevious,
    hasNext,
  });

  if (!mounted || !open || !photo) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="lightbox"
    >
      {/* LIGHT-8 is unresolved, so the backdrop does not close on click. Both
          exits and Escape do, so this is never a trap. Phase 3 decision, kept. */}
      <div className="lightbox__backdrop" />

      <h2 id={titleId} className="visually-hidden">
        Photo viewer
      </h2>

      {/* LIGHT-9, MEASURED: two exits, not one generic X. */}
      <button
        type="button"
        className="icon-button lightbox__exit lightbox__exit--tour"
        aria-label="Back to all photos"
        data-dialog-initial-focus
        onClick={onClose}
      >
        <Icon name="grid" size={16} />
      </button>

      <button
        type="button"
        className="icon-button lightbox__exit lightbox__exit--close"
        aria-label="Close photo viewer"
        onClick={onClose}
      >
        <Icon name="close" size={16} />
      </button>

      <figure className="lightbox__figure">
        <Image
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={IMAGE_SIZE}
          priority
          className="lightbox__image"
        />

        {/* The caption IS the live region — announcing the same text twice
            would make a screen reader read every step in duplicate. */}
        <figcaption className="lightbox__caption" aria-live="polite">
          {categoryName ? <span className="lightbox__category">{categoryName}</span> : null}
          <span className="lightbox__counter">
            {photoIndex + 1} of {total}
          </span>
        </figcaption>
      </figure>

      <LightboxControls
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={goPrevious}
        onNext={goNext}
      />
    </div>,
    document.body,
  );
}
