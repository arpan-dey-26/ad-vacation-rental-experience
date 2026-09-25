# Prompt 06 — Phase 4: Photo Tour Implementation (full text)

Date: 2026-09-19 · Tool: Claude (Cowork), model `claude-opus-5`

---

PHASE 4 — PHOTO TOUR IMPLEMENTATION

Project: StayVista — Airbnb Listing Experience Clone. Phases 0–3 complete.

Goal: implement the Photo Tour as a production-quality, desktop-only,
high-fidelity view based strictly on the measured reference evidence already
collected. **Do not implement the Lightbox in this phase.**

**§0 — Current evidence status.** The reference's page-script computed-style
probe has been attempted across multiple sessions and still cannot read
computed styles. Do not attempt to solve this through the same probe again. The
following are permanently `[PROVISIONAL]` unless independently measured later
through DevTools inspection: overlay backdrop colour/opacity; thumb, photo and
control radii; control shadows; scrolled tour-header shadow/border/background;
entrance transition duration and easing; thumbnail/photo hover transition;
active-category indicator colour; focus-ring styling; category/chip typography;
exact contrast ratios. Do not fabricate these values — use the existing token
system and existing provisional tokens. The Photo Tour geometry and behaviour
that IS measured is authoritative.

**§1 — Read the evidence** before implementation: `docs/12-measurements.md`,
`VERIFICATION-QUEUE.md`, `docs/02-reference-analysis.md`,
`docs/03-view-interaction-map.md`, `docs/13-asset-strategy.md`, all probe
captures, the Phase 3 `Dialog`/`useDialog`/`useScrollLock` implementation, the
typed photo/listing data, `PROMPTS.md`, and the existing harnesses. Do not
invent values where the evidence already contains a measurement.

**§2 — Photo data model.** Use the existing typed data: 43 photos, 9 categories
(Living room 1 — 3, Living room 2 — 7, Full kitchen — 2, Bedroom — 6, Full
bathroom — 1, Gym — 5, Exterior — 6, Pool — 3, Additional photos — 10). Do not
duplicate photo metadata in the UI; the photo array remains the single source of
truth, retaining stable id, category, ordered position, source, intrinsic
dimensions and alt metadata. Do not package or re-host proprietary reference
images — continue the documented runtime asset-origin strategy.

**§3 — View architecture.** Implement the tour as a real application view/state
using the existing `GalleryProvider`/`useGalleryView`, not a separate page and
not a second global state system. Selecting a photo prepares the Phase 5
lightbox flow. The tour must mount and unmount cleanly and preserve the
appropriate scroll position when exiting to the listing.

**§4 — Container geometry (authoritative).** The content block is a fixed
**976px**, not fluid; internal geometry is unchanged across the captured
viewport widths 1339 and 2005. The left edge follows
`(viewportWidth − 15px − 976px) / 2`; the 15px is observed scrollbar geometry.
Do not substitute an arbitrary responsive percentage width, and do not introduce
horizontal page overflow. The header row centres against the **full viewport**,
not the 976px column.

**§5 — Tour header.** Pinned: across internal scroll offsets −4412, −5112 and
−6213, and at multiple viewport widths, the controls hold their viewport
position. Implement Back at ~24px from left and ~24px from top; title centred
against the viewport at ~y 32.6; Share and Save. Visual shadow/border/background
treatment remains provisional — do not invent one beyond the token system. The
header must stay keyboard accessible, expose correct accessible names, be
semantically structured, sit above the photo content and not interfere with
scrolling. **Back is a back arrow, not an X close button.**

**§6 — Tour title.** Use the measured ≈22.9px line box. The font size itself is
CALIBRATED, not measured — use the existing typography calibration methodology
and do not claim it is directly measured.

**§7 — Category navigation.** All 9 categories. Clicking a category **scrolls**
to its section; it must not filter. Use semantic buttons/links with accessible
names and keyboard activation, expose active/current state where appropriate,
scroll to the correct section, and avoid horizontal overflow. Use the existing
provisional token if the active-indicator colour is unavailable. Do not invent a
complex filtering interaction.

**§8 — Thumbnail grid (authoritative).** Outer 111.5 × 131.2px; image and label
dimensions follow the existing measured breakdown; horizontal gap 12px; measured
row structure. Thumbnails are real interactive controls: keyboard accessible,
visible focus, correct accessible name, no clickable non-button elements, no
fake interaction, photo ordering preserved. Clicking one prepares the
corresponding photo selection for Phase 5 — route it through the existing
`GalleryProvider` if necessary. Do not implement the Lightbox.

**§9 — Main photo column (authoritative).** Column 458px; full image
458 × 305.3px; half image 223 × 148.7px; aspect ≈ 1.5. Do not use arbitrary CSS
aspect ratios that alter the measured geometry. Images must preserve the
intended crop, carry intrinsic dimensions, avoid layout shift, stay locally
contained and not cause page-level horizontal overflow.

**§10 — Photo rhythm.** The measured 12px / 20px rhythm distinguishes individual
photo spacing, category boundaries and section transitions. Do not introduce
arbitrary large spacing between categories; the 9 sections stay visually
distinct while preserving the measured rhythm.

**§11 — Scroll behaviour.** Category clicks scroll to sections; the tour does not
filter; the header stays pinned while content scrolls. Preserve scroll position
appropriately when selecting a photo, returning from a later view, and closing
the tour. Implement the measured behaviour without introducing unnecessary
state.

**§12 — Dialog infrastructure.** Reuse the Phase 3 focus management, focus trap,
Escape handling, focus restoration, inert background and body scroll lock. Do
not create another dialog implementation — but do not force the tour into an
incorrect `Dialog` abstraction if a dedicated full-screen view is more natural.
Behaviour must remain accessible.

**§13 — Motion.** The entrance transition is `[PROVISIONAL]`: implement a minimal
CSS transition only if necessary, use existing motion tokens, respect
`prefers-reduced-motion`, add no animation library, invent no elaborate
animations, and document anything provisional.

**§14 — Hover / focus.** Hover styling is provisional; implement only restrained
states from existing tokens. Keyboard focus must be visible; accessibility takes
priority over reproducing an unmeasured focus ring. No decorative hover
animations.

**§15 — Accessibility.** Correct view semantics, logical heading hierarchy,
semantic buttons/links, accessible thumbnail and category names, accessible
Back/Share/Save, visible keyboard focus, logical tab order, no hidden focusable
elements, no clickable divs, reduced-motion support. Do not reproduce reference
accessibility defects.

**§16 — Performance.** 43 photos: avoid unnecessary client-side state; use
`next/image`, intrinsic dimensions, lazy loading below the fold, `priority` only
for immediately visible critical content, stable layout boxes and no unnecessary
re-renders. No virtualization library unless profiling proves it necessary.

**§17 — Responsive scope.** Desktop only. Validate at 1339 and 2005; also verify
at 1280, 1440 and 1600. Internal geometry stays fixed at 976px where measured.
No mobile behaviour in this phase.

**§18 — QA harness.** Add or extend automated checks for the 976px content
width, 458px photo column, 223px half photos, 111.5 × 131.2 thumbnails, 12px
thumbnail gaps, category count 9, photo count 43, per-category photo counts,
pinned header, Back/Share/Save presence, category navigation, no horizontal page
overflow, scroll retention where automatable, accessible names and keyboard
focusability. Do not remove any Phase 2 or Phase 3 assertions. Run geometry
checks at the required desktop widths.

**§19 — Visual validation.** Do not claim pixel-perfect parity. Colours, radii,
shadows, transitions, exact category/chip type scale and exact focus-ring
appearance remain provisional, but geometry and structural behaviour must be
validated against the measured evidence. Use screenshot comparison if possible;
otherwise report it as BLOCKED.

**§20 — Documentation.** Update `docs/12-measurements.md`,
`VERIFICATION-QUEUE.md`, the Photo Tour documentation,
`docs/13-asset-strategy.md` if needed, the README if necessary, and
`PROMPTS.md`. Record "Prompt 06 — Phase 4 Photo Tour Implementation". Document
the permanent computed-style limitation clearly: *"Reference computed styles
could not be obtained through page-script inspection across repeated sessions.
Geometry/behavior measurements are authoritative; visual-token values without
direct evidence remain provisional."* Also document the newly measured fixed
976px tour content width, viewport-centred header, pinned tour header,
multi-width confirmation and internal scroll-position evidence.

**§21 — Validation commands.** Attempt the tour geometry harness, the
interaction/a11y harness, TS/TSX parsing, token provenance, markdownlint,
`tsc --noEmit`, `eslint`, `next build` and a runtime console check. Environment
restrictions may continue to block `npm install`, `tsc`, `eslint`, `next build`
and runtime screenshot validation. **If blocked, report BLOCKED. Never report
blocked checks as PASS.**

**§22 — Final quality gate.** A 23-item checklist covering: tour implemented; 43
photos; 9 categories; 976px fixed content block; 458px photo column; 223px half
photos; 111.5 × 131.2 thumbnails; 12px thumbnail spacing; 12/20 category rhythm;
pinned header; Back/Share/Save; category clicks scroll rather than filter;
scroll retention; accessible controls; keyboard navigation; reduced motion; no
horizontal overflow; existing Phase 2/3 tests still pass; no proprietary font
bundled; no reference photography packaged; no animation library; no Lightbox;
documentation updated; `PROMPTS.md` updated with Prompt 06.

**§23 — Stop** after Phase 4. Do not implement the Lightbox. Return a concise
report covering: what was implemented; tour architecture; photo/category data
validation; geometry validation; header/pinning behaviour; category navigation;
scroll retention; accessibility results; performance decisions; validation
results; remaining provisional visual values; remaining blockers; files changed;
deliberate divergences; and an exact recommendation for Phase 5. Do not claim
pixel-perfect completion.
