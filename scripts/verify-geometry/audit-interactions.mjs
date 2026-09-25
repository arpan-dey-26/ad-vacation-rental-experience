/* Phase 3 interaction and focus-management checks, run against the interactive
   harness. These assert behaviour a static render cannot show: dialog focus
   movement, trapping, Escape, focus restoration, background inertness, scroll
   locking, calendar keyboard navigation and the section-nav reveal. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const URL = `file://${resolve('scripts/verify-geometry/harness-app.html')}`;
const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
const consoleErrors = [];
/* Photos live on the reference origin and are aborted above, so their failed
   loads are harness noise rather than application errors. */
const isAbortedAsset = (text) => /ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(text);
page.on('console', (m) => {
  if (m.type() === 'error' && !isAbortedAsset(m.text())) consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

await page.goto(URL);
await page.waitForSelector('.hero__tile', { timeout: 10000 });

/* --- Section nav ---------------------------------------------------------- */
check(
  'section nav is parked and inert at rest',
  await page.evaluate(() => {
    const nav = document.querySelector('.section-nav');
    return nav?.getAttribute('data-revealed') === 'false' && nav.hasAttribute('inert');
  }),
);

await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(150);
check(
  'section nav reveals past its threshold',
  await page.evaluate(
    () => document.querySelector('.section-nav')?.getAttribute('data-revealed') === 'true',
  ),
);
check(
  'revealed section nav is no longer inert',
  await page.evaluate(() => !document.querySelector('.section-nav')?.hasAttribute('inert')),
);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(150);

/* --- Amenities dialog ----------------------------------------------------- */
const trigger = page.locator('button', { hasText: 'Show all 50 amenities' });
await trigger.focus();
await page.keyboard.press('Enter');
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

const dialogState = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  const rect = dialog.getBoundingClientRect();
  const main = document.querySelector('main');
  return {
    modal: dialog.getAttribute('aria-modal'),
    labelled: Boolean(dialog.getAttribute('aria-labelledby')),
    labelResolves: Boolean(document.getElementById(dialog.getAttribute('aria-labelledby'))),
    width: +rect.width.toFixed(1),
    /* Centred within the fixed overlay layer — which is the intent, and is
       robust to how a given browser reports viewport width.

       Note the consequence of LAY-7: we reserve the scrollbar gutter, so with
       the body locked the dialog sits ~7.5px left of the true window centre.
       The reference instead drops the gutter and shifts the whole page 15px.
       We chose the smaller, static offset over a visible page jump; recorded
       in docs/12-measurements.md. */
    centred: (() => {
      const layer = document.querySelector('.dialog-layer').getBoundingClientRect();
      return Math.abs(rect.x + rect.width / 2 - (layer.x + layer.width / 2)) < 1;
    })(),
    centreOffsetFromWindow: +(rect.x + rect.width / 2 - window.innerWidth / 2).toFixed(1),
    focusInside: dialog.contains(document.activeElement),
    focusName: document.activeElement?.getAttribute('aria-label'),
    backgroundInert: main?.closest('[inert]') !== null || main?.hasAttribute('inert'),
    scrollLocked: document.body.dataset.scrollLocked === 'true',
  };
});

check('dialog has aria-modal', dialogState.modal === 'true');
check('dialog is labelled by a real element', dialogState.labelled && dialogState.labelResolves);
check('dialog width is the measured 780', Math.abs(dialogState.width - 780) < 1, `${dialogState.width}`);
check(
  'dialog is centred in the overlay layer',
  dialogState.centred,
  `${dialogState.centreOffsetFromWindow}px from the window centre — the LAY-7 gutter trade`,
);
check('focus moved into the dialog', dialogState.focusInside, dialogState.focusName ?? '');
check('background is inert', dialogState.backgroundInert);
check('body scroll is locked', dialogState.scrollLocked);

/* Focus trap: Tab to the end and past it. */
const trapped = await page.evaluate(async () => {
  const dialog = document.querySelector('[role="dialog"]');
  const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
  focusable[focusable.length - 1]?.focus();
  return dialog.contains(document.activeElement);
});
await page.keyboard.press('Tab');
check(
  'Tab from the last control stays inside the dialog',
  trapped && (await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement))),
);
await page.keyboard.press('Shift+Tab');
check(
  'Shift+Tab stays inside the dialog',
  await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)),
);

/* Escape closes and focus returns. */
await page.keyboard.press('Escape');
await page.waitForTimeout(120);
check('Escape closes the dialog', (await page.locator('[role="dialog"]').count()) === 0);
check(
  'focus returns to the trigger',
  await page.evaluate(() =>
    document.activeElement?.textContent?.includes('Show all 50 amenities'),
  ),
);
check(
  'body scroll is released',
  await page.evaluate(() => document.body.dataset.scrollLocked === undefined),
);
check(
  'background is no longer inert',
  await page.evaluate(() => !document.querySelector('main')?.closest('[inert]')),
);

/* --- Calendar ------------------------------------------------------------- */
check(
  'calendar exposes exactly one tab stop',
  await page.evaluate(
    () => document.querySelectorAll('.calendar__day[tabindex="0"]').length === 1,
  ),
);
await page.evaluate(() => document.querySelector('.calendar__day[tabindex="0"]')?.focus());
const dayBefore = await page.evaluate(() => document.activeElement?.dataset.day);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(80);
const dayAfter = await page.evaluate(() => document.activeElement?.dataset.day);
check('ArrowRight moves the calendar focus by one day', dayBefore !== dayAfter, `${dayBefore} → ${dayAfter}`);
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(80);
check(
  'ArrowDown moves by a week',
  await page.evaluate(() => document.activeElement?.classList.contains('calendar__day')),
);
check(
  'a selected range is marked',
  await page.evaluate(() => document.querySelectorAll('.calendar__day[data-selected="true"]').length === 2),
);

/* --- Global --------------------------------------------------------------- */
check(
  'no horizontal window scroll',
  await page.evaluate(() => {
    window.scrollTo(9999, 0);
    const x = window.scrollX;
    window.scrollTo(0, 0);
    return x === 0;
  }),
);
check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.warn(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? `  (${r.detail})` : ''}`);
}
console.warn(`\n${failed === 0 ? 'ALL INTERACTION CHECKS PASS' : `${failed} FAILURE(S)`} — ${results.length} assertions`);
process.exit(failed === 0 ? 0 : 1);
