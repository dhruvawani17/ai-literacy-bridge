import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { UserGamification, Achievement, LeaderboardEntry } from '@/types/scribe-system'

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first study session',
    icon: '🎯',
    category: 'milestone',
    points: 50,
    rarity: 'common',
    requirements: { type: 'sessionsCompleted', value: 1 }
  },
  {
    id: 'study_streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'learning',
    points: 200,
    rarity: 'rare',
    requirements: { type: 'currentStreak', value: 7 }
  },
  {
    id: 'perfect_scriber',
    name: 'Perfect Partner',
    description: 'Receive 5 perfect ratings as a scribe',
    icon: '⭐',
    category: 'excellence',
    points: 300,
    rarity: 'epic',
    requirements: { type: 'perfectRatings', value: 5 }
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Make 10 community forum posts',
    icon: '🤝',
    category: 'community',
    points: 150,
    rarity: 'rare',
    requirements: { type: 'communityPosts', value: 10 }
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Complete 50 study sessions',
    icon: '📚',
    category: 'milestone',
    points: 500,
    rarity: 'legendary',
    requirements: { type: 'sessionsCompleted', value: 50 }
  }
]

export class GamificationService {
  private static instance: GamificationService

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService()
    }
    return GamificationService.instance
  }

  async getUserGamification(userId: string): Promise<UserGamification | null> {
    if (!db) return null

    try {
      const docRef = doc(db, 'gamification', userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data() as UserGamification
      } else {
        // Create initial gamification profile
        const initialProfile: UserGamification = {
          userId,
          totalPoints: 0,
          level: 1,
          experiencePoints: 0,
          experienceToNextLevel: 100,
          achievements: [],
          stats: {
            sessionsCompleted: 0,
            studyHours: 0,
            perfectRatings: 0,
            currentStreak: 0,
            longestStreak: 0,
            communityPosts: 0,
            scribeMatches: 0
          },
          badges: {},
          leaderboard: {
            globalRank: 0,
            weeklyRank: 0,
            monthlyRank: 0
          }
        }

        // Initialize badges
        ACHIEVEMENTS.forEach(achievement => {
          initialProfile.badges[achievement.id] = {
            earned: false,
            progress: 0
          }
        })

        await setDoc(docRef, initialProfile)
        return initialProfile
      }
    } catch (error) {
      console.error('Error getting user gamification:', error)
      return null
    }
  }

  async updateUserStats(userId: string, statType: keyof UserGamification['stats'], increment: number = 1): Promise<void> {
    if (!db) return

    try {
      const userGamification = await this.getUserGamification(userId)
      if (!userGamification) return

      // Update stat
      userGamification.stats[statType] += increment

      // Check for new achievements
      const newAchievements = this.checkAchievements(userGamification)

      // Calculate level and experience
      const { level, experiencePoints, experienceToNextLevel } = this.calculateLevel(userGamification.totalPoints + newAchievements.reduce((sum, a) => sum + a.points, 0))

      userGamification.level = level
      userGamification.experiencePoints = experiencePoints
      userGamification.experienceToNextLevel = experienceToNextLevel

      // Add new achievements
      userGamification.achievements.push(...newAchievements)
      userGamification.totalPoints += newAchievements.reduce((sum, a) => sum + a.points, 0)

      // Update badges progress
      ACHIEVEMENTS.forEach(achievement => {
        const badge = userGamification.badges[achievement.id]
        if (!badge.earned) {
          const currentValue = userGamification.stats[achievement.requirements.type]
          badge.progress = Math.min(100, (currentValue / achievement.requirements.value) * 100)
        }
      })

      // Save to Firestore
      const docRef = doc(db, 'gamification', userId)
      await setDoc(docRef, userGamification)

    } catch (error) {
      console.error('Error updating user stats:', error)
    }
  }

  private checkAchievements(userGamification: UserGamification): Achievement[] {
    const newAchievements: Achievement[] = []

    ACHIEVEMENTS.forEach(achievement => {
      const alreadyEarned = userGamification.achievements.some(a => a.id === achievement.id)
      if (!alreadyEarned) {
        const currentValue = userGamification.stats[achievement.requirements.type]
        if (currentValue >= achievement.requirements.value) {
          const earnedAchievement = { ...achievement, unlockedAt: new Date() }
          newAchievements.push(earnedAchievement)
          userGamification.badges[achievement.id].earned = true
          userGamification.badges[achievement.id].earnedAt = new Date()
        }
      }
    })

    return newAchievements
  }

  private calculateLevel(totalPoints: number): { level: number; experiencePoints: number; experienceToNextLevel: number } {
    let level = 1
    let experiencePoints = totalPoints
    let experienceToNextLevel = 100

    while (experiencePoints >= experienceToNextLevel) {
      experiencePoints -= experienceToNextLevel
      level++
      experienceToNextLevel = level * 100 // Simple leveling formula
    }

    return { level, experiencePoints, experienceToNextLevel }
  }

  async getLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
    if (!db) return []

    try {
      const q = query(collection(db, 'gamification'), orderBy('totalPoints', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)

      const leaderboard: LeaderboardEntry[] = []
      querySnapshot.docs.forEach((docSnapshot, index) => {
        const data = docSnapshot.data() as UserGamification
        leaderboard.push({
          userId: data.userId,
          name: `User ${data.userId.slice(-4)}`, // Placeholder name
          points: data.totalPoints,
          level: data.level,
          achievements: data.achievements.length,
          rank: index + 1
        })
      })

      return leaderboard
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    if (!db) return

    try {
      const userGamification = await this.getUserGamification(userId)
      if (!userGamification) return

      userGamification.totalPoints += points

      // Recalculate level
      const { level, experiencePoints, experienceToNextLevel } = this.calculateLevel(userGamification.totalPoints)
      userGamification.level = level
      userGamification.experiencePoints = experiencePoints
      userGamification.experienceToNextLevel = experienceToNextLevel

      const docRef = doc(db, 'gamification', userId)
      await setDoc(docRef, userGamification)

      console.log(`Awarded ${points} points to ${userId} for: ${reason}`)
    } catch (error) {
      console.error('Error awarding points:', error)
    }
  }
}

export const gamificationService = GamificationService.getInstance()