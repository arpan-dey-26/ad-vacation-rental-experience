/* Renders docs/architecture/architecture.html to PNG and PDF.

   Uses the Chromium already present for the verification harnesses rather than
   adding a diagramming dependency — the assignment asks for an exported image,
   not for a new tool in package.json. The HTML stays the editable source: change
   it and re-run `npm run docs:architecture`. */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadChromium } from './verify-geometry/toolchain.mjs';

const chromium = loadChromium();

const SOURCE = `file://${resolve('docs/architecture/architecture.html')}`;
const PNG = 'docs/architecture.png';
const PDF = 'docs/architecture.pdf';

mkdirSync('docs', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1720, height: 1400 },
  /* 2× so the PNG stays legible when a reviewer zooms into a service box. */
  deviceScaleFactor: 2,
});

await page.goto(SOURCE, { waitUntil: 'load' });
await page.emulateMedia({ media: 'screen' });

const size = await page.evaluate(() => {
  const sheet = document.querySelector('.sheet');
  return { width: 1720, height: Math.ceil(sheet.getBoundingClientRect().height) + 8 };
});

await page.setViewportSize(size);
await page.screenshot({ path: PNG, fullPage: true });

/* Single page, sized to the diagram, so nothing is split across a page break. */
await page.pdf({
  path: PDF,
  printBackground: true,
  width: `${size.width}px`,
  height: `${size.height}px`,
  pageRanges: '1',
});

await browser.close();
console.warn(`architecture diagram written — ${PNG} and ${PDF} (${size.width} x ${size.height})`);
