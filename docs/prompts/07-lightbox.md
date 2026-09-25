# Prompt 07 — Phase 5: Lightbox Implementation (full text)

Date: 2026-09-19 · Tool: Claude (Cowork), model `claude-opus-5`

---

PHASE 5 — LIGHTBOX IMPLEMENTATION

Project: StayVista — Airbnb Listing Experience Clone. Phases 0–4 complete.

Goal: implement the Lightbox as the final gallery surface, layered above the
existing Photo Tour, using the measured reference evidence. Do not redesign the
Photo Tour; do not change its geometry unless a Lightbox integration bug
requires it; do not perform final cross-view visual QA beyond regression checks;
do not add new dependencies.

**§0 — Architectural model.** Listing → Photo Tour → Lightbox. There is no
independent listing-direct Lightbox state; captured URLs contain
`?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>`. So the Lightbox renders above the
Photo Tour, the tour stays mounted underneath, closing the Lightbox returns to
the same tour scroll position, closing the tour returns to the listing, and
focus restoration happens one layer at a time. Use the existing
`GalleryProvider`/`useGalleryView`; no second global state system.

**§1 — Critical focus / modal ownership.** Phase 4 identified the integration
issue: the tour owns its own `useDialog` behaviour. When the Lightbox opens the
tour must stop being the active focus-trapping surface. Required: on the
listing, no overlay; in the tour, the tour owns the trap; in the Lightbox, the
Lightbox owns the trap and the tour becomes inert behind it. When the Lightbox
closes, focus returns to its trigger inside the tour, the tour becomes active
again, and its `scrollTop` is unchanged. When the tour closes, focus returns to
its original listing trigger and listing scroll is restored. Both must never
trap focus simultaneously, and Tab must not reach the 43 tour photos while the
Lightbox is open. Use the existing focus infrastructure; if `useDialog` cannot
cleanly represent nested layers, make the smallest reusable extension rather
than duplicating modal logic.

**§2 — Geometry (authoritative).** Image maximum width 1100px; observed
1100 × 617.2. Preserve the source aspect ratio; do not distort; use a
contain-style presentation; centre the image in the available area. Navigation
arrows 40 × 40, 20px left and right insets, vertically centred as the captures
support. Do not invent different arrow dimensions.

**§3 — Overlay.** Full-screen above the tour: backdrop, centred image,
navigation controls, counter/category information, two exit controls. Backdrop
colour and opacity remain PROVISIONAL — use the existing provisional overlay
token, and no elaborate gradient or custom treatment. The overlay must lock
background scrolling, make the tour inert, contain focus, restore focus, support
Escape and respect `prefers-reduced-motion`.

**§4 — Two exit controls.** "Show all photos" ≈16px from top and left, returning
to the tour; "Close" ≈16px from top and right, closing the Lightbox back to the
tour. Use the measured semantics; do not replace them with one generic X. Use
appropriate accessible names.

**§5 — Photo counter.** Measured example "28 of 43": `currentIndex + 1` of
`totalPhotos` (43), updating as navigation occurs, plus the category name per
LIGHT-6/LIGHT-7, staying synchronised with the selected photo. Do not hard-code
"28 of 43".

**§6 — Photo order.** The existing flat 43-photo array is the single source of
truth; navigation follows that global ordering; do not reorder for the Lightbox.
Selecting photo X in the tour opens the Lightbox at the exact corresponding
global index, and previous/next operate on adjacent global indices.

**§7 — Previous / next.** 40 × 40, 20px inset, vertically centred, and
**navigation does not wrap**: Previous disabled at the first photo, Next at the
last, never 1 → 43 or 43 → 1. This applies to keyboard navigation too. Use
semantic buttons with an appropriate disabled state.

**§8 — Keyboard.** ArrowLeft previous, ArrowRight next, Escape close, operating
on the active Lightbox. Arrow keys must not scroll the tour underneath; prevent
default where appropriate. Tab stays inside; focus starts on a logical control;
on close focus returns to the exact tour tile that opened it.

**§9 — Image loading.** `next/image` where appropriate, intrinsic dimensions, no
layout shift, contain-style sizing, aspect preserved, 1100px maximum, within
viewport bounds, no horizontal overflow. Do not package reference images —
continue the documented runtime image-origin strategy.

**§10 — Photo-to-photo transition.** PROVISIONAL: either no animation, or a very
restrained opacity transition from existing motion tokens. No elaborate
zoom/swipe. Respect `prefers-reduced-motion: reduce`. Document it as provisional.

**§11 — Backdrop click.** LIGHT-8 remains unresolved. Do not guess: preserve the
Phase 3/4 decision that backdrop click does **not** close, and document it as a
deliberate divergence from unknown reference behaviour.

**§12 — Accessibility.** Dialog semantics, `aria-modal="true"`, an accessible
dialog label, an accessible image alternative, named Previous/Next/Close and
return-to-tour controls, visible keyboard focus, focus trap, focus restoration,
background inertness, body scroll locking. Do not reproduce reference
accessibility defects; the tour must not remain keyboard reachable while the
Lightbox is active.

**§13 — Photo Tour integration.** On activating a tour thumbnail: determine the
global index, store the Lightbox trigger, keep the tour mounted, preserve its
`scrollTop`, open the Lightbox above it, move focus in and trap it. On close:
close the Lightbox, restore the tour's active state, restore focus to the exact
trigger, preserve `scrollTop` exactly. Do not remount the tour unnecessarily.

**§14 — Gallery state.** Extend `useGalleryView` only as needed; it should
support listing/tour/lightbox and `photoIndex` without redundant variables. The
Lightbox derives current photo, index, total, category and previous/next
availability from the existing array. Avoid duplicated gallery state.

**§15 — Visual tokens.** Use existing tokens. Backdrop colour and opacity, radii,
shadows, focus ring, transition duration/easing, exact typography and contrast
ratios remain PROVISIONAL. No raw colours or magic values in component code;
maintain `verify:tokens` compliance.

**§16 — Responsive scope.** Desktop only; validate at 1280, 1339, 1440, 1600 and
2005. The image max-width stays 1100px, there must be no horizontal document
overflow, and arrow placement stays at the measured 20px viewport inset.

**§17 — Test harness.** Create `scripts/verify-geometry/audit-lightbox.mjs` with
assertions for: opens from the tour, correct photo index, 43 total, 1100px image
max width, aspect preservation, 40 × 40 controls, 20px insets, first-photo
Previous disabled, last-photo Next disabled, no wrap, counter correctness,
category correctness, Escape closes, ArrowLeft/ArrowRight navigate, focus enters
and stays trapped, the tour becomes inert, focus returns to the exact trigger,
the tour's `scrollTop` is unchanged, and no horizontal overflow. Run against
photos 1, 25, 28, 40 and 43 — the positions the existing evidence supports.

**§18 — Regression.** Do not break Phase 2's 66 geometry assertions, Phase 3's 22
interaction assertions plus structural accessibility and token provenance, or
Phase 4's 112 photo-tour assertions.

**§19 — Performance.** Do not preload all 43 large images; load the active image
immediately; prev/next preloading only if simple and not request-heavy. No new
image library, no virtualization, no animation library.

**§20 — Documentation.** Update `docs/12-measurements.md`,
`VERIFICATION-QUEUE.md`, the Lightbox documentation, the README and
`docs/13-asset-strategy.md` if necessary, and `PROMPTS.md`. Record "Prompt 07 —
Phase 5 Lightbox Implementation" and document the 1100px cap, 40px controls,
20px inset, no-wrap navigation, counter behaviour, two exits, the nested overlay
architecture, focus ownership, tour scroll preservation, the unresolved
backdrop-click behaviour and the provisional visual tokens.

**§21 — Validation.** Attempt audit-lightbox, the tour audit, geometry,
interaction, accessibility and token audits, TS/TSX parse, markdownlint,
`tsc --noEmit`, `eslint`, `next build` and a runtime console check. The npm
registry may still block dependency installation — if so report **BLOCKED — npm
registry**. Do not reinterpret dependency failures as application-code failures,
and do not claim a blocked check passed.

**§22 — Final quality gate.** A 30-item checklist covering the Lightbox
existing above the tour, the tour staying mounted, 43-photo global ordering,
1100px max width, the 1100 × 617.2 reference geometry, 40 × 40 arrows at 20px
inset, no wrap, correct disabled ends, counter, category caption, two exits,
Escape, ArrowLeft, ArrowRight, focus trap, the tour being unreachable while the
Lightbox is active, focus restoration, tour scroll preservation, background
inertness, body scroll lock, no horizontal overflow, reduced motion, no new
dependencies, no animation library, no packaged reference images or proprietary
font, Phase 2/3/4 tests still passing, documentation updated and `PROMPTS.md`
updated with Prompt 07.

**§23 — Stop.** No final project-wide visual polish, no pixel-perfect claim, no
ZIP yet. Return: what was implemented; Lightbox architecture; gallery state
changes; focus ownership behaviour; navigation behaviour; geometry results;
accessibility results; Photo Tour regression results; validation results;
remaining provisional values; remaining blockers; files changed; deliberate
divergences; and a recommendation for the final QA phase. Phase 6 will be the
final cross-view visual QA, interaction QA, performance review, documentation
cleanup, architecture diagram verification and submission packaging.
