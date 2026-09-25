/* ============================================================================
 * StayVista — reference measurement probe
 * ----------------------------------------------------------------------------
 * Run this in the DevTools console ON THE REFERENCE PAGE, in your normal Chrome.
 *
 * It only READS rendered geometry and computed styles. It does not read, copy
 * or export the page's source, its CSS rules, its scripts or its React
 * internals — it records what the browser painted, which is exactly what the
 * assignment permits us to observe.
 *
 * HOW TO RUN
 *   1. Open https://airbnb-clone-umber-two.vercel.app in Chrome.
 *   2. Resize the window so the *viewport* is 1440 wide (the probe prints the
 *      actual width — if it is not 1440, adjust and re-run).
 *   3. F12 → Console. If Chrome asks, type "allow pasting" and press Enter.
 *   4. Paste this whole file, press Enter.
 *   5. It copies the JSON to your clipboard and also offers a file download.
 *      Send me the JSON.
 *
 * Run it THREE times — once per view:
 *   A. listing page as loaded          → save as probe-listing.json
 *   B. after clicking "Show all photos" → save as probe-tour.json
 *   C. after opening a photo in the lightbox → save as probe-lightbox.json
 * ========================================================================== */

(() => {
  const round = (n) => Math.round(n * 10) / 10;

  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: round(r.x),
      y: round(r.y + window.scrollY),
      w: round(r.width),
      h: round(r.height),
    };
  };

  const type = (s) => ({
    family: s.fontFamily,
    size: s.fontSize,
    weight: s.fontWeight,
    line: s.lineHeight,
    tracking: s.letterSpacing,
    color: s.color,
  });

  const box = (s) => ({
    bg: s.backgroundColor,
    border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
    radius: s.borderRadius,
    shadow: s.boxShadow,
    padding: s.padding,
    margin: `${s.marginTop} ${s.marginBottom}`,
    gap: s.gap,
    display: s.display,
    position: s.position,
    overflow: s.overflow,
  });

  const motion = (s) => ({
    transitionProperty: s.transitionProperty,
    transitionDuration: s.transitionDuration,
    transitionTiming: s.transitionTimingFunction,
    transitionDelay: s.transitionDelay,
    animation: [s.animationName, s.animationDuration, s.animationTimingFunction]
      .filter((v) => v && v !== 'none' && v !== '0s')
      .join(' '),
  });

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };

  const out = {
    capturedAt: new Date().toISOString(),
    url: location.href,
    title: document.title,

    /* ---- 1. Viewport ------------------------------------------------- */
    viewport: {
      innerWidth: innerWidth,
      innerHeight: innerHeight,
      dpr: devicePixelRatio,
      scrollbarWidth: innerWidth - document.documentElement.clientWidth,
      documentHeight: document.documentElement.scrollHeight,
      scrollY: Math.round(scrollY),
    },

    /* ---- 2. Root typography and colour ------------------------------- */
    root: (() => {
      const s = getComputedStyle(document.body);
      const h = getComputedStyle(document.documentElement);
      return {
        bodyFont: type(s),
        bodyBackground: s.backgroundColor,
        htmlScrollbarGutter: h.scrollbarGutter,
        fontsLoaded: [...(document.fonts || [])].map(
          (f) => `${f.family} ${f.weight} ${f.style} (${f.status})`,
        ),
      };
    })(),

    /* ---- 3. Container geometry --------------------------------------- */
    /* Every block element that constrains its own width — the page column,
       the tour column and the booking rail all show up here.              */
    containers: [...document.querySelectorAll('div,main,section,header,footer')]
      .filter(visible)
      .map((el) => ({ el, s: getComputedStyle(el) }))
      .filter(
        ({ s }) =>
          (s.maxWidth !== 'none' && parseFloat(s.maxWidth) > 320) ||
          (s.marginLeft === s.marginRight && s.marginLeft !== '0px') ||
          s.position === 'sticky' ||
          s.position === 'fixed',
      )
      .slice(0, 40)
      .map(({ el, s }) => ({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        rect: rect(el),
        maxWidth: s.maxWidth,
        paddingX: [s.paddingLeft, s.paddingRight],
        marginX: [s.marginLeft, s.marginRight],
        position: s.position,
        top: s.top,
        zIndex: s.zIndex,
        display: s.display,
        gridTemplateColumns: s.gridTemplateColumns,
        gridTemplateRows: s.gridTemplateRows,
        gap: s.gap,
        flex: `${s.flexDirection} ${s.flexWrap} ${s.justifyContent} ${s.alignItems}`,
        firstText: (el.textContent || '').trim().slice(0, 60),
      })),

    /* ---- 4. Headings -------------------------------------------------- */
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter(visible)
      .map((el) => {
        const s = getComputedStyle(el);
        return {
          level: el.tagName.toLowerCase(),
          text: el.textContent.trim().slice(0, 120),
          rect: rect(el),
          type: type(s),
          margin: `${s.marginTop} ${s.marginBottom}`,
        };
      }),

    /* ---- 5. Images ---------------------------------------------------- */
    images: [...document.querySelectorAll('img')]
      .filter(visible)
      .map((el) => {
        const s = getComputedStyle(el);
        return {
          src: el.currentSrc || el.src,
          alt: el.alt,
          natural: [el.naturalWidth, el.naturalHeight],
          rect: rect(el),
          aspect: el.getBoundingClientRect().height
            ? round(
                el.getBoundingClientRect().width /
                  el.getBoundingClientRect().height,
              )
            : null,
          objectFit: s.objectFit,
          radius: s.borderRadius,
          loading: el.loading,
          sizes: el.sizes,
          parentRadius: el.parentElement
            ? getComputedStyle(el.parentElement).borderRadius
            : null,
          parentOverflow: el.parentElement
            ? getComputedStyle(el.parentElement).overflow
            : null,
          motion: motion(s),
        };
      }),

    /* ---- 6. Interactive controls -------------------------------------- */
    controls: [
      ...document.querySelectorAll(
        'button,a[href],[role="button"],input,select,textarea,[tabindex]',
      ),
    ]
      .filter(visible)
      .map((el) => {
        const s = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          text: (el.textContent || '').trim().slice(0, 60),
          ariaLabel: el.getAttribute('aria-label'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          href: el.getAttribute('href'),
          tabindex: el.getAttribute('tabindex'),
          disabled: el.disabled || null,
          rect: rect(el),
          type: type(s),
          box: box(s),
          cursor: s.cursor,
          outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
          motion: motion(s),
          hasSvg: !!el.querySelector('svg'),
        };
      }),

    /* ---- 7. Sticky / fixed / layered ---------------------------------- */
    layers: [...document.querySelectorAll('*')]
      .filter(visible)
      .map((el) => ({ el, s: getComputedStyle(el) }))
      .filter(
        ({ s }) =>
          s.position === 'sticky' ||
          s.position === 'fixed' ||
          (s.zIndex !== 'auto' && parseInt(s.zIndex, 10) !== 0),
      )
      .slice(0, 30)
      .map(({ el, s }) => ({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        position: s.position,
        top: s.top,
        bottom: s.bottom,
        zIndex: s.zIndex,
        rect: rect(el),
        bg: s.backgroundColor,
        label: (el.getAttribute('aria-label') || el.textContent || '')
          .trim()
          .slice(0, 50),
      })),

    /* ---- 8. Dialog semantics ------------------------------------------ */
    dialogs: [...document.querySelectorAll('[role="dialog"],dialog,[aria-modal]')]
      .map((el) => {
        const s = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          ariaModal: el.getAttribute('aria-modal'),
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          rect: rect(el),
          bg: s.backgroundColor,
          motion: motion(s),
        };
      }),

    /* ---- 9. Accessibility posture ------------------------------------- */
    a11y: {
      landmarks: [
        ...document.querySelectorAll(
          'header,nav,main,footer,aside,[role="banner"],[role="navigation"],[role="main"],[role="contentinfo"]',
        ),
      ].map((el) => el.tagName.toLowerCase() + (el.getAttribute('role') ? `[${el.getAttribute('role')}]` : '')),
      h1Count: document.querySelectorAll('h1').length,
      imagesWithoutAlt: [...document.querySelectorAll('img')].filter(
        (el) => el.alt === null || el.alt === undefined,
      ).length,
      clickableNonButtons: [
        ...document.querySelectorAll('[onclick],[role="button"]'),
      ].filter((el) => el.tagName !== 'BUTTON' && el.tagName !== 'A').length,
      bodyOverflow: getComputedStyle(document.body).overflow,
      inertOnRoot:
        document.querySelector('main')?.hasAttribute('inert') ||
        document.querySelector('main')?.getAttribute('aria-hidden') ||
        null,
      activeElement: {
        tag: document.activeElement?.tagName,
        label:
          document.activeElement?.getAttribute('aria-label') ||
          document.activeElement?.textContent?.trim().slice(0, 40),
      },
      prefersReducedMotionHonoured: (() => {
        // Does any stylesheet-level reduced-motion handling appear to take effect?
        // We can only observe the current match, not the rules.
        return matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'query currently matches — durations above reflect reduced state'
          : 'query does not match — durations above are the full-motion values';
      })(),
    },

    /* ---- 10. Visible content ------------------------------------------ */
    content: {
      innerText: (document.body.innerText || '').slice(0, 20000),
    },
  };

  const json = JSON.stringify(out, null, 2);

  try {
    copy(out); // DevTools helper — puts it on the clipboard
    console.warn('%c✓ Copied to clipboard.', 'color:#0a0;font-weight:bold');
  } catch {
    console.warn('copy() unavailable — use the download below.');
  }

  const name = `probe-${location.pathname.replace(/\W/g, '') || 'listing'}-${Date.now()}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = name;
  a.textContent = 'download';
  a.click();

  console.warn(`%c✓ Downloading ${name}`, 'color:#0a0;font-weight:bold');
  console.warn(
    `viewport ${out.viewport.innerWidth}×${out.viewport.innerHeight} · ` +
      `${out.images.length} images · ${out.controls.length} controls · ` +
      `${out.headings.length} headings · ${out.dialogs.length} dialogs`,
  );

  return out;
})();
