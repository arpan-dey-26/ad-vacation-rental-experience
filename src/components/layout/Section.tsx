import { cn } from '@/lib/cn';

interface SectionProps {
  /** Anchor target for the section nav. */
  id?: string;
  /** Rendered as the section's <h2> and used to name the landmark. */
  heading?: string;
  /** Hide the heading visually but keep it for assistive tech. */
  headingHidden?: boolean;
  /** Draw the top divider. Which sections have one is LAY-4, unmeasured. */
  ruled?: boolean;
  /** Span the full 1120 rather than sitting in the 652 content column. */
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * One listing section.
 *
 * Every section is a real <section> named by its own heading, so the page reads
 * as a list of landmarks rather than an undifferentiated wall. Sections without
 * a visible heading still get one — hidden — because an unnamed region is worse
 * than a redundant name.
 */
export function Section({
  id,
  heading,
  headingHidden = false,
  ruled = false,
  wide = false,
  className,
  children,
}: SectionProps) {
  const headingId = heading && id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('section', ruled && 'section--ruled', wide && 'section--wide', className)}
    >
      {heading ? (
        <h2
          id={headingId}
          className={cn('section__heading', headingHidden && 'visually-hidden')}
        >
          {heading}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
