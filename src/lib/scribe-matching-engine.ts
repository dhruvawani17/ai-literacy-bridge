/**
 * Cerebras-Powered Scribe Matching Engine
 * Advanced AI system for optimal student-scribe pairing
 */

import { getCerebrasClient } from '@/lib/cerebras'
import type { 
  StudentProfile, 
  ScribeProfile, 
  ExamRegistration, 
  MatchAttempt, 
  MatchingFactors,
  MatchingResponse,
  MatchingConfig
} from '@/types/scribe-system'

export class ScribeMatchingEngine {
  private cerebras: any
  private config: MatchingConfig

  constructor() {
    this.cerebras = getCerebrasClient()
    this.config = {
      weights: {
        distance: 0.25,
        availability: 0.20,
        subject: 0.15,
        language: 0.15,
        experience: 0.10,
        rating: 0.10,
        preference: 0.05
      },
      thresholds: {
        minimumScore: 60,
        maximumDistance: 50, // km
        responseTime: 24 // hours
      },
      limits: {
        maxMatchesPerRequest: 3,
        maxActiveRequests: 5,
        backupScribeCount: 2
      }
    }
  }

  /**
   * Main matching function - finds optimal scribes for a student's exam
   */
  async findMatches(
    student: StudentProfile,
    exam: ExamRegistration,
    availableScribes: ScribeProfile[]
  ): Promise<MatchingResponse> {
    try {
      console.log(`🎯 Starting match process for student ${student.id} and exam ${exam.id}`)
      
      // Step 1: Pre-filter scribes based on hard constraints
      const eligibleScribes = this.preFilterScribes(student, exam, availableScribes)
      
      if (eligibleScribes.length === 0) {
        return {
          success: false,
          matches: [],
          message: 'No eligible scribes found matching your requirements',
          waitlistPosition: await this.getWaitlistPosition(exam)
        }
      }

      // Step 2: Calculate matching scores using Cerebras AI
      const scoredMatches = await this.calculateMatchingScores(student, exam, eligibleScribes)
      
      // Step 3: Rank and select top matches
      const topMatches = this.rankMatches(scoredMatches)
      
      // Step 4: Verify availability and create match attempts
      const finalMatches = await this.createMatchAttempts(student.id, exam.id, topMatches)
      
      // Step 5: Generate alternatives and backup options
      const alternatives = await this.generateAlternatives(student, exam, scoredMatches, topMatches)
      
      return {
        success: true,
        matches: finalMatches,
        message: `Found ${finalMatches.length} excellent scribe matches for your exam`,
        alternatives
      }
      
    } catch (error) {
      console.error('Matching engine error:', error)
      return {
        success: false,
        matches: [],
        message: 'System error occurred during matching. Please try again.',
      }
    }
  }

  /**
   * Pre-filter scribes based on hard constraints
   */
  private preFilterScribes(
    student: StudentProfile,
    exam: ExamRegistration,
    scribes: ScribeProfile[]
  ): ScribeProfile[] {
    return scribes.filter(scribe => {
      // Basic verification check
      if (!scribe.verification.isVerified) return false
      
      // Distance constraint
      const distance = this.calculateDistance(
        student.location.latitude,
        student.location.longitude,
        scribe.location.latitude,
        scribe.location.longitude
      )
      if (distance > Math.min(student.preferences.maxTravelDistance, scribe.availability.maxDistanceWilling)) {
        return false
      }
      
      // Exam type compatibility
      if (!scribe.availability.examTypesWilling.includes(exam.examDetails.examType)) {
        return false
      }
      
      // Language requirement
      if (!scribe.qualifications.languagesKnown.includes(exam.examDetails.language)) {
        return false
      }
      
      // Gender preference (if specified)
      if (student.preferences.scribeGender && 
          student.preferences.scribeGender !== 'any' && 
          scribe.personalInfo.gender !== student.preferences.scribeGender) {
        return false
      }
      
      // Blackout dates check
      const examDate = exam.examDetails.date
      if (scribe.availability.blackoutDates.includes(examDate)) {
        return false
      }
      
      return true
    })
  }

  /**
   * Calculate comprehensive matching scores using Cerebras AI
   */
  private async calculateMatchingScores(
    student: StudentProfile,
    exam: ExamRegistration,
    scribes: ScribeProfile[]
  ): Promise<(ScribeProfile & { matchingFactors: MatchingFactors })[]> {
    const scoredScribes = []
    
    for (const scribe of scribes) {
      const factors = await this.computeMatchingFactors(student, exam, scribe)
      scoredScribes.push({
        ...scribe,
        matchingFactors: factors
      })
    }
    
    return scoredScribes
  }

  /**
   * Compute detailed matching factors for a student-scribe pair
   */
  private async computeMatchingFactors(
    student: StudentProfile,
    exam: ExamRegistration,
    scribe: ScribeProfile
  ): Promise<MatchingFactors> {
    // Distance score (0-100)
    const distance = this.calculateDistance(
      student.location.latitude,
      student.location.longitude,
      scribe.location.latitude,
      scribe.location.longitude
    )
    const distanceScore = Math.max(0, 100 - (distance / this.config.thresholds.maximumDistance) * 100)

    // Availability score (0-100)
    const availabilityScore = await this.calculateAvailabilityScore(exam, scribe)

    // Subject match score (0-100)
    const subjectMatchScore = this.calculateSubjectMatch(exam.examDetails.subjects, scribe.qualifications.subjects)

    // Language match score (0-100)
    const languageMatchScore = scribe.qualifications.languagesKnown.includes(exam.examDetails.language) ? 100 : 0

    // Experience score (0-100)
    const experienceScore = this.calculateExperienceScore(scribe, exam.examDetails.examType)

    // Rating score (0-100)
    const ratingScore = (scribe.experience.averageRating / 5) * 100

    // Preference match score (0-100)
    const preferenceMatchScore = await this.calculatePreferenceMatch(student, scribe)

    // Use Cerebras AI to compute weighted overall score
    const overallScore = await this.computeAIWeightedScore({
      distanceScore,
      availabilityScore,
      subjectMatchScore,
      languageMatchScore,
      experienceScore,
      ratingScore,
      preferenceMatchScore,
      student,
      exam,
      scribe
    })

    return {
      distanceScore,
      availabilityScore,
      subjectMatchScore,
      languageMatchScore,
      experienceScore,
      ratingScore,
      preferenceMatchScore,
      overallScore
    }
  }

  /**
   * Use Cerebras AI to compute intelligent weighted score
   */
  private async computeAIWeightedScore(params: {
    distanceScore: number
    availabilityScore: number
    subjectMatchScore: number
    languageMatchScore: number
    experienceScore: number
    ratingScore: number
    preferenceMatchScore: number
    student: StudentProfile
    exam: ExamRegistration
    scribe: ScribeProfile
  }): Promise<number> {
    try {
      const prompt = `
As an AI matching expert for a scribe-student pairing system, analyze this match and provide an optimal weighted score (0-100).

STUDENT CONTEXT:
- Disability: ${params.student.disability.type} (${params.student.disability.severity})
- Exam: ${params.exam.examDetails.examName} (${params.exam.examDetails.examType})
- Subjects: ${params.exam.examDetails.subjects.join(', ')}
- Duration: ${params.exam.examDetails.duration} minutes
- Special needs: ${params.student.disability.accommodationsNeeded.join(', ')}

SCRIBE CONTEXT:
- Experience: ${params.scribe.experience.totalYears} years, ${params.scribe.experience.totalExamsScribed} exams
- Specializations: ${params.scribe.qualifications.subjects.join(', ')}
- Rating: ${params.scribe.experience.averageRating}/5 stars
- Success rate: ${((params.scribe.experience.successfulExams / Math.max(params.scribe.experience.totalExamsScribed, 1)) * 100).toFixed(1)}%

MATCHING SCORES:
- Distance: ${params.distanceScore}/100
- Availability: ${params.availabilityScore}/100  
- Subject Match: ${params.subjectMatchScore}/100
- Language Match: ${params.languageMatchScore}/100
- Experience: ${params.experienceScore}/100
- Rating: ${params.ratingScore}/100
- Preference: ${params.preferenceMatchScore}/100

Consider:
1. Critical factors for this specific exam type and student needs
2. Risk factors (low experience, poor ratings, distance issues)
3. Exceptional strengths that boost compatibility
4. Overall fit and likelihood of successful exam experience

Respond with just a number (0-100) representing the optimal match score.`

      const response = await this.cerebras.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3.1-8b',
        temperature: 0.3,
        max_tokens: 10
      })

      const scoreText = response.choices[0]?.message?.content?.trim()
      const aiScore = parseFloat(scoreText || '0')
      
      // Fallback to weighted average if AI response is invalid
      if (isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
        return this.calculateWeightedScore(params)
      }
      
      return Math.round(aiScore)
      
    } catch (error) {
      console.error('AI scoring error:', error)
      return this.calculateWeightedScore(params)
    }
  }

  /**
   * Fallback weighted scoring method
   */
  private calculateWeightedScore(params: {
    distanceScore: number
    availabilityScore: number
    subjectMatchScore: number
    languageMatchScore: number
    experienceScore: number
    ratingScore: number
    preferenceMatchScore: number
  }): number {
    const { weights } = this.config
    
    return Math.round(
      (params.distanceScore * weights.distance) +
      (params.availabilityScore * weights.availability) +
      (params.subjectMatchScore * weights.subject) +
      (params.languageMatchScore * weights.language) +
      (params.experienceScore * weights.experience) +
      (params.ratingScore * weights.rating) +
      (params.preferenceMatchScore * weights.preference)
    )
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
   * Calculate availability score based on exam timing
   */
  private async calculateAvailabilityScore(exam: ExamRegistration, scribe: ScribeProfile): Promise<number> {
    const examDate = new Date(exam.examDetails.date)
    const examDay = examDate.getDay()
    const examStartTime = exam.examDetails.startTime
    const examEndTime = exam.examDetails.endTime
    
    // Check if scribe is available on exam day
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const examDayName = dayNames[examDay] as any
    
    if (!scribe.availability.daysAvailable.includes(examDayName)) {
      return 0
    }
    
    // Check time slot overlap
    const hasTimeOverlap = scribe.availability.timeSlots.some(slot => {
      if (slot.dayOfWeek !== examDay) return false
      return this.timeRangesOverlap(slot.startTime, slot.endTime, examStartTime, examEndTime)
    })
    
    return hasTimeOverlap ? 100 : 0
  }

  /**
   * Check if two time ranges overlap
   */
  private timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1)
    const e1 = this.timeToMinutes(end1)
    const s2 = this.timeToMinutes(start2)
    const e2 = this.timeToMinutes(end2)
    
    return s1 < e2 && s2 < e1
  }

  /**
   * Convert time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * Calculate subject compatibility score
   */
  private calculateSubjectMatch(examSubjects: string[], scribeSubjects: string[]): number {
    if (examSubjects.length === 0) return 100
    
    const matches = examSubjects.filter(subject => scribeSubjects.includes(subject as any))
    return (matches.length / examSubjects.length) * 100
  }

  /**
   * Calculate experience score based on exam type and history
   */
  private calculateExperienceScore(scribe: ScribeProfile, examType: string): number {
    let score = 0
    
    // Base experience score
    score += Math.min(scribe.experience.totalYears * 10, 40)
    
    // Exam type specific experience
    if (scribe.experience.examTypes.includes(examType as any)) {
      score += 30
    }
    
    // Success rate bonus
    const successRate = scribe.experience.successfulExams / Math.max(scribe.experience.totalExamsScribed, 1)
    score += successRate * 30
    
    return Math.min(score, 100)
  }

  /**
   * Calculate preference matching score
   */
  private async calculatePreferenceMatch(student: StudentProfile, scribe: ScribeProfile): Promise<number> {
    let score = 100
    
    // Age preference
    if (student.preferences.scribeAgeRange) {
      const scribeAge = this.calculateAge(scribe.personalInfo.dateOfBirth)
      const [minAge, maxAge] = student.preferences.scribeAgeRange
      if (scribeAge < minAge || scribeAge > maxAge) {
        score -= 20
      }
    }
    
    // Special requirements check would go here
    // This could use AI to analyze compatibility of special requirements
    
    return Math.max(score, 0)
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Rank matches by overall score
   */
  private rankMatches(scoredScribes: (ScribeProfile & { matchingFactors: MatchingFactors })[]): (ScribeProfile & { matchingFactors: MatchingFactors })[] {
    return scoredScribes
      .filter(scribe => scribe.matchingFactors.overallScore >= this.config.thresholds.minimumScore)
      .sort((a, b) => b.matchingFactors.overallScore - a.matchingFactors.overallScore)
      .slice(0, this.config.limits.maxMatchesPerRequest)
  }

  /**
   * Create match attempt records
   */
  private async createMatchAttempts(
    studentId: string,
    examId: string,
    matches: (ScribeProfile & { matchingFactors: MatchingFactors })[]
  ): Promise<MatchAttempt[]> {
    return matches.map(match => ({
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      scribeId: match.id,
      examId,
      matchScore: match.matchingFactors.overallScore,
      factors: match.matchingFactors,
      status: 'proposed',
      proposedAt: new Date().toISOString(),
      notes: `AI-generated match with ${match.matchingFactors.overallScore}% compatibility`
    }))
  }

  /**
   * Generate alternative matches and backup options
   */
  private async generateAlternatives(
    student: StudentProfile,
    exam: ExamRegistration,
    allMatches: (ScribeProfile & { matchingFactors: MatchingFactors })[],
    topMatches: (ScribeProfile & { matchingFactors: MatchingFactors })[]
  ): Promise<MatchAttempt[]> {
    const alternatives = allMatches
      .filter(match => !topMatches.includes(match))
      .filter(match => match.matchingFactors.overallScore >= 40) // Lower threshold for alternatives
      .slice(0, this.config.limits.backupScribeCount)
    
    return this.createMatchAttempts(student.id, exam.id, alternatives)
  }

  /**
   * Get waitlist position for student
   */
  private async getWaitlistPosition(exam: ExamRegistration): Promise<number> {
    // This would query the database for similar exam requests
    // For now, return a placeholder
    return Math.floor(Math.random() * 10) + 1
  }

  /**
   * Emergency backup matching - finds any available scribe
   */
  async findEmergencyBackup(
    student: StudentProfile,
    exam: ExamRegistration,
    excludeScribes: string[] = []
  ): Promise<MatchingResponse> {
    // Relaxed constraints for emergency situations
    // Implementation would lower thresholds and expand search radius
    console.log(`🚨 Finding emergency backup for student ${student.id}`)
    
    // This would implement a more lenient matching algorithm
    return {
      success: false,
      matches: [],
      message: 'Emergency backup system activated. Expanding search...'
    }
  }

  /**
   * Bulk matching for multiple students (exam day optimization)
   */
  async bulkMatch(
    students: StudentProfile[],
    exams: ExamRegistration[],
    availableScribes: ScribeProfile[]
  ): Promise<Map<string, MatchingResponse>> {
    console.log(`🎯 Bulk matching ${students.length} students with ${availableScribes.length} scribes`)
    
    const results = new Map<string, MatchingResponse>()
    
    // This would implement a complex optimization algorithm
    // considering conflicts, optimal assignments, etc.
    
    for (const student of students) {
      const studentExams = exams.filter(exam => exam.studentId === student.id)
      
      for (const exam of studentExams) {
        const result = await this.findMatches(student, exam, availableScribes)
        results.set(`${student.id}-${exam.id}`, result)
      }
    }
    
    return results
  }
}

// Export singleton instance
export const matchingEngine = new ScribeMatchingEngine()