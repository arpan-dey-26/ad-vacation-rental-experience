'use client';

import Image from '@/components/ui/ReferenceImage';
import type { Photo, PhotoCategory } from '@/lib/types';

/* MEASURED rendered widths, used as `next/image` size hints. `sizes` must be a
   literal at build time, so it cannot read the CSS token — named here rather
   than inlined so the duplication is visible against --size-tour-column and
   --size-tour-photo-half. */
const FULL_SIZE = '458px';
const HALF_SIZE = '223px';

/** One photo plus its position in the flat 43-photo array. */
interface PlacedPhoto {
  photo: Photo;
  index: number;
}

/** A row is one full-width photo, or a pair of halves. MEASURED (TOUR-4). */
interface PhotoRow {
  id: string;
  items: PlacedPhoto[];
}

/**
 * Groups a category's photos into the rows the reference lays out.
 *
 * The span of each photo is data, not a computed guess — it was read from the
 * rendered geometry of all 43 photos (458px = full, 223px = half) and lives in
 * `src/data/photos.ts`. This function only pairs adjacent halves, and carries
 * each photo's flat index so the tile does not have to search for it.
 */
function toRows(photos: Photo[], startIndex: number): PhotoRow[] {
  const rows: PhotoRow[] = [];

  for (let offset = 0; offset < photos.length; ) {
    const photo = photos[offset];
    if (!photo) break;

    const next = photos[offset + 1];
    const first: PlacedPhoto = { photo, index: startIndex + offset };

    if (photo.span === 'half' && next?.span === 'half') {
      rows.push({
        id: photo.id,
        items: [first, { photo: next, index: startIndex + offset + 1 }],
      });
      offset += 2;
    } else {
      rows.push({ id: photo.id, items: [first] });
      offset += 1;
    }
  }

  return rows;
}

interface PhotoCategoryBlockProps {
  category: PhotoCategory;
  /** This category's photos, resolved and in tour order. */
  photos: Photo[];
  /** Index of this category's first photo within the flat 43-photo array. */
  startIndex: number;
  totalPhotos: number;
  headingId: string;
  onSelectPhoto: (index: number, trigger: HTMLElement) => void;
  registerSection: (categoryId: string, node: HTMLElement | null) => void;
}

/**
 * One category of the photo tour: its name and feature chips in the left rail,
 * its photos in the right column.
 *
 * MEASURED (capture A at 1339px, confirmed at 2005px):
 *   column 458 wide, right-aligned at the content edge
 *   full 458 × 305.3 · half 223 × 148.7 · both aspect 1.5
 *   12px between rows inside a category, 20px between categories
 *
 * The reference marks category boundaries with nothing but that 8px difference
 * in gap — there is no heading, no rule and no landmark inside its tour. We
 * render a real `h3` per category instead: the tour is a list of named groups,
 * and a screen-reader user should be able to move between them. Divergence
 * recorded in docs/14-visual-fidelity-note.md § 5.
 */
export function PhotoCategoryBlock({
  category,
  photos,
  startIndex,
  totalPhotos,
  headingId,
  onSelectPhoto,
  registerSection,
}: PhotoCategoryBlockProps) {
  const rows = toRows(photos, startIndex);

  return (
    <section
      className="tour__category"
      id={`tour-${category.id}`}
      aria-labelledby={headingId}
      ref={(node) => {
        registerSection(category.id, node);
      }}
    >
      <div className="tour__rail">
        <h3 id={headingId} className="tour__category-name">
          {category.name}
        </h3>

        {category.features.length > 0 && (
          <ul className="tour__features">
            {category.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="tour__photos">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`tour__row${row.items.length === 2 ? ' tour__row--pair' : ''}`}
          >
            {row.items.map(({ photo, index }) => (
              <button
                key={photo.id}
                type="button"
                className="tour__photo"
                aria-label={`Open photo ${index + 1} of ${totalPhotos}: ${photo.alt}`}
                onClick={(event) => onSelectPhoto(index, event.currentTarget)}
              >
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  sizes={photo.span === 'full' ? FULL_SIZE : HALF_SIZE}
                  className="tour__image"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
