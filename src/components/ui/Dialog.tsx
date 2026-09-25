'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '@/hooks/useDialog';
import { Icon } from './Icon';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Visible heading; also becomes the dialog's accessible name. */
  title: string;
  /** Hide the heading visually but keep it as the accessible name. */
  titleHidden?: boolean;
  /** The control that opened it, for focus restoration. */
  returnFocusTo?: HTMLElement | null;
  /** `panel` is the centred 780px card; `full` is edge-to-edge (Phases 4–5). */
  variant?: 'panel' | 'full';
  children: React.ReactNode;
}

/**
 * The shared dialog shell.
 *
 * Built now, for the amenities dialog, precisely so the photo tour and the
 * lightbox inherit identical focus, inertness and scroll behaviour rather than
 * each growing their own. All of that lives in `useDialog`.
 *
 * Portalled to `<body>` so no ancestor's `overflow`, `transform` or stacking
 * context can clip or mis-layer it.
 *
 * Backdrop click does NOT close. LIGHT-8 — whether the reference closes on
 * backdrop click — is unresolved, and guessing either way would be inventing
 * behaviour. Escape and the close button both work, so the dialog is never a
 * trap. Recorded in docs/VERIFICATION-QUEUE.md.
 */
export function Dialog({
  open,
  onClose,
  title,
  titleHidden = false,
  returnFocusTo,
  variant = 'panel',
  children,
}: DialogProps) {
  const dialogRef = useDialog({ open, onClose, returnFocusTo });
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="dialog-layer">
      <div className="dialog-backdrop" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`dialog dialog--${variant}`}
      >
        <div className="dialog__bar">
          <button
            type="button"
            className="icon-button dialog__close"
            aria-label={`Close ${title.toLowerCase()}`}
            data-dialog-initial-focus
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="dialog__body">
          <h2
            id={titleId}
            className={titleHidden ? 'visually-hidden' : 'dialog__title'}
          >
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
