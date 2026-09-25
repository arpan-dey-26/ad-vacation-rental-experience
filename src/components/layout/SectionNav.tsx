'use client';

import { PageShell } from './PageShell';
import { Rating } from '@/components/ui/Rating';
import { useScrollThreshold } from '@/hooks/useScrollThreshold';
import { formatCurrency } from '@/lib/format';

/**
 * The secondary section nav that appears on scroll.
 *
 * MEASURED: 67px tall, same 1280 shell and 80px gutter as the content, and
 * **viewport-pinned** — its viewport y stayed at −66 at both `scrollY` 0 and
 * `scrollY` 300, i.e. parked just above the top edge and not yet revealed.
 *
 * So the reveal threshold is **above 300px** and its exact value is unmeasured
 * (LAY-5c), as is the transition timing. `REVEAL_THRESHOLD` below is therefore
 * provisional and marked as such; it is deliberately a named constant in one
 * place so calibration is a one-line edit rather than a hunt.
 */

/** [PROVISIONAL] LAY-5c — measured only as "> 300px". */
const REVEAL_THRESHOLD = 640;

interface SectionNavProps {
  totalMinor: number;
  currency: string;
  nights: number;
  rating: number;
  reviewCount: number;
}

const LINKS = [
  { href: '#photos', label: 'Photos' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location', label: 'Location' },
] as const;

export function SectionNav({
  totalMinor,
  currency,
  nights,
  rating,
  reviewCount,
}: SectionNavProps) {
  const revealed = useScrollThreshold(REVEAL_THRESHOLD);

  return (
    <div
      className="section-nav"
      data-revealed={revealed}
      /* Hidden from assistive tech while parked off-screen, so a keyboard user
         cannot tab into a bar they cannot see. */
      aria-hidden={!revealed}
      inert={!revealed}
    >
      <PageShell as="nav" label="Listing sections" className="section-nav__inner">
        <ul className="section-nav__links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="section-nav__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="section-nav__summary">
          <div className="stack">
            <span>
              {formatCurrency(totalMinor, currency)} for {nights} nights
            </span>
            <Rating value={rating} reviewCount={reviewCount} />
          </div>
          <button type="button" className="booking-card__cta booking-card__cta--inline">
            Reserve
          </button>
        </div>
      </PageShell>
    </div>
  );
}
