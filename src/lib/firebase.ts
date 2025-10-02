import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX'
};

// Check if we're in build mode or have valid Firebase config
const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;


// Initialize Firebase only if it hasn't been initialized already and we have valid config
let app: any = null;
if (hasValidConfig || typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

// Create service instances (optionally connect to emulators)
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

if (app) {
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);

  // Connect to emulators when enabled
  const useEmu = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true';
  if (useEmu) {
    try {
      // Default emulator host/ports; override via NEXT_PUBLIC_* if desired
      const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1';
      const fsPort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080);
      const authPort = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT || 9099);
      const storagePort = Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || 9199);

      if (dbInstance) {
        connectFirestoreEmulator(dbInstance, host, fsPort);
      }
      if (authInstance) {
        connectAuthEmulator(authInstance, `http://${host}:${authPort}`, { disableWarnings: true });
      }
      if (storageInstance) {
        connectStorageEmulator(storageInstance, host, storagePort);
      }

      if (typeof window !== 'undefined') {
        // Log once per session
        const key = '__firebase_emulator_connected__';
        if (!sessionStorage.getItem(key)) {
          // eslint-disable-next-line no-console
          console.info(`Firebase emulators connected (Firestore:${host}:${fsPort}, Auth:${host}:${authPort}, Storage:${host}:${storagePort})`);
          sessionStorage.setItem(key, '1');
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to connect to Firebase emulators:', e);
    }
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = authInstance;

// Initialize Cloud Firestore and get a reference to the service
export const db = dbInstance;

// Initialize Cloud Storage and get a reference to the service
export const storage = storageInstance;

// Initialize Analytics (only in browser environment)
export const analytics = (app && typeof window !== 'undefined') ? getAnalytics(app) : null;

// Configure auth providers (only if we have a valid app)
export const googleProvider = app ? new GoogleAuthProvider() : null;
export const emailProvider = app ? new EmailAuthProvider() : null;

// Configure Google provider for educational context
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    // Request additional educational scopes
    scope: 'profile email'
  });
}

export default app;