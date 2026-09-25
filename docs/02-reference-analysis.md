# 02 — Reference analysis

> **Superseded in part by `12-measurements.md`.** This file was written before
> the reference could be inspected; it is the structural model and the list of
> questions. Phase 1 answered most of them — where the two disagree, the
> measurements win. Corrections are listed immediately below.

## Phase 1 corrections to this document

| Section below | What it assumed | What was measured |
| --- | --- | --- |
| Page skeleton | One shell | **Two**: a 1280px centred shell containing a 1120px content column (80px gutter) |
| 1. Header | Presence unconfirmed | Present, 89px tall, and **full-bleed with 80px padding — it does not use the 1280 shell**. A second 67px sticky section-nav sits above the fold |
| 3. Hero gallery | Ratios unknown | 3 × 2 grid, `560/272/272` × `243/243`, 8px gaps, 1120 × 494 total. The five hero photos are a **curated selection** (tour photos 7, 4, 5, 13, 29), not the first five |
| 7. Description | "Show more" may open a modal | Unresolved, but a **third dialog** exists that this document missed entirely: "What this place offers", 780 × 1200, centred |
| 10. Location | "A static image is very likely" | **Wrong — the map is interactive**, with Search, Zoom in and Zoom out controls |
| 13. Footer | Open question | **There is no footer** |
| Booking card | Sticky rail assumed | Card is 372 wide (1px border, 24px padding). The **date picker is a two-month calendar in the left column**, not in the card |

Everything else in the model held up.

## Page skeleton (observed in the reference screenshot)

```text
┌─────────────────────────────────────────────────────────────────┐
│ [header — presence and stickiness unverified]                    │
├─────────────────────────────────────────────────────────────────┤
│ Romantic Jacuzzi 1BHK Candolim | Mirashya UG10   ⤴ Share  ♡ Save│  ← title row
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────┬────────┬────────┐                              │
│ │               │  img2  │  img3  │                              │  ← hero mosaic
│ │     img1      ├────────┼────────┤                              │    1 large + 4
│ │               │  img4  │  img5  │                              │
│ └───────────────┴────────┴────────┘  [⊞ Show all photos]         │
├──────────────────────────────────┬──────────────────────────────┤
│ Entire serviced apartment in     │  ┌────────────────────────┐  │
│ Candolim, India                  │  │ 🟢 Get 10% off your     │  │  ← promo strip
│ 3 guests · 1 bedroom · 1 bed ·   │  │    next stay  [Claim]  │  │
│ 1 bathroom                       │  └────────────────────────┘  │
│                                  │  ┌────────────────────────┐  │
│ (highlights)                     │  │   booking card         │  │  ← sticky
│ (description)                    │  │   (sticky on scroll)   │  │
│ (amenities)                      │  └────────────────────────┘  │
│ (reviews)                        │                              │
│ (location)                       │                              │
│ (host)                           │                              │
│ (rules / safety / cancellation)  │                              │
├──────────────────────────────────┴──────────────────────────────┤
│ (similar stays?)                                                 │
│ (footer?)                                                        │
└─────────────────────────────────────────────────────────────────┘
```

Two structural facts are legible in the screenshot and can be relied on:

1. The title row sits **above** the gallery, with Share and Save right-aligned on
   the same baseline. That is the modern Airbnb layout, not the older
   title-below-gallery one.
2. The page is a **two-column body** below the gallery: a wide left content
   column and a narrower right rail carrying the promo strip and booking card.

Everything else in the sketch is a hypothesis with a queue item against it.

## Section-by-section model

For each section: what it is, what the implementation needs to get right, and
the open questions. "Open" items map to `VERIFICATION-QUEUE.md` ids.

### 1. Header

- **Role.** Global chrome — brand, search affordance, host/menu cluster.
- **Gets it right by.** Height, whether it is sticky, and what it gains on scroll
  (border, shadow, or nothing). A header that changes on scroll is a motion item,
  not just a layout one.
- **Open.** LAY-5. Presence at all is unconfirmed — the reference screenshot is
  cropped above the title row.

### 2. Title row

- **Role.** `<h1>` plus Share and Save actions.
- **Gets it right by.** The title is a single long string that must not wrap
  differently from the reference at 1440px — wrap point is a fidelity tell. Share
  and Save are icon+label buttons with underline-on-hover.
- **Open.** TYPE-2, COL-1.

### 3. Hero gallery (mosaic)

- **Role.** Five-tile mosaic, one large left tile and a 2×2 block right, with a
  "Show all photos" control anchored to the bottom-right of the mosaic.
- **Gets it right by.** Three things in priority order: the **aspect ratio** of
  the whole mosaic, the **gap**, and **which corners are rounded** (the outer
  corners typically are; the inner ones are not). Image `object-fit: cover` with
  a fixed ratio per tile, so no tile ever letterboxes.
- **Hover.** The screenshot cannot show it. Convention is a brightness filter on
  the hovered tile; scale-on-hover inside a fixed frame is the other common
  choice. Must be measured, not chosen.
- **Open.** HERO-1 … HERO-7.

### 4. Overview row

- **Role.** "Entire serviced apartment in Candolim, India" as a section heading,
  with "3 guests · 1 bedroom · 1 bed · 1 bathroom" beneath it.
- **Gets it right by.** The separator is a middle dot with specific spacing, and
  the capacity string is **generated from data**, not stored as a sentence — see
  `08-data-model.md`.
- **Open.** SEC-3.

### 5. Promo strip

- **Role.** A bordered card in the right rail: a green indicator, "Get 10% off
  your next stay", and a Claim button.
- **Gets it right by.** Whether it sits above the booking card in the sticky
  container or scrolls away independently. That changes the sticky
  implementation.
- **Open.** SEC-2, BOOK-2.

### 6. Highlights

- **Role.** Icon + title + description rows (self check-in, great location, etc.).
- **Open.** SEC-4.

### 7. Description

- **Role.** Body copy, usually clamped with a "Show more" control that opens a
  dialog.
- **Gets it right by.** The clamp line count and whether "Show more" opens a
  modal or expands inline. If it opens a modal, that is a **fourth** dialog to
  get right and is in scope for the accessibility work.
- **Open.** SEC-5.

### 8. Amenities

- **Role.** A grid of featured amenities with icons, plus "Show all N amenities".
- **Gets it right by.** Grid column count, row gap, icon size and baseline
  alignment with the label. Unavailable amenities render struck through.
- **Open.** SEC-6.

### 9. Reviews

- **Role.** Overall rating, a per-category breakdown, then a grid of review
  cards.
- **Gets it right by.** Breakdown bars are the fiddliest element on the page —
  track colour, fill colour, height, radius and label alignment. Review cards
  clamp their body text with a "Show more".
- **Open.** SEC-7, DATA-3.

### 10. Location

- **Role.** Map with a neighbourhood description.
- **Gets it right by.** Whether the map is interactive. A static image is
  cheaper and is very likely what the reference uses; an interactive map would
  add a dependency and a licence key, and is out of scope unless confirmed.
- **Open.** SEC-8.

### 11. Host

- **Role.** Host avatar, name, Superhost badge, tenure and stats, plus co-hosts.
- **Open.** SEC-9, DATA-4.

### 12. Rules, safety, cancellation

- **Role.** Three-column block of policy copy.
- **Open.** SEC-10.

### 13. Similar stays / footer

- **Open.** SEC-11, LAY-6.

## What "pixel-perfect" actually turns on

From experience with this class of task, marks are lost in this order:

1. **Container width and gutter.** Wrong by 40px and every section below is
   wrong, no matter how good each section is on its own. Measure this first.
2. **Mosaic aspect ratio.** The most visually dominant element on the page.
3. **Line-height.** Drives section heights; a 2px error compounds down the page.
4. **Divider placement.** Which sections have a top border and which do not.
5. **Hover and focus states.** Half the "behavioural parity" score lives here and
   is invisible in any screenshot.

The build order in `10-roadmap.md` follows that list deliberately.
