/* Exercise real local assets on the production build; existing geometry tests
   intentionally abort images and therefore cannot catch missing photo files. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { loadChromium } from './verify-geometry/toolchain.mjs';

const require = createRequire(import.meta.url);
const origin = process.env.ASSET_TEST_URL || 'http://127.0.0.1:3100';
const server = process.env.ASSET_TEST_URL ? null : spawn(process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '-p', '3100', '-H', '127.0.0.1'],
  { stdio: 'inherit' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'production server starts');
  const files = readdirSync('public/images', { recursive: true })
    .filter((file) => /\.(jpe?g|webp|png)$/.test(file));
  for (const file of files) {
    const response = await fetch(`${origin}/images/${file.replaceAll('\\', '/')}`);
    assert.equal(response.status, 200, file);
    assert.ok(response.headers.get('content-type')?.startsWith('image/'), file);
  }
  browser = await loadChromium().launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const badRequests = [];
  const externalImages = [];
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image') {
      if (response.status() >= 400) badRequests.push([response.url(), response.status()]);
      if (!response.url().startsWith(origin)) externalImages.push(response.url());
    }
  });
  await page.goto(origin);
  const loaded = async (selector, count) => {
    await page.waitForFunction(({ selector, count }) => {
      const images = [...document.querySelectorAll(selector)];
      return images.length === count && images.every((image) => image.complete && image.naturalWidth > 0);
    }, { selector, count });
  };
  await loaded('.hero__image', 5);
  for (const selector of ['#sleeping', '#reviews', '#location', '#host', '#similar']) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    if (selector === '#reviews') {
      for (const avatar of await page.locator('.review__avatar').all()) await avatar.scrollIntoViewIfNeeded();
      await loaded('img.review__avatar', 6);
    }
    if (selector === '#host') {
      await loaded('.host__avatar', 1);
      await loaded('.host__cohosts img', 8);
    }
  }
  const backgrounds = await page.locator('.sleeping__image, .similar__card-media, .location__map')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundImage));
  assert.equal(backgrounds.length, 11);
  assert.ok(backgrounds.every((background) => background.includes('/images/')));
  await page.getByRole('button', { name: 'Next stays', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Next stays', exact: true }).isDisabled(), true);
  await page.getByRole('button', { name: 'Previous stays', exact: true }).click();
  await page.getByRole('button', { name: 'Show all photos', exact: true }).click();
  await loaded('.tour__thumb-image', 9);
  for (const photo of await page.locator('.tour__image').all()) await photo.scrollIntoViewIfNeeded();
  await loaded('.tour__image', 43);
  await page.getByRole('button', { name: 'Open photo 1 of 43: Living room 1 — photo 1 of 3', exact: true }).click();
  for (let index = 1; index <= 43; index++) {
    const path = `/images/p${String(index).padStart(2, '0')}.jpeg`;
    await page.waitForFunction((path) => {
      const image = document.querySelector('.lightbox__image');
      return image?.getAttribute('src') === path && image.complete && image.naturalWidth > 0;
    }, path);
    if (index < 43) await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  }
  await page.keyboard.press('ArrowLeft');
  await page.getByRole('button', { name: 'Previous photo', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog', { name: 'Photo viewer', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Back to listing', exact: true }).click();
  assert.deepEqual(badRequests, [], 'no failed image responses');
  assert.deepEqual(externalImages, [], 'no external image responses');
  assert.deepEqual(errors, [], 'no application errors');
  console.warn(`ALL REAL-ASSET CHECKS PASS: ${files.length} HTTP 200 image files; 5 hero, 9 thumbnails, 43 tour, 43 lightbox, 6 reviewer and 8 co-host images; 11 supplied backgrounds; no external/429 image responses.`);
} finally {
  await browser?.close();
  server?.kill();
}
