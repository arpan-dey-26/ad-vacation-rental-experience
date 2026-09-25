# 01 — Assignment requirement checklist

Every requirement extracted from the three assignment pages. Nothing merged,
nothing dropped. `[ ]` = not started, `[~]` = in progress, `[x]` = done.

## A. Core objective

- [ ] A1. Build a **pixel-perfect** clone of the reference Airbnb listing page.
- [ ] A2. Reproduce a polished, production-quality UI **exactly as it looks**.
- [ ] A3. Reproduce it **exactly as it behaves**.
- [ ] A4. Treat the reference as the **single source of truth**.
- [ ] A5. Reference URL: `https://airbnb-clone-umber-two.vercel.app`.

## B. Visual design

- [ ] B1. Identical layout.
- [ ] B2. Identical spacing.
- [ ] B3. Identical typography.
- [ ] B4. Identical colours.
- [ ] B5. Identical icons.
- [ ] B6. Identical assets.

## C. Animations and motion

- [ ] C1. Matching hover animations.
- [ ] C2. Matching scroll animations.
- [ ] C3. Matching transitions.

## D. Interaction and accessibility

- [ ] D1. Keyboard navigation.
- [ ] D2. Focus management.
- [ ] D3. Accessibility.

## E. The three required views

### E1. Listing page

- [ ] E1.1. The full property page.
- [ ] E1.2. Match layout exactly.
- [ ] E1.3. Match spacing exactly.
- [ ] E1.4. Match typography exactly.
- [ ] E1.5. Match colours exactly.
- [ ] E1.6. Match interactions exactly.

### E2. Photo tour

- [x] E2.1. Full-screen photo gallery. **Phase 4.**
- [x] E2.2. Opens from the **Show all photos** control.
- [x] E2.3. Opens from **any hero image** — which opens the tour with the
      lightbox layered on it, the way the captured URLs nest them.
- [x] E2.4. Category thumbnails with labels. **Confirmed:** all nine, in the
      measured order, each showing its group's first photo.
- [x] E2.5. Per-category heading with feature chips — rendered as a real
      `h3` plus a list with CSS-generated separators.
- [x] E2.6. Scrolling photo body grouped by category, at the measured
      12px / 20px rhythm.
- [ ] E2.7. *(implicit)* Match the tour's colour, radius, shadow and motion —
      **blocked**: no computed style has ever been captured. See
      `14-visual-fidelity-note.md`.

### E3. Lightbox

- [x] E3.1. Single-photo viewer. **Phase 5.**
- [x] E3.2. Opens from **any gallery photo** — a hero tile or a tour photo.
- [x] E3.3. Previous / next arrow controls, 40 × 40 at the measured 20px insets.
- [x] E3.4. Keyboard `←` / `→` navigation, bound to the lightbox so the tour
      underneath cannot scroll.
- [x] E3.5. Match the interactions exactly — for every interaction that was
      observable. **LIGHT-8 (backdrop click) was not**, and is deliberately not
      guessed; recorded as a divergence.
- [ ] E3.6. Match the animations exactly — **blocked**: LIGHT-4 needs computed
      styles, which have never been captured. The lightbox ships with no
      transition rather than an invented one.

## F. Platform constraint

- [ ] F1. **Desktop only.** A mobile version is explicitly not required.

## G. Tech stack

- [ ] G1. Free choice of stack; suggested frontend React / Next.js / Angular.
- [ ] G2. Suggested backend Node.js or Java.
- [ ] G3. Backend is **optional**.
- [ ] G4. Frontend / browser storage for data is acceptable and encouraged if it
      keeps the implementation simple and focused.
- [ ] G5. Vercel or any free host may be used for deployment.

## H. Architecture diagram

- [x] H1. `docs/architecture.png`, alongside the app in the archive.
- [x] H2. Titled "Reference Production Architecture — Vacation Rental
      Marketplace", with a scope banner stating that exactly one node on it is
      implemented here. See `15-production-architecture.md`.
- [x] H3. **Frontend** — clients band; CDN and edge caching; stateless web tier.
- [x] H4. **Backend** — fourteen stateless services, horizontally scaled behind
      the gateway; async workers off an event bus.
- [x] H5. **Storage** — primary relational store, read replicas, cache, object
      storage, analytics store, availability store, backups/PITR.
- [x] H6. **Search** — a denormalised index rebuilt from events, with the
      indexing pipeline shown and the consistency trade stated.
- [x] H7. **Deployment** — edge → gateway → stateless tier is the deployment
      shape; observability and security rails cover rollout safety. Ingress,
      scaling and DR are covered in `15-production-architecture.md`.
- [~] H8. Neither Lucid nor Excalidraw was reachable from the build environment.
      The diagram is authored as HTML/CSS (`docs/architecture/architecture.html`)
      and rendered by the Chromium already in the toolchain — editable source
      kept, no new dependency added. Recommended tools, not required ones.
- [x] H9. Delivered as **both** `docs/architecture.png` and
      `docs/architecture.pdf` inside the zip.

## I. What the evaluators will look at

- [ ] I1. Modern AI workflow usage — coding agents, sub-agents, skills, prompts.
- [ ] I2. How closely the clone matches the reference — visual fidelity and
      behavioural parity, including animations, transitions and accessibility.
- [ ] I3. Production architecture thinking.
- [ ] I4. AI sub-agent configs for code quality and project structure.
- [ ] I5. Scope kept **focused**; a clean complete implementation beats an
      over-engineered incomplete one.
- [ ] I6. Sub-agent / skill config files **included in the submission**.

## J. AI workflow

- [ ] J1. AI-assisted development is expected; the brief says not to attempt the
      task without it.
- [ ] J2. Use current premium models, obtained legitimately (e.g. GitHub Student
      Developer Pack).
- [ ] J3. Target effort with the right approach is ~3–4 hours.
- [ ] J4. Sub-agent and skill configs must be real and usable, not decorative.

## K. Originality (hard requirement)

- [ ] K1. AI agents and workflows may assist the cloning implementation.
- [ ] K2. **No direct lift-and-shift of the codebase from the reference URL** —
      doing so may lower the score or cause disqualification.
- [ ] K3. A plagiarism detection mechanism is in place.
- [ ] K4. The work must be original and contain no plagiarised content.
- [ ] K5. Derived from K1–K4 and the operating brief: do not copy the
      reference's source, JS, React components, CSS, DOM structure wholesale, or
      hidden implementation details; do not start from an existing Airbnb clone
      repository. The reference is a *visual and behavioural specification only*.

## L. Submission

- [x] L1. No remote is configured on this repository and nothing was pushed.
- [ ] L2. Submit per the instructions sent by email — **Arpan's step**, outside
      this repository.
- [x] L3. `StayVista-airbnb-clone-submission.zip`, containing the source and
      both diagram exports.
- [x] L4. `PROMPTS.md` — eight prompts in order, each with its full text in
      `docs/prompts/`.

## M. Quality gate (from the operating brief)

- [ ] M1. TypeScript check — **BLOCKED.** `tsc` runs but every one of its 527
      errors is a missing dependency; the npm registry is denied (R-12). This is
      not a passed check and is not recorded as one.
- [ ] M2. Lint — **BLOCKED**, same cause. `eslint` is not installed.
- [ ] M3. Production build — **BLOCKED**, same cause. `next build` has never run.
- [x] M4. Interaction testing — 22 interaction + 113 tour + 100 lightbox + 110
      end-to-end assertions against the real component tree in headless Chromium.
- [x] M5. Keyboard testing — focus entry, trapping, Escape, restoration, arrow
      stepping and roving-tabindex calendar navigation, all by real key presses.
- [x] M6. Accessibility review — structural audit (0 problems) plus the
      per-surface checks; divergences from the reference in
      `14-visual-fidelity-note.md` § 5.
- [ ] M7. Visual fidelity review — **BLOCKED** against the live reference, which
      refuses automated access. Geometry is verified against the captures; no
      pixel-parity claim is made.
- [ ] M8. Animation review — **BLOCKED.** `MOT-1` needs computed styles, which
      were never obtainable. No motion was invented; reduced-motion behaviour is
      verified.
- [x] M9. Console error review — zero console errors across a full three-cycle
      session, asserted.
- [x] M10. Unused code and dependency review — no dead component, hook or
      import; dependencies are `next`, `react`, `react-dom` and nothing else.
