import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AdminUser,
  Booking,
  Room,
  Package,
  ChatThread,
  PaymentSettings,
  ResortInfo,
} from '../types';

// Collection Names
export const COLLECTIONS = {
  ADMIN_USERS: 'admin_users',
  BOOKINGS: 'bookings',
  ROOMS: 'rooms',
  PACKAGES: 'packages',
  CHAT_THREADS: 'chat_threads',
  SETTINGS: 'settings',
};

// Helper to sanitize objects and strip undefined values before writing to Firestore
function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => cleanForFirestore(item)) as any;

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj as object)) {
    const val = (obj as Record<string, any>)[key];
    if (val !== undefined) {
      cleaned[key] = cleanForFirestore(val);
    }
  }
  return cleaned as T;
}

// --- INITIAL DATA SEEDING WITH INITIALIZATION MARKER ---
export const seedFirestoreIfEmpty = async (
  defaultAdminUsers: AdminUser[],
  defaultRooms: Room[],
  defaultPackages: Package[],
  defaultBookings: Booking[],
  defaultResortInfo: ResortInfo,
  defaultPaymentSettings: PaymentSettings,
  defaultChatThreads: ChatThread[]
) => {
  try {
    // Avoid redundant read checks if the client already knows the database was initialized
    try {
      const localInitialized = localStorage.getItem('sltt_firestore_initialized');
      if (localInitialized === 'true') {
        return;
      }
    } catch {
      // localStorage check fallback
    }

    const initMarkerDoc = doc(db, COLLECTIONS.SETTINGS, 'app_initialized');
    const initMarkerSnap = await getDoc(initMarkerDoc);

    if (initMarkerSnap.exists()) {
      try {
        localStorage.setItem('sltt_firestore_initialized', 'true');
      } catch {}

      // Database has already been seeded in the past.
      // Ensure primary master Super Admin account is intact without re-seeding deleted records.
      const usersSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_USERS));
      const masterDoc = usersSnap.docs.find((d) => d.data().username === 'SLTTESTANCIA_ADMIN');
      if (!masterDoc && defaultAdminUsers.length > 0) {
        const masterUser = defaultAdminUsers[0];
        console.log('[Firestore] Re-verifying primary master Super Admin account...');
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, masterUser.id), cleanForFirestore(masterUser));
      }
      return;
    }

    console.log('[Firestore] First-time database initialization in progress...');

    // 1. Seed Admin Users
    const usersSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_USERS));
    if (usersSnap.empty) {
      console.log('[Firestore] Seeding default admin users...');
      for (const u of defaultAdminUsers) {
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, u.id), cleanForFirestore(u));
      }
    } else {
      const masterDoc = usersSnap.docs.find((d) => d.data().username === 'SLTTESTANCIA_ADMIN');
      if (!masterDoc && defaultAdminUsers.length > 0) {
        const masterUser = defaultAdminUsers[0];
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, masterUser.id), cleanForFirestore(masterUser));
      }
    }

    // 2. Seed Rooms
    const roomsSnap = await getDocs(collection(db, COLLECTIONS.ROOMS));
    if (roomsSnap.empty) {
      console.log('[Firestore] Seeding default rooms...');
      for (const r of defaultRooms) {
        await setDoc(doc(db, COLLECTIONS.ROOMS, r.id), cleanForFirestore(r));
      }
    }

    // 3. Seed Packages
    const packagesSnap = await getDocs(collection(db, COLLECTIONS.PACKAGES));
    if (packagesSnap.empty) {
      console.log('[Firestore] Seeding default packages...');
      for (const p of defaultPackages) {
        await setDoc(doc(db, COLLECTIONS.PACKAGES, p.id), cleanForFirestore(p));
      }
    }

    // 4. Seed Bookings
    const bookingsSnap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
    if (bookingsSnap.empty) {
      console.log('[Firestore] Seeding default bookings...');
      for (const b of defaultBookings) {
        await setDoc(doc(db, COLLECTIONS.BOOKINGS, b.id), cleanForFirestore(b));
      }
    }

    // 5. Seed Settings (Resort Info & Payment Settings)
    const resortInfoDoc = doc(db, COLLECTIONS.SETTINGS, 'resort_info');
    const paymentSettingsDoc = doc(db, COLLECTIONS.SETTINGS, 'payment_settings');
    
    const resortInfoSnap = await getDoc(resortInfoDoc);
    if (!resortInfoSnap.exists()) {
      let infoToSeed = defaultResortInfo;
      try {
        const localSaved = localStorage.getItem('sltt_resort_info');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && typeof parsed === 'object') {
            infoToSeed = { ...defaultResortInfo, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Error reading local sltt_resort_info migration fallback:', e);
      }
      console.log('[Firestore] Seeding resort_info doc...');
      await setDoc(resortInfoDoc, cleanForFirestore(infoToSeed));
    }

    const paymentSettingsSnap = await getDoc(paymentSettingsDoc);
    if (!paymentSettingsSnap.exists()) {
      let paymentToSeed = defaultPaymentSettings;
      try {
        const localSaved = localStorage.getItem('sltt_payment_settings');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && typeof parsed === 'object') {
            paymentToSeed = { ...defaultPaymentSettings, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Error reading local sltt_payment_settings migration fallback:', e);
      }
      console.log('[Firestore] Seeding payment_settings doc...');
      await setDoc(paymentSettingsDoc, cleanForFirestore(paymentToSeed));
    }

    // 6. Seed Chat Threads
    const chatSnap = await getDocs(collection(db, COLLECTIONS.CHAT_THREADS));
    if (chatSnap.empty) {
      for (const t of defaultChatThreads) {
        await setDoc(doc(db, COLLECTIONS.CHAT_THREADS, t.id), cleanForFirestore(t));
      }
    }

    // Write app_initialized marker so future reloads preserve all user updates & deletions
    await setDoc(initMarkerDoc, {
      initialized: true,
      initializedAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem('sltt_firestore_initialized', 'true');
    } catch {}
    console.log('[Firestore] App initialization marker stored successfully.');
  } catch (error: any) {
    if (
      error?.code === 'resource-exhausted' ||
      error?.message?.includes('Quota limit exceeded') ||
      error?.message?.includes('Quota exceeded')
    ) {
      console.warn('[Firestore] Free tier daily quota reached. Resort app is continuing smoothly with local cache & offline storage.');
      try {
        localStorage.setItem('sltt_firestore_initialized', 'true');
      } catch {}
    } else {
      console.warn('[Firestore] Notice during database initialization:', error);
    }
  }
};

export const forceSyncAllToFirestore = async (
  adminUsers: AdminUser[],
  rooms: Room[],
  packages: Package[],
  bookings: Booking[],
  resortInfo: ResortInfo,
  paymentSettings: PaymentSettings,
  chatThreads: ChatThread[]
): Promise<boolean> => {
  try {
    for (const u of adminUsers) {
      await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, u.id), cleanForFirestore(u), { merge: true });
    }
    for (const r of rooms) {
      await setDoc(doc(db, COLLECTIONS.ROOMS, r.id), cleanForFirestore(r), { merge: true });
    }
    for (const p of packages) {
      await setDoc(doc(db, COLLECTIONS.PACKAGES, p.id), cleanForFirestore(p), { merge: true });
    }
    for (const b of bookings) {
      await setDoc(doc(db, COLLECTIONS.BOOKINGS, b.id), cleanForFirestore(b), { merge: true });
    }
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'resort_info'), cleanForFirestore(resortInfo), { merge: true });
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'payment_settings'), cleanForFirestore(paymentSettings), { merge: true });
    for (const t of chatThreads) {
      await setDoc(doc(db, COLLECTIONS.CHAT_THREADS, t.id), cleanForFirestore(t), { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error performing full Firebase sync:', error);
    return false;
  }
};

// Helper to log errors gracefully during offline mode or quota limits
const handleFirestoreError = (collectionName: string, err: any) => {
  if (
    err?.code === 'unavailable' ||
    err?.code === 'resource-exhausted' ||
    err?.code === 'permission-denied' ||
    err?.message?.includes('Quota limit exceeded') ||
    err?.message?.includes('Quota exceeded') ||
    err?.message?.includes('Could not reach Cloud Firestore') ||
    err?.message?.includes('backend')
  ) {
    console.warn(`[Firestore Offline/Quota Mode] Operating on local cache for '${collectionName}'. Reconnecting automatically...`);
  } else {
    console.error(`Error in ${collectionName} snapshot:`, err);
  }
};

// --- REALTIME SUBSCRIBERS ---

export const subscribeAdminUsers = (callback: (users: AdminUser[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.ADMIN_USERS),
    (snapshot) => {
      const users: AdminUser[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ ...docSnap.data(), id: docSnap.id } as AdminUser);
      });
      console.log(`[Firestore] Subscribed admin users count: ${users.length}`);
      callback(users);
    },
    (err) => handleFirestoreError('admin_users', err)
  );
};

export const subscribeBookings = (callback: (bookings: Booking[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.BOOKINGS),
    (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push({ ...docSnap.data(), id: docSnap.id } as Booking);
      });
      console.log(`[Firestore] Subscribed bookings count: ${bookings.length}`);
      callback(bookings);
    },
    (err) => handleFirestoreError('bookings', err)
  );
};

export const subscribeRooms = (callback: (rooms: Room[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.ROOMS),
    (snapshot) => {
      const rooms: Room[] = [];
      snapshot.forEach((docSnap) => {
        rooms.push({ ...docSnap.data(), id: docSnap.id } as Room);
      });
      callback(rooms);
    },
    (err) => handleFirestoreError('rooms', err)
  );
};

export const subscribePackages = (callback: (packages: Package[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.PACKAGES),
    (snapshot) => {
      const pkgs: Package[] = [];
      snapshot.forEach((docSnap) => {
        pkgs.push({ ...docSnap.data(), id: docSnap.id } as Package);
      });
      callback(pkgs);
    },
    (err) => handleFirestoreError('packages', err)
  );
};

export const subscribeChatThreads = (callback: (threads: ChatThread[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.CHAT_THREADS),
    (snapshot) => {
      const threads: ChatThread[] = [];
      snapshot.forEach((docSnap) => {
        threads.push({ ...docSnap.data(), id: docSnap.id } as ChatThread);
      });
      callback(threads);
    },
    (err) => handleFirestoreError('chat_threads', err)
  );
};

export const subscribeSettings = (
  onResortInfo: (info: ResortInfo) => void,
  onPaymentSettings: (settings: PaymentSettings) => void
) => {
  return onSnapshot(
    collection(db, COLLECTIONS.SETTINGS),
    (snapshot) => {
      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'resort_info') {
          onResortInfo(docSnap.data() as ResortInfo);
        } else if (docSnap.id === 'payment_settings') {
          onPaymentSettings(docSnap.data() as PaymentSettings);
        }
      });
    },
    (err) => handleFirestoreError('settings', err)
  );
};

// --- CRUD WRITERS ---

export const saveAdminUserToFirestore = async (user: AdminUser) => {
  try {
    console.log(`[Firestore] Saving admin user: ${user.id}`);
    await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, user.id), cleanForFirestore(user), { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving admin user ${user.id}:`, err);
    throw err;
  }
};

export const updateAdminUserInFirestore = async (userId: string, partial: Partial<AdminUser>) => {
  try {
    console.log(`[Firestore] Updating admin user: ${userId}`);
    await updateDoc(doc(db, COLLECTIONS.ADMIN_USERS, userId), cleanForFirestore(partial));
  } catch (err) {
    console.error(`[Firestore] Error updating admin user ${userId}:`, err);
    throw err;
  }
};

export const deleteAdminUserFromFirestore = async (userId: string) => {
  try {
    console.log(`[Firestore] Deleting admin user: ${userId}`);
    await deleteDoc(doc(db, COLLECTIONS.ADMIN_USERS, userId));
  } catch (err) {
    console.error(`[Firestore] Error deleting admin user ${userId}:`, err);
    throw err;
  }
};

export const saveBookingToFirestore = async (booking: Booking) => {
  try {
    console.log(`[Firestore] Saving booking: ${booking.id}`);
    await setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), cleanForFirestore(booking), { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving booking ${booking.id}:`, err);
    throw err;
  }
};

export const updateBookingInFirestore = async (bookingId: string, partial: Partial<Booking>) => {
  try {
    console.log(`[Firestore] Updating booking: ${bookingId}`);
    await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), cleanForFirestore(partial));
  } catch (err) {
    console.error(`[Firestore] Error updating booking ${bookingId}:`, err);
    throw err;
  }
};

export const deleteBookingFromFirestore = async (bookingId: string) => {
  try {
    console.log(`[Firestore] Deleting booking: ${bookingId}`);
    await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
  } catch (err) {
    console.error(`[Firestore] Error deleting booking ${bookingId}:`, err);
    throw err;
  }
};

export const saveRoomToFirestore = async (room: Room) => {
  try {
    console.log(`[Firestore] Saving room: ${room.id}`);
    await setDoc(doc(db, COLLECTIONS.ROOMS, room.id), cleanForFirestore(room), { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving room ${room.id}:`, err);
    throw err;
  }
};

export const deleteRoomFromFirestore = async (roomId: string) => {
  try {
    console.log(`[Firestore] Deleting room: ${roomId}`);
    await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));
  } catch (err) {
    console.error(`[Firestore] Error deleting room ${roomId}:`, err);
    throw err;
  }
};

export const savePackageToFirestore = async (pkg: Package) => {
  try {
    console.log(`[Firestore] Saving package: ${pkg.id}`);
    await setDoc(doc(db, COLLECTIONS.PACKAGES, pkg.id), cleanForFirestore(pkg), { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving package ${pkg.id}:`, err);
    throw err;
  }
};

export const deletePackageFromFirestore = async (pkgId: string) => {
  try {
    console.log(`[Firestore] Deleting package: ${pkgId}`);
    await deleteDoc(doc(db, COLLECTIONS.PACKAGES, pkgId));
  } catch (err) {
    console.error(`[Firestore] Error deleting package ${pkgId}:`, err);
    throw err;
  }
};

export const saveChatThreadToFirestore = async (thread: ChatThread) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CHAT_THREADS, thread.id), cleanForFirestore(thread), { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving chat thread ${thread.id}:`, err);
    throw err;
  }
};

export const deleteChatThreadFromFirestore = async (threadId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CHAT_THREADS, threadId));
  } catch (err) {
    console.error(`[Firestore] Error deleting chat thread ${threadId}:`, err);
    throw err;
  }
};

export const saveResortInfoToFirestore = async (info: ResortInfo) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'resort_info'), cleanForFirestore(info), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving resort info:', err);
    throw err;
  }
};

export const savePaymentSettingsToFirestore = async (settings: PaymentSettings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'payment_settings'), cleanForFirestore(settings), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving payment settings:', err);
    throw err;
  }
};
