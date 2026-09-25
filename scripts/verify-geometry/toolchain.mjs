/* Resolves the two tools the harnesses need, without hard-coding where they
   live.

   These harnesses were authored in an environment whose npm registry is blocked
   (R-12), so `playwright` and `esbuild` were only ever available as global
   installs. Pointing at that absolute path directly would have shipped a
   machine-specific reference in the submission, which is why this exists: the
   local `node_modules` is tried first, so in a normal networked checkout these
   scripts resolve the ordinary way.

   Neither tool is in `package.json`. They are verification tooling, not
   application dependencies, and the brief's constraint on dependencies is about
   what the product ships. The error below says exactly what to install. */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/* Override with NPM_GLOBAL_MODULES if a global install lives elsewhere. */
const GLOBAL_ROOT = process.env.NPM_GLOBAL_MODULES ?? '/home/claude/.npm-global/lib/node_modules';

function tryRequire(specifiers) {
  for (const specifier of specifiers) {
    try {
      return require(specifier);
    } catch {
      /* Try the next location. */
    }
  }
  return null;
}

export function loadChromium() {
  const playwright = tryRequire([
    'playwright',
    'playwright-core',
    `${GLOBAL_ROOT}/playwright`,
    `${GLOBAL_ROOT}/playwright-core`,
  ]);

  if (!playwright) {
    throw new Error(
      'Playwright is required by the verification harnesses but was not found.\n' +
        '  npm install --no-save playwright && npx playwright install chromium\n' +
        'Or set NPM_GLOBAL_MODULES to the directory holding a global install.',
    );
  }

  return playwright.chromium;
}

export function loadEsbuild() {
  const esbuild = tryRequire([
    'esbuild',
    `${GLOBAL_ROOT}/esbuild`,
    /* tsx bundles its own copy; useful when esbuild is not installed directly. */
    `${GLOBAL_ROOT}/tsx/node_modules/esbuild/lib/main.js`,
  ]);

  if (!esbuild) {
    throw new Error(
      'esbuild is required to build the harness bundles but was not found.\n' +
        '  npm install --no-save esbuild\n' +
        'Or set NPM_GLOBAL_MODULES to the directory holding a global install.',
    );
  }

  return esbuild;
}

/** Where to look for modules when bundling — the local tree, then the global. */
export const MODULE_PATHS = [GLOBAL_ROOT];
