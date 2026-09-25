# Prompt 08 — Phase 6: Final QA, Architecture, Release Validation and Packaging (full text)

Date: 2026-09-19 · Tool: Claude (Cowork), model `claude-opus-5`

---

PHASE 6 — FINAL QA, ARCHITECTURE, RELEASE VALIDATION & SUBMISSION PACKAGING

Project: StayVista — Airbnb Listing Experience Clone. Phases 0–5 complete. This
is the final engineering and submission phase.

Do not add new product features. Do not redesign the UI. Do not introduce new
dependencies unless absolutely required for the architecture diagram or release
tooling. Do not make unsupported visual claims. Do not publish to a public
GitHub repository.

Goals: validate all three views together; perform release-level interaction QA;
create the required production-scale architecture diagram; perform the final
performance and documentation review; prepare a clean submission ZIP.

**§1 — Current implementation.** Listing → Photo Tour → Lightbox, with the
lightbox layered above the tour and exactly one overlay owning keyboard
interaction. Existing validation: 66 geometry, 22 interaction, structural
accessibility, 113 photo-tour, 100 lightbox assertions.

**§2 — Final release QA, first priority.** Create a release-level end-to-end
harness (`scripts/verify-release.mjs` or an equivalent consistent with the
project) exercising the real application flow rather than isolated component
assumptions:

- **A. Listing → tour.** Start at a known scroll position; open via "Show all
  photos"; verify the tour opens, focus enters, the listing is inert, the body
  scroll lock is active and the tour is scrollable.
- **B. Tour navigation.** Scroll to a non-zero category, record `scrollTop`,
  click a category; verify all 43 photos remain, that it scrolls rather than
  filters, that the pinned header is stable and the scroll position valid.
- **C. Tour → lightbox.** Open a photo from a non-zero scroll position; verify
  the lightbox appears above the tour, the tour stays mounted and becomes inert,
  only the lightbox owns focus, the body stays locked, the photo index is
  correct and the tour's `scrollTop` is unchanged.
- **D. Lightbox navigation.** ArrowLeft, ArrowRight, Previous, Next, at the
  first, a middle and the last photo; verify no wrap, correct disabling, correct
  counter and category caption, and that arrow keys never scroll the tour.
- **E. Lightbox close.** Via the Close control and via Escape; verify the
  lightbox disappears, the tour remains, focus returns to the exact trigger,
  `scrollTop` is unchanged and the tour owns focus again.
- **F. Tour close.** Verify the listing returns with its original scroll
  position, focus returns to the original listing trigger, the scroll-lock count
  returns to zero and no inert attributes remain.
- **G. Repeat** the complete cycle at least three times, and also test hero tile
  → tour, hero tile → lightbox through the measured nested path, thumbnail →
  lightbox, and rapid next/previous clicks. The purpose is specifically to catch
  state leakage that isolated harnesses cannot detect.

**§3 — Scroll lock / inert audit.** Release-critical because Phase 5 introduced
reference-counted scroll locking. After every sequence verify body/document
scroll state, a zero lock count, no stale `inert` or `aria-hidden`, no orphaned
focus trap and no unexpectedly mounted overlay. If the counter is intentionally
private, expose only a test-safe observable rather than production debugging
state, and leave no debug instrumentation in production.

**§4 — Geometry regression.** Run every harness: `verify:geometry` (66),
`verify:tour` (113), `verify:lightbox` (100), `verify:interactions` (22),
`verify:a11y` (0 problems), `verify:tokens` (PASS). Fix any regression before
proceeding; **do not weaken or delete assertions to make the suite pass.**

**§5 — Accessibility release audit.** One complete review across all three
views — listing (one `h1`, heading hierarchy, landmarks, semantic controls,
visible focus, meaningful image alternatives); photo tour (accessible categories
and thumbnails, named Back/Share/Save, focus trap, inert listing, Escape, focus
restoration); lightbox (`role="dialog"`, `aria-modal`, labelled dialog,
accessible image, named controls, focus trap, inert tour, Escape, arrow keys,
focus restoration). Verify only one modal layer behaves as active at a time, and
document deliberate improvements over the reference.

**§6 — Performance review.** A real browser review if the environment allows:
listing hero loading, layout stability and critical image priority; the tour's
43 images, lazy loading, request count and absence of eager loading or heavy
dependencies; the lightbox's active-image loading, absence of bulk loading,
layout stability and navigation responsiveness. If the reference images cannot
load, document that the image origin could not be fully validated — **do not
invent load-time numbers.**

**§7 — Architecture diagram, required deliverable.** Create the production-scale
vacation-rental marketplace architecture diagram: a scalable system, not merely
the current frontend clone. Minimum contents — clients (web/desktop, mobile,
admin); edge (DNS, CDN, WAF, load balancer / API gateway); application services
(listing, search, availability, booking, pricing, payment, user/auth, review,
media, notification, recommendation, host, admin/moderation); data (primary
relational database, read replicas, cache, search index, object storage,
analytics/event store); async (message broker/event bus, background workers,
notification processing, search indexing, recommendation pipelines, booking
events); external systems (payment, maps/geocoding, email/SMS/push, identity);
observability (logs, metrics, traces, alerting); security (WAF, IAM, secrets,
encryption, rate limiting, audit logs).

Do not claim StayVista implements these services. Label it "Reference Production
Architecture — Vacation Rental Marketplace" and clearly separate CURRENT CLONE
from SCALABLE PRODUCTION ARCHITECTURE. Prefer `docs/architecture.png` and, if
practical, `docs/architecture.pdf`, keeping the editable source. Add
`docs/15-production-architecture.md` explaining the major flows.

**§8 — Flows to document.** Browse/search; listing photos; booking; host listing
update; reviews — each as an explicit path through the components above.

**§9 — Security and reliability notes.** Stateless services, horizontal scaling,
cache strategy, database replication, idempotency for booking/payment,
distributed locking or transactional availability control, eventual consistency
where appropriate, object storage plus CDN for media, rate limiting,
authentication/authorization, secret management, audit logging, observability,
disaster recovery and backups. Do not overclaim implementation.

**§10 — Documentation cleanup.** Review the README, `PROMPTS.md` and docs 01,
03, 07, 10, 12, 13, 14 and the verification queue. Remove obsolete instructions
and make the documentation reflect the actual implementation: the listing page,
photo tour and lightbox; measured vs calibrated vs provisional values; the
permanent computed-style limitation; deliberate accessibility divergences; the
asset licensing and runtime strategy; the architecture diagram; and validation
limitations. Do not say "pixel-perfect" globally — use language such as
*"geometry and interaction fidelity are validated against the captured reference
evidence; some visual tokens remain provisional because computed reference
styles were unavailable."*

**§11 — PROMPTS.md.** Ensure the complete prompt history is present, 01 through
08, with no earlier prompt deleted.

**§12 — Code quality.** Final sweep for `any`, `@ts-ignore`, unjustified
`@ts-expect-error`, console/debug statements, TODO/FIXME placeholders, dead
imports, duplicate state, duplicate gallery data, unused components, unreachable
code, raw colours, unexplained magic px values, accidental secrets, environment
keys and test/debug files that should not ship. Do not delete legitimate test
harnesses or documentation.

**§13 — Build / typecheck / lint.** Attempt `npm install`, `tsc --noEmit`,
`eslint` and `next build`. The registry has previously returned E403. If
installation remains blocked, **do not fabricate a successful build**: report the
blocker, run all available static parse/bundle validation, perform clean
structural validation, and prepare the project so it can be verified immediately
in a normal networked environment. Create clean-install validation
documentation if possible.

**§14 — Clean extract test.** Before zipping, create a clean copy and verify: no
generated cache required, no absolute local paths, no machine-specific
references, no secrets, no broken imports from local-only files, docs included,
architecture diagram included, Claude configuration/skills/agents included, and
a complete `package.json`. Exclude `node_modules`, `.next`, browser cache, OS
junk, personal files, unrelated screenshots and downloaded proprietary reference
images.

**§15 — Submission ZIP.** Create `StayVista-airbnb-clone-submission.zip`
containing the complete project source and required documentation, excluding
`node_modules/`, `.next/`, `.git/`, temporary probe outputs, browser downloads,
proprietary reference image files and local machine artefacts. Inspect the ZIP
contents before finishing.

**§16 — Final submission checklist.** Desktop listing page, photo tour,
lightbox, previous/next behaviour, keyboard navigation, accessibility,
pixel/geometry evidence documented, animations/interactions where measurable,
production-scale architecture diagram, AI-native workflow/configuration, prompt
history, no public GitHub repository, no reference source copied, no proprietary
images or font packaged, source and documentation included, final ZIP created
and inspected, and build limitations honestly documented.

**§17 — Final release report.** Return: final project status; listing, photo
tour and lightbox validation; end-to-end release QA results; accessibility
results; performance observations; architecture diagram location; documentation
status; build/typecheck/lint status; remaining blockers; remaining provisional
visual values; deliberate divergences; the final ZIP path; an exact summary of
its contents; and the final checklist marked PASS or BLOCKED. Do not claim
blocked checks passed, and do not claim the project is pixel-perfect while
visual tokens remain provisional.

**§18 — Stop** once the ZIP is created and inspected. No further UI changes
unless a release QA failure requires a correction. This is the final phase.
