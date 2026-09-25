import type { HouseRule } from '@/lib/types';

/** MEASURED: 3 columns of 352px with a 32px gap (3 x 352 + 2 x 32 = 1120). */
export function PolicySection({ houseRules }: { houseRules: HouseRule[] }) {
  return (
    <div className="policies">
      <div>
        <h3 className="highlight__title">Cancellation policy</h3>
        <ul className="policy__list">
          <li>Free cancellation before 17 October.</li>
          <li>Cancel before check-in on 18 October for a partial refund.</li>
        </ul>
        <button type="button" className="description__more">
          Learn more
          <span className="visually-hidden"> about the cancellation policy</span>
        </button>
      </div>

      <div>
        <h3 className="highlight__title">House rules</h3>
        <ul className="policy__list">
          {houseRules.map((rule) => (
            <li key={rule.id}>{rule.label}</li>
          ))}
        </ul>
        <button type="button" className="description__more">
          Learn more
          <span className="visually-hidden"> about the house rules</span>
        </button>
      </div>

      <div>
        <h3 className="highlight__title">Safety &amp; property</h3>
        <ul className="policy__list">
          <li>Carbon monoxide alarm not reported</li>
          <li>Smoke alarm not reported</li>
          <li>Exterior security cameras on property</li>
        </ul>
        <button type="button" className="description__more">
          Learn more
          <span className="visually-hidden"> about safety and property</span>
        </button>
      </div>
    </div>
  );
}
