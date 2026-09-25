import { listing } from '@/data/listing';

import { GalleryProvider } from '@/components/gallery/GalleryProvider';
import { PageShell } from '@/components/layout/PageShell';
import { Section } from '@/components/layout/Section';
import { SectionNav } from '@/components/layout/SectionNav';
import { SiteHeader } from '@/components/layout/SiteHeader';

import { Amenities } from '@/components/listing/Amenities';
import { HeroGallery } from '@/components/listing/HeroGallery';
import { Highlights } from '@/components/listing/Highlights';
import { HostSection } from '@/components/listing/HostSection';
import { ListingDescription } from '@/components/listing/ListingDescription';
import { ListingHeader } from '@/components/listing/ListingHeader';
import { ListingOverview } from '@/components/listing/ListingOverview';
import { LocationSection } from '@/components/listing/LocationSection';
import { PolicySection } from '@/components/listing/PolicySection';
import { Reviews } from '@/components/listing/Reviews';
import { SimilarStays } from '@/components/listing/SimilarStays';
import { SleepingArrangements } from '@/components/listing/SleepingArrangements';

import { StayCalendar } from '@/components/booking/StayCalendar';

import { BookingRail } from '@/components/booking/BookingRail';

/**
 * The listing page.
 *
 * This file composes; it does not render. Every visual decision lives in a
 * section component, and every measured dimension lives in a token — so the
 * page reads as a table of contents, which is what makes a 13-section layout
 * reviewable.
 *
 * Server component. The only client boundaries are GalleryProvider, the hero
 * tiles, the section nav, and the three controls that own their own state.
 */
export default function ListingPage() {
  const heroPhotos = listing.heroPhotoIds
    .map((id) => listing.photos.find((photo) => photo.id === id))
    .filter((photo): photo is NonNullable<typeof photo> => photo !== undefined);

  /* The lightbox navigates one flat index across all 43 photos, so each mosaic
     tile needs its position in that sequence — not its position in the mosaic. */
  const heroIndices = heroPhotos.map((photo) =>
    listing.photos.findIndex((candidate) => candidate.id === photo.id),
  );

  return (
    <GalleryProvider
      photos={listing.photos}
      categories={listing.photoCategories}
      listingTitle={listing.title}
    >
      <SiteHeader />

      <SectionNav
        totalMinor={listing.pricing.totalMinor}
        currency={listing.pricing.currency}
        nights={5}
        rating={listing.rating}
        reviewCount={listing.reviewCount}
      />

      <main id="main">
        <PageShell>
          <ListingHeader title={listing.title} />

          <HeroGallery
            photos={heroPhotos}
            indices={heroIndices}
            totalPhotos={listing.photos.length}
          />

          <div className="listing-body">
            <div className="listing-body__main">
              <Section id="overview" heading={listing.subtitle}>
                <ListingOverview listing={listing} />
              </Section>

              <Section id="highlights" heading="Highlights" headingHidden ruled>
                <Highlights highlights={listing.highlights} />
              </Section>

              <Section id="description" heading="About this place" headingHidden ruled>
                <ListingDescription description={listing.description} />
              </Section>

              <Section id="sleeping" heading="Where you'll sleep" ruled>
                <SleepingArrangements items={listing.sleepingArrangements} />
              </Section>

              <Section id="amenities" heading="What this place offers" ruled>
                <Amenities
                  groups={listing.amenityGroups}
                  totalCount={listing.amenityCount}
                />
              </Section>

              {/* SEC-12: measured as sitting here, in the LEFT column — not in
                  the booking card, which holds only the summary. */}
              <Section id="dates" heading="5 nights in Candolim" ruled>
                <p className="highlight__description">18 Oct 2026 – 23 Oct 2026</p>
                <StayCalendar initialFrom="2026-10-18" initialTo="2026-10-23" />
              </Section>
            </div>

            <BookingRail listing={listing} />

            <Section id="reviews" heading="Reviews" headingHidden ruled wide>
              <Reviews listing={listing} />
            </Section>

            <Section id="location" heading="Where you'll be" ruled wide>
              <LocationSection location={listing.location} />
            </Section>

            <Section id="host" heading="Meet your host" ruled wide>
              <HostSection host={listing.host} />
            </Section>

            <Section id="things-to-know" heading="Things to know" ruled wide>
              <PolicySection houseRules={listing.houseRules} />
            </Section>

            <SimilarStays
              stays={listing.similarStays}
              currency={listing.pricing.currency}
            />
          </div>
        </PageShell>
      </main>

      {/* LAY-6: the reference has NO footer — no `footer` landmark exists and
          its content ends at "More stays nearby". One is deliberately not
          invented here. */}
    </GalleryProvider>
  );
}
