import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// ===== CORE TYPES =====

export interface UserPreference {
  id: string
  userId: string
  category: 'content' | 'interaction' | 'timing' | 'communication' | 'coaching' | 'interface' | 'privacy'
  key: string
  value: any
  confidence: number // 0-1
  lastUpdated: Date
  source: 'explicit' | 'behavioral' | 'contextual' | 'feedback' | 'ai_analysis'
  context?: Record<string, any>
}

export interface PersonalityTraits {
  // Big Five personality model
  openness: number // 0-100
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  
  // Relationship-specific traits
  communicationStyle: 'direct' | 'indirect' | 'expressive' | 'reserved'
  conflictResolution: 'confrontational' | 'avoidant' | 'collaborative' | 'compromising'
  intimacyStyle: 'physical' | 'emotional' | 'intellectual' | 'experiential'
  motivationStyle: 'achievement' | 'affiliation' | 'power' | 'security'
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  
  // Custom relationship dimensions
  spontaneity: number // 0-100
  romanticism: number
  pragmatism: number
  emotionalExpressiveness: number
  needForValidation: number
}

export interface UserProfile {
  userId: string
  personalityTraits: PersonalityTraits
  preferences: UserPreference[]
  lastProfileUpdate: Date
  profileCompleteness: number // 0-100%
}

// ===== PERSONALIZATION ENGINE =====

export class PersonalizationEngine {
  private static instance: PersonalizationEngine
  private userProfiles: Map<string, UserProfile> = new Map()

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine()
    }
    return PersonalizationEngine.instance
  }

  // ===== DYNAMIC PREFERENCE LEARNING =====

  async learnFromBehavior(
    userId: string, 
    action: string, 
    context: Record<string, any>,
    outcome?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    try {
      const preferences = await this.extractPreferencesFromBehavior(userId, action, context, outcome)
      
      for (const preference of preferences) {
        await this.updatePreference(userId, preference)
      }

      // Trigger profile recalculation if significant learning occurred
      if (preferences.length > 0) {
        await this.recalculateUserProfile(userId)
      }
    } catch (error) {
      console.error('Error learning from behavior:', error)
    }
  }

  private async extractPreferencesFromBehavior(
    userId: string,
    action: string,
    context: Record<string, any>,
    outcome?: string
  ): Promise<Partial<UserPreference>[]> {
    const preferences: Partial<UserPreference>[] = []
    const confidence = outcome === 'positive' ? 0.8 : outcome === 'negative' ? 0.6 : 0.4

    // Content preferences
    if (action.includes('content_interaction')) {
      preferences.push({
        category: 'content',
        key: 'preferred_content_type',
        value: context.contentType,
        confidence,
        source: 'behavioral'
      })
    }

    // Timing preferences
    if (context.timeOfDay) {
      preferences.push({
        category: 'timing',
        key: 'preferred_activity_time',
        value: context.timeOfDay,
        confidence: 0.6,
        source: 'behavioral'
      })
    }

    return preferences
  }

  async updatePreference(userId: string, preference: Partial<UserPreference>): Promise<void> {
    try {
      const preferencesRef = collection(db, 'userPreferences')
      const existingQuery = query(
        preferencesRef,
        where('userId', '==', userId),
        where('category', '==', preference.category),
        where('key', '==', preference.key)
      )
      
      const existing = await getDocs(existingQuery)
      
      if (!existing.empty) {
        // Update existing preference
        const existingPref = existing.docs[0].data() as UserPreference
        const newConfidence = Math.min(1, (existingPref.confidence + (preference.confidence || 0.5)) / 2)
        
        await updateDoc(existing.docs[0].ref, {
          value: preference.value,
          confidence: newConfidence,
          lastUpdated: serverTimestamp(),
          context: preference.context || {}
        })
      } else {
        // Create new preference
        await addDoc(preferencesRef, {
          userId,
          category: preference.category,
          key: preference.key,
          value: preference.value,
          confidence: preference.confidence || 0.5,
          lastUpdated: serverTimestamp(),
          source: preference.source || 'behavioral',
          context: preference.context || {}
        })
      }
    } catch (error) {
      console.error('Error updating preference:', error)
    }
  }

  // ===== USER PROFILING =====

  async buildUserProfile(userId: string): Promise<UserProfile> {
    try {
      const [personalityTraits, preferences] = await Promise.all([
        this.analyzePersonalityTraits(userId),
        this.getUserPreferences(userId)
      ])

      const profile: UserProfile = {
        userId,
        personalityTraits,
        preferences,
        lastProfileUpdate: new Date(),
        profileCompleteness: this.calculateProfileCompleteness(personalityTraits, preferences)
      }

      // Cache the profile
      this.userProfiles.set(userId, profile)
      
      // Save to database
      await this.saveUserProfile(profile)
      
      return profile
    } catch (error) {
      console.error('Error building user profile:', error)
      throw error
    }
  }

  private async analyzePersonalityTraits(userId: string): Promise<PersonalityTraits> {
    // Get behavioral data for analysis
    const behaviorData = await this.getUserBehaviorData(userId)
    
    return {
      // Big Five (estimated from behavior patterns)
      openness: this.calculateTrait(behaviorData, 'openness'),
      conscientiousness: this.calculateTrait(behaviorData, 'conscientiousness'),
      extraversion: this.calculateTrait(behaviorData, 'extraversion'),
      agreeableness: this.calculateTrait(behaviorData, 'agreeableness'),
      neuroticism: this.calculateTrait(behaviorData, 'neuroticism'),
      
      // Relationship-specific traits
      communicationStyle: this.inferCommunicationStyle(behaviorData),
      conflictResolution: this.inferConflictStyle(behaviorData),
      intimacyStyle: this.inferIntimacyStyle(behaviorData),
      motivationStyle: this.inferMotivationStyle(behaviorData),
      learningStyle: this.inferLearningStyle(behaviorData),
      
      // Custom dimensions
      spontaneity: this.calculateTrait(behaviorData, 'spontaneity'),
      romanticism: this.calculateTrait(behaviorData, 'romanticism'),
      pragmatism: this.calculateTrait(behaviorData, 'pragmatism'),
      emotionalExpressiveness: this.calculateTrait(behaviorData, 'emotionalExpressiveness'),
      needForValidation: this.calculateTrait(behaviorData, 'needForValidation')
    }
  }

  // ===== CONTENT ADAPTATION =====

  async adaptContent(userId: string, content: any, context: Record<string, any>): Promise<any> {
    try {
      const profile = await this.getUserProfile(userId)
      
      const adaptedContent = {
        ...content,
        personalization: {
          style: this.adaptContentStyle(content, profile, context),
          difficulty: this.adaptContentDifficulty(content, profile, context),
          format: this.adaptContentFormat(content, profile, context),
          timing: this.adaptContentTiming(content, profile, context)
        }
      }
      
      return adaptedContent
    } catch (error) {
      console.error('Error adapting content:', error)
      return content
    }
  }

  // ===== HELPER METHODS =====

  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!
    }
    
    const profileDoc = await getDoc(doc(db, 'userProfiles', userId))
    if (profileDoc.exists()) {
      const profile = profileDoc.data() as UserProfile
      this.userProfiles.set(userId, profile)
      return profile
    }
    
    return await this.buildUserProfile(userId)
  }

  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await updateDoc(doc(db, 'userProfiles', profile.userId), {
        ...profile,
        lastProfileUpdate: serverTimestamp()
      })
    } catch (error) {
      await addDoc(collection(db, 'userProfiles'), {
        ...profile,
        lastProfileUpdate: serverTimestamp()
      })
    }
  }

  private calculateProfileCompleteness(traits: PersonalityTraits, preferences: UserPreference[]): number {
    const traitCount = Object.values(traits).filter(v => v !== null && v !== undefined).length
    const prefCount = preferences.length
    
    const traitCompleteness = (traitCount / 15) * 70 // 70% weight for traits
    const prefCompleteness = Math.min(1, prefCount / 10) * 30 // 30% weight for preferences
    
    return Math.round(traitCompleteness + prefCompleteness)
  }

  // Simplified trait calculation methods
  private calculateTrait(behaviorData: any, traitName: string): number {
    // Placeholder implementation - would use ML algorithms in production
    return 50 + Math.random() * 50
  }

  private inferCommunicationStyle(behaviorData: any): 'direct' | 'indirect' | 'expressive' | 'reserved' {
    return 'direct' // Placeholder
  }

  private inferConflictStyle(behaviorData: any): 'confrontational' | 'avoidant' | 'collaborative' | 'compromising' {
    return 'collaborative' // Placeholder
  }

  private inferIntimacyStyle(behaviorData: any): 'physical' | 'emotional' | 'intellectual' | 'experiential' {
    return 'emotional' // Placeholder
  }

  private inferMotivationStyle(behaviorData: any): 'achievement' | 'affiliation' | 'power' | 'security' {
    return 'affiliation' // Placeholder
  }

  private inferLearningStyle(behaviorData: any): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    return 'visual' // Placeholder
  }

  private async getUserBehaviorData(userId: string): Promise<any> {
    // Would fetch behavioral data from database
    return {}
  }

  private async getUserPreferences(userId: string): Promise<UserPreference[]> {
    const preferencesRef = collection(db, 'userPreferences')
    const preferencesQuery = query(preferencesRef, where('userId', '==', userId))
    const preferences = await getDocs(preferencesQuery)
    
    return preferences.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserPreference[]
  }

  private async recalculateUserProfile(userId: string): Promise<void> {
    await this.buildUserProfile(userId)
  }

  private adaptContentStyle(content: any, profile: UserProfile, context: Record<string, any>): string {
    const { personalityTraits } = profile
    
    if (personalityTraits.communicationStyle === 'direct' && personalityTraits.extraversion > 70) {
      return 'energetic_direct'
    } else if (personalityTraits.communicationStyle === 'indirect' && personalityTraits.agreeableness > 70) {
      return 'gentle_supportive'
    } else {
      return 'balanced_friendly'
    }
  }

  private adaptContentDifficulty(content: any, profile: UserProfile, context: Record<string, any>): number {
    let difficulty = content.baseDifficulty || 50
    
    // Adjust based on user's conscientiousness and openness
    if (profile.personalityTraits.conscientiousness > 70) {
      difficulty += 10 // Can handle more challenging content
    }
    
    if (profile.personalityTraits.openness > 80) {
      difficulty += 15 // Enjoys complex, novel content
    }
    
    return Math.max(10, Math.min(90, difficulty))
  }

  private adaptContentFormat(content: any, profile: UserProfile, context: Record<string, any>): string {
    if (profile.personalityTraits.learningStyle === 'visual') {
      return 'visual_rich'
    } else if (profile.personalityTraits.learningStyle === 'auditory') {
      return 'audio_focused'
    } else {
      return 'text_based'
    }
  }

  private adaptContentTiming(content: any, profile: UserProfile, context: Record<string, any>): string {
    // Simple timing adaptation based on user activity patterns
    const preferences = profile.preferences.filter(p => p.category === 'timing')
    const timePreference = preferences.find(p => p.key === 'preferred_activity_time')
    
    return timePreference?.value || 'anytime'
  }
}

// Export singleton instance
export const personalizationEngine = PersonalizationEngine.getInstance() 