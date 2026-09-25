'use client';

import { useState } from 'react';
import Image from '@/components/ui/ReferenceImage';
import type { Review } from '@/lib/types';
import { formatMonthYear } from '@/lib/format';

/** [PROVISIONAL] TYPE-5 — the reference's clamp length is unmeasured. */
const CLAMP_CHARS = 220;

/**
 * One review card. Client only because of its own "Show more"; the list around
 * it stays server-rendered.
 */
export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > CLAMP_CHARS;
  const body = expanded || !isLong ? review.body : `${review.body.slice(0, CLAMP_CHARS)}…`;

  return (
    <article className="stack">
      <div className="review__author">
        {review.authorAvatar ? (
          <Image src={review.authorAvatar} alt="" className="review__avatar" />
        ) : (
          <span className="review__avatar" aria-hidden="true">
            {review.authorName.charAt(0)}
          </span>
        )}
        <div className="stack">
          <span className="highlight__title">{review.authorName}</span>
          <span className="highlight__description">
            {review.authorMeta} · <time dateTime={review.date}>{formatMonthYear(review.date)}</time>
          </span>
        </div>
      </div>

      <p className="review__body">{body}</p>

      {isLong ? (
        <button
          type="button"
          className="description__more"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show less' : 'Show more'}
          <span className="visually-hidden"> of the review by {review.authorName}</span>
        </button>
      ) : null}
    </article>
  );
}
