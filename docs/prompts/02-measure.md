# Prompt 02 — Phase 1: Measure and Capture (full text)

Date: 2026-09-18 · Tool: Claude (Cowork), model `claude-opus-5`
Attachments: three probe captures produced by `docs/measure/reference-probe.js`.

---

Proceed with Phase 1 only after the reference is accessible in a standard
browser.

Open:
https://airbnb-clone-umber-two.vercel.app

I need you to inspect the rendered page visually, not its source code.

Do NOT scrape or copy the implementation.

Use the browser only to measure and observe:

- viewport layout
- container width
- header dimensions
- image grid dimensions
- typography
- spacing
- colours
- borders
- radii
- shadows
- sticky elements
- hover states
- gallery behaviour
- Photo Tour
- Lightbox
- transitions
- keyboard behaviour

For every provisional token currently marked in
docs/VERIFICATION-QUEUE.md:

1. Verify it against the rendered reference where possible.
2. Record the observed/derived value and measurement method.
3. Update the implementation token only when sufficiently verified.
4. Do not invent values when they cannot be observed reliably.
5. Keep a record of the verification in the documentation.

Also capture the actual visible listing content and gallery structure
required to reproduce the reference.

Do NOT implement the full UI yet.

At the end, report:

- verification queue items completed
- items still blocked
- actual measurements discovered
- image/asset requirements
- interaction findings
- motion findings
- accessibility findings
- files changed

Then STOP.

---

## Follow-up instruction accompanying the captures

The three reference probe captures have now been completed.

Important:
The probe script uses "probe-listing-" as the filename prefix even when
the URL is in Photo Tour or Lightbox state. Do NOT identify the state
from the filename alone.

The captures were taken in this exact order:

1. Listing Page — normal listing page
2. Photo Tour — URL/state with PHOTO_TOUR_SCROLLABLE
3. Lightbox — Photo Tour with a single image open, showing the image
   counter and previous/next navigation

Please inspect the three most recent probe JSON files in Downloads,
in chronological order, and use their actual captured URL, modal state,
controls, dialogs, images, geometry and other data to distinguish the
three states.

Now proceed with Phase 1.

Goals:

- Clear the verification queue wherever reliable observed measurements
  are available.
- Update [PROVISIONAL] tokens only when supported by the probe data.
- Record actual measurements and their source/state.
- Analyse the complete image/gallery structure.
- Analyse the Photo Tour and Lightbox structure and controls.
- Document anything the probe cannot determine.

Do NOT invent measurements.
Do NOT copy or lift source code from the reference.
Do NOT implement the complete UI yet.

At the end, provide:

1. Verification queue status
2. Measurements discovered
3. Gallery/image findings
4. Photo Tour findings
5. Lightbox findings
6. Accessibility findings
7. Motion findings
8. Remaining manual checks
9. Files changed

---

## Note on the stated capture order

The instruction above says capture 1 was the listing page. The captured data
disagrees, and the data was followed:

- Captures A and B are **byte-identical** — same URL, same 6,089-character text,
  same 116 controls, same `document.activeElement`. They are the same state
  recorded twice.
- All three URLs carry `?modal=PHOTO_TOUR_SCROLLABLE`.
- A and B have the lightbox's Previous/Next buttons `disabled`; C has them
  enabled, adds a 1100 × 617.2 centred image, and its text ends `28 of 43`.

So the set is: tour, tour, lightbox. No clean listing-page capture exists. This
is recorded in `docs/12-measurements.md` and drives one of the two Phase 1
limits.
