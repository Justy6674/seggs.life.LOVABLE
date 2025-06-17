'use client'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  collection, 
  doc, 
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
import { SmartFeedbackService } from './smartFeedback'
import { UserService } from './database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface ComprehensiveUserProfile {
  userId: string
  partnerId?: string
  createdAt: Date
  lastUpdated: Date
  
  // Core Preferences
  blueprintAlignment: {
    primary: string
    secondary?: string
    confidence: number
    evolving: boolean
  }
  
  // Behavioral Patterns
  intimacyPreferences: {
    optimalIntensity: 'sweet' | 'flirty' | 'spicy' | 'wild'
    preferredCategories: Array<{
      category: string
      affinity: number // 0-1 scale
      frequency: number
      recentTrend: 'increasing' | 'stable' | 'decreasing'
    }>
    avoidancePatterns: Array<{
      pattern: string
      strength: number
      context: string
    }>
    successFactors: Array<{
      factor: string
      impact: number
      consistency: number
    }>
  }
  
  // Temporal Patterns
  engagementRhythms: {
    optimalTimes: Array<{
      dayOfWeek: number
      hour: number
      confidence: number
    }>
    sessionDuration: {
      average: number
      preferred: number
      tolerance: number
    }
    frequencyPatterns: {
      weeklyAverage: number
      consistency: number
      seasonalVariations: Record<string, number>
    }
  }
  
  // Communication Style
  communicationProfile: {
    preferredTone: 'playful' | 'romantic' | 'direct' | 'nurturing' | 'educational'
    responseStyle: 'detailed' | 'concise' | 'exploratory' | 'practical'
    topicComfort: Record<string, number>
    boundaries: string[]
    growthAreas: string[]
  }
  
  // Relationship Context
  relationshipDynamics: {
    phase: 'exploring' | 'building' | 'deepening' | 'maintaining' | 'renewing'
    focusAreas: string[]
    partnerSynergy?: number
    communicationHealth: number
    satisfactionTrend: 'improving' | 'stable' | 'declining'
  }
  
  // Predictive Insights
  aiPersonality: {
    dominantTraits: string[]
    motivators: string[]
    challengeAreas: string[]
    growthPotential: string[]
    uniqueQualities: string[]
  }
  
  // Learning Adaptations
  adaptationSignals: {
    learningVelocity: number
    preferenceStability: number
    explorationWillingness: number
    feedbackQuality: number
  }
  
  // Future Recommendations
  futurePathways: {
    suggestedFocus: string[]
    nextSteps: string[]
    longTermGoals: string[]
    timelineEstimates: Record<string, string>
  }
}

export interface PreferenceEvolution {
  userId: string
  timeframe: 'daily' | 'weekly' | 'monthly'
  changes: Array<{
    aspect: string
    previousValue: any
    newValue: any
    changeSignificance: number
    context: string
  }>
  trends: Array<{
    pattern: string
    direction: 'positive' | 'negative' | 'neutral'
    strength: number
    implications: string[]
  }>
  insights: string[]
}

export class UserPreferenceProfiler {
  
  /**
   * Build a comprehensive user preference profile
   */
  static async buildUserProfile(userId: string): Promise<ComprehensiveUserProfile> {
    try {
      const userData = await UserService.getUser(userId)
      const feedbackAnalysis = await SmartFeedbackService.analyzeUserFeedbackPatterns(userId)
      
      // Get conversation patterns from IntelligentConversationService
      const conversationPatterns = await this.getConversationPatterns(userId)
      
      // Analyze engagement patterns
      const engagementPatterns = await this.analyzeEngagementPatterns(userId)
      
      // Build AI personality insights
      const aiPersonality = await this.generateAIPersonalityInsights(
        userData, 
        feedbackAnalysis, 
        conversationPatterns
      )
      
      // Determine relationship phase and dynamics
      const relationshipDynamics = await this.analyzeRelationshipDynamics(
        userId, 
        userData, 
        feedbackAnalysis
      )
      
      // Generate future pathways
      const futurePathways = await this.generateFuturePathways(
        userData,
        feedbackAnalysis,
        aiPersonality,
        relationshipDynamics
      )
      
      const profile: ComprehensiveUserProfile = {
        userId,
        partnerId: userData?.partnerId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        
        blueprintAlignment: {
          primary: userData?.eroticBlueprintPrimary || 'sensual',
          secondary: userData?.eroticBlueprintSecondary,
          confidence: this.calculateBlueprintConfidence(userData),
          evolving: await this.detectBlueprintEvolution(userId, userData)
        },
        
        intimacyPreferences: {
          optimalIntensity: feedbackAnalysis.intensityPreferences.optimal as any,
          preferredCategories: await Promise.all(feedbackAnalysis.categoryPreferences.map(async (cat) => ({
            category: cat.category,
            affinity: cat.satisfaction,
            frequency: cat.frequency,
            recentTrend: await this.detectCategoryTrend(userId, cat.category)
          }))),
          avoidancePatterns: feedbackAnalysis.avoidancePatterns.map(pattern => ({
            pattern,
            strength: 0.8, // Default strength
            context: 'User feedback patterns'
          })),
          successFactors: feedbackAnalysis.successPatterns.map(pattern => ({
            factor: pattern,
            impact: 0.7, // Default impact
            consistency: 0.8 // Default consistency
          }))
        },
        
        engagementRhythms: engagementPatterns,
        
        communicationProfile: {
          preferredTone: conversationPatterns.preferredTone,
          responseStyle: conversationPatterns.responseStyle,
          topicComfort: conversationPatterns.topicComfort,
          boundaries: userData?.boundaries || [],
          growthAreas: this.identifyGrowthAreas(feedbackAnalysis, conversationPatterns)
        },
        
        relationshipDynamics,
        aiPersonality,
        
        adaptationSignals: {
          learningVelocity: this.calculateLearningVelocity(userId),
          preferenceStability: this.calculatePreferenceStability(feedbackAnalysis),
          explorationWillingness: this.calculateExplorationWillingness(feedbackAnalysis),
          feedbackQuality: this.calculateFeedbackQuality(feedbackAnalysis)
        },
        
        futurePathways
      }
      
      // Save profile to database
      await this.saveUserProfile(profile)
      
      return profile
    } catch (error) {
      console.error('Error building user profile:', error)
      return this.getDefaultProfile(userId)
    }
  }
  
  /**
   * Analyze preference evolution over time
   */
  static async analyzePreferenceEvolution(
    userId: string, 
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<PreferenceEvolution> {
    try {
      // Get historical feedback data
      const historicalData = await this.getHistoricalFeedbackData(userId, timeframe)
      
      // Compare current vs previous periods
      const changes = await this.detectSignificantChanges(historicalData)
      
      // Identify trends
      const trends = await this.identifyEvolutionTrends(historicalData, changes)
      
      // Generate AI insights about evolution
      const insights = await this.generateEvolutionInsights(changes, trends)
      
      return {
        userId,
        timeframe,
        changes,
        trends,
        insights
      }
    } catch (error) {
      console.error('Error analyzing preference evolution:', error)
      return {
        userId,
        timeframe,
        changes: [],
        trends: [],
        insights: ['Insufficient data for evolution analysis']
      }
    }
  }
  
  /**
   * Get personalized recommendations based on profile
   */
  static async getPersonalizedRecommendations(
    userId: string,
    focus?: 'growth' | 'comfort' | 'exploration' | 'relationship'
  ): Promise<{
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    challenges: string[]
    reasoning: string
  }> {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) {
        throw new Error('No profile found')
      }
      
      const focusArea = focus || this.determineBestFocus(profile)
      
      const prompt = `Based on this comprehensive user profile, generate personalized recommendations:

BLUEPRINT: ${profile.blueprintAlignment.primary}${profile.blueprintAlignment.secondary ? ` + ${profile.blueprintAlignment.secondary}` : ''}
RELATIONSHIP PHASE: ${profile.relationshipDynamics.phase}
PREFERRED INTENSITY: ${profile.intimacyPreferences.optimalIntensity}
TOP CATEGORIES: ${profile.intimacyPreferences.preferredCategories.slice(0, 3).map(c => c.category).join(', ')}
COMMUNICATION STYLE: ${profile.communicationProfile.preferredTone}
FOCUS AREA: ${focusArea}
LEARNING VELOCITY: ${profile.adaptationSignals.learningVelocity}
EXPLORATION WILLINGNESS: ${profile.adaptationSignals.explorationWillingness}

Generate recommendations in JSON format:
{
  "immediate": ["action1", "action2", "action3"],
  "shortTerm": ["goal1", "goal2", "goal3"],
  "longTerm": ["vision1", "vision2"],
  "challenges": ["challenge1", "challenge2"],
  "reasoning": "explanation of recommendation strategy"
}

Focus on ${focusArea} while respecting their communication style and relationship phase.`

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const recommendationsText = response.text()
      
      try {
        return JSON.parse(recommendationsText)
      } catch (parseError) {
        return this.getFallbackRecommendations(profile, focusArea)
      }
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return this.getFallbackRecommendations(null, focus || 'comfort')
    }
  }
  
  /**
   * Helper methods
   */
  private static async getConversationPatterns(userId: string) {
    // This would integrate with IntelligentConversationService
    // For now, providing default values
    return {
      preferredTone: 'nurturing' as const,
      responseStyle: 'detailed' as const,
      topicComfort: {
        'emotional_intimacy': 0.8,
        'physical_intimacy': 0.6,
        'communication': 0.9,
        'relationship_goals': 0.7,
        'personal_growth': 0.8
      }
    }
  }
  
  private static async analyzeEngagementPatterns(userId: string) {
    // Analyze user engagement patterns from app usage
    return {
      optimalTimes: [
        { dayOfWeek: 6, hour: 20, confidence: 0.8 }, // Saturday evening
        { dayOfWeek: 0, hour: 11, confidence: 0.7 }  // Sunday morning
      ],
      sessionDuration: {
        average: 15,
        preferred: 20,
        tolerance: 10
      },
      frequencyPatterns: {
        weeklyAverage: 3,
        consistency: 0.7,
        seasonalVariations: {
          'winter': 1.2,
          'spring': 1.0,
          'summer': 0.9,
          'fall': 1.1
        }
      }
    }
  }
  
  private static async generateAIPersonalityInsights(
    userData: any,
    feedbackAnalysis: any,
    conversationPatterns: any
  ) {
    try {
      const prompt = `Analyze this user's personality for intimacy and relationships:

BLUEPRINT: ${userData?.eroticBlueprintPrimary}
SATISFACTION: ${Math.round(feedbackAnalysis.overallSatisfaction * 100)}%
PREFERRED CATEGORIES: ${feedbackAnalysis.categoryPreferences.slice(0, 3).map((c: any) => c.category).join(', ')}
COMMUNICATION TONE: ${conversationPatterns.preferredTone}
EXPLORATION LEVEL: ${feedbackAnalysis.categoryPreferences.length > 3 ? 'High' : 'Moderate'}

Generate personality insights in JSON format:
{
  "dominantTraits": ["trait1", "trait2", "trait3"],
  "motivators": ["motivator1", "motivator2"],
  "challengeAreas": ["challenge1", "challenge2"],
  "growthPotential": ["potential1", "potential2"],
  "uniqueQualities": ["quality1", "quality2"]
}

Focus on relationship and intimacy context.`

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const personalityText = response.text()
      
      try {
        return JSON.parse(personalityText)
      } catch (parseError) {
        return this.getDefaultPersonality(userData?.eroticBlueprintPrimary)
      }
    } catch (error) {
      return this.getDefaultPersonality(userData?.eroticBlueprintPrimary)
    }
  }
  
  private static async analyzeRelationshipDynamics(
    userId: string,
    userData: any,
    feedbackAnalysis: any
  ) {
    const hasPartner = !!userData?.partnerId
    const satisfaction = feedbackAnalysis.overallSatisfaction
    
    let phase: any = 'exploring'
    if (satisfaction > 0.8) phase = 'deepening'
    else if (satisfaction > 0.6) phase = 'building'
    else if (satisfaction < 0.4) phase = 'renewing'
    
    return {
      phase,
      focusAreas: this.determineFocusAreas(feedbackAnalysis),
      partnerSynergy: hasPartner ? 0.7 : undefined,
      communicationHealth: satisfaction * 0.9 + 0.1,
      satisfactionTrend: satisfaction > 0.6 ? 'improving' as const : 'stable' as const
    }
  }
  
  private static async generateFuturePathways(
    userData: any,
    feedbackAnalysis: any,
    aiPersonality: any,
    relationshipDynamics: any
  ) {
    const hasPartner = !!userData?.partnerId
    
    return {
      suggestedFocus: [
        'Deepen emotional connection',
        'Explore comfort zone edges',
        'Strengthen communication patterns'
      ],
      nextSteps: [
        'Try a new category of suggestions',
        'Increase feedback detail',
        'Set weekly intimacy intentions'
      ],
      longTermGoals: [
        'Build lasting intimacy habits',
        'Develop relationship resilience',
        hasPartner ? 'Achieve deeper partner synchronization' : 'Prepare for future partnership'
      ],
      timelineEstimates: {
        'comfort_expansion': '2-4 weeks',
        'habit_formation': '6-8 weeks',
        'deep_integration': '3-6 months'
      }
    }
  }
  
  private static calculateBlueprintConfidence(userData: any): number {
    if (!userData?.eroticBlueprintScores) return 0.5
    
    const scores = userData.eroticBlueprintScores
    const values = Object.values(scores) as number[]
    const max = Math.max(...values)
    const secondMax = values.sort((a, b) => b - a)[1]
    
    // Higher confidence if there's a clear winner
    return Math.min((max - secondMax) / max + 0.3, 1.0)
  }
  
  private static async detectBlueprintEvolution(userId: string, userData: any): Promise<boolean> {
    // Check if user's preferences have been shifting
    // This would require historical tracking
    return false // Default to not evolving
  }
  
  private static async detectCategoryTrend(userId: string, category: string): Promise<'increasing' | 'stable' | 'decreasing'> {
    // Analyze recent feedback to detect trends
    return 'stable' // Default
  }
  
  private static identifyGrowthAreas(feedbackAnalysis: any, conversationPatterns: any): string[] {
    const areas: string[] = []
    
    if (feedbackAnalysis.overallSatisfaction < 0.6) {
      areas.push('Feedback quality and specificity')
    }
    
    if (feedbackAnalysis.categoryPreferences.length < 3) {
      areas.push('Category exploration')
    }
    
    return areas
  }
  
  private static determineFocusAreas(feedbackAnalysis: any): string[] {
    const areas: string[] = []
    
    if (feedbackAnalysis.overallSatisfaction < 0.6) {
      areas.push('Basic satisfaction and comfort')
    }
    
    if (feedbackAnalysis.categoryPreferences.length > 5) {
      areas.push('Preference refinement and focus')
    } else {
      areas.push('Exploration and discovery')
    }
    
    return areas
  }
  
  private static async saveUserProfile(profile: ComprehensiveUserProfile): Promise<void> {
    try {
      await addDoc(collection(db, 'userProfiles'), {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })
    } catch (error) {
      console.error('Error saving user profile:', error)
    }
  }
  
  private static async getUserProfile(userId: string): Promise<ComprehensiveUserProfile | null> {
    try {
      const profileQuery = query(
        collection(db, 'userProfiles'),
        where('userId', '==', userId),
        orderBy('lastUpdated', 'desc'),
        limit(1)
      )
      
      const profileDocs = await getDocs(profileQuery)
      if (profileDocs.empty) return null
      
      const profileData = profileDocs.docs[0].data()
      return {
        ...profileData,
        createdAt: profileData.createdAt?.toDate() || new Date(),
        lastUpdated: profileData.lastUpdated?.toDate() || new Date()
      } as ComprehensiveUserProfile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }
  
  private static getDefaultProfile(userId: string): ComprehensiveUserProfile {
    return {
      userId,
      createdAt: new Date(),
      lastUpdated: new Date(),
      blueprintAlignment: {
        primary: 'sensual',
        confidence: 0.5,
        evolving: false
      },
      intimacyPreferences: {
        optimalIntensity: 'flirty',
        preferredCategories: [],
        avoidancePatterns: [],
        successFactors: []
      },
      engagementRhythms: {
        optimalTimes: [],
        sessionDuration: { average: 15, preferred: 20, tolerance: 10 },
        frequencyPatterns: { weeklyAverage: 2, consistency: 0.5, seasonalVariations: {} }
      },
      communicationProfile: {
        preferredTone: 'nurturing',
        responseStyle: 'detailed',
        topicComfort: {},
        boundaries: [],
        growthAreas: []
      },
      relationshipDynamics: {
        phase: 'exploring',
        focusAreas: ['Discovery'],
        communicationHealth: 0.7,
        satisfactionTrend: 'stable'
      },
      aiPersonality: {
        dominantTraits: ['Curious', 'Thoughtful'],
        motivators: ['Connection', 'Growth'],
        challengeAreas: ['Building consistency'],
        growthPotential: ['Exploring new areas'],
        uniqueQualities: ['Open to learning']
      },
      adaptationSignals: {
        learningVelocity: 0.5,
        preferenceStability: 0.5,
        explorationWillingness: 0.6,
        feedbackQuality: 0.5
      },
      futurePathways: {
        suggestedFocus: ['Start with gentle exploration'],
        nextSteps: ['Complete blueprint assessment'],
        longTermGoals: ['Build intimate connection'],
        timelineEstimates: {}
      }
    }
  }
  
  private static getDefaultPersonality(blueprint?: string) {
    const blueprintPersonalities: Record<string, any> = {
      'Energetic': {
        dominantTraits: ['Energy-focused', 'Connection-oriented', 'Enthusiastic'],
        motivators: ['Shared energy', 'Emotional connection'],
        challengeAreas: ['Maintaining boundaries', 'Grounding practices'],
        growthPotential: ['Energy management', 'Deeper intimacy'],
        uniqueQualities: ['High sensitivity to energy', 'Natural connector']
      },
      'Sensual': {
        dominantTraits: ['Sensory-focused', 'Aesthetic appreciation', 'Mindful'],
        motivators: ['Beautiful experiences', 'Sensory pleasure'],
        challengeAreas: ['Direct communication', 'Time management'],
        growthPotential: ['Expanding sensory repertoire', 'Sharing preferences'],
        uniqueQualities: ['Rich sensory awareness', 'Creates beautiful moments']
      }
    }
    
    return blueprintPersonalities[blueprint || 'Sensual'] || blueprintPersonalities['Sensual']
  }
  
  // Additional helper methods for evolution analysis
  private static async getHistoricalFeedbackData(userId: string, timeframe: string) {
    // Implementation would fetch historical data
    return []
  }
  
  private static async detectSignificantChanges(historicalData: any[]) {
    // Implementation would analyze data changes
    return []
  }
  
  private static async identifyEvolutionTrends(historicalData: any[], changes: any[]) {
    // Implementation would identify trends
    return []
  }
  
  private static async generateEvolutionInsights(changes: any[], trends: any[]) {
    // Implementation would generate insights
    return ['Preference profile is developing steadily']
  }
  
  private static determineBestFocus(profile: ComprehensiveUserProfile): string {
    if (profile.adaptationSignals.explorationWillingness > 0.7) return 'exploration'
    if (profile.relationshipDynamics.satisfactionTrend === 'improving') return 'growth'
    if (profile.relationshipDynamics.phase === 'renewing') return 'relationship'
    return 'comfort'
  }
  
  private static getFallbackRecommendations(profile: any, focus: string) {
    return {
      immediate: ['Take time for reflection', 'Share appreciation with partner'],
      shortTerm: ['Explore new conversation topics', 'Try gentle new experiences'],
      longTerm: ['Build lasting intimacy habits', 'Deepen emotional connection'],
      challenges: ['Maintain consistency', 'Stay open to growth'],
      reasoning: `Focusing on ${focus} with gentle progression and sustainable practices.`
    }
  }
  
  private static calculateLearningVelocity(userId: string): number {
    // Implementation would analyze how quickly user adapts
    return 0.6 // Default moderate learning velocity
  }
  
  private static calculatePreferenceStability(feedbackAnalysis: any): number {
    // Implementation would analyze preference consistency
    return 0.7 // Default moderate stability
  }
  
  private static calculateExplorationWillingness(feedbackAnalysis: any): number {
    // Based on variety of categories tried
    return Math.min(feedbackAnalysis.categoryPreferences.length / 5, 1.0)
  }
  
  private static calculateFeedbackQuality(feedbackAnalysis: any): number {
    // Based on depth and consistency of feedback
    const hasNotes = feedbackAnalysis.personalizedInsights.length > 2
    const hasVariety = feedbackAnalysis.categoryPreferences.length > 2
    return (hasNotes ? 0.6 : 0.3) + (hasVariety ? 0.4 : 0.2)
  }
} 