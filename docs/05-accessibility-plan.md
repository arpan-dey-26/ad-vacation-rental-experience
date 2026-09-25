# 05 — Accessibility plan

The brief grades keyboard navigation, focus management and accessibility (D1–D3,
I2). Where the reference is weaker than this plan, this plan wins and the README
records the divergence — an accessibility gap is not a visual deviation.

## Semantic HTML

- One `<h1>`: the listing title. Sections use `<h2>`; sub-blocks use `<h3>`. No
  level is skipped and no heading is chosen for its size.
- Landmarks: `<header>`, `<main id="main">`, `<footer>`, plus `<nav>` for the
  photo-tour category strip. Each `<section>` that needs a name gets
  `aria-labelledby` pointing at its own heading.
- A skip link to `#main` as the first focusable element (already in
  `src/app/layout.tsx`).
- Anything that performs an action is a `<button>`. Anything that navigates is an
  `<a href>`. No clickable `<div>`s anywhere, including hero tiles and photo-tour
  thumbnails.
- The capacity row ("3 guests · 1 bedroom · …") is a `<ul>` of `<li>`s with the
  separator produced in CSS, so a screen reader reads four items rather than one
  run-on string punctuated by dots.
- Lists are lists: amenities, highlights, house rules, review cards.

## Names

Every control says what it does, in full, even when the visible label is shorter:

| Control | Accessible name |
| --- | --- |
| Hero tile | "Open photo N of M: `alt`" |
| Show all photos | "Show all N photos" |
| Share | "Share this listing" |
| Save | "Save this listing" / "Remove from saved" — the name reflects state |
| Photo-tour category | "Jump to `category name`" |
| Photo-tour close | "Close photo tour" |
| Lightbox prev / next | "Previous photo" / "Next photo" |
| Lightbox close | "Close photo viewer" |

Icon-only buttons carry the name via `aria-label`; decorative SVGs inside labelled
buttons are `aria-hidden="true"` with `focusable="false"`.

## Images

Alt text lives in `src/data/listing.ts`, because it is content. Photos get
descriptive alt ("Living room with orange sofa and patterned rug"), not
"image 1". Purely decorative graphics get `alt=""`. The `Photo.alt` field is
**required** in the type so a photo cannot be added without one.

## Keyboard

- Tab order follows visual order everywhere. No positive `tabindex`.
- Every focusable element has a visible `:focus-visible` ring at ≥3:1 contrast
  against its own background. Controls sitting on photography get a ring plus a
  contrasting halo so the ring survives a light image.
- `:focus-visible` only — pointer users never see a ring, keyboard users always
  do.
- No keyboard trap outside a modal dialog, and a deliberate one inside each.

## Dialogs — photo tour and lightbox

Both implement the same contract, via one shared `useDialog` hook so the
behaviour cannot drift between them:

1. `role="dialog"` with `aria-modal="true"` and `aria-labelledby` pointing at the
   dialog's own visible heading (or `aria-label` where there is no visible one).
2. **Focus in.** On open, focus moves to the close button. Chosen over the
   heading so the first Tab press goes forward into content, and over prev/next
   so that arrow keys are unambiguous.
3. **Focus trap.** Tab from the last control wraps to the first; Shift+Tab from
   the first wraps to the last. Implemented by querying focusable descendants at
   trap time, not from a cached list, so dynamically rendered controls are
   included.
4. **Escape closes**, from any focus position inside the dialog.
5. **Focus out.** On close, focus returns to the exact element that opened the
   dialog — stored as a ref at open time, not re-queried on close. If that
   element has since unmounted, focus falls back to `<main>`.
6. **Background inert.** The page root gets `inert` while a dialog is open, which
   removes it from the tab order and the accessibility tree in one step, with
   `aria-hidden="true"` as the fallback for older engines.
7. **Scroll lock.** `document.body[data-scroll-locked="true"]` sets
   `overflow: hidden`. `scrollbar-gutter: stable` on `<html>` (already set) stops
   the horizontal shift. The page's `scrollY` is captured on open and restored on
   close.

## Lightbox specifics

- `←` / `→` step between photos (E3.4). These are bound at the dialog level, so
  they work regardless of which control has focus.
- A `aria-live="polite"` region announces "Photo N of M — `caption`" after each
  step. Debounced so holding an arrow key does not flood the queue.
- At the ends, either wrap or disable per LIGHT-5. If disabled, the control gets
  `disabled` (not `aria-disabled`) so it leaves the tab order, and the
  announcement says so.
- The current photo's alt text is on the `<img>`; the announcement carries the
  position. Neither duplicates the other.

## Contrast

Verified with computed values, not by eye — the procedure is in
`.claude/skills/accessibility-audit/SKILL.md`. Thresholds: 4.5:1 body text, 3:1
large text and UI boundaries. The known risk areas are the lightbox controls and
the "Show all photos" button, which sit on photography; both get an opaque or
scrimmed background rather than relying on the image behind them.

## Motion

`prefers-reduced-motion: reduce` suppresses all transitions (already in
`globals.css`). Verified by emulating the query and re-running the dialog
checklist, per `04-motion-map.md`.

## What gets checked, and when

The `accessibility-audit` skill runs against every overlay change; the full sweep
runs in `release-qa` before the submission is packaged. Both require the check to
be *performed* — an issue inferred from source without reproducing it is reported
as "not verified", never as a pass.
