# 11 — Risks and things that need careful visual verification

Ordered by how much they can cost. The top three are open decisions or blockers,
not hypotheticals.

---

## R-1 · The reference cannot be inspected from this session — **partly resolved**

**What happened.** The in-app browser loads the page and is then replaced with
*"This page could not be verified. Please open it in a standard web browser."*;
`robots.txt` disallows all paths; the Chrome extension bridge was not connected.
None of that was worked around.

**How it was resolved.** Arpan ran `measure/reference-probe.js` in his own
Chrome and sent three captures. Geometry, text, image sources and ARIA all came
through — that cleared 41 of 70 queue items.

**What remains.** Every computed style in those captures came back empty, so
colour, type sizes, radii, shadows, transitions and sticky behaviour are still
unmeasured; and all three captures were taken with the photo tour open, so there
is no clean listing-page state. `measure/probe-2-styles.js` closes both, and
self-checks `getComputedStyle` before it runs so a second empty file cannot
happen silently.

**Still true.** Nothing in the repository claims a value it did not measure.
Tokens are marked `MEASURED` or `[PROVISIONAL]` individually.

---

## R-2 · Container geometry error cascades — **high**

A wrong `--container-page` or `--container-gutter` makes every section below it
wrong regardless of how carefully each is built, and it is the kind of error that
survives review because each section looks internally correct.

**Mitigation.** LAY-1 … LAY-3 are the first items cleared in Phase 1, and Phase 2's
gate is container geometry alone, before any section internals exist.

---

## R-3 · The reference serves a proprietary font — **high, and now a decision**

**Measured in Phase 1.** The reference does not substitute anything. It serves
**Airbnb Cereal VF** — Airbnb's own variable typeface, weights 200–900 — and
`document.fonts` confirms it loaded.

That is the opposite of what this risk assumed, and it splits the problem:

- **Fidelity.** Any other face changes every glyph width, so line breaks, button
  widths and section heights all drift. Matching the reference exactly means
  shipping Cereal.
- **Licensing.** Cereal is not licensed for redistribution. Bundling it into a
  submission would mean redistributing someone else's proprietary font, which is
  a worse problem than a few pixels of drift — and it sits oddly beside an
  assignment whose headline rule is originality.

**Decision (Arpan, Phase 1b): do not bundle or redistribute Cereal.** Document
it, substitute the closest legally available face, and tune the metrics.

**Implemented.** `--font-sans` is now Inter alone — Cereal is *not* named in the
stack. Naming it would make the page render one way on machines that happen to
have it installed and another way everywhere else, which is worse than a
consistent substitute: a fidelity review would get different results on
different laptops.

**Remaining work: metric tuning.** Inter's glyphs are not Cereal's, so the same
string sets at a different width; uncorrected, headings, buttons and chips all
drift and text wraps in the wrong places. `--font-size-adjust` in `globals.css`
is the single correction factor, currently `1` and marked `[UNCALIBRATED]`.
`docs/measure/font-calibration.js` measures the reference's rendered text
against Inter at the same size and weight and returns the exact ratio — one
number, one place. It cannot run until the font sizes are known, so it is
bundled with the probe-2 run.

---

## R-4 · Image sourcing — **resolved; see `13-asset-strategy.md`**

**Decision (Arpan, Phase 1b): investigate provenance; package only if
redistribution is clearly permitted.**

**Investigated.** The photographs are of a real, currently-listed property,
copyright the host or their photographer, re-hosted by the reference — which is
itself a clone and holds no licence to pass on. Neither the brief nor the
reference grants us one. Redistribution is **not clearly permitted**, so the
test fails.

**Implemented.** Nothing is packaged. The data layer holds the reference URLs
behind a single `ORIGIN` constant and the browser fetches them at runtime —
linking, not redistributing. Icons and chips are hand-authored SVG, so they
leave the asset question entirely. Full reasoning, the trade-off, and the
openly-licensed alternative are in `13-asset-strategy.md`.

**Residual risk.** Our build depends on the reference deployment staying up. A
failed image leaves a correctly-sized box rather than a collapsed layout,
because every photo carries its intrinsic dimensions in the data.

### Original analysis, kept for the record

Requirement B6 says "identical assets". Phase 1 measured where the assets
actually live: **the reference's own origin**, at
`airbnb-clone-umber-two.vercel.app/assets/images/…` — not an Airbnb CDN. All 43
photos, the host avatar, the UI icons and the rating chips come from there.

That changes the calculus:

| Option | Pro | Con |
| --- | --- | --- |
| Hotlink | Identical pixels, zero repo weight | **Depends on another candidate's deployment staying up.** If it comes down, our submission renders empty boxes during review |
| Re-host under `public/` | Self-contained; survives the reference disappearing; no runtime dependency on a third party | ~43 files of repo weight; re-hosting someone else's photography |

**Recommendation at the time: re-host.** That recommendation weighed only the
availability risk. It did not weigh provenance, which the Phase 1b investigation
then settled the other way — re-hosting would have meant redistributing
photographs we hold no licence to.

---

## R-5 · Originality under a plagiarism check — **high**

K2–K4 are explicit, and the scoring risk is disqualification.

**What protects us.** Independent component vocabulary (`docs/07`), our own token
names (`docs/06`), hand-authored SVG icons, our own data model (`docs/08`), a
different styling approach if the reference uses styled-components or CSS
modules. Measured values are observations of a rendered page, not copied source.

**What to avoid.** Copying class names, DOM nesting, CSS source, JS, or component
names; starting from any existing Airbnb clone repository; pasting anything from
the reference's bundle.

**Mitigation.** `code-quality-reviewer` checks structure independently, and the
final README states plainly how the implementation was derived.

---

## R-6 · Hover and focus states are invisible in screenshots — **high**

Roughly half the behavioural-parity score (C1, D1, D2, I2) lives in states no
screenshot can show. It is the most commonly skipped part of this kind of task.

**Mitigation.** States are built with each section in Phase 3, not retrofitted,
and `interaction-motion-reviewer` explicitly compares `:hover`, `:focus-visible`
and `:active`.

---

## R-7 · Over-animating — **medium**

The temptation is to add motion because it feels polished. The brief grades
*matching*, and I5 rewards restraint. Inventing an animation the reference does
not have is a deviation in exactly the same way as missing one.

**Mitigation.** Every row of `04-motion-map.md` is a hypothesis with a
measurement column. Unmeasured rows are not implemented.

---

## R-8 · Focus restoration across nested overlays — **medium**

The lightbox can open from the listing *or* from the photo tour. Returning focus
to the wrong element, or to `<body>`, is a visible accessibility failure and an
easy bug to ship.

**Mitigation.** The `from` discriminant in `GalleryView` makes the return target
explicit rather than inferred, and the shared `Dialog` stores the opener as a ref
at open time.

---

## R-9 · Scroll position lost on overlay close — **medium**

A user 3,000px down the page who opens the tour and closes it should be exactly
where they were. Naïve `overflow: hidden` on the body scrolls the page to top on
release.

**Mitigation.** `useScrollLock` captures `scrollY` at lock time and restores it
on release; `scrollbar-gutter: stable` prevents the horizontal shift. Verified in
`release-qa` §3.

---

## R-10 · Photo-tour scale — **medium**

Forty-plus full-resolution images in one overlay will stall on open if they all
load eagerly.

**Mitigation.** `next/image` with `loading="lazy"` below the fold of the overlay,
explicit `sizes`, and blur placeholders so the grid never reflows. The first
category's images are prefetched when the tour opens.

---

## R-11 · Rapid-repeat desync — **low, but embarrassing**

Holding `→` in the lightbox, or double-clicking a hero tile, can queue animations
and let the image, the index and the announcement disagree.

**Mitigation.** Index updates are synchronous and independent of animation state;
the live-region announcement is debounced. Explicitly checked in `release-qa` §3.

---

## R-12 · Toolchain gate deferred — **low**

The npm registry is blocked by egress policy from this session's sandbox *and*
from the linked machine's workspace, so `npm install`, `tsc`, `eslint` and
`next build` have not run against this scaffold.

**Mitigation.** Config is conventional and minimal. The first local
`npm install && npm run verify` is Phase 0's real gate; any version pin that
needs adjusting will surface immediately and cheaply.

---

## R-13 · Desktop-only scope creep — **low**

F1 is explicit: no mobile version. Time spent on responsive breakpoints below
1280px is time not spent on the things being graded.

**Mitigation.** No mobile breakpoints are written. The layout is verified at
1280 / 1440 / 1600 only.
