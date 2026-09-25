import type { Listing } from '@/lib/types';
import { photoCategories, photos } from './photos';

/**
 * Listing content, captured from the reference on 2026-09-18.
 *
 * Every string here was read from the rendered page (capture C in
 * docs/measure/captures/). Nothing is invented. Where the reference shows only
 * a subset — six of nineteen reviews, ten of fifty amenities — only that subset
 * is recorded, and the queue item that would complete it is noted in
 * docs/VERIFICATION-QUEUE.md.
 *
 * Content lives here, never inside JSX.
 */
export const listing: Listing = {
  id: 'mirashya-ug10',
  title: 'Romantic Jacuzzi 1BHK Candolim | Mirashya UG10',
  subtitle: 'Entire serviced apartment in Candolim, India',
  capacity: { guests: 3, bedrooms: 1, beds: 1, bathrooms: 1 },

  rating: 4.95,
  reviewCount: 19,
  // Measured: the six category rows under "Overall rating".
  ratingBreakdown: {
    cleanliness: 5.0,
    accuracy: 5.0,
    checkIn: 5.0,
    communication: 5.0,
    location: 4.8,
    value: 4.8,
  },
  isGuestFavourite: true,

  photos,
  photoCategories,

  /**
   * Hero mosaic selection. NOT the first five tour photos — the reference picks
   * tour photos 7, 4, 5, 13 and 29 (docs/12-measurements.md § Hero gallery).
   */
  heroPhotoIds: ['p07', 'p04', 'p05', 'p13', 'p29'],

  highlights: [
    {
      id: 'outdoor',
      icon: 'pool',
      title: 'Outdoor entertainment',
      description: 'The pool and alfresco dining are great for summer trips.',
    },
    {
      id: 'cooling',
      icon: 'air-conditioning',
      title: 'Designed for staying cool',
      description: 'Beat the heat with the A/C and ceiling fan.',
    },
    {
      id: 'self-checkin',
      icon: 'user',
      title: 'Self check-in',
      description: 'You can check in with the building staff.',
    },
  ],

  description:
    '🌴 Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! ✨ Stay in this cozy 1BHK in the heart of Candolim, featuring a private jacuzzi 🛁 for the perfect unwind. Enjoy high-speed WiFi 💻, Smart TV 📺, pet-friendly comfort 🐾, and stylish interiors. Just minutes from Candolim Beach 🏖️, popular cafés, restaurants, and nightlife 🍹, it’s ideal for couples seeking romance, relaxation, and a touch of luxury in North Goa. ❤️🌴',

  sleepingArrangements: [
    { id: 'bedroom', image: '/images/p13.jpeg', room: 'Bedroom', detail: '1 double bed' },
    {
      id: 'living-room',
      image: '/images/p01.jpeg',
      room: 'Living room',
      detail: '1 sofa',
    },
  ],

  /**
   * The ten amenities shown in the collapsed grid. The reference's "Show all 50
   * amenities" dialog groups them under twelve headings — those headings are
   * recorded below; their individual items are queue item DATA-2.
   */
  featuredAmenityIds: [
    'kitchen',
    'wifi',
    'workspace',
    'parking',
    'pool',
    'hot-tub',
    'pets',
    'cameras',
    'co-alarm',
    'smoke-alarm',
  ],
  amenityCount: 50,
  amenityGroups: [
    {
      id: 'featured',
      title: 'Featured',
      items: [
        { id: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
        { id: 'wifi', label: 'Wifi', icon: 'wifi' },
        { id: 'workspace', label: 'Dedicated workspace', icon: 'workspace' },
        { id: 'parking', label: 'Free parking on premises', icon: 'parking' },
        { id: 'pool', label: 'Pool', icon: 'pool' },
        { id: 'hot-tub', label: 'Hot tub', icon: 'bath' },
        { id: 'pets', label: 'Pets allowed', icon: 'user' },
        {
          id: 'cameras',
          label: 'Exterior security cameras on property',
          icon: 'star',
        },
        { id: 'co-alarm', label: 'Carbon monoxide alarm', icon: 'star' },
        { id: 'smoke-alarm', label: 'Smoke alarm', icon: 'star' },
      ],
    },
    // Group headings measured from the "What this place offers" dialog.
    { id: 'bathroom', title: 'Bathroom', items: [] },
    { id: 'bedroom-laundry', title: 'Bedroom and laundry', items: [] },
    { id: 'entertainment', title: 'Entertainment', items: [] },
    { id: 'family', title: 'Family', items: [] },
    { id: 'heating-cooling', title: 'Heating and cooling', items: [] },
    { id: 'home-safety', title: 'Home safety', items: [] },
    { id: 'internet-office', title: 'Internet and office', items: [] },
    { id: 'kitchen-dining', title: 'Kitchen and dining', items: [] },
    { id: 'location-features', title: 'Location features', items: [] },
    { id: 'outdoor', title: 'Outdoor', items: [] },
    { id: 'parking-facilities', title: 'Parking and facilities', items: [] },
    { id: 'services', title: 'Services', items: [] },
  ],

  reviewTags: [
    { id: 'comfort', label: 'Comfort', count: 6 },
    { id: 'accuracy', label: 'Accuracy', count: 5 },
    { id: 'hot-tub', label: 'Hot tub', count: 5 },
    { id: 'condition', label: 'Condition', count: 4 },
    { id: 'hospitality', label: 'Hospitality', count: 8 },
    { id: 'cleanliness', label: 'Cleanliness', count: 4 },
    { id: 'amenities', label: 'Amenities', count: 2 },
    { id: 'decor', label: 'Decor', count: 2 },
    { id: 'indoor-spaces', label: 'Indoor spaces', count: 2 },
    { id: 'location', label: 'Location', count: 2 },
  ],

  // The six review cards the reference renders before "Show all 19 reviews".
  reviews: [
    {
      id: 'r1',
      authorAvatar: '/images/avatars/review-r1.webp',
      authorName: 'Amit',
      authorMeta: '2 months on Airbnb',
      rating: 5,
      date: '2026-09-11',
      body: 'Very helpful and responsive team. Safe and peaceful stay. loved everything about the property.',
    },
    {
      id: 'r2',
      authorAvatar: '/images/avatars/review-r2.webp',
      authorName: 'Aheesh',
      authorMeta: '3 years on Airbnb',
      rating: 5,
      date: '2026-09-04',
      body: 'We had a wonderful stay. The apartment was clean, comfortable, and exactly as shown in the photos. The host was very responsive and helpful throughout our stay. We would definitely recommend this place and would love to stay here again.',
    },
    {
      id: 'r3',
      authorAvatar: '/images/avatars/review-r3.webp',
      authorName: 'Samiksha',
      authorMeta: '8 months on Airbnb',
      rating: 5,
      date: '2026-05-01',
      body: 'the host nitish was really great help',
    },
    {
      id: 'r4',
      authorAvatar: '/images/avatars/review-r4.webp',
      authorName: 'Vedant',
      authorMeta: '4 years on Airbnb',
      rating: 5,
      date: '2026-05-01',
      body: 'We had an amazing stay at this property in Goa! The entire home was spotless and exceptionally well-maintained, making us feel comfortable from the moment we arrived. The cleanliness standards were truly impressive, with every corner of the house looking fresh and pristine.\nThe highlight of our stay was definitely the jacuzzi. It was clean, well-kept, and the perfect place to relax after a day of exploring Goa. It added a luxurious touch to our vacation and made our experience even more memorable.\nThe property was exactly as described, well-equipped, and offered a peaceful atmosphere. We would highly recommend this place to anyone looking for a comfortable, clean, and relaxing stay in Goa. Looking forward to visiting again!',
    },
    {
      id: 'r5',
      authorAvatar: '/images/avatars/review-r5.webp',
      authorName: 'Vaibhav S',
      authorMeta: '3 years on Airbnb',
      rating: 5,
      date: '2026-05-01',
      body: "Great great experience living out there , can't expect more , will always look for it in the future and will recommend my friends too.",
    },
    {
      id: 'r6',
      authorAvatar: '/images/avatars/review-r6.webp',
      authorName: 'Mohd',
      authorMeta: '5 years on Airbnb',
      rating: 5,
      date: '2026-05-01',
      body: 'Great place. Exactly as described in the listing.',
    },
  ],

  host: {
    id: 'mirashya-homes',
    name: 'Mirashya Homes',
    avatar: '/images/mirashya-homes-logo.jpeg',
    isSuperhost: false,
    reviewCount: 1463,
    rating: 4.68,
    yearsHosting: 2,
    responseRate: '100%',
    responseTime: 'Responds within an hour',
    bio: 'Born in the 80s · Where I went to school: NICMAR GOA',
    coHosts: [
      { id: 'sharath', avatar: '/images/avatars/cohost-sharath.webp', name: 'Sharath' },
      { id: 'aman', avatar: '/images/avatars/cohost-aman.webp', name: 'Aman Dev Pahwa' },
      {
        id: 'maria',
        avatar: '/images/avatars/cohost-maria.webp',
        name: 'Maria Karen Priyanka',
      },
      { id: 'simran', avatar: '/images/avatars/cohost-simran.webp', name: 'Simran' },
      { id: 'pallavi', avatar: '/images/avatars/cohost-pallavi.webp', name: 'Pallavi' },
      {
        id: 'sanyukta',
        avatar: '/images/avatars/cohost-sanyukta.webp',
        name: 'Sanyukta',
      },
      { id: 'shruti', avatar: '/images/avatars/cohost-shruti.webp', name: 'Shruti' },
      { id: 'amisha', avatar: '/images/avatars/cohost-amisha.webp', name: 'Amisha' },
    ],
  },

  location: {
    image: '/images/candolim-map.jpg',
    label: 'Candolim, Goa, India',
    // The reference renders an interactive map with zoom controls; it does not
    // expose coordinates in the DOM. Queue item SEC-8b.
    latitude: 0,
    longitude: 0,
    description:
      'Located in the heart of Candolim, Amor de Goa offers a peaceful stay with easy access to beaches, cafés, and popular attractions.',
  },

  houseRules: [
    { id: 'checkin', label: 'Check-in after 2:00 pm' },
    { id: 'checkout', label: 'Checkout before 11:00 am' },
    { id: 'guests', label: '3 guests maximum' },
  ],

  pricing: {
    currency: 'INR',
    // ₹28,499 for 5 nights (18–23 Oct 2026). The reference shows the total, not
    // a nightly rate; the nightly figure below is the total divided by nights
    // and is NOT displayed anywhere in the UI.
    nightlyMinor: 569980,
    minimumNights: 1,
    breakdown: [
      { id: 'total', label: '₹28,499 for 5 nights', amountMinor: 2849900, kind: 'base' },
    ],
    totalMinor: 2849900,
  },

  similarStays: [
    {
      id: 's1',
      image: '/images/nearby-s1.jpeg',
      title: 'Beautiful Studio with a view to die for',
      priceMinor: 2360000,
      rating: 4.91,
    },
    {
      id: 's2',
      image: '/images/nearby-s2.jpeg',
      title: 'NAQAB - 1bhk with private pool',
      priceMinor: 4221800,
      rating: 4.95,
    },
    {
      id: 's3',
      image: '/images/nearby-s3.jpeg',
      title: 'Greentique Luxury Flat with plunge pool, Calangute',
      priceMinor: 4450600,
      rating: 4.94,
    },
    {
      id: 's4',
      image: '/images/nearby-s4.jpeg',
      title: 'The Tropical Studio | 5 mins to Beach',
      priceMinor: 2282400,
      rating: 4.96,
    },
    {
      id: 's5',
      image: '/images/nearby-s5.jpeg',
      title: 'Luxury Casa Bella 1BHK with plunge pool, Calangute',
      priceMinor: 3994200,
      rating: 4.95,
    },
    {
      id: 's6',
      image: '/images/nearby-s6.jpeg',
      title: 'Kanso by Earthen Window | Jacuzzi | Terrace | Pool',
      priceMinor: 4564800,
      rating: 5.0,
    },
    {
      id: 's7',
      image: '/images/nearby-s2.jpeg',
      title: 'Luxury Apt | Private Pool | 6 Mins from Beach',
      priceMinor: 4878600,
      rating: 4.93,
    },
    {
      id: 's8',
      image: '/images/nearby-s4.jpeg',
      title: 'Serendipity Cottage - Calm Stay in Calangute-Baga.',
      priceMinor: 2282400,
      rating: 4.92,
    },
  ],
};
