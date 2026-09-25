/**
 * Domain types for the listing experience.
 *
 * These describe the *shape* of a listing, independent of how any section
 * renders it. Components receive these objects; they never own content.
 */

/** A photo as it appears in the hero mosaic, the photo tour and the lightbox. */
export interface Photo {
  /** Stable id used for lightbox deep-linking and React keys. */
  id: string;
  src: string;
  /** Required. Alt text is content, not decoration — it lives with the data. */
  alt: string;
  width: number;
  height: number;
  /** Tiny base64 placeholder; keeps the mosaic from flashing white. */
  blurDataURL?: string;
  /** Id of the `PhotoCategory` this photo belongs to in the photo tour. */
  categoryId: string;
  /**
   * Width this photo occupies in the photo-tour column: `full` spans the whole
   * 458px column, `half` is one of a 223px pair. Measured from the reference;
   * see docs/12-measurements.md § Photo tour.
   */
  span: 'full' | 'half';
  /** Optional per-photo caption shown in the photo tour. */
  caption?: string;
}

/** A card in the "More stays nearby" carousel. */
export interface SimilarStay {
  id: string;
  title: string;
  priceMinor: number;
  rating: number;
  /** Photo for the card; the reference reuses listing photography. */
  image?: string;
}

/** A named group of photos in the photo tour (e.g. "Living room 1"). */
export interface PhotoCategory {
  id: string;
  /** Display name, e.g. "Full kitchen". */
  name: string;
  /** Amenity chips rendered beneath the category name, e.g. "Sofa · Ceiling fan". */
  features: string[];
  /** Photo ids, in tour order. */
  photoIds: string[];
}

export interface AmenityGroup {
  id: string;
  title: string;
  items: Amenity[];
}

export interface Amenity {
  id: string;
  label: string;
  /** Key into the icon registry; never a raw SVG string. */
  icon: IconName;
  /** Struck-through in the reference when a property lacks the amenity. */
  unavailable?: boolean;
}

/** Icon keys are a closed set so a typo is a compile error, not a blank square. */
export type IconName =
  | 'bed'
  | 'bath'
  | 'wifi'
  | 'kitchen'
  | 'tv'
  | 'air-conditioning'
  | 'pool'
  | 'gym'
  | 'parking'
  | 'washer'
  | 'workspace'
  | 'star'
  | 'share'
  | 'heart'
  | 'grid'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'close'
  | 'globe'
  | 'search'
  | 'menu'
  | 'user';

export interface RatingBreakdown {
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  /** e.g. "Mumbai, India" or "3 years on Airbnb". */
  authorMeta: string;
  rating: number;
  /** ISO-8601 date; formatted at render time, never pre-formatted in data. */
  date: string;
  /** Length of the stay, e.g. "Stayed a few nights". */
  stayLength?: string;
  body: string;
}

export interface Host {
  id: string;
  name: string;
  avatar?: string;
  isSuperhost: boolean;
  reviewCount: number;
  rating: number;
  yearsHosting: number;
  responseRate?: string;
  responseTime?: string;
  bio?: string;
  /** Co-hosts shown alongside the primary host. */
  coHosts?: Array<Pick<Host, 'id' | 'name' | 'avatar'>>;
}

export interface LocationInfo {
  /** User-supplied local static map. */
  image?: string;
  /** Human label, e.g. "Candolim, Goa, India". */
  label: string;
  latitude: number;
  longitude: number;
  /** Free-text neighbourhood description. */
  description?: string;
}

export interface HouseRule {
  id: string;
  label: string;
  detail?: string;
}

export interface PriceBreakdownLine {
  id: string;
  label: string;
  /** Minor units (paise) to avoid float drift; formatted at the edge. */
  amountMinor: number;
  /** Rendered struck-through / in green when a discount. */
  kind?: 'base' | 'discount' | 'fee' | 'tax';
}

export interface Pricing {
  currency: 'INR' | 'USD';
  /** Per-night rate in minor units. */
  nightlyMinor: number;
  /** Shown struck through when a promotion is active. */
  originalNightlyMinor?: number;
  minimumNights: number;
  breakdown: PriceBreakdownLine[];
  totalMinor: number;
}

export interface Highlight {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

/** One bed-configuration card in the "Where you'll sleep" row. */
export interface SleepingArrangement {
  id: string;
  room: string;
  detail: string;
  image?: string;
}

export interface Listing {
  id: string;
  title: string;
  /** e.g. "Entire serviced apartment in Candolim, India". */
  subtitle: string;
  /** e.g. "3 guests · 1 bedroom · 1 bed · 1 bathroom" — modelled, not a string. */
  capacity: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  rating: number;
  reviewCount: number;
  ratingBreakdown: RatingBreakdown;
  isGuestFavourite: boolean;
  photos: Photo[];
  photoCategories: PhotoCategory[];
  /** The five photos in the hero mosaic, in mosaic order. */
  heroPhotoIds: string[];
  highlights: Highlight[];
  description: string;
  sleepingArrangements: SleepingArrangement[];
  amenityGroups: AmenityGroup[];
  /** Amenities surfaced in the collapsed "What this place offers" grid. */
  featuredAmenityIds: string[];
  /** Total amenity count, as shown on the "Show all N amenities" control. */
  amenityCount: number;
  /** Category tags under the review summary, e.g. "Hot tub 5". */
  reviewTags: Array<{ id: string; label: string; count: number }>;
  reviews: Review[];
  similarStays: SimilarStay[];
  host: Host;
  location: LocationInfo;
  houseRules: HouseRule[];
  pricing: Pricing;
}
