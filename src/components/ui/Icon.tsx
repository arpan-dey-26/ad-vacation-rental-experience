import type { IconName } from '@/lib/types';

/**
 * Icon registry.
 *
 * Every path here is hand-drawn geometry of our own. None of the reference's
 * SVG was read or copied — requirement B5 asks for matching icons, and this is
 * how we match them without lifting assets (docs/13-asset-strategy.md).
 *
 * `IconName` is a closed union, so referencing an icon that does not exist is a
 * compile error rather than a blank square.
 */

const PATHS: Record<IconName, string> = {
  bed: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 18v2M21 18v2M7 9V7a1 1 0 0 1 1-1h3v3',
  bath: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2',
  wifi: 'M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01',
  kitchen: 'M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9',
  tv: 'M3 6h18v11H3zM8 21h8M12 17v4',
  'air-conditioning': 'M3 6h18v7H3zM6 16v2M12 16v3M18 16v2M6 9.5h12',
  pool: 'M3 17c1.5 0 1.5 1.5 3 1.5S7.5 17 9 17s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5M7 15V5a2 2 0 0 1 4 0M13 15V5a2 2 0 0 1 4 0M7 9h4M13 9h4',
  gym: 'M4 9v6M8 7v10M16 7v10M20 9v6M8 12h8',
  parking: 'M4 3h16v18H4zM10 17V8h3a2.5 2.5 0 0 1 0 5h-3',
  washer: 'M4 3h16v18H4zM12 8a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM7.5 5.5h.01M11 5.5h.01',
  workspace: 'M3 5h18v10H3zM8 19h8M12 15v4M7 9l2 2-2 2M12 13h4',
  star: 'M12 3.5l2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.9-5.2 2.9 1-6L3.5 9.8l5.9-.8z',
  share: 'M12 15V3M12 3 8 7M12 3l4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  heart:
    'M12 20S3.5 14.4 3.5 8.9A4.4 4.4 0 0 1 12 6.8a4.4 4.4 0 0 1 8.5 2.1C20.5 14.4 12 20 12 20Z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  /* TOUR-5: the tour's close control is an ARROW, not an X — measured as a
     "Back" button, which is a different affordance and a different icon. */
  'arrow-left': 'M20 12H4M4 12l6-6M4 12l6 6',
  close: 'M5 5l14 14M19 5L5 19',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4.5 20a7.5 7.5 0 0 1 15 0',
};

interface IconProps {
  name: IconName;
  /** Square edge length in px. Defaults to the measured 24px highlight size. */
  size?: number;
  /** Filled icons (a saved heart) rather than stroked. */
  filled?: boolean;
  className?: string;
  /**
   * Supply a title only when the icon is the sole carrier of meaning. Inside a
   * labelled button leave it out — the icon is then decorative and is hidden
   * from assistive tech, which is what `aria-hidden` below does.
   */
  title?: string;
}

export function Icon({ name, size = 24, filled = false, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
