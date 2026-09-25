/* Token provenance and discipline check.
   Every value in the styling layer should either come from a token or carry an
   explicit provenance marker, and no component should hold a raw colour. */
import { readFileSync, readdirSync } from 'node:fs';

const CSS = ['src/app/globals.css', ...readdirSync('src/styles').map((f) => `src/styles/${f}`)];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.warn(`  FAIL  ${msg}`);
};

const counts = { MEASURED: 0, CALIBRATED: 0, PROVISIONAL: 0 };
for (const file of CSS) {
  const text = readFileSync(file, 'utf8');
  for (const key of Object.keys(counts)) {
    counts[key] += (text.match(new RegExp(`\\[?${key}\\]?`, 'g')) || []).length;
  }

  /* Raw colours are only allowed in the token block. */
  if (file !== 'src/app/globals.css') {
    const hexes = text.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexes) fail(`${file} holds raw colours: ${[...new Set(hexes)].join(', ')}`);
    const rgb = text.match(/\brgba?\(/g);
    if (rgb) fail(`${file} holds raw rgb() values`);
  }

  /* Any literal px outside a comment should be justified by a provenance
     marker on the same line. Block comments are blanked before the scan — they
     document measurements and are full of numbers by design — but the marker
     test reads the ORIGINAL line, since the marker itself lives in a comment. */
  const lines = text.split('\n');
  const codeLines = text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .split('\n');

  for (const [i, codeLine] of codeLines.entries()) {
    const px = codeLine.match(/(?<![\w-])(\d{2,4}(?:\.\d+)?)px/g);
    if (!px) continue;
    if (!/MEASURED|CALIBRATED|PROVISIONAL/.test(lines[i] ?? '')) {
      fail(`${file}:${i + 1} unmarked literal ${px.join(', ')} — ${(lines[i] ?? '').trim().slice(0, 56)}`);
    }
  }
}

/* No component should carry a raw colour or a bare px dimension either. */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  );
for (const file of walk('src/components')) {
  const text = readFileSync(file, 'utf8');
  const hexes = text.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hexes) fail(`${file} holds a raw colour: ${hexes.join(', ')}`);
  if (/style=\{\{/.test(text)) fail(`${file} uses an inline style object`);
}

console.warn(`\n  markers — MEASURED ${counts.MEASURED} · CALIBRATED ${counts.CALIBRATED} · PROVISIONAL ${counts.PROVISIONAL}`);
console.warn(`${failures === 0 ? 'ALL TOKEN CHECKS PASS' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
