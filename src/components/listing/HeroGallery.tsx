'use client';

import Image from '@/components/ui/ReferenceImage';
import { useGallery } from '@/components/gallery/GalleryProvider';
import { Icon } from '@/components/ui/Icon';
import type { Photo } from '@/lib/types';

/* MEASURED tile widths, used as `next/image` size hints. `sizes` has to be a
   literal string at build time, so it cannot read the CSS token — these are
   named here rather than inlined so the duplication is visible and reviewable
   against --size-hero-major / --size-hero-minor. */
const MAJOR_TILE_SIZE = '560px';
const MINOR_TILE_SIZE = '272px';

interface HeroGalleryProps {
  /** The five mosaic photos, in mosaic order. */
  photos: Photo[];
  /** Index of each mosaic photo within the full gallery, for the lightbox. */
  indices: number[];
  totalPhotos: number;
}

/**
 * The hero mosaic.
 *
 * MEASURED, and confirmed identical at 1339px and 2005px:
 *   1120 × 494 · columns 560 / 272 / 272 · rows 243 / 243 · 8px gaps
 *   first tile spans both rows
 *
 * The five photos are a **curated selection**, not the first five — the
 * reference shows tour photos 7, 4, 5, 13 and 29. That ordering comes from the
 * data (`listing.heroPhotoIds`), never from slicing.
 *
 * Client component because the tiles open overlays. It is the only client
 * component above the fold; everything around it stays server-rendered.
 *
 * E2.3 — "opens from any hero image" — is satisfied by `openLightbox`, not by
 * a second call to `openTour`: the reference nests the two, so a hero tile
 * opens the tour with the lightbox on top of it. Every captured lightbox URL
 * carried `modal=PHOTO_TOUR_SCROLLABLE` as well as `modalItem`. Until Phase 5
 * renders the lightbox, a hero tile lands the user in the tour.
 */
export function HeroGallery({ photos, indices, totalPhotos }: HeroGalleryProps) {
  const { openTour, openLightbox } = useGallery();

  return (
    <div className="hero" id="photos">
      {photos.map((photo, position) => (
        <button
          key={photo.id}
          type="button"
          className={`hero__tile${position === 0 ? ' hero__tile--major' : ''}`}
          aria-label={`Open photo ${position + 1} of ${totalPhotos}: ${photo.alt}`}
          onClick={(event) => openLightbox(indices[position] ?? 0, event.currentTarget)}
        >
          <Image
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            /* The mosaic is a fixed 1120 × 494 at every supported width, so the
               rendered sizes are known exactly and `sizes` can be literal — no
               guesswork, and no oversized download. */
            sizes={position === 0 ? MAJOR_TILE_SIZE : MINOR_TILE_SIZE}
            priority
            className="hero__image"
          />
        </button>
      ))}

      <button
        type="button"
        className="hero__show-all"
        onClick={(event) => openTour(event.currentTarget)}
      >
        <Icon name="grid" size={14} />
        Show all photos
      </button>
    </div>
  );
}
