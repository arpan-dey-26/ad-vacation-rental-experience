---
name: visual-fidelity-audit
description: Measure a StayVista surface against the reference page and produce a deviation report with token-level fixes. Use when comparing the clone to the reference, checking spacing/typography/colour accuracy, or before signing off a view.
---

# Visual fidelity audit

A repeatable procedure for turning "looks about right" into numbers.

## Before you start

Both pages must be open at the **same viewport**. Emulate 1440×900 first; the
reference is desktop-only, so do not audit below 1280px.

```js
// Run in each page to confirm you are comparing like with like.
({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio });
```

## Step 1 — Capture a measurement set

For the surface under audit, list its elements in `docs/06-design-tokens.md`
order (container → grid → type → colour → edges → states). For each, run this in
both pages and keep the two results side by side:

```js
function probe(sel) {
  const el = document.querySelector(sel);
  if (!el) return { sel, missing: true };
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  return {
    sel,
    x: +r.x.toFixed(1), y: +r.y.toFixed(1),
    w: +r.width.toFixed(1), h: +r.height.toFixed(1),
    font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.fontFamily.split(',')[0]}`,
    tracking: s.letterSpacing,
    color: s.color, bg: s.backgroundColor,
    border: `${s.borderWidth} ${s.borderColor}`,
    radius: s.borderRadius, shadow: s.boxShadow,
    pad: s.padding, gap: s.gap,
  };
}
probe('SELECTOR');
```

Selectors will differ between the two codebases — that is expected and fine.
Match elements by their role on screen, not by class name.

## Step 2 — Derive, don't copy

When the reference's computed value differs from ours, write the *intent* into a
token, not the raw number into a component. Example: a 22px/26px 600-weight
section heading becomes `--text-section` + `--font-weight-semibold`, used
everywhere headings appear.

Never copy the reference's class names, CSS source, DOM structure or component
names into this project. You are recording observed rendered values, which are
measurements, and writing an original implementation from them.

## Step 3 — Classify

| Delta | Verdict |
| --- | --- |
| ≤1px geometry, identical colour and type | pass |
| 2–4px geometry | finding |
| >4px geometry, any colour or type mismatch | defect |

## Step 4 — Report

Produce the table from `.claude/agents/visual-fidelity-reviewer.md` plus the top
three highest-payoff fixes, each naming a file and a token.

## Traps that cost the most points

- **Aspect ratio before size.** A mosaic tile that is 2px narrow but the wrong
  aspect reads as wrong instantly; one that is 4px narrow at the right aspect
  does not. Fix ratios first.
- **Line-height, not font-size.** Most "text looks off" reports are a
  line-height mismatch cascading into section height.
- **Optical vs. measured gutters.** Match the computed padding, then check the
  rendered gap between *ink*, which differs when line-heights differ.
- **Hover states are half the surface.** A resting-state match that ignores
  `:hover` is an incomplete audit.
- **Scrollbar width** changes the content column. Confirm `scrollbar-gutter`
  behaviour on both sides before reporting a 15–17px horizontal delta.
