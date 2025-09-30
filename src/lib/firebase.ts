import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

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