/* ============================================================================
 * StayVista — probe 2: computed styles, hover, sticky, reduced motion
 * ----------------------------------------------------------------------------
 * Probe 1 captured geometry and content perfectly, but every computed style
 * came back as an empty string — so we still have no colours, font sizes,
 * weights, radii, borders, shadows or transitions.
 *
 * This probe:
 *   1. SELF-CHECKS getComputedStyle first and tells you immediately whether it
 *      is working. If it isn't, it prints why and stops — don't send a second
 *      empty file.
 *   2. Finds elements by their MEASURED GEOMETRY rather than by class name, so
 *      it needs no knowledge of the reference's implementation.
 *   3. Captures hover states, sticky behaviour and reduced motion, which probe
 *      1 could not reach.
 *
 * It reads rendered style only. No source, CSS rules, scripts or framework
 * internals are read or exported.
 *
 * HOW TO RUN — listing page first, at any desktop width.
 *   1. Open the reference in Chrome. F12 → Console. ("allow pasting" if asked.)
 *   2. Paste this whole file, Enter.
 *   3. Read the SELF-CHECK line it prints. If it says FAILED, tell me what it
 *      says instead of sending the file.
 *   4. It downloads probe2-<state>-<time>.json.
 *
 * Run it on: (a) the plain listing page, (b) the photo tour, (c) the lightbox,
 * (d) the "Show all 50 amenities" dialog. Four files.
 * ========================================================================== */

(async () => {
  /* ---- 0. Self-check --------------------------------------------------- */
  const probeStyle = getComputedStyle(document.body);
  const selfCheck = {
    typeofGCS: typeof getComputedStyle,
    bodyFontSize: probeStyle.fontSize,
    bodyColor: probeStyle.color,
    declarationLength: probeStyle.length,
  };
  const working = Boolean(selfCheck.bodyFontSize && selfCheck.declarationLength > 0);

  console.warn(
    working
      ? '%c✓ SELF-CHECK PASSED — computed styles are readable.'
      : '%c✗ SELF-CHECK FAILED — computed styles are empty here.',
    `color:${working ? '#0a0' : '#c00'};font-weight:bold`,
  );
  console.warn(selfCheck);

  if (!working) {
    console.warn(
      '%cStop here. Try: a normal Chrome window (not Incognito, not a guest\n' +
        'profile), shields/extensions off for this tab, and paste directly into\n' +
        'the Console tab — not a Snippet, not an extension console. Then re-run.',
      'color:#c00',
    );
    return;
  }

  /* ---- helpers --------------------------------------------------------- */
  const r1 = (n) => Math.round(n * 10) / 10;
  const rect = (el) => {
    const b = el.getBoundingClientRect();
    return { x: r1(b.x), y: r1(b.y), w: r1(b.width), h: r1(b.height) };
  };

  const style = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      rect: rect(el),
      font: {
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
        line: s.lineHeight,
        tracking: s.letterSpacing,
        transform: s.textTransform,
      },
      colour: {
        color: s.color,
        background: s.backgroundColor,
        backgroundImage: s.backgroundImage === 'none' ? null : s.backgroundImage,
        opacity: s.opacity,
      },
      edges: {
        border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        borderAll: [
          s.borderTopWidth,
          s.borderRightWidth,
          s.borderBottomWidth,
          s.borderLeftWidth,
        ].join(' '),
        radius: s.borderRadius,
        shadow: s.boxShadow,
        outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
      },
      space: { padding: s.padding, margin: s.margin, gap: s.gap },
      layout: {
        display: s.display,
        position: s.position,
        top: s.top,
        zIndex: s.zIndex,
        overflow: s.overflow,
        gridTemplateColumns: s.gridTemplateColumns,
        gridTemplateRows: s.gridTemplateRows,
        aspectRatio: s.aspectRatio,
        objectFit: s.objectFit,
        flex: `${s.flexDirection} ${s.justifyContent} ${s.alignItems}`,
      },
      motion: {
        property: s.transitionProperty,
        duration: s.transitionDuration,
        timing: s.transitionTimingFunction,
        delay: s.transitionDelay,
        animation: [s.animationName, s.animationDuration, s.animationTimingFunction]
          .filter((v) => v && v !== 'none' && v !== '0s')
          .join(' '),
        willChange: s.willChange,
        filter: s.filter,
        transform: s.transform,
      },
      cursor: s.cursor,
    };
  };

  /* Find an element by what it looks like, not what it is called. */
  const byLabel = (label) =>
    [...document.querySelectorAll('button,a,[role="button"]')].find(
      (el) => (el.getAttribute('aria-label') || el.textContent.trim()) === label,
    ) || null;

  /* Pass `null` for height to match on width alone — used for elements whose
     height depends on content (the shell, the booking card). */
  const byBox = (w, h = null, tol = 2) =>
    [...document.querySelectorAll('*')].find((el) => {
      const b = el.getBoundingClientRect();
      const widthOk = Math.abs(b.width - w) <= tol;
      const heightOk = h === null ? b.height > 0 : Math.abs(b.height - h) <= tol;
      return widthOk && heightOk;
    }) || null;

  const out = {
    capturedAt: new Date().toISOString(),
    url: location.href,
    selfCheck,
    viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, scrollY: scrollY },
    targets: {},
    hover: {},
    sticky: {},
    reducedMotion: null,
    palette: {},
  };

  /* ---- 1. Named targets ------------------------------------------------ */
  /* Geometry from probe 1 (docs/12-measurements.md) locates each one. */
  const targets = {
    html: document.documentElement,
    body: document.body,
    header: document.querySelector('header'),
    main: document.querySelector('main'),
    h1: document.querySelector('h1'),
    h2First: document.querySelector('h2'),
    shell: byBox(1280),
    contentColumn: byBox(1120, 494), // the gallery section
    heroLargeTile: byBox(560, 494),
    heroSmallTile: byBox(272, 243),
    showAllPhotos: byLabel('Show all photos'),
    shareBtn: byLabel('Share'),
    saveBtn: byLabel('Save'),
    reserveBtn: byLabel('Reserve'),
    bookingCard: byBox(372),
    claimBtn: byLabel('Claim'),
    showAllAmenities: byLabel('Show all 50 amenities'),
    showAllReviews: byLabel('Show all 19 reviews'),
    subnavLink: byLabel('Photos'),
    // overlay-only — null on the listing page, which is expected
    tourBack: byLabel('Back'),
    tourThumb: byBox(111.5, 131.2),
    tourFullPhoto: byBox(458, 305.3),
    tourHalfPhoto: byBox(223, 148.7),
    lightboxPrev: byLabel('Previous'),
    lightboxNext: byLabel('Next'),
    lightboxClose: byLabel('Close'),
    amenitiesDialog: document.querySelector('[aria-label="What this place offers"]'),
  };

  for (const [name, el] of Object.entries(targets)) {
    out.targets[name] = el ? style(el) : null;
  }

  /* ---- 2. Hover states ------------------------------------------------- */
  /* Dispatching pointer events does not trigger :hover in Chrome, so this
     records the resting state and lists what still needs a manual look. */
  const hoverList = ['heroLargeTile', 'showAllPhotos', 'saveBtn', 'reserveBtn'];
  out.hover.note =
    ':hover cannot be forced from script. Use DevTools → Elements → :hov → Force ' +
    ':hover on each element below, then re-run this probe and compare.';
  out.hover.resting = Object.fromEntries(
    hoverList.map((k) => [k, out.targets[k] ? out.targets[k] : null]),
  );

  /* ---- 3. Sticky behaviour --------------------------------------------- */
  const stickyProbe = (el, label) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return { label, position: s.position, top: s.top, zIndex: s.zIndex, rect: rect(el) };
  };

  const startY = scrollY;
  out.sticky.atTop = {
    scrollY: startY,
    header: stickyProbe(targets.header, 'header'),
    subnav: stickyProbe(targets.subnavLink?.closest('nav'), 'subnav'),
    bookingCard: stickyProbe(targets.bookingCard, 'bookingCard'),
  };

  /* Scroll through the page and record where things change. */
  const samples = [];
  for (const y of [0, 400, 700, 1000, 1500, 2500, 3500]) {
    window.scrollTo(0, y);
    await new Promise((res) => requestAnimationFrame(() => setTimeout(res, 60)));
    samples.push({
      scrollY: Math.round(scrollY),
      header: targets.header ? rect(targets.header) : null,
      subnav: targets.subnavLink ? rect(targets.subnavLink) : null,
      bookingCard: targets.bookingCard ? rect(targets.bookingCard) : null,
      headerShadow: targets.header ? getComputedStyle(targets.header).boxShadow : null,
      headerBorder: targets.header
        ? getComputedStyle(targets.header).borderBottomColor
        : null,
    });
  }
  out.sticky.samples = samples;
  window.scrollTo(0, startY);

  /* ---- 4. Reduced motion ----------------------------------------------- */
  out.reducedMotion = {
    queryMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    note:
      'If false, enable DevTools → Rendering → Emulate prefers-reduced-motion: ' +
      'reduce, reload, re-run, and compare the motion blocks.',
  };

  /* ---- 5. Palette sweep ------------------------------------------------ */
  /* Every distinct text and background colour actually painted, with a count,
     so the token set is derived from what dominates rather than from guesses. */
  const tally = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  const text = new Map();
  const bg = new Map();
  const radii = new Map();
  const shadows = new Map();
  const transitions = new Map();

  for (const el of document.querySelectorAll('*')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const s = getComputedStyle(el);
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      tally(text, s.color);
    }
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') tally(bg, s.backgroundColor);
    if (s.borderRadius && s.borderRadius !== '0px') tally(radii, s.borderRadius);
    if (s.boxShadow && s.boxShadow !== 'none') tally(shadows, s.boxShadow);
    if (s.transitionDuration && s.transitionDuration !== '0s') {
      tally(transitions, `${s.transitionProperty} | ${s.transitionDuration} | ${s.transitionTimingFunction}`);
    }
  }
  const top = (m, n = 25) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => ({ value: k, count: c }));

  out.palette = {
    textColours: top(text),
    backgrounds: top(bg),
    radii: top(radii),
    shadows: top(shadows),
    transitions: top(transitions, 40),
  };

  /* ---- 6. Emit --------------------------------------------------------- */
  const json = JSON.stringify(out, null, 2);
  const state = location.search.includes('modalItem')
    ? 'lightbox'
    : location.search.includes('PHOTO_TOUR')
      ? 'tour'
      : document.querySelector('[aria-label="What this place offers"]')?.checkVisibility?.()
        ? 'amenities'
        : 'listing';

  try {
    copy(out);
    console.warn('%c✓ Copied to clipboard.', 'color:#0a0;font-weight:bold');
  } catch {
    /* DevTools helper unavailable — the download below still works. */
  }

  const name = `probe2-${state}-${Date.now()}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = name;
  a.click();

  console.warn(`%c✓ Downloading ${name}`, 'color:#0a0;font-weight:bold');
  console.warn(
    `state=${state} · ${out.palette.textColours.length} text colours · ` +
      `${out.palette.radii.length} radii · ${out.palette.transitions.length} transition sets · ` +
      `${out.sticky.samples.length} scroll samples`,
  );
  return out;
})();
