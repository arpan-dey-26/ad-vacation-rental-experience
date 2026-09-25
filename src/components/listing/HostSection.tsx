import Image from '@/components/ui/ReferenceImage';
import type { Host } from '@/lib/types';

/** MEASURED: 1,463 reviews, 4.68 rating, 2 years hosting, 8 co-hosts. */
export function HostSection({ host }: { host: Host }) {
  return (
    <>
      <div className="host__identity">
        {host.avatar ? (
          <Image
            src={host.avatar}
            alt=""
            width={64}
            height={64}
            sizes="64px"
            className="host__avatar"
          />
        ) : null}
        <div className="stack">
          <span className="highlight__title">{host.name}</span>
          <span className="highlight__description">Host</span>
        </div>
      </div>

      <ul className="host__stats">
        <li className="stack">
          <span className="highlight__title">
            {host.reviewCount.toLocaleString('en-IN')}
          </span>
          <span className="highlight__description">Reviews</span>
        </li>
        <li className="stack">
          <span className="highlight__title">{host.rating}★</span>
          <span className="highlight__description">Rating</span>
        </li>
        <li className="stack">
          <span className="highlight__title">{host.yearsHosting}</span>
          <span className="highlight__description">Years hosting</span>
        </li>
      </ul>

      {host.bio ? <p className="review__body">{host.bio}</p> : null}

      {host.coHosts?.length ? (
        <>
          <h3 className="highlight__title">Co-Hosts</h3>
          <ul className="host__cohosts">
            {host.coHosts.map((coHost) => (
              <li key={coHost.id}>
                {coHost.avatar ? (
                  <Image
                    src={coHost.avatar}
                    alt=""
                    width={20}
                    height={20}
                    className="host__cohost-avatar"
                  />
                ) : null}
                {coHost.name}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {host.responseRate ? (
        <ul className="host__cohosts">
          <li>Response rate: {host.responseRate}</li>
          {host.responseTime ? <li>{host.responseTime}</li> : null}
        </ul>
      ) : null}

      <p>
        <button type="button" className="pill-button">
          Message host
        </button>
      </p>
    </>
  );
}
