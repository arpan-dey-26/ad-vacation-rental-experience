'use client';

import { useRef, useState } from 'react';
import type { AmenityGroup } from '@/lib/types';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface AmenitiesProps {
  /** All groups; empty ones are measured evidence, not renderable content. */
  groups: AmenityGroup[];
  /** MEASURED from the "Show all 50 amenities" control. */
  totalCount: number;
}

/**
 * The collapsed amenity grid and the "What this place offers" dialog.
 *
 * A gap worth stating plainly: SEC-6b is open. The captures recorded the twelve
 * group headings in that dialog but not the items under them, and only the ten
 * featured amenities have names. So the dialog shows what was measured — the
 * ten — rather than fabricating forty more to fill twelve headings. The empty
 * groups stay in the data as evidence and are not rendered.
 */
export function Amenities({ groups, totalCount }: AmenitiesProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const featured = groups[0]?.items ?? [];
  const populated = groups.filter((group) => group.items.length > 0);

  return (
    <>
      <ul className="amenities__grid">
        {featured.map((amenity) => (
          <li
            key={amenity.id}
            className={cn('amenity', amenity.unavailable && 'amenity--unavailable')}
          >
            <Icon name={amenity.icon} />
            <span>{amenity.label}</span>
          </li>
        ))}
      </ul>

      <p>
        <button
          ref={triggerRef}
          type="button"
          className="pill-button"
          onClick={() => setOpen(true)}
        >
          Show all {totalCount} amenities
        </button>
      </p>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="What this place offers"
        returnFocusTo={triggerRef.current}
      >
        {populated.map((group) => (
          <section key={group.id} className="dialog__group">
            <h3 className="dialog__group-title">{group.title}</h3>
            <ul className="dialog__list">
              {group.items.map((amenity) => (
                <li
                  key={amenity.id}
                  className={cn(amenity.unavailable && 'amenity--unavailable')}
                >
                  <Icon name={amenity.icon} />
                  <span>{amenity.label}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Dialog>
    </>
  );
}
