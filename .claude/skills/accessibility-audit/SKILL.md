---
name: accessibility-audit
description: Run a keyboard, focus, dialog-semantics and contrast audit on a StayVista surface. Use when checking accessibility, auditing the photo tour or lightbox, verifying focus trapping or focus restoration, or before an accessibility sign-off.
---

# Accessibility audit

Verify behaviour by driving the page. Reading the source tells you what was
intended; pressing Tab tells you what happens.

## Setup

Open the local build. Click once on the page background so focus starts at
`<body>`, then begin.

## Procedure

### A. Focus order

Press Tab repeatedly and log where focus lands after each press:

```js
({
  tag: document.activeElement.tagName,
  name: document.activeElement.ariaLabel || document.activeElement.textContent?.trim().slice(0, 40),
  visible: document.activeElement.getBoundingClientRect(),
});
```

Fail conditions: focus order deviates from reading order; focus lands on an
element with zero size; focus escapes to the browser chrome mid-page; a control
is reachable by mouse but not by Tab.

### B. Dialog checklist

Run the whole list for the photo tour, then again for the lightbox:

1. Open with `Enter` on the trigger (not a click) — does it open?
2. Where did focus go? Query `document.activeElement` immediately.
3. Tab to the last control, Tab once more — does focus wrap to the first?
4. Shift+Tab from the first — does it wrap to the last?
5. Press `Escape` — does it close?
6. Where is focus now? It must be the trigger, exactly.
7. Did the page scroll position change? Compare `scrollY` before and after.
8. While open, is the background inert?
   `document.querySelector('main').getAttribute('aria-hidden')` or `.inert`
9. Does the dialog have `role="dialog"`, `aria-modal="true"` and an accessible
   name? `document.querySelector('[role=dialog]').getAttribute('aria-label')`
10. Lightbox only: does `ArrowRight` advance and does the announced position
    update? Check the live region's text, not just the image `src`.

### C. Contrast

```js
function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).slice(0, 3).map(Number).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return +((a + 0.05) / (b + 0.05)).toFixed(2);
}
```

Walk every text node's element, resolve its effective background (climb parents
past `rgba(0,0,0,0)`), and compute the ratio. Thresholds: 4.5:1 body, 3:1 large
text and UI boundaries.

White controls sitting on photographs are the usual failure — they need a scrim
or a shadow, and a measured ratio against the darkest pixel behind them.

### D. Reduced motion

Emulate `prefers-reduced-motion: reduce`, reload, and repeat section B. Every
state change must still complete; nothing may animate.

### E. Screen-reader sanity

Read the accessibility tree and check that the page makes sense read aloud:
headings describe their sections, buttons say what they do ("Show all 42 photos",
not "Show"), images that carry meaning have descriptive alt text, and decorative
images are `alt=""`.

## Report

Use the table in `.claude/agents/accessibility-reviewer.md`. Include the exact
key press or query that reproduces each issue. Mark anything you could not verify
as "not verified" rather than assuming it passes.
