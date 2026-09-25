/* Phase 4 photo-tour checks, run against the interactive harness.
   Everything asserted here traces to a MEASURED row in
   docs/12-measurements.md § Photo tour, or to a behaviour recorded in
   docs/VERIFICATION-QUEUE.md (TOUR-2, TOUR-4, TOUR-5, TOUR-6, TOUR-7, TOUR-8).

   The tour only exists after a click, so this cannot run on the static harness.
   Geometry runs at five widths: the three supported desktop sizes plus the two
   the reference was actually captured at. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const URL = `file://${resolve('scripts/verify-geometry/harness-app.html')}`;
const WIDTHS = [1280, 1339, 1440, 1600, 2005];

/* MEASURED: 43 photos in 9 categories, in this order and these counts. */
const CATEGORIES = [
  ['living-room-1', 3],
  ['living-room-2', 7],
  ['full-kitchen', 2],
  ['bedroom', 6],
  ['full-bathroom', 1],
  ['gym', 5],
  ['exterior', 6],
  ['pool', 3],
  ['additional-photos', 10],
];

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });
const near = (actual, expected, tol = 0.5) => Math.abs(actual - expected) <= tol;

const browser = await chromium.launch();

/* --- Geometry, at every supported width ----------------------------------- */
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await page.goto(URL);
  await page.waitForSelector('.hero__show-all', { timeout: 10000 });
  await page.click('.hero__show-all');
  await page.waitForSelector('.tour', { timeout: 5000 });

  const g = await page.evaluate(() => {
    const box = (sel, root = document) => {
      const el = root.querySelector(sel);
      return el ? el.getBoundingClientRect() : null;
    };
    const content = box('.tour__content');
    const scroller = document.querySelector('.tour__scroller');
    const scrollerBox = scroller.getBoundingClientRect();
    const thumbs = [...document.querySelectorAll('.tour__thumb')].map((el) =>
      el.getBoundingClientRect(),
    );
    const photos = [...document.querySelectorAll('.tour__photo')].map((el) =>
      el.getBoundingClientRect(),
    );
    const rows = [...document.querySelectorAll('.tour__row')].map((el) =>
      el.getBoundingClientRect(),
    );
    const blocks = [...document.querySelectorAll('.tour__category')].map((el) =>
      el.getBoundingClientRect(),
    );
    const firstColumn = box('.tour__photos');

    return {
      contentWidth: +content.width.toFixed(1),
      /* Centred inside the scroller's CONTENT box (its client width excludes
         the reserved gutter) — which is the measured rule. The absolute offset
         from the window centre is reported separately: the fixed layer spans
         the ICB, which `scrollbar-gutter: stable` narrows by ~15px (LAY-7). */
      contentCentreOffset: +(
        content.x +
        content.width / 2 -
        (scrollerBox.x + scroller.clientWidth / 2)
      ).toFixed(2),
      windowCentreOffset: +(
        content.x +
        content.width / 2 -
        window.innerWidth / 2
      ).toFixed(2),
      columnWidth: firstColumn ? +firstColumn.width.toFixed(1) : null,
      thumbCount: thumbs.length,
      thumbWidth: thumbs[0] ? +thumbs[0].width.toFixed(1) : null,
      thumbHeight: thumbs[0] ? +thumbs[0].height.toFixed(1) : null,
      thumbHeights: thumbs.map((r) => +r.height.toFixed(1)),
      thumbGapX: thumbs[1] ? +(thumbs[1].x - (thumbs[0].x + thumbs[0].width)).toFixed(1) : null,
      /* The ninth thumbnail starts row two — 8 per row is MEASURED. */
      thumbRow2X: thumbs[8] ? +thumbs[8].x.toFixed(1) : null,
      thumbRow1X: thumbs[0] ? +thumbs[0].x.toFixed(1) : null,
      thumbRowGap: thumbs[8] ? +(thumbs[8].y - (thumbs[0].y + thumbs[0].height)).toFixed(1) : null,
      fullWidth: +photos[0].width.toFixed(1),
      fullHeight: +photos[0].height.toFixed(1),
      halfWidth: +photos[1].width.toFixed(1),
      halfHeight: +photos[1].height.toFixed(1),
      halfGap: +(photos[2].x - (photos[1].x + photos[1].width)).toFixed(1),
      /* Row rhythm inside the first category, and the gap to the next one. */
      rowGap: +(rows[1].y - (rows[0].y + rows[0].height)).toFixed(1),
      categoryGap: +(blocks[1].y - (blocks[0].y + blocks[0].height)).toFixed(1),
      photoCount: photos.length,
      /* Nothing may push the window sideways while the tour is open. */
      docScrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollerOverflowX: scroller.scrollWidth - scroller.clientWidth,
    };
  });

  const tag = `@${width}`;
  check(`${tag} TOUR content block is the measured 976`, near(g.contentWidth, 976), `${g.contentWidth}`);
  check(
    `${tag} content is centred in the scroller content box`,
    Math.abs(g.contentCentreOffset) < 1,
    `${g.contentCentreOffset}px; ${g.windowCentreOffset}px from the window centre — the LAY-7 gutter trade`,
  );
  check(`${tag} TOUR-4 photo column is 458`, near(g.columnWidth, 458), `${g.columnWidth}`);
  check(`${tag} TOUR-4 full photo 458 × 305.3`, near(g.fullWidth, 458) && near(g.fullHeight, 305.3, 0.6), `${g.fullWidth} × ${g.fullHeight}`);
  check(`${tag} TOUR-4 half photo 223 × 148.7`, near(g.halfWidth, 223) && near(g.halfHeight, 148.7, 0.6), `${g.halfWidth} × ${g.halfHeight}`);
  check(`${tag} TOUR-4 half pair gap is 12`, near(g.halfGap, 12), `${g.halfGap}`);
  check(`${tag} TOUR-4b 12px rhythm within a category`, near(g.rowGap, 12), `${g.rowGap}`);
  check(`${tag} TOUR-4b 20px rhythm between categories`, near(g.categoryGap, 20), `${g.categoryGap}`);
  check(`${tag} TOUR-2 thumbnail is 111.5 wide`, near(g.thumbWidth, 111.5), `${g.thumbWidth}`);
  check(`${tag} TOUR-2 one-line thumbnail is 131.2 tall`, near(g.thumbHeight, 131.2, 0.6), `${g.thumbHeight}`);
  check(`${tag} TOUR-2 thumbnail gap is 12`, near(g.thumbGapX, 12), `${g.thumbGapX}`);
  /* The MEASURED label block is 26px for one line and 44px for two, which fits
     one 8px gap plus n × 18px lines exactly. Assert that RULE rather than the
     reference's line count: how many lines a label takes depends on the font,
     and ours is a substitute (R-3). The two-line case is TOUR-2b. */
  check(
    `${tag} TOUR-2 thumbnail heights follow the measured 105.2 + 8 + 18n rule`,
    g.thumbHeights.every((h) => {
      const lines = (h - 105.2 - 8) / 18;
      return Math.abs(lines - Math.round(lines)) < 0.05 && Math.round(lines) >= 1;
    }),
    [...new Set(g.thumbHeights)].join(', '),
  );
  check(`${tag} TOUR-2 strip wraps after 8`, g.thumbRow2X === g.thumbRow1X && near(g.thumbRowGap, 12), `row 2 starts at ${g.thumbRow2X}, gap ${g.thumbRowGap}`);
  check(`${tag} all 43 photos are rendered`, g.photoCount === 43, `${g.photoCount}`);
  check(`${tag} no horizontal page overflow`, g.docScrollWidth <= g.clientWidth, `${g.docScrollWidth} vs ${g.clientWidth}`);
  check(`${tag} no horizontal overflow inside the tour`, g.scrollerOverflowX <= 0, `${g.scrollerOverflowX}`);

  await page.close();
}

/* --- Structure, data and behaviour (one width) ---------------------------- */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
const consoleErrors = [];
const isAbortedAsset = (text) => /ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(text);
page.on('console', (m) => {
  if (m.type() === 'error' && !isAbortedAsset(m.text())) consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

await page.goto(URL);
await page.waitForSelector('.hero__show-all', { timeout: 10000 });
await page.focus('.hero__show-all');
await page.keyboard.press('Enter');
await page.waitForSelector('.tour', { timeout: 5000 });

const opened = await page.evaluate(() => {
  const tour = document.querySelector('.tour');
  return {
    role: tour.getAttribute('role'),
    modal: tour.getAttribute('aria-modal'),
    labelResolves: Boolean(document.getElementById(tour.getAttribute('aria-labelledby'))),
    labelText: document.getElementById(tour.getAttribute('aria-labelledby'))?.textContent,
    focusInside: tour.contains(document.activeElement),
    focusName: document.activeElement?.getAttribute('aria-label'),
    backgroundInert: document.querySelector('main')?.closest('[inert]') !== null,
    scrollLocked: document.body.dataset.scrollLocked === 'true',
    categories: [...document.querySelectorAll('.tour__category')].map((el) => [
      el.id.replace(/^tour-/, ''),
      el.querySelectorAll('.tour__photo').length,
    ]),
    headings: [...document.querySelectorAll('.tour__category-name')].map((el) => el.tagName),
    navName: document.querySelector('.tour__nav')?.getAttribute('aria-label'),
    backName: document.querySelector('.tour__back')?.getAttribute('aria-label'),
    actionNames: [...document.querySelectorAll('.tour__actions button')].map((el) =>
      el.getAttribute('aria-label'),
    ),
    unnamedControls: [...document.querySelectorAll('.tour button')].filter(
      (el) => !el.getAttribute('aria-label') && !el.textContent.trim(),
    ).length,
    clickableNonButtons: [...document.querySelectorAll('.tour [onclick]')].length,
    firstPhotoName: document.querySelector('.tour__photo')?.getAttribute('aria-label'),
  };
});

check('tour is a modal dialog', opened.role === 'dialog' && opened.modal === 'true');
check('tour is labelled by its visible title', opened.labelResolves, opened.labelText ?? '');
check('focus moved into the tour', opened.focusInside, opened.focusName ?? '');
check('TOUR-5 close control is a Back arrow, named', opened.backName === 'Back to listing', opened.backName ?? '');
check('TOUR-5 Share and Save are present and named', opened.actionNames.length === 2 && opened.actionNames.every(Boolean), opened.actionNames.join(' | '));
check('category strip is a named nav landmark', opened.navName === 'Photo categories', opened.navName ?? '');
check('background is inert', opened.backgroundInert);
check('body scroll is locked', opened.scrollLocked);
check('9 categories render, in order, with the measured counts',
  JSON.stringify(opened.categories) === JSON.stringify(CATEGORIES),
  JSON.stringify(opened.categories));
check('every category carries a real heading', opened.headings.length === 9 && opened.headings.every((t) => t === 'H3'));
check('every control in the tour has an accessible name', opened.unnamedControls === 0, `${opened.unnamedControls} unnamed`);
check('no clickable non-button elements', opened.clickableNonButtons === 0);
check('photo buttons name their position in the full sequence',
  /^Open photo 1 of 43: /.test(opened.firstPhotoName ?? ''), opened.firstPhotoName ?? '');

/* E2.3: a hero tile opens the tour too — the reference nests the lightbox
   inside it, so the tour is what mounts. Checked in its own page so the
   "Show all photos" path above is not disturbed. */
{
  const hero = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await hero.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
  await hero.goto(URL);
  await hero.waitForSelector('.hero__tile', { timeout: 10000 });
  await hero.click('.hero__tile--major');
  const viaHero = await hero
    .waitForSelector('.tour', { timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  check('E2.3 a hero tile opens the photo tour', viaHero);
  if (viaHero) {
    /* Two layers to unwind. The first Escape drops the lightbox back onto the
       tour — and focus cannot return to the hero tile there, because that tile
       is inert behind the tour. It lands on the tour's own Back control
       instead, which is what keeps the second Escape reachable at all. */
    await hero.keyboard.press('Escape');
    await hero.waitForTimeout(150);
    check(
      'E2.3 closing the lightbox lands focus inside the tour, not on an inert tile',
      await hero.evaluate(() => {
        const active = document.activeElement;
        return Boolean(active?.closest('.tour')) && !active?.closest('[inert]');
      }),
      await hero.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''),
    );

    await hero.keyboard.press('Escape');
    await hero.waitForTimeout(150);
    check(
      'E2.3 closing the tour returns focus to the hero tile that opened it',
      await hero.evaluate(() =>
        document.activeElement?.classList.contains('hero__tile--major'),
      ),
    );
  }
  await hero.close();
}

/* TOUR-6: a category scrolls; it must not filter. */
const nav = await page.evaluate(() => {
  const scroller = document.querySelector('.tour__scroller');
  const before = scroller.scrollTop;
  const beforeCount = document.querySelectorAll('.tour__photo').length;
  document.querySelectorAll('.tour__thumb')[5].click();
  return { before, beforeCount };
});
/* Smooth scrolling takes as long as it takes, and the scroll-spy only settles
   once it stops — so poll for a stable scrollTop rather than guessing a delay. */
const settle = async (target) => {
  let last = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const now = await target.evaluate(
      () => document.querySelector('.tour__scroller')?.scrollTop ?? -1,
    );
    if (now === last) return now;
    last = now;
    await target.waitForTimeout(100);
  }
  return last;
};
await settle(page);
const afterNav = await page.evaluate(() => {
  const scroller = document.querySelector('.tour__scroller');
  const gym = document.getElementById('tour-gym').getBoundingClientRect();
  const header = document.querySelector('.tour__header').getBoundingClientRect();
  return {
    scrollTop: scroller.scrollTop,
    count: document.querySelectorAll('.tour__photo').length,
    /* The clicked category must clear the pinned header, not hide under it. */
    clearsHeader: gym.top >= header.bottom - 1,
    current: document.querySelector('.tour__thumb[aria-current="true"]')?.textContent?.trim(),
  };
});
check('TOUR-6 selecting a category scrolls', afterNav.scrollTop > nav.before, `${nav.before} → ${afterNav.scrollTop}`);
check('TOUR-6 selecting a category does NOT filter', afterNav.count === nav.beforeCount && afterNav.count === 43, `${afterNav.count} photos still rendered`);
check('scrolled-to category clears the pinned header', afterNav.clearsHeader);
check('the current category is exposed with aria-current', afterNav.current === 'Gym', afterNav.current ?? '');

/* TOUR-7: the header is pinned — it must not move as the tour scrolls. */
const pinned = await page.evaluate(() => {
  const back = document.querySelector('.tour__back').getBoundingClientRect();
  const title = document.querySelector('.tour__title').getBoundingClientRect();
  return { backY: +back.y.toFixed(1), backX: +back.x.toFixed(1), titleY: +title.y.toFixed(1) };
});
check('TOUR-7 header stays pinned while the tour scrolls',
  near(pinned.backX, 24) && near(pinned.backY, 24),
  `Back at (${pinned.backX}, ${pinned.backY}) after scrolling to category 6`);
check('title stays on its measured baseline while scrolled', near(pinned.titleY, 32.6, 1.5), `${pinned.titleY}`);

/* TOUR-8: selecting a photo must keep the tour mounted AND keep its scroll. */
const beforeSelect = await page.evaluate(() => document.querySelector('.tour__scroller').scrollTop);
const selected = await page.evaluate(() => {
  /* Click a photo that is actually on screen. Clicking an off-screen button
     would scroll it into view first, which would be the test moving the tour
     rather than the application. */
  const inView = [...document.querySelectorAll('.tour__photo')].find((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 88 && rect.bottom <= window.innerHeight;
  });
  inView?.click();
  return inView?.getAttribute('aria-label') ?? null;
});
await page.waitForTimeout(150);
const afterSelect = await page.evaluate(() => ({
  stillMounted: Boolean(document.querySelector('.tour')),
  scrollTop: document.querySelector('.tour__scroller')?.scrollTop,
}));
check('TOUR-8 the tour stays mounted when a photo is selected', afterSelect.stillMounted, selected ?? '');
check('TOUR-8 the tour keeps its scroll position', afterSelect.scrollTop === beforeSelect, `${beforeSelect} → ${afterSelect.scrollTop}`);

/* Focus trap and Escape. Escape from the lightbox state returns to the tour;
   a second Escape closes it. */
await page.keyboard.press('Escape');
await page.waitForTimeout(120);
check('Escape from the selected-photo state returns to the tour',
  await page.evaluate(() => Boolean(document.querySelector('.tour'))));

const trapped = await page.evaluate(() => {
  const tour = document.querySelector('.tour');
  const focusable = [...tour.querySelectorAll('button:not([disabled])')];
  focusable[focusable.length - 1]?.focus();
  return tour.contains(document.activeElement);
});
await page.keyboard.press('Tab');
check('Tab from the last control stays inside the tour',
  trapped && (await page.evaluate(() => document.querySelector('.tour').contains(document.activeElement))));

await page.keyboard.press('Escape');
await page.waitForTimeout(150);
check('Escape closes the tour', (await page.locator('.tour').count()) === 0);
check('focus returns to "Show all photos"',
  await page.evaluate(() => document.activeElement?.classList.contains('hero__show-all')));
check('body scroll is released',
  await page.evaluate(() => document.body.dataset.scrollLocked === undefined));
check('background is no longer inert',
  await page.evaluate(() => !document.querySelector('main')?.closest('[inert]')));
check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

await page.close();

/* --- Reduced motion ------------------------------------------------------- */
const reduced = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await reduced.route('**/*.{jpg,jpeg,png,svg,webp,avif}', (route) => route.abort());
await reduced.goto(URL);
await reduced.waitForSelector('.hero__show-all', { timeout: 10000 });
await reduced.click('.hero__show-all');
await reduced.waitForSelector('.tour', { timeout: 5000 });
const motion = await reduced.evaluate(() => {
  const scroller = document.querySelector('.tour__scroller');
  const image = document.querySelector('.tour__image');
  return {
    scrollBehaviour: getComputedStyle(scroller).scrollBehavior,
    transition: getComputedStyle(image).transitionDuration,
  };
});
check('reduced motion disables smooth scrolling in the tour', motion.scrollBehaviour === 'auto', motion.scrollBehaviour);
check('reduced motion collapses tour transitions', parseFloat(motion.transition) < 0.05, motion.transition);
await reduced.close();

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.warn(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? `  (${r.detail})` : ''}`);
}
console.warn(
  `\n${failed === 0 ? 'ALL PHOTO-TOUR CHECKS PASS' : `${failed} FAILURE(S)`} — ${results.length} assertions`,
);
process.exit(failed === 0 ? 0 : 1);
