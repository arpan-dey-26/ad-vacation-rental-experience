# 16 — Performance note

What was measured, what could not be, and what is claimed. Nothing here is a
load-time number, because no load time has ever been observed.

## The limitation, first

**Performance of the image origin could not be fully validated because the
sandbox could not reach the reference asset origin.** Every photograph in this
project is fetched at runtime from the reference's own host
(`13-asset-strategy.md`), and that host is unreachable from the environment this
was built in. No image has ever painted. So:

- no LCP, no transfer size, no decode time, no waterfall
- no real-world layout-shift measurement
- no evidence about the origin's own latency or caching headers

None of those is estimated below. What follows is request *behaviour*, which is
observable without the bytes arriving.

## What was measured

Counted in headless Chromium against the real component tree, by intercepting
image requests through a full journey — listing, open the tour, open the
lightbox, step five photos.

| Step | Image requests | Notes |
| --- | --- | --- |
| Listing, at rest | **5** | The hero mosaic. Nothing else on the page requests an image. |
| Opening the photo tour | **+23** | Not 43. Lazy loading holds back the rest of the 43 until they approach the viewport. |
| Opening the lightbox | **+1** | The photo on display, and only it. |
| Stepping five photos | **+5** | Exactly one per photo. Nothing is prefetched. |

Loading attributes, read off the rendered DOM:

| Element | `loading` | `fetchpriority` | Intrinsic size |
| --- | --- | --- | --- |
| Hero tile 1 (the 560 × 494 major tile) | `eager` | `high` | yes |
| Hero tiles 2–5 | `lazy` | — | yes |
| All 43 tour photos | `lazy` | — | yes |
| Lightbox image | `eager` | `high` | yes |

Every image carries width and height, so every box is reserved before its bytes
arrive — which is why the geometry harness measures identical layout with all
images aborted.

## A measurement that was wrong first

The first run of this probe reported **43** requests on opening the tour, which
would have meant lazy loading was not working at all.

It was the harness lying. The `next/image` stub rendered a plain `<img>` and
dropped both `priority` and `loading`, so every image in the harness was eager
regardless of what the application asked for. The number described the stub, not
the app.

The stub now mirrors `next/image`'s rule — `loading="lazy"` unless `priority`,
which then also sets `fetchpriority="high"` — and the count fell to 23. Recorded
here because a performance number from a harness that does not model the loading
behaviour is worse than no number: it looks like evidence.

## Decisions behind those numbers

**No bulk preloading.** The tour holds 43 photos and requests roughly half on
open; the rest arrive as the user scrolls toward them. Prefetching the
lightbox's neighbours was considered and rejected — it doubles requests to guess
which way the user will step, and `19` of the phase brief permits it only if it
stays simple, which it does not.

**`priority` is spent once per view.** One hero tile on the listing (the LCP
candidate), one image in the lightbox (the entire content of the view). Nothing
else is eager. Spending it more widely is how a priority hint stops meaning
anything.

**No virtualization.** 43 nodes does not justify it, and TOUR-6 — measured —
requires all 43 to be in the DOM at all times, because the reference scrolls
through one continuous sequence rather than filtering.

**No image-management library, no animation library, no state library.** The
dependency list is `next`, `react`, `react-dom`.

## JavaScript

The listing page is server-rendered. The client boundaries are the gallery
provider, the hero mosaic, the section nav, the three self-managing controls,
and the two overlays — the overlays' code is behind the same boundary but their
markup does not exist until opened. `GalleryProvider` passes `children` straight
through, which is what keeps the rest of the page on the server.

Bundle size has **not** been measured: `next build` has never run (R-12), so
there is no build output to weigh. That is a blocked check, not a passed one.
