import type { Listing } from '@/lib/types';
import { Rating } from '@/components/ui/Rating';

/**
 * "Entire serviced apartment in Candolim, India" plus the capacity row.
 *
 * The capacity row is built from structured data, not a stored sentence, so it
 * pluralises correctly and reads as four list items rather than one run-on
 * string. The middle dots come from CSS (`sections.css`), so they are never
 * announced.
 */
export function ListingOverview({ listing }: { listing: Listing }) {
  const { capacity } = listing;

  const items = [
    { key: 'guests', value: capacity.guests, noun: 'guest' },
    { key: 'bedrooms', value: capacity.bedrooms, noun: 'bedroom' },
    { key: 'beds', value: capacity.beds, noun: 'bed' },
    { key: 'bathrooms', value: capacity.bathrooms, noun: 'bathroom' },
  ];

  return (
    <>
      <ul className="overview__capacity">
        {items.map((item) => (
          <li key={item.key}>
            {item.value} {item.noun}
            {item.value === 1 ? '' : 's'}
          </li>
        ))}
      </ul>
      <p className="stack">
        <Rating value={listing.rating} reviewCount={listing.reviewCount} />
      </p>
    </>
  );
}
