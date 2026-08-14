export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';

export type PaymentMethod = 'Full Payment' | 'Partial Deposit (50%)' | 'Pay at Resort';

export type PaymentChannel = 'GCash' | 'BPI' | 'Over the Counter';

export interface PaymentOptionDetails {
  enabled: boolean;
  accountName: string;
  accountNumber: string;
  instructions: string;
  qrCodeUrl?: string;
}

export interface PaymentSettings {
  allowPartialDeposit: boolean;
  partialDepositPercentage: number; // e.g. 50
  allowFullPayment: boolean;
  allowPayAtResort: boolean;
  gcash: PaymentOptionDetails;
  bpi: PaymentOptionDetails;
}

export interface Room {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  description?: string;
  maxGuests: number;
  bedType: string;
  sizeSqM: number;
  pricePerNight: number;
  featuredImage: string;
  galleryImages: string[];
  amenities: string[];
  isAvailable: boolean;
  blockedDates?: string[]; // ISO date strings (YYYY-MM-DD)
  category?: 'Rooms and Suites' | 'Cottages' | 'Filipino Kubos';
  isComingSoon?: boolean;
  comingSoonNotice?: string;
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  price: number;
  duration: string;
  inclusions: string[];
  validity: string;
  featuredImage: string;
  recommendedGuests: string;
  isPopular?: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name
  category: 'Popular' | 'Leisure' | 'Services' | 'Dining';
  tag?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Exterior' | 'Rooms' | 'Swimming Pool' | 'Restaurant' | 'Activities' | 'Scenic Views';
  imageUrl: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  guestName: string;
  origin: string;
  rating: number;
  comment: string;
  date: string;
  roomName: string;
  avatarUrl?: string;
}

export interface NotificationTemplates {
  emailSubject: string;
  emailBody: string;
  autoSendOnConfirm: boolean;
  autoSendOnBookingCreated: boolean;
}

export interface NotificationLog {
  id: string;
  bookingId: string;
  bookingRef: string;
  timestamp: string;
  type: 'Email';
  recipientEmail?: string;
  recipientMobile?: string;
  subject?: string;
  body: string;
  status: 'Sent' | 'Delivered';
  triggerEvent: 'Booking Created' | 'Booking Confirmed' | 'Manual Dispatch' | 'Status Changed';
}

export interface AddOnService {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  note?: string;
  icon?: string;
  priceDisplay?: string;
  category?: 'Dining' | 'Transport' | 'Wellness' | 'Activities' | 'Equipment & Rentals' | 'Events & Decor' | 'General';
  isActive?: boolean;
}

export interface Booking {
  id: string;
  referenceNumber: string;
  createdAt: string; // ISO string
  guestName: string;
  email: string;
  mobile: string;
  roomId: string;
  roomName: string;
  roomPricePerNight: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number;
  adultsCount: number;
  childrenCount: number;
  allocatedRooms?: {
    id: string;
    name: string;
    category?: string;
    pricePerNight: number;
    maxGuests: number;
  }[];
  selectedAddOns: {
    id: string;
    name: string;
    price: number;
    total: number;
  }[];
  specialRequests?: string;
  paymentMethod: PaymentMethod;
  selectedPaymentChannel?: PaymentChannel;
  paymentReceiptUrl?: string;
  paymentReferenceCode?: string;
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid';
  subtotal: number;
  addOnsTotal: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number;
  status: BookingStatus;
  adminNotes?: string;
  notificationsSent?: NotificationLog[];
}

export interface ResortDesignAssets {
  heroBgImg: string;
  infinityPoolImg: string;
  villaPoolImg: string;
  deluxeRoomImg: string;
  aboutSectionImg?: string;
  amenitiesBannerImg?: string;
  logoUrl?: string;
}

export type ThemePaletteKey = 'emerald' | 'coral' | 'warm_sand' | 'minimalist' | 'azure';

export type FontPairingKey = 'editorial' | 'imperial' | 'botanical' | 'clean';

export type CustomBlockType = 'faq' | 'announcement' | 'video' | 'promo';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CustomBlock {
  id: string;
  type: CustomBlockType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  data: {
    // FAQ
    faqItems?: FAQItem[];
    // Announcement
    badgeText?: string;
    announcementText?: string;
    ctaText?: string;
    ctaLink?: string;
    // Video
    videoUrl?: string;
    videoCoverImg?: string;
    // Promo
    promoCode?: string;
    discountText?: string;
    validUntil?: string;
  };
}

export type SectionId =
  | 'hero'
  | 'about'
  | 'rooms'
  | 'packages'
  | 'amenities'
  | 'location'
  | 'faq'
  | 'announcement'
  | 'video'
  | 'promo';

export interface SectionConfig {
  id: SectionId;
  name: string;
  enabled: boolean;
}

export interface ResortInfo {
  name: string;
  tagline: string;
  location: string;
  address: string;
  contactNumber: string;
  email: string;
  facebookPage: string;
  googleMapsUrl: string;
  businessHours: string;
  checkInTime: string;
  checkOutTime: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  aboutHeading?: string;
  aboutStoryText?: string;
  aboutSecondaryText?: string;
  aboutText?: string;
  amenitiesHeading?: string;
  amenitiesSubtitle?: string;
  locationHeading?: string;
  locationGuideText?: string;
  contactHeading?: string;
  contactSubtitle?: string;
  trustBadge1Title?: string;
  trustBadge1Sub?: string;
  trustBadge2Title?: string;
  trustBadge2Sub?: string;
  trustBadge3Title?: string;
  trustBadge3Sub?: string;
  trustBadge4Title?: string;
  trustBadge4Sub?: string;
  sectionOrder?: SectionId[];
  disabledSections?: SectionId[];
  themePalette?: ThemePaletteKey;
  fontPairing?: FontPairingKey;
  customAccentColor?: string;
  customBlocks?: CustomBlock[];
  designAssets?: ResortDesignAssets;
}

export interface ResortCustomization {
  primaryColor: string;
  secondaryColor: string;
  currencySymbol: string;
  currencyCode: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'owner';
  text: string;
  timestamp: string; // ISO String or readable format
  senderName?: string;
  read?: boolean;
  imageUrl?: string;
}

export interface ChatThread {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  lastMessage: string;
  lastUpdated: string;
  unreadCountOwner: number;
  unreadCountCustomer: number;
  messages: ChatMessage[];
  status: 'active' | 'archived';
  subject?: string;
}

export type AdminUserRole = 'super_admin' | 'resort_manager' | 'front_desk' | 'content_editor';

export interface AdminUserPermissions {
  manageBookings: boolean;
  canDeleteBookings?: boolean; // If false, user has View-Only access for Bookings & Receipts (cannot delete)
  manageChat: boolean;
  manageRoomsAndPackages: boolean;
  manageWebsiteAndAssets: boolean;
  managePaymentsAndNotifications: boolean;
  manageUsers: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AdminUserRole;
  permissions: AdminUserPermissions;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

