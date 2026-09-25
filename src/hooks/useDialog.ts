'use client';

import { useEffect, useRef } from 'react';
import { useScrollLock } from './useScrollLock';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface UseDialogOptions {
  open: boolean;
  onClose: () => void;
  /** The control that opened the dialog; focus returns here on close. */
  returnFocusTo?: HTMLElement | null;
  /**
   * Whether this dialog is the **topmost** open overlay.
   *
   * Phase 5 added this. The overlays nest — the lightbox opens over a tour that
   * stays open — and exactly one of them may own the keyboard at a time.
   * An inactive dialog keeps its scroll lock and its restore-on-close promise,
   * but stops trapping focus, stops answering `Escape`, and stops making its
   * siblings `inert`; the active one inerts it instead, so its controls leave
   * the tab order and the accessibility tree while it is covered.
   *
   * Note this is the opposite of what the reference does: with its lightbox
   * open, its tour is *also* still `role="dialog" aria-modal="true"`, so two
   * modals claim the screen at once. Measured in captures C, E, F and G.
   */
  active?: boolean;
}

/**
 * The dialog behaviour contract, in one place so every overlay in the app has
 * exactly the same one — which is the point. The amenities dialog, the photo
 * tour and the lightbox all use this hook, so their focus handling cannot
 * drift apart.
 *
 * Contract:
 *   - focus moves to the dialog's initial control when it OPENS (not when it
 *     merely regains the keyboard — see `active`)
 *   - Tab wraps at both ends; Shift+Tab wraps backwards
 *   - Escape closes from any focus position inside
 *   - focus returns to the opening control on close
 *   - everything outside the topmost dialog is `inert`, so it leaves both the
 *     tab order and the accessibility tree
 *   - body scroll is locked while any dialog is open, and its position restored
 *     when the last one closes
 *
 * The reference does none of the focus work — measured: `document.activeElement`
 * stays on the trigger when its overlays open, and `main` is never inert
 * (A11Y-2). This is a deliberate divergence, documented in the README.
 */
export function useDialog({
  open,
  onClose,
  returnFocusTo,
  active = true,
}: UseDialogOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useScrollLock(open);

  /* Capture the opener at open time — by close time it may have moved or
     unmounted, so re-querying then is unreliable. */
  useEffect(() => {
    if (open) {
      openerRef.current =
        returnFocusTo ?? (document.activeElement as HTMLElement | null);
    }
  }, [open, returnFocusTo]);

  /* Move focus in. Keyed on `open` ALONE, deliberately: when a covering dialog
     closes and this one becomes active again, focus has just been restored to
     the control that opened the covering dialog. Re-running this then would
     snatch it back to the top of the page. */
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const initial =
      dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]') ??
      dialog.querySelector<HTMLElement>(FOCUSABLE);
    initial?.focus();
  }, [open]);

  /* Make everything outside this dialog inert while it owns the viewport. */
  useEffect(() => {
    if (!open || !active) return;
    const roots = [...document.body.children].filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && !node.contains(dialogRef.current),
    );
    for (const root of roots) root.inert = true;
    return () => {
      for (const root of roots) root.inert = false;
    };
  }, [open, active]);

  /* Trap Tab and answer Escape — only while this is the topmost dialog. */
  useEffect(() => {
    if (!open || !active) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      /* Queried per keypress, not cached: content can change while open, and a
         disabled Previous/Next drops out of the cycle. */
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', onKeyDown);
    return () => dialog.removeEventListener('keydown', onKeyDown);
  }, [open, active, onClose]);

  /* Restore focus when the dialog goes away. */
  useEffect(() => {
    if (open) return;
    const opener = openerRef.current;
    if (!opener) return;

    /* The opener has to still be reachable. Two ways it may not be: it has
       unmounted, or it is sitting in a layer that is STILL covered — a hero
       tile, say, when the lightbox it opened closes back onto the tour. That
       tile is `inert`, so focusing it silently does nothing and the keyboard is
       stranded on <body>, outside every dialog and unable to reach even
       Escape. This is the shape of bug the Phase 5 harness caught. */
    /* `preventScroll` matters more than it looks. `useScrollLock` has just put
       the page back where the user left it; a plain `focus()` would then scroll
       the trigger into view and undo that — the release harness caught the page
       landing at y 175 after being restored to 800. Restoring the position and
       then scrolling away from it is worse than not restoring it at all. The
       trigger was visible when the overlay was opened, so it is visible again
       now. */
    const reachable = document.contains(opener) && !opener.closest('[inert]');
    if (reachable) {
      opener.focus({ preventScroll: true });
      return;
    }

    /* Land on whatever layer is now on top instead. */
    const layers = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')];
    const topmost = layers[layers.length - 1];
    const fallback =
      topmost?.querySelector<HTMLElement>('[data-dialog-initial-focus]') ??
      topmost ??
      document.querySelector<HTMLElement>('main');
    fallback?.focus({ preventScroll: true });
  }, [open]);

  return dialogRef;
}
