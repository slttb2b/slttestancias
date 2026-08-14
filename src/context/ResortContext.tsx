import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Room,
  Package,
  Amenity,
  GalleryItem,
  Testimonial,
  Booking,
  ResortInfo,
  ResortCustomization,
  BookingStatus,
  PaymentSettings,
  NotificationTemplates,
  NotificationLog,
  ChatThread,
  ChatMessage,
  AdminUser,
  AdminUserRole,
  AdminUserPermissions,
  AddOnService,
} from '../types';
import {
  INITIAL_RESORT_INFO,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_ROOMS,
  INITIAL_PACKAGES,
  INITIAL_AMENITIES,
  INITIAL_GALLERY,
  INITIAL_REVIEWS,
  INITIAL_BOOKINGS,
  INITIAL_CHAT_THREADS,
  ADD_ON_SERVICES,
  DEFAULT_NOTIFICATION_TEMPLATES,
  formatNotificationMessage,
} from '../data/resortData';
import {
  seedFirestoreIfEmpty,
  subscribeAdminUsers,
  subscribeBookings,
  subscribeRooms,
  subscribePackages,
  subscribeAddOns,
  subscribeChatThreads,
  subscribeSettings,
  saveAdminUserToFirestore,
  deleteAdminUserFromFirestore,
  saveBookingToFirestore,
  deleteBookingFromFirestore,
  saveRoomToFirestore,
  deleteRoomFromFirestore,
  savePackageToFirestore,
  deletePackageFromFirestore,
  saveAddOnToFirestore,
  deleteAddOnFromFirestore,
  saveChatThreadToFirestore,
  deleteChatThreadFromFirestore,
  saveResortInfoToFirestore,
  savePaymentSettingsToFirestore,
  forceSyncAllToFirestore,
} from '../services/firestoreService';

export type ActiveTab =
  | 'home'
  | 'rooms'
  | 'packages'
  | 'amenities'
  | 'gallery'
  | 'about'
  | 'location'
  | 'contact'
  | 'my-bookings'
  | 'admin'
  | 'docs';

interface QuickSearchFilters {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomType: string;
  cottageType?: string;
}

interface ResortContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  resortInfo: ResortInfo;
  setResortInfo: React.Dispatch<React.SetStateAction<ResortInfo>>;
  updateResortInfo: (info: ResortInfo, customSuccessMsg?: string) => Promise<boolean>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  updatePaymentSettings: (settings: PaymentSettings) => Promise<boolean>;
  customization: ResortCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<ResortCustomization>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  amenities: Amenity[];
  setAmenities: React.Dispatch<React.SetStateAction<Amenity[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  reviews: Testimonial[];
  setReviews: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  bookings: Booking[];
  
  // Theme State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Visual Edit Mode
  isVisualEditMode: boolean;
  setIsVisualEditMode: (val: boolean) => void;

  // Search state
  searchFilters: QuickSearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<QuickSearchFilters>>;
  
  // Modal states
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  selectedRoomForBooking: Room | null;
  setSelectedRoomForBooking: (room: Room | null) => void;
  selectedPackageForBooking: Package | null;
  setSelectedPackageForBooking: (pkg: Package | null) => void;
  
  selectedRoomDetails: Room | null;
  setSelectedRoomDetails: (room: Room | null) => void;
  
  activeLightboxIndex: number | null;
  setActiveLightboxIndex: (index: number | null) => void;
  
  lastSubmittedBooking: Booking | null;
  setLastSubmittedBooking: (b: Booking | null) => void;
  
  // Admin actions
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus, notes?: string, paymentStatus?: 'Unpaid' | 'Deposit Paid' | 'Fully Paid') => void;
  deleteBooking: (id: string) => void;
  attachBookingReceipt: (bookingId: string, receiptUrl: string, refCode?: string) => void;
  
  // Room actions
  toggleRoomAvailability: (roomId: string) => Promise<void> | void;
  updateRoomPrice: (roomId: string, newPrice: number) => Promise<void> | void;
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  blockRoomDates: (roomId: string, dates: string[]) => Promise<void> | void;
  
  // Package actions
  addPackage: (pkg: Package) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (pkgId: string) => void;

  // Add-On Service actions
  addOns: AddOnService[];
  setAddOns: React.Dispatch<React.SetStateAction<AddOnService[]>>;
  addAddOn: (addon: AddOnService) => void;
  updateAddOn: (addon: AddOnService) => void;
  deleteAddOn: (addonId: string) => void;
  toggleAddOnActive: (addonId: string) => void;

  // Helper methods
  getRoomById: (id: string) => Room | undefined;
  getBookingByReference: (ref: string) => Booking | undefined;
  
  // Notification Templates & Logs
  notificationTemplates: NotificationTemplates;
  updateNotificationTemplates: (templates: NotificationTemplates) => void;
  notificationLogs: NotificationLog[];
  sendNotification: (
    booking: Booking,
    type: 'Email',
    triggerEvent: NotificationLog['triggerEvent'],
    customContent?: { emailSubject?: string; emailBody?: string }
  ) => NotificationLog;

  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Live Chat system
  isLiveChatOpen: boolean;
  setIsLiveChatOpen: (open: boolean) => void;
  chatThreads: ChatThread[];
  currentCustomerThreadId: string | null;
  setCurrentCustomerThreadId: (id: string | null) => void;
  sendChatMessage: (threadId: string, text: string, sender: 'customer' | 'owner', senderName?: string, imageUrl?: string) => void;
  createOrStartChatThread: (guestInfo: { name: string; email?: string; phone?: string; subject?: string }, initialText?: string, imageUrl?: string) => string;
  markThreadReadByOwner: (threadId: string) => void;
  markThreadReadByCustomer: (threadId: string) => void;
  deleteChatThread: (threadId: string) => void;
  unreadChatCountOwner: number;

  // Super Admin & User Management
  adminUsers: AdminUser[];
  currentAdminUser: AdminUser | null;
  setCurrentAdminUser: (user: AdminUser | null) => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => AdminUser;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  resetAdminUserPassword: (id: string, newPass: string) => void;
  toggleAdminUserStatus: (id: string) => void;
  authenticateAdminUser: (username: string, pass: string) => AdminUser | null;
  syncAllDataToFirebase: () => Promise<boolean>;
}

const ResortContext = createContext<ResortContextType | undefined>(undefined);

// Get default dates (Tomorrow and +2 Days)
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getAfterTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user-super-admin-1',
    username: 'SLTTESTANCIA_ADMIN',
    password: 'Slttestancias123@',
    fullName: 'Master Resort Administrator',
    email: 'reservations@slttestanciasresort.com',
    phone: '09615993305',
    role: 'super_admin',
    permissions: {
      manageBookings: true,
      canDeleteBookings: true,
      manageChat: true,
      manageRoomsAndPackages: true,
      manageWebsiteAndAssets: true,
      managePaymentsAndNotifications: true,
      manageUsers: true,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-manager-2',
    username: 'manager_maria',
    password: 'Manager123@',
    fullName: 'Maria Santos (Resort Manager)',
    email: 'maria@slttestancias.com',
    phone: '09551234567',
    role: 'resort_manager',
    permissions: {
      manageBookings: true,
      canDeleteBookings: true,
      manageChat: true,
      manageRoomsAndPackages: true,
      manageWebsiteAndAssets: true,
      managePaymentsAndNotifications: true,
      manageUsers: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-frontdesk-3',
    username: 'frontdesk_staff',
    password: 'Frontdesk123@',
    fullName: 'Front Desk Officer',
    email: 'reception@slttestancias.com',
    phone: '09556666666',
    role: 'front_desk',
    permissions: {
      manageBookings: true,
      canDeleteBookings: false,
      manageChat: true,
      manageRoomsAndPackages: false,
      manageWebsiteAndAssets: false,
      managePaymentsAndNotifications: false,
      manageUsers: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const ResortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Super Admin & User Management State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_admin_users_v1');
      if (saved) {
        const parsed: AdminUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasMaster = parsed.some((u) => u.username === 'SLTTESTANCIA_ADMIN');
          if (hasMaster) {
            return parsed.map((u) =>
              u.username === 'SLTTESTANCIA_ADMIN'
                ? { ...u, password: 'Slttestancias123@', role: 'super_admin', isActive: true }
                : u
            );
          } else {
            return [DEFAULT_ADMIN_USERS[0], ...parsed];
          }
        }
      }
    } catch (e) {
      console.error('Error loading admin users:', e);
    }
    return DEFAULT_ADMIN_USERS;
  });

  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('sltt_current_admin_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading current admin user:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sltt_admin_users_v1', JSON.stringify(adminUsers));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [adminUsers]);

  useEffect(() => {
    try {
      if (currentAdminUser) {
        localStorage.setItem('sltt_current_admin_user', JSON.stringify(currentAdminUser));
      } else {
        localStorage.removeItem('sltt_current_admin_user');
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [currentAdminUser]);
  const [resortInfo, setResortInfo] = useState<ResortInfo>(() => {
    try {
      const saved = localStorage.getItem('sltt_resort_info');
      if (!saved) return INITIAL_RESORT_INFO;
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.contactNumber === '09615993305' || parsed.contactNumber === '09161669188') {
          parsed.contactNumber = '09054965912';
        }
        if (!parsed.businessHours || parsed.businessHours === 'Open Daily 8:00 AM - 9:00 PM (Front Desk 24/7)') {
          parsed.businessHours = 'Open Daily 24/7 (Front Desk 24/7)';
        }
        if (!parsed.email || parsed.email === 'slttestanciasinquire@gmail.com' || parsed.email === 'contact@slttb2btravelsolutions.com') {
          parsed.email = 'reservations@slttestanciasresort.com';
        }
        return { ...INITIAL_RESORT_INFO, ...parsed };
      }
    } catch (err) {
      console.error('Error loading resort info from localStorage:', err);
    }
    return INITIAL_RESORT_INFO;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem('sltt_payment_settings');
      if (!saved) return INITIAL_PAYMENT_SETTINGS;
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.gcash && (parsed.gcash.accountNumber === '09615993305' || parsed.gcash.accountNumber === '09161669188')) {
          parsed.gcash.accountNumber = '09054965912';
        }
        return { ...INITIAL_PAYMENT_SETTINGS, ...parsed };
      }
    } catch (err) {
      console.error('Error loading payment settings from localStorage:', err);
    }
    return INITIAL_PAYMENT_SETTINGS;
  });

  const [customization, setCustomization] = useState<ResortCustomization>({
    primaryColor: '#0F5147',
    secondaryColor: '#E07A5F',
    currencySymbol: '₱',
    currencyCode: 'PHP',
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sltt_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('sltt_theme', theme);
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [theme]);

  // Rooms state loaded from initial state, synchronized with Firebase/Firestore
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  // Safe one-time cleanup of obsolete sltt_rooms_v3 cache
  useEffect(() => {
    try {
      localStorage.removeItem('sltt_rooms_v3');
    } catch (e) {
      console.warn('Unable to clear old room cache:', e);
    }
  }, []);

  const [packages, setPackages] = useState<Package[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_packages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading packages:', e);
    }
    return INITIAL_PACKAGES;
  });

  const [addOns, setAddOns] = useState<AddOnService[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_addons_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading add-ons:', e);
    }
    return ADD_ON_SERVICES;
  });

  const [amenities, setAmenities] = useState<Amenity[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_amenities_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading amenities:', e);
    }
    return INITIAL_AMENITIES;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading gallery:', e);
    }
    return INITIAL_GALLERY;
  });

  const [reviews, setReviews] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading reviews:', e);
    }
    return INITIAL_REVIEWS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading bookings:', e);
    }
    return INITIAL_BOOKINGS;
  });

  const [searchFilters, setSearchFilters] = useState<QuickSearchFilters>({
    checkInDate: getTomorrowDate(),
    checkOutDate: getAfterTomorrowDate(),
    adults: 2,
    children: 0,
    roomType: 'All',
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<Package | null>(null);
  
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<Booking | null>(null);
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync state to local storage
  const safeSave = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Storage save error for ${key}:`, e);
    }
  };

  useEffect(() => {
    safeSave('sltt_resort_info', resortInfo);
  }, [resortInfo]);

  useEffect(() => {
    safeSave('sltt_payment_settings', paymentSettings);
  }, [paymentSettings]);

  useEffect(() => {
    safeSave('sltt_packages', packages);
  }, [packages]);

  useEffect(() => {
    safeSave('sltt_addons_v1', addOns);
  }, [addOns]);

  useEffect(() => {
    safeSave('sltt_amenities_v2', amenities);
  }, [amenities]);

  useEffect(() => {
    safeSave('sltt_gallery', gallery);
  }, [gallery]);

  useEffect(() => {
    safeSave('sltt_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeSave('sltt_bookings', bookings);
  }, [bookings]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplates>(() => {
    try {
      const saved = localStorage.getItem('sltt_notification_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_NOTIFICATION_TEMPLATES,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error('Error loading notification templates:', e);
    }
    return DEFAULT_NOTIFICATION_TEMPLATES;
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_notification_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading notification logs:', e);
    }
    return [];
  });

  useEffect(() => {
    safeSave('sltt_notification_templates', notificationTemplates);
  }, [notificationTemplates]);

  useEffect(() => {
    safeSave('sltt_notification_logs', notificationLogs);
  }, [notificationLogs]);

  // Live Chat state
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [currentCustomerThreadId, setCurrentCustomerThreadId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sltt_current_chat_thread_id') || null;
    } catch {
      return null;
    }
  });

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('sltt_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading chat threads:', e);
    }
    return INITIAL_CHAT_THREADS;
  });

  useEffect(() => {
    safeSave('sltt_chat_threads', chatThreads);
  }, [chatThreads]);

  useEffect(() => {
    if (currentCustomerThreadId) {
      try {
        localStorage.setItem('sltt_current_chat_thread_id', currentCustomerThreadId);
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    }
  }, [currentCustomerThreadId]);

  const isSavingResortInfoRef = useRef(false);
  const isSavingPaymentSettingsRef = useRef(false);

  // --- FIRESTORE DATABASE INITIALIZATION & REALTIME SYNC ---
  useEffect(() => {
    seedFirestoreIfEmpty(
      DEFAULT_ADMIN_USERS,
      INITIAL_ROOMS,
      INITIAL_PACKAGES,
      INITIAL_BOOKINGS,
      INITIAL_RESORT_INFO,
      INITIAL_PAYMENT_SETTINGS,
      INITIAL_CHAT_THREADS,
      ADD_ON_SERVICES
    );

    const unsubUsers = subscribeAdminUsers((users) => setAdminUsers(users));
    const unsubBookings = subscribeBookings((b) => setBookings(b));
    const unsubRooms = subscribeRooms((r) => setRooms(r));
    const unsubPackages = subscribePackages((p) => setPackages(p));
    const unsubAddOns = subscribeAddOns((a) => setAddOns(a));
    const unsubChat = subscribeChatThreads((t) => setChatThreads(t));
    const unsubSettings = subscribeSettings(
      (info) => {
        if (!isSavingResortInfoRef.current && info) {
          setResortInfo((prev) => ({ ...INITIAL_RESORT_INFO, ...info }));
        }
      },
      (payment) => {
        if (!isSavingPaymentSettingsRef.current && payment) {
          setPaymentSettings((prev) => ({ ...INITIAL_PAYMENT_SETTINGS, ...payment }));
        }
      }
    );

    return () => {
      unsubUsers();
      unsubBookings();
      unsubRooms();
      unsubPackages();
      unsubAddOns();
      unsubChat();
      unsubSettings();
    };
  }, []);

  const unreadChatCountOwner = chatThreads.reduce((acc, t) => acc + (t.unreadCountOwner || 0), 0);

  const createOrStartChatThread = (
    guestInfo: { name: string; email?: string; phone?: string; subject?: string },
    initialText?: string,
    imageUrl?: string
  ): string => {
    const now = new Date().toISOString();
    let existing = chatThreads.find(
      (t) =>
        (guestInfo.email && t.customerEmail?.toLowerCase() === guestInfo.email.toLowerCase()) ||
        (guestInfo.phone && t.customerPhone === guestInfo.phone) ||
        (currentCustomerThreadId && t.id === currentCustomerThreadId)
    );

    let threadId = existing ? existing.id : `CHAT-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!existing) {
      const newMessages: ChatMessage[] = [];
      if (initialText || imageUrl) {
        newMessages.push({
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: guestInfo.name,
          text: initialText || (imageUrl ? '📷 [Image Attachment]' : ''),
          imageUrl: imageUrl || undefined,
          timestamp: now,
          read: false,
        });
        // Auto bot response from Front Desk
        newMessages.push({
          id: `msg-${Date.now() + 1}`,
          sender: 'owner',
          senderName: 'Front Desk Admin',
          text: `Hello ${guestInfo.name}! Thank you for messaging SLTT ESTANCIAS. Our front desk management is active 24/7 and will reply to you directly.`,
          timestamp: new Date(Date.now() + 100).toISOString(),
          read: true,
        });
      }

      const newThread: ChatThread = {
        id: threadId,
        customerName: guestInfo.name,
        customerEmail: guestInfo.email,
        customerPhone: guestInfo.phone,
        subject: guestInfo.subject || 'General Inquiry',
        lastMessage: initialText || (imageUrl ? '📷 [Image Attachment]' : 'Started live chat conversation'),
        lastUpdated: now,
        unreadCountOwner: initialText || imageUrl ? 1 : 0,
        unreadCountCustomer: 0,
        messages: newMessages,
        status: 'active',
      };

      saveChatThreadToFirestore(newThread);
      setChatThreads((prev) => [newThread, ...prev]);
    } else if (initialText || imageUrl) {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'customer',
        senderName: guestInfo.name || existing.customerName,
        text: initialText || (imageUrl ? '📷 [Image Attachment]' : ''),
        imageUrl: imageUrl || undefined,
        timestamp: now,
        read: false,
      };
      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id === threadId) {
            const updated: ChatThread = {
              ...t,
              customerName: guestInfo.name || t.customerName,
              customerEmail: guestInfo.email || t.customerEmail,
              customerPhone: guestInfo.phone || t.customerPhone,
              lastMessage: initialText || (imageUrl ? '📷 [Image Attachment]' : t.lastMessage),
              lastUpdated: now,
              unreadCountOwner: t.unreadCountOwner + 1,
              messages: [...t.messages, msg],
            };
            saveChatThreadToFirestore(updated);
            return updated;
          }
          return t;
        })
      );
    }

    setCurrentCustomerThreadId(threadId);
    return threadId;
  };

  const sendChatMessage = (
    threadId: string,
    text: string,
    sender: 'customer' | 'owner',
    senderName?: string,
    imageUrl?: string
  ) => {
    if (!text.trim() && !imageUrl) return;
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: senderName || (sender === 'owner' ? 'Front Desk Admin' : 'Customer'),
      text: text.trim() || (imageUrl ? '📷 [Image Attachment]' : ''),
      imageUrl: imageUrl || undefined,
      timestamp: now,
      read: false,
    };

    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const isOwner = sender === 'owner';
          const updated: ChatThread = {
            ...t,
            lastMessage: text.trim() || (imageUrl ? '📷 [Image Attachment]' : t.lastMessage),
            lastUpdated: now,
            unreadCountOwner: isOwner ? t.unreadCountOwner : t.unreadCountOwner + 1,
            unreadCountCustomer: isOwner ? t.unreadCountCustomer + 1 : t.unreadCountCustomer,
            messages: [...t.messages, newMsg],
          };
          saveChatThreadToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const markThreadReadByOwner = (threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const updated: ChatThread = {
            ...t,
            unreadCountOwner: 0,
            messages: t.messages.map((m) => (m.sender === 'customer' ? { ...m, read: true } : m)),
          };
          saveChatThreadToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const markThreadReadByCustomer = (threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const updated: ChatThread = {
            ...t,
            unreadCountCustomer: 0,
            messages: t.messages.map((m) => (m.sender === 'owner' ? { ...m, read: true } : m)),
          };
          saveChatThreadToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteChatThread = (threadId: string) => {
    deleteChatThreadFromFirestore(threadId);
    setChatThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (currentCustomerThreadId === threadId) {
      setCurrentCustomerThreadId(null);
    }
  };

  // User Management Methods
  const authenticateAdminUser = (username: string, pass: string): AdminUser | null => {
    const cleanUsername = (username || '').trim().toLowerCase();
    const found = adminUsers.find(
      (u) => (u?.username || '').trim().toLowerCase() === cleanUsername && u?.password === pass && u?.isActive
    );
    if (found) {
      const updatedUser = { ...found, lastLogin: new Date().toISOString() };
      setCurrentAdminUser(updatedUser);
      saveAdminUserToFirestore(updatedUser);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === found.id ? updatedUser : u))
      );
      return updatedUser;
    }
    return null;
  };

  const addAdminUser = (userData: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser => {
    const newUser: AdminUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveAdminUserToFirestore(newUser);
    setAdminUsers((prev) => [...prev, newUser]);
    showToast(`Staff account for ${newUser.fullName} created successfully.`, 'success');
    return newUser;
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    const target = adminUsers.find((u) => u.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    saveAdminUserToFirestore(updated);
    if (currentAdminUser && currentAdminUser.id === id) {
      setCurrentAdminUser(updated);
    }
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? updated : u))
    );
    showToast('User account updated.', 'success');
  };

  const deleteAdminUser = (id: string) => {
    const target = adminUsers.find((u) => u.id === id);
    if (target?.username === 'SLTTESTANCIA_ADMIN') {
      showToast('Cannot delete primary Super Admin account.', 'error');
      return;
    }
    deleteAdminUserFromFirestore(id);
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User account removed.', 'info');
  };

  const resetAdminUserPassword = (id: string, newPass: string) => {
    const target = adminUsers.find((u) => u.id === id);
    if (!target) return;
    const updated = { ...target, password: newPass };
    saveAdminUserToFirestore(updated);
    if (currentAdminUser && currentAdminUser.id === id) {
      setCurrentAdminUser(updated);
    }
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? updated : u))
    );
    showToast('Password updated successfully.', 'success');
  };

  const toggleAdminUserStatus = (id: string) => {
    const target = adminUsers.find((u) => u.id === id);
    if (target?.username === 'SLTTESTANCIA_ADMIN') {
      showToast('Primary Super Admin cannot be deactivated.', 'error');
      return;
    }
    if (!target) return;
    const updated = { ...target, isActive: !target.isActive };
    saveAdminUserToFirestore(updated);
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? updated : u))
    );
    showToast('User account status updated.', 'info');
  };

  const syncAllDataToFirebase = async (): Promise<boolean> => {
    showToast('Syncing all application data to Firebase Firestore Database...', 'info');
    const success = await forceSyncAllToFirestore(
      adminUsers,
      rooms,
      packages,
      bookings,
      resortInfo,
      paymentSettings,
      chatThreads,
      addOns
    );
    if (success) {
      showToast('All collections successfully synchronized to Firebase Firestore!', 'success');
    } else {
      showToast('Failed to sync data to Firebase Cloud Database.', 'error');
    }
    return success;
  };


  const updateNotificationTemplates = (newTemplates: NotificationTemplates) => {
    setNotificationTemplates(newTemplates);
    showToast('Email notification templates saved successfully.', 'success');
  };

  const sendNotification = (
    booking: Booking,
    type: 'Email',
    triggerEvent: NotificationLog['triggerEvent'],
    customContent?: { emailSubject?: string; emailBody?: string }
  ): NotificationLog => {
    const emailSub = customContent?.emailSubject || formatNotificationMessage(notificationTemplates.emailSubject, booking, resortInfo);
    const emailBodyText = customContent?.emailBody || formatNotificationMessage(notificationTemplates.emailBody, booking, resortInfo);

    const fullBody = `Subject: ${emailSub}\n\n${emailBodyText}`;

    const logEntry: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bookingId: booking.id,
      bookingRef: booking.referenceNumber || booking.id,
      timestamp: new Date().toISOString(),
      type: 'Email',
      recipientEmail: booking.email,
      recipientMobile: booking.mobile,
      subject: emailSub,
      body: fullBody,
      status: 'Sent',
      triggerEvent,
    };

    setNotificationLogs((prev) => [logEntry, ...prev]);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              notificationsSent: [logEntry, ...(b.notificationsSent || [])],
            }
          : b
      )
    );

    showToast(`Dispatched Email Notification to ${booking.guestName} (${booking.email})`, 'success');
    return logEntry;
  };

  const updateResortInfo = async (info: ResortInfo, customSuccessMsg?: string): Promise<boolean> => {
    isSavingResortInfoRef.current = true;
    setResortInfo(info);
    safeSave('sltt_resort_info', info);
    try {
      await saveResortInfoToFirestore(info);
      showToast(customSuccessMsg || 'Overall System Portal details & design assets updated.', 'success');
      return true;
    } catch (err) {
      console.error('Error saving resort info to Firestore:', err);
      showToast('Failed to save changes to cloud database. Please try again.', 'error');
      return false;
    } finally {
      setTimeout(() => {
        isSavingResortInfoRef.current = false;
      }, 500);
    }
  };

  const updatePaymentSettings = async (settings: PaymentSettings): Promise<boolean> => {
    isSavingPaymentSettingsRef.current = true;
    setPaymentSettings(settings);
    safeSave('sltt_payment_settings', settings);
    try {
      await savePaymentSettingsToFirestore(settings);
      showToast('Payment Options and Bank Details saved.', 'success');
      return true;
    } catch (err) {
      console.error('Error saving payment settings to Firestore:', err);
      showToast('Failed to save Payment Options to cloud database.', 'error');
      return false;
    } finally {
      setTimeout(() => {
        isSavingPaymentSettingsRef.current = false;
      }, 500);
    }
  };

  const addBooking = (newBooking: Booking) => {
    let finalBooking = newBooking;

    if (notificationTemplates.autoSendOnBookingCreated) {
      const emailSub = formatNotificationMessage(notificationTemplates.emailSubject, newBooking, resortInfo);
      const emailBodyText = formatNotificationMessage(notificationTemplates.emailBody, newBooking, resortInfo);

      const logEntry: NotificationLog = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        bookingId: newBooking.id,
        bookingRef: newBooking.referenceNumber || newBooking.id,
        timestamp: new Date().toISOString(),
        type: 'Email',
        recipientEmail: newBooking.email,
        recipientMobile: newBooking.mobile,
        subject: emailSub,
        body: `Subject: ${emailSub}\n\n${emailBodyText}`,
        status: 'Sent',
        triggerEvent: 'Booking Created',
      };

      setNotificationLogs((prev) => [logEntry, ...prev]);
      finalBooking = {
        ...newBooking,
        notificationsSent: [logEntry],
      };
    }

    saveBookingToFirestore(finalBooking);
    setBookings((prev) => [finalBooking, ...prev]);
    setLastSubmittedBooking(finalBooking);
    showToast(`Booking submitted! Automated Confirmation Email sent to ${newBooking.email}`, 'success');
  };

  const updateBookingStatus = (
    id: string,
    status: BookingStatus,
    notes?: string,
    paymentStatus?: 'Unpaid' | 'Deposit Paid' | 'Fully Paid'
  ) => {
    const targetBooking = bookings.find((b) => b.id === id);

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        let updatedNotifications = b.notificationsSent || [];

        if (status === 'Confirmed' && notificationTemplates.autoSendOnConfirm) {
          const emailSub = formatNotificationMessage(notificationTemplates.emailSubject, b, resortInfo);
          const emailBodyText = formatNotificationMessage(notificationTemplates.emailBody, b, resortInfo);

          const logEntry: NotificationLog = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            bookingId: b.id,
            bookingRef: b.referenceNumber || b.id,
            timestamp: new Date().toISOString(),
            type: 'Email',
            recipientEmail: b.email,
            recipientMobile: b.mobile,
            subject: emailSub,
            body: `Subject: ${emailSub}\n\n${emailBodyText}`,
            status: 'Sent',
            triggerEvent: 'Booking Confirmed',
          };

          setNotificationLogs((prevLogs) => [logEntry, ...prevLogs]);
          updatedNotifications = [logEntry, ...updatedNotifications];
        }

        const updatedBooking: Booking = {
          ...b,
          status,
          adminNotes: notes !== undefined ? notes : b.adminNotes,
          paymentStatus: paymentStatus !== undefined ? paymentStatus : b.paymentStatus,
          notificationsSent: updatedNotifications,
        };

        saveBookingToFirestore(updatedBooking);
        return updatedBooking;
      })
    );

    if (status === 'Confirmed' && notificationTemplates.autoSendOnConfirm && targetBooking) {
      showToast(`Booking ${targetBooking.referenceNumber || id} CONFIRMED! Automated Email notification dispatched to ${targetBooking.email}`, 'success');
    } else {
      showToast(`Booking ${id} status updated to ${status}.`, 'info');
    }
  };

  const deleteBooking = (id: string) => {
    deleteBookingFromFirestore(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast('Booking deleted.', 'info');
  };

  const attachBookingReceipt = (bookingId: string, receiptUrl: string, refCode?: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      const updated: Booking = {
        ...target,
        paymentReceiptUrl: receiptUrl,
        paymentReferenceCode: refCode || target.paymentReferenceCode,
      };
      saveBookingToFirestore(updated);
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              paymentReceiptUrl: receiptUrl,
              paymentReferenceCode: refCode || b.paymentReferenceCode,
            }
          : b
      )
    );
    showToast('Payment receipt uploaded successfully!', 'success');
  };

  const toggleRoomAvailability = async (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      const updated = { ...target, isAvailable: !target.isAvailable };
      try {
        await saveRoomToFirestore(updated);
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, isAvailable: !r.isAvailable } : r))
        );
        showToast('Room availability updated.', 'info');
      } catch (err) {
        showToast('Failed to update room availability.', 'error');
      }
    }
  };

  const updateRoomPrice = async (roomId: string, newPrice: number) => {
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      const updated = { ...target, pricePerNight: newPrice };
      try {
        await saveRoomToFirestore(updated);
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, pricePerNight: newPrice } : r))
        );
        showToast('Room price updated.', 'success');
      } catch (err) {
        showToast('Failed to update room price.', 'error');
      }
    }
  };

  const addRoom = async (newRoom: Room): Promise<void> => {
    try {
      await saveRoomToFirestore(newRoom);
      setRooms((prev) => [...prev, newRoom]);
      showToast(`Room "${newRoom.name}" added.`, 'success');
    } catch (err) {
      console.error('Error adding room:', err);
      showToast('Room details could not be saved to database.', 'error');
      throw err;
    }
  };

  const updateRoom = async (updatedRoom: Room): Promise<void> => {
    try {
      await saveRoomToFirestore(updatedRoom);
      setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
      showToast(`Room "${updatedRoom.name}" updated.`, 'success');
    } catch (err) {
      console.error('Error updating room:', err);
      showToast('Room details could not be saved to database.', 'error');
      throw err;
    }
  };

  const deleteRoom = async (roomId: string): Promise<void> => {
    try {
      await deleteRoomFromFirestore(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      showToast('Room deleted.', 'info');
    } catch (err) {
      console.error('Error deleting room:', err);
      showToast('Failed to delete room from database.', 'error');
      throw err;
    }
  };

  const blockRoomDates = async (roomId: string, dates: string[]) => {
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      const updated = { ...target, blockedDates: dates };
      try {
        await saveRoomToFirestore(updated);
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, blockedDates: dates } : r))
        );
        showToast('Blocked dates saved for room.', 'success');
      } catch (err) {
        showToast('Failed to save blocked dates.', 'error');
      }
    }
  };

  const addPackage = (newPkg: Package) => {
    savePackageToFirestore(newPkg);
    setPackages((prev) => [...prev, newPkg]);
    showToast(`Package "${newPkg.name}" added.`, 'success');
  };

  const updatePackage = (updatedPkg: Package) => {
    savePackageToFirestore(updatedPkg);
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
    showToast(`Package "${updatedPkg.name}" updated.`, 'success');
  };

  const deletePackage = (pkgId: string) => {
    deletePackageFromFirestore(pkgId);
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    showToast('Package removed.', 'info');
  };

  const addAddOn = (newAddon: AddOnService) => {
    saveAddOnToFirestore(newAddon);
    setAddOns((prev) => [...prev, newAddon]);
    showToast(`Add-on "${newAddon.name}" added successfully.`, 'success');
  };

  const updateAddOn = (updatedAddon: AddOnService) => {
    saveAddOnToFirestore(updatedAddon);
    setAddOns((prev) => prev.map((a) => (a.id === updatedAddon.id ? updatedAddon : a)));
    showToast(`Add-on "${updatedAddon.name}" updated.`, 'success');
  };

  const deleteAddOn = (addonId: string) => {
    deleteAddOnFromFirestore(addonId);
    setAddOns((prev) => prev.filter((a) => a.id !== addonId));
    showToast('Add-on deleted.', 'info');
  };

  const toggleAddOnActive = (addonId: string) => {
    const target = addOns.find((a) => a.id === addonId);
    if (!target) return;
    const currentActive = target.isActive !== false;
    const updated: AddOnService = { ...target, isActive: !currentActive };
    saveAddOnToFirestore(updated);
    setAddOns((prev) => prev.map((a) => (a.id === addonId ? updated : a)));
    showToast(`Add-on status set to ${!currentActive ? 'Active' : 'Inactive'}.`, 'info');
  };

  const getRoomById = (id: string) => rooms.find((r) => r.id === id);

  const getBookingByReference = (ref: string) =>
    bookings.find((b) => (b?.referenceNumber || '').trim().toUpperCase() === (ref || '').trim().toUpperCase());

  return (
    <ResortContext.Provider
      value={{
        activeTab,
        setActiveTab,
        resortInfo,
        setResortInfo,
        updateResortInfo,
        paymentSettings,
        setPaymentSettings,
        updatePaymentSettings,
        customization,
        setCustomization,
        rooms,
        setRooms,
        packages,
        setPackages,
        amenities,
        setAmenities,
        gallery,
        setGallery,
        reviews,
        setReviews,
        bookings,
        theme,
        setTheme,
        toggleTheme,
        searchFilters,
        setSearchFilters,
        isBookingModalOpen,
        setIsBookingModalOpen,
        selectedRoomForBooking,
        setSelectedRoomForBooking,
        selectedPackageForBooking,
        setSelectedPackageForBooking,
        selectedRoomDetails,
        setSelectedRoomDetails,
        activeLightboxIndex,
        setActiveLightboxIndex,
        lastSubmittedBooking,
        setLastSubmittedBooking,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isVisualEditMode,
        setIsVisualEditMode,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        attachBookingReceipt,
        toggleRoomAvailability,
        updateRoomPrice,
        addRoom,
        updateRoom,
        deleteRoom,
        blockRoomDates,
        addPackage,
        updatePackage,
        deletePackage,
        addOns,
        setAddOns,
        addAddOn,
        updateAddOn,
        deleteAddOn,
        toggleAddOnActive,
        getRoomById,
        getBookingByReference,
        notificationTemplates,
        updateNotificationTemplates,
        notificationLogs,
        sendNotification,
        toastMessage,
        showToast,
        isLiveChatOpen,
        setIsLiveChatOpen,
        chatThreads,
        currentCustomerThreadId,
        setCurrentCustomerThreadId,
        sendChatMessage,
        createOrStartChatThread,
        markThreadReadByOwner,
        markThreadReadByCustomer,
        deleteChatThread,
        unreadChatCountOwner,
        adminUsers,
        currentAdminUser,
        setCurrentAdminUser,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        resetAdminUserPassword,
        toggleAdminUserStatus,
        authenticateAdminUser,
        syncAllDataToFirebase,
      }}
    >
      {children}
    </ResortContext.Provider>
  );
};

export const useResort = () => {
  const context = useContext(ResortContext);
  if (!context) {
    throw new Error('useResort must be used within a ResortProvider');
  }
  return context;
};
