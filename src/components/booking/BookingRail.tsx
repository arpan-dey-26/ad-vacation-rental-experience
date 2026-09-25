import type { Listing } from '@/lib/types';
import { BookingCard } from './BookingCard';
import { PromoStrip } from './PromoStrip';

/**
 * The right rail.
 *
 * Split from the card because BOOK-2 — whether the rail sticks, and from what
 * offset — is unmeasured. When it is measured, stickiness becomes one rule on
 * `.booking-rail` and the card does not change. Nothing here is sticky yet:
 * inventing the offset would be inventing a behaviour.
 */
export function BookingRail({ listing }: { listing: Listing }) {
  return (
    <aside className="booking-rail" aria-label="Reserve this stay">
      <PromoStrip />
      <BookingCard listing={listing} />
    </aside>
  );
}
