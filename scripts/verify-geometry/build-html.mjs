/* Renders the REAL page component tree to static HTML. No mock markup: the
   harness measures the same JSX the app renders. */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadEsbuild, MODULE_PATHS } from './toolchain.mjs';

const require = createRequire(import.meta.url);
const esbuild = loadEsbuild();

/* React resolves from the local tree when one exists, and from the global
   install otherwise — the same fallback as toolchain.mjs, for the same reason. */
const requireFrom = (specifier) => {
  try {
    return require(specifier);
  } catch {
    return require(`${MODULE_PATHS[0]}/${specifier}`);
  }
};

const bundle = await esbuild.build({
  entryPoints: ['src/app/page.tsx'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
  jsx: 'automatic',
  jsxImportSource: 'react',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  alias: { 'next/image': './scripts/verify-geometry/stubs/next-image.tsx' },
  tsconfig: 'tsconfig.json',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  logLevel: 'warning',
});

const code = bundle.outputFiles[0].text;
const Module = require('module');
const mod = new Module('page-bundle');
/* Resolution order for the bundle's `require`: the project's own node_modules
   first, then any global install. `Module._nodeModulePaths` is what Node itself
   walks — there is no `module.paths` to borrow inside an ES module. */
mod.paths = [...Module._nodeModulePaths(process.cwd()), ...MODULE_PATHS];
mod._compile(code, 'page-bundle.js');

const React = requireFrom('react');
const { renderToStaticMarkup } = requireFrom('react-dom/server');

const markup = renderToStaticMarkup(React.createElement(mod.exports.default));

writeFileSync(
  'scripts/verify-geometry/harness.html',
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>StayVista geometry harness</title>
<link rel="stylesheet" href="./harness.css"></head>
<body>${markup}</body></html>`,
);
console.warn(`harness.html written (${markup.length} bytes of markup)`);
