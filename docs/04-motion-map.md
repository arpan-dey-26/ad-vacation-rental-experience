# 04 — Motion map

## Governing rule

The reference's motion language is subtle, and the brief is explicit: *"Where the
reference is subtle, keep our animation subtle"* and *"Do NOT invent unnecessary
animations."*

So this file is written as a **hypothesis table with a measurement column**, not
as a specification. Every row's `Reference` column is filled by running the
`interaction-motion-reviewer` against the live page (MOT-1). A row whose
measurement comes back "no transition" is implemented as **no transition** — the
absence of motion is as much a fidelity requirement as its presence.

## Candidate inventory

| # | Trigger | Element | From → To | Properties | Duration (hyp.) | Easing (hyp.) | Reference (measured) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M1 | Hover hero tile | Tile image | normal → dimmed | `filter: brightness()` | 150ms | standard | *unmeasured* |
| M2 | Hover "Show all photos" | Button | rest → hover fill | `background-color` | 90ms | standard | *unmeasured* |
| M3 | Hover Share / Save | Label | no underline → underline | `text-decoration` | instant | — | *unmeasured* |
| M4 | Hover Save | Heart icon | outline → filled-ish | `fill`, `transform: scale()` | 150ms | standard | *unmeasured* |
| M5 | Press any button | Button | rest → pressed | `transform: scale(0.96)` | 90ms | standard | *unmeasured* |
| M6 | Open photo tour | Overlay | `translateY(16px)`, `opacity:0` → `translateY(0)`, `opacity:1` | `transform`, `opacity` | 400ms | emphasised | *unmeasured* |
| M7 | Close photo tour | Overlay | reverse of M6 | `transform`, `opacity` | 250ms | exit | *unmeasured* |
| M8 | Open lightbox | Backdrop | `opacity:0 → 1` | `opacity` | 250ms | standard | *unmeasured* |
| M9 | Open lightbox | Image | `scale(0.98)`, `opacity:0` → `scale(1)`, `opacity:1` | `transform`, `opacity` | 250ms | emphasised | *unmeasured* |
| M10 | Lightbox prev/next | Image | crossfade between photos | `opacity` | 250ms | standard | *unmeasured* |
| M11 | Hover lightbox arrow | Control | rest → hover | `background-color`, `transform: scale(1.04)` | 150ms | standard | *unmeasured* |
| M12 | Scroll past gallery | Header | transparent → bordered | `box-shadow`, `border-color` | 150ms | standard | *unmeasured* |
| M13 | Scroll | Booking card | static → stuck | none (CSS `position: sticky`) | — | — | *unmeasured* |
| M14 | Hover review / similar-stay card | Card | rest → raised | `box-shadow` | 150ms | standard | *unmeasured* |
| M15 | Image load | Any photo | blur placeholder → image | `opacity`, `filter: blur()` | 250ms | standard | *unmeasured* |
| M16 | Expand description | Body copy | clamped → full, or dialog open | `opacity` (dialog) | 250ms | standard | *unmeasured* |

Asymmetric exit timings (M7 faster than M6) are the convention for overlays —
entrances announce, exits get out of the way. Confirm rather than assume.

## Implementation rules

**Compositor properties only.** `transform`, `opacity`, `filter`, `clip-path`.
Any transition on `width`, `height`, `top`, `left`, `margin` or `box-shadow` is a
code-quality finding. M14's shadow transition is the one allowed exception and
only if the reference has it; if so, it is implemented as an opacity transition
on a pseudo-element carrying the shadow, not on `box-shadow` itself.

**No animation library.** Every row above is expressible in CSS transitions plus,
for the overlay entrances, a CSS `@keyframes` run once on mount. Adding
`framer-motion` for this would be the kind of over-engineering the brief warns
against, and it would move animation work onto the main thread.

**Overlay entrance without layout thrash.** Overlays mount with their entrance
class already applied and animate on the next frame via a `data-state` attribute
(`opening` → `open` → `closing`), so the element is never painted in its final
state before animating. Exit animations complete before unmount, driven by
`transitionend` with a timeout fallback — a dropped `transitionend` must never
strand an overlay on screen.

**`will-change` is scoped.** Applied on interaction start, removed on end. Never
left in a stylesheet permanently.

**No layout animation.** Nothing in this page should animate its size. Where
something appears to grow, it is a transform on a fixed-size box.

## Reduced motion

`globals.css` already collapses all durations to ~0 under
`prefers-reduced-motion: reduce`. Three things must still be verified by hand
rather than assumed from that rule:

1. Overlay open/close still completes — the `transitionend`-driven unmount must
   have a timeout fallback, because a 0.01ms transition may not fire an event
   reliably.
2. The lightbox still changes photo instantly and still announces the change.
3. No element is left mid-transform when a rapid sequence is interrupted.

MOT-3 records whether the reference itself honours reduced motion. If it does
not, we still do — the brief grades accessibility, and honouring the media query
is not a visual deviation for any user who has not asked for it.

## Performance targets

- 60fps during the photo-tour entrance, the lightbox crossfade, and a full-page
  scroll.
- No layout shift after first paint: every image box has an intrinsic ratio
  before its bytes arrive.
- The listing page's first load should not ship animation JavaScript at all.
