'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}

export default function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Convert Firebase user to our app user format
        const convertedUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'student', // Default role, can be updated from Firestore
          language: 'en-US',
          accessibility: {
            screenReader: false,
            highContrast: false,
            largeText: false,
            voiceNavigation: true,
            brailleSupport: false,
            audioDescriptions: true,
            speechRate: 1.0,
            fontSize: 'medium',
          },
          profile: {
            grade: 8,
            subjects: ['mathematics', 'science', 'english', 'history'],
            learningStyle: 'mixed',
            languagePreference: 'en-US',
            location: {
              country: 'India',
              state: 'Maharashtra',
              city: 'Mumbai',
            },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setAppUser(convertedUser);
      } else {
        setAppUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase auth not initialized');
      }
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign-in error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      // Optionally update the user profile with the provided name
      // await updateProfile(result.user, { displayName: name });
    } catch (error) {
      console.error('Email sign-up error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Firebase logout function called')
    try {
      if (!auth) {
        console.error('Firebase auth not initialized')
        throw new Error('Firebase auth not initialized');
      }
      
      console.log('Calling Firebase signOut...')
      await signOut(auth);
      console.log('Firebase signOut completed successfully')
      
      // Clear local app state
      setUser(null);
      setAppUser(null);
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  const value = {
    user,
    appUser,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
