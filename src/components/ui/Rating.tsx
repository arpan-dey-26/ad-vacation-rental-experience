import { Icon } from './Icon';
import { formatRating } from '@/lib/format';

interface RatingProps {
  value: number;
  reviewCount?: number;
  /** Hide the star when the surrounding copy already carries the context. */
  showIcon?: boolean;
}

/**
 * A rating reads as one phrase to a screen reader ("Rated 4.95 out of 5 from 19
 * reviews") while rendering as the compact star + number + count the reference
 * shows. The visible parts are hidden from assistive tech so it is not read
 * twice.
 */
export function Rating({ value, reviewCount, showIcon = true }: RatingProps) {
  const label = reviewCount
    ? `Rated ${formatRating(value)} out of 5 from ${reviewCount} reviews`
    : `Rated ${formatRating(value)} out of 5`;

  return (
    <span className="rating">
      <span className="visually-hidden">{label}</span>
      <span aria-hidden="true" className="rating__visual">
        {showIcon ? <Icon name="star" size={14} filled /> : null}
        {formatRating(value)}
        {reviewCount ? ` · ${reviewCount} reviews` : null}
      </span>
    </span>
  );
}
