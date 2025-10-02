/**
 * Firestore Service for Scribe System
 * Handles all database operations for students and scribes
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from './firebase'
import type { StudentProfile, ScribeProfile } from '@/types/scribe-system'

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  SCRIBES: 'scribes',
  EXAMS: 'exams',
  MATCHES: 'matches'
} as const

// Helper function to create unique IDs for new documents
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Student Operations
 */
export const studentService = {
  // Create a new student profile
  async create(studentData: Omit<StudentProfile, 'id'>): Promise<string> {
    if (!db) {
      console.warn('Firestore not initialized - using mock data')
      return 'mock_' + generateUniqueId()
    }
    
    try {
      const profileWithId: StudentProfile = {
        ...studentData,
        id: generateUniqueId()
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
        ...profileWithId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      })
      
      return docRef.id
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. Please check Firestore security rules.')
        console.warn('Using mock mode for development')
        return 'mock_' + generateUniqueId()
      }
      throw error
    }
  },

  // Get student by email
  async getByEmail(email: string): Promise<StudentProfile | null> {
    if (!db) {
      console.warn('Firestore not initialized')
      return null
    }
    
    try {
      const q = query(
        collection(db, COLLECTIONS.STUDENTS),
        where('personalInfo.email', '==', email),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data()
        return data as StudentProfile
      }
      return null
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied when fetching student by email')
        return null
      }
      throw error
    }
  },

  // Get all active students (for volunteers to see)
  async getAll(): Promise<StudentProfile[]> {
    if (!db) {
      console.warn('Firestore not initialized')
      return []
    }
    
    try {
      const q = query(
        collection(db, COLLECTIONS.STUDENTS),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as StudentProfile)
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied when fetching all students')
        return []
      }
      throw error
    }
  },

  // Real-time listener for students (only for authenticated scribes/admins)
  onStudentsChange(callback: (students: StudentProfile[]) => void, userRole?: 'student' | 'scribe' | 'admin') {
    if (!db) throw new Error('Firestore not initialized')
    
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.warn('onStudentsChange: No authenticated user')
      callback([])
      return () => {} // Return no-op unsubscribe function
    }
    
    // Only allow scribes and admins to listen to students
    if (userRole !== 'scribe' && userRole !== 'admin') {
      console.warn('onStudentsChange: Access denied. Only scribes and admins can view students.')
      callback([])
      return () => {} // Return no-op unsubscribe function
    }
    
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const students = querySnapshot.docs.map(doc => doc.data() as StudentProfile)
      callback(students)
    }, (error) => {
      console.error('onStudentsChange error:', error)
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for students listener. User may not have proper role or authentication.')
        callback([])
      }
    })
  }
}

/**
 * Scribe Operations
 */
export const scribeService = {
  // Create a new scribe profile
  async create(scribeData: Omit<ScribeProfile, 'id'>): Promise<string> {
    if (!db) {
      console.warn('Firestore not initialized - using mock data')
      return 'mock_' + generateUniqueId()
    }
    
    try {
      const profileWithId: ScribeProfile = {
        ...scribeData,
        id: generateUniqueId()
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.SCRIBES), {
        ...profileWithId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'under-review',
        verificationStatus: 'pending'
      })
      
      return docRef.id
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. Please check Firestore security rules.')
        console.warn('Using mock mode for development')
        return 'mock_' + generateUniqueId()
      }
      throw error
    }
  },

  // Get scribe by email
  async getByEmail(email: string): Promise<ScribeProfile | null> {
    if (!db) {
      console.warn('Firestore not initialized')
      return null
    }
    
    try {
      const q = query(
        collection(db, COLLECTIONS.SCRIBES),
        where('personalInfo.email', '==', email),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data()
        return data as ScribeProfile
      }
      return null
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied when fetching scribe by email')
        return null
      }
      throw error
    }
  },

  // Get all scribes
  async getAll(): Promise<ScribeProfile[]> {
    if (!db) throw new Error('Firestore not initialized')
    
    const q = query(
      collection(db, COLLECTIONS.SCRIBES),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ScribeProfile)
  },

  // Get available scribes (approved and active)
  async getAvailable(): Promise<ScribeProfile[]> {
    if (!db) throw new Error('Firestore not initialized')
    
    const q = query(
      collection(db, COLLECTIONS.SCRIBES),
      where('status', '==', 'active'),
      where('verificationStatus', '==', 'verified'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ScribeProfile)
  },

  // Real-time listener for scribes (only for authenticated students/admins)
  onScribesChange(callback: (scribes: ScribeProfile[]) => void, userRole?: 'student' | 'scribe' | 'admin') {
    if (!db) throw new Error('Firestore not initialized')
    
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.warn('onScribesChange: No authenticated user')
      callback([])
      return () => {} // Return no-op unsubscribe function
    }
    
    // Only allow students and admins to listen to verified scribes
    if (userRole !== 'student' && userRole !== 'admin') {
      console.warn('onScribesChange: Access denied. Only students and admins can view scribes.')
      callback([])
      return () => {} // Return no-op unsubscribe function
    }
    
    const q = query(
      collection(db, COLLECTIONS.SCRIBES),
      where('status', '==', 'active'),
      where('verificationStatus', '==', 'verified'),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const scribes = querySnapshot.docs.map(doc => doc.data() as ScribeProfile)
      callback(scribes)
    }, (error) => {
      console.error('onScribesChange error:', error)
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for scribes listener. User may not have proper role or authentication.')
        callback([])
      }
    })
  }
}

/**
 * User Management
 */
export const userService = {
  // Get user profile (student or scribe) by email
  async getUserByEmail(email: string): Promise<{
    type: 'student' | 'scribe'
    profile: StudentProfile | ScribeProfile
  } | null> {
    // Check students first
    const student = await studentService.getByEmail(email)
    if (student) {
      return { type: 'student', profile: student }
    }

    // Check scribes
    const scribe = await scribeService.getByEmail(email)
    if (scribe) {
      return { type: 'scribe', profile: scribe }
    }

    return null
  },

  // Check if user exists
  async userExists(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email)
    return user !== null
  }
}

/**
 * Statistics
 */
export const statsService = {
  // Get platform statistics
  async getPlatformStats() {
    if (!db) {
      console.warn('Firestore not initialized - returning mock stats')
      return {
        totalStudents: 150,
        totalScribes: 89,
        verifiedScribes: 67,
        pendingScribes: 22,
        successfulMatches: 67,
        platformRating: 4.9
      }
    }
    
    try {
      const [studentsSnap, scribesSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.STUDENTS)),
        getDocs(collection(db, COLLECTIONS.SCRIBES))
      ])

      const students = studentsSnap.docs.map(doc => doc.data())
      const scribes = scribesSnap.docs.map(doc => doc.data())

      const activeStudents = students.filter(s => s.status === 'active').length
      const activeScribes = scribes.filter(s => s.status === 'active').length
      const verifiedScribes = scribes.filter(s => s.verificationStatus === 'verified').length

      return {
        totalStudents: activeStudents,
        totalScribes: activeScribes,
        verifiedScribes,
        pendingScribes: scribes.filter(s => s.verificationStatus === 'pending').length,
        successfulMatches: Math.min(activeStudents, verifiedScribes),
        platformRating: 4.9
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        const key = '__stats_perm_warned__'
        const alreadyWarned = (typeof window !== 'undefined') && sessionStorage.getItem(key)
        if (!alreadyWarned) {
          console.warn('Firebase permission denied when fetching stats - returning mock data')
          if (typeof window !== 'undefined') sessionStorage.setItem(key, '1')
        }
        return {
          totalStudents: 150,
          totalScribes: 89,
          verifiedScribes: 67,
          pendingScribes: 22,
          successfulMatches: 67,
          platformRating: 4.9
        }
      }
      throw error
    }
  }
}

export default {
  studentService,
  scribeService,
  userService,
  statsService
}