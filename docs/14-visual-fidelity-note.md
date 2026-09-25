# 14 — Visual-fidelity note (current through Phase 5)

What in this build is measured, what is derived, what is a placeholder, and
where we deliberately differ from the reference.

## 1. Measured values in use

Read from the probe captures and used exactly. Derivations in
`12-measurements.md`.

| Area | Values |
| --- | --- |
| Containers | shell 1280 · content 1120 · gutter 80 · header inner 1760 |
| Header | 89px tall, **static** (scrolls away) |
| Section nav | 67px, viewport-pinned, parked above the fold |
| Hero | 1120 × 494 · 560/272/272 · 243/243 · gap 8 · control 32 tall, inset 24 |
| Body | 652 + 96 + 372 |
| Booking card | 372 outer · 1px border · 24 padding · 322 inner · CTA 48 tall |
| Dialog | 780 wide, centred, 48px inset, close 40 × 40 at 16px |
| Sections | policy row 3 × 352 + 2 × 32 · sleeping cards 318 wide, image 212 · pill buttons 49 tall · review tags 48 tall · carousel arrows 32 |
| **Rhythm (new in Phase 3)** | **section gap 48** (gallery bottom 667 → body top 715) · **heading-to-content 24** (h2 bottom 1532.3 → content 1556.3) · **label-to-value 6** (h2 bottom 741 → capacity 747) · **title padding 32 top / 22 bottom** |
| Line boxes | h1 30 · page h2 26 · dialog h2 31.5 · amenity h3 25.7 · tour h2 22.9 |
| **Photo tour (new in Phase 4)** | content block **976 fixed**, centred in the scroller's content box · photo column **458**, right-aligned · full **458 × 305.3**, half **223 × 148.7**, both aspect **1.5** · **12** within a category, **20** between · thumbnails **111.5 × 131.2**, image **111.5 × 105.2**, gaps **12** both axes, **8** per row · strip-to-content **56** · header **pinned**, Back at **(24, 24)**, Save right inset **32**, Share **74**, title line box **22.9** centred on the viewport |
| **Lightbox (new in Phase 5)** | image width capped at **1100**, height from the source aspect (**617.2** from 1440 × 808, **825** from 1440 × 1080) · centred on **both** axes at both widths · arrows **40 × 40** at **20** insets, vertically centred · "all photos" exit at **(16, 16)** · Close at y **16**, right inset **24** · counter "N of 43" with the category name · Next `disabled` at 43 |
| Content | 43 photos, 9 categories, hero selection 7/4/5/13/29, all copy |

`npm run verify:tokens` counts the provenance markers across the styling layer
and prints them on every run. As of Phase 5: **MEASURED 144 · CALIBRATED 18 ·
PROVISIONAL 110**. The numbers are reported by the audit rather than maintained
by hand here, so they cannot go stale.

## 2. Calibrated values

Derived from a measured value plus a **stated assumption**. Not measurements,
and not free guesses.

| Token | Derivation |
| --- | --- |
| `--text-display` 26px | From the MEASURED 30px h1 line box. A heading's font-size must be smaller than its line box, and sits at roughly 0.85–0.88 of it in this class of layout |
| `--text-section` 22px | From the MEASURED 26px h2 line box, same reasoning |
| `--text-subsection` 18px | From the MEASURED 25.7px amenity-h3 line box |
| `--text-dialog-title` 26px | From the MEASURED 31.5px dialog-h2 line box |
| `--text-tour-title` 20px | From the MEASURED 22.9px tour-h2 line box |
| `--size-tour-header` 88px | Back's centre is 24 + 20 = 44 and the title's is 32.6 + 22.9 / 2 = 44.05. Both centres MEASURED at both widths; the assumption is that the header is symmetric about that row |
| `--size-tour-thumb-label-gap` 8px, `--size-tour-thumb-label-line` 18px | The label block is MEASURED at 26px (one line) and 44px (two). One gap plus n lines fits both: 8 + 18 = 26, 8 + 36 = 44 |

The assumption is written at the token, so a single measured font-size replaces
the reasoning rather than hiding it.

## 3. Provisional values

Every colour, the whole radius scale, all three shadows, all transition
durations and easings, body and meta type sizes, letter spacing, focus-ring
styling, the section-nav reveal threshold, the amenities grid column count, the
review grid, map height, host avatar size, all calendar cell metrics, the tour's
label size (TOUR-2b) and the lightbox backdrop's opacity (LIGHT-1).

They are all tokens. None is a literal buried in a component — `npm run
verify:tokens` fails the build if one appears.

## 4. Font substitution and calibration

```text
REFERENCE FONT      Airbnb Cereal VF (variable 200–900) — proprietary, unavailable
IMPLEMENTATION FONT Inter (SIL Open Font Licence)
CALIBRATION METHOD  measured metric approximation — NOT YET EXECUTED
```

Cereal is neither bundled nor named in the font stack. Naming it would make the
page render one way on machines that happen to have it installed and another
way everywhere else — worse than a consistent substitute, because a fidelity
review would then get different results on different laptops.

**The calibration could not be run in this environment.** It needs Inter's
metrics, and Inter is not installed here and cannot be fetched — the container
has no route to Google Fonts, jsDelivr or cdnjs. `--font-size-adjust` is
therefore `1` and marked `[UNCALIBRATED]`.

The method is ready and is one browser run: `docs/measure/font-calibration.js`
sets the reference's own strings in Inter at the same size and weight, compares
rendered widths, and returns the ratio. Queue item TYPE-6.

**We do not claim font identity.** Glyph shapes differ; the calibration targets
equal rendered width, which is what preserves layout and wrap points.

## 5. Deliberate accessibility divergences

The reference's defects are not reproduced. Each divergence is a choice:

| Reference (measured) | This build |
| --- | --- |
| Focus stays on the trigger when an overlay opens | Focus moves to the dialog's close button |
| `main` is never `inert` or `aria-hidden` | The page behind a dialog is `inert` |
| Every `<img>` is `alt=""` with the name only on the wrapping button | Alt text is required on `Photo` and lives in the data; hero images stay `alt=""` because their button already carries the name, which avoids a double announcement |
| No scrollbar gutter — opening an overlay shifts the page 15px | `scrollbar-gutter: stable`; the page never shifts. Cost: with the body locked the dialog centres ~7.5px left of the true window centre. We chose a static 7.5px offset over a visible 15px jump |

Phase 4 adds three more, all in the tour:

| Reference (measured) | This build |
| --- | --- |
| The tour has no headings at all — category names are plain text, and the only structural marker of a boundary is the 8px difference between a 12px and a 20px gap | Every category is a `<section>` with a real `h3` and `aria-labelledby`, so the tour can be navigated by heading |
| The category strip is not a landmark | A `<nav aria-label="Photo categories">` with `aria-current` on the category in view |
| Focus stays on the trigger; the page behind stays reachable | The same `useDialog` contract as every other overlay |

Phase 5 adds three more, all of them places where the reference's own behaviour
is the defect:

| Reference (measured) | This build |
| --- | --- |
| With the lightbox open, the photo tour is **still** `role="dialog" aria-modal="true"` — two modals claim the screen at once, and 43 tour photos stay in the tab order behind the photo on display | Exactly one layer owns the keyboard. `useDialog({ active })` makes the tour `inert` while the lightbox is up; the harness asserts zero reachable tour controls |
| Lightbox images carry `alt=""` | The image is the content, so it carries its real alt text from the data |
| No position announcement | The visible caption is an `aria-live="polite"` region, so stepping is announced once |

Two behaviours could not be observed at all and were **not invented**: LIGHT-8
(backdrop click) keeps the Phase 3 decision not to close, and LIGHT-4 means the
lightbox ships with no photo-to-photo transition. Both are asserted, so neither
decision can drift silently into a guess.

One divergence runs the other way — the reference is right and we cannot match
it. Its thumbnail label wraps "Additional photos" to two lines inside 111.5px
(MEASURED 149.2 vs 131.2); Inter at our provisional label size fits it on one.
The label font-size has never been observed, so the wrap cannot be reproduced
without inventing one. Isolated in `--text-tour-label`; queue item TOUR-2b.

Additions with no reference counterpart to copy: roving-tabindex calendar with
full arrow/PageUp/PageDown support, a polite live region for the selected range,
`aria-pressed` on Save with a name that changes with state, and the parked
section nav held `inert` so it cannot take focus off-screen.

## 6. Blocked verification

The reason most of §3 exists: **every computed style came back empty in all
eight captures**, across two probe sessions. No colour, font size, weight,
radius, shadow or transition has ever been observed.

**As of Phase 4 prep this is closed, not pending.** A third attempt —
`probe-2-styles.js`, which self-checks `getComputedStyle` before it captures
anything — failed its self-check in a fresh normal Chrome window on the
reference. Three sessions, two probe generations, one result. Script-read
computed style is treated as unavailable for the remainder of the project.

The consequence is a permanent classification rather than a queue: the 83
`PROVISIONAL` markers stay provisional through Phases 4 and 5, and the
submission says so. Nothing is promoted to `MEASURED` without an observation,
and nothing is invented to close the gap.

Also blocked: `tsc`, `eslint`, `next build` and any runtime dev-server check —
the npm registry is denied by egress policy (R-12). Screenshot comparison
against the reference is blocked for the same reason the measurements are.

**No visual parity claim is made.** The harness proves we match what we
measured; it cannot prove we measured enough.

## 7. Asset limitations

Unchanged from `13-asset-strategy.md`: no photograph is packaged. The data layer
holds the reference URLs behind one `ORIGIN` constant and the browser fetches
them at runtime — linking, not redistributing. Icons and rating chips are
hand-authored SVG. In this sandbox those image requests fail, which is expected
and is itself evidence for the residual risk that strategy records.
