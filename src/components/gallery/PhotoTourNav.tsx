'use client';

import Image from '@/components/ui/ReferenceImage';
import type { Photo, PhotoCategory } from '@/lib/types';

/* MEASURED: the thumbnail image renders 111.5 × 105.2. */
const THUMB_SIZE = '112px';

interface PhotoTourNavProps {
  categories: PhotoCategory[];
  /** First photo of each category — MEASURED as the thumbnail the tour uses. */
  thumbnails: Array<Photo | undefined>;
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}

/**
 * The category strip at the top of the tour.
 *
 * MEASURED (TOUR-2): buttons 111.5 × 131.2 (149.2 when the label wraps to two
 * lines), image 111.5 × 105.2, 12px gaps on both axes, 8 per row, strip 976
 * wide — which is exactly 8 × 111.5 + 7 × 12, so the strip width and the tour
 * content width are the same measurement seen twice.
 *
 * TOUR-6, MEASURED: selecting a category SCROLLS to it. It does not filter —
 * all 43 photos are in the DOM in one continuous sequence at every scroll
 * position we captured. No filtering state exists here for that reason.
 *
 * Every thumbnail was verified to be the first photo of its group, which is
 * what confirmed the category boundary mapping in the first place.
 */
export function PhotoTourNav({
  categories,
  thumbnails,
  activeCategoryId,
  onSelect,
}: PhotoTourNavProps) {
  return (
    <nav className="tour__nav" aria-label="Photo categories">
      <ul className="tour__nav-list">
        {categories.map((category, position) => {
          const thumbnail = thumbnails[position];
          const active = category.id === activeCategoryId;

          return (
            <li key={category.id}>
              <button
                type="button"
                className="tour__thumb"
                data-active={active}
                /* `aria-current` rather than `aria-pressed`: this is "you are
                   here in the tour", not a toggle the user switched on. */
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(category.id)}
              >
                {thumbnail && (
                  <Image
                    src={thumbnail.src}
                    alt=""
                    width={thumbnail.width}
                    height={thumbnail.height}
                    sizes={THUMB_SIZE}
                    className="tour__thumb-image"
                  />
                )}
                <span className="tour__thumb-label">{category.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
