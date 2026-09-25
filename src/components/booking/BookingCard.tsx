'use client';

import type { Listing } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

/**
 * The booking card.
 *
 * MEASURED: 372px outer, 1px border, 24px padding, 322px inner; the Reserve CTA
 * is 322 x 48. The check-in / checkout / guests fields are a SUMMARY — the
 * actual picker is the inline two-month calendar in the left column (SEC-12).
 * They are buttons because they open that picker; wiring is Phase 3.
 */
export function BookingCard({ listing }: { listing: Listing }) {
  const { pricing } = listing;

  return (
    <div className="booking-card">
      <p className="booking-card__price">
        <span className="booking-card__amount">
          {formatCurrency(pricing.totalMinor, pricing.currency)}
        </span>
        <span className="booking-card__value">for 5 nights</span>
      </p>

      <div className="booking-card__fields">
        <button type="button" className="booking-card__field">
          <span className="booking-card__label">Check-in</span>
          <span className="booking-card__value">10/18/2026</span>
        </button>
        <button type="button" className="booking-card__field">
          <span className="booking-card__label">Checkout</span>
          <span className="booking-card__value">10/23/2026</span>
        </button>
        <button type="button" className="booking-card__field booking-card__field--full">
          <span className="booking-card__label">Guests</span>
          <span className="booking-card__value">2 guests</span>
        </button>
      </div>

      <p className="booking-card__value">Free cancellation before 17 October</p>

      <button type="button" className="booking-card__cta">
        Reserve
      </button>

      <p className="booking-card__note">You won&rsquo;t be charged yet</p>
    </div>
  );
}
