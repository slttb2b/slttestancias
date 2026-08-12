import { Room, Package, Amenity, GalleryItem, Testimonial, AddOnService, ResortInfo, Booking, PaymentSettings, NotificationTemplates } from '../types';

import heroBgImg from '../assets/images/resort_hero_bg_1785309990556.jpg';
import villaPoolImg from '../assets/images/resort_villa_pool_1785310007598.jpg';
import deluxeRoomImg from '../assets/images/resort_deluxe_room_1785310020129.jpg';
import infinityPoolImg from '../assets/images/resort_infinity_pool_1785310034114.jpg';

export const INITIAL_RESORT_INFO: ResortInfo = {
  name: 'SLTT ESTANCIAS',
  tagline: 'Your Perfect Tropical Sanctuary in Lugait',
  location: 'Tigbao, Mauswagon Lugait',
  address: 'Tigbao, Mauswagon Lugait, Misamis Oriental / Lanao del Norte Border, Philippines',
  contactNumber: '09054965912',
  email: 'contact@slttb2btravelsolutions.com',
  facebookPage: 'SLTT ESTANCIAS',
  googleMapsUrl: 'https://maps.app.goo.gl/HQjHywiXkYad41So8',
  businessHours: 'Open Daily 24/7 (Front Desk 24/7)',
  checkInTime: '2:00 PM',
  checkOutTime: '12:00 PM',
  heroTitle: 'Escape to SLTT ESTANCIAS RESORT',
  heroSubtitle: 'Your Private Tropical Sanctuary in Tigbao, Lugait',
  heroCtaText: 'Reserve Your Villa',
  aboutHeading: 'A Peaceful Botanical Sanctuary in Tigbao, Lugait',
  aboutStoryText: 'Nestled along the serene coastline of Tigbao, Mauswagon Lugait, SLTT ESTANCIAS offers an exquisite blend of modern tropical luxury and warm, genuine hospitality.',
  aboutSecondaryText: 'Designed for families, couples, and corporate gatherings seeking privacy, pristine swimming pools, and lush tropical gardens.',
  amenitiesHeading: 'Amenities & Mountain Comforts',
  amenitiesSubtitle: 'Everything you need for a relaxing day or night at SLTT Estancias Resort, surrounded by nature and fresh mountain air.',
  locationHeading: 'Sanctuary Location & Directions',
  locationGuideText: 'Conveniently accessible along National Highway, Tigbao, Mauswagon Lugait, Misamis Oriental / Lanao del Norte Border.',
  trustBadge1Title: 'MOUNTAIN ESCAPE',
  trustBadge1Sub: 'Nature • Relaxation • Comfort',
  trustBadge2Title: 'INFINITY POOL',
  trustBadge2Sub: 'Mountain & Nature View',
  trustBadge3Title: '100% RELAXATION',
  trustBadge3Sub: 'Your Mountain Escape',
  trustBadge4Title: 'FRESH DINING',
  trustBadge4Sub: 'Local & Farm-Fresh Flavors',
  sectionOrder: ['hero', 'about', 'rooms', 'packages', 'amenities', 'location', 'faq'],
  disabledSections: [],
  themePalette: 'emerald',
  fontPairing: 'editorial',
  customAccentColor: '#ad9e92',
  customBlocks: [
    {
      id: 'faq',
      type: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about day tours, overnight stays, and policies at SLTT Estancias',
      enabled: true,
      data: {
        faqItems: [
          {
            id: 'q1',
            question: 'What are the check-in and check-out times?',
            answer: 'Check-in time is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in or late check-out can be requested subject to room availability.',
          },
          {
            id: 'q2',
            question: 'Are day tours and pool usage allowed without booking a room?',
            answer: 'Yes! We offer Day Tour Packages with access to our infinity pool, adult/kiddie pools, botanical garden, and cottage rentals from 8:00 AM to 5:00 PM daily.',
          },
          {
            id: 'q3',
            question: 'Is corkage charged for outside food and drinks?',
            answer: 'Simple snacks and water are permitted. Heavy meals, alcoholic beverages, and cooked dishes may incur a minimal corkage fee unless you rent a private villa package.',
          },
          {
            id: 'q4',
            question: 'How do I confirm my online reservation?',
            answer: 'Select your preferred dates and villa, submit your booking, and pay the 50% reservation deposit via GCash, Maya, or Bank Transfer. Upload your receipt on our site for instant admin approval.',
          },
        ],
      },
    },
  ],
  designAssets: {
    heroBgImg,
    infinityPoolImg,
    villaPoolImg,
    deluxeRoomImg,
    aboutSectionImg: villaPoolImg,
    amenitiesBannerImg: infinityPoolImg,
    logoUrl: '',
  },
};

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  allowPartialDeposit: true,
  partialDepositPercentage: 50,
  allowFullPayment: true,
  allowPayAtResort: true,
  gcash: {
    enabled: true,
    accountName: 'SLTT ESTANCIAS RESORT',
    accountNumber: '09054965912',
    instructions: 'Send exact payment via GCash Express Send. Scan QR Code or transfer to our official number.',
    qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  },
  bpi: {
    enabled: true,
    accountName: 'SLTT ESTANCIAS LEISURE CORP',
    accountNumber: '1234-5678-90',
    instructions: 'Bank Transfer via BPI Mobile or Express Online. Branch: Iligan Main Branch.',
    qrCodeUrl: '',
  },
};

export const INITIAL_ROOMS: Room[] = [
  // 1. ROOMS & SUITES
  {
    id: 'room-deluxe',
    name: 'Deluxe Room',
    category: 'Rooms and Suites',
    tagline: 'Ideal for couples seeking quiet comfort',
    shortDescription: 'Spacious air-conditioned room with modern tropical decor, plush queen bed, and garden view balcony.',
    fullDescription: 'Our Deluxe Room offers an intimate sanctuary equipped with a high-grade queen size bed, private glass-door bathroom with rainfall shower, smart LED TV, mini-bar, and a private balcony overlooking the manicured tropical gardens.',
    maxGuests: 2,
    bedType: '1 Queen Bed',
    sizeSqM: 28,
    pricePerNight: 2500,
    featuredImage: deluxeRoomImg,
    galleryImages: [
      deluxeRoomImg,
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    ],
    amenities: ['Air Conditioning', 'Free Wi-Fi', 'Smart TV', 'Hot & Cold Shower', 'Mini Refrigerator', 'Balcony', 'Breakfast Included'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'room-family',
    name: 'Family Room',
    category: 'Rooms and Suites',
    tagline: 'Comfortable space for the whole family',
    shortDescription: 'Generous suite featuring two queen beds, private terrace, and direct garden access to the pool.',
    fullDescription: 'Designed with families in mind, the Family Room features two plush queen beds, an expansive seating area, high-speed Wi-Fi, premium coffee maker, and an oversized bathroom. Enjoy seamless access to the main swimming pool area.',
    maxGuests: 4,
    bedType: '2 Queen Beds',
    sizeSqM: 45,
    pricePerNight: 4500,
    featuredImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
      infinityPoolImg,
    ],
    amenities: ['Air Conditioning', 'Free Wi-Fi', 'Smart TV', 'Hot & Cold Shower', 'Mini Refrigerator', 'Pool View', 'Breakfast Included for 4', 'Coffee/Tea Maker'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'room-suite',
    name: 'Premium Suite',
    category: 'Rooms and Suites',
    tagline: 'Luxury living with scenic panoramas',
    shortDescription: 'Elevated luxury suite with king bed, separate living room lounge, oversized bathtub, and sunset views.',
    fullDescription: 'Experience top-tier hospitality in our Premium Suite. Featuring a master bedroom with a plush king bed, a separate living room with cozy sofa lounge, a spa bathtub with panoramic garden views, and personalized room service options.',
    maxGuests: 3,
    bedType: '1 King Bed + 1 Daybed',
    sizeSqM: 60,
    pricePerNight: 6200,
    featuredImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
      deluxeRoomImg,
    ],
    amenities: ['Air Conditioning', 'High-Speed Wi-Fi', '55" OLED Smart TV', 'Soaking Bathtub', 'Mini Bar', 'Private Sunset Terrace', 'Gourmet Breakfast', 'Espresso Machine'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'room-villa',
    name: 'Tropical Villa',
    category: 'Rooms and Suites',
    tagline: 'Standalone bungalow surrounded by palm trees',
    shortDescription: 'Exclusive standalone villa with master king bedroom, kitchen dining area, private gazebo, and veranda.',
    fullDescription: 'Our Tropical Villa provides ultimate privacy and solitude. Crafted with sustainable bamboo and teakwood accents, this standalone villa includes a master suite, kitchenette, outdoor dining deck, and direct pathways to the beach and pool.',
    maxGuests: 6,
    bedType: '1 King Bed + 2 Single Beds',
    sizeSqM: 85,
    pricePerNight: 8500,
    featuredImage: villaPoolImg,
    galleryImages: [
      villaPoolImg,
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
      heroBgImg,
    ],
    amenities: ['Air Conditioning', 'Free Wi-Fi', 'Kitchenette & Microwave', 'Private Gazebo', 'Hammock Deck', 'Barbecue Grill', 'Daily Housekeeping', 'Free Day Tour Access'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'room-pool-villa',
    name: 'Private Pool Villa',
    category: 'Rooms and Suites',
    tagline: 'The pinnacle of luxury with private infinity pool',
    shortDescription: 'Ultra-exclusive sanctuary featuring its own private plunge pool, teak sun deck, butler service, and ocean breeze.',
    fullDescription: 'The flagship accommodation at SLTT ESTANCIAS. Enjoy complete indulgence with your own private heated plunge pool, sprawling teak deck, outdoor daybed, master suite with panoramic glass walls, dedicated resort butler, and complimentary premium champagne upon arrival.',
    maxGuests: 4,
    bedType: '1 Emperor King Bed',
    sizeSqM: 110,
    pricePerNight: 12000,
    featuredImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      villaPoolImg,
      infinityPoolImg,
    ],
    amenities: ['Private Plunge Pool', 'Personal Butler Service', 'Free Welcome Massage', 'Air Conditioning', 'Ultra Wi-Fi', 'Outdoor Rainfall Shower', 'All-Inclusive Breakfast & Afternoon Tea'],
    isAvailable: true,
    blockedDates: [],
  },

  // 2. COTTAGES
  {
    id: 'cottage-open',
    name: 'Open Day Cottage',
    category: 'Cottages',
    tagline: 'Open-air shaded cottage for day tour relaxation',
    shortDescription: 'Shaded open day cottage with wooden dining table, bench seats, electrical outlet, and close proximity to the swimming pool.',
    fullDescription: 'Perfect for daytime guests and families, our Open Day Cottages offer comfortable shade and seating near the pool and garden areas. Includes access to grilling area and shower facilities.',
    maxGuests: 10,
    bedType: 'Wooden Dining Table & Benches',
    sizeSqM: 20,
    pricePerNight: 1000,
    featuredImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80',
      heroBgImg,
    ],
    amenities: ['Shaded Dining Area', 'Electrical Outlets', 'Grilling Area Access', 'Pool Proximity', 'Trash Disposal'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'cottage-pavilion',
    name: 'Executive Pavilion Cottage',
    category: 'Cottages',
    tagline: 'Spacious covered pavilion for big groups',
    shortDescription: 'Large covered pavilion cottage with multiple long tables, power sockets, and dedicated BBQ space.',
    fullDescription: 'Ideal for birthdays, company outings, and large family reunions. Offers expansive sheltered space, power outlets for sound systems/chargers, and direct access to resort amenities.',
    maxGuests: 25,
    bedType: 'Group Long Tables & Benches',
    sizeSqM: 50,
    pricePerNight: 2500,
    featuredImage: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1000&q=80',
      villaPoolImg,
    ],
    amenities: ['Multiple Tables & Benches', 'Power Outlets', 'Dedicated BBQ Station', 'Group Seating', 'Free Parking Access'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'cottage-umbrella',
    name: 'Poolside Umbrella Cottage',
    category: 'Cottages',
    tagline: 'Cozy poolside shaded table',
    shortDescription: 'Compact poolside umbrella cottage with round table and sun lounge chairs.',
    fullDescription: 'Enjoy quick dips in the swimming pool with a convenient poolside umbrella cottage providing sun shade and easy access to drinks and food.',
    maxGuests: 6,
    bedType: 'Round Table & Sun Loungers',
    sizeSqM: 12,
    pricePerNight: 600,
    featuredImage: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
      infinityPoolImg,
    ],
    amenities: ['Sun Umbrella', 'Round Table & Chairs', 'Poolside Deck Access'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'cottage-vip-glass',
    name: 'Sunset VIP Glass Cottage',
    category: 'Cottages',
    tagline: 'Air-conditioned VIP glass pavilion',
    shortDescription: 'Modern enclosed glass cottage with inverter AC and ocean views.',
    fullDescription: 'An exclusive glass-walled day sanctuary equipped with air conditioning, comfortable sofas, smart TV, and sea views.',
    maxGuests: 15,
    bedType: 'Lounge Sofas & Recliners',
    sizeSqM: 35,
    pricePerNight: 3500,
    featuredImage: 'https://images.unsplash.com/photo-1507038772120-7fff76f79d79?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507038772120-7fff76f79d79?auto=format&fit=crop&w=1000&q=80',
    ],
    amenities: ['Air Conditioning', 'Smart TV', 'Private Lounge Sofas', 'Panoramic Ocean Views'],
    isAvailable: true,
    isComingSoon: true,
    comingSoonNotice: 'Coming Soon - Reservations Opening Soon!',
    blockedDates: [],
  },

  // 3. FILIPINO KUBOS
  {
    id: 'kubo-traditional',
    name: 'Traditional Nipa Kubo',
    category: 'Filipino Kubos',
    tagline: 'Authentic Filipino bamboo & nipa leaf cottage',
    shortDescription: 'Handcrafted native nipa hut offering cool mountain breezes and traditional tropical charm.',
    fullDescription: 'Experience true Filipino warmth in our traditional Nipa Kubo. Constructed with natural bamboo and nipa thatch leaves, providing natural cooling and relaxing atmosphere.',
    maxGuests: 8,
    bedType: 'Native Bamboo Benches & Low Table',
    sizeSqM: 18,
    pricePerNight: 1200,
    featuredImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=80',
    ],
    amenities: ['Natural Bamboo Seating', 'Nipa Thatch Roof', 'Fresh Mountain Breeze', 'Electrical Outlet'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'kubo-aircon',
    name: 'Overnight Aircon Kubo',
    category: 'Filipino Kubos',
    tagline: 'Modernized native kubo with air-conditioning',
    shortDescription: 'Cozy native wooden hut upgraded with inverter AC, plush mattress, and private terrace.',
    fullDescription: 'Combining native Filipino aesthetics with modern comfort. Features inverter air-conditioning, soft bedding, private balcony, and hot/cold shower.',
    maxGuests: 4,
    bedType: '1 Queen Mattress + Banig',
    sizeSqM: 24,
    pricePerNight: 2800,
    featuredImage: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
      deluxeRoomImg,
    ],
    amenities: ['Air Conditioning', 'Private Bathroom', 'Plush Bedding', 'Balcony Deck', 'Free Wi-Fi'],
    isAvailable: true,
    blockedDates: [],
  },
  {
    id: 'kubo-bamboo-pavilion',
    name: 'Bamboo Native Pavilion',
    category: 'Filipino Kubos',
    tagline: 'Spacious elevated bamboo kubo for group dining',
    shortDescription: 'Large elevated native bamboo pavilion perfect for celebrations and family feasting.',
    fullDescription: 'Spacious elevated bamboo kubo designed for large Filipino family feasts and group bonding. Surround yourself with lush mountain gardens.',
    maxGuests: 20,
    bedType: 'Elevated Native Dining Setup',
    sizeSqM: 40,
    pricePerNight: 3800,
    featuredImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    ],
    amenities: ['Elevated Bamboo Deck', 'Large Dining Setup', 'Mountain Views', 'Power Outlets'],
    isAvailable: true,
    isComingSoon: true,
    comingSoonNotice: 'Coming Soon - Under Construction',
    blockedDates: [],
  },
];

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg-couple',
    name: 'Couple\'s Romantic Getaway',
    tagline: 'Unwind together in paradise',
    price: 6999,
    duration: '3 Days / 2 Nights',
    inclusions: [
      '2 Nights stay in Deluxe Room',
      'Daily plated breakfast for two',
      '1 Romantic candlelit dinner by the pool',
      'Welcome drinks & fruit platter',
      '1-Hour relaxing couple massage',
      'Late check-out until 2:00 PM (subject to availability)'
    ],
    validity: 'Valid year-round except peak holidays',
    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    recommendedGuests: '2 Adults',
    isPopular: true,
  },
  {
    id: 'pkg-family',
    name: 'Family Tropical Vacation',
    tagline: 'Fun, relaxation, and bonding for all ages',
    price: 11999,
    duration: '3 Days / 2 Nights',
    inclusions: [
      '2 Nights stay in Family Room (up to 4 guests)',
      'Buffet breakfast for 4 persons daily',
      'Complimentary pool passes and towel usage',
      '1 Family lunch platter at Estancias Restaurant',
      'Free s’mores kit for outdoor bonfire night',
      '10% off on additional food & beverages'
    ],
    validity: 'Valid year-round',
    featuredImage: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80',
    recommendedGuests: '4 Guests (2 Adults, 2 Kids)',
    isPopular: true,
  },
  {
    id: 'pkg-barkada',
    name: 'Barkada Escapade Package',
    tagline: 'Bring your friends for an epic weekend',
    price: 14500,
    duration: '2 Days / 1 Night',
    inclusions: [
      'Overnight stay in Tropical Villa (up to 6 guests)',
      'Plated breakfast for 6 persons',
      'Unlimited pool access',
      'Use of function pavilion / outdoor grill area',
      '1 Bucket of cold beverages + pulutan platter',
      'Free karaoke session (2 hours)'
    ],
    validity: 'Valid weekends and weekdays',
    featuredImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
    recommendedGuests: '6 Friends / Adults',
  },
  {
    id: 'pkg-weekend',
    name: 'Weekend Getaway Retreat',
    tagline: 'Recharge your energy away from the city',
    price: 5499,
    duration: '2 Days / 1 Night',
    inclusions: [
      '1 Night stay in Premium Suite',
      'Breakfast in bed or terrace',
      'Complimentary welcome cocktail at pool bar',
      'Free access to infinity pool & sports equipment',
      '15% spa discount voucher'
    ],
    validity: 'Friday to Sunday bookings',
    featuredImage: infinityPoolImg,
    recommendedGuests: '2 Guests',
  },
  {
    id: 'pkg-daytour',
    name: 'Day Tour & Swim Package',
    tagline: 'Enjoy resort facilities for a refreshing day out',
    price: 450,
    duration: 'Day Pass (8:00 AM - 5:00 PM)',
    inclusions: [
      'Full day access to main swimming pool & grounds',
      '₱200 Consumable food & beverage credit at restaurant',
      'Complimentary cottage / cottage chair rental',
      'Free parking & Wi-Fi access'
    ],
    validity: 'Daily from 8 AM to 5 PM',
    featuredImage: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
    recommendedGuests: 'Per Person Rate',
  },
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: 'amenity-pool',
    name: 'Swimming Pool',
    description: 'Refreshing swimming pool for day and night swimming, surrounded by nature.',
    iconName: 'Waves',
    category: 'Popular',
    tag: 'Complimentary Guest Access',
  },
  {
    id: 'amenity-wifi',
    name: 'Wi-Fi Access',
    description: 'Enjoy complimentary Wi-Fi for your first 1 hour. Additional access is available for a fee.',
    iconName: 'Wifi',
    category: 'Services',
    tag: '1-Hour Complimentary Access',
  },
  {
    id: 'amenity-restaurant',
    name: 'Estancias Restaurant',
    description: 'Enjoy Filipino favorites, grilled dishes, refreshing drinks, and Spanish-inspired specialties.',
    iconName: 'UtensilsCrossed',
    category: 'Dining',
    tag: 'Open During Restaurant Hours',
  },
  {
    id: 'amenity-parking',
    name: 'Secure Parking',
    description: 'Designated parking area available for resort guests.',
    iconName: 'Car',
    category: 'Services',
    tag: 'Complimentary Guest Parking',
  },
  {
    id: 'amenity-bbq',
    name: 'BBQ / Grilling Area',
    description: 'Enjoy outdoor grilling with your family and friends in our designated grilling area.',
    iconName: 'Flame',
    category: 'Leisure',
    tag: 'Complimentary Use',
  },
  {
    id: 'amenity-gardens',
    name: 'Mountain Gardens & Nature',
    description: 'Relax among lush greenery, peaceful surroundings, and fresh mountain air.',
    iconName: 'Trees',
    category: 'Leisure',
    tag: 'Complimentary Guest Access',
  },
  {
    id: 'amenity-karaoke',
    name: 'Karaoke',
    description: 'Enjoy karaoke with your family and friends during permitted hours.',
    iconName: 'Mic',
    category: 'Leisure',
    tag: 'Available Upon Request',
  },
  {
    id: 'amenity-security',
    name: 'Gated Security',
    description: 'A secure resort environment with staff and security support throughout your visit.',
    iconName: 'ShieldCheck',
    category: 'Services',
    tag: '24/7 Security',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Resort Sunset Deck',
    category: 'Exterior',
    imageUrl: heroBgImg,
    caption: 'Golden hour at SLTT ESTANCIAS over the central swimming pool.',
  },
  {
    id: 'gal-2',
    title: 'Private Pool Villa Exterior',
    category: 'Exterior',
    imageUrl: villaPoolImg,
    caption: 'Exclusive pool villa deck featuring warm teak wood and tropical greenery.',
  },
  {
    id: 'gal-3',
    title: 'Deluxe Suite Interior',
    category: 'Rooms',
    imageUrl: deluxeRoomImg,
    caption: 'Elegantly appointed bedroom suite with cozy king bed and natural lighting.',
  },
  {
    id: 'gal-4',
    title: 'Infinity Swimming Pool',
    category: 'Swimming Pool',
    imageUrl: infinityPoolImg,
    caption: 'Illuminated infinity pool illuminated under the evening stars.',
  },
  {
    id: 'gal-5',
    title: 'Estancias Garden Restaurant',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    caption: 'Open-air garden restaurant serving fresh coastal dining and tropical cocktails.',
  },
  {
    id: 'gal-6',
    title: 'Family Room Lounge',
    category: 'Rooms',
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
    caption: 'Spacious family layout designed for maximum relaxation.',
  },
  {
    id: 'gal-7',
    title: 'Night Pool Lounging',
    category: 'Swimming Pool',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
    caption: 'Soak in the serene tropical evening air by the illuminated water.',
  },
  {
    id: 'gal-8',
    title: 'Coastline Views of Lugait',
    category: 'Scenic Views',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Peaceful sea views surrounding the Tigbao resort grounds.',
  },
  {
    id: 'gal-9',
    title: 'Event Function Pavilion',
    category: 'Activities',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
    caption: 'Spacious pavilion setup for private celebrations and team buildings.',
  },
];

export const INITIAL_REVIEWS: Testimonial[] = [
  {
    id: 'rev-1',
    guestName: 'Maria Clara Santos',
    origin: 'Cagayan de Oro City',
    rating: 5,
    comment: 'SLTT ESTANCIAS is a hidden gem in Tigbao, Lugait! The pool was super clean, staff were extremely polite and accommodating, and the room was so cozy. We will definitely come back!',
    date: 'July 2026',
    roomName: 'Private Pool Villa',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'rev-2',
    guestName: 'Engr. Jerome Tan',
    origin: 'Iligan City',
    rating: 5,
    comment: 'Perfect venue for our family weekend getaway. Very accessible from Iligan and CDO. The kids enjoyed the swimming pool while we relaxed at the gazebo. Outstanding hospitality!',
    date: 'June 2026',
    roomName: 'Family Room',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'rev-3',
    guestName: 'Samantha & David Miller',
    origin: 'Davao City',
    rating: 5,
    comment: 'We booked the Couple\'s Romantic Package for our anniversary. The dinner setup by the pool was romantic beyond words. Food was delicious and price was worth every peso!',
    date: 'May 2026',
    roomName: 'Deluxe Room',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
];

export const ADD_ON_SERVICES: AddOnService[] = [
  {
    id: 'addon-horseback',
    name: 'Horseback Riding Experience',
    icon: '🐴',
    price: 500,
    unit: 'per person',
    description: 'Enjoy a relaxing horseback riding experience surrounded by nature.',
    note: 'Subject to availability and weather conditions.',
  },
  {
    id: 'addon-atv',
    name: 'ATV Mountain Adventure',
    icon: '🏍️',
    price: 0,
    priceDisplay: 'Rate upon request',
    unit: 'upon request',
    description: 'Explore the mountain surroundings with an exciting ATV experience.',
    note: 'Subject to availability, weather conditions, and partner/operator rates.',
  },
  {
    id: 'addon-sangria',
    name: 'Red Sangria Pitcher',
    icon: '🍷',
    price: 650,
    unit: 'per pitcher',
    description: 'Perfect for sharing with family and friends.',
  },
  {
    id: 'addon-karaoke',
    name: 'Karaoke',
    icon: '🎤',
    price: 0,
    priceDisplay: 'Rate upon request',
    unit: 'upon request',
    description: 'Enjoy karaoke with your family and friends.',
    note: 'Subject to availability and permitted hours.',
  },
  {
    id: 'addon-bonfire-set',
    name: 'Bonfire Setup',
    icon: '🔥',
    price: 500,
    unit: 'per set',
    description: 'Enjoy a cozy evening bonfire with your group.',
    note: 'Subject to weather conditions and resort approval.',
  },
  {
    id: 'addon-smores',
    name: 'S’mores & Marshmallow Set',
    icon: '🍡',
    price: 250,
    unit: 'per set',
    description: 'Marshmallows, chocolate, graham crackers, and skewers—perfect for a fun evening by the bonfire.',
  },
  {
    id: 'addon-floating-breakfast',
    name: 'Floating Breakfast Experience',
    icon: '🍳',
    price: 1200,
    unit: 'set for 2 persons',
    description: 'Enjoy a beautiful breakfast served on a traditional rattan floating tray in our pool.',
    note: 'Advance reservation required.',
  },
  {
    id: 'addon-breakfast',
    name: 'Extra Gourmet Breakfast Platter',
    icon: '🍱',
    price: 350,
    unit: 'per person',
    description: 'Hot Filipino or American breakfast set with fresh brewed coffee or tropical juice.',
  },
  {
    id: 'addon-shuttle',
    name: 'Airport / Terminal Shuttle Pick-up',
    icon: '🚐',
    price: 1500,
    unit: 'per stay',
    description: 'Private air-conditioned van pick-up or drop-off to Laguindingan Airport (CGY) or Iligan Terminal.',
  },
  {
    id: 'addon-extra-bed',
    name: 'Extra Rollaway Mattress',
    icon: '🛏️',
    price: 600,
    unit: 'per night',
    description: 'Includes complete extra bedding, pillow, blanket, and breakfast for 1 guest.',
  },
  {
    id: 'addon-massage',
    name: 'Signature Swedish / Hilot Massage',
    icon: '💆‍♀️',
    price: 800,
    unit: 'per person',
    description: '60-minute relaxing body massage performed in your room or private cabana by certified therapist.',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1',
    referenceNumber: 'SLTT-2026-88219',
    createdAt: '2026-07-25T10:30:00Z',
    guestName: 'Juan Dela Cruz',
    email: 'juandelacruz@example.com',
    mobile: '09171234567',
    roomId: 'room-deluxe',
    roomName: 'Deluxe Room',
    roomPricePerNight: 2500,
    checkInDate: '2026-08-01',
    checkOutDate: '2026-08-03',
    numberOfNights: 2,
    adultsCount: 2,
    childrenCount: 0,
    selectedAddOns: [
      { id: 'addon-breakfast', name: 'Extra Gourmet Breakfast Platter', price: 350, total: 700 },
    ],
    specialRequests: 'Honeymoon setup with flowers if possible.',
    paymentMethod: 'Partial Deposit (50%)',
    paymentStatus: 'Deposit Paid',
    subtotal: 5000,
    addOnsTotal: 700,
    taxAmount: 684,
    totalAmount: 6384,
    depositAmount: 3192,
    status: 'Confirmed',
    adminNotes: 'Deposit received via GCash. Guest requested flower setup.',
  },
  {
    id: 'bkg-2',
    referenceNumber: 'SLTT-2026-90412',
    createdAt: '2026-07-28T14:15:00Z',
    guestName: 'Dr. Beatrice Ramos',
    email: 'beatrice.ramos@example.com',
    mobile: '09189876543',
    roomId: 'room-pool-villa',
    roomName: 'Private Pool Villa',
    roomPricePerNight: 12000,
    checkInDate: '2026-08-05',
    checkOutDate: '2026-08-06',
    numberOfNights: 1,
    adultsCount: 2,
    childrenCount: 1,
    selectedAddOns: [
      { id: 'addon-massage', name: 'Signature Swedish / Hilot Massage', price: 800, total: 1600 },
    ],
    specialRequests: 'Late check-in around 5:00 PM.',
    paymentMethod: 'Full Payment',
    paymentStatus: 'Fully Paid',
    subtotal: 12000,
    addOnsTotal: 1600,
    taxAmount: 1632,
    totalAmount: 15232,
    depositAmount: 15232,
    status: 'Pending',
    adminNotes: 'Verify online payment receipt from bank transfer.',
  },
  {
    id: 'bkg-3',
    referenceNumber: 'SLTT-2026-95882',
    createdAt: '2026-08-01T09:00:00Z',
    guestName: 'Maria Santos',
    email: 'mariat.santos@example.com',
    mobile: '09195551234',
    roomId: 'cottage-open',
    roomName: 'Open Day Cottage',
    roomPricePerNight: 1000,
    checkInDate: '2026-08-10',
    checkOutDate: '2026-08-15',
    numberOfNights: 5,
    adultsCount: 6,
    childrenCount: 2,
    selectedAddOns: [],
    specialRequests: 'Near grilling area please.',
    paymentMethod: 'Full Payment',
    paymentStatus: 'Fully Paid',
    subtotal: 5000,
    addOnsTotal: 0,
    taxAmount: 600,
    totalAmount: 5600,
    depositAmount: 5600,
    status: 'Confirmed',
    adminNotes: 'Confirmed day cottage reservation.',
  },
  {
    id: 'bkg-4',
    referenceNumber: 'SLTT-2026-99310',
    createdAt: '2026-08-02T11:20:00Z',
    guestName: 'Engr. Roberto Gomez',
    email: 'roberto.gomez@example.com',
    mobile: '09208889900',
    roomId: 'cottage-pavilion',
    roomName: 'Executive Pavilion Cottage',
    roomPricePerNight: 2500,
    checkInDate: '2026-08-10',
    checkOutDate: '2026-08-12',
    numberOfNights: 2,
    adultsCount: 15,
    childrenCount: 5,
    selectedAddOns: [],
    specialRequests: 'Corporate team lunch event.',
    paymentMethod: 'Full Payment',
    paymentStatus: 'Fully Paid',
    subtotal: 5000,
    addOnsTotal: 0,
    taxAmount: 600,
    totalAmount: 5600,
    depositAmount: 5600,
    status: 'Checked In',
    adminNotes: 'Currently checked in on site.',
  },
];

export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplates = {
  emailSubject: "Booking Confirmed - {resort_name} (Ref: {booking_reference})",
  emailBody: `Dear {guest_name},

Madiyaw Karadajaw! 🌿

We are delighted to inform you that your booking with {resort_name} is officially CONFIRMED! Below are your reservation details:

========================================
RESERVATION SUMMARY
========================================
• Reference No: {booking_reference}
• Guest Name: {guest_name}
• Accommodation: {room_name}
• Check-In Date: {check_in} (2:00 PM)
• Check-Out Date: {check_out} (12:00 PM)
• Duration: {number_of_nights} Night(s)
• Total Guests: {adults_count} Adult(s), {children_count} Child(ren)
• Total Amount: ₱{total_price}
• Payment Status: {payment_status}
========================================

{add_ons_list}

Resort Address: {resort_address}
Contact Hotline: {resort_contact} | Email: {resort_email}

We look forward to welcoming you soon! If you have special requests or need assistance, please contact us anytime.

Warm regards,
{resort_name} Reservations Team`,
  autoSendOnConfirm: true,
  autoSendOnBookingCreated: true,
};

export const formatNotificationMessage = (
  template: string,
  booking?: Booking | null,
  resortInfo?: ResortInfo | null
): string => {
  if (!template) return '';
  if (!booking) return template;
  const info = resortInfo || {
    id: '1',
    name: 'SLTT ESTANCIAS',
    tagline: '',
    location: 'Tigbao, Mauswagon Lugait',
    address: 'Tigbao, Mauswagon Lugait, Misamis Oriental / Lanao del Norte Border, Philippines',
    contactNumber: '09054965912',
    email: 'contact@slttb2btravelsolutions.com',
    facebookPage: 'SLTT ESTANCIAS',
    googleMapsUrl: '',
    businessHours: '',
    checkInTime: '',
    checkOutTime: '',
  };

  let addOnsText = '';
  if (booking.selectedAddOns && booking.selectedAddOns.length > 0) {
    addOnsText = `Optional Add-Ons:\n` + booking.selectedAddOns.map((a) => ` - ${a?.name || 'Add-on'} (₱${(a?.price || 0).toLocaleString()})`).join('\n');
  } else {
    addOnsText = `Optional Add-Ons: None`;
  }

  return (template || '')
    .replace(/\{guest_name\}/g, booking.guestName || 'Valued Guest')
    .replace(/\{booking_reference\}/g, booking.referenceNumber || booking.id || '')
    .replace(/\{resort_name\}/g, info.name || 'SLTT ESTANCIAS')
    .replace(/\{room_name\}/g, booking.roomName || 'Selected Accommodation')
    .replace(/\{check_in\}/g, booking.checkInDate || '')
    .replace(/\{check_out\}/g, booking.checkOutDate || '')
    .replace(/\{number_of_nights\}/g, String(booking.numberOfNights || 1))
    .replace(/\{adults_count\}/g, String(booking.adultsCount || 1))
    .replace(/\{children_count\}/g, String(booking.childrenCount || 0))
    .replace(/\{total_price\}/g, (booking.totalAmount || 0).toLocaleString())
    .replace(/\{payment_status\}/g, booking.paymentStatus || 'Pending')
    .replace(/\{payment_method\}/g, booking.paymentMethod || 'Partial Deposit')
    .replace(/\{add_ons_list\}/g, addOnsText)
    .replace(/\{resort_address\}/g, info.address || 'Tigbao, Mauswagon Lugait, Misamis Oriental')
    .replace(/\{resort_contact\}/g, info.contactNumber || '09054965912')
    .replace(/\{resort_email\}/g, info.email || 'contact@slttb2btravelsolutions.com');
};

export const INITIAL_CHAT_THREADS: import('../types').ChatThread[] = [
  {
    id: 'CHAT-1001',
    customerName: 'Maria Santos',
    customerPhone: '09171234567',
    customerEmail: 'maria.santos@gmail.com',
    subject: 'Family Villa Availability Inquiry',
    lastMessage: 'Hi! Is the Deluxe Family Villa available this coming Saturday?',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCountOwner: 1,
    unreadCountCustomer: 0,
    status: 'active',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Maria Santos',
        text: 'Good afternoon SLTT ESTANCIAS! I would like to inquire about booking options for a family of 6.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: true,
      },
      {
        id: 'msg-2',
        sender: 'owner',
        senderName: 'Front Desk Admin',
        text: 'Hello Ma’am Maria! Welcome to SLTT ESTANCIAS. Yes, we have our Deluxe Family Villa and Cottage options ready. How many nights are you planning to stay?',
        timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
        read: true,
      },
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Maria Santos',
        text: 'Hi! Is the Deluxe Family Villa available this coming Saturday?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
    ],
  },
  {
    id: 'CHAT-1002',
    customerName: 'Roberto Gomez',
    customerPhone: '09189876543',
    customerEmail: 'roberto.gomez@yahoo.com',
    subject: 'Day Tour & Pool Rules',
    lastMessage: 'Great, thank you! See you tomorrow morning.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    unreadCountOwner: 0,
    unreadCountCustomer: 0,
    status: 'active',
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        senderName: 'Roberto Gomez',
        text: 'Hello, what time is the day tour pool access open?',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        read: true,
      },
      {
        id: 'msg-5',
        sender: 'owner',
        senderName: 'Front Desk Admin',
        text: 'Good day Sir Roberto! Day Tour pool access is open daily from 8:00 AM to 5:00 PM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        read: true,
      },
      {
        id: 'msg-6',
        sender: 'customer',
        senderName: 'Roberto Gomez',
        text: 'Great, thank you! See you tomorrow morning.',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        read: true,
      },
    ],
  },
];

