import {
  collection,
  doc,
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

// --- INITIAL DATA SEEDING IF EMPTY ---
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
    // 1. Seed Admin Users
    const usersSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_USERS));
    if (usersSnap.empty) {
      console.log('Firestore: Seeding default admin users...');
      for (const u of defaultAdminUsers) {
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, u.id), cleanForFirestore(u));
      }
    } else {
      // Ensure master admin exists with correct credentials
      const masterDoc = usersSnap.docs.find((d) => d.data().username === 'SLTTESTANCIA_ADMIN');
      if (!masterDoc) {
        const masterUser = defaultAdminUsers[0];
        await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, masterUser.id), cleanForFirestore(masterUser));
      } else {
        // Update password if outdated
        if (masterDoc.data().password !== 'Slttestancias123@') {
          await updateDoc(doc(db, COLLECTIONS.ADMIN_USERS, masterDoc.id), {
            password: 'Slttestancias123@',
            role: 'super_admin',
            isActive: true,
          });
        }
      }
    }

    // 2. Seed Rooms
    const roomsSnap = await getDocs(collection(db, COLLECTIONS.ROOMS));
    if (roomsSnap.empty) {
      console.log('Firestore: Seeding default rooms...');
      for (const r of defaultRooms) {
        await setDoc(doc(db, COLLECTIONS.ROOMS, r.id), cleanForFirestore(r));
      }
    }

    // 3. Seed Packages
    const packagesSnap = await getDocs(collection(db, COLLECTIONS.PACKAGES));
    if (packagesSnap.empty) {
      console.log('Firestore: Seeding default packages...');
      for (const p of defaultPackages) {
        await setDoc(doc(db, COLLECTIONS.PACKAGES, p.id), cleanForFirestore(p));
      }
    }

    // 4. Seed Bookings
    const bookingsSnap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
    if (bookingsSnap.empty) {
      console.log('Firestore: Seeding default bookings...');
      for (const b of defaultBookings) {
        await setDoc(doc(db, COLLECTIONS.BOOKINGS, b.id), cleanForFirestore(b));
      }
    }

    // 5. Seed Settings (Resort Info & Payment Settings)
    const resortInfoDoc = doc(db, COLLECTIONS.SETTINGS, 'resort_info');
    const paymentSettingsDoc = doc(db, COLLECTIONS.SETTINGS, 'payment_settings');
    
    await setDoc(resortInfoDoc, cleanForFirestore(defaultResortInfo), { merge: true });
    await setDoc(paymentSettingsDoc, cleanForFirestore(defaultPaymentSettings), { merge: true });

    // 6. Seed Chat Threads
    const chatSnap = await getDocs(collection(db, COLLECTIONS.CHAT_THREADS));
    if (chatSnap.empty) {
      for (const t of defaultChatThreads) {
        await setDoc(doc(db, COLLECTIONS.CHAT_THREADS, t.id), cleanForFirestore(t));
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore:', error);
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

// Helper to log errors gracefully during offline mode
const handleFirestoreError = (collectionName: string, err: any) => {
  if (
    err?.code === 'unavailable' ||
    err?.message?.includes('Could not reach Cloud Firestore') ||
    err?.message?.includes('backend')
  ) {
    console.warn(`[Firestore Offline Mode] Operating on local cache for '${collectionName}'. Reconnecting automatically...`);
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
      snapshot.forEach((doc) => {
        users.push(doc.data() as AdminUser);
      });
      if (users.length > 0) {
        callback(users);
      }
    },
    (err) => handleFirestoreError('admin_users', err)
  );
};

export const subscribeBookings = (callback: (bookings: Booking[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.BOOKINGS),
    (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        bookings.push(doc.data() as Booking);
      });
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
      snapshot.forEach((doc) => {
        rooms.push(doc.data() as Room);
      });
      if (rooms.length > 0) {
        callback(rooms);
      }
    },
    (err) => handleFirestoreError('rooms', err)
  );
};

export const subscribePackages = (callback: (packages: Package[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.PACKAGES),
    (snapshot) => {
      const pkgs: Package[] = [];
      snapshot.forEach((doc) => {
        pkgs.push(doc.data() as Package);
      });
      if (pkgs.length > 0) {
        callback(pkgs);
      }
    },
    (err) => handleFirestoreError('packages', err)
  );
};

export const subscribeChatThreads = (callback: (threads: ChatThread[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.CHAT_THREADS),
    (snapshot) => {
      const threads: ChatThread[] = [];
      snapshot.forEach((doc) => {
        threads.push(doc.data() as ChatThread);
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
    await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, user.id), cleanForFirestore(user), { merge: true });
  } catch (err) {
    console.error('Firestore saveAdminUser error:', err);
  }
};

export const deleteAdminUserFromFirestore = async (userId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ADMIN_USERS, userId));
  } catch (err) {
    console.error('Firestore deleteAdminUser error:', err);
  }
};

export const saveBookingToFirestore = async (booking: Booking) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), cleanForFirestore(booking), { merge: true });
  } catch (err) {
    console.error('Firestore saveBooking error:', err);
  }
};

export const deleteBookingFromFirestore = async (bookingId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
  } catch (err) {
    console.error('Firestore deleteBooking error:', err);
  }
};

export const saveRoomToFirestore = async (room: Room) => {
  try {
    await setDoc(doc(db, COLLECTIONS.ROOMS, room.id), cleanForFirestore(room), { merge: true });
  } catch (err) {
    console.error('Firestore saveRoom error:', err);
  }
};

export const deleteRoomFromFirestore = async (roomId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));
  } catch (err) {
    console.error('Firestore deleteRoom error:', err);
  }
};

export const savePackageToFirestore = async (pkg: Package) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PACKAGES, pkg.id), cleanForFirestore(pkg), { merge: true });
  } catch (err) {
    console.error('Firestore savePackage error:', err);
  }
};

export const deletePackageFromFirestore = async (pkgId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PACKAGES, pkgId));
  } catch (err) {
    console.error('Firestore deletePackage error:', err);
  }
};

export const saveChatThreadToFirestore = async (thread: ChatThread) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CHAT_THREADS, thread.id), cleanForFirestore(thread), { merge: true });
  } catch (err) {
    console.error('Firestore saveChatThread error:', err);
  }
};

export const deleteChatThreadFromFirestore = async (threadId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CHAT_THREADS, threadId));
  } catch (err) {
    console.error('Firestore deleteChatThread error:', err);
  }
};

export const saveResortInfoToFirestore = async (info: ResortInfo) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'resort_info'), cleanForFirestore(info), { merge: true });
  } catch (err) {
    console.error('Firestore saveResortInfo error:', err);
  }
};

export const savePaymentSettingsToFirestore = async (settings: PaymentSettings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'payment_settings'), cleanForFirestore(settings), { merge: true });
  } catch (err) {
    console.error('Firestore savePaymentSettings error:', err);
  }
};
