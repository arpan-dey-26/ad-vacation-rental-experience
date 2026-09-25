# Verification queue

**Status after Phase 5: 58 of 87 cleared, 5 partial, 24 open.**

Phase 4 added one item (TOUR-2b) rather than clearing any. Phase 5 cleared two
by re-reading the four lightbox captures rather than by capturing anything new:
LIGHT-2 (the 1100 cap is the WIDTH; the height is the source's aspect, verified
against two different source shapes) and LIGHT-5 (photos 1 and 43 were inferred
by symmetry before; capture E shows Next `disabled` at 43, and the build now
disables both ends by the same rule).

> **Phase 4 prep, and a route that is now closed.** `probe-2-styles.js` was run
> again in a fresh normal Chrome window on the reference and the SELF-CHECK
> still **FAILED** — computed styles are empty there for a third time, across
> three separate sessions. Script-read computed style is therefore treated as
> **permanently unavailable**, not pending. The 21 items that waited on it are
> reclassified from *blocked* to *will not be measured*, and every value they
> would have supplied stays `[PROVISIONAL]` through Phase 4 rather than being
> invented. Re-mining the captures in its place cleared TOUR-0 and half of
> TOUR-7 — both below, both geometric, neither dependent on computed style.

The item count grew from 70 because measurement split several questions into
sharper ones (LAY-5b/5c, LAY-7, TYPE-6) and surfaced a whole surface nobody had
scoped — the amenities dialog.

Measured values and their derivation live in `12-measurements.md`. Captures are
in `measure/captures/`. Nothing is marked cleared unless a capture supports it.

## What happened

**Phase 1** — three probe captures (A–C), all taken with the photo tour open.
Geometry, text, image sources and ARIA came through cleanly; 41 items cleared.

**Phase 1b** — five further captures (D–H) were found in Downloads from an
earlier probe session. They supplied the three things A–C could not: a **clean
listing page**, a **second viewport width** (2005 vs 1339), and **two scroll
positions** (0 and 300). Twelve more items cleared, including several that had
looked unreachable: the header is not sticky, the hero height is fixed, the
lightbox cap is fixed, and the lightbox disables rather than wraps at the ends.

Both decisions were also implemented: **R-3** (no proprietary font — substitute
and calibrate) and **R-4** (no packaged photography — see `13-asset-strategy.md`).

## The one blocker behind almost everything still open

**Every computed style came back empty in all eight captures**, across two
separate probe sessions, and the self-checking second probe failed in a third.
`type`, `box`, `motion`, `position`, `zIndex`, `gridTemplate*` and `gap` are
`""` on every element; `root.bodyFont` is empty.

Of the 24 open items, **19 trace to that one fault** — all of COL, most of TYPE,
all of MOT, HERO-3, HERO-6, BOOK-1b, LIGHT-1, LIGHT-4, TOUR-1, TOUR-2b, the
second half of TOUR-7, LAY-5c, A11Y-4 and A11Y-5 — and they are classified **will
not be measured**, not *pending*. Nothing script-readable can move them.

The remaining 5 need live interaction, not a static capture: LIGHT-8 (backdrop
click), AMEN-3 and AMEN-4 (a dialog nobody has captured), SEC-6b, SEC-8b,
BOOK-2 (a deeper scroll), DATA-7 (human judgement on alt text).

Every one of them has a decision recorded against it in the build, so none is
silently absent: where behaviour could not be observed it was not invented, and
where a value could not be measured it stayed `[PROVISIONAL]` in a named token.

## Layout and container

| # | Item | Status | Value |
| --- | --- | --- | --- |
| LAY-1 | Page content max-width | **cleared** | 1120px |
| LAY-2 | Side gutter and breakpoint behaviour | **cleared** | 80px gutter, shell max-width 1280px; content is 1120px at every viewport ≥1280 |
| LAY-3 | Two-column split | **cleared** | 652 / 96 gap / 372 |
| LAY-4 | Vertical rhythm between sections | **cleared** (partly) | Recovered in Phase 3 by differencing adjacent element bounds in the clean listing capture: **section gap 48** (gallery 667 → body 715), **heading→content 24** (1532.3 → 1556.3), **label→value 6** (741 → 747), **title padding 32 / 22**. The padding-vs-margin split behind each still needs computed styles, but the rendered distances are now measured |
| LAY-5 | Header height and side padding | **cleared** | 89px tall; inner row **max-width 1760px with 80px side padding** — confirmed at two viewport widths; full-bleed, not inside the 1280 shell |
| LAY-5b | Is the header sticky? | **cleared** | **No.** Its document y stays 0 at `scrollY` 0 and 300, so it scrolls away |
| LAY-5c | Sub-nav reveal mechanism and threshold | open | Viewport-pinned at y −66 at both `scrollY` 0 and 300, so the reveal threshold is **> 300px**; the mechanism needs computed styles |
| LAY-7 | Scrollbar gutter on overlay open | **cleared** | The reference does **not** reserve it: client width goes 1990 → 2005 when an overlay opens, shifting the page 7.5px. Ours uses `scrollbar-gutter: stable` — a deliberate divergence |
| LAY-6 | Footer | **cleared** | There is none — no `footer` landmark, content ends at "More stays nearby" |

## Hero gallery

| # | Item | Status | Value |
| --- | --- | --- | --- |
| HERO-1 | Grid template and tile count | **cleared** | 3 cols `560/272/272` (= `35fr 17fr 17fr`), 2 rows `243/243`, first tile spans both |
| HERO-2 | Gap | **cleared** | 8px |
| HERO-3 | Corner radii | open | needs computed styles |
| HERO-4 | Mosaic aspect and height | **cleared** | 1120 × 494 |
| HERO-5 | "Show all photos" button | **cleared** (geometry) | 143.3 × 32, inset 24px from bottom-right, inline SVG. Fill, radius, border, shadow still open |
| HERO-6 | Hover treatment | open | needs a forced-`:hover` capture |
| HERO-7 | Tiles are buttons? | **cleared** | `<button>`, named "… image N" |
| HERO-8 | Is the 494px height fixed or aspect-derived? | **cleared** | **Fixed.** Identical 1120 × 494 at viewports 1339 and 2005 |

## Typography

| # | Item | Status | Value |
| --- | --- | --- | --- |
| TYPE-1 | Font family served | **cleared** | **Airbnb Cereal VF**, variable 200–900, loaded. Proprietary — see `11-risks.md` R-3 |
| TYPE-2 | Title size / weight / tracking | partial | Line box 30px MEASURED; font-size 26px now **[CALIBRATED]** from it (see `14-visual-fidelity-note.md` § 2). Weight and tracking still open |
| TYPE-3 | Section heading scale | partial | three distinct `h2` line boxes measured: page 26px, tour 22.9px, amenities dialog 31.5px; `h3` 25.7px |
| TYPE-4 | Body and meta scales | open | needs computed styles |
| TYPE-5 | Truncation vs. wrapping | open | h1 renders 602.2px wide in a 1120px column, so it does not wrap at this width; review-card clamping unmeasured |

## Colour

| # | Item | Status |
| --- | --- | --- |
| COL-1 | Text colour ramp | open |
| COL-2 | Divider colour and placement | open |
| COL-3 | Accent usage | open |
| COL-4 | Button fills (rest / hover / active) | open |
| COL-5 | Overlay backdrop colour and opacity | open |

All five need computed styles. `probe-2-styles.js` sweeps every painted colour
with a usage count, so the ramp is derived from what dominates.

## Sections and content

| # | Item | Status | Value |
| --- | --- | --- | --- |
| SEC-1 | Ordered section list | **cleared** | title · gallery · overview · highlights · description · sleeping · amenities · calendar · reviews · location · host · things to know · more stays nearby |
| SEC-2 | Promo strip | **cleared** | Right rail: "Get 10% off your next stay." + "Terms apply" link + Claim button 65.5 × 34 |
| SEC-3 | Overview row | **cleared** | "3 guests · 1 bedroom · 1 bed · 1 bathroom" |
| SEC-4 | Highlights | **cleared** | 3 items, captured verbatim |
| SEC-5 | Description and "Show more" | **cleared** (structure) | Button 104.2 × 21 with SVG; plus "Some info has been automatically translated. Show original". What "Show more" opens is unobserved |
| SEC-6 | Amenities | **cleared** | 10 featured, "Show all 50 amenities", dialog with 12 `h3` groups |
| SEC-6b | Individual amenities inside the dialog | open | Only the 12 group headings were captured. The Phase 3 dialog renders **only** the ten measured amenities rather than inventing forty to fill twelve headings; the empty groups stay in the data as evidence |
| SEC-7 | Reviews | **cleared** | 4.95 / 19; 6 breakdown rows; 10 tag buttons in a horizontal scroller; 6 cards; "Show all 19 reviews" |
| SEC-8 | Map | **cleared** | **Interactive** — Search, Zoom in, Zoom out controls present |
| SEC-8b | Map provider, tiles, coordinates | open | Not exposed in the DOM. A scope decision: reproducing an interactive map adds a library and a tile source |
| SEC-9 | Host section | **cleared** | Mirashya Homes, 1,463 reviews, 4.68★, 2 years, 100% response, 8 co-hosts |
| SEC-10 | Rules / safety / cancellation | **cleared** | 3 columns of 352px, 32px gap |
| SEC-11 | Similar stays | **cleared** | Carousel, 8 cards, "1 / 2" pager, 32 × 32 arrows, previous `disabled` at rest |
| SEC-12 | Inline date picker | **cleared** (new) | Two-month calendar in the **left** column with Previous/Next month and "Clear dates" — not in the booking card |

## Booking card

| # | Item | Status | Value |
| --- | --- | --- | --- |
| BOOK-1 | Width, padding, border | **cleared** | 372 wide, 1px border, 24px padding → 322 inner |
| BOOK-1b | Radius and shadow | open | needs computed styles |
| BOOK-2 | Sticky offset and range | open | Narrowed: **not engaged by `scrollY` 300** — the card's top had not reached any offset by then. Needs a deeper scroll sample |
| BOOK-3 | Price presentation | **cleared** | "₹28,499" + "for 5 nights" |
| BOOK-4 | Date / guest controls | **cleared** | Card shows CHECK-IN / CHECKOUT / GUESTS summary; the picker itself is the inline calendar (SEC-12) |
| BOOK-5 | CTA | **cleared** (geometry) | Reserve 322 × 48; fill and hover open |

## Photo tour

| # | Item | Status | Value |
| --- | --- | --- | --- |
| TOUR-1 | Entrance transition | open — **will not be measured** | Needs computed styles. Phase 4 ships the tour with no entrance transition rather than an invented one: it mounts, and the reduced-motion contract is honoured for the transitions that do exist (hover, smooth scroll) |
| TOUR-0 | Is the tour's internal width fixed or viewport-derived? | **cleared** (Phase 4 prep) | **Fixed and centred.** A (1339) vs H (2005): thumb strip, 458 column, 223 halves and 111.5 thumbs are byte-identical; every x shifts by exactly 333 = (2005 − 1339) / 2. Content left edge = (viewport − 15 − 976) / 2 at both widths, which confirms the 15px scroller gutter. The header row centres on the **full** viewport (title mid-point = vw / 2 at both), the content on the scroller's content box |
| TOUR-2 | Category strip | **cleared** | Button 111.5 × 131.2, image 111.5 × 105.2, label 26px / 44px, gap 12, 8 per row, strip 976 wide |
| TOUR-2b | Thumbnail label font-size | open (new, Phase 4) | The MEASURED 44px two-line block proves the reference wraps "Additional photos" inside 111.5px. Inter at our [PROVISIONAL] 14px does not, so that one thumbnail renders 131.2 where the reference is 149.2. Needs the label's computed font-size; isolated in `--text-tour-label` so one measurement fixes it |
| TOUR-3 | Category names and chips | **cleared** | 9 categories, chips captured verbatim into `src/data/photos.ts` |
| TOUR-4 | Body layout | **cleared** | Column 458 wide; full 458 × 305.3 and half 223 × 148.7 pairs, aspect 1.5; 12px within a category, 20px between |
| TOUR-5 | Close control | **cleared** | A "Back" arrow 40 × 40 at (24, 24); Share and Save top-right |
| TOUR-6 | Category click: scroll or filter? | **cleared** | Scroll — all 43 photos are in one continuous sequence at all times |
| TOUR-7 | Header behaviour on scroll | **partial** (Phase 4 prep) | **Pinned.** Back stays at viewport `(24, 24)` and the "Photo tour" title at `y 32.6` across four different internal scroll offsets — content top at −4412 (B, C), −5112 (A) and −6213 (G) — and at both viewport widths. So the header does not scroll with the photo column. Whether it *changes* on scroll (shadow, border, background) still needs computed styles |
| TOUR-8 | Underlying page scroll on close | **cleared** | Page stayed at `scrollY 0`; the tour keeps its own scroll while the lightbox is open |

## Lightbox

| # | Item | Status | Value |
| --- | --- | --- | --- |
| LIGHT-1 | Backdrop colour and opacity | open — **will not be measured** | Needs computed styles. The single number with no evidence behind it is named `--opacity-viewer-backdrop` rather than buried in a rule |
| LIGHT-2 | Image sizing | **cleared** (sharpened in Phase 5) | The **width** is the cap and the height is the source's aspect: a 1440 × 808 photo renders 1100 × 617.2 and a 1440 × 1080 one 1100 × 825, and `1100 / aspect` gives both exactly. Centred on both axes at both widths — image centre = vw / 2 and vh / 2 |
| LIGHT-2b | Is 1100 a fixed cap or viewport-derived? | **cleared** | **Fixed cap.** 1100px wide at both 1339 and 2005; height follows the source aspect. Centred on the window, not the client area |
| LIGHT-3 | Prev/next controls | **cleared** (geometry) | 40 × 40, vertically centred, 20px inset each side |
| LIGHT-4 | Photo-to-photo transition | open — **will not be measured** | Needs computed styles. Phase 5 ships **no** transition rather than an invented one: the image is keyed by photo id, so stepping swaps the element outright |
| LIGHT-5 | Behaviour at first/last photo | **cleared** | **Disables, does not wrap.** At photo 43 of 43 Next is `disabled` and Previous is enabled; at photos 25, 28 and 40 both are enabled. Photo 1 follows by symmetry, and the build derives both ends from one rule so they cannot disagree. Asserted at all five captured positions |
| LIGHT-6 | Position indicator | **cleared** | "28 of 43" |
| LIGHT-7 | Caption | **cleared** | Category name shown with the counter |
| LIGHT-8 | Backdrop click to close | open — **not resolvable from captures** | Not observable from a static capture. **Phase 3 decision, kept through Phase 5:** the backdrop does **not** close — guessing either way would invent behaviour, and Escape plus *two* exits mean the viewer is never a trap. Asserted, so the decision cannot drift silently |
| LIGHT-9 | Exits | **cleared** | Two: "Show all photos" (40 × 40 at 16,16) back to the tour, and "Close" (40 × 40 at 1275,16) |

## Amenities dialog (added in Phase 1)

| # | Item | Status | Value |
| --- | --- | --- | --- |
| AMEN-1 | Dialog geometry | **cleared** | 780 × 1200 at (279.5, 68), centred; 48px content inset; close 40 × 40 at (295.5, 80). **Implemented in Phase 3** and asserted by `verify:interactions` |
| AMEN-2 | Group headings | **cleared** | 12, captured |
| AMEN-3 | Items per group | open | see SEC-6b |
| AMEN-4 | Scroll, focus and close behaviour | open | Needs an amenities-dialog capture. Ours implements the full contract — focus in, trap, Escape, restore, inert, scroll lock — which the reference does not; see `14-visual-fidelity-note.md` § 5 |

## Motion

| # | Item | Status |
| --- | --- | --- |
| MOT-1 | Transition inventory with duration and easing | open |
| MOT-2 | Scroll-triggered animation | open |
| MOT-3 | Does the reference honour `prefers-reduced-motion`? | open |

## Accessibility

| # | Item | Status | Finding |
| --- | --- | --- | --- |
| A11Y-1 | Dialog semantics | **cleared** | All three dialogs: `role="dialog"`, `aria-modal="true"`, `aria-label` |
| A11Y-2 | Focus behaviour | **cleared** | Focus is **not** moved into either overlay on open; the background is **not** inert (`main` has neither `inert` nor `aria-hidden`) |
| A11Y-3 | Headings and landmarks | **cleared** | One `h1`; `header, nav, nav, main, aside` + the overlay's own `header, nav, header`; no `footer`; every `<img>` has `alt=""` with the name on the wrapping button |
| A11Y-4 | Focus-visible styling | open | needs computed styles |
| A11Y-5 | Contrast ratios | open | needs computed styles |

Where the reference is weaker than the brief demands (A11Y-2, and `alt=""`), our
build implements it properly and the README records the divergence.

## Data and assets

| # | Item | Status | Value |
| --- | --- | --- | --- |
| DATA-1 | Photo list, order, categories | **cleared** | 43 photos, 9 categories, full/half spans, every category thumbnail confirmed as its group's first photo |
| DATA-2 | Amenity list and grouping | partial | 10 featured + 12 group headings captured; items per group open (SEC-6b) |
| DATA-3 | Reviews | partial | 6 of 19 cards + full rating breakdown + 10 tags captured; the other 13 need the reviews dialog |
| DATA-4 | Host details | **cleared** | captured |
| DATA-5 | Pricing | **cleared** | ₹28,499 for 5 nights, 18–23 Oct 2026 |
| DATA-6 | Overview / highlights / rules copy | **cleared** | captured |
| DATA-7 | Per-photo descriptive alt text | open | The reference has none to copy. Current alt is category-derived; a human pass over the images would improve it |
| IMG-1 | Image hosting decision | **resolved** | Provenance investigated: redistribution not clearly permitted, so nothing is packaged. Reference URLs behind a single `ORIGIN` constant, fetched at runtime. See `13-asset-strategy.md` |

## How to clear the rest

Everything below needs a browser I cannot reach: the reference refuses the
in-app browser, `robots.txt` disallows automated fetching, and the Chrome
extension is not connected. These are Arpan's runs.

### Step 1 — ~~probe 2, four states~~ **closed; DevTools by hand instead**

`probe-2-styles.js` failed its self-check in a fresh normal Chrome window on a
third attempt. Page-script computed style is unavailable on this reference, so
the table below is kept only as the record of what that route *would* have
cleared. **Do not run it a fourth time.**

The one remaining route reads styles through the inspector rather than through
page script, which is a different mechanism and may well work: DevTools →
Elements → **Computed**, on a handful of elements — the overlay backdrop, a
thumbnail, a photo tile, the Reserve button, a focused control. Four values
each (`background-color`, `border-radius`, `box-shadow`, `transition`) would
clear COL-1, COL-4, COL-5, HERO-3, BOOK-1b and A11Y-4 between them. Read off by
hand; no script involved.

The superseded plan:

| Run | State | Clears |
| --- | --- | --- |
| 1 | Listing page, top of page | COL-1…5, TYPE-2…5, LAY-4, LAY-5c, HERO-3, BOOK-1b, A11Y-4, A11Y-5, MOT-1, MOT-2, plus BOOK-2 from its scroll sweep |
| 2 | Photo tour open | TOUR-1, TOUR-7 |
| 3 | Lightbox open | LIGHT-1, LIGHT-4 |
| 4 | "Show all 50 amenities" dialog open | AMEN-3, AMEN-4, SEC-6b |

**Read the SELF-CHECK line it prints first.** If it says FAILED, send me what it
says instead of the file — that means computed styles are blocked again and we
need a different route, not a third empty capture.

Run 1 also does the scroll sweep (0 → 3500px) that settles BOOK-2 and LAY-5c.

### Step 2 — font calibration (clears TYPE-6)

Paste `measure/font-calibration.js` on the listing page. It prints one number:
`--font-size-adjust`. Send that.

### Step 3 — forced hover (clears HERO-6, part of COL-4)

DevTools → Elements → select a hero tile → `:hov` → tick **Force `:hover`** →
re-run probe 2. Repeat for "Show all photos". Two more files, or just the
`targets` block from each.

### Step 4 — reduced motion (clears MOT-3)

DevTools → Rendering → **Emulate CSS `prefers-reduced-motion: reduce`** →
reload → open the photo tour. Does anything still animate? A one-line answer is
enough.

### Step 5 — keyboard behaviour (no queue item; needed for the build)

A script cannot force `:hover` or press keys for you. In the photo tour, then
the lightbox, answer these:

- Does `Escape` close it?
- Does Tab stay inside, or does it escape into the page behind?
- Where does focus land when it opens? Where does it return when it closes?
- Do `←` and `→` change photo in the lightbox? Do they do anything in the tour?
- Does clicking the backdrop close the lightbox? (LIGHT-8)

### Step 6 — 1280px width (confirmation only)

HERO-8 and LIGHT-2b are already cleared by the 1339 vs 2005 pair. A run at
exactly 1280 would confirm the shell's behaviour at its own cap — useful, not
blocking.
