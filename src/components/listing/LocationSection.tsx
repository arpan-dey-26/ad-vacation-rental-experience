import type { LocationInfo } from '@/lib/types';

/**
 * User-supplied static map inside the existing sized, labelled region.
 * It does not introduce a map provider or interactive map controls.
 */
export function LocationSection({ location }: { location: LocationInfo }) {
  return (
    <>
      <div
        className="location__map"
        role="img"
        aria-label={`Map of ${location.label}`}
        style={
          location.image
            ? {
                backgroundImage: `url("${location.image}")`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : undefined
        }
      >
        {location.image ? null : `Map — ${location.label}`}
      </div>
      <div className="stack">
        <span className="highlight__title">{location.label}</span>
        <p className="highlight__description">
          Exact location will be provided after booking.
        </p>
        {location.description ? (
          <p className="review__body">{location.description}</p>
        ) : null}
      </div>
    </>
  );
}
