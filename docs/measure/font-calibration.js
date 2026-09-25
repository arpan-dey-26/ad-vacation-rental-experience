/* ============================================================================
 * StayVista — font substitution calibration
 * ----------------------------------------------------------------------------
 * The reference sets its type in Airbnb Cereal VF, which is proprietary and
 * which we have decided not to bundle or reference (docs/11-risks.md R-3). We
 * set ours in Inter instead.
 *
 * Different glyphs means the same string sets at a different width. Left alone,
 * every heading, button and chip drifts a few pixels and text wraps in the
 * wrong places — which is exactly the kind of error a fidelity review catches.
 *
 * This measures the correction factor. Run it ON THE REFERENCE PAGE.
 *
 * It reads rendered text metrics only. It does not read, copy or export the
 * page's source, CSS, scripts or fonts.
 *
 * HOW TO RUN
 *   1. Open the reference in Chrome. F12 → Console. ("allow pasting" if asked.)
 *   2. Paste this whole file, Enter.
 *   3. It prints a `--font-size-adjust` value and copies the full result.
 *      Send me that number, or the JSON.
 * ========================================================================== */

(async () => {
  /* Load Inter the same way our app does, so we compare like with like. */
  const INTER_CSS =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap';

  if (!document.querySelector(`link[href^="${INTER_CSS.slice(0, 40)}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = INTER_CSS;
    document.head.appendChild(link);
  }

  try {
    await document.fonts.load('400 16px Inter');
    await document.fonts.load('600 16px Inter');
    await document.fonts.ready;
  } catch {
    console.warn('Inter did not load; the comparison below will be wrong.');
  }

  /* ---- Measure the reference's own rendering --------------------------- */
  const probes = [
    { key: 'h1', el: document.querySelector('h1') },
    { key: 'h2', el: document.querySelector('h2') },
    {
      key: 'button',
      el: [...document.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === 'Show all photos',
      ),
    },
    {
      key: 'body',
      el: [...document.querySelectorAll('p,div')].find(
        (n) =>
          n.childNodes.length === 1 &&
          n.childNodes[0].nodeType === 3 &&
          n.textContent.trim().length > 60,
      ),
    },
  ].filter((p) => p.el);

  /* Width of just the text, not the box: a Range measures the glyphs. */
  const textWidth = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return Math.round(range.getBoundingClientRect().width * 100) / 100;
  };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const results = probes.map(({ key, el }) => {
    const s = getComputedStyle(el);
    const text = el.textContent.trim();
    const reference = textWidth(el);

    /* Set the identical string in Inter at the identical size and weight. */
    ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize}/${s.lineHeight} Inter`;
    const substitute = Math.round(ctx.measureText(text).width * 100) / 100;

    return {
      key,
      text: text.slice(0, 60),
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      referenceWidth: reference,
      interWidth: substitute,
      ratio: substitute ? Math.round((reference / substitute) * 10000) / 10000 : null,
    };
  });

  const ratios = results.map((r) => r.ratio).filter((n) => n && isFinite(n));
  const mean = ratios.length
    ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 1000) / 1000
    : null;

  /* ---- Vertical metrics, for ascent/descent overrides ------------------- */
  const metrics = (() => {
    const s = getComputedStyle(document.body);
    ctx.font = `400 100px ${s.fontFamily}`;
    const ref = ctx.measureText('Hxg');
    ctx.font = '400 100px Inter';
    const sub = ctx.measureText('Hxg');
    const grab = (m) => ({
      ascent: m.actualBoundingBoxAscent,
      descent: m.actualBoundingBoxDescent,
      fontAscent: m.fontBoundingBoxAscent,
      fontDescent: m.fontBoundingBoxDescent,
    });
    return { referenceAt100px: grab(ref), interAt100px: grab(sub) };
  })();

  const out = {
    capturedAt: new Date().toISOString(),
    url: location.href,
    referenceFonts: [...document.fonts].map(
      (f) => `${f.family} ${f.weight} ${f.style} (${f.status})`,
    ),
    samples: results,
    recommendedFontSizeAdjust: mean,
    verticalMetrics: metrics,
  };

  console.warn(
    `%c--font-size-adjust: ${mean}`,
    'color:#0a0;font-weight:bold;font-size:15px',
  );
  console.warn(results);
  console.warn(out);

  try {
    copy(out);
    console.warn('%c✓ Copied to clipboard.', 'color:#0a0');
  } catch {
    /* clipboard helper unavailable */
  }

  return out;
})();
