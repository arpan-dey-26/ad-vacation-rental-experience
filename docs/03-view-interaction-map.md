# 03 — Three-view interaction map

How each view opens, closes and behaves. Where the reference's exact choice is
unverified the row says so and names a queue item; where the assignment states a
behaviour outright it is binding regardless.

## Phase 1 corrections

- **There is a fourth view.** "What this place offers" is a third
  `role="dialog"`, 780 × 1200, centred, opened by "Show all 50 amenities". It
  shares the `Dialog` shell and needs the same focus contract.
- **The photo tour's close control is a "Back" arrow**, not an X, and the tour
  also carries its own Share and Save buttons.
- **The lightbox has two exits**: "Show all photos" (top-left, returns to the
  tour) and "Close" (top-right).
- **The lightbox announces position as "N of 43"** and shows the category name
  as a caption.
- **Ends disable rather than wrap** — the prev/next controls use the `disabled`
  attribute.
- **Category clicks scroll**, they do not filter: all 43 photos are always in
  the DOM in one continuous sequence.
- **The reference does not move focus into either overlay on open**, and does
  not make the background inert. Our contract below still applies — that is a
  deliberate divergence, recorded in the README.

## Shared state model

One piece of state drives all three views:

```ts
type GalleryView =
  | { kind: 'closed' }
  | { kind: 'tour' }
  | { kind: 'lightbox'; photoIndex: number };
```

Held in a `useGalleryView` hook at the page root.

**Revised in Phase 4.** The lightbox used to carry `from: 'listing' | 'tour'`.
It does not need to: every captured lightbox URL — C, E, F, G — was
`?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>`, and the tour alone was
`?modal=PHOTO_TOUR_SCROLLABLE`. The reference has no listing-direct lightbox.
Capture E confirms it from the other side: with the lightbox open on photo 43,
the tour beneath is still at scroll 0. So the lightbox is a **layer on the
tour**, not a sibling of it, and `from` would only ever hold one value.

Consequences:

- Closing unwinds one layer at a time: lightbox → tour → listing.
- The two layers keep **separate** trigger refs. A single ref is overwritten by
  the inner view, and the tour then loses its way back to "Show all photos" —
  a defect the Phase 4 harness caught in exactly that form.
- The photo index lives in one place, so the lightbox and the tour cannot
  disagree about which photo is current.

## View 1 — Listing page

| Aspect | Behaviour |
| --- | --- |
| Opens | Initial route. Server-rendered; no client JS needed for first paint. |
| Closes | n/a |
| Layout | Title row → hero mosaic → two-column body → full-width tail sections. |
| Mouse | Hover on hero tiles, buttons, links, review cards. Click a hero tile → lightbox at that photo. Click "Show all photos" → photo tour. |
| Keyboard | Tab order follows reading order. Hero tiles are `<button>`s, so `Enter`/`Space` open them. |
| Focus | Standard document flow; `:focus-visible` ring on every control. |
| Scroll | Page scrolls normally. Booking card sticks within the right rail. |
| Sticky | Booking card, and possibly the header (LAY-5, BOOK-2). |
| Animation | Hover transitions only, unless MOT-2 finds scroll-triggered motion. |

## View 2 — Photo tour — **built in Phase 4**

| Aspect | As built |
| --- | --- |
| Opens from | "Show all photos" (E2.2) **and** any hero tile (E2.3). A tile opens the tour *with the lightbox on top of it* — every captured lightbox URL carried `modal=PHOTO_TOUR_SCROLLABLE` as well as `modalItem`, so the reference nests them. A tile therefore lands on the lightbox with the tour beneath it. |
| Open mechanics | Full-screen opaque view above the page. Body scroll locks; every other body child goes `inert`. |
| Entrance | **None.** TOUR-1 needs computed styles and will not be measured, so nothing is invented. The tour mounts. |
| Layout | Pinned header (Back · title · Share/Save) **outside** the scroller → 976px content: category strip, then 56px, then nine category blocks of rail + 458px photo column. |
| Mouse | A category thumbnail scrolls to its block, clearing the pinned header. A photo opens the lightbox above; the tour stays mounted and keeps its scroll. Back returns to the listing. |
| Keyboard | `Escape` closes. Tab cycles within the tour only. Every thumbnail and photo is a `<button>`; nothing else is clickable. |
| Focus | Moves to Back on open, trapped for the view's lifetime, returns to "Show all photos" on close — via `tourTrigger`, which the lightbox can no longer overwrite. |
| Scroll | The tour scrolls internally with a permanently reserved gutter; the listing behind does not move and its position is restored on close (TOUR-8). |
| Current category | An `IntersectionObserver` marks the block in view with `aria-current`. No reference counterpart — the reference's strip has no current state — and no filtering, which TOUR-6 rules out. |
| Reduced motion | Smooth scrolling and the hover transition both collapse; the global media block covers them, so there is no JS branch. |
| Still open | TOUR-1 (entrance), the second half of TOUR-7 (whether the pinned header *changes* on scroll), TOUR-2b (label wrap), and every colour, radius and shadow. |

## View 3 — Lightbox — **built in Phase 5**

| Aspect | As built |
| --- | --- |
| Opens from | Any gallery photo (E3.2) — a hero tile on the listing, or a photo in the tour. Both routes end in the same state, because the tour is always underneath. |
| Open mechanics | Full-viewport layer above the tour, which stays mounted and scrolled. `useDialog({ active })` moves the keyboard to this layer and makes the tour `inert`. |
| Entrance | **None.** LIGHT-4 needs computed styles and will not be measured. The image is keyed by photo id, so stepping swaps the element outright. |
| Layout | Backdrop · image centred on both axes, width capped at the MEASURED 1100 with the height following the source aspect · arrows 40 × 40 at 20px insets, vertically centred · caption · two exits. |
| Mouse | Prev/next step one photo. Backdrop click does **not** close — LIGHT-8 is unresolved and guessing either way would invent behaviour. |
| Keyboard | `←` / `→` step (E3.4), bound to the lightbox element so the 43-photo tour underneath cannot scroll; `preventDefault` stops the arrows scrolling anything. `Escape` closes one layer. Tab cycles the lightbox's own controls only. |
| Focus | Moves to the "back to all photos" exit on open. On close, returns to the exact photo that opened it — or, when that photo is a hero tile still sitting inert behind the tour, to the tour's own Back control, because focusing an inert node strands the keyboard on `<body>`. |
| Announcements | The visible caption **is** the live region (`aria-live="polite"`): "Exterior · 28 of 43". A separate hidden announcer would make a screen reader read every step twice. |
| Scroll | Nothing scrolls. The body lock is reference-counted, so the inner layer closing does not release the outer layer's lock. |
| Ends | **Disables, does not wrap** (LIGHT-5). A real `disabled` attribute, so the control leaves the tab order, and the same two booleans drive the buttons and the arrow keys — they cannot disagree. |
| Close target | Always the tour, which is always underneath (LIGHT-9 measured two exits: "Show all photos" back to the tour, and Close). |
| Still open | LIGHT-1 (backdrop colour), LIGHT-4 (transition), LIGHT-8 (backdrop click), and the radii, focus ring and caption type scale. |

## Interaction invariants

These hold across all three views and are what the `release-qa` sweep checks:

1. **One owner of scroll.** Exactly one scrollable surface is live at a time.
2. **Focus is never lost.** After any open or close, `document.activeElement` is
   a specific, visible, interactive element — never `<body>`.
3. **The index never desyncs.** Holding `→` or double-clicking "next" advances
   the photo, the indicator and the announcement together, or none of them.
4. **Escape always means close.** From any overlay, at any focus position.
5. **Nothing behind an overlay is reachable** by Tab, by click, or by assistive
   technology.
