# Reference measurement

## Why this exists

Phase 1 needs measured values from the live reference. Two automated paths are
unavailable (see `../11-risks.md` R-1):

- The in-app browser loads the page and is then replaced with *"This page could
  not be verified. Please open it in a standard web browser."*
- `robots.txt` disallows all paths, so the sanctioned fetch path declines it.

Neither was worked around. The remaining path is the one the page itself asks
for: **a standard web browser, driven by you.**

## What to run

`reference-probe.js` reads rendered geometry and computed styles — what the
browser painted. It does not read or export the page's source, CSS rules,
scripts or framework internals, which keeps it inside requirement K.

## How

1. Open `https://airbnb-clone-umber-two.vercel.app` in Chrome.
2. Size the window so the **viewport** is 1440px wide. The probe prints the
   width it actually saw; if it is not 1440, adjust and re-run.
3. `F12` → **Console**. If Chrome blocks the paste, type `allow pasting`, Enter.
4. Paste the whole of `reference-probe.js`, Enter.
5. It copies JSON to the clipboard and downloads a `.json` file.

Run it three times and keep all three files:

| Run | State of the page | Save as |
| --- | --- | --- |
| A | Listing page, freshly loaded, scrolled to top | `probe-listing.json` |
| B | After clicking **Show all photos** (tour open) | `probe-tour.json` |
| C | After opening a photo from the tour (lightbox open) | `probe-lightbox.json` |

Send me the three files.

## Extra captures worth having

These take a minute each and cover what a static probe cannot see:

- **Hover.** Hover a hero tile, then in the console run
  `getComputedStyle(document.querySelector('img')).filter` — or just screenshot
  the tile hovered vs. not.
- **Scroll.** Scroll until the booking card sticks; note the `scrollY` where it
  engages and where it releases.
- **Keyboard.** In the tour and the lightbox: does `Escape` close it? Does Tab
  stay inside? Where does focus land on open, and where does it return on close?
  Do `←` / `→` step photos?
- **Reduced motion.** DevTools → Rendering panel → *Emulate CSS
  prefers-reduced-motion: reduce* → reopen the tour. Does anything still animate?
- **Screenshots.** Full-page listing at 1440, plus the tour and the lightbox.

## Then

I read the JSON, clear the matching items in `../VERIFICATION-QUEUE.md`, replace
the `[PROVISIONAL]` tokens in `src/app/globals.css` with measured values, record
the method against each, and fill `src/data/listing.ts` from the captured
content.
