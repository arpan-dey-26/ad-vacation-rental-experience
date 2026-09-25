/* Release QA — the whole application, end to end.
   ----------------------------------------------------------------------------
   The other five harnesses each test one surface in isolation, which is exactly
   why they cannot catch what this one is for: state that leaks between views.
   A scroll lock that never releases, an `inert` attribute left on the page, a
   focus trap that outlives its dialog — none of those show up on the first
   pass. They show up on the third.

   So this drives the real flow, repeatedly, and audits the document between
   every step.

   No production instrumentation was added to make this possible. The scroll
   lock's reference count is module-private and stays that way; what the audit
   reads is its OBSERVABLE consequence — `body[data-scroll-locked]`, which is
   present if and only if the count is above zero. A count stuck at 1 leaves the
   attribute behind; a count driven negative removes it early. Both are visible
   without exposing the counter itself. */
import { resolve } from 'node:path';
import { loadChromium } from './toolchain.mjs';

const chromium = loadChromium();

const URL = `file://${resolve('scripts/verify-geometry/harness-app.html')}`;
const LISTING_SCROLL = 800;
const CYCLES = 3;
const TOTAL = 43;

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });

/* The document-level audit run after every teardown.
   Getting the invariant right took two attempts, and both wrong versions are
   worth recording because they are the usual traps.

   Expecting ZERO inert nodes was wrong: the listing legitimately parks its
   section nav with `inert` so it cannot take focus off-screen, and ships plenty
   of `aria-hidden` decoration (icon SVGs, rating visuals).

   Comparing counts against a BASELINE was also wrong: the baseline is taken at
   scroll 0, and these cycles run at scroll 800, where the section nav has
   revealed itself and correctly dropped both attributes. The count legitimately
   differs.

   The actual invariant is narrower and does not care about scroll position:
   after teardown, nothing the OVERLAYS touched may still be marked. They only
   ever set `inert`, and only on body children — so no inert node may remain
   except the section nav, and `main` must be neither inert nor hidden. */
const RESTING_STATE = () => ({
  tourMounted: document.querySelector('.tour') !== null,
  lightboxMounted: document.querySelector('.lightbox') !== null,
  scrollLocked: document.body.dataset.scrollLocked !== undefined,
  bodyOverflow: getComputedStyle(document.body).overflow,
  inertNodes: document.querySelectorAll('[inert]').length,
  /* Inert nodes that are NOT the deliberately parked section nav. Only the
     overlays produce these, so after teardown there must be none. */
  strayInert: [...document.querySelectorAll('[inert]')]
    .filter((el) => !el.classList.contains('section-nav'))
    .map((el) => el.tagName + (el.className ? `.${String(el.className).split(' ')[0]}` : '')),
  mainInert: document.querySelector('main')?.closest('[inert]') !== null,
  mainHidden: document.querySelector('main')?.getAttribute('aria-hidden') === 'true',
  ariaHiddenNodes: document.querySelectorAll('[aria-hidden="true"]').length,
  openDialogs: document.querySelectorAll('[role="dialog"]').length,
  windowScroll: Math.round(window.scrollY),
  focusIsBody: document.activeElement === document.body || document.activeElement === null,
  focusLabel:
    document.activeElement?.getAttribute('aria-label') ??
    document.activeElement?.textContent?.trim().slice(0, 40) ??
    null,
});

const browser = await chromium.launch();
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

/* Baseline: what a document that has never opened an overlay looks like. */
const baseline = await page.evaluate(RESTING_STATE);
check(
  'baseline: the only inert node is the parked section nav',
  baseline.inertNodes === 1 &&
    (await page.evaluate(
      () => document.querySelector('[inert]')?.classList.contains('section-nav') === true,
    )),
  `${baseline.inertNodes} inert, ${baseline.ariaHiddenNodes} aria-hidden — this is the baseline every teardown is compared against`,
);
check('baseline: no dialog is mounted', baseline.openDialogs === 0);
check('baseline: body is not scroll-locked', !baseline.scrollLocked);

/* ==========================================================================
   A–G. The full cycle, three times over.
   ========================================================================== */
for (let cycle = 1; cycle <= CYCLES; cycle++) {
  const tag = `cycle ${cycle}`;

  /* --- A. Listing → tour ------------------------------------------------- */
  await page.evaluate((y) => window.scrollTo(0, y), LISTING_SCROLL);
  await page.waitForTimeout(80);

  /* Focus the trigger BEFORE recording the position: focusing an off-screen
     control scrolls it into view, and that is the test moving the page, not the
     application. What the app must restore is where the page actually was when
     the overlay opened. */
  await page.focus('.hero__show-all');
  await page.waitForTimeout(80);
  const scrollAtOpen = await page.evaluate(() => Math.round(window.scrollY));
  await page.keyboard.press('Enter');
  await page.waitForSelector('.tour', { timeout: 5000 });

  const opened = await page.evaluate(() => {
    const scroller = document.querySelector('.tour__scroller');
    return {
      focusInTour: document.querySelector('.tour').contains(document.activeElement),
      focusLabel: document.activeElement?.getAttribute('aria-label'),
      listingInert: document.querySelector('main')?.closest('[inert]') !== null,
      scrollLocked: document.body.dataset.scrollLocked === 'true',
      scrollable: scroller.scrollHeight > scroller.clientHeight,
    };
  });
  check(`${tag} A tour opens with focus inside`, opened.focusInTour, opened.focusLabel ?? '');
  check(`${tag} A listing is inert behind the tour`, opened.listingInert);
  check(`${tag} A body scroll is locked`, opened.scrollLocked);
  check(`${tag} A tour is scrollable`, opened.scrollable);

  /* --- B. Tour navigation ------------------------------------------------ */
  const beforeNav = await page.evaluate(() => document.querySelector('.tour__scroller').scrollTop);
  await page.evaluate(() => {
    document.getElementById('tour-exterior')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  await page.waitForTimeout(150);

  const navigated = await page.evaluate(() => {
    const header = document.querySelector('.tour__header').getBoundingClientRect();
    const back = document.querySelector('.tour__back').getBoundingClientRect();
    return {
      scrollTop: document.querySelector('.tour__scroller').scrollTop,
      photoCount: document.querySelectorAll('.tour__photo').length,
      headerTop: +header.y.toFixed(1),
      backX: +back.x.toFixed(1),
      backY: +back.y.toFixed(1),
    };
  });
  check(`${tag} B category scrolls rather than filters`, navigated.photoCount === TOTAL && navigated.scrollTop > beforeNav, `${navigated.photoCount} photos, ${beforeNav} → ${navigated.scrollTop}`);
  check(`${tag} B pinned header is unmoved by the scroll`, navigated.headerTop === 0 && navigated.backX === 24 && navigated.backY === 24, `header y ${navigated.headerTop}, Back (${navigated.backX}, ${navigated.backY})`);

  /* --- C. Tour → lightbox, from a non-zero scroll ------------------------- */
  const tourScroll = navigated.scrollTop;
  const trigger = await page.evaluate(() => {
    const inView = [...document.querySelectorAll('.tour__photo')].find((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 88 && r.bottom <= window.innerHeight;
    });
    inView?.click();
    return {
      label: inView?.getAttribute('aria-label') ?? null,
      index: [...document.querySelectorAll('.tour__photo')].indexOf(inView) + 1,
    };
  });
  await page.waitForSelector('.lightbox', { timeout: 5000 });

  const layered = await page.evaluate(() => ({
    tourMounted: document.querySelector('.tour') !== null,
    tourInert: document.querySelector('.tour')?.closest('[inert]') !== null,
    focusInLightbox: document.querySelector('.lightbox').contains(document.activeElement),
    reachableTourControls: [...document.querySelectorAll('.tour button')].filter(
      (el) => !el.closest('[inert]') && !el.disabled,
    ).length,
    scrollLocked: document.body.dataset.scrollLocked === 'true',
    counter: document.querySelector('.lightbox__counter')?.textContent?.trim(),
    tourScroll: document.querySelector('.tour__scroller').scrollTop,
  }));
  check(`${tag} C lightbox is above a still-mounted tour`, layered.tourMounted && layered.tourInert);
  check(`${tag} C only the lightbox owns focus`, layered.focusInLightbox && layered.reachableTourControls === 0, `${layered.reachableTourControls} tour controls reachable`);
  check(`${tag} C body remains scroll-locked`, layered.scrollLocked);
  check(`${tag} C opens at the photo that was clicked`, layered.counter === `${trigger.index} of ${TOTAL}`, `${layered.counter} from ${trigger.label}`);
  check(`${tag} C tour scroll is untouched by opening`, layered.tourScroll === tourScroll, `${tourScroll} → ${layered.tourScroll}`);

  /* --- D. Lightbox navigation -------------------------------------------- */
  const readCounter = () => page.evaluate(() => document.querySelector('.lightbox__counter')?.textContent?.trim());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(60);
  const afterRight = await readCounter();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(60);
  const afterLeft = await readCounter();
  check(`${tag} D arrow keys step and return`, afterRight === `${trigger.index + 1} of ${TOTAL}` && afterLeft === `${trigger.index} of ${TOTAL}`, `${afterRight} → ${afterLeft}`);
  check(`${tag} D arrow keys never scroll the tour`, (await page.evaluate(() => document.querySelector('.tour__scroller').scrollTop)) === tourScroll);

  /* Ends, by button. A burst in one tick also proves the steps compose. */
  await page.evaluate(() => {
    for (let i = 0; i < 60; i++) document.querySelector('.lightbox__nav--next')?.click();
  });
  await page.waitForTimeout(120);
  const atEnd = await page.evaluate(() => ({
    counter: document.querySelector('.lightbox__counter')?.textContent?.trim(),
    nextDisabled: document.querySelector('.lightbox__nav--next').disabled,
    previousDisabled: document.querySelector('.lightbox__nav--previous').disabled,
    category: document.querySelector('.lightbox__category')?.textContent?.trim(),
  }));
  check(`${tag} D rapid Next stops at ${TOTAL} without wrapping`, atEnd.counter === `${TOTAL} of ${TOTAL}` && atEnd.nextDisabled && !atEnd.previousDisabled, `${atEnd.counter}`);
  check(`${tag} D caption tracks the photo`, atEnd.category === 'Additional photos', atEnd.category ?? '');

  await page.evaluate(() => {
    for (let i = 0; i < 60; i++) document.querySelector('.lightbox__nav--previous')?.click();
  });
  await page.waitForTimeout(120);
  const atStart = await page.evaluate(() => ({
    counter: document.querySelector('.lightbox__counter')?.textContent?.trim(),
    previousDisabled: document.querySelector('.lightbox__nav--previous').disabled,
    nextDisabled: document.querySelector('.lightbox__nav--next').disabled,
    category: document.querySelector('.lightbox__category')?.textContent?.trim(),
  }));
  check(`${tag} D rapid Previous stops at 1 without wrapping`, atStart.counter === `1 of ${TOTAL}` && atStart.previousDisabled && !atStart.nextDisabled, `${atStart.counter}`);
  check(`${tag} D caption tracks back to the first category`, atStart.category === 'Living room 1', atStart.category ?? '');

  /* --- E. Lightbox close ------------------------------------------------- */
  /* Alternate the two close routes across cycles so both are exercised. */
  if (cycle % 2 === 1) {
    await page.keyboard.press('Escape');
  } else {
    await page.click('.lightbox__exit--close');
  }
  await page.waitForTimeout(150);

  const afterLightboxClose = await page.evaluate(() => ({
    lightboxGone: document.querySelector('.lightbox') === null,
    tourPresent: document.querySelector('.tour') !== null,
    tourActive: document.querySelector('.tour')?.closest('[inert]') === null,
    focusLabel: document.activeElement?.getAttribute('aria-label'),
    tourScroll: document.querySelector('.tour__scroller').scrollTop,
    scrollLocked: document.body.dataset.scrollLocked === 'true',
  }));
  check(`${tag} E ${cycle % 2 === 1 ? 'Escape' : 'Close'} closes only the lightbox`, afterLightboxClose.lightboxGone && afterLightboxClose.tourPresent);
  check(`${tag} E tour owns focus again`, afterLightboxClose.tourActive);
  check(`${tag} E focus returns to the exact trigger`, afterLightboxClose.focusLabel === trigger.label, `${afterLightboxClose.focusLabel}`);
  check(`${tag} E tour scroll is unchanged`, afterLightboxClose.tourScroll === tourScroll, `${tourScroll} → ${afterLightboxClose.tourScroll}`);
  check(`${tag} E body is still locked for the tour`, afterLightboxClose.scrollLocked);

  /* --- F. Tour close ------------------------------------------------------ */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  const resting = await page.evaluate(RESTING_STATE);
  check(`${tag} F listing returns, both overlays unmounted`, !resting.tourMounted && !resting.lightboxMounted);
  check(`${tag} F listing scroll position is restored`, resting.windowScroll === scrollAtOpen, `opened at ${scrollAtOpen}, returned to ${resting.windowScroll}`);
  check(`${tag} F focus returns to "Show all photos"`, await page.evaluate(() => document.activeElement?.classList.contains('hero__show-all')), resting.focusLabel ?? '');
  check(`${tag} F scroll lock has fully released`, !resting.scrollLocked && resting.bodyOverflow !== 'hidden', `overflow: ${resting.bodyOverflow}`);
  check(`${tag} F no stray inert node is left behind`, resting.strayInert.length === 0, resting.strayInert.join(', '));
  check(`${tag} F the listing is reachable again`, !resting.mainInert && !resting.mainHidden);
  check(`${tag} F no dialog is left mounted`, resting.openDialogs === 0, `${resting.openDialogs} left`);
  check(`${tag} F focus is not stranded on <body>`, !resting.focusIsBody);
}

/* ==========================================================================
   17. The other entry paths.
   ========================================================================== */

/* Hero tile → the nested tour+lightbox the captured URLs describe. */
await page.evaluate((y) => window.scrollTo(0, y), 0);
await page.waitForTimeout(80);
await page.click('.hero__tile--major');
await page.waitForSelector('.lightbox', { timeout: 5000 });
const viaHero = await page.evaluate(() => ({
  tourMounted: document.querySelector('.tour') !== null,
  tourScroll: document.querySelector('.tour__scroller')?.scrollTop,
  counter: document.querySelector('.lightbox__counter')?.textContent?.trim(),
  focusInLightbox: document.querySelector('.lightbox').contains(document.activeElement),
}));
check('hero tile opens the lightbox WITH the tour beneath it', viaHero.tourMounted && viaHero.focusInLightbox);
check('the tour beneath a hero-opened lightbox is at scroll 0, as captured', viaHero.tourScroll === 0, `${viaHero.tourScroll}`);
check('hero tile opens at the photo it depicts', viaHero.counter === '7 of 43', `${viaHero.counter} (hero tile 1 is tour photo 7)`);

/* Unwind both layers from that path and re-audit. */
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
const heroMid = await page.evaluate(() => ({
  tourPresent: document.querySelector('.tour') !== null,
  focusInTour: document.querySelector('.tour')?.contains(document.activeElement),
}));
check('closing a hero-opened lightbox lands focus inside the tour', heroMid.tourPresent && heroMid.focusInTour);

await page.keyboard.press('Escape');
await page.waitForTimeout(200);
const heroRest = await page.evaluate(RESTING_STATE);
check('hero path leaves no stray inert node behind', heroRest.strayInert.length === 0, heroRest.strayInert.join(', '));
check('hero path releases the scroll lock', !heroRest.scrollLocked);
check('hero path restores focus to the hero tile', await page.evaluate(() => document.activeElement?.classList.contains('hero__tile--major')));

/* Tour thumbnail (category strip) → scrolls, and the tour photo → lightbox. */
await page.click('.hero__show-all');
await page.waitForSelector('.tour', { timeout: 5000 });
await page.evaluate(() => document.querySelectorAll('.tour__thumb')[3]?.click());
/* Poll for a stable scrollTop: the scroll-spy only settles once the smooth
   scroll stops, and guessing a delay reads a category mid-flight. */
for (let attempt = 0, last = -1; attempt < 40; attempt++) {
  const now = await page.evaluate(() => document.querySelector('.tour__scroller')?.scrollTop ?? -1);
  if (now === last) break;
  last = now;
  await page.waitForTimeout(100);
}
const viaThumb = await page.evaluate(() => ({
  current: document.querySelector('.tour__thumb[aria-current="true"]')?.textContent?.trim(),
  photoCount: document.querySelectorAll('.tour__photo').length,
}));
check('category thumbnail marks itself current and does not filter', viaThumb.current === 'Bedroom' && viaThumb.photoCount === TOTAL, `${viaThumb.current}, ${viaThumb.photoCount} photos`);

await page.keyboard.press('Escape');
await page.waitForTimeout(200);

/* ==========================================================================
   Final document audit.
   ========================================================================== */
const final = await page.evaluate(RESTING_STATE);
check('final: no overlay is mounted', !final.tourMounted && !final.lightboxMounted);
check('final: scroll lock is released', !final.scrollLocked, `overflow: ${final.bodyOverflow}`);
check('final: no stray inert node remains anywhere', final.strayInert.length === 0, final.strayInert.join(', '));
check('final: the listing is neither inert nor aria-hidden', !final.mainInert && !final.mainHidden);
check(
  'final: the only inert node is the parked section nav',
  final.inertNodes <= 1 && final.strayInert.length === 0,
  `${final.inertNodes} inert, ${final.ariaHiddenNodes} aria-hidden decorations (legitimate, and scroll-dependent)`,
);
check('final: no dialog remains in the accessibility tree', final.openDialogs === 0);
check('final: focus is on a real element', !final.focusIsBody, final.focusLabel ?? '');
check('final: no horizontal page overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
check('no console errors across the whole session', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.warn(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? `  (${r.detail})` : ''}`);
}
console.warn(
  `\n${failed === 0 ? 'ALL RELEASE QA CHECKS PASS' : `${failed} FAILURE(S)`} — ${results.length} assertions over ${CYCLES} full cycles`,
);
process.exit(failed === 0 ? 0 : 1);
