# Prompt 03 — Phase 1b: Remaining verification, R-3 and R-4 decisions (full text)

Date: 2026-09-18 · Tool: Claude (Cowork), model `claude-opus-5`

---

Proceed with the remaining Phase 1 verification work.

First resolve the remaining measurement gaps before starting full UI implementation.

Use probe-2 on these four states:

1. Listing Page
2. Photo Tour
3. Lightbox
4. "What this place offers" dialog

Then perform the remaining manual/DevTools verification:

- Force :hover on a hero tile
- Force :hover on "Show all photos"
- Observe the booking card sticky/release behaviour while scrolling
- Test Escape, Tab, ArrowLeft and ArrowRight in Photo Tour
- Test Escape, Tab, ArrowLeft and ArrowRight in Lightbox
- Test reduced-motion behaviour
- Run the relevant verification at 1280px viewport width

Do not invent measurements.

R-3 decision:
Do NOT bundle or redistribute Airbnb's proprietary Cereal font.
Keep the reference font documented, but use the closest legally available
fallback and tune typography metrics to minimize visual differences.

R-4 decision:
Investigate the provenance/usage status of the 43 reference images before
packaging them.
If the assignment/reference assets can legitimately be re-hosted, download
and serve them locally from public/ for deterministic deployment.
If their redistribution is not clearly permitted, do not package them;
document the constraint and use an appropriate legally usable alternative.
Do not copy source code from the reference.

After completing the remaining verification:

1. Update VERIFICATION-QUEUE.md
2. Update docs/12-measurements.md
3. Update PROMPTS.md
4. Update any affected data/tokens
5. Report exactly how many verification items remain
6. List every remaining blocker
7. Report the final verified measurements
8. Report the final image strategy

Do NOT begin the full UI implementation yet.

STOP after the Phase 1 verification report.

---

## What was and was not possible

**Not possible.** The four probe-2 runs and all seven manual DevTools checks
need a browser on Arpan's machine. The reference still refuses Claude's in-app
browser ("This page could not be verified…"), `robots.txt` still disallows
automated fetching, and the Chrome extension was not connected. Neither gate was
worked around, and no measurement was invented in their place.

**Possible, and done.** Checking Downloads for probe-2 output instead surfaced
five probe-1 captures from an earlier session that had never been analysed.
Between them they supplied a clean listing page, a second viewport width and two
scroll positions — which cleared twelve further items, four of which had been
recorded as needing new runs.

Both decisions were implemented in full. R-3: Cereal removed from the font stack
entirely, `--font-size-adjust` added as the single calibration point, and
`docs/measure/font-calibration.js` written to produce it. R-4: provenance
investigated, redistribution found not to be clearly permitted, nothing
packaged — reasoning in `docs/13-asset-strategy.md`.
