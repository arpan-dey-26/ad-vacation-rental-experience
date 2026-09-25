'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * The listing description.
 *
 * TYPE-5 — the reference's clamp line count — is unmeasured, so the copy is not
 * clamped yet. The control is measured (104.2 x 21) and exists; expanding is
 * in-place rather than a dialog, because what the reference's "Show more" opens
 * was not observed either. Both are noted in the verification queue.
 */
export function ListingDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p className="description__body" id="listing-description">
        {description}
      </p>
      <button
        type="button"
        className="description__more"
        aria-expanded={expanded}
        aria-controls="listing-description"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? 'Show less' : 'Show more'}
        <Icon name={expanded ? 'chevron-left' : 'chevron-right'} size={14} />
      </button>
    </>
  );
}
