'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '@/hooks/useDialog';
import { Icon } from '@/components/ui/Icon';
import { ShareSaveActions } from '@/components/listing/ShareSaveActions';
import { PhotoCategoryBlock } from './PhotoCategoryBlock';
import { PhotoTourNav } from './PhotoTourNav';
import type { Photo, PhotoCategory } from '@/lib/types';

interface PhotoTourProps {
  open: boolean;
  onClose: () => void;
  onSelectPhoto: (index: number, trigger: HTMLElement) => void;
  photos: Photo[];
  categories: PhotoCategory[];
  listingTitle: string;
  /** The control that opened the tour, for focus restoration. */
  returnFocusTo?: HTMLElement | null;
  /** False while the lightbox is layered on top — see `useDialog`. */
  active?: boolean;
}

/**
 * The photo tour.
 *
 * ## Why this is not a `<Dialog>`
 *
 * It reuses `useDialog` — the whole behaviour contract: focus in, focus trap,
 * Escape, focus restoration, background `inert`, body scroll lock — so its
 * focus handling cannot drift from the amenities dialog's. But it renders its
 * own shell, because the measurements rule out `Dialog`'s structure:
 *
 *   - MEASURED: the header centres on the FULL viewport (title mid-point =
 *     1339 / 2 and 2005 / 2), while the content centres on the SCROLLER's
 *     content box ((vw − 15 − 976) / 2 at both widths). Those two centres
 *     differ, which is only possible if the header sits OUTSIDE the scrolling
 *     region. `Dialog` puts its title inside the scrolling body.
 *   - MEASURED (TOUR-7): the header is pinned. Across four captured internal
 *     scroll offsets (−4412, −5112, −6213) Back stays at viewport (24, 24).
 *   - MEASURED (TOUR-5): the close affordance is a Back ARROW, not an X.
 *
 * Forcing those into the panel shell would mean overriding most of it.
 *
 * ## Phase 4 scope
 *
 * Selecting a photo calls `onSelectPhoto`, which moves the shared controller
 * into its `lightbox` state. The lightbox itself is Phase 5, so nothing renders
 * for that state yet — but the tour deliberately stays mounted underneath (see
 * `GalleryProvider`), which is the MEASURED behaviour: TOUR-8 shows the tour
 * keeping its own scroll position while the lightbox is open, and every
 * captured lightbox URL carried the tour's own query parameter alongside the
 * photo id. Phase 5 adds a component; it changes nothing here.
 */
export function PhotoTour({
  open,
  onClose,
  onSelectPhoto,
  photos,
  categories,
  listingTitle,
  returnFocusTo,
  active = true,
}: PhotoTourProps) {
  const dialogRef = useDialog({ open, onClose, returnFocusTo, active });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(new Map<string, HTMLElement>());
  const visibleRef = useRef(new Set<string>());
  const titleId = useId();
  const headingPrefix = useId();

  const [mounted, setMounted] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories[0]?.id ?? null,
  );

  useEffect(() => setMounted(true), []);

  /* Resolve each category's photos once. The flat array stays the single
     source of truth — categories hold ids, never copies. */
  const blocks = useMemo(() => {
    const byId = new Map(photos.map((photo, index) => [photo.id, { photo, index }]));

    return categories.map((category) => {
      const resolved = category.photoIds
        .map((id) => byId.get(id))
        .filter((entry): entry is { photo: Photo; index: number } => entry !== undefined);

      return {
        category,
        photos: resolved.map((entry) => entry.photo),
        startIndex: resolved[0]?.index ?? 0,
        thumbnail: resolved[0]?.photo,
      };
    });
  }, [categories, photos]);

  const registerSection = useCallback((categoryId: string, node: HTMLElement | null) => {
    if (node) sectionsRef.current.set(categoryId, node);
    else sectionsRef.current.delete(categoryId);
  }, []);

  /* Which category the reader is currently in. An IntersectionObserver rather
     than a scroll handler: it fires only on crossings, so nine categories cost
     nine callbacks over a full scroll instead of one per frame. */
  useEffect(() => {
    if (!open) return;
    const root = scrollerRef.current;
    if (!root) return;

    const order = categories.map((category) => category.id);
    const visible = visibleRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace(/^tour-/, '');
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setActiveCategoryId(first);
      },
      {
        root,
        /* Top inset clears the pinned header; the bottom inset stops a category
           counting as "current" merely because its last row is still on screen. */
        rootMargin: '-88px 0px -60% 0px',
      },
    );

    for (const node of sectionsRef.current.values()) observer.observe(node);
    return () => {
      observer.disconnect();
      visible.clear();
    };
  }, [open, categories]);

  /* TOUR-6, MEASURED: a category scrolls, it does not filter. `scrollIntoView`
     honours the scroller's computed `scroll-behavior`, which the global
     reduced-motion block forces to `auto` — so there is no JS branch for it. */
  const scrollToCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    sectionsRef.current.get(categoryId)?.scrollIntoView({ block: 'start' });
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="tour"
    >
      <div className="tour__header">
        <button
          type="button"
          className="icon-button tour__back"
          aria-label="Back to listing"
          data-dialog-initial-focus
          onClick={onClose}
        >
          <Icon name="arrow-left" size={16} />
        </button>

        <h2 id={titleId} className="tour__title">
          Photo tour
        </h2>

        <div className="tour__actions">
          <ShareSaveActions title={listingTitle} variant="icon" />
        </div>
      </div>

      <div className="tour__scroller" ref={scrollerRef}>
        <div className="tour__content">
          <PhotoTourNav
            categories={categories}
            thumbnails={blocks.map((block) => block.thumbnail)}
            activeCategoryId={activeCategoryId}
            onSelect={scrollToCategory}
          />

          <div className="tour__body">
            {blocks.map((block) => (
              <PhotoCategoryBlock
                key={block.category.id}
                category={block.category}
                photos={block.photos}
                startIndex={block.startIndex}
                totalPhotos={photos.length}
                headingId={`${headingPrefix}-${block.category.id}`}
                onSelectPhoto={onSelectPhoto}
                registerSection={registerSection}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
