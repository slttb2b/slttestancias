import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let firestoreInstance;

try {
  const cacheConfig = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? initializeFirestore(app, { localCache: cacheConfig }, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(app, { localCache: cacheConfig });
} catch {
  try {
    firestoreInstance = firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app, { localCache: memoryLocalCache() }, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, { localCache: memoryLocalCache() });
  } catch {
    firestoreInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db = firestoreInstance;

export const auth = getAuth(app);

export const storage = getStorage(app);

export default app;
