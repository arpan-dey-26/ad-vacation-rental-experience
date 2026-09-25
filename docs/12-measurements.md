# 12 — Measurements

Every value here was read from the reference's **rendered geometry**. No source,
CSS, DOM structure or script was copied; the probe records `getBoundingClientRect`
and text, which is observation, not implementation.

## Provenance

Eight captures, from two probe sessions. All were named `probe-listing-*` by the
script regardless of state; state was identified from each file's URL, its
control `disabled` flags and its text — never from the filename.

| Capture | File | Time | Viewport | `scrollY` | State |
| --- | --- | --- | --- | --- | --- |
| A | `capture-A-1789746441682.json` | 15:47:21 | 1339 × 1296 | 0 | Photo tour |
| B | `capture-B-1789746498360.json` | 15:48:18 | 1339 × 1296 | 0 | Photo tour — **byte-identical to A** |
| C | `capture-C-1789746587908.json` | 15:49:47 | 1339 × 1296 | 0 | Lightbox, photo 28 |
| D | `capture-D-listing-1789746025330.json` | 15:40:25 | **2005 × 1296** | 0 | **Listing page, no overlay** |
| E | `capture-E-lightbox43-scrolled-…json` | 15:33:49 | 2005 × 1296 | **300** | Lightbox, **photo 43 of 43** |
| F | `capture-F-lightbox25-scrolled-…json` | 15:32:28 | 2005 × 1296 | **300** | Lightbox, photo 25 |
| G | `capture-G-lightbox40-…json` | 15:42:35 | 2005 × 1296 | 0 | Lightbox, photo 40 |
| H | `capture-H-tour-2005-…json` | 15:41:42 | 2005 × 1296 | 0 | Photo tour |

D–H were found in Downloads after the first three were analysed. They matter out
of proportion to their number, because between them they supply the three things
A–C could not: **a clean listing page**, **a second viewport width**, and **two
scroll positions**.

### The one caveat that still shapes everything

**Every computed style came back empty in all eight captures.** `type`, `box`,
`motion`, `cursor`, `outline`, `maxWidth`, `position`, `zIndex`, `display`,
`gridTemplate*` and `gap` are `""` on every element, and `root.bodyFont` is
empty. Geometry, text, image sources and ARIA are intact, so `getComputedStyle`
returned a blank declaration in whatever context the probe ran — consistently,
across two separate sessions.

The consequence: **no colour, font-size, font-weight, radius, border, shadow or
transition value has been observed.** That single fault accounts for nearly
every item still open. `docs/measure/probe-2-styles.js` self-checks
`getComputedStyle` and refuses to produce another empty file.

---

## Layout — cleared

The page nests two containers:

```text
viewport 1339
└── shell           x 29.5  w 1280   (max-width 1280, centred)
    └── content     x 109.5 w 1120   (80px padding each side)
```

`1339 − 1280 = 59`, split 29.5 either side; `109.5 + 1120 = 1229.5`, leaving 80
to the shell's right edge. Both confirmed against the title section, the gallery
section and the two-column body, which all report `x 109.5, w 1120`.

**The content column is 1120px at every viewport ≥ 1280**, because the shell
caps at 1280 and the gutter is fixed. At 1280 exactly: `1280 − 160 = 1120`. So
across the 1280 / 1440 / 1600 range this project targets, content width never
changes — which removes a whole class of fidelity risk.

| Item | Measured | Token |
| --- | --- | --- |
| LAY-1 content column | 1120px | `--container-page` |
| LAY-2 side gutter | 80px, shell max-width 1280px | `--container-gutter`, `--container-shell` |
| LAY-3 two-column split | 652 content / 96 gap / 372 rail = 1120 | `--size-content-column`, `--size-column-gap`, `--size-booking-card` |
| LAY-5 header | 89px tall (88 + 1px hairline); side padding 80px, **full-bleed, not inside the 1280 shell** — its inner row is `x 80, w 1179` | `--size-header` |
| LAY-6 footer | **There is none.** Landmarks are `header, nav, nav, main, aside` (+ the overlay's own `header, nav, header`); no `footer` element exists and the text ends at "More stays nearby". | — |

The booking rail arithmetic is worth showing because it pins three values at
once. The Reserve button measures `x 882.5, w 322`; the rail's right edge is the
content right edge, 1229.5. A card of width 372 with a 1px border and 24px
padding gives `1229.5 − 372 = 857.5` for its left edge and
`857.5 + 1 + 24 = 882.5` for its content — exactly the measured button position,
and `372 − 2 − 48 = 322` its width. Then `652 + 96 + 372 = 1120` closes the row.

### Sticky section nav

A second bar exists above the fold: `y −67, h 67`, inner `x 29.5, w 1280`, links
Photos / Amenities / Reviews / Location at `x 109.5…409.5` and a Reserve button
at `x 1136.7, w 92.8, h 40` ending at 1229.5. It uses the same shell and gutter
as the content. It sits at negative y at `scrollY 0`, so it is revealed on
scroll — but the mechanism (sticky vs. transform) is unmeasured because
`position` was blank. Queue LAY-5b.

---

## Typography — partly cleared

**TYPE-1 is cleared and it is the most consequential finding of the phase.** The
reference serves **`Airbnb Cereal VF`**, a variable face spanning weights
200–900, and `document.fonts` reports it loaded. That is Airbnb's proprietary
typeface. We should not redistribute it — see `11-risks.md` R-3 for the revised
decision.

Line-box heights are measured; font sizes are not (computed styles blank):

| Element | Line box | Notes |
| --- | --- | --- |
| `h1` listing title | 30px | width 602.2 at 1120 available — it does not fill the column |
| `h2` section headings | 26px | "Entire serviced apartment…", "Where you'll sleep", "What this place offers", "Where you'll be", "Meet your host", "Things to know", "More stays nearby" |
| `h2` photo-tour title | 22.9px | smaller than page `h2` |
| `h2` amenities-dialog title | 31.5px | larger than page `h2` |
| `h3` amenity group | 25.7px | twelve of them |

Three distinct `h2` sizes across the three surfaces is itself a finding: the
overlays do not reuse the page's heading scale.

---

## Hero gallery — cleared

```text
x 109.5 ─────────────────────────────── w 1120 ─────────────────────────────┐
│ ┌───────────────────────┬─────────────┬─────────────┐                      │
│ │                       │   272×243   │   272×243   │   gap 8 everywhere   │ y 173
│ │       560 × 494       ├─────────────┼─────────────┤                      │
│ │                       │   272×243   │   272×243   │                      │
│ └───────────────────────┴─────────────┴─────────────┘   [Show all photos]  │ y 667
```

| Item | Measured |
| --- | --- |
| HERO-1 grid | 3 columns `560 / 272 / 272`, 2 rows `243 / 243`, first tile spans both rows. As proportions: `35fr 17fr 17fr`, which reproduces 560/272/272 at any width |
| HERO-2 gap | 8px, horizontal and vertical |
| HERO-4 mosaic | 1120 × 494. Large tile aspect 1.134, small tiles 1.119 |
| HERO-5 "Show all photos" | 143.3 × 32, inset **24px from the mosaic's bottom-right corner** (`1062.2 + 143.3 = 1205.5`; `1229.5 − 24`), carries an inline SVG |
| HERO-7 tiles | `<button>` elements, accessible names "Romantic Jacuzzi 1BHK Candolim \| Mirashya UG10 image N" |

Still open: HERO-3 corner radii and HERO-6 hover — both need computed styles.

**The hero is a curated selection, not the first five tour photos.** It shows
tour photos **7, 4, 5, 13 and 29**. Recorded as `heroPhotoIds` in
`src/data/listing.ts`.

---

## Photo tour — largely cleared

Layout, measured inside the overlay's own scroll container:

```text
tour content 976 wide, centred in 1324 (= 1339 − ~15px scroller gutter)
x 174 ──────────────────────────────────────────────── 1150
│ [thumb][thumb][thumb][thumb][thumb][thumb][thumb][thumb]   8 per row
│ [thumb]                                                     row 2
│
│ ← category name + feature chips →  │  photo column 458 wide
```

| Item | Measured |
| --- | --- |
| TOUR-2 thumbnails | button 111.5 × 131.2; image 111.5 × 105.2; label block 26px (one line) / 44px (two lines, e.g. "Additional photos" → 149.2 total). Grid gap 12px both axes, 8 per row, strip 976 wide |
| TOUR-3 categories | 9, in order: Living room 1, Living room 2, Full kitchen, Bedroom, Full bathroom, Gym, Exterior, Pool, Additional photos. Feature chips captured verbatim into `src/data/photos.ts` |
| TOUR-4 photo body | Column 458 wide, right-aligned at x 1150. Two spans: **full** 458 × 305.3 and **half** 223 × 148.7 (pairs, 12px apart). Both aspect 1.5 |
| TOUR-4b rhythm | **12px** between photos inside a category, **20px** between categories. That 8px delta is the only structural marker of a category boundary in the photo column |
| TOUR-5 close | A **"Back"** button, 40 × 40 at `x 24, y 24` — an arrow, not an X. Share (`x 1225`) and Save (`x 1267`) sit top-right, both 40 × 40 |
| TOUR-6 category click | **Scrolls, does not filter.** All 43 photos are in the DOM in one continuous y-sequence at all times |
| TOUR-8 scroll retention | The tour keeps its scroll position while the lightbox is open (A → C differ by a uniform +700px, the user's own scroll; the page behind stayed at `scrollY 0` throughout) |
| Title | `h2` "Photo tour", horizontally centred (`629.4 + 80.2 / 2 = 669.5 = 1339 / 2`) |

The 15px right-hand asymmetry (174 left vs 189 right) resolves cleanly if the
tour's scroll container carries a ~15px scrollbar: centring 976 in `1339 − 15`
gives exactly 174.

### Confirmed at a second width (capture H, 2005px)

Every internal dimension is unchanged between A (1339) and H (2005) — 111.5 ×
105.2 thumbs, the 458 × 305.3 full and 223 × 148.7 half photos, the 976 strip.
Only the origin moves, and it moves by exactly half the viewport delta:

| | A @ 1339 | H @ 2005 | Δ |
| --- | --- | --- | --- |
| Thumb row start x | 174 | 507 | +333 |
| Photo column x | 692 | 1025 | +333 |
| "Photo tour" title x | 629.4 | 962.4 | +333 |
| `(vw − 15 − 976) / 2` | **174** | **507** | — |

`(2005 − 1339) / 2 = 333`. So the tour content is a **fixed 976px block,
centred in the scroller's content box**, and the 15px gutter hypothesis is now
measured rather than inferred. The header row centres on the *full* viewport
instead: the title mid-point is `629.4 + 40.1 = 669.5 = 1339 / 2` and
`962.4 + 40.1 = 1002.5 = 2005 / 2`.

Control insets are viewport-anchored and identical at both widths: Back at
`x 24`, Save's right edge 32px from the right, Share's 74px.

### Header control insets (Phase 4)

All viewport-anchored and identical at both widths, which is what makes them
usable as fixed insets rather than percentages:

| Control | 1339 | 2005 | Rule |
| --- | --- | --- | --- |
| Back | x 24, y 24, 40 × 40 | x 24, y 24 | left inset 24, top 24 |
| Share | x 1225 | x 1891 | right edge at `vw − 74` |
| Save | x 1267 | x 1933 | right edge at `vw − 32` |

Share ends at `vw − 74` and Save begins at `vw − 72`, so the pair sits 2px
apart with a 32px right inset.

Back's centre is `24 + 20 = 44`; the title's is `32.6 + 22.9 / 2 = 44.05`. Two
independent controls centring on the same row is why `--size-tour-header: 88px`
is [CALIBRATED] rather than invented — the centres are measured, the assumption
is only that the header is symmetric about them.

### Thumbnail label block (Phase 4)

MEASURED: the thumbnail button is 131.2 tall with a one-line label and 149.2
with two ("Additional photos"); the image is 105.2 in both. So the label block
is 26px for one line and 44px for two. One gap plus n line boxes fits both
exactly:

```text
8 + 1 × 18 = 26        8 + 2 × 18 = 44
```

The totals are MEASURED; the 8/18 split is [CALIBRATED] — the assumption is
that the two-line case is the same gap with one more line. Our implementation
reproduces the rule and the one-line total exactly (131.2). It does **not**
reproduce the two-line case: Inter at our provisional label size does not wrap
"Additional photos" inside 111.5px, where the reference's font does. That is a
font-substitution consequence (R-3) and a new queue item, TOUR-2b.

### Strip-to-content gap (Phase 4)

MEASURED: the second thumbnail row ends at −4968.8 + 149.2 = −4819.6 and the
first photo starts at −4763.6, so the category strip is followed by **56px**
before the first category block.

### The tour header is pinned (TOUR-7, geometric half)

Four captures catch the tour at four different internal scroll offsets — the
content top sits at −4412 (B, C), −5112 (A) and −6213 (G). In all four, Back
stays at viewport `(24, 24)` and the title at `y 32.6`, at both viewport widths.
The header is therefore outside the scrolling region. Whether it gains a shadow
or border once scrolled is a computed-style question and stays open.

### Photo inventory

43 photos, 9 categories. Every category thumbnail was verified to be the first
photo of its group, which is what confirms the boundary mapping:

| # | Category | Photos | Range |
| --- | --- | --- | --- |
| 1 | Living room 1 | 3 | 1–3 |
| 2 | Living room 2 | 7 | 4–10 |
| 3 | Full kitchen | 2 | 11–12 |
| 4 | Bedroom | 6 | 13–18 |
| 5 | Full bathroom | 1 | 19 |
| 6 | Gym | 5 | 20–24 |
| 7 | Exterior | 6 | 25–30 |
| 8 | Pool | 3 | 31–33 |
| 9 | Additional photos | 10 | 34–43 |

Independently confirmed: capture C has photo 28 open and the lightbox caption
reads "Exterior" — photo 28 falls in range 25–30. ✓

All photos are 1440 × 1080 except the six Exterior photos and one other, which
are 1440 × 808.

---

## Lightbox — largely cleared

| Item | Measured |
| --- | --- |
| LIGHT-2 image | 1100 × 617.2, centred both axes (`(1339 − 1100) / 2 = 119.5`; `(1296 − 617.2) / 2 = 339.4`). Aspect preserved from the source (1440 × 808 → 1.782), so it is contained, not cropped |
| LIGHT-3 prev/next | 40 × 40, vertically centred (`628 + 20 = 648 = 1296 / 2`), 20px inset from each edge |
| LIGHT-5 ends | Uses the **`disabled` attribute** rather than wrapping — both controls are `disabled` when the lightbox is inactive and enabled at photo 28. Behaviour at photos 1 and 43 is inferred, not observed |
| LIGHT-6 counter | Present, format **"28 of 43"** |
| LIGHT-7 caption | The category name, "Exterior", shown with the counter |
| LIGHT-9 exits | **Two**: a "Show all photos" button 40 × 40 at `x 16, y 16` (back to the tour) and a "Close" button 40 × 40 at `x 1275, y 16` |

The 1100px image width may be a fixed cap or viewport-derived; one capture at a
second viewport width settles it. Queue LIGHT-2b.

### Re-read for Phase 5

Four lightbox captures, two viewport widths and two source aspects between
them, sharpen the table above.

**The width is the cap, and the height is the source's.** Both captures of a
1440 × 808 photo render 1100 × 617.2; both of a 1440 × 1080 photo render
1100 × 825. `1100 / (1440 / 808) = 617.2` and `1100 / (1440 / 1080) = 825`. So
one rule — cap the width at 1100, let the aspect set the height — reproduces
every captured lightbox exactly, and `height: auto` is that rule.

**Centred on the viewport, on both axes**, at both widths:

| | C @ 1339 | G @ 2005 |
| --- | --- | --- |
| Image x | 119.5 → centre **669.5** = 1339 / 2 | 452.5 → centre **1002.5** = 2005 / 2 |
| Image y (617.2 tall) | 339.4 → centre **648** = 1296 / 2 | — |
| Image y (825 tall) | — | 235.5 → centre **648** = 1296 / 2 |
| Arrow y | 628 → centre **648** | 628 → centre **648** |

The arrows hold y 628 whether the photo is 617.2 or 825 tall, so they are
anchored to the viewport rather than to the image.

**Control insets, and one asymmetry worth not tidying up.** Previous sits at
x 20 and Next's right edge at `vw − 20` at both widths. "Show all photos" is at
(16, 16). Close is at y 16 — but its right edge is at `vw − 24`, not `vw − 16`:
`1339 − 1275 − 40 = 24` and `2005 − 1941 − 40 = 24`. The left and right insets
of the two exits genuinely differ by 8px in the reference, and the build
reproduces that rather than assuming symmetry.

**E and F are captured at `scrollY 300`**, so their control rects read 300px
higher than the viewport coordinates above; every figure here is normalised.

---

## A fourth overlay we had not scoped

Three `role="dialog"` elements coexist in the DOM:

| `aria-label` | Rect | Purpose |
| --- | --- | --- |
| Photo tour | 1339 × 1296 at 0,0 | full-screen |
| Photo viewer | 1339 × 1296 at 0,0 | full-screen lightbox |
| **What this place offers** | **780 × 1200 at x 279.5, y 68** | centred amenities modal |

The amenities modal is a third dialog with its own scale: 780 wide, centred
(`(1339 − 780) / 2 = 279.5`), 48px content inset (its `h2` starts at x 327.5),
close button 40 × 40 at `x 295.5, y 80`, and twelve `h3` groups. It is opened by
"Show all 50 amenities". `docs/07-component-architecture.md` needs a third
`Dialog` consumer, and `docs/05-accessibility-plan.md` a third focus contract.

---

## Accessibility — measured

### What the reference does well

- One `<h1>`.
- All three overlays are `role="dialog"` + `aria-modal="true"` + `aria-label`.
- Every photo is a `<button>` with a descriptive accessible name; no clickable
  non-button elements were found.
- Icon-only controls carry real labels: "Back", "Previous", "Next", "Close",
  "Show all photos", "Zoom in", "Zoom out", "Choose a language and currency".
- A skip link to `#main` is the first focusable element.

### Where it falls short of our plan

- **Focus is not moved into the dialog on open.** In the tour capture
  `document.activeElement` is still the "Show all photos" trigger; in the
  lightbox capture it is still the tour thumbnail that was clicked.
- **The background is not inert.** `main` carries neither `inert` nor
  `aria-hidden`, so the whole listing page stays in the tab order and the
  accessibility tree behind both overlays.
- **Every `<img>` has `alt=""`.** The accessible name lives only on the wrapping
  button, so the photo itself is announced as decorative.

`docs/05-accessibility-plan.md` already commits us to focus movement, trapping,
restoration, inertness and real alt text. These three gaps are where our build
will deliberately diverge, and the README will say so.

---

## Content — captured

Recorded into `src/data/listing.ts` and `src/data/photos.ts`: title, subtitle,
capacity, rating 4.95 / 19 reviews, the six-category rating breakdown, Guest
favourite badge, three highlights, the full description, two sleeping
arrangements, ten featured amenities + "Show all 50", twelve amenity group
headings, ten review tags with counts, six review cards, host block (Mirashya
Homes, 1,463 reviews, 4.68★, 2 years, 100% response rate, eight co-hosts),
location copy, three house rules, ₹28,499 for 5 nights (18–23 Oct 2026), and
eight "More stays nearby" cards with prices and ratings.

Two structural surprises worth flagging to Phase 2:

- **The date picker is real and inline.** A two-month calendar (October and
  November 2026) sits in the **left** column, not in the booking card, with
  Previous/Next month controls at `x 109.5` and `x 729.5` and a "Clear dates"
  button. The booking card holds only the CHECK-IN / CHECKOUT / GUESTS summary.
- **The map is interactive**, not a static image: Search, Zoom in and Zoom out
  controls are present at `x 121.5` and `x 1177.5`. Reproducing it needs a map
  library and a tile source, which is a scope decision — queue SEC-8b.

Other measured section geometry: "Things to know" is 3 columns of 352px with a
32px gap (`109.5 / 493.5 / 877.5`); the review tag row is a horizontal scroller
whose children extend past the content edge to x 1635; "More stays nearby" is a
carousel with a "1 / 2" pager and 32 × 32 arrows, previous `disabled` at rest.

---

---

## Second-viewport confirmations (captures D–H, 2005 × 1296)

A second width turns single measurements into confirmed rules.

| What | At 1339 | At 2005 (client 1990) | Rule |
| --- | --- | --- | --- |
| Shell | `x 29.5, w 1280` | `x 355, w 1280` | **max-width 1280, centred** — confirmed |
| Content | `x 109.5, w 1120` | `x 435, w 1120` | **1120 fixed**, gutter 80 — confirmed |
| Header inner | `x 80, w 1179` | `x 115, w 1760` | **max-width 1760 with 80px padding**. At 1339: `1339 − 160 = 1179 < 1760`, so padding wins. At 1990: capped at 1760, margins `(1990 − 1760) / 2 = 115` |
| Hero mosaic | 1120 × 494 | 1120 × 494 | **Fixed**, not viewport-scaled — clears HERO-8 |
| "Show all photos" | right inset 24 | `1387.7 + 143.3 = 1531`, content right 1555 → 24 | confirmed |
| Booking card | left 857.5 | `1555 − 372 = 1183`; `1183 + 1 + 24 = 1208` = measured Reserve x | confirmed |
| Amenities dialog | `x 279.5, w 780` | `x 605, w 780` | **fixed 780, centred** — confirmed |
| Lightbox image | 1100 wide | **1100 wide** | **1100 is a fixed cap**, not viewport-derived — clears LIGHT-2b |

The lightbox image's height follows its source aspect at that fixed width:
1440 × 808 → 1100 × 617.2, and 1440 × 1080 → 1100 × 825. Both are centred on the
**window** width (`(2005 − 1100) / 2 = 452.5`, the measured x), not the client
width — so the overlay is laid out across the full viewport including the
scrollbar column.

### The overlay shifts the page sideways

Capture D (listing, no overlay) reports the header at `w 1990`; capture H (tour
open, same window) reports `w 2005`, and `scrollbarWidth` is 15 on the listing
page and 0 with an overlay open.

So the reference locks body scroll **without reserving the scrollbar gutter**:
opening the photo tour widens the client area by 15px and shifts the centred
page 7.5px to the right underneath the overlay. It is small but visible on
close. Our `scrollbar-gutter: stable` on `<html>` (already in `globals.css`)
avoids it — a deliberate divergence, not a miss.

---

## Scroll behaviour — partly cleared

Two scroll positions were captured, 0 and 300. The probe records
`viewport y + scrollY`, so an element pinned to the viewport keeps a *constant
viewport* y while its recorded document y grows with the scroll.

| Element | `scrollY 0` | `scrollY 300` | Reading |
| --- | --- | --- | --- |
| `header` | doc y 0 | doc y **0** | Viewport y moved 0 → −300. **The header is static and scrolls away.** It is not sticky |
| Sub-nav ("Photos" link) | doc y −66 | doc y **234** | Viewport y stayed **−66** at both. **Viewport-pinned**, parked just above the top edge, and still hidden at `scrollY 300` — so its reveal threshold is **> 300px** |
| Booking card (Reserve) | doc y 1068 | doc y **1068** | Static at both; the card's top had not yet reached any sticky offset by `scrollY 300`, so this is **inconclusive** — BOOK-2 stays open |

That the main header is *not* sticky is worth stating plainly, because it is the
opposite of the usual assumption for this layout.

---

## Lightbox end behaviour — cleared

Three lightbox captures at different photos settle LIGHT-5:

| Capture | Photo | Previous | Next |
| --- | --- | --- | --- |
| F | 25 of 43 | enabled | enabled |
| G | 40 of 43 | enabled | enabled |
| E | **43 of 43** | enabled | **`disabled`** |

**The lightbox disables at the ends; it does not wrap.** Photo 1 was not
captured, but the mechanism is the `disabled` attribute and the behaviour at the
last photo is direct evidence, so the first-photo case is taken as symmetric.

`modalItem` maps to photo number as `modalItem − 999`: 1024 → 25, 1039 → 40,
1042 → 43, and 1027 → 28 in capture C. The counter text confirms each one.

---

---

## Vertical rhythm (recovered in Phase 3)

Computed styles never arrived, but the probe did record element bounds — and
differencing adjacent bounds in the clean listing capture recovers the rendered
distances without them. These are measured distances, not padding or margin
values; which of the two produces each is still unknown.

| Distance | From → to | Value |
| --- | --- | --- |
| Gallery to body | gallery bottom 667 → two-column body top 715 | **48px** |
| Heading to content | h2 "Where you'll sleep" bottom 1532.3 → sleeping images 1556.3 | **24px** |
| Label to value | h2 "Entire serviced apartment…" bottom 741 → capacity row 747 | **6px** |
| Title block | section top 89 → h1 121, h1 bottom 151 → gallery 173 | **32px / 22px** |

Those four now back `--space-section`, `--space-block`, `--space-stack`,
`--space-title-top` and `--space-title-bottom`. LAY-4 moves from open to
partly cleared.

---

## Still unmeasured

Colour, font size, font weight, letter-spacing, border, radius, shadow,
transition, easing, `z-index`, focus-visible styling, contrast, hover, keyboard
behaviour and reduced motion.

All of it depends either on computed styles — which have now failed in two
separate probe sessions — or on live interaction, which a static capture cannot
reach. `docs/measure/probe-2-styles.js` covers the first; the manual DevTools
checklist in `VERIFICATION-QUEUE.md` covers the second.
