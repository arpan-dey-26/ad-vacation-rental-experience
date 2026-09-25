---
name: release-qa
description: Run the full StayVista quality gate before a build phase closes or the submission is packaged — typecheck, lint, build, interaction, keyboard, console, fidelity and dead-code checks. Use when preparing a submission, finishing a phase, or asked whether the project is done.
---

# Release QA

"It compiles" is not done. This gate is.

Every item produces evidence. A gate item with no evidence is a fail.

## 1. Toolchain

```bash
npm run typecheck      # zero errors
npm run lint           # zero errors, zero warnings
npm run build          # succeeds; record the route table and first-load JS
```

Record the production bundle size. An unexplained jump since the last run is a
finding.

## 2. Runtime cleanliness

Start `npm run start` (production build, not dev — dev hides hydration issues).
Then, on each of the three views:

- Console must be empty. No errors, no warnings, no React key or hydration
  messages.
- Network must have no 404s and no images loading at the wrong size.
- No layout shift after load: watch CLS while the hero mosaic resolves.

## 3. Interaction sweep

Walk every interaction by hand and record pass/fail:

- Hero tile hover; "Show all photos" opens the tour.
- Every hero tile opens the correct view at the correct photo.
- Photo tour: category navigation, scrolling, close.
- Lightbox: opens from a tour photo at the right index; prev/next; wrap-around
  behaviour at both ends; close.
- Overlay close restores the exact scroll position.
- Sticky booking card engages and releases at the right offsets.
- Rapid repeat: double-click triggers, hold ArrowRight — no desync, no queued
  animations.

## 4. Keyboard sweep

- Tab through the whole listing page; focus order matches reading order and
  every stop is visible.
- Open each overlay with `Enter`, trap-test with Tab and Shift+Tab, close with
  `Escape`, confirm focus returns to the trigger.
- Lightbox `ArrowLeft` / `ArrowRight` navigate and announce.

## 5. Reviews

Run each and attach its verdict:

- `visual-fidelity-reviewer` on all three views
- `accessibility-reviewer` on the listing page and both overlays
- `interaction-motion-reviewer` on all three views
- `code-quality-reviewer` on `src/`

Any `FAIL` blocks the gate. `PASS WITH FINDINGS` is allowed only with each
finding either fixed or written down with a reason.

## 6. Dead weight

```bash
rg -n "console\.log|TODO|FIXME|XXX" src
rg -n "^import .* from '(.*)'" src -o --replace '$1' | sort -u   # cross-check package.json
```

Every dependency in `package.json` must be imported somewhere. Remove what is
not. Delete unused exports and files.

## 7. Submission package

- No public GitHub remote. Confirm: `git remote -v` is empty or private only.
- `PROMPTS.md` is current and chronological.
- `README.md` states the stack, how to run, decisions and known gaps honestly.
- The architecture diagram is exported to `docs/architecture/` as PNG or PDF.
- `node_modules`, `.next` and `.env*` are excluded from the zip.
- The zip extracts to a folder that installs and builds from clean.

## Output

A gate report: each numbered item with `PASS` / `FAIL` and its evidence, then a
single overall verdict. If the verdict is `FAIL`, list what remains in priority
order — do not soften it.
