import type { Listing } from '@/lib/types';
import { Rating } from '@/components/ui/Rating';
import { ReviewCard } from './ReviewCard';

const BREAKDOWN_LABELS: Array<[keyof Listing['ratingBreakdown'], string]> = [
  ['cleanliness', 'Cleanliness'],
  ['accuracy', 'Accuracy'],
  ['checkIn', 'Check-in'],
  ['communication', 'Communication'],
  ['location', 'Location'],
  ['value', 'Value'],
];

/**
 * Reviews: overall rating, the six-category breakdown, the tag scroller and the
 * six cards the reference renders before "Show all 19 reviews".
 *
 * Only six of nineteen were captured — the rest live behind a dialog nobody has
 * opened (DATA-3). The count in the button comes from the data, so it stays
 * honest when the remaining thirteen arrive.
 */
export function Reviews({ listing }: { listing: Listing }) {
  return (
    <>
      <div className="reviews__summary">
        <Rating value={listing.rating} reviewCount={listing.reviewCount} />
        {listing.isGuestFavourite ? (
          <span className="rating__visual">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M9 21C2 18 2 9 7 3M15 21C22 18 22 9 17 3M5 7L3 5M4 11L1 9M5 15L2 14M7 18L4 18M19 7L21 5M20 11L23 9M19 15L22 14M17 18L20 18"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Guest favourite
          </span>
        ) : null}
      </div>

      <ul className="reviews__breakdown">
        {BREAKDOWN_LABELS.map(([key, label]) => (
          <li key={key} className="reviews__breakdown-row">
            <span>{label}</span>
            <span>{listing.ratingBreakdown[key].toFixed(1)}</span>
          </li>
        ))}
      </ul>

      <ul className="reviews__tags" aria-label="What guests mentioned">
        {listing.reviewTags.map((tag) => (
          <li key={tag.id}>
            <button type="button" className="review-tag">
              <span>{tag.label}</span>
              <span aria-hidden="true">{tag.count}</span>
              <span className="visually-hidden">mentioned in {tag.count} reviews</span>
            </button>
          </li>
        ))}
      </ul>

      <ul className="reviews__grid">
        {listing.reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>

      <p>
        <button type="button" className="pill-button">
          Show all {listing.reviewCount} reviews
        </button>
      </p>
    </>
  );
}
