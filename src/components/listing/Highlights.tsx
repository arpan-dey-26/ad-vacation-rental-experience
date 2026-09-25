import type { Highlight } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

/** MEASURED: 24px icon at the content edge, text starting 48px in. */
export function Highlights({ highlights }: { highlights: Highlight[] }) {
  return (
    <ul className="highlights">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="highlight">
          <Icon name={highlight.icon} className="highlight__icon" />
          <div className="stack">
            <span className="highlight__title">{highlight.title}</span>
            <p className="highlight__description">{highlight.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
