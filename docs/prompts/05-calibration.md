# Prompt 05 — Phase 3: High-Fidelity Visual Calibration + Listing Interactions (full text)

Date: 2026-09-19 · Tool: Claude (Cowork), model `claude-opus-5`

---

PHASE 3 — HIGH-FIDELITY VISUAL CALIBRATION + LISTING INTERACTIONS

The goal of Phase 3 is to turn the structurally correct listing page into a
visually faithful, interaction-complete desktop listing page using measured
evidence wherever available, while clearly documenting anything that remains
provisional.

[Section 0 — fifteen non-negotiable principles: do not rewrite Phase 2
architecture; do not regress the 66 geometry assertions; MEASURED overrides
assumptions; never silently promote provisional to verified; do not invent
measurable behaviour; do not copy reference source; do not bundle proprietary
fonts or unlicensed photography; keep the runtime image-origin strategy; no
heavy UI, animation or state library; no Photo Tour; no Lightbox; do not
sacrifice accessibility for visual similarity; preserve the server-first
architecture. If browser/reference access remains blocked, report the blocker
and work only from captured evidence — do NOT fabricate measurements.]

[Section 1 — read all existing evidence before changing implementation.]

[Section 2 — attempt the remaining measurement work first: probe-2 computed
styles, font calibration, and the remaining listing queue items (BOOK-2,
SEC-6b, SEC-8b, sub-nav threshold, amenities dialog). Do not spend excessive
time fighting the verification gate; freeze blocked items as provisional.]

[Sections 3–8 — visual token calibration with [MEASURED] / [CALIBRATED] /
[PROVISIONAL] provenance; typography pass across every section preserving the
measured line boxes; visual refinement of header, secondary nav, listing
header, hero, body and booking rail; booking card interaction structure
including a two-month calendar if evidence supports it; the amenities dialog
behind a reusable Dialog primitive; interaction states.]

[Sections 9–12 — accessibility pass; desktop-only responsiveness at
1280/1440/1600; visual QA extending the existing harness without removing Phase
2 assertions; code quality.]

[Sections 13–15 — documentation updates including a Phase 3 visual-fidelity
note; final validation with BLOCKED never converted to PASS; an eighteen-item
quality gate.]

[Section 16 — stop and report fifteen specific items. Do not claim
pixel-perfect completion yet.]

---

## What could and could not be done

**Section 2A — probe-2 computed styles: still blocked.** No new probe output
exists, the reference still refuses the in-app browser, and the Chrome
extension is not connected. Nothing was fabricated in their place.

**Section 2B — font calibration: blocked, for a new reason.** The method is
written and ready, but executing it needs Inter's metrics. Inter is not
installed in this container and there is no network route to Google Fonts,
jsDelivr or cdnjs (all three return 000). `--font-size-adjust` stays `1` and
marked `[UNCALIBRATED]`.

**Section 2C — a genuine recovery.** LAY-4 (vertical rhythm) had been filed as
needing computed styles. It does not: differencing adjacent element bounds in
the clean listing capture recovers the rendered distances directly. Four values
came out — 48 / 24 / 6 / 32+22 — and replaced four provisional tokens.

**Section 11 — screenshot comparison against the reference: not possible.** No
visual parity claim is made anywhere in this phase.
