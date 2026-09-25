# Prompt 04 — Production Structural Implementation (full text)

Date: 2026-09-19 · Tool: Claude (Cowork), model `claude-opus-5`

---

PHASE 2 — PRODUCTION-GRADE STRUCTURAL IMPLEMENTATION

You are now moving from verified discovery into implementation. The objective of
this phase is to build the strongest possible structural foundation for the
StayVista Airbnb listing clone.

REFERENCE: https://airbnb-clone-umber-two.vercel.app

IMPORTANT: The reference is the visual/behavioural specification only. Do NOT
copy, scrape, lift-and-shift, or reproduce its source code, DOM implementation,
CSS, JavaScript, or framework structure. All implementation must be
independently authored.

SOURCE OF TRUTH — docs/12-measurements.md, VERIFICATION-QUEUE.md,
docs/02-reference-analysis.md, docs/03-interaction-map.md,
docs/13-asset-strategy.md, analysed probe captures, existing typed
listing/photo data, existing project architecture.

When a measurement is marked MEASURED, use it exactly. When something is
PROVISIONAL, do not pretend it is verified. Do not invent visual values simply
to make the page look complete.

PHASE 2 GOAL — Build the complete STRUCTURAL FOUNDATION of the desktop Listing
Page. The page should already feel like a real production interface in terms of
geometry, hierarchy, component architecture and interaction targets, even though
detailed typography, colours and motion will be refined later.

[Sections 1–15 covered: global layout system; header (89px, NOT sticky);
secondary navigation (67px, viewport-pinned); listing header; hero gallery
(1120 x 494, 560/272/272, 243/243, 8px gaps, curated photos 7/4/5/13/29, Show
all photos 143.3 x 32 inset 24px); main content and booking rail (652 + 96 +
372, card 372/1px/24px/322); section architecture; data/UI separation;
accessibility from day one; performance; code quality; visual foundation;
browser validation at 1280/1440/1600; self review; documentation.]

IMPORTANT SCOPE BOUNDARY — Do NOT implement Photo Tour, Lightbox, final
animations, final typography calibration, final colour calibration, speculative
hover animations, or unverified micro-interactions. However, structure the
application so these can be integrated cleanly without rewriting the Listing
Page.

FINAL QUALITY GATE — Run available validation; TypeScript, lint and production
build if dependencies are available; check console errors, TypeScript errors,
accessibility issues, layout overflow; verify the measured geometry; review the
changed files. If npm registry/network restrictions prevent any validation,
explicitly report which checks were blocked instead of claiming they passed.

FINAL OUTPUT — Report: what was implemented; component tree; files
created/modified; verified geometry implemented; provisional values still
remaining; accessibility implemented; performance decisions; validation results;
remaining issues; what Phase 3 should address.

Do NOT start Phase 3. Do NOT implement Photo Tour or Lightbox. STOP after the
Phase 2 report.

---

## Note on two instructions that could not be followed as written

**"docs/03-interaction-map.md"** does not exist under that name; the file is
`docs/03-view-interaction-map.md`. It was used.

**Section 7 asked for a Footer structural component.** LAY-6 is a cleared
measurement: the reference has no footer — no `footer` landmark exists and its
content ends at "More stays nearby". The instruction to use MEASURED values
exactly was taken as the stronger one, so no footer was built. `page.tsx`
carries a comment saying why.
