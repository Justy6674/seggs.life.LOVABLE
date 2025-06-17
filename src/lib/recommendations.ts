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
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { personalizationEngine, UserProfile } from './personalization'

// ===== TYPES =====

export interface RecommendationProfile {
  userId: string
  preferences: {
    contentTypes: string[]
    interactionStyles: string[]
    challengeLevels: string[]
    timePreferences: string[]
    formatPreferences: string[]
  }
  weights: Record<string, number>
  exclusions: string[]
  boosts: Record<string, number>
  lastUpdated: Date
}

export interface ContentItem {
  id: string
  type: 'article' | 'exercise' | 'challenge' | 'meditation' | 'conversation_starter' | 'assessment'
  title: string
  description: string
  category: string
  difficulty: number // 1-100
  duration: number // minutes
  tags: string[]
  skillAreas: string[]
  requirements?: string[]
  metadata: {
    author?: string
    source?: string
    language: string
    format: string
    interactionLevel: 'low' | 'medium' | 'high'
  }
  content: any
  effectiveness: number // 0-1, based on user feedback
  popularity: number // 0-1, based on usage
  lastUpdated: Date
}

export interface Recommendation {
  id: string
  userId: string
  contentItem: ContentItem
  score: number
  reasons: string[]
  personalizations: {
    style: string
    difficulty: number
    format: string
    timing: string
    estimatedEngagement: number
  }
  generatedAt: Date
  interacted: boolean
  feedback?: 'positive' | 'negative' | 'neutral'
  completionRate?: number
}

export interface UserBehavior {
  userId: string
  action: string
  contentId?: string
  contentType?: string
  context: Record<string, any>
  outcome: 'positive' | 'negative' | 'neutral'
  timestamp: Date
  engagement: {
    timeSpent: number
    interactionCount: number
    completionRate: number
    returnRate: number
  }
}

// ===== ADVANCED RECOMMENDATION ENGINE =====

export class AdvancedRecommendationEngine {
  private static instance: AdvancedRecommendationEngine
  private contentCache: Map<string, ContentItem[]> = new Map()
  private modelWeights: Record<string, number> = {
    personalityAlignment: 0.25,
    historicalPreference: 0.20,
    skillLevelMatch: 0.15,
    contentQuality: 0.15,
    diversityFactor: 0.10,
    timeRelevance: 0.10,
    socialProof: 0.05
  }

  static getInstance(): AdvancedRecommendationEngine {
    if (!AdvancedRecommendationEngine.instance) {
      AdvancedRecommendationEngine.instance = new AdvancedRecommendationEngine()
    }
    return AdvancedRecommendationEngine.instance
  }

  // ===== MAIN RECOMMENDATION GENERATION =====

  async generateRecommendations(
    userId: string, 
    options: {
      type?: string
      limit?: number
      includeExploration?: boolean
      timeContext?: string
      partnerMode?: boolean
    } = {}
  ): Promise<Recommendation[]> {
    try {
      const { 
        type = 'mixed', 
        limit = 10, 
        includeExploration = true,
        timeContext = 'general',
        partnerMode = false
      } = options

      // Get user profile and behavior data
      const [userProfile, behaviorData, recProfile] = await Promise.all([
        personalizationEngine.buildUserProfile(userId),
        this.getUserBehaviorData(userId),
        this.getRecommendationProfile(userId)
      ])

      // Get candidate content
      const candidates = await this.getCandidateContent(type, userProfile, recProfile)
      
      // Score all candidates using ML-powered algorithm
      const scoredCandidates = await Promise.all(
        candidates.map(async candidate => ({
          candidate,
          score: await this.calculateRecommendationScore(
            candidate, 
            userProfile, 
            behaviorData, 
            recProfile,
            timeContext
          )
        }))
      )

      // Apply advanced filtering and ranking
      let filteredCandidates = this.applyFilters(scoredCandidates, userProfile, recProfile)
      
      // Apply diversity algorithm
      if (includeExploration) {
        filteredCandidates = this.applyDiversityAlgorithm(filteredCandidates, userProfile)
      }

      // Sort by score and apply final selection
      const topCandidates = filteredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      // Generate final recommendations with personalization
      const recommendations = await Promise.all(
        topCandidates.map(({ candidate, score }) => 
          this.createRecommendation(candidate, score, userProfile, timeContext)
        )
      )

      // Track recommendations for future learning
      await this.trackRecommendations(userId, recommendations)

      return recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  // ===== SCORING ALGORITHM =====

  private async calculateRecommendationScore(
    content: ContentItem,
    profile: UserProfile,
    behaviorData: UserBehavior[],
    recProfile: RecommendationProfile,
    timeContext: string
  ): Promise<number> {
    let totalScore = 0

    // 1. Personality Alignment Score
    const personalityScore = this.calculatePersonalityAlignment(content, profile.personalityTraits)
    totalScore += personalityScore * this.modelWeights.personalityAlignment

    // 2. Historical Preference Score
    const historyScore = this.calculateHistoricalPreference(content, behaviorData)
    totalScore += historyScore * this.modelWeights.historicalPreference

    // 3. Skill Level Match Score
    const skillScore = this.calculateSkillLevelMatch(content, profile)
    totalScore += skillScore * this.modelWeights.skillLevelMatch

    // 4. Content Quality Score
    const qualityScore = this.calculateContentQuality(content)
    totalScore += qualityScore * this.modelWeights.contentQuality

    // 5. Diversity Factor Score
    const diversityScore = this.calculateDiversityFactor(content, behaviorData)
    totalScore += diversityScore * this.modelWeights.diversityFactor

    // 6. Time Relevance Score
    const timeScore = this.calculateTimeRelevance(content, profile, timeContext)
    totalScore += timeScore * this.modelWeights.timeRelevance

    // 7. Social Proof Score
    const socialScore = await this.calculateSocialProof(content)
    totalScore += socialScore * this.modelWeights.socialProof

    // Apply boost and penalty modifiers
    totalScore = this.applyModifiers(totalScore, content, recProfile)

    return Math.max(0, Math.min(1, totalScore))
  }

  private calculatePersonalityAlignment(content: ContentItem, traits: any): number {
    let score = 0.5 // Base score

    // Openness alignment
    if (content.tags.includes('creative') || content.tags.includes('novel')) {
      score += (traits.openness / 100) * 0.3
    }

    // Conscientiousness alignment
    if (content.tags.includes('structured') || content.tags.includes('goal-oriented')) {
      score += (traits.conscientiousness / 100) * 0.3
    }

    // Extraversion alignment
    if (content.tags.includes('social') || content.tags.includes('interactive')) {
      score += (traits.extraversion / 100) * 0.2
    }

    // Communication style alignment
    if (content.tags.includes('direct') && traits.communicationStyle === 'direct') {
      score += 0.2
    } else if (content.tags.includes('gentle') && traits.communicationStyle === 'indirect') {
      score += 0.2
    }

    return Math.min(1, score)
  }

  private calculateHistoricalPreference(content: ContentItem, behaviorData: UserBehavior[]): number {
    if (behaviorData.length === 0) return 0.5

    // Analyze past interactions with similar content
    const similarInteractions = behaviorData.filter(behavior => 
      behavior.contentType === content.type ||
      content.tags.some(tag => behavior.context.tags?.includes(tag))
    )

    if (similarInteractions.length === 0) return 0.4 // Slightly lower for unknown content

    // Calculate average engagement and outcome
    const avgEngagement = similarInteractions.reduce((sum, interaction) => {
      return sum + (
        interaction.engagement.completionRate * 0.4 +
        Math.min(1, interaction.engagement.timeSpent / 600) * 0.3 + // Normalize to 10 minutes
        Math.min(1, interaction.engagement.interactionCount / 10) * 0.3
      )
    }, 0) / similarInteractions.length

    const positiveOutcomes = similarInteractions.filter(i => i.outcome === 'positive').length
    const outcomeScore = positiveOutcomes / similarInteractions.length

    return (avgEngagement * 0.6 + outcomeScore * 0.4)
  }

  private calculateSkillLevelMatch(content: ContentItem, profile: UserProfile): number {
    // For now, use a simplified approach since we simplified the profile
    // In a full implementation, this would analyze user's skill levels in various areas
    
    // Base the difficulty match on personality traits
    const userAdaptability = (
      profile.personalityTraits.openness + 
      profile.personalityTraits.conscientiousness
    ) / 2

    const optimalDifficulty = 30 + (userAdaptability * 0.4) // 30-70 range based on adaptability
    const difficultyGap = Math.abs(content.difficulty - optimalDifficulty)
    
    // Higher score for better difficulty match
    return Math.max(0, 1 - (difficultyGap / 50))
  }

  private calculateContentQuality(content: ContentItem): number {
    // Combine effectiveness and popularity with content metadata
    const baseQuality = (content.effectiveness * 0.7 + content.popularity * 0.3)
    
    // Bonus for comprehensive content
    let qualityBonus = 0
    if (content.description.length > 200) qualityBonus += 0.1
    if (content.tags.length >= 3) qualityBonus += 0.1
    if (content.skillAreas.length >= 2) qualityBonus += 0.1
    
    return Math.min(1, baseQuality + qualityBonus)
  }

  private calculateDiversityFactor(content: ContentItem, behaviorData: UserBehavior[]): number {
    const recentBehaviors = behaviorData.filter(
      b => Date.now() - b.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    )

    if (recentBehaviors.length === 0) return 0.8 // High diversity for new users

    // Check how different this content is from recent interactions
    const recentTypes = new Set(recentBehaviors.map(b => b.contentType).filter(Boolean))
    const recentTags = new Set(
      recentBehaviors.flatMap(b => b.context.tags || [])
    )

    let diversityScore = 0.5

    // Type diversity
    if (!recentTypes.has(content.type)) {
      diversityScore += 0.3
    }

    // Tag diversity
    const uniqueTags = content.tags.filter(tag => !recentTags.has(tag))
    diversityScore += (uniqueTags.length / content.tags.length) * 0.2

    return Math.min(1, diversityScore)
  }

  private calculateTimeRelevance(content: ContentItem, profile: UserProfile, timeContext: string): number {
    let score = 0.7 // Base score

    // Duration appropriateness for time context
    if (timeContext === 'quick' && content.duration <= 5) score += 0.2
    if (timeContext === 'medium' && content.duration >= 5 && content.duration <= 20) score += 0.2
    if (timeContext === 'deep' && content.duration >= 15) score += 0.2

    // User timing preferences
    const timingPrefs = profile.preferences.filter(p => p.category === 'timing')
    if (timingPrefs.length > 0) {
      // This would be more sophisticated in a real implementation
      score += 0.1
    }

    return Math.min(1, score)
  }

  private async calculateSocialProof(content: ContentItem): Promise<number> {
    try {
      // Get usage statistics for this content
      const statsRef = collection(db, 'contentStats')
      const statsQuery = query(statsRef, where('contentId', '==', content.id))
      const statsSnapshot = await getDocs(statsQuery)
      
      if (statsSnapshot.empty) return 0.3 // Low social proof for new content

      const stats = statsSnapshot.docs[0].data()
      const completionRate = stats.completions / stats.views
      const avgRating = stats.totalRating / stats.ratingCount
      
      // Combine completion rate and rating
      return (completionRate * 0.6 + (avgRating / 5) * 0.4)
    } catch (error) {
      console.error('Error calculating social proof:', error)
      return 0.5
    }
  }

  private applyModifiers(score: number, content: ContentItem, recProfile: RecommendationProfile): number {
    let modifiedScore = score

    // Apply boosts
    Object.entries(recProfile.boosts).forEach(([tag, boost]) => {
      if (content.tags.includes(tag)) {
        modifiedScore *= (1 + boost)
      }
    })

    // Apply exclusions (heavy penalties)
    recProfile.exclusions.forEach(exclusion => {
      if (content.tags.includes(exclusion)) {
        modifiedScore *= 0.1
      }
    })

    return Math.max(0, Math.min(1, modifiedScore))
  }

  // ===== FILTERING AND DIVERSITY =====

  private applyFilters(
    scoredCandidates: Array<{ candidate: ContentItem; score: number }>,
    profile: UserProfile,
    recProfile: RecommendationProfile
  ): Array<{ candidate: ContentItem; score: number }> {
    return scoredCandidates.filter(({ candidate, score }) => {
      // Minimum score threshold
      if (score < 0.2) return false

      // Content type preferences
      if (recProfile.preferences.contentTypes.length > 0 && 
          !recProfile.preferences.contentTypes.includes(candidate.type)) {
        return false
      }

      // Exclude content that's too difficult or too easy
      const userLevel = (profile.personalityTraits.openness + profile.personalityTraits.conscientiousness) / 2
      if (candidate.difficulty > userLevel + 30 || candidate.difficulty < userLevel - 30) {
        return false
      }

      return true
    })
  }

  private applyDiversityAlgorithm(
    candidates: Array<{ candidate: ContentItem; score: number }>,
    profile: UserProfile
  ): Array<{ candidate: ContentItem; score: number }> {
    const diversified: Array<{ candidate: ContentItem; score: number }> = []
    const usedTypes = new Set<string>()
    const usedCategories = new Set<string>()
    
    // Sort by score first
    const sorted = [...candidates].sort((a, b) => b.score - a.score)
    
    // Ensure diversity while maintaining quality
    for (const item of sorted) {
      if (diversified.length >= 15) break

      const { candidate } = item
      const typesSeen = usedTypes.size
      const categoriesSeen = usedCategories.size

      // Add if it's high quality or provides needed diversity
      if (item.score > 0.7 || 
          !usedTypes.has(candidate.type) || 
          !usedCategories.has(candidate.category) ||
          (typesSeen < 3 || categoriesSeen < 3)) {
        
        diversified.push(item)
        usedTypes.add(candidate.type)
        usedCategories.add(candidate.category)
      }
    }

    return diversified
  }

  // ===== RECOMMENDATION CREATION =====

  private async createRecommendation(
    content: ContentItem,
    score: number,
    profile: UserProfile,
    timeContext: string
  ): Promise<Recommendation> {
    // Generate personalized adaptations
    const personalizations = {
      style: this.determineStyle(profile.personalityTraits),
      difficulty: this.adaptDifficulty(content.difficulty, profile),
      format: this.determineFormat(profile.personalityTraits),
      timing: timeContext,
      estimatedEngagement: this.estimateEngagement(content, profile)
    }

    // Generate explanation reasons
    const reasons = this.generateReasons(content, profile, score)

    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: profile.userId,
      contentItem: content,
      score,
      reasons,
      personalizations,
      generatedAt: new Date(),
      interacted: false
    }
  }

  private determineStyle(traits: any): string {
    if (traits.communicationStyle === 'direct' && traits.extraversion > 70) {
      return 'energetic_direct'
    } else if (traits.agreeableness > 70) {
      return 'gentle_supportive'
    } else if (traits.openness > 80) {
      return 'creative_exploratory'
    } else {
      return 'balanced_friendly'
    }
  }

  private adaptDifficulty(baseDifficulty: number, profile: UserProfile): number {
    const userAdaptability = (
      profile.personalityTraits.openness + 
      profile.personalityTraits.conscientiousness
    ) / 2

    // Adjust difficulty based on user traits
    let adjustedDifficulty = baseDifficulty

    if (profile.personalityTraits.conscientiousness > 70) {
      adjustedDifficulty += 5 // Can handle slightly more challenge
    }

    if (profile.personalityTraits.openness > 80) {
      adjustedDifficulty += 10 // Enjoys complexity
    }

    if (profile.personalityTraits.neuroticism > 70) {
      adjustedDifficulty -= 10 // Reduce stress
    }

    return Math.max(1, Math.min(100, adjustedDifficulty))
  }

  private determineFormat(traits: any): string {
    if (traits.learningStyle === 'visual') return 'visual_rich'
    if (traits.learningStyle === 'auditory') return 'audio_focused'
    if (traits.learningStyle === 'kinesthetic') return 'interactive'
    return 'multimedia'
  }

  private estimateEngagement(content: ContentItem, profile: UserProfile): number {
    let engagement = 0.5

    // Based on personality alignment
    if (content.tags.includes('creative') && profile.personalityTraits.openness > 70) {
      engagement += 0.2
    }

    if (content.tags.includes('structured') && profile.personalityTraits.conscientiousness > 70) {
      engagement += 0.2
    }

    // Based on content quality
    engagement += content.effectiveness * 0.3

    return Math.min(1, engagement)
  }

  private generateReasons(content: ContentItem, profile: UserProfile, score: number): string[] {
    const reasons: string[] = []

    if (score > 0.8) {
      reasons.push("Highly recommended based on your profile")
    }

    if (content.tags.includes('creative') && profile.personalityTraits.openness > 70) {
      reasons.push("Matches your creative and open-minded nature")
    }

    if (content.type === 'exercise' && profile.personalityTraits.conscientiousness > 60) {
      reasons.push("Structured approach aligns with your organized style")
    }

    if (content.difficulty >= 60 && profile.personalityTraits.conscientiousness > 70) {
      reasons.push("Appropriate challenge level for your commitment style")
    }

    if (content.effectiveness > 0.8) {
      reasons.push("Proven effectiveness with other users")
    }

    return reasons.slice(0, 3) // Limit to top 3 reasons
  }

  // ===== HELPER METHODS =====

  private async getCandidateContent(
    type: string, 
    profile: UserProfile, 
    recProfile: RecommendationProfile
  ): Promise<ContentItem[]> {
    try {
      const contentRef = collection(db, 'content')
      let contentQuery = query(contentRef, limit(100))

      if (type !== 'mixed') {
        contentQuery = query(contentRef, where('type', '==', type), limit(50))
      }

      const snapshot = await getDocs(contentQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[]
    } catch (error) {
      console.error('Error fetching candidate content:', error)
      // Return sample content for development
      return this.getSampleContent()
    }
  }

  private getSampleContent(): ContentItem[] {
    return [
      {
        id: 'sample_1',
        type: 'exercise',
        title: 'Daily Gratitude Practice',
        description: 'A simple but powerful exercise to build appreciation and positive thinking',
        category: 'mindfulness',
        difficulty: 20,
        duration: 5,
        tags: ['gratitude', 'daily', 'simple', 'positive'],
        skillAreas: ['emotional_intelligence', 'mindfulness'],
        metadata: {
          language: 'en',
          format: 'guided',
          interactionLevel: 'low'
        },
        content: {},
        effectiveness: 0.8,
        popularity: 0.9,
        lastUpdated: new Date()
      },
      {
        id: 'sample_2',
        type: 'article',
        title: 'Understanding Love Languages',
        description: 'Learn about the five love languages and how to identify yours and your partner\'s',
        category: 'communication',
        difficulty: 40,
        duration: 15,
        tags: ['love_languages', 'communication', 'understanding', 'relationships'],
        skillAreas: ['communication', 'empathy'],
        metadata: {
          language: 'en',
          format: 'text',
          interactionLevel: 'medium'
        },
        content: {},
        effectiveness: 0.9,
        popularity: 0.7,
        lastUpdated: new Date()
      },
      {
        id: 'sample_3',
        type: 'challenge',
        title: 'Weekly Connection Challenge',
        description: 'Seven days of activities designed to deepen your emotional connection',
        category: 'intimacy',
        difficulty: 60,
        duration: 30,
        tags: ['connection', 'weekly', 'intimacy', 'structured', 'goal-oriented'],
        skillAreas: ['intimacy', 'communication', 'consistency'],
        metadata: {
          language: 'en',
          format: 'interactive',
          interactionLevel: 'high'
        },
        content: {},
        effectiveness: 0.85,
        popularity: 0.6,
        lastUpdated: new Date()
      }
    ]
  }

  private async getUserBehaviorData(userId: string): Promise<UserBehavior[]> {
    try {
      const behaviorRef = collection(db, 'userBehaviors')
      const behaviorQuery = query(
        behaviorRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      
      const snapshot = await getDocs(behaviorQuery)
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as UserBehavior[]
    } catch (error) {
      console.error('Error fetching user behavior data:', error)
      return []
    }
  }

  private async getRecommendationProfile(userId: string): Promise<RecommendationProfile> {
    try {
      const profileDoc = await getDoc(doc(db, 'recommendationProfiles', userId))
      if (profileDoc.exists()) {
        return profileDoc.data() as RecommendationProfile
      }
    } catch (error) {
      console.error('Error fetching recommendation profile:', error)
    }

    // Return default profile
    return {
      userId,
      preferences: {
        contentTypes: ['article', 'exercise', 'challenge'],
        interactionStyles: ['guided', 'self_directed'],
        challengeLevels: ['moderate'],
        timePreferences: ['evening'],
        formatPreferences: ['visual', 'text']
      },
      weights: {
        contentType: 0.2,
        personality: 0.3,
        difficulty: 0.2,
        timing: 0.15,
        novelty: 0.15
      },
      exclusions: [],
      boosts: {},
      lastUpdated: new Date()
    }
  }

  private async trackRecommendations(userId: string, recommendations: Recommendation[]): Promise<void> {
    try {
      await addDoc(collection(db, 'recommendationTracking'), {
        userId,
        recommendations: recommendations.map(r => ({
          id: r.id,
          contentId: r.contentItem.id,
          score: r.score,
          reasons: r.reasons
        })),
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error tracking recommendations:', error)
    }
  }

  // ===== PUBLIC METHODS FOR FEEDBACK =====

  async recordInteraction(
    userId: string, 
    recommendationId: string, 
    interactionType: string,
    feedback?: any
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'recommendationInteractions'), {
        userId,
        recommendationId,
        interactionType,
        feedback,
        timestamp: serverTimestamp()
      })

      // Update recommendation model based on feedback
      if (feedback) {
        await this.updateModelWeights(userId, recommendationId, feedback)
      }
    } catch (error) {
      console.error('Error recording interaction:', error)
    }
  }

  private async updateModelWeights(
    userId: string, 
    recommendationId: string, 
    feedback: any
  ): Promise<void> {
    // This would implement online learning to improve recommendations
    // For now, we'll just log the feedback
    console.log('Updating model weights based on feedback:', { userId, recommendationId, feedback })
  }
}

// Export singleton instance
export const recommendationEngine = AdvancedRecommendationEngine.getInstance() 