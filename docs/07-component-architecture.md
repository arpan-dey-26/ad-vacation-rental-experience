# 07 — Component architecture

## Principles

- **Pages compose, sections render.** `src/app/page.tsx` contains no markup
  beyond layout containers and a list of sections.
- **One concern per component.** A component that both measures the viewport and
  renders markup is two components.
- **No component exists without a caller.** Nothing is built "for later". If a
  component here turns out to have a single trivial caller, it gets inlined.
- **Server by default.** `'use client'` appears only where state, effects or
  event handlers are genuinely needed, and as deep in the tree as possible. The
  listing page's first paint should ship almost no interactive JavaScript.
- **Content comes from props.** No user-visible string is written in JSX.

## As built (Phase 2)

The plan below survived contact with implementation almost intact. Four
deviations, each with a reason:

| Planned | Built | Why |
| --- | --- | --- |
| `SiteFooter` | **not built** | LAY-6: the reference has no footer. Building one would be inventing a section |
| `GalleryTile`, `ShowAllPhotosButton` | folded into `HeroGallery` | Both were a single element with no independent state. Splitting them would have been abstraction for its own sake |
| `RatingSummary` | folded into `Reviews` | Same |
| — | `PageShell`, `Section`, `GalleryProvider`, `useScrollThreshold` | The measured container geometry needed one home; sections needed one heading/landmark contract; the overlay state needed a boundary that keeps the page server-rendered |

`SimilarStays` owns its own `<section>` rather than using the shared `Section`
wrapper, because its heading shares a row with the pager and arrows.

## As built (Phase 4)

| Planned | Built | Why |
| --- | --- | --- |
| `PhotoTour` wraps the shared `Dialog` | `PhotoTour` renders its own shell and calls `useDialog` | The header centres on the viewport while the content centres on the scroller — the header has to be outside the scrolling region. See "Where the seams are" |
| — | `ShareSaveActions` gained an `icon` variant | The tour's Share/Save are 40 × 40 icon-only controls (TOUR-5) where the listing's are labelled. One Save-state implementation rather than two |
| `useGalleryView` holds one trigger | two: `tourTrigger`, `lightboxTrigger` | The views nest; one ref loses the outer opener |
| `GalleryView.lightbox` carries `from` | removed | Every captured lightbox URL nests inside the tour's, so `from` had one possible value |

## As built (Phase 5)

| Planned | Built | Why |
| --- | --- | --- |
| `LightboxAnnouncer` | folded into the caption | The caption already shows "Exterior · 28 of 43" and changes on every step. Making it the `aria-live` region is one element instead of two, and avoids a screen reader reading the same text twice |
| `useDialog` is all-or-nothing | gained `active` | The overlays nest, and exactly one may own the keyboard. Inactive means: keep the scroll lock and the restore promise, stop trapping, stop answering Escape, stop inerting siblings — and let the layer above inert *you* |
| `useScrollLock` takes a boolean | reference-counted | Two holders want the lock at once. The inner one's cleanup was releasing the body while the outer one was still open |
| `goToPhoto(index)` | `stepPhoto(delta)` | An absolute index computed at render time makes two clicks in one tick cancel each other. A relative step applied with the functional form composes, and the clamp lives with the data |

The `Tree` above is the Phase 0 plan and is left as written; the three tables
are the record of where implementation diverged from it and why.

## Tree

```text
app/page.tsx                    (server) — composition only
│
├── components/layout/
│   ├── SiteHeader              (server) — brand, search affordance, menu
│   └── SiteFooter              (server)
│
├── components/listing/
│   ├── ListingHeader           (server) — h1 + Share/Save cluster
│   │   └── ShareSaveActions    (client) — Save toggles state
│   ├── HeroGallery             (client) — mosaic; opens tour/lightbox
│   │   ├── GalleryTile         (client) — one button-wrapped image
│   │   └── ShowAllPhotosButton (client)
│   ├── ListingOverview         (server) — type line + capacity list
│   ├── Highlights              (server)
│   ├── ListingDescription      (client) — clamp + "Show more"
│   ├── Amenities               (server) — featured grid
│   │   └── AmenityItem         (server)
│   ├── Reviews                 (server)
│   │   ├── RatingSummary       (server) — overall + breakdown bars
│   │   └── ReviewCard          (client) — per-card "Show more"
│   ├── LocationSection         (server) — static map + copy
│   ├── HostSection             (server)
│   ├── PolicySection           (server) — rules / safety / cancellation
│   └── SimilarStays            (client) — horizontal carousel
│
├── components/booking/
│   ├── BookingRail             (client) — sticky container
│   ├── PromoStrip              (server)
│   └── BookingCard             (client) — price, dates, guests, CTA
│
├── components/gallery/
│   ├── PhotoTour               (client) — dialog
│   │   ├── PhotoTourNav        (client) — category thumbnail strip
│   │   └── PhotoCategoryBlock  (client) — heading, chips, photo grid
│   └── Lightbox                (client) — dialog
│       ├── LightboxControls    (client) — prev / next / close
│       └── LightboxAnnouncer   (client) — aria-live position region
│
└── components/ui/
    ├── Icon                    (server) — closed IconName → inline SVG
    ├── Button                  (server/client) — variant + size
    ├── Dialog                  (client) — shared shell: portal, trap, inert, scroll lock
    └── Rating                  (server) — star + value + count
```

## Where the seams are

**`useDialog` is one hook, used everywhere; `Dialog` is one shell, used where it
fits.** The plan above assumed the tour would reuse the `Dialog` *component*.
Phase 4 changed that, and the measurements are the reason:

- the tour's header centres on the **full viewport** while its content centres
  on the **scroller's** content box — two different centres, which is only
  possible if the header sits outside the scrolling region. `Dialog` puts its
  title inside the scrolling body.
- TOUR-7: the header is pinned across every captured scroll offset.
- TOUR-5: the close affordance is a Back **arrow**, not an X.

So `PhotoTour` renders its own shell and calls `useDialog` directly. What
mattered about the shared shell — focus in, trap, `Escape`, restoration,
`inert`, scroll lock — lives in the hook, not the component, and all three
surfaces still share exactly one implementation of it. That is the contract
`05-accessibility-plan.md` asks for; identical markup was never the point.

**Two triggers, not one.** `useGalleryView` keeps `tourTrigger` and
`lightboxTrigger` separately. The overlays nest — the lightbox opens from inside
the tour — so a single ref is overwritten by the inner view and the tour loses
its way back to "Show all photos". The Phase 4 harness caught exactly that.

**The tour stays mounted under the lightbox.** `GalleryProvider` renders
`PhotoTour` for every open state, because the lightbox is a layer on the tour
rather than a sibling of it — every captured lightbox URL carried
`modal=PHOTO_TOUR_SCROLLABLE` as well as `modalItem`, and TOUR-8 measured the
tour holding its own scroll position underneath. Phase 5 adds a sibling
component and changes nothing else.

**`Icon` is a closed registry.** `IconName` in `src/lib/types.ts` is a union, so
a typo is a compile error rather than a blank square. Every icon is
hand-authored inline SVG — this is also the originality answer for requirement
B5: we draw our own, we do not lift the reference's sprite.

**`HeroGallery` is the only client component above the fold.** Tiles need click
handlers, so the mosaic is a client component; everything around it stays on the
server.

**`BookingRail` vs. `BookingCard`.** The rail owns stickiness (a CSS
`position: sticky` wrapper); the card owns its own content and controls. Split
because BOOK-2 may reveal that the promo strip scrolls away independently of the
card, which is a rail concern, not a card one.

## Hooks

```text
src/hooks/
├── useGalleryView.ts    — the GalleryView state machine from 03-view-interaction-map.md
├── useDialog.ts         — focus in, trap, Escape, restore, inert; `active` picks the top layer
├── useScrollLock.ts     — reference-counted body lock + scroll restoration
├── useKeyboardNav.ts    — ArrowLeft/ArrowRight for the lightbox, bound to its element
├── useScrollThreshold.ts — the section-nav reveal
└── useDialog is used by  Dialog (amenities), PhotoTour, Lightbox — one contract, three surfaces
```

`useScrollLock` is separate from `useDialog` because the lock has its own
failure mode (scroll restoration, and now nesting) worth testing on its own.
`useKeyboardNav` binds to the lightbox element rather than to `window`: the tour
underneath is a scroll container, and an arrow key that reached it would scroll
43 photos behind a covering overlay.

## Directory layout

```text
src/
├── app/            — routes, layout, globals.css
├── components/     — layout/ listing/ booking/ gallery/ ui/
├── data/           — listing.ts (content)
├── hooks/          — the four above
├── lib/            — types.ts, cn.ts, format.ts
└── styles/         — component-scoped CSS modules, only where Tailwind is the wrong tool
```

`src/styles/` exists for the two or three places where a keyframe animation or a
complex grid template is clearer as CSS than as a utility string — the hero
mosaic template and the overlay entrance keyframes are the expected residents. It
does not become a parallel styling system.

## Deliberate omissions

Things a larger project would have that this one should not, per the brief's
"clean and complete beats over-engineered":

- No state management library. One `useGalleryView` hook is the entire
  application state.
- No animation library. CSS transitions and one keyframe set.
- No component library or headless UI dependency. The one dialog we need is
  ~120 lines and we need it to behave exactly a certain way.
- No test framework. The quality gate is the reviewer agents plus the manual
  sweeps in `release-qa`; unit tests on presentational components would not
  catch fidelity or focus bugs, which is where all the risk is.
- No API layer, no backend. G3 makes the backend optional; G4 endorses
  frontend-held data.
