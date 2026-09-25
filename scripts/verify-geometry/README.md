# Geometry and accessibility harness

## Why it exists

`tsc`, `eslint` and `next build` cannot run in the environment this project was
authored in — the npm registry is blocked by egress policy, so `node_modules`
has never been installed (risk R-12). Without them, "the layout is right" would
be a claim rather than a measurement, which is exactly the failure mode the rest
of this project is built to avoid.

This harness closes that gap for the part that matters most: **the measured
geometry**.

## What it does

`build-html.mjs` bundles the **real** `src/app/page.tsx` — the same component
tree the app renders — with esbuild, stubbing only `next/image` with the plain
`<img>` that `next/image` ultimately produces, and renders it to static HTML.

`build-css.mjs` flattens the **real** stylesheets into one file, rewriting only
Tailwind-specific syntax (`@import 'tailwindcss'`, `@theme`, `@utility`). Every
declaration measured is the app's own. The page uses no Tailwind utility classes
— every class is one of ours — so nothing is lost in the translation.

`measure.mjs` then loads that page in headless Chromium at **1280, 1440 and
1600** and asserts 22 geometry facts per viewport against
`docs/12-measurements.md`. `audit-a11y.mjs` checks heading order, landmark
naming, image alt, accessible names, anchor targets and the parked nav's
inertness.

`build-app.mjs` bundles the same tree for the **browser** and hydrates it, so
behaviour that only exists after a click — dialog focus, the photo tour,
keyboard navigation — can be asserted rather than assumed.
`audit-interactions.mjs` and `audit-tour.mjs` drive it.

## Running it

```bash
npm run verify:geometry      # 66 assertions across 3 viewports
npm run verify:a11y          # structural accessibility checks
npm run verify:interactions  # 22 dialog / focus / calendar assertions
npm run verify:tour          # 113 photo-tour assertions across 5 widths
npm run verify:lightbox      # 100 lightbox assertions, 5 widths x 5 photo positions
npm run verify:tokens        # token provenance and discipline
npm run verify:harness       # all six
```

All exit non-zero on failure, so they gate a phase the way a test would.

## What it caught in Phase 2

Four real bugs, none of which would have been obvious by eye:

1. **No `box-sizing: border-box`.** The shell capped at 1280 *plus* its 160px of
   padding, and the header measured 90px instead of 89 because its 1px hairline
   sat outside the height.
2. **Grid blowout.** `.listing-body`'s children defaulted to `min-width: auto`,
   letting a wide scroller push its track past the grid.
3. **Column-flow grid scrollers** reported a max-content intrinsic width that
   escaped their own overflow clip.
4. **Scroll-extent leak.** The similar-stays track leaked ~730px of horizontal
   scroll into the window even with `overflow-x: auto` clipping correctly;
   `contain: paint` fixed it, verified both ways.

It also corrected a wrong assumption in the harness itself: `scrollbar-gutter:
stable` reserves its gutter inside `<html>`, so the width available to the page
is `document.body.clientWidth`, not `documentElement.clientWidth`.

## What it caught in Phase 4

One real defect, and one of my own test's making — both worth recording because
the difference between them is the whole point of a harness.

**Real.** A single `triggerRef` was shared between the tour and the lightbox.
Opening the tour stored "Show all photos"; selecting a photo overwrote it with
that photo's button. Closing the tour then tried to restore focus to a node that
had just unmounted, and focus fell to `<main>`. Split into `tourTrigger` and
`lightboxTrigger`. This is precisely the class of bug that is invisible with a
mouse and infuriating with a keyboard.

**Not real.** The scroll-retention check clicked an off-screen photo, so the
browser scrolled it into view and the test blamed the application for moving the
tour. Fixed in the test — it now clicks a photo that is actually visible, which
is what a user does.

It also surfaced a divergence rather than a bug: the reference's thumbnail label
wraps "Additional photos" to two lines inside 111.5px and ours does not, because
the label's font-size has never been measured and Inter is a substitute. The
assertion was written to check the measured *rule* (`105.2 + 8 + 18n`) instead
of the reference's line count, and the gap is recorded as TOUR-2b.

## What it caught in Phase 5

Three real defects, all in the seam between two overlays that are open at once —
the part of the app that is hardest to check by hand, because reproducing it
means getting two layers into the right state and then pressing the right key.

1. **The scroll lock was a boolean.** Two holders wanted it; the inner one's
   cleanup released the body while the outer one was still open, and restored a
   scroll position captured after the page had already been locked. Now
   reference-counted.
2. **Focus restoration aimed at the opener unconditionally.** Open the lightbox
   from a *hero tile* and that tile sits `inert` behind the tour — so closing the
   lightbox focused nothing, and the keyboard was stranded on `<body>`, outside
   every dialog and unable to reach Escape. `useDialog` now checks the opener is
   reachable and otherwise lands on the topmost remaining layer.
3. **Two clicks in one tick cancelled each other.** `goToPhoto(index)` computed
   an absolute index from the rendered `photoIndex`, so a burst of Next clicks
   all read the same value. Replaced with a relative `stepPhoto(delta)` applied
   with the functional form — and the burst became a real rapid-repeat
   assertion rather than a bug the test had to tiptoe around.

Note the shape of all three: each is invisible with a mouse and a single
overlay, and each breaks the keyboard. That is the case for driving the real
component tree rather than reading the code.

## What it does not do

It does not check colour, typography, motion or keyboard behaviour. Those need
the reference measurements that are still open (see `docs/VERIFICATION-QUEUE.md`)
and a real browser session. `.claude/skills/accessibility-audit` covers the
keyboard sweep; `.claude/skills/visual-fidelity-audit` covers the comparison.

Generated files (`harness.html`, `harness.css`) are build output and are
git-ignored.
