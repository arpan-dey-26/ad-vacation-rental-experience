import { PageShell } from './PageShell';
import { Icon } from '@/components/ui/Icon';

/**
 * Global header.
 *
 * MEASURED: 89px tall (88 + a 1px hairline), full-bleed, inner row capped at
 * 1760px with 80px side padding.
 *
 * **It is not sticky.** Its document y stayed 0 at both `scrollY` 0 and 300, so
 * it scrolls away with the page. That is unusual for this layout and is the
 * single easiest thing to get wrong here — the CSS in `chrome.css` carries the
 * same warning.
 *
 * Server component: nothing here holds state.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <PageShell variant="header" className="site-header__inner">
        <a href="#main" className="site-header__brand" aria-label="StayVista home">
          <Icon name="heart" size={32} filled />
          <span className="visually-hidden">StayVista</span>
        </a>

        {/* The search cluster is presentational at this phase: the reference's
            pills open pickers we have not measured, so they are buttons that
            announce themselves correctly and do nothing yet. */}
        <nav className="site-header__search" aria-label="Search">
          <button type="button" className="text-action">
            Anywhere
          </button>
          <button type="button" className="text-action">
            Anytime
          </button>
          <button type="button" className="text-action">
            Add guests
          </button>
          <button type="button" className="icon-button" aria-label="Search">
            <Icon name="search" size={16} />
          </button>
        </nav>

        <nav className="site-header__actions" aria-label="Account">
          <a href="#main" className="text-action">
            Become a host
          </a>
          <button
            type="button"
            className="icon-button"
            aria-label="Choose a language and currency"
          >
            <Icon name="globe" size={16} />
          </button>
          <button type="button" className="icon-button" aria-label="Main navigation menu">
            <Icon name="menu" size={16} />
          </button>
        </nav>
      </PageShell>
    </header>
  );
}
