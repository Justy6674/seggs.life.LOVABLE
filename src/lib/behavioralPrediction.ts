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
import { AdvancedUserProfile } from './advancedPersonalization'

// ===== BEHAVIORAL PREDICTION MODELS =====
// Task 6.1.2: Build behavioral prediction models

export interface BehaviorPredictionModel {
  modelId: string
  modelType: 'neural_network' | 'random_forest' | 'svm' | 'ensemble'
  behaviorCategory: string
  
  // Model parameters
  features: string[]
  weights: number[]
  hyperparameters: Record<string, any>
  
  // Performance metrics
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  
  // Training data
  trainingDataSize: number
  lastTraining: Date
  modelVersion: string
  
  // Deployment info
  isActive: boolean
  confidenceThreshold: number
  createdAt: Date
  updatedAt: Date
}

export interface PredictionInput {
  userId: string
  context: PredictionContext
  features: Record<string, any>
  timestamp: Date
}

export interface PredictionContext {
  timeOfDay: string
  dayOfWeek: string
  relationship_phase: string
  stress_level: number
  mood_state: string
  recent_activities: string[]
  partner_availability: boolean
  environment: string
  weather?: string
  special_occasions?: string[]
}

export interface BehaviorPrediction {
  predictionId: string
  userId: string
  behavior: string
  probability: number
  confidence: number
  
  // Prediction details
  timeframe: string // 'next_hour', 'today', 'this_week'
  triggers: PredictionTrigger[]
  context: PredictionContext
  
  // Supporting evidence
  similarPatterns: string[]
  historicalAccuracy: number
  modelUsed: string
  
  // Actionable insights
  suggestions: string[]
  interventions: string[]
  
  createdAt: Date
  expiresAt: Date
}

export interface PredictionTrigger {
  trigger: string
  importance: number // 0-1
  confidence: number
  description: string
}

export interface BehaviorPattern {
  patternId: string
  userId: string
  
  // Pattern identification
  behavior: string
  frequency: number
  duration: number
  intensity: number
  
  // Contextual factors
  timePatterns: TimePattern[]
  environmentalFactors: string[]
  emotionalStates: string[]
  socialContexts: string[]
  
  // Pattern stability
  consistency: number // How reliable this pattern is
  evolution: PatternEvolution[]
  
  // Prediction relevance
  predictivePower: number
  lastObserved: Date
  patternStrength: number
  
  createdAt: Date
  updatedAt: Date
}

export interface TimePattern {
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal'
  peak_times: string[]
  low_times: string[]
  duration: number
  confidence: number
}

export interface PatternEvolution {
  date: Date
  change_type: 'increase' | 'decrease' | 'stable' | 'shift'
  magnitude: number
  confidence: number
  potential_causes: string[]
}

export interface PredictionOutcome {
  predictionId: string
  actualBehavior: string
  predicted: boolean
  accuracy: number
  
  // Learning data
  actualContext: PredictionContext
  deviationFactors: string[]
  improveableAspects: string[]
  
  feedbackAt: Date
}

// ===== BEHAVIORAL PREDICTION SERVICE =====

export class BehavioralPredictionService {
  private static instance: BehavioralPredictionService
  private models: Map<string, BehaviorPredictionModel> = new Map()
  
  static getInstance(): BehavioralPredictionService {
    if (!BehavioralPredictionService.instance) {
      BehavioralPredictionService.instance = new BehavioralPredictionService()
    }
    return BehavioralPredictionService.instance
  }

  // ===== CORE PREDICTION ENGINE =====

  async predictBehaviors(
    userId: string, 
    context: PredictionContext,
    timeframes: string[] = ['next_hour', 'today', 'this_week']
  ): Promise<BehaviorPrediction[]> {
    try {
      // Get user profile for enhanced predictions
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) {
        throw new Error('User profile required for predictions')
      }

      // Get behavior patterns
      const patterns = await this.getUserBehaviorPatterns(userId)
      
      // Load prediction models
      await this.loadModels()

      const predictions: BehaviorPrediction[] = []

      // Generate predictions for each timeframe
      for (const timeframe of timeframes) {
        const timeframePredictions = await this.generateTimeframePredictions(
          userId, 
          userProfile,
          patterns,
          context, 
          timeframe
        )
        predictions.push(...timeframePredictions)
      }

      // Sort by probability and confidence
      predictions.sort((a, b) => (b.probability * b.confidence) - (a.probability * a.confidence))

      // Save predictions for tracking
      await this.savePredictions(predictions)

      return predictions
    } catch (error) {
      console.error('Error predicting behaviors:', error)
      throw error
    }
  }

  private async generateTimeframePredictions(
    userId: string,
    userProfile: AdvancedUserProfile,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<BehaviorPrediction[]> {
    const predictions: BehaviorPrediction[] = []

    // Define behavior categories to predict
    const behaviorCategories = [
      'intimate_conversation',
      'physical_intimacy',
      'conflict_potential',
      'emotional_support_need',
      'quality_time_seeking',
      'stress_response',
      'communication_initiation',
      'romantic_gesture',
      'withdrawal_tendency',
      'celebration_behavior'
    ]

    for (const behavior of behaviorCategories) {
      const prediction = await this.predictSpecificBehavior(
        userId,
        behavior,
        userProfile,
        patterns,
        context,
        timeframe
      )
      
      if (prediction && prediction.confidence > 0.3) {
        predictions.push(prediction)
      }
    }

    return predictions
  }

  private async predictSpecificBehavior(
    userId: string,
    behavior: string,
    userProfile: AdvancedUserProfile,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<BehaviorPrediction | null> {
    try {
      // Find relevant patterns
      const relevantPatterns = patterns.filter(p => p.behavior === behavior)
      
      if (relevantPatterns.length === 0) {
        return null
      }

      // Calculate probability using ensemble approach
      const probability = await this.calculateEnsembleProbability(
        behavior,
        userProfile,
        relevantPatterns,
        context,
        timeframe
      )

      // Calculate confidence
      const confidence = await this.calculatePredictionConfidence(
        behavior,
        relevantPatterns,
        context,
        timeframe
      )

      // Generate triggers
      const triggers = await this.identifyPredictionTriggers(
        behavior,
        userProfile,
        relevantPatterns,
        context
      )

      // Generate suggestions and interventions
      const suggestions = await this.generateSuggestions(behavior, probability, context, userProfile)
      const interventions = await this.generateInterventions(behavior, probability, context, userProfile)

      const prediction: BehaviorPrediction = {
        predictionId: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        behavior,
        probability,
        confidence,
        timeframe,
        triggers,
        context,
        similarPatterns: relevantPatterns.map(p => p.patternId),
        historicalAccuracy: this.calculateHistoricalAccuracy(behavior),
        modelUsed: 'ensemble_v2',
        suggestions,
        interventions,
        createdAt: new Date(),
        expiresAt: this.calculateExpirationDate(timeframe)
      }

      return prediction
    } catch (error) {
      console.error(`Error predicting ${behavior}:`, error)
      return null
    }
  }

  // ===== MACHINE LEARNING MODELS =====

  private async calculateEnsembleProbability(
    behavior: string,
    userProfile: AdvancedUserProfile,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<number> {
    // Ensemble of different prediction approaches
    const approaches = [
      this.patternBasedPrediction(behavior, patterns, context, timeframe),
      this.personalityBasedPrediction(behavior, userProfile, context),
      this.contextualPrediction(behavior, context, timeframe),
      this.temporalPrediction(behavior, patterns, context, timeframe),
      this.socialPrediction(behavior, userProfile, context)
    ]

    const probabilities = await Promise.all(approaches)
    
    // Weighted ensemble (weights based on historical accuracy)
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1] // Pattern-based gets highest weight
    
    let weightedSum = 0
    let totalWeight = 0
    
    probabilities.forEach((prob, i) => {
      if (prob !== null && !isNaN(prob)) {
        weightedSum += prob * weights[i]
        totalWeight += weights[i]
      }
    })

    return totalWeight > 0 ? Math.min(1, Math.max(0, weightedSum / totalWeight)) : 0
  }

  private async patternBasedPrediction(
    behavior: string,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<number> {
    if (patterns.length === 0) return 0

    // Analyze pattern frequency and timing
    let totalProbability = 0
    let totalWeight = 0

    for (const pattern of patterns) {
      // Time-based probability
      const timeProbability = this.calculateTimeBasedProbability(pattern, context, timeframe)
      
      // Context matching
      const contextMatch = this.calculateContextMatch(pattern, context)
      
      // Pattern strength
      const strength = pattern.patternStrength * pattern.consistency
      
      // Recency factor
      const recencyFactor = this.calculateRecencyFactor(pattern.lastObserved)
      
      const patternProbability = timeProbability * contextMatch * strength * recencyFactor
      const weight = pattern.predictivePower
      
      totalProbability += patternProbability * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? totalProbability / totalWeight : 0
  }

  private async personalityBasedPrediction(
    behavior: string,
    userProfile: AdvancedUserProfile,
    context: PredictionContext
  ): Promise<number> {
    // Use personality traits to predict behavior likelihood
    const traits = userProfile.psychologicalTraits
    const emotional = userProfile.emotionalProfile
    const communication = userProfile.communicationPatterns

    switch (behavior) {
      case 'intimate_conversation':
        return (traits.openness + communication.vulnerableSharing + communication.deepConversationComfort) / 300

      case 'physical_intimacy':
        return (traits.sexualOpenness + userProfile.intimacyPreferences.physicalComfort + traits.intimacyComfort) / 300

      case 'conflict_potential':
        return (traits.neuroticism + emotional.emotionalVolatility + (100 - emotional.selfRegulation)) / 300

      case 'emotional_support_need':
        return (emotional.supportSeeking + emotional.validationSeeking + traits.agreeableness) / 300

      case 'quality_time_seeking':
        return (userProfile.loveLanguageProfile.qualityTime + traits.extraversion + emotional.affectionNeed) / 300

      case 'stress_response':
        return (traits.neuroticism + emotional.stressResponse + emotional.anxietyTendency) / 300

      case 'communication_initiation':
        return (traits.extraversion + communication.conversationInitiation + communication.assertiveness) / 300

      case 'romantic_gesture':
        return (traits.romanticIdealism + userProfile.loveLanguageProfile.actsOfService + emotional.loveExpression) / 300

      case 'withdrawal_tendency':
        return ((100 - traits.extraversion) + emotional.solitudeTolerance + communication.conflictAvoidance) / 300

      case 'celebration_behavior':
        return (traits.extraversion + emotional.optimismLevel + traits.agreeableness) / 300

      default:
        return 0.5 // Default moderate probability
    }
  }

  private async contextualPrediction(
    behavior: string,
    context: PredictionContext,
    timeframe: string
  ): Promise<number> {
    let probability = 0.5 // Base probability

    // Time of day factors
    if (behavior === 'intimate_conversation' && (context.timeOfDay === 'evening' || context.timeOfDay === 'night')) {
      probability += 0.2
    }
    
    if (behavior === 'physical_intimacy' && context.timeOfDay === 'night') {
      probability += 0.3
    }

    // Stress level impacts
    if (context.stress_level > 7) {
      if (behavior === 'conflict_potential') probability += 0.3
      if (behavior === 'withdrawal_tendency') probability += 0.2
      if (behavior === 'emotional_support_need') probability += 0.25
    }

    // Mood impacts
    if (context.mood_state === 'happy' && behavior === 'romantic_gesture') {
      probability += 0.2
    }
    
    if (context.mood_state === 'sad' && behavior === 'emotional_support_need') {
      probability += 0.3
    }

    // Partner availability
    if (!context.partner_availability) {
      if (['intimate_conversation', 'physical_intimacy', 'quality_time_seeking'].includes(behavior)) {
        probability -= 0.4
      }
    }

    // Environment factors
    if (context.environment === 'private' && ['intimate_conversation', 'physical_intimacy'].includes(behavior)) {
      probability += 0.15
    }

    // Weekend effects
    if (['Saturday', 'Sunday'].includes(context.dayOfWeek)) {
      if (['quality_time_seeking', 'romantic_gesture', 'celebration_behavior'].includes(behavior)) {
        probability += 0.1
      }
    }

    return Math.min(1, Math.max(0, probability))
  }

  private async temporalPrediction(
    behavior: string,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<number> {
    const relevantPatterns = patterns.filter(p => p.behavior === behavior)
    if (relevantPatterns.length === 0) return 0.5

    let totalProbability = 0
    let count = 0

    for (const pattern of relevantPatterns) {
      for (const timePattern of pattern.timePatterns) {
        const probability = this.calculateTemporalMatch(timePattern, context, timeframe)
        totalProbability += probability
        count++
      }
    }

    return count > 0 ? totalProbability / count : 0.5
  }

  private async socialPrediction(
    behavior: string,
    userProfile: AdvancedUserProfile,
    context: PredictionContext
  ): Promise<number> {
    // Social context influences on behavior
    let probability = 0.5

    const isIntimate = ['intimate_conversation', 'physical_intimacy'].includes(behavior)
    const isSocial = ['celebration_behavior', 'quality_time_seeking'].includes(behavior)

    if (isIntimate && context.partner_availability && context.environment === 'private') {
      probability += 0.3
    }

    if (isSocial && userProfile.psychologicalTraits.extraversion > 60) {
      probability += 0.2
    }

    return Math.min(1, Math.max(0, probability))
  }

  // ===== HELPER METHODS =====

  private calculateTimeBasedProbability(
    pattern: BehaviorPattern,
    context: PredictionContext,
    timeframe: string
  ): number {
    // Calculate probability based on time patterns
    let probability = 0

    for (const timePattern of pattern.timePatterns) {
      if (this.timeMatches(timePattern, context, timeframe)) {
        probability = Math.max(probability, timePattern.confidence)
      }
    }

    return probability
  }

  private calculateContextMatch(pattern: BehaviorPattern, context: PredictionContext): number {
    let matchScore = 0
    let totalFactors = 0

    // Environment match
    if (pattern.environmentalFactors.includes(context.environment)) {
      matchScore += 1
    }
    totalFactors += 1

    // Mood match
    if (pattern.emotionalStates.includes(context.mood_state)) {
      matchScore += 1
    }
    totalFactors += 1

    // Social context (simplified)
    const socialContext = context.partner_availability ? 'partner_present' : 'alone'
    if (pattern.socialContexts.includes(socialContext)) {
      matchScore += 1
    }
    totalFactors += 1

    return totalFactors > 0 ? matchScore / totalFactors : 0.5
  }

  private calculateRecencyFactor(lastObserved: Date): number {
    const daysSince = (Date.now() - lastObserved.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSince <= 1) return 1.0
    if (daysSince <= 7) return 0.9
    if (daysSince <= 30) return 0.7
    if (daysSince <= 90) return 0.5
    return 0.3
  }

  private timeMatches(timePattern: TimePattern, context: PredictionContext, timeframe: string): boolean {
    // Simplified time matching logic
    if (timePattern.type === 'hourly' && timeframe === 'next_hour') {
      return timePattern.peak_times.includes(context.timeOfDay)
    }
    
    if (timePattern.type === 'daily' && timeframe === 'today') {
      return timePattern.peak_times.includes(context.timeOfDay)
    }
    
    if (timePattern.type === 'weekly' && timeframe === 'this_week') {
      return timePattern.peak_times.includes(context.dayOfWeek)
    }

    return false
  }

  private calculateTemporalMatch(timePattern: TimePattern, context: PredictionContext, timeframe: string): number {
    if (this.timeMatches(timePattern, context, timeframe)) {
      return timePattern.confidence
    }
    return 0.3 // Base probability when not in peak time
  }

  private async calculatePredictionConfidence(
    behavior: string,
    patterns: BehaviorPattern[],
    context: PredictionContext,
    timeframe: string
  ): Promise<number> {
    if (patterns.length === 0) return 0.3

    // Factors that affect confidence
    const dataAvailability = Math.min(1, patterns.length / 5) // More patterns = higher confidence
    const patternConsistency = patterns.reduce((sum, p) => sum + p.consistency, 0) / patterns.length
    const recency = patterns.reduce((sum, p) => sum + this.calculateRecencyFactor(p.lastObserved), 0) / patterns.length
    const historicalAccuracy = this.calculateHistoricalAccuracy(behavior)

    return (dataAvailability + patternConsistency + recency + historicalAccuracy) / 4
  }

  private calculateHistoricalAccuracy(behavior: string): number {
    // Would calculate from stored prediction outcomes
    // For now, return reasonable defaults based on behavior type
    const accuracyMap: Record<string, number> = {
      'intimate_conversation': 0.75,
      'physical_intimacy': 0.65,
      'conflict_potential': 0.70,
      'emotional_support_need': 0.80,
      'quality_time_seeking': 0.78,
      'stress_response': 0.73,
      'communication_initiation': 0.72,
      'romantic_gesture': 0.68,
      'withdrawal_tendency': 0.71,
      'celebration_behavior': 0.76
    }

    return accuracyMap[behavior] || 0.70
  }

  private async identifyPredictionTriggers(
    behavior: string,
    userProfile: AdvancedUserProfile,
    patterns: BehaviorPattern[],
    context: PredictionContext
  ): Promise<PredictionTrigger[]> {
    const triggers: PredictionTrigger[] = []

    // Common triggers based on behavior type
    const triggerMap: Record<string, string[]> = {
      'intimate_conversation': ['private_setting', 'relaxed_mood', 'evening_time'],
      'physical_intimacy': ['romantic_mood', 'private_space', 'low_stress'],
      'conflict_potential': ['high_stress', 'fatigue', 'unresolved_issues'],
      'emotional_support_need': ['stress', 'sad_mood', 'challenging_day'],
      'quality_time_seeking': ['weekend', 'available_partner', 'good_mood'],
      'stress_response': ['work_pressure', 'relationship_tension', 'health_concerns'],
      'communication_initiation': ['unmet_needs', 'desire_for_connection', 'important_topic'],
      'romantic_gesture': ['happy_mood', 'special_occasion', 'feeling_appreciated'],
      'withdrawal_tendency': ['overwhelm', 'need_for_space', 'processing_emotions'],
      'celebration_behavior': ['achievement', 'good_news', 'milestone_reached']
    }

    const behaviorTriggers = triggerMap[behavior] || []
    
    behaviorTriggers.forEach(trigger => {
      triggers.push({
        trigger,
        importance: 0.7,
        confidence: 0.8,
        description: `${trigger} often leads to ${behavior}`
      })
    })

    return triggers
  }

  private async generateSuggestions(
    behavior: string,
    probability: number,
    context: PredictionContext,
    userProfile: AdvancedUserProfile
  ): Promise<string[]> {
    const suggestions: string[] = []

    if (probability > 0.7) {
      // High probability suggestions
      switch (behavior) {
        case 'intimate_conversation':
          suggestions.push('This seems like a perfect time for deep conversation')
          suggestions.push('Consider sharing something meaningful with your partner')
          break
        case 'physical_intimacy':
          suggestions.push('The mood feels right for physical connection')
          suggestions.push('Focus on creating a comfortable, private atmosphere')
          break
        case 'quality_time_seeking':
          suggestions.push('Plan some uninterrupted time together')
          suggestions.push('Put away devices and focus on each other')
          break
      }
    } else if (probability > 0.4) {
      // Moderate probability suggestions
      suggestions.push(`There's a moderate chance of ${behavior} - stay attuned to the moment`)
      suggestions.push('Be open to opportunities as they arise')
    }

    return suggestions
  }

  private async generateInterventions(
    behavior: string,
    probability: number,
    context: PredictionContext,
    userProfile: AdvancedUserProfile
  ): Promise<string[]> {
    const interventions: string[] = []

    // Negative behaviors that need intervention
    const negativeBenaviors = ['conflict_potential', 'withdrawal_tendency', 'stress_response']

    if (negativeBenaviors.includes(behavior) && probability > 0.6) {
      switch (behavior) {
        case 'conflict_potential':
          interventions.push('Take a moment to breathe and center yourself')
          interventions.push('Consider addressing issues calmly before they escalate')
          interventions.push('Practice active listening if tension arises')
          break
        case 'withdrawal_tendency':
          interventions.push('Communicate your need for space to your partner')
          interventions.push('Schedule intentional alone time to recharge')
          break
        case 'stress_response':
          interventions.push('Practice stress management techniques')
          interventions.push('Reach out for support if needed')
          break
      }
    }

    return interventions
  }

  private calculateExpirationDate(timeframe: string): Date {
    const now = new Date()
    switch (timeframe) {
      case 'next_hour':
        return new Date(now.getTime() + 60 * 60 * 1000)
      case 'today':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case 'this_week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  // ===== DATA MANAGEMENT =====

  private async getUserProfile(userId: string): Promise<AdvancedUserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, 'advancedUserProfiles', userId))
      if (profileDoc.exists()) {
        return profileDoc.data() as AdvancedUserProfile
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  private async getUserBehaviorPatterns(userId: string): Promise<BehaviorPattern[]> {
    try {
      const patternsQuery = query(
        collection(db, 'behaviorPatterns'),
        where('userId', '==', userId),
        orderBy('lastObserved', 'desc'),
        limit(50)
      )
      
      const patternsSnapshot = await getDocs(patternsQuery)
      return patternsSnapshot.docs.map(doc => ({
        patternId: doc.id,
        ...doc.data()
      })) as BehaviorPattern[]
    } catch (error) {
      console.error('Error getting behavior patterns:', error)
      return []
    }
  }

  private async loadModels(): Promise<void> {
    // In a real implementation, this would load trained ML models
    // For now, we'll use our algorithmic approach
    console.log('Models loaded (algorithmic approach)')
  }

  private async savePredictions(predictions: BehaviorPrediction[]): Promise<void> {
    try {
      const batch = predictions.map(prediction => 
        addDoc(collection(db, 'behaviorPredictions'), {
          ...prediction,
          createdAt: serverTimestamp(),
          expiresAt: prediction.expiresAt
        })
      )
      
      await Promise.all(batch)
    } catch (error) {
      console.error('Error saving predictions:', error)
    }
  }

  // ===== PUBLIC API =====

  async getPredictionsForUser(userId: string, timeframe?: string): Promise<BehaviorPrediction[]> {
    try {
      let predictionsQuery = query(
        collection(db, 'behaviorPredictions'),
        where('userId', '==', userId),
        where('expiresAt', '>', new Date()),
        orderBy('expiresAt'),
        orderBy('probability', 'desc')
      )

      if (timeframe) {
        predictionsQuery = query(
          predictionsQuery,
          where('timeframe', '==', timeframe)
        )
      }

      const snapshot = await getDocs(predictionsQuery)
      return snapshot.docs.map(doc => ({
        predictionId: doc.id,
        ...doc.data()
      })) as BehaviorPrediction[]
    } catch (error) {
      console.error('Error getting predictions:', error)
      return []
    }
  }

  async recordPredictionOutcome(
    predictionId: string,
    actualBehavior: string,
    occurred: boolean
  ): Promise<void> {
    try {
      const outcome: PredictionOutcome = {
        predictionId,
        actualBehavior,
        predicted: occurred,
        accuracy: occurred ? 1 : 0,
        actualContext: {} as PredictionContext, // Would need to be provided
        deviationFactors: [],
        improveableAspects: [],
        feedbackAt: new Date()
      }

      await addDoc(collection(db, 'predictionOutcomes'), {
        ...outcome,
        feedbackAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error recording prediction outcome:', error)
    }
  }
}

export const behavioralPrediction = BehavioralPredictionService.getInstance() 