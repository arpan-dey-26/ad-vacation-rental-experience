'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface ShareSaveActionsProps {
  title: string;
  /**
   * `text` is the listing header's labelled pair (MEASURED 158.2px wide).
   * `icon` is the photo tour's pair — MEASURED as two 40 × 40 icon-only
   * controls at the top right (TOUR-5). Same behaviour, different chrome.
   */
  variant?: 'text' | 'icon';
}

/**
 * Share and Save.
 *
 * Save is the only stateful control on the listing page. Its accessible name
 * changes with state ("Save this listing" → "Remove from saved") so a screen
 * reader hears what the button will do now, not what it did before.
 *
 * One implementation serves both the listing header and the photo tour, so the
 * saved-state semantics cannot drift between the two surfaces.
 *
 * Deliberately in-memory: persisting it would add a hydration-mismatch failure
 * mode for no fidelity gain (docs/08-data-model.md § Persistence).
 */
export function ShareSaveActions({ title, variant = 'text' }: ShareSaveActionsProps) {
  const [saved, setSaved] = useState(false);

  const compact = variant === 'icon';
  const className = compact ? 'icon-button' : 'text-action';

  return (
    <>
      <button type="button" className={className} aria-label={`Share ${title}`}>
        <Icon name="share" size={16} />
        {compact ? null : 'Share'}
      </button>

      <button
        type="button"
        className={className}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
        onClick={() => setSaved((current) => !current)}
      >
        <Icon name="heart" size={16} filled={saved} />
        {compact ? null : 'Save'}
      </button>
    </>
  );
}
