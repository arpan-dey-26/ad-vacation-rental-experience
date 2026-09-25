/* Measures the rendered harness against docs/12-measurements.md at each
   supported desktop width. Exits non-zero on any failure, so it can gate a
   phase the same way a test would. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const WIDTHS = [1280, 1440, 1600];
const URL = `file://${resolve('scripts/verify-geometry/harness.html')}`;

/* [selector, property, expected, tolerance] — every expectation traces to a
   MEASURED row in docs/12-measurements.md. */
const CHECKS = [
  /* The shell caps at 1280 of AVAILABLE width. `scrollbar-gutter: stable`
     reserves ~15px, so at a 1280 viewport the client area is 1265 and the shell
     is 1265 — correct behaviour, and the deliberate LAY-7 divergence from the
     reference, which does not reserve the gutter. Expectations below are
     therefore computed from the client width, not the viewport width. */
  ['main .shell', 'width', 'shell', 0.5, 'LAY-2 shell max-width'],
  ['.listing-body', 'width', 'content', 0.5, 'LAY-1 content column'],
  ['.hero', 'width', 'content', 0.5, 'HERO-4 mosaic width'],
  ['.hero', 'height', 494, 0.5, 'HERO-4 mosaic height (fixed)'],
  ['.hero__tile--major', 'width', 'major', 0.5, 'HERO-1 major tile'],
  ['.hero__tile--major', 'height', 494, 0.5, 'HERO-1 major tile spans 2 rows'],
  ['.hero__tile:nth-child(2)', 'width', 'minor', 0.5, 'HERO-1 minor tile'],
  ['.hero__tile:nth-child(2)', 'height', 243, 0.5, 'HERO-1 row height'],
  ['.hero__show-all', 'height', 32, 0.5, 'HERO-5 control height'],
  ['.listing-body__main', 'width', 652, 0.5, 'LAY-3 content column'],
  ['.booking-rail', 'width', 372, 0.5, 'LAY-3 booking rail'],
  ['.booking-card', 'width', 372, 0.5, 'BOOK-1 card outer width'],
  ['.site-header', 'height', 89, 0.5, 'LAY-5 header height'],
  ['.section-nav', 'height', 67, 0.5, 'LAY-5c sub-nav height'],
  ['.policies', 'width', 1120, 0.5, 'SEC-10 policy row (fixed 3 x 352 + 2 x 32)'],
];

const browser = await chromium.launch();
let failures = 0;
const rows = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  /* Photos live on the reference origin, which this sandbox cannot reach. They
     are irrelevant to geometry — every tile is a fixed grid cell — so abort
     them rather than wait on failing requests. */
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await page.waitForLoadState('domcontentloaded');

  /* `scrollbar-gutter: stable` reserves the gutter inside <html>, so the width
     actually available to the page is body's client width, not the viewport's
     and not documentElement's — which still reports the full viewport. */
  const client = await page.evaluate(() => document.body.clientWidth);
  const expectFor = {
    shell: Math.min(1280, client),
    content: Math.min(1120, client - 160),
    major: (Math.min(1120, client - 160) - 16) * (35 / 69),
    minor: (Math.min(1120, client - 160) - 16) * (17 / 69),
  };

  for (const [selector, prop, rawExpected, tol, label] of CHECKS) {
    const expected =
      typeof rawExpected === 'string'
        ? +expectFor[rawExpected].toFixed(1)
        : rawExpected;
    const value = await page.evaluate(
      ([sel, p]) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return p === 'width' ? r.width : r.height;
      },
      [selector, prop],
    );
    const ok = value !== null && Math.abs(value - expected) <= tol;
    if (!ok) failures++;
    rows.push({ width, label, expected, actual: value === null ? 'MISSING' : +value.toFixed(1), ok });
  }

  /* Derived geometry that a single selector cannot express. */
  const derived = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('.hero__tile')].map((t) =>
      t.getBoundingClientRect(),
    );
    const main = document.querySelector('.listing-body__main')?.getBoundingClientRect();
    const rail = document.querySelector('.booking-rail')?.getBoundingClientRect();
    const card = document.querySelector('.booking-card');
    const cardStyle = card ? getComputedStyle(card) : null;
    const header = document.querySelector('.site-header');
    return {
      hGap: tiles[1] && tiles[2] ? +(tiles[2].x - (tiles[1].x + tiles[1].width)).toFixed(1) : null,
      vGap: tiles[1] && tiles[3] ? +(tiles[3].y - (tiles[1].y + tiles[1].height)).toFixed(1) : null,
      colGap: main && rail ? +(rail.x - (main.x + main.width)).toFixed(1) : null,
      cardInner: card
        ? +(
            card.getBoundingClientRect().width -
            parseFloat(cardStyle.borderLeftWidth) -
            parseFloat(cardStyle.borderRightWidth) -
            parseFloat(cardStyle.paddingLeft) -
            parseFloat(cardStyle.paddingRight)
          ).toFixed(1)
        : null,
      headerPosition: header ? getComputedStyle(header).position : null,
      /* The honest test is whether the window can actually be scrolled
         sideways — documentElement.scrollWidth over-reports when a descendant
         scroller leaks its extent. */
      overflowX: (() => {
        const before = window.scrollX;
        window.scrollTo(9999, window.scrollY);
        const reach = window.scrollX;
        window.scrollTo(before, window.scrollY);
        return reach;
      })(),
      gutterLeft: (() => {
        const shell = document.querySelector('main .shell');
        const body = document.querySelector('.listing-body');
        return shell && body
          ? +(body.getBoundingClientRect().x - shell.getBoundingClientRect().x).toFixed(1)
          : null;
      })(),
    };
  });

  const derivedChecks = [
    ['HERO-2 horizontal gap', derived.hGap, 8],
    ['HERO-2 vertical gap', derived.vGap, 8],
    ['LAY-3 column gap', derived.colGap, 96],
    ['BOOK-1 card inner width', derived.cardInner, 322],
    ['LAY-2 gutter', derived.gutterLeft, 80],
    ['no horizontal overflow', derived.overflowX, 0],
  ];
  for (const [label, actual, expected] of derivedChecks) {
    const ok = actual !== null && Math.abs(actual - expected) <= 0.5;
    if (!ok) failures++;
    rows.push({ width, label, expected, actual, ok });
  }

  const headerOk = derived.headerPosition === 'static';
  if (!headerOk) failures++;
  rows.push({
    width,
    label: 'LAY-5b header is NOT sticky',
    expected: 'static',
    actual: derived.headerPosition,
    ok: headerOk,
  });

  await page.close();
}

await browser.close();

for (const w of WIDTHS) {
  console.warn(`\n=== viewport ${w}px ===`);
  for (const r of rows.filter((r) => r.width === w)) {
    console.warn(
      `  ${r.ok ? 'PASS' : 'FAIL'}  ${String(r.label).padEnd(34)} expected ${String(r.expected).padEnd(8)} actual ${r.actual}`,
    );
  }
}
console.warn(`\n${failures === 0 ? 'ALL CHECKS PASS' : failures + ' FAILURE(S)'} — ${rows.length} assertions across ${WIDTHS.length} viewports`);
process.exit(failures === 0 ? 0 : 1);
