#!/usr/bin/env bash
# Run the unchanged validation suite before producing deployable output.
set -euo pipefail
npm run typecheck
npm run lint
npm install --prefix /tmp/stayvista-qa --no-package-lock playwright esbuild
if command -v dnf >/dev/null 2>&1; then
  dnf install -y nss nspr atk at-spi2-atk libXcomposite libXdamage libXrandr mesa-libgbm alsa-lib cups-libs libxkbcommon pango cairo
elif command -v yum >/dev/null 2>&1; then
  yum install -y nss nspr atk at-spi2-atk libXcomposite libXdamage libXrandr mesa-libgbm alsa-lib cups-libs libxkbcommon pango cairo
else
  /tmp/stayvista-qa/node_modules/.bin/playwright install-deps chromium
fi
/tmp/stayvista-qa/node_modules/.bin/playwright install chromium
export NPM_GLOBAL_MODULES=/tmp/stayvista-qa/node_modules
npm run verify:harness
node scripts/verify-image-queue.mjs
npm run build
node scripts/verify-assets.mjs
