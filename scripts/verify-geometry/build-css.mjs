/* Flattens the app's real stylesheets into one plain CSS file the harness can
   load without a Tailwind build. It rewrites only Tailwind-specific syntax
   (@import 'tailwindcss', @theme, @utility); every declaration is the app's
   own, so what the harness measures is what the app ships. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ENTRY = 'src/app/globals.css';

function flatten(file, seen = new Set()) {
  if (seen.has(file)) return '';
  seen.add(file);
  let css = readFileSync(file, 'utf8');

  css = css.replace(/@import\s+'tailwindcss';?\n?/g, '');
  css = css.replace(/@import\s+'([^']+)';?/g, (_match, spec) =>
    flatten(resolve(dirname(file), spec), seen),
  );
  return css;
}

let out = flatten(ENTRY);
out = out.replace(/@theme\s+static\s*\{/g, ':root {').replace(/@theme\s*\{/g, ':root {');
out = out.replace(/@utility\s+([a-z0-9-]+)\s*\{/g, '.$1 {');

writeFileSync('scripts/verify-geometry/harness.css', out);
console.warn(`harness.css written (${out.length} bytes)`);
