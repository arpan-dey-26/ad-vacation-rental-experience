import { ShareSaveActions } from './ShareSaveActions';

/**
 * The title row: the page's single `<h1>` plus the Share and Save cluster.
 *
 * MEASURED: the row sits above the gallery, the actions are right-aligned on
 * the same baseline, and each action button is 34px tall. Font size and colour
 * are not measured; the 30px line box is.
 */
export function ListingHeader({ title }: { title: string }) {
  return (
    <div className="listing-header">
      <h1 className="listing-header__title">{title}</h1>
      <div className="listing-header__actions">
        <ShareSaveActions title={title} />
      </div>
    </div>
  );
}
