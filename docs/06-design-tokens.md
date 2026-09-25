# 06 — Design token proposal

The tokens live in `src/app/globals.css` inside Tailwind v4's `@theme` block.
This file explains the system; that file is the source of truth. There is
deliberately no `tailwind.config.js` — one place to change a value, no drift
between config and CSS.

## Rules

1. **Role names, not value names.** `--color-ink-muted`, not `--color-gray-600`.
   When a measurement comes back different, one token changes and the whole page
   follows. Value-named tokens force a rename or a lie.
2. **No raw values in components.** Spacing, colour, radius, duration and z-index
   come from tokens. `code-quality-reviewer` greps for stray `px` and hex values
   outside `globals.css` and reports them.
3. **`[PROVISIONAL]` until measured.** Every token carries that marker in
   `globals.css` until `VERIFICATION-QUEUE.md` clears it. A token without the
   marker is a claim that it was measured.
4. **Tokens are ours.** They record observed rendered values, expressed in our
   own naming and structure. No reference CSS is copied.

## Typography

Six roles, not a size scale — a size scale invites picking "the 22px one"
wherever something looks big, which is how a page drifts.

| Token | Role |
| --- | --- |
| `--text-display` | Listing title (`h1`) |
| `--text-section` | Section headings (`h2`) |
| `--text-subsection` | Sub-headings (`h3`), booking-card price |
| `--text-body` | Paragraphs, amenity labels, review bodies |
| `--text-meta` | Captions, secondary meta, review dates |
| `--text-fine` | Fine print, legal, footnotes |

Each carries its own `--line-height` companion, because line-height is what
drives section heights and is the most common source of cumulative drift.

Weights: `regular 400`, `medium 500`, `semibold 600`, `bold 800`. Four is
enough; the reference is unlikely to use more, and more invites inconsistency.

**Font family.** Airbnb's own face (Circular) is proprietary and not ours to
use. The reference must already substitute something. TYPE-1 records what is
actually served; Inter is the placeholder because its metrics are the closest
freely-licensed match to Circular's. If the reference serves a system stack, we
match the stack — a font mismatch is a fidelity defect, and substituting a
*different* wrong font to look "nicer" is worse than matching.

## Colour

| Token | Role |
| --- | --- |
| `--color-ink` | Primary text |
| `--color-ink-muted` | Secondary text |
| `--color-ink-subtle` | Tertiary text, captions |
| `--color-ink-inverse` | Text on dark surfaces |
| `--color-surface` | Page background |
| `--color-surface-sunken` | Hover fills, skeletons |
| `--color-surface-overlay` | Overlay backdrop |
| `--color-line` | Hairline dividers |
| `--color-brand` / `--color-brand-strong` | Accent, rest and hover |
| `--color-action` / `--color-action-hover` | Primary button fill |
| `--color-focus` | Focus ring |

No dark mode. The reference is a single-theme desktop page; adding a theme would
be scope the brief explicitly warns against.

## Spacing

A 4px base (`--spacing: 0.25rem`), so Tailwind's numeric utilities resolve to
4/8/12/16/24/32/48/64/80. No bespoke spacing tokens: the measurements will land
on this grid, and if one genuinely does not, it becomes an arbitrary value at
the single site that needs it rather than a new token nobody reuses.

## Radii

`xs 4` · `sm 8` · `md 12` · `lg 16` · `xl 24` · `pill 999`. The hero mosaic's
outer corners and the booking card are the two places where getting this wrong
is immediately visible.

## Elevation

Three shadows only: `--shadow-card` (booking card), `--shadow-popover` (menus,
skip link), `--shadow-control` (floating buttons over photography). A fourth
would mean the system is describing instances rather than roles.

## Motion

Four durations and three easings, shared by every transition:

| Token | Used for |
| --- | --- |
| `--duration-instant` (90ms) | Hover tints, button press |
| `--duration-fast` (150ms) | Image hover, icon state |
| `--duration-medium` (250ms) | Lightbox crossfade, overlay exit |
| `--duration-slow` (400ms) | Photo-tour entrance |
| `--ease-standard` | Most transitions |
| `--ease-emphasised` | Overlay entrances |
| `--ease-exit` | Overlay exits |

Every number here is provisional and is replaced by the measurements in
`04-motion-map.md`.

## z-index

Declared once, as named layers, so no component ever invents `z-index: 9999`:

```text
base 0 · sticky-booking 10 · header 20
overlay-backdrop 100 · overlay-content 110 · overlay-controls 120
```

These are plain custom properties rather than `@theme` entries because they are
consumed by name in component CSS, never as Tailwind utilities.

## Layout

| Token | Role |
| --- | --- |
| `--container-page` | Content column max-width |
| `--container-gutter` | Page side gutter |
| `--container-tour` | Photo-tour column width |
| `--size-header` | Header height |
| `--size-gallery-gap` | Hero mosaic gap |
| `--size-booking-card` | Sticky booking-card width |

Phase 2 added a **measured component dimensions** block — header inner cap, hero
tile widths, the "Show all photos" control, sleeping cards, policy columns, CTA
and pill heights, carousel arrows — plus a small **unmeasured spacing** block
(`--space-section`, `--space-block`, `--space-stack`) that exists so section
rhythm is calibrated in one file rather than hunted through markup.

`@theme` is declared `static` so every token reaches `:root` whether or not a
Tailwind utility happens to reference it. The structural CSS reads them with
`var()` directly, and tree-shaken tokens would resolve to nothing.

These six are the highest-priority measurements in the whole project. Per
`02-reference-analysis.md`, an error here invalidates every section below it, so
LAY-1 … LAY-3 are cleared before any section work starts.
