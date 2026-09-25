'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * The one piece of state the three views share.
 *
 * Modelled as a discriminated union rather than three booleans so illegal
 * combinations cannot be represented.
 *
 * ## Why the lightbox has no `from`
 *
 * It had one, until the captured URLs were read properly. Every lightbox
 * capture — C, E, F and G — carried
 * `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>`, and the tour alone carried
 * `?modal=PHOTO_TOUR_SCROLLABLE`. The reference has no listing-direct lightbox:
 * the tour is always underneath. Capture E confirms it from the other side —
 * with the lightbox open on photo 43, the tour beneath is still at scroll 0,
 * exactly where opening it would leave it.
 *
 * So the lightbox is a layer on the tour, not a sibling of it, and a `from`
 * field would only ever hold one value. This also settles E2.3 ("opens from any
 * hero image"): a hero tile opens the tour, with the lightbox on top of it.
 */
/** Navigation stops at the ends rather than wrapping (LIGHT-5). */
const clamp = (index: number, total: number) =>
  Math.min(Math.max(index, 0), Math.max(total - 1, 0));

export type GalleryView =
  | { kind: 'closed' }
  | { kind: 'tour' }
  | { kind: 'lightbox'; photoIndex: number };

export interface GalleryController {
  view: GalleryView;
  openTour: (trigger?: HTMLElement | null) => void;
  openLightbox: (photoIndex: number, trigger?: HTMLElement | null) => void;
  /**
   * Move `delta` photos through the flat array. Clamped at both ends, because
   * navigation does not wrap (LIGHT-5, MEASURED).
   */
  stepPhoto: (delta: number) => void;
  /** Lightbox → tour → listing, one layer at a time. */
  close: () => void;
  /** The listing control that opened the tour. */
  tourTrigger: React.RefObject<HTMLElement | null>;
  /** The control that opened the lightbox — a hero tile, or a photo in the tour. */
  lightboxTrigger: React.RefObject<HTMLElement | null>;
}

export function useGalleryView(totalPhotos: number): GalleryController {
  const [view, setView] = useState<GalleryView>({ kind: 'closed' });

  /* Two triggers, not one. The views nest, so a single ref is overwritten by
     the inner one and the tour loses its way back to "Show all photos" — a
     defect the Phase 4 harness caught. Each layer remembers its own opener,
     captured at open time: by close time it may have moved or unmounted. */
  const tourTrigger = useRef<HTMLElement | null>(null);
  const lightboxTrigger = useRef<HTMLElement | null>(null);

  const openTour = useCallback((trigger?: HTMLElement | null) => {
    if (trigger) tourTrigger.current = trigger;
    setView({ kind: 'tour' });
  }, []);

  const openLightbox = useCallback((photoIndex: number, trigger?: HTMLElement | null) => {
    if (trigger) {
      lightboxTrigger.current = trigger;
      /* Opened from a hero tile: the tour mounts underneath, so the same tile
         is also where closing the tour has to return. Opened from inside the
         tour, `tourTrigger` already holds "Show all photos" and must not be
         overwritten. */
      if (!trigger.closest('.tour')) tourTrigger.current = trigger;
    }
    setView({ kind: 'lightbox', photoIndex: clamp(photoIndex, totalPhotos) });
  }, [totalPhotos]);

  /* Prev/next.
     A relative step applied with the FUNCTIONAL form, not an absolute index
     computed at render time. Two clicks landing in the same tick would both
     read the same rendered `photoIndex` and the second would undo the first —
     the Phase 5 harness reproduced exactly that with a burst of clicks. Asking
     for "one more" instead of "photo 29" makes repeats compose.

     The clamp lives here rather than in the component because this hook owns
     which photo is current, so it should own the bounds too. Guarded on `kind`
     so a late click cannot resurrect a closed lightbox. */
  const stepPhoto = useCallback(
    (delta: number) => {
      setView((current) =>
        current.kind === 'lightbox'
          ? { kind: 'lightbox', photoIndex: clamp(current.photoIndex + delta, totalPhotos) }
          : current,
      );
    },
    [totalPhotos],
  );

  const close = useCallback(() => {
    setView((current) =>
      /* One layer at a time. Closing the lightbox returns to the tour, which is
         still mounted and still scrolled where it was (TOUR-8). */
      current.kind === 'lightbox' ? { kind: 'tour' } : { kind: 'closed' },
    );
  }, []);

  return useMemo(
    () => ({ view, openTour, openLightbox, stepPhoto, close, tourTrigger, lightboxTrigger }),
    [view, openTour, openLightbox, stepPhoto, close],
  );
}
