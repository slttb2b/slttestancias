import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AdminUser,
  Booking,
  Room,
  Package,
  AddOnService,
  ResortInfo,
  PaymentSettings,
  ChatThread,
  Amenity,
  GalleryItem,
  Testimonial,
  NotificationTemplates,
} from '../types';

export const COLLECTIONS = {
  ADMIN_USERS: 'admin_users',
  BOOKINGS: 'bookings',
  ROOMS: 'rooms',
  PACKAGES: 'packages',
  ADD_ONS: 'add_ons',
  AMENITIES: 'amenities',
  GALLERY: 'gallery',
  REVIEWS: 'reviews',
  CHAT_THREADS: 'chat_threads',
  SETTINGS: 'settings',
};

export const SETTINGS_DOCS = {
  APP_INITIALIZED: 'app_initialized',
  RESORT_INFO: 'resort_info',
  PAYMENT_SETTINGS: 'payment_settings',
  NOTIFICATION_TEMPLATES: 'notification_templates',
  CUSTOMIZATION: 'customization',
};

/**
 * Sanitizes an object before writing to Firestore by removing undefined values recursively.
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Common handler for Firestore subscription errors.
 */
function handleFirestoreError(collectionName: string, error: unknown) {
  console.warn(
    `[Firestore] Firestore read/subscription warning for "${collectionName}" - defaults will NOT overwrite existing cloud data:`,
    error
  );
}

// Singleton promise lock to prevent concurrent initialization runs in React StrictMode
let initializationPromise: Promise<void> | null = null;

/**
 * Permanent Initialization Guard
 *
 * Checks settings/app_initialized.
 * If true: preserves all existing cloud data without seeding.
 * If false: checks if production data already exists. If yes, marks initialized without overwriting.
 * Only if database is truly brand new and empty: seeds initial defaults and writes app_initialized = true.
 */
export const seedFirestoreIfEmpty = async (
  defaultAdminUsers: AdminUser[],
  defaultRooms: Room[],
  defaultPackages: Package[],
  defaultResortInfo: ResortInfo,
  defaultPaymentSettings: PaymentSettings,
  defaultAddOns: AddOnService[],
  defaultAmenities: Amenity[],
  defaultGallery: GalleryItem[],
  defaultReviews: Testimonial[],
  defaultNotificationTemplates: NotificationTemplates
): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('[Firestore] Checking initialization status...');
      const initDocRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.APP_INITIALIZED);
      const initDocSnap = await getDoc(initDocRef);

      if (initDocSnap.exists() && initDocSnap.data()?.initialized === true) {
        console.log('[Firestore] App already initialized. Preserving all cloud data.');
        return;
      }

      // Check if existing production data is already present in Firestore
      console.log('[Firestore] Initialization flag not found. Inspecting Firestore collections for existing data...');
      const [resortInfoSnap, roomsSnap, usersSnap, packagesSnap, bookingsSnap] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.RESORT_INFO)),
        getDocs(collection(db, COLLECTIONS.ROOMS)),
        getDocs(collection(db, COLLECTIONS.ADMIN_USERS)),
        getDocs(collection(db, COLLECTIONS.PACKAGES)),
        getDocs(collection(db, COLLECTIONS.BOOKINGS)),
      ]);

      const hasExistingData =
        resortInfoSnap.exists() ||
        !roomsSnap.empty ||
        !usersSnap.empty ||
        !packagesSnap.empty ||
        !bookingsSnap.empty;

      if (hasExistingData) {
        console.log('[Firestore] Existing production data detected - marked as initialized without overwriting.');
        await setDoc(initDocRef, {
          initialized: true,
          initializedAt: new Date().toISOString(),
          schemaVersion: 1,
        });
        return;
      }

      // Only executed on a 100% brand-new, clean database
      console.log('[Firestore] Truly empty database detected. First-time initialization started...');

      // 1. Seed Admin Users
      for (const u of defaultAdminUsers) {
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, u.id), cleanForFirestore(u));
      }

      // 2. Seed Rooms
      for (const r of defaultRooms) {
        await setDoc(doc(db, COLLECTIONS.ROOMS, r.id), cleanForFirestore(r));
      }

      // 3. Seed Packages
      for (const p of defaultPackages) {
        await setDoc(doc(db, COLLECTIONS.PACKAGES, p.id), cleanForFirestore(p));
      }

      // 4. Seed Add-ons
      for (const addon of defaultAddOns) {
        await setDoc(doc(db, COLLECTIONS.ADD_ONS, addon.id), cleanForFirestore(addon));
      }

      // 5. Seed Amenities
      for (const a of defaultAmenities) {
        await setDoc(doc(db, COLLECTIONS.AMENITIES, a.id), cleanForFirestore(a));
      }

      // 6. Seed Gallery
      for (const g of defaultGallery) {
        await setDoc(doc(db, COLLECTIONS.GALLERY, g.id), cleanForFirestore(g));
      }

      // 7. Seed Reviews
      for (const rev of defaultReviews) {
        await setDoc(doc(db, COLLECTIONS.REVIEWS, rev.id), cleanForFirestore(rev));
      }

      // 8. Seed Settings
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.RESORT_INFO), cleanForFirestore(defaultResortInfo));
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.PAYMENT_SETTINGS), cleanForFirestore(defaultPaymentSettings));
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.NOTIFICATION_TEMPLATES), cleanForFirestore(defaultNotificationTemplates));

      // Mark initialized
      await setDoc(initDocRef, {
        initialized: true,
        initializedAt: new Date().toISOString(),
        schemaVersion: 1,
      });

      console.log('[Firestore] Default seed completed successfully.');
      console.log('[Firestore] Initialization completed.');
    } catch (error) {
      console.error('[Firestore] Error checking or seeding Firestore:', error);
      console.log('[Firestore] Firestore read failed - defaults will NOT overwrite existing data');
    }
  })();

  return initializationPromise;
};

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export const subscribeAdminUsers = (callback: (users: AdminUser[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.ADMIN_USERS),
    (snapshot) => {
      const users: AdminUser[] = snapshot.docs.map((d) => ({
        ...(d.data() as AdminUser),
        id: d.id,
      }));
      callback(users);
    },
    (err) => handleFirestoreError(COLLECTIONS.ADMIN_USERS, err)
  );
};

export const subscribeBookings = (callback: (bookings: Booking[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.BOOKINGS),
    (snapshot) => {
      const bookings: Booking[] = snapshot.docs.map((d) => ({
        ...(d.data() as Booking),
        id: d.id,
      }));
      callback(bookings);
    },
    (err) => handleFirestoreError(COLLECTIONS.BOOKINGS, err)
  );
};

export const subscribeRooms = (callback: (rooms: Room[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.ROOMS),
    (snapshot) => {
      const rooms: Room[] = snapshot.docs.map((d) => ({
        ...(d.data() as Room),
        id: d.id,
      }));
      callback(rooms);
    },
    (err) => handleFirestoreError(COLLECTIONS.ROOMS, err)
  );
};

export const subscribePackages = (callback: (packages: Package[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.PACKAGES),
    (snapshot) => {
      const packages: Package[] = snapshot.docs.map((d) => ({
        ...(d.data() as Package),
        id: d.id,
      }));
      callback(packages);
    },
    (err) => handleFirestoreError(COLLECTIONS.PACKAGES, err)
  );
};

export const subscribeAddOns = (callback: (addOns: AddOnService[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.ADD_ONS),
    (snapshot) => {
      const addOns: AddOnService[] = snapshot.docs.map((d) => ({
        ...(d.data() as AddOnService),
        id: d.id,
      }));
      callback(addOns);
    },
    (err) => handleFirestoreError(COLLECTIONS.ADD_ONS, err)
  );
};

export const subscribeAmenities = (callback: (amenities: Amenity[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.AMENITIES),
    (snapshot) => {
      const amenities: Amenity[] = snapshot.docs.map((d) => ({
        ...(d.data() as Amenity),
        id: d.id,
      }));
      callback(amenities);
    },
    (err) => handleFirestoreError(COLLECTIONS.AMENITIES, err)
  );
};

export const subscribeGallery = (callback: (gallery: GalleryItem[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.GALLERY),
    (snapshot) => {
      const gallery: GalleryItem[] = snapshot.docs.map((d) => ({
        ...(d.data() as GalleryItem),
        id: d.id,
      }));
      callback(gallery);
    },
    (err) => handleFirestoreError(COLLECTIONS.GALLERY, err)
  );
};

export const subscribeReviews = (callback: (reviews: Testimonial[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.REVIEWS),
    (snapshot) => {
      const reviews: Testimonial[] = snapshot.docs.map((d) => ({
        ...(d.data() as Testimonial),
        id: d.id,
      }));
      callback(reviews);
    },
    (err) => handleFirestoreError(COLLECTIONS.REVIEWS, err)
  );
};

export const subscribeChatThreads = (callback: (threads: ChatThread[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.CHAT_THREADS),
    (snapshot) => {
      const threads: ChatThread[] = snapshot.docs.map((d) => ({
        ...(d.data() as ChatThread),
        id: d.id,
      }));
      callback(threads);
    },
    (err) => handleFirestoreError(COLLECTIONS.CHAT_THREADS, err)
  );
};

export const subscribeSettings = (
  onResortInfo: (info: ResortInfo) => void,
  onPaymentSettings: (settings: PaymentSettings) => void,
  onNotificationTemplates?: (templates: NotificationTemplates) => void
) => {
  return onSnapshot(
    collection(db, COLLECTIONS.SETTINGS),
    (snapshot) => {
      snapshot.forEach((docSnap) => {
        if (docSnap.id === SETTINGS_DOCS.RESORT_INFO) {
          onResortInfo(docSnap.data() as ResortInfo);
        } else if (docSnap.id === SETTINGS_DOCS.PAYMENT_SETTINGS) {
          onPaymentSettings(docSnap.data() as PaymentSettings);
        } else if (docSnap.id === SETTINGS_DOCS.NOTIFICATION_TEMPLATES && onNotificationTemplates) {
          onNotificationTemplates(docSnap.data() as NotificationTemplates);
        }
      });
    },
    (err) => handleFirestoreError(COLLECTIONS.SETTINGS, err)
  );
};

// ==========================================
// PERSISTENT CRUD OPERATIONS
// ==========================================

export const saveAdminUserToFirestore = async (user: AdminUser) => {
  return setDoc(doc(db, COLLECTIONS.ADMIN_USERS, user.id), cleanForFirestore(user));
};

export const deleteAdminUserFromFirestore = async (userId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.ADMIN_USERS, userId));
};

export const saveBookingToFirestore = async (booking: Booking) => {
  return setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), cleanForFirestore(booking));
};

export const deleteBookingFromFirestore = async (bookingId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
};

export const clearAllBookingsFromFirestore = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  return batch.commit();
};

export const saveRoomToFirestore = async (room: Room) => {
  return setDoc(doc(db, COLLECTIONS.ROOMS, room.id), cleanForFirestore(room));
};

export const deleteRoomFromFirestore = async (roomId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));
};

export const savePackageToFirestore = async (pkg: Package) => {
  return setDoc(doc(db, COLLECTIONS.PACKAGES, pkg.id), cleanForFirestore(pkg));
};

export const deletePackageFromFirestore = async (pkgId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.PACKAGES, pkgId));
};

export const saveAddOnToFirestore = async (addon: AddOnService) => {
  return setDoc(doc(db, COLLECTIONS.ADD_ONS, addon.id), cleanForFirestore(addon));
};

export const deleteAddOnFromFirestore = async (addonId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.ADD_ONS, addonId));
};

export const saveAmenityToFirestore = async (amenity: Amenity) => {
  return setDoc(doc(db, COLLECTIONS.AMENITIES, amenity.id), cleanForFirestore(amenity));
};

export const deleteAmenityFromFirestore = async (amenityId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.AMENITIES, amenityId));
};

export const saveGalleryItemToFirestore = async (item: GalleryItem) => {
  return setDoc(doc(db, COLLECTIONS.GALLERY, item.id), cleanForFirestore(item));
};

export const deleteGalleryItemFromFirestore = async (itemId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.GALLERY, itemId));
};

export const saveReviewToFirestore = async (review: Testimonial) => {
  return setDoc(doc(db, COLLECTIONS.REVIEWS, review.id), cleanForFirestore(review));
};

export const deleteReviewFromFirestore = async (reviewId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.REVIEWS, reviewId));
};

export const saveChatThreadToFirestore = async (thread: ChatThread) => {
  return setDoc(doc(db, COLLECTIONS.CHAT_THREADS, thread.id), cleanForFirestore(thread));
};

export const deleteChatThreadFromFirestore = async (threadId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.CHAT_THREADS, threadId));
};

export const clearAllChatThreadsFromFirestore = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.CHAT_THREADS));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  return batch.commit();
};

export const saveResortInfoToFirestore = async (info: ResortInfo) => {
  return setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.RESORT_INFO), cleanForFirestore(info));
};

export const savePaymentSettingsToFirestore = async (settings: PaymentSettings) => {
  return setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.PAYMENT_SETTINGS), cleanForFirestore(settings));
};

export const saveNotificationTemplatesToFirestore = async (templates: NotificationTemplates) => {
  return setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.NOTIFICATION_TEMPLATES), cleanForFirestore(templates));
};

/**
 * Manual sync function for Super Admin console.
 */
export const forceSyncAllToFirestore = async (
  users: AdminUser[],
  rooms: Room[],
  packages: Package[],
  addOns: AddOnService[],
  amenities: Amenity[],
  gallery: GalleryItem[],
  reviews: Testimonial[],
  resortInfo: ResortInfo,
  paymentSettings: PaymentSettings,
  notificationTemplates: NotificationTemplates
) => {
  for (const u of users) {
    await saveAdminUserToFirestore(u);
  }
  for (const r of rooms) {
    await saveRoomToFirestore(r);
  }
  for (const p of packages) {
    await savePackageToFirestore(p);
  }
  for (const a of addOns) {
    await saveAddOnToFirestore(a);
  }
  for (const am of amenities) {
    await saveAmenityToFirestore(am);
  }
  for (const g of gallery) {
    await saveGalleryItemToFirestore(g);
  }
  for (const rev of reviews) {
    await saveReviewToFirestore(rev);
  }
  await saveResortInfoToFirestore(resortInfo);
  await savePaymentSettingsToFirestore(paymentSettings);
  await saveNotificationTemplatesToFirestore(notificationTemplates);

  // Guarantee initialized flag
  await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOCS.APP_INITIALIZED), {
    initialized: true,
    initializedAt: new Date().toISOString(),
    schemaVersion: 1,
  });
};
