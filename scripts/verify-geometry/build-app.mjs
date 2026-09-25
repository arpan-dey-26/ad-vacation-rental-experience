/* Builds an INTERACTIVE harness: the real component tree, hydrated in the
   browser, so Phase 3 interaction and focus behaviour can be measured.
   The static harness (build-html.mjs) stays for geometry — it renders faster
   and isolates layout from runtime. */
import { writeFileSync } from 'node:fs';
import { loadEsbuild, MODULE_PATHS } from './toolchain.mjs';

const esbuild = loadEsbuild();

const result = await esbuild.build({
  entryPoints: ['scripts/verify-geometry/stubs/entry.tsx'],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  jsxImportSource: 'react',
  alias: { 'next/image': './scripts/verify-geometry/stubs/next-image.tsx' },
  nodePaths: MODULE_PATHS,
  define: { 'process.env.NODE_ENV': '"development"' },
  tsconfig: 'tsconfig.json',
  logLevel: 'warning',
});

writeFileSync('scripts/verify-geometry/harness-app.js', result.outputFiles[0].text);
writeFileSync(
  'scripts/verify-geometry/harness-app.html',
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>StayVista interaction harness</title>
<link rel="stylesheet" href="./harness.css"></head>
<body><div id="root"></div><script src="./harness-app.js"></script></body></html>`,
);
console.warn(`harness-app.js written (${result.outputFiles[0].text.length} bytes)`);
