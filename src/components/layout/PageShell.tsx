import { cn } from '@/lib/cn';

interface PageShellProps {
  children: React.ReactNode;
  /**
   * The header uses a wider inner cap (1760px) than the content shell (1280px).
   * MEASURED at two viewport widths — see docs/12-measurements.md § Layout.
   */
  variant?: 'content' | 'header';
  as?: 'div' | 'section' | 'nav';
  className?: string;
  id?: string;
  /** Required when `as="nav"` — multiple navs must be distinguishable. */
  label?: string;
}

/**
 * The single place the measured container geometry is expressed.
 *
 * Every horizontally-constrained region on the page goes through this, so the
 * 1280 / 1120 / 80 relationship exists once rather than in a dozen components.
 */
export function PageShell({
  children,
  variant = 'content',
  as: Tag = 'div',
  className,
  id,
  label,
}: PageShellProps) {
  return (
    <Tag
      id={id}
      aria-label={label}
      className={cn(variant === 'header' ? 'shell--header' : 'shell', className)}
    >
      {children}
    </Tag>
  );
}
