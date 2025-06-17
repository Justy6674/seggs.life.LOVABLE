'use client'

import { GoogleGenerativeAI } from '@google/generative-ai'
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
import type { 
  SuggestionFeedback, 
  UserPreferenceProfile,
  ConversationMessage 
} from './firebase'
import { UserService } from './database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface FeedbackAnalysis {
  overallSatisfaction: number
  categoryPreferences: Array<{
    category: string
    satisfaction: number
    frequency: number
    effectiveness: number
  }>
  timingPatterns: Array<{
    timeOfDay: string
    dayOfWeek: number
    successRate: number
  }>
  intensityPreferences: {
    sweet: number
    flirty: number
    spicy: number
    wild: number
    optimal: string
  }
  avoidancePatterns: string[]
  successPatterns: string[]
  personalizedInsights: string[]
  recommendations: string[]
}

export interface PreferenceInsight {
  category: string
  preference: 'loved' | 'disliked' | 'neutral'
  confidence: number
  evidence: string[]
  recommendations: string[]
}

export class SmartFeedbackService {
  
  /**
   * Save detailed feedback for a suggestion with rich context
   */
  static async saveSuggestionFeedback(
    userId: string,
    suggestionId: string,
    suggestionType: string,
    category: string,
    heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild',
    feedback: 'loved' | 'tried' | 'not_for_us' | 'maybe_later' | 'too_intense' | 'not_enough',
    outcome?: 'successful' | 'mixed' | 'unsuccessful',
    notes?: string,
    partnerFeedback?: string
  ): Promise<string> {
    try {
      const userData = await UserService.getUser(userId)
      
      const feedbackDoc = await addDoc(collection(db, 'feedback'), {
        userId,
        coupleId: userData?.coupleId || null,
        suggestionId,
        suggestionType,
        category,
        heatLevel,
        feedback,
        outcome,
        notes,
        timestamp: serverTimestamp(),
        partnerFeedback,
        partnerRating: partnerFeedback ? this.extractRatingFromText(partnerFeedback) : null,
        context: {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() < 17 ? 'afternoon' : 
                    new Date().getHours() < 21 ? 'evening' : 'night',
          dayOfWeek: new Date().getDay(),
          relationshipMood: await this.inferRelationshipMood(userId),
          recentEvents: await this.getRecentEvents(userId)
        }
      })

      // Trigger preference analysis update
      await this.updateUserPreferences(userId)
      
      return feedbackDoc.id
    } catch (error) {
      console.error('Error saving suggestion feedback:', error)
      throw error
    }
  }

  /**
   * Analyze user feedback patterns to build preference profile
   */
  static async analyzeUserFeedbackPatterns(userId: string): Promise<FeedbackAnalysis> {
    try {
      // Get all feedback for this user
      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100) // Analyze last 100 feedback items
      )

      const feedbackDocs = await getDocs(feedbackQuery)
      const feedbackData: any[] = []

      feedbackDocs.forEach(doc => {
        feedbackData.push({ id: doc.id, ...doc.data() })
      })

      if (feedbackData.length === 0) {
        return this.getDefaultFeedbackAnalysis()
      }

      // Analyze patterns
      const overallSatisfaction = this.calculateOverallSatisfaction(feedbackData)
      const categoryPreferences = this.analyzeCategoryPreferences(feedbackData)
      const timingPatterns = this.analyzeTimingPatterns(feedbackData)
      const intensityPreferences = this.analyzeIntensityPreferences(feedbackData)
      const avoidancePatterns = this.findAvoidancePatterns(feedbackData)
      const successPatterns = this.findSuccessPatterns(feedbackData)

      // Generate AI insights
      const aiInsights = await this.generateFeedbackInsights(
        feedbackData,
        overallSatisfaction,
        categoryPreferences,
        intensityPreferences
      )

      return {
        overallSatisfaction,
        categoryPreferences,
        timingPatterns,
        intensityPreferences,
        avoidancePatterns,
        successPatterns,
        personalizedInsights: aiInsights.insights,
        recommendations: aiInsights.recommendations
      }
    } catch (error) {
      console.error('Error analyzing feedback patterns:', error)
      return this.getDefaultFeedbackAnalysis()
    }
  }

  /**
   * Generate personalized suggestions based on feedback patterns
   */
  static async generatePersonalizedSuggestions(
    userId: string,
    category?: string,
    count: number = 5
  ): Promise<Array<{
    suggestion: string
    category: string
    heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild'
    confidence: number
    reasoning: string
  }>> {
    try {
      const analysis = await this.analyzeUserFeedbackPatterns(userId)
      const userData = await UserService.getUser(userId)

      // Build context for AI generation
      const context = {
        blueprintPrimary: userData?.eroticBlueprintPrimary,
        blueprintSecondary: userData?.eroticBlueprintSecondary,
        preferredCategories: analysis.categoryPreferences.slice(0, 3),
        optimalIntensity: analysis.intensityPreferences.optimal,
        avoidancePatterns: analysis.avoidancePatterns,
        successPatterns: analysis.successPatterns,
        partnerStatus: userData?.partnerId ? 'coupled' : 'solo'
      }

      const prompt = `Generate ${count} personalized intimacy suggestions based on this user profile:

BLUEPRINT: ${context.blueprintPrimary}${context.blueprintSecondary ? ` + ${context.blueprintSecondary}` : ''}
PREFERRED CATEGORIES: ${context.preferredCategories.map(c => c.category).join(', ')}
OPTIMAL INTENSITY: ${context.optimalIntensity}
SUCCESSFUL PATTERNS: ${context.successPatterns.join(', ')}
AVOID: ${context.avoidancePatterns.join(', ')}
STATUS: ${context.partnerStatus}
${category ? `FOCUS CATEGORY: ${category}` : ''}

Generate suggestions in this JSON format:
{
  "suggestions": [
    {
      "suggestion": "specific suggestion text",
      "category": "connection|touch|playful|intimate|adventure",
      "heatLevel": "sweet|flirty|spicy|wild",
      "confidence": 0.85,
      "reasoning": "why this matches their preferences"
    }
  ]
}

Make suggestions specific, actionable, and aligned with their proven preferences.`

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const suggestionsText = response.text()

      try {
        const parsed = JSON.parse(suggestionsText)
        return parsed.suggestions || []
      } catch (parseError) {
        console.error('Error parsing AI suggestions:', parseError)
        return this.getFallbackSuggestions(context)
      }
    } catch (error) {
      console.error('Error generating personalized suggestions:', error)
      return []
    }
  }

  /**
   * Update user preference profile based on recent feedback
   */
  static async updateUserPreferences(userId: string): Promise<void> {
    try {
      const analysis = await this.analyzeUserFeedbackPatterns(userId)
      const userData = await UserService.getUser(userId)

      const preferenceProfile = {
        userId,
        partnerId: userData?.partnerId,
        preferredCategories: analysis.categoryPreferences.map(cat => ({
          category: cat.category,
          score: cat.satisfaction,
          frequency: cat.frequency
        })),
        optimalIntensity: analysis.intensityPreferences.optimal,
        preferredTiming: analysis.timingPatterns
          .filter(p => p.successRate > 0.7)
          .map(p => `${p.timeOfDay}_day${p.dayOfWeek}`),
        communicationStyle: await this.inferCommunicationStyle(userId),
        avoidancePatterns: analysis.avoidancePatterns,
        successPatterns: analysis.successPatterns,
        lastAnalyzed: serverTimestamp(),
        totalFeedback: analysis.categoryPreferences.reduce((sum, cat) => sum + cat.frequency, 0),
        aiInsights: analysis.personalizedInsights.join(' | ')
      }

      // Save or update preference profile
      const prefQuery = query(
        collection(db, 'userPreferences'),
        where('userId', '==', userId),
        limit(1)
      )

      const prefDocs = await getDocs(prefQuery)
      
      if (prefDocs.empty) {
        await addDoc(collection(db, 'userPreferences'), preferenceProfile)
      } else {
        const prefDoc = prefDocs.docs[0]
        await updateDoc(doc(db, 'userPreferences', prefDoc.id), {
          ...preferenceProfile,
          lastAnalyzed: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating user preferences:', error)
    }
  }

  /**
   * Get preference insights for specific categories
   */
  static async getCategoryInsights(
    userId: string,
    categories: string[]
  ): Promise<PreferenceInsight[]> {
    try {
      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('userId', '==', userId),
        where('category', 'in', categories),
        orderBy('timestamp', 'desc')
      )

      const feedbackDocs = await getDocs(feedbackQuery)
      const feedbackByCategory: Record<string, any[]> = {}

      feedbackDocs.forEach(doc => {
        const data = doc.data()
        if (!feedbackByCategory[data.category]) {
          feedbackByCategory[data.category] = []
        }
        feedbackByCategory[data.category].push(data)
      })

      const insights: PreferenceInsight[] = []

      for (const category of categories) {
        const categoryFeedback = feedbackByCategory[category] || []
        if (categoryFeedback.length === 0) continue

        const positiveCount = categoryFeedback.filter(f => 
          ['loved', 'tried'].includes(f.feedback)
        ).length

        const totalCount = categoryFeedback.length
        const satisfaction = positiveCount / totalCount

        let preference: 'loved' | 'disliked' | 'neutral'
        if (satisfaction > 0.7) preference = 'loved'
        else if (satisfaction < 0.3) preference = 'disliked'
        else preference = 'neutral'

        insights.push({
          category,
          preference,
          confidence: Math.min(totalCount / 10, 1), // More feedback = higher confidence
          evidence: categoryFeedback.slice(0, 3).map(f => 
            `${f.feedback}: ${f.suggestionType}`
          ),
          recommendations: await this.generateCategoryRecommendations(category, preference, satisfaction)
        })
      }

      return insights
    } catch (error) {
      console.error('Error getting category insights:', error)
      return []
    }
  }

  /**
   * Predict user response to a new suggestion
   */
  static async predictUserResponse(
    userId: string,
    suggestionType: string,
    category: string,
    heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild'
  ): Promise<{
    predictedFeedback: string
    confidence: number
    reasoning: string
  }> {
    try {
      const analysis = await this.analyzeUserFeedbackPatterns(userId)
      
      // Find similar category and intensity patterns
      const categoryPref = analysis.categoryPreferences.find(c => c.category === category)
      const intensityPref = analysis.intensityPreferences[heatLevel] || 0.5

      let confidence = 0.5
      let predictedFeedback = 'tried'
      let reasoning = 'Limited data for prediction'

      if (categoryPref && categoryPref.frequency > 5) {
        confidence = Math.min(categoryPref.frequency / 20, 0.9)
        
        if (categoryPref.satisfaction > 0.7 && intensityPref > 0.6) {
          predictedFeedback = 'loved'
          reasoning = `High satisfaction (${Math.round(categoryPref.satisfaction * 100)}%) in ${category} category with ${heatLevel} intensity`
        } else if (categoryPref.satisfaction < 0.3 || intensityPref < 0.3) {
          predictedFeedback = 'not_for_us'
          reasoning = `Low satisfaction patterns in ${category} or ${heatLevel} intensity`
        } else {
          predictedFeedback = 'tried'
          reasoning = `Moderate satisfaction patterns suggest willingness to try`
        }
      }

      return {
        predictedFeedback,
        confidence,
        reasoning
      }
    } catch (error) {
      console.error('Error predicting user response:', error)
      return {
        predictedFeedback: 'tried',
        confidence: 0.1,
        reasoning: 'Prediction error'
      }
    }
  }

  /**
   * Helper methods for analysis
   */
  private static calculateOverallSatisfaction(feedbackData: any[]): number {
    const positiveResponses = feedbackData.filter(f => 
      ['loved', 'tried'].includes(f.feedback)
    ).length
    return feedbackData.length > 0 ? positiveResponses / feedbackData.length : 0
  }

  private static analyzeCategoryPreferences(feedbackData: any[]) {
    const categoryStats: Record<string, { positive: number, total: number }> = {}

    feedbackData.forEach(feedback => {
      if (!categoryStats[feedback.category]) {
        categoryStats[feedback.category] = { positive: 0, total: 0 }
      }
      
      categoryStats[feedback.category].total++
      if (['loved', 'tried'].includes(feedback.feedback)) {
        categoryStats[feedback.category].positive++
      }
    })

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      satisfaction: stats.positive / stats.total,
      frequency: stats.total,
      effectiveness: stats.positive / stats.total // Same as satisfaction for now
    })).sort((a, b) => b.satisfaction - a.satisfaction)
  }

  private static analyzeTimingPatterns(feedbackData: any[]) {
    const timingStats: Record<string, { positive: number, total: number }> = {}

    feedbackData.forEach(feedback => {
      if (feedback.context) {
        const key = `${feedback.context.timeOfDay}_${feedback.context.dayOfWeek}`
        if (!timingStats[key]) {
          timingStats[key] = { positive: 0, total: 0 }
        }
        
        timingStats[key].total++
        if (['loved', 'tried'].includes(feedback.feedback)) {
          timingStats[key].positive++
        }
      }
    })

    return Object.entries(timingStats).map(([key, stats]) => {
      const [timeOfDay, dayOfWeek] = key.split('_')
      return {
        timeOfDay,
        dayOfWeek: parseInt(dayOfWeek),
        successRate: stats.positive / stats.total
      }
    }).sort((a, b) => b.successRate - a.successRate)
  }

  private static analyzeIntensityPreferences(feedbackData: any[]) {
    const intensityStats: Record<string, { positive: number, total: number }> = {
      sweet: { positive: 0, total: 0 },
      flirty: { positive: 0, total: 0 },
      spicy: { positive: 0, total: 0 },
      wild: { positive: 0, total: 0 }
    }

    feedbackData.forEach(feedback => {
      if (feedback.heatLevel && intensityStats[feedback.heatLevel]) {
        intensityStats[feedback.heatLevel].total++
        if (['loved', 'tried'].includes(feedback.feedback)) {
          intensityStats[feedback.heatLevel].positive++
        }
      }
    })

    const scores = {
      sweet: intensityStats.sweet.total > 0 ? intensityStats.sweet.positive / intensityStats.sweet.total : 0.5,
      flirty: intensityStats.flirty.total > 0 ? intensityStats.flirty.positive / intensityStats.flirty.total : 0.5,
      spicy: intensityStats.spicy.total > 0 ? intensityStats.spicy.positive / intensityStats.spicy.total : 0.5,
      wild: intensityStats.wild.total > 0 ? intensityStats.wild.positive / intensityStats.wild.total : 0.5
    }

    const optimal = Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0]

    return {
      ...scores,
      optimal
    }
  }

  private static findAvoidancePatterns(feedbackData: any[]): string[] {
    const negativePatterns: Record<string, number> = {}

    feedbackData.forEach(feedback => {
      if (['not_for_us', 'too_intense'].includes(feedback.feedback)) {
        const key = `${feedback.category}_${feedback.heatLevel}`
        negativePatterns[key] = (negativePatterns[key] || 0) + 1
      }
    })

    return Object.entries(negativePatterns)
      .filter(([, count]) => count >= 2)
      .map(([pattern]) => pattern)
  }

  private static findSuccessPatterns(feedbackData: any[]): string[] {
    const successPatterns: Record<string, number> = {}

    feedbackData.forEach(feedback => {
      if (feedback.feedback === 'loved') {
        const key = `${feedback.category}_${feedback.heatLevel}`
        successPatterns[key] = (successPatterns[key] || 0) + 1
      }
    })

    return Object.entries(successPatterns)
      .filter(([, count]) => count >= 2)
      .map(([pattern]) => pattern)
  }

  private static async generateFeedbackInsights(
    feedbackData: any[],
    satisfaction: number,
    categories: any[],
    intensity: any
  ): Promise<{ insights: string[], recommendations: string[] }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      
      const prompt = `Analyze this user's feedback patterns and provide insights:

OVERALL SATISFACTION: ${Math.round(satisfaction * 100)}%
TOP CATEGORIES: ${categories.slice(0, 3).map(c => `${c.category} (${Math.round(c.satisfaction * 100)}%)`).join(', ')}
OPTIMAL INTENSITY: ${intensity.optimal}
TOTAL FEEDBACK: ${feedbackData.length} items

Generate insights in JSON format:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Focus on relationship and intimacy coaching perspective. Be encouraging and specific.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const analysisText = response.text()

      try {
        return JSON.parse(analysisText)
      } catch {
        return {
          insights: ['Continue exploring what brings you joy and connection'],
          recommendations: ['Try new activities in your preferred categories']
        }
      }
    } catch (error) {
      return {
        insights: ['Building understanding through feedback'],
        recommendations: ['Keep exploring and sharing your preferences']
      }
    }
  }

  private static getDefaultFeedbackAnalysis(): FeedbackAnalysis {
    return {
      overallSatisfaction: 0.7,
      categoryPreferences: [],
      timingPatterns: [],
      intensityPreferences: {
        sweet: 0.5,
        flirty: 0.5,
        spicy: 0.5,
        wild: 0.5,
        optimal: 'flirty'
      },
      avoidancePatterns: [],
      successPatterns: [],
      personalizedInsights: ['Start exploring to build your preference profile'],
      recommendations: ['Try different types of suggestions to discover your preferences']
    }
  }

  private static getFallbackSuggestions(context: any) {
    const blueprintSuggestions: Record<string, any[]> = {
      'Energetic': [
        { suggestion: 'Practice synchronized breathing together', category: 'connection', heatLevel: 'sweet', confidence: 0.7, reasoning: 'Energetic blueprints love energy connection' }
      ],
      'Sensual': [
        { suggestion: 'Create a sensory experience with different textures', category: 'touch', heatLevel: 'flirty', confidence: 0.7, reasoning: 'Sensual blueprints thrive on sensory engagement' }
      ],
      'Sexual': [
        { suggestion: 'Plan an intimate evening focused on pleasure', category: 'intimate', heatLevel: 'spicy', confidence: 0.7, reasoning: 'Sexual blueprints appreciate direct pleasure focus' }
      ],
      'Kinky': [
        { suggestion: 'Explore a new playful power dynamic', category: 'playful', heatLevel: 'wild', confidence: 0.7, reasoning: 'Kinky blueprints enjoy power play exploration' }
      ],
      'Shapeshifter': [
        { suggestion: 'Try alternating between different intimacy styles', category: 'adventure', heatLevel: 'spicy', confidence: 0.7, reasoning: 'Shapeshifters enjoy variety and adaptation' }
      ]
    }

    return blueprintSuggestions[context.blueprintPrimary] || blueprintSuggestions['Sensual']
  }

  private static extractRatingFromText(text: string): number {
    // Simple sentiment analysis - could be enhanced
    const positive = ['love', 'amazing', 'great', 'wonderful', 'fantastic'].some(word => 
      text.toLowerCase().includes(word)
    )
    const negative = ['dislike', 'hate', 'terrible', 'awful', 'bad'].some(word => 
      text.toLowerCase().includes(word)
    )
    
    if (positive) return 4
    if (negative) return 2
    return 3
  }

  private static async inferRelationshipMood(userId: string): Promise<string> {
    // Simple implementation - could be enhanced with more data
    const userData = await UserService.getUser(userId)
    return userData?.currentMood || 'content'
  }

  private static async getRecentEvents(userId: string): Promise<string[]> {
    // Placeholder - could track app usage patterns, milestones, etc.
    return []
  }

  private static async inferCommunicationStyle(userId: string): Promise<string> {
    // Analyze conversation patterns from IntelligentConversationService
    return 'balanced' // Placeholder
  }

  private static async generateCategoryRecommendations(
    category: string,
    preference: 'loved' | 'disliked' | 'neutral',
    satisfaction: number
  ): Promise<string[]> {
    const recommendations: Record<string, Record<string, string[]>> = {
      'connection': {
        'loved': ['Continue exploring deeper emotional connections', 'Try vulnerability exercises'],
        'disliked': ['Focus on lighter connection activities', 'Start with small steps'],
        'neutral': ['Experiment with different connection styles', 'Find what resonates with you']
      },
      'touch': {
        'loved': ['Explore different types of touch', 'Create touch rituals'],
        'disliked': ['Focus on non-physical intimacy first', 'Discuss touch boundaries'],
        'neutral': ['Start with gentle touch exploration', 'Communicate preferences clearly']
      }
    }

    return recommendations[category]?.[preference] || ['Continue exploring this area at your own pace']
  }
} 