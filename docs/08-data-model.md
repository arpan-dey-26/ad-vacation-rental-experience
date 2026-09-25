# 08 — Data model

Types: `src/lib/types.ts`. Content: `src/data/listing.ts`. Nothing else holds
user-visible copy.

## Shape

```text
Listing
├── identity      id, title, subtitle
├── capacity      { guests, bedrooms, beds, bathrooms }
├── rating        rating, reviewCount, ratingBreakdown, isGuestFavourite
├── photos        Photo[]            ← flat, ordered, the single source
├── photoCategories PhotoCategory[]  ← groups referencing photo ids
├── highlights    Highlight[]
├── description   string
├── amenityGroups AmenityGroup[] + featuredAmenityIds
├── reviews       Review[]
├── host          Host (+ coHosts)
├── location      LocationInfo
├── houseRules    HouseRule[]
└── pricing       Pricing (+ breakdown lines)
```

## Decisions worth defending

**Photos are one flat ordered array; categories reference ids.** The lightbox
navigates a single linear sequence (`←`/`→` across the whole set, per E3.4),
while the photo tour presents the same photos grouped. If categories owned their
photos, the lightbox would need to flatten them on every step and the index
would be derived state that can desync. One array, one index, no desync — which
is interaction invariant 3 in `03-view-interaction-map.md`.

**Capacity is structured, not a string.** `{ guests: 3, bedrooms: 1, … }` rather
than `"3 guests · 1 bedroom · 1 bed · 1 bathroom"`. The renderer builds the list,
which means correct pluralisation, a real `<ul>` for screen readers
(`05-accessibility-plan.md`), and a CSS-generated separator rather than a dot
baked into content.

**Money is integer minor units.** `nightlyMinor: 450000` → `₹4,500`. No float
arithmetic on prices, and formatting happens at the edge via
`src/lib/format.ts`. The same applies to dates: ISO-8601 in data, formatted at
render.

**Alt text is required on `Photo`.** Not optional. A photo cannot be added
without describing it, which is how the alt-text requirement survives contact
with a 40-photo data entry session.

**Icons are a closed union.** `IconName` rather than `string`, so an amenity
referencing a missing icon fails to compile.

**Amenities are grouped, with a separate featured list.** The page shows a
subset in a grid and all of them in a "show all" surface. `featuredAmenityIds`
picks the subset by reference, so an amenity's label and icon are defined once.

## Persistence

None. The data is a static module, imported at build time and server-rendered —
which is what G3 and G4 permit and what keeps the implementation focused.

The only client-side state that could outlive a page load is the Save toggle. It
stays in memory for this build: a heart that remembers itself is not a graded
behaviour, and `localStorage` would add a hydration-mismatch failure mode for no
fidelity gain. If BOOK-4 or the reference shows persistence mattering, it becomes
a `localStorage` read in an effect after mount, never during render.

## Filling it in

`src/data/listing.ts` is currently a typed skeleton — structure final, content
empty. `VERIFICATION-QUEUE.md` items DATA-1 … DATA-6 list exactly what must be
captured from the reference. That capture is the first task of Phase 1, because
every section's layout depends on realistic content volume: a review card sized
around lorem ipsum will be the wrong height for real review text, and a mosaic
tested with five photos will not reveal how the tour behaves with forty.
