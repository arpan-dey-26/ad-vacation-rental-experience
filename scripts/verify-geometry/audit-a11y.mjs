/* Structural accessibility checks against the rendered page. Not a substitute
   for the keyboard sweep in .claude/skills/accessibility-audit — it checks what
   static markup can be checked, so regressions are caught before that sweep. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
await page.goto(`file://${resolve('scripts/verify-geometry/harness.html')}`);

const report = await page.evaluate(() => {
  const problems = [];
  const add = (severity, message) => problems.push({ severity, message });

  const h1s = [...document.querySelectorAll('h1')];
  if (h1s.length !== 1) add('blocker', `expected exactly one <h1>, found ${h1s.length}`);

  /* Heading order must not skip a level. */
  let previous = 1;
  for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const level = Number(h.tagName[1]);
    if (level > previous + 1) {
      add('serious', `heading jumps h${previous} → h${level}: "${h.textContent.trim().slice(0, 40)}"`);
    }
    previous = level;
  }

  /* Every image either describes itself or is explicitly decorative. */
  for (const img of document.querySelectorAll('img')) {
    if (img.getAttribute('alt') === null) {
      add('blocker', `<img> without alt: ${img.getAttribute('src')?.slice(-40)}`);
    }
  }

  /* No clickable non-buttons. */
  const fakeButtons = [...document.querySelectorAll('[onclick],[role="button"]')].filter(
    (el) => el.tagName !== 'BUTTON' && el.tagName !== 'A',
  );
  if (fakeButtons.length) add('blocker', `${fakeButtons.length} clickable non-button elements`);

  /* Every interactive control has an accessible name. */
  for (const el of document.querySelectorAll('button, a[href]')) {
    const name =
      el.getAttribute('aria-label') ||
      el.textContent.trim() ||
      el.querySelector('title')?.textContent;
    if (!name) {
      add('blocker', `unnamed ${el.tagName.toLowerCase()}: ${el.className}`);
    }
  }

  /* Landmarks. */
  const landmarks = [...document.querySelectorAll('header,nav,main,footer,aside')].map(
    (el) => el.tagName.toLowerCase(),
  );
  if (!landmarks.includes('main')) add('blocker', 'no <main> landmark');

  /* Multiple navs and asides need distinguishing names. */
  for (const tag of ['nav', 'aside']) {
    const all = [...document.querySelectorAll(tag)];
    if (all.length > 1) {
      const unnamed = all.filter(
        (el) => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'),
      );
      if (unnamed.length) add('serious', `${unnamed.length} of ${all.length} <${tag}> lack a name`);
    }
  }

  /* Sections that claim to be labelled must point at something real. */
  for (const el of document.querySelectorAll('[aria-labelledby]')) {
    const id = el.getAttribute('aria-labelledby');
    if (!document.getElementById(id)) add('serious', `aria-labelledby="${id}" has no target`);
  }

  /* Anchors used by the section nav must exist. */
  for (const a of document.querySelectorAll('.section-nav__link')) {
    const id = a.getAttribute('href')?.slice(1);
    if (id && !document.getElementById(id)) add('serious', `section-nav target #${id} missing`);
  }

  /* The off-screen nav must be inert so it cannot take focus. */
  const nav = document.querySelector('.section-nav');
  if (nav && nav.dataset.revealed === 'false' && !nav.hasAttribute('inert')) {
    add('serious', 'parked section nav is focusable');
  }

  return {
    problems,
    landmarks,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(
      (h) => `${h.tagName} ${h.textContent.trim().slice(0, 44)}`,
    ),
    focusableCount: document.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ).length,
    imagesWithAlt: document.querySelectorAll('img[alt]').length,
    imagesTotal: document.querySelectorAll('img').length,
  };
});

await browser.close();

console.warn('landmarks:', report.landmarks.join(', '));
console.warn('headings:');
for (const h of report.headings) console.warn('  ', h);
console.warn(`focusable controls: ${report.focusableCount}`);
console.warn(`images with alt: ${report.imagesWithAlt}/${report.imagesTotal}`);
console.warn(`\nproblems: ${report.problems.length}`);
for (const p of report.problems) console.warn(`  [${p.severity}] ${p.message}`);
process.exit(report.problems.some((p) => p.severity === 'blocker') ? 1 : 0);
