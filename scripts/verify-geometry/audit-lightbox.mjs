/* Phase 5 lightbox checks, run against the interactive harness.
   Everything asserted traces to a MEASURED row in docs/12-measurements.md
   § Lightbox, or to a behaviour recorded in docs/VERIFICATION-QUEUE.md
   (LIGHT-1 … LIGHT-9).

   The lightbox only exists two clicks deep — listing → tour → photo — so this
   drives the real component tree rather than a static render. Geometry runs at
   five widths; navigation runs at the five photo positions the reference was
   actually captured at. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const URL = `file://${resolve('scripts/verify-geometry/harness-app.html')}`;
const WIDTHS = [1280, 1339, 1440, 1600, 2005];

/* The positions the captures cover. 1 and 43 are the ends; 25, 28 and 40 were
   captured mid-sequence with both controls enabled. One-based, as displayed. */
const POSITIONS = [1, 25, 28, 40, 43];
const TOTAL = 43;

/* MEASURED: photo 28 is in Exterior (25–30) and 43 in Additional photos. */
const EXPECTED_CATEGORY = {
  1: 'Living room 1',
  25: 'Exterior',
  28: 'Exterior',
  40: 'Additional photos',
  43: 'Additional photos',
};

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });
const near = (actual, expected, tol = 0.5) => Math.abs(actual - expected) <= tol;

const browser = await chromium.launch();

/** listing → tour → lightbox at a given one-based photo position. */
async function openLightboxAt(page, position) {
  await page.waitForSelector('.hero__show-all', { timeout: 10000 });
  await page.click('.hero__show-all');
  await page.waitForSelector('.tour', { timeout: 5000 });
  await page.evaluate((index) => {
    const photos = [...document.querySelectorAll('.tour__photo')];
    photos[index]?.click();
  }, position - 1);
  await page.waitForSelector('.lightbox', { timeout: 5000 });
}

/* --- Geometry, at every supported width ----------------------------------- */
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await openLightboxAt(page, 28);

  const g = await page.evaluate(() => {
    const layer = document.querySelector('.lightbox').getBoundingClientRect();
    const image = document.querySelector('.lightbox__image').getBoundingClientRect();
    const previous = document.querySelector('.lightbox__nav--previous').getBoundingClientRect();
    const next = document.querySelector('.lightbox__nav--next').getBoundingClientRect();
    const tourExit = document.querySelector('.lightbox__exit--tour').getBoundingClientRect();
    const close = document.querySelector('.lightbox__exit--close').getBoundingClientRect();
    const img = document.querySelector('.lightbox__image');

    return {
      layerWidth: +layer.width.toFixed(1),
      layerX: +layer.x.toFixed(1),
      imageWidth: +image.width.toFixed(1),
      imageHeight: +image.height.toFixed(1),
      naturalRatio: img.naturalWidth && img.naturalHeight
        ? +(img.naturalWidth / img.naturalHeight).toFixed(3)
        : +(Number(img.getAttribute('width')) / Number(img.getAttribute('height'))).toFixed(3),
      renderedRatio: +(image.width / image.height).toFixed(3),
      /* Centred within the fixed layer. The layer spans the ICB, which
         `scrollbar-gutter: stable` narrows by ~15px, so the absolute offset
         from the window centre is the LAY-7 trade and is reported, not failed. */
      imageCentreOffset: +(image.x + image.width / 2 - (layer.x + layer.width / 2)).toFixed(2),
      windowCentreOffset: +(image.x + image.width / 2 - window.innerWidth / 2).toFixed(2),
      imageVerticalOffset: +(image.y + image.height / 2 - (layer.y + layer.height / 2)).toFixed(2),
      previous: { w: +previous.width.toFixed(1), h: +previous.height.toFixed(1), x: +previous.x.toFixed(1), centreY: +(previous.y + previous.height / 2).toFixed(1) },
      next: { w: +next.width.toFixed(1), h: +next.height.toFixed(1), rightInset: +(layer.x + layer.width - next.right).toFixed(1), centreY: +(next.y + next.height / 2).toFixed(1) },
      tourExit: { w: +tourExit.width.toFixed(1), h: +tourExit.height.toFixed(1), x: +tourExit.x.toFixed(1), y: +tourExit.y.toFixed(1) },
      close: { w: +close.width.toFixed(1), h: +close.height.toFixed(1), y: +close.y.toFixed(1), rightInset: +(layer.x + layer.width - close.right).toFixed(1) },
      layerCentreY: +(layer.y + layer.height / 2).toFixed(1),
      docScrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  const tag = `@${width}`;
  check(`${tag} LIGHT-2b image width is the fixed 1100`, near(g.imageWidth, 1100), `${g.imageWidth}`);
  check(
    `${tag} LIGHT-2 image preserves its source aspect`,
    Math.abs(g.renderedRatio - g.naturalRatio) < 0.01,
    `rendered ${g.renderedRatio} vs source ${g.naturalRatio} → ${g.imageWidth} × ${g.imageHeight}`,
  );
  check(
    `${tag} LIGHT-2 image is centred on both axes`,
    Math.abs(g.imageCentreOffset) < 1 && Math.abs(g.imageVerticalOffset) < 1,
    `${g.imageCentreOffset}px / ${g.imageVerticalOffset}px; ${g.windowCentreOffset}px from the window centre — the LAY-7 gutter trade`,
  );
  check(`${tag} LIGHT-3 Previous is 40 × 40 at inset 20`, near(g.previous.w, 40) && near(g.previous.h, 40) && near(g.previous.x - g.layerX, 20), `${g.previous.w} × ${g.previous.h} at x ${g.previous.x}`);
  check(`${tag} LIGHT-3 Next is 40 × 40 at inset 20`, near(g.next.w, 40) && near(g.next.h, 40) && near(g.next.rightInset, 20), `right inset ${g.next.rightInset}`);
  check(`${tag} LIGHT-3 arrows are vertically centred`, near(g.previous.centreY, g.layerCentreY, 1) && near(g.next.centreY, g.layerCentreY, 1), `${g.previous.centreY} vs ${g.layerCentreY}`);
  check(`${tag} LIGHT-9 "all photos" exit is 40 × 40 at (16, 16)`, near(g.tourExit.w, 40) && near(g.tourExit.h, 40) && near(g.tourExit.x - g.layerX, 16) && near(g.tourExit.y, 16), `${g.tourExit.x - g.layerX}, ${g.tourExit.y}`);
  check(`${tag} LIGHT-9 Close is 40 × 40 at y 16, right inset 24`, near(g.close.w, 40) && near(g.close.h, 40) && near(g.close.y, 16) && near(g.close.rightInset, 24), `y ${g.close.y}, right inset ${g.close.rightInset}`);
  check(`${tag} no horizontal page overflow`, g.docScrollWidth <= g.clientWidth, `${g.docScrollWidth} vs ${g.clientWidth}`);

  await page.close();
}

/* --- Per-photo behaviour, at the captured positions ----------------------- */
for (const position of POSITIONS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await openLightboxAt(page, position);

  const state = await page.evaluate(() => ({
    counter: document.querySelector('.lightbox__counter')?.textContent?.trim(),
    category: document.querySelector('.lightbox__category')?.textContent?.trim(),
    previousDisabled: document.querySelector('.lightbox__nav--previous')?.disabled,
    nextDisabled: document.querySelector('.lightbox__nav--next')?.disabled,
    alt: document.querySelector('.lightbox__image')?.getAttribute('alt'),
  }));

  const tag = `photo ${position}`;
  check(`${tag} LIGHT-6 counter reads "${position} of ${TOTAL}"`, state.counter === `${position} of ${TOTAL}`, state.counter ?? '');
  check(`${tag} LIGHT-7 caption names the category`, state.category === EXPECTED_CATEGORY[position], `${state.category} (expected ${EXPECTED_CATEGORY[position]})`);
  check(`${tag} LIGHT-5 Previous disabled only at photo 1`, state.previousDisabled === (position === 1), `disabled=${state.previousDisabled}`);
  check(`${tag} LIGHT-5 Next disabled only at photo ${TOTAL}`, state.nextDisabled === (position === TOTAL), `disabled=${state.nextDisabled}`);
  check(`${tag} image carries real alt text`, Boolean(state.alt && state.alt.length > 0), state.alt ?? '(empty)');

  await page.close();
}

/* --- Keyboard navigation and the ends ------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await openLightboxAt(page, 28);

  const read = () => page.evaluate(() => document.querySelector('.lightbox__counter')?.textContent?.trim());

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  check('E3.4 ArrowRight steps forward', (await read()) === `29 of ${TOTAL}`, await read());

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(80);
  check('E3.4 ArrowLeft steps back', (await read()) === `27 of ${TOTAL}`, await read());

  /* Walk to the last photo and try to go past it. The clicks fire in a single
     tick on purpose: a burst is the cheapest way to prove the steps compose
     rather than reading one stale index 20 times over. */
  await page.evaluate(() => {
    for (let i = 0; i < 20; i++) document.querySelector('.lightbox__nav--next')?.click();
  });
  await page.waitForTimeout(120);
  check('rapid repeats compose (27 + 20 clicks reaches the end)', (await read()) === `43 of ${TOTAL}`, await read());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  check('LIGHT-5 ArrowRight does NOT wrap 43 → 1', (await read()) === `43 of ${TOTAL}`, await read());

  const tourScrollDuringEnd = await page.evaluate(
    () => document.querySelector('.tour__scroller')?.scrollTop,
  );

  await page.evaluate(() => {
    for (let i = 0; i < 60; i++) document.querySelector('.lightbox__nav--previous')?.click();
  });
  await page.waitForTimeout(150);
  check('LIGHT-5 clicking Previous stops at the first photo', (await read()) === `1 of ${TOTAL}`, await read());
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(80);
  check('LIGHT-5 ArrowLeft does NOT wrap 1 → 43', (await read()) === `1 of ${TOTAL}`, await read());

  check(
    'arrow keys do not scroll the photo tour underneath',
    (await page.evaluate(() => document.querySelector('.tour__scroller')?.scrollTop)) ===
      tourScrollDuringEnd,
    `${tourScrollDuringEnd}`,
  );

  await page.close();
}

/* --- Focus ownership, nesting and restoration ----------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  const consoleErrors = [];
  const isAbortedAsset = (t) => /ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(t);
  page.on('console', (m) => {
    if (m.type() === 'error' && !isAbortedAsset(m.text())) consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto(URL);
  await page.waitForSelector('.hero__show-all', { timeout: 10000 });
  await page.click('.hero__show-all');
  await page.waitForSelector('.tour', { timeout: 5000 });

  /* Scroll the tour, then open a photo that is actually on screen — the same
     discipline as the Phase 4 harness, so the browser never scrolls for us. */
  await page.evaluate(() => {
    document.getElementById('tour-gym')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  await page.waitForTimeout(200);
  const tourScrollBefore = await page.evaluate(
    () => document.querySelector('.tour__scroller').scrollTop,
  );
  const triggerLabel = await page.evaluate(() => {
    const inView = [...document.querySelectorAll('.tour__photo')].find((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 88 && r.bottom <= window.innerHeight;
    });
    inView?.click();
    return inView?.getAttribute('aria-label') ?? null;
  });
  await page.waitForSelector('.lightbox', { timeout: 5000 });

  const layered = await page.evaluate(() => {
    const lightbox = document.querySelector('.lightbox');
    const tour = document.querySelector('.tour');
    return {
      tourStillMounted: Boolean(tour),
      tourInert: tour ? tour.hasAttribute('inert') || tour.closest('[inert]') !== null : null,
      modal: lightbox.getAttribute('aria-modal'),
      labelResolves: Boolean(document.getElementById(lightbox.getAttribute('aria-labelledby'))),
      labelText: document.getElementById(lightbox.getAttribute('aria-labelledby'))?.textContent,
      focusInside: lightbox.contains(document.activeElement),
      focusName: document.activeElement?.getAttribute('aria-label'),
      scrollLocked: document.body.dataset.scrollLocked === 'true',
      tourScroll: document.querySelector('.tour__scroller')?.scrollTop,
      /* The whole point of the nesting work: no tour control may be reachable. */
      reachableTourControls: [...document.querySelectorAll('.tour button')].filter(
        (el) => !el.closest('[inert]') && !el.disabled,
      ).length,
    };
  });

  check('lightbox is a modal dialog', layered.modal === 'true');
  check('lightbox is labelled', layered.labelResolves, layered.labelText ?? '');
  check('focus moved into the lightbox', layered.focusInside, layered.focusName ?? '');
  check('photo tour stays mounted underneath', layered.tourStillMounted);
  check('photo tour is inert while the lightbox is open', layered.tourInert === true);
  check('no photo-tour control is keyboard reachable', layered.reachableTourControls === 0, `${layered.reachableTourControls} reachable`);
  check('body scroll stays locked', layered.scrollLocked);
  check('photo tour keeps its scroll while the lightbox opens', layered.tourScroll === tourScrollBefore, `${tourScrollBefore} → ${layered.tourScroll}`);

  /* Focus trap. */
  const trapped = await page.evaluate(() => {
    const lightbox = document.querySelector('.lightbox');
    const focusable = [...lightbox.querySelectorAll('button:not([disabled])')];
    focusable[focusable.length - 1]?.focus();
    return lightbox.contains(document.activeElement);
  });
  await page.keyboard.press('Tab');
  check(
    'Tab from the last control stays inside the lightbox',
    trapped && (await page.evaluate(() => document.querySelector('.lightbox').contains(document.activeElement))),
  );
  await page.keyboard.press('Shift+Tab');
  check(
    'Shift+Tab stays inside the lightbox',
    await page.evaluate(() => document.querySelector('.lightbox').contains(document.activeElement)),
  );

  /* Escape closes ONE layer. */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const afterEscape = await page.evaluate(() => ({
    lightboxGone: document.querySelector('.lightbox') === null,
    tourStillOpen: Boolean(document.querySelector('.tour')),
    tourInert: document.querySelector('.tour')?.closest('[inert]') !== null,
    tourScroll: document.querySelector('.tour__scroller')?.scrollTop,
    focusName: document.activeElement?.getAttribute('aria-label'),
    scrollLocked: document.body.dataset.scrollLocked === 'true',
  }));

  check('Escape closes the lightbox only', afterEscape.lightboxGone && afterEscape.tourStillOpen);
  check('photo tour becomes active again', afterEscape.tourInert === false);
  check('focus returns to the exact photo that opened it', afterEscape.focusName === triggerLabel, `${afterEscape.focusName}`);
  check('photo tour scroll is unchanged after closing', afterEscape.tourScroll === tourScrollBefore, `${tourScrollBefore} → ${afterEscape.tourScroll}`);
  check('body scroll is still locked for the tour', afterEscape.scrollLocked);

  /* And the outer layer still closes properly. */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  check('a second Escape closes the tour', (await page.locator('.tour').count()) === 0);
  check('focus returns to "Show all photos"', await page.evaluate(() => document.activeElement?.classList.contains('hero__show-all')));
  check('body scroll is released once both layers are closed', await page.evaluate(() => document.body.dataset.scrollLocked === undefined));
  check('background is no longer inert', await page.evaluate(() => !document.querySelector('main')?.closest('[inert]')));
  check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

  await page.close();
}

/* --- The other exit, and backdrop click ----------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await openLightboxAt(page, 10);

  await page.evaluate(() => document.querySelector('.lightbox__backdrop').click());
  await page.waitForTimeout(120);
  check(
    'LIGHT-8 backdrop click does NOT close — unresolved, so not guessed',
    (await page.locator('.lightbox').count()) === 1,
  );

  await page.click('.lightbox__exit--tour');
  await page.waitForTimeout(150);
  check(
    'LIGHT-9 "back to all photos" returns to the tour',
    (await page.locator('.lightbox').count()) === 0 && (await page.locator('.tour').count()) === 1,
  );

  await page.close();
}

/* --- Reduced motion ------------------------------------------------------- */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await openLightboxAt(page, 28);
  const motion = await page.evaluate(() => {
    const image = document.querySelector('.lightbox__image');
    return {
      transition: getComputedStyle(image).transitionDuration,
      animation: getComputedStyle(image).animationDuration,
    };
  });
  check(
    'reduced motion leaves no transition on the lightbox image',
    parseFloat(motion.transition) < 0.05 && parseFloat(motion.animation) < 0.05,
    `${motion.transition} / ${motion.animation}`,
  );
  await page.close();
}

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.warn(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? `  (${r.detail})` : ''}`);
}
console.warn(
  `\n${failed === 0 ? 'ALL LIGHTBOX CHECKS PASS' : `${failed} FAILURE(S)`} — ${results.length} assertions`,
);
process.exit(failed === 0 ? 0 : 1);
