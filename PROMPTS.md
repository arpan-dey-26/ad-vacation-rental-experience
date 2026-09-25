# PROMPTS.md

Chronological record of the prompts used for AI-assisted development of
StayVista, per submission requirement L4.

Each entry records what was asked, what came back, and what it cost — including
where the AI was blocked. Prompts are appended in order; nothing is rewritten
after the fact.

---

## Prompt 01 — Project Discovery & Foundation

**Date.** 2026-09-18
**Tool.** Claude (Cowork), model `claude-opus-5`
**Phase.** 0 — Foundation

### Intent

Establish the project before writing any feature UI: extract every requirement
from the assignment, analyse the reference, design the token system, component
architecture and data model, plan the AI workflow and production architecture,
then scaffold the repository and documentation only.

### Prompt (verbatim, abridged for length — full text in `docs/prompts/01-discovery.md`)

> You are the lead frontend engineer, UI reconstruction specialist, accessibility
> engineer, and AI-development workflow architect for this take-home assignment.
>
> I have attached 3 screenshots/images containing the complete assignment brief
> from Playpower. READ AND ANALYZE ALL 3 ATTACHED IMAGES CAREFULLY BEFORE DOING
> ANYTHING. […]
>
> PROJECT NAME: StayVista — Airbnb Listing Experience Clone
> OFFICIAL REFERENCE: `https://airbnb-clone-umber-two.vercel.app`
>
> CORE OBJECTIVE — Build an exceptionally polished, desktop-only implementation
> of the reference Airbnb listing experience. […] pixel-level visual fidelity,
> behavioural parity, smooth and intentional interactions, accurate animations
> and transitions, accessibility, clean production-quality architecture,
> excellent code quality, thoughtful AI-assisted development workflow. […]
>
> CRITICAL ORIGINALITY / PLAGIARISM RULE — The reference website is ONLY a visual
> and behavioural specification. DO NOT copy its source code, scrape it,
> lift-and-shift its implementation, copy its JavaScript / React components /
> CSS / DOM structure wholesale, or use an existing Airbnb clone repository. All
> application code must be independently implemented. […]
>
> FIRST TASK: DISCOVERY ONLY — DO NOT IMPLEMENT THE COMPLETE APPLICATION YET.
> First perform a detailed discovery and planning phase. […]
>
> [Sections 1–13: assignment requirements; reference UI analysis; three required
> views; motion/animation analysis; accessibility analysis; design system;
> component architecture; data model; project structure; AI workflow; PROMPTS.md;
> production architecture; quality gate.]
>
> OUTPUT REQUIRED FROM THIS PHASE — 1. Complete assignment requirement checklist
> 2. Detailed reference/page breakdown 3. Three-view interaction map 4.
> Animation/motion map 5. Accessibility plan 6. Design token proposal 7.
> Component architecture 8. Data model 9. Project folder structure 10. AI
> agent/skill plan 11. Production architecture plan 12. Development roadmap
> divided into logical phases 13. Risks and things that require careful visual
> verification
>
> Then initialize the project foundation and documentation files only. Do NOT
> implement the complete UI yet. Run basic validation after initialization.
> Finally report: files created, files modified, dependencies added, validation
> performed, decisions made, remaining work. Then STOP.

### What the AI produced

- `docs/01` … `docs/11` — the full discovery set.
- `docs/VERIFICATION-QUEUE.md` — every unmeasured value, itemised.
- Next.js 15 + TypeScript + Tailwind v4 scaffold with a token layer in
  `src/app/globals.css`.
- Domain types (`src/lib/types.ts`) and a typed data skeleton
  (`src/data/listing.ts`).
- Four sub-agent configs and three skill configs under `.claude/`.

### Blockers hit

1. **The reference could not be inspected.** The browser pane loaded the page and
   was replaced with *"This page could not be verified. Please open it in a
   standard web browser."*; `robots.txt` disallows all paths; the Chrome
   extension was not connected. Working around either gate was declined. Recorded
   as risk R-1 and as the reason `VERIFICATION-QUEUE.md` exists.
2. **npm registry blocked** (`x-deny-reason: host_not_allowed`) from both the
   cloud sandbox and the linked machine's workspace, so `npm install`, `tsc`,
   `eslint` and `next build` could not run. Recorded as risk R-12; the toolchain
   gate runs on first local install.

### Decisions taken

See `README.md` § Decisions. In short: Next.js 15 App Router, Tailwind v4
CSS-first tokens with no config file, no animation library, no state library, no
backend, hand-authored SVG icons, one shared `Dialog` shell for both overlays.

### Outcome

Phase 0 complete except the deferred toolchain gate. Next: Phase 1 (measure and
capture) — and it cannot start until the reference is reachable.

---

## Prompt 02 — Phase 1: Measure and Capture

**Date.** 2026-09-18
**Tool.** Claude (Cowork), model `claude-opus-5`
**Phase.** 1 — Measure and capture

### Intent

Clear the verification queue from measured observation of the rendered
reference, without copying any implementation. Update tokens only where the data
supports it, capture the real listing content and gallery structure, and record
what remains unmeasurable.

### Prompt (abridged; full text in `docs/prompts/02-measure.md`)

> Proceed with Phase 1 only after the reference is accessible in a standard
> browser. […] I need you to inspect the rendered page visually, not its source
> code. Do NOT scrape or copy the implementation. […]
>
> For every provisional token currently marked in docs/VERIFICATION-QUEUE.md:
> (1) Verify it against the rendered reference where possible. (2) Record the
> observed/derived value and measurement method. (3) Update the implementation
> token only when sufficiently verified. (4) Do not invent values when they
> cannot be observed reliably. (5) Keep a record of the verification in the
> documentation. […]
>
> Do NOT implement the full UI yet.

### How it was done

Three sessions of back-and-forth preceded any measurement, because the reference
refuses Claude's in-app browser and `robots.txt` disallows automated fetching.
Rather than work around either, Claude wrote `docs/measure/reference-probe.js` —
a console script that reads only rendered geometry, text, image sources and ARIA
— and Arpan ran it in his own Chrome. Three captures came back.

### What the AI produced

- `docs/12-measurements.md` — every measured value with its derivation.
- `docs/VERIFICATION-QUEUE.md` — rewritten: **41 of 70 items cleared**.
- `src/data/photos.ts` — 43 photos, 9 categories, generated from the captures.
- `src/data/listing.ts` — the real listing content.
- Verified tokens in `src/app/globals.css`, now marked `MEASURED` individually.
- `docs/measure/probe-2-styles.js` — a second probe for what is still missing.

### Blockers hit

1. **Every computed style came back empty** in all three captures — no colour,
   font size, weight, radius, shadow, transition or `position` was observed.
   Probe 2 self-checks `getComputedStyle` before running so this cannot recur
   silently.
2. **No clean listing-page capture.** All three were taken with the photo tour
   open; two were the same state captured twice.

### Findings that changed the plan

- The reference serves **Airbnb Cereal VF**, a proprietary face (R-3 rewritten).
- Photos are hosted on the **reference's own origin**, so hotlinking depends on
  another candidate's deployment (R-4 recommendation flipped to re-hosting).
- A **third dialog** exists — the amenities modal — that discovery had missed.
- The **map is interactive**, not static.
- There is **no footer**.
- The reference **does not move focus into its overlays** and does not make the
  background inert; our build will diverge deliberately.

### Outcome

Phase 1 partly complete. Structure, layout, content and both overlays' behaviour
are measured; the entire visual layer — colour, type scale, radii, shadows,
motion — awaits probe 2.

---

## Prompt 03 — Phase 1b: Remaining verification, R-3 and R-4 decisions

**Date.** 2026-09-18
**Tool.** Claude (Cowork), model `claude-opus-5`
**Phase.** 1b — remaining measurement, asset and font decisions

### Intent

Close the measurement gaps left by Phase 1, and implement the two decisions
Arpan returned: do not bundle Airbnb Cereal, and investigate image provenance
before packaging anything.

### Prompt (abridged; full text in `docs/prompts/03-verification.md`)

> Proceed with the remaining Phase 1 verification work. […] Use probe-2 on these
> four states: Listing Page, Photo Tour, Lightbox, "What this place offers"
> dialog. Then perform the remaining manual/DevTools verification […]
>
> R-3 decision: Do NOT bundle or redistribute Airbnb's proprietary Cereal font.
> Keep the reference font documented, but use the closest legally available
> fallback and tune typography metrics to minimize visual differences.
>
> R-4 decision: Investigate the provenance/usage status of the 43 reference
> images before packaging them. […] If their redistribution is not clearly
> permitted, do not package them; document the constraint and use an appropriate
> legally usable alternative.

### What actually happened

The four probe-2 runs and every manual DevTools check **could not be performed**
— they need a browser on Arpan's machine, and the reference still refuses the
in-app browser while the Chrome extension is not connected. Claude did not
attempt to work around either gate.

Instead, checking Downloads for probe-2 output turned up **five probe-1 captures
from an earlier session that had never been analysed**. Between them they
supplied exactly the three things the first three captures lacked: a clean
listing page, a second viewport width (2005 vs 1339), and two scroll positions.

That turned an otherwise blocked turn into twelve more cleared items.

### What the AI produced

- Twelve queue items cleared from captures D–H, including four that had looked
  unreachable without new runs.
- `docs/13-asset-strategy.md` — the R-4 provenance investigation and decision.
- `docs/measure/font-calibration.js` — the R-3 metric-tuning measurement.
- R-3 implemented: Cereal removed from the font stack entirely (naming it would
  make rendering machine-dependent), `--font-size-adjust` added as the single
  calibration point.
- Updated `12-measurements.md`, `VERIFICATION-QUEUE.md`, `11-risks.md`.

### Findings from captures D–H

- **The header is not sticky** — it scrolls away. The opposite of the usual
  assumption for this layout.
- The sub-nav is viewport-pinned at y −66 and still hidden at `scrollY` 300, so
  its reveal threshold is above 300px.
- **The hero mosaic is fixed at 1120 × 494**, identical at both viewport widths.
- **The lightbox image cap is a fixed 1100px**, not viewport-derived.
- **The lightbox disables at the ends** — at photo 43 of 43, Next is `disabled`.
- Header inner is **max-width 1760 with 80px padding**, which explains the
  otherwise odd 80 → 115 gutter change between widths.
- The reference **does not reserve the scrollbar gutter**: opening an overlay
  widens the client area 15px and shifts the page sideways.

### Blockers hit

1. **No browser access**, so the four probe-2 runs and all six manual checks
   remain undone.
2. **Computed styles empty in all eight captures**, across two separate sessions
   — 21 of the 28 open items wait on this single fault.

### Outcome

53 of 85 items cleared, 4 partial, 28 open. Both decisions implemented. UI
implementation still not started, by instruction.

---

## Prompt 04 — Production Structural Implementation

**Date.** 2026-09-19
**Tool.** Claude (Cowork), model `claude-opus-5`
**Phase.** 2 — Listing page structure

### Intent

Build the structural foundation of the desktop listing page from the measured
values only: layout system, header, secondary nav, listing header, hero mosaic,
booking rail, and a component for every remaining section — without overlays,
calibrated colour, calibrated type, or invented motion.

### Prompt

Full text in `docs/prompts/04-structure.md`.

### What the AI produced

- Five structural stylesheets (`src/styles/`) driven entirely by tokens.
- 24 components across `layout/`, `listing/`, `booking/`, `gallery/`, `ui/`.
- Two hooks: `useGalleryView` (the overlay state machine, ready for Phases 4–5)
  and `useScrollThreshold`.
- `scripts/verify-geometry/` — a harness that renders the real component tree
  with the real stylesheets in headless Chromium and asserts the measured
  geometry at 1280 / 1440 / 1600.

### The substitution that mattered

The gate called for `visual-fidelity-reviewer` against the live reference. That
agent needs a browser this session cannot point at the reference. Rather than
skip the gate or claim it passed, Claude built the harness — a weaker check
(it confirms we match what we measured, not that we measured everything) but a
far stronger one than reading the CSS.

It earned its keep immediately by catching four bugs that would have shipped:

1. **No `box-sizing: border-box`** — the shell capped at 1280 *plus* 160px of
   padding, and the header measured 90px instead of 89 because its hairline sat
   outside the height.
2. **Grid blowout** — `min-width: auto` on grid children let a scroller widen
   its track.
3. **Column-flow grid scrollers** reported a max-content width that escaped
   their own overflow clip.
4. **Scroll-extent leak** — the similar-stays track leaked ~730px of horizontal
   window scroll despite `overflow-x: auto` clipping correctly. `contain: paint`
   fixed it, verified both ways.

It also corrected a wrong assumption in the harness itself: `scrollbar-gutter:
stable` reserves its gutter inside `<html>`, so the available width is
`document.body.clientWidth`, not `documentElement.clientWidth`.

### Decisions worth defending

- **Structural CSS in named files, not Tailwind utility strings.** The measured
  values would be arbitrary-value utilities anyway; a named rule is reviewable
  against the measurement doc; components stay free of magic numbers.
- **No footer.** Section 7 of the prompt asked for one; LAY-6 says the reference
  has none. The MEASURED instruction won.
- **Nothing sticky.** The header is measured static, and the booking rail's
  sticky offset is unmeasured — so neither is sticky, and both carry a comment
  saying so. The single easiest thing to get wrong here is adding stickiness out
  of habit.
- **No hover treatment on the hero.** HERO-6 is unmeasured; inventing one is as
  much a deviation as missing the real one.

### Blockers hit

`tsc`, `eslint` and `next build` still cannot run — npm registry blocked (R-12).
Reported rather than claimed.

### Outcome

66 geometry assertions pass across three viewports; the structural
accessibility audit reports zero problems. Phase 3 is visual calibration, and it
is blocked on the probe-2 measurements.

---

## Prompt 05 — Phase 3 High-Fidelity Visual Calibration + Listing Interactions

**Date.** 2026-09-19
**Tool.** Claude (Cowork), model `claude-opus-5`
**Phase.** 3 — visual calibration and listing interactions

### Intent

Turn the structurally correct page into a visually faithful, interaction-complete
one — using measured evidence where it exists and saying so plainly where it
does not.

### Prompt

Full text in `docs/prompts/05-calibration.md`.

### What the AI produced

- `Dialog` primitive + `useDialog` + `useScrollLock` — the full focus contract
  (focus in, trap, Escape, restore, inert background, scroll lock with position
  restoration), built once so Phases 4–5 inherit it rather than reinventing it.
- The amenities dialog, at its measured 780px centred geometry.
- `StayCalendar` — a real two-month range picker with roving-tabindex keyboard
  support, no date library, no network.
- Typography given **per-value provenance**: `[MEASURED]` line boxes,
  `[CALIBRATED]` font sizes derived from them with the assumption written down,
  `[PROVISIONAL]` for everything with no constraint.
- Two new harnesses: `verify:interactions` (22 assertions against a real
  hydrated build) and `verify:tokens` (fails if any literal px or raw colour
  lacks a provenance marker).
- `docs/14-visual-fidelity-note.md`.

### The recovery worth noting

LAY-4 had been filed as "needs computed styles". It did not. Differencing
adjacent element bounds in the clean listing capture recovers rendered
distances directly — **48px** section gap, **24px** heading-to-content, **6px**
label-to-value, **32/22** title padding. Four provisional tokens became
measured, using captures that had been sitting there since Phase 1.

### What the interaction harness caught

Two harness bugs rather than app bugs, both worth recording: the dialog
centring assertion used the wrong width base (a fixed layer spans the ICB), and
aborted image requests were being counted as console errors. Fixing the first
surfaced a real consequence — with the scrollbar gutter reserved and the body
locked, the dialog sits 7.5px left of the true window centre. That is the LAY-7
trade: a static 7.5px offset instead of a visible 15px page jump.

### Blockers hit

1. **Computed styles still never captured** — so all colour, radii, shadows and
   transitions remain `[PROVISIONAL]`. 83 markers.
2. **Font calibration cannot run here** — Inter is not installed and there is no
   route to any font CDN.
3. **`tsc`, `eslint`, `next build`, runtime console** — npm registry still
   denied (R-12).
4. **Screenshot comparison impossible**, so no visual parity claim is made.

### Outcome

66 geometry + 22 interaction + token-provenance + structural a11y checks all
pass. No Photo Tour, no Lightbox. 55 of 85 queue items cleared.

---

## Prompt 06 — Phase 4: Photo Tour Implementation

**Date** 2026-09-19 · **Tool** Claude (Cowork), model `claude-opus-5` ·
**Full text** `docs/prompts/06-photo-tour.md`

### Intent

Build the photo tour as a production view from measured evidence only, with the
computed-style gap declared permanent rather than pending. No lightbox.

### What changed

`PhotoTour`, `PhotoTourNav` and `PhotoCategoryBlock`, mounted through the
existing `GalleryProvider`; `src/styles/tour.css` and 18 new tour tokens;
`ShareSaveActions` generalised to an icon variant; an `arrow-left` icon; and
`scripts/verify-geometry/audit-tour.mjs` — 112 assertions across five widths.

### Two model corrections the evidence forced

1. **The lightbox lost its `from` field.** Every captured lightbox URL was
   `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>` and the tour alone was
   `?modal=PHOTO_TOUR_SCROLLABLE`. There is no listing-direct lightbox: it is a
   layer on the tour. Capture E confirms it — lightbox on photo 43, tour beneath
   still at scroll 0. So closing unwinds one layer at a time, and E2.3 ("opens
   from any hero image") is satisfied by a tile opening the tour with the
   lightbox on top.
2. **One trigger ref became two.** The harness caught focus falling to `<main>`
   after closing a tour whose photo had been clicked: `openLightbox` had
   overwritten the tour's opener. Split into `tourTrigger` and
   `lightboxTrigger`.

### What the tour deliberately does not have

No entrance transition. TOUR-1 needs computed styles and will not be measured,
so nothing was invented — the tour mounts.

### Blockers hit

1. **Computed styles: closed, not pending.** `probe-2-styles.js`, which
   self-checks before capturing, failed that self-check in a fresh normal Chrome
   window. Three sessions, two probe generations. Reference computed styles
   could not be obtained through page-script inspection across repeated
   sessions; geometry and behaviour measurements are authoritative, and
   visual-token values without direct evidence remain provisional.
2. **`npm install` / `eslint` / `next build`** — registry still denied, E403
   (R-12).
3. **`tsc --noEmit` now runs** but reports 502 errors, all of them
   missing-dependency (440 × TS7026, 25 × TS2307, and their downstream
   TS2741/TS2503). That is not a typecheck of our code. **BLOCKED.**
4. **Screenshot comparison against the reference** — still impossible. No visual
   parity claim.

### Outcome

66 geometry + 22 interaction + 112 photo-tour + token-provenance + structural
a11y checks pass; markdownlint clean. 56 of 87 queue items cleared, one added
(TOUR-2b). No lightbox.

---

## Prompt 07 — Phase 5: Lightbox Implementation

**Date** 2026-09-19 · **Tool** Claude (Cowork), model `claude-opus-5` ·
**Full text** `docs/prompts/07-lightbox.md`

### Intent

Layer the lightbox above the photo tour, with exactly one surface owning the
keyboard at a time, from measured evidence only. No new dependencies.

### What changed

`Lightbox` and `LightboxControls`; `useKeyboardNav`; `src/styles/lightbox.css`
and five tokens; `useDialog` gained `active`; `useScrollLock` became
reference-counted; `useGalleryView` gained `stepPhoto`; and
`scripts/verify-geometry/audit-lightbox.mjs` — 100 assertions across five widths
and the five photo positions the reference was captured at.

### What the captures gave up on a second reading

The 1100px cap is the **width**, and the height is the source's own aspect: a
1440 × 808 photo renders 1100 × 617.2 and a 1440 × 1080 one 1100 × 825, and
`1100 / aspect` produces both. So `width: 1100px; height: auto` is the measured
rule rather than two separate numbers. Image and arrows are centred on the
viewport at both widths. And Close's right inset is **24**, not 16 — the two
exits are genuinely asymmetric in the reference, and that is reproduced rather
than tidied up.

### Three defects the harness caught, all in the two-layer seam

1. **The scroll lock was a boolean.** The inner layer's cleanup released the
   body while the outer one was still open. Now reference-counted.
2. **Focus restoration aimed at the opener unconditionally.** A hero tile sits
   `inert` behind the tour, so closing a tile-opened lightbox focused nothing and
   stranded the keyboard on `<body>`, unable to reach Escape. `useDialog` now
   checks the opener is reachable and otherwise lands on the topmost layer.
3. **Two clicks in one tick cancelled.** An absolute index read at render time
   became a relative `stepPhoto(delta)` with a functional update; the burst-click
   test turned from a workaround into a real rapid-repeat assertion.

Each is invisible with a mouse and a single overlay, and each breaks the
keyboard.

### What the reference does that we deliberately do not

With its lightbox open, its photo tour is **still** `role="dialog"
aria-modal="true"` — two modals at once, 43 tour photos still tabbable behind the
photo on display. Measured in captures C, E, F and G. Not reproduced.

### What is absent on purpose

No photo-to-photo transition (LIGHT-4 unmeasured) and no close-on-backdrop
(LIGHT-8 unresolved). Both are asserted, so neither can drift into a guess.

### Blockers hit

1. **Computed styles** — still closed, not pending. LIGHT-1 and LIGHT-4 stay
   provisional.
2. **`npm install` / `eslint` / `next build`** — registry denied, E403 (R-12).
3. **`tsc --noEmit`** runs but reports only missing-dependency errors. **BLOCKED.**
4. **Screenshot comparison** — still impossible. No visual parity claim.

### Outcome

66 geometry + 22 interaction + 113 photo-tour + 100 lightbox +
token-provenance + structural a11y checks pass; markdownlint clean. 58 of 87
queue items cleared. All three views built.

---

## Prompt 08 — Phase 6: Final QA, Architecture and Submission

**Date** 2026-09-19 · **Tool** Claude (Cowork), model `claude-opus-5` ·
**Full text** `docs/prompts/08-release.md`

### Intent

Validate all three views together, build the production-scale architecture
diagram, reconcile the documentation with the implementation, and package the
submission. No new features.

### What changed

`scripts/verify-geometry/verify-release.mjs` — 110 assertions over three full
Listing → Tour → Lightbox → Tour → Listing cycles plus the hero-tile and
thumbnail paths; `docs/architecture.png` / `.pdf` with its editable HTML source
and `scripts/build-architecture.mjs`; `docs/15-production-architecture.md`;
`scripts/verify-geometry/toolchain.mjs`; and a documentation pass across
README, the roadmap, the requirements checklist and the queue.

### The bug three cycles were needed to find

Restoring focus to the opening control scrolled the page away from the position
`useScrollLock` had just restored — the listing returned to y 175 after being
left at 800. `focus()` scrolls its target into view; `focus({ preventScroll:
true })` does not. A single open-and-close never showed it, because the trigger
happened to be on screen.

### Two assertions that were wrong before the code was

Worth recording, because both are the standard traps when auditing teardown:

- Expecting **zero** `inert` nodes at rest. The listing deliberately parks its
  section nav with `inert` so it cannot take focus off-screen.
- Comparing inert and `aria-hidden` **counts** against a baseline. The baseline
  is captured at scroll 0; the cycles run at scroll 800, where the section nav
  correctly reveals itself and drops both attributes.

The invariant that actually holds is narrower and scroll-independent: after
teardown no inert node remains except the section nav, and `main` is neither
inert nor hidden.

### Portability

The harnesses resolved Playwright and esbuild from a hard-coded
`/home/claude/...` path — a machine-specific reference that would have shipped
in the archive. `toolchain.mjs` now tries the project's `node_modules` first and
falls back to a global install, with an error message naming the install command.

### The motion pass that could not happen

The original roadmap had a separate Phase 6 for motion, reconciling every row of
`04-motion-map.md` against the reference. `MOT-1` needs computed styles. It was
merged into this phase and recorded as unmeasurable rather than quietly dropped;
no motion was invented anywhere in the project.

### Blockers hit

1. **`npm install` / `eslint` / `next build`** — registry denied, E403 (R-12).
   `npm run verify` has never executed. **BLOCKED**, not passed.
2. **`tsc --noEmit`** runs; all 527 errors are missing-dependency. **BLOCKED.**
3. **Computed styles** — permanently unavailable; colour, radii, shadows and
   transitions stay provisional.
4. **Image-origin performance** could not be validated: the sandbox cannot reach
   the asset origin, so no real image has ever loaded. No load-time numbers are
   claimed.
5. **Screenshot comparison against the reference** — impossible throughout.

### Outcome

66 geometry + 22 interaction + 113 tour + 100 lightbox + 110 release +
token-provenance + structural a11y pass; markdownlint clean across 20 files.
58 of 87 queue items cleared. Submission archive built and inspected.

---

<!-- Prompt history complete. -->

## Final asset integration and release — 25 September 2026

Summary of subsequent user instructions: preserve the existing application; use Hotel photo.zip for the property gallery and Other photo.zip for nearby listings, host logo and map; generate only fictional adult co-host/reviewer portraits; preserve all 43 photo IDs/order; run all existing validation harnesses without weakening assertions; use a patched Next.js version where required; deploy a Ready public production release; provide a clean final submission ZIP.

Outcome: 43 supplied property files and 8 supplied additional assets integrated; 14 fictional avatars generated (exact prompts in docs/synthetic-avatar-prompts.json); Next.js 15.5.26; all checks passed and public production deployed. Details in docs/FINAL-SUBMISSION-REPORT.md. This entry summarizes instructions, rather than claiming to be a verbatim transcript.
