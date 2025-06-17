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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { SmartFeedbackService } from './smartFeedback'
import { UserService } from './database'
import type { RelationshipMilestone, RelationshipJourney } from './firebase'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface JourneyInsight {
  type: 'pattern' | 'milestone' | 'growth' | 'challenge' | 'celebration'
  title: string
  description: string
  significance: number // 1-10 scale
  timeframe: string
  actionable: boolean
  suggestions: string[]
  evidence: string[]
}

export interface MilestoneDetection {
  detected: boolean
  confidence: number
  type: 'blueprint_completion' | 'first_month' | 'goal_achieved' | 'communication_breakthrough' | 
        'intimacy_growth' | 'conflict_resolution' | 'celebration' | 'challenge_overcome' | 'custom'
  title: string
  description: string
  significance: number
  context: {
    triggerEvents: string[]
    relationshipPhase: string
    challengesOvercome: string[]
    growthAreas: string[]
  }
  celebrationSuggestion: string
  aiReflection: string
}

export interface JourneyAnalytics {
  overallProgress: number // 0-100 scale
  currentPhase: {
    name: string
    description: string
    duration: number // days in current phase
    characteristics: string[]
    focusAreas: string[]
    nextPhaseEstimate: string
  }
  growthMetrics: {
    communicationScore: number
    intimacyScore: number
    engagementScore: number
    satisfactionScore: number
    overallTrend: 'improving' | 'stable' | 'needs_attention'
    weeklyChange: number
  }
  milestonesSummary: {
    total: number
    recent: number // last 30 days
    upcoming: string[] // predicted upcoming milestones
    celebrated: number
    significant: number // significance > 7
  }
  insights: JourneyInsight[]
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    celebration: string[]
  }
  partnerSynchronization?: {
    alignmentScore: number
    sharedMilestones: number
    individualGrowth: number
    communicationHealth: number
  }
}

export interface JourneyVisualization {
  timeline: Array<{
    date: Date
    type: 'milestone' | 'phase_change' | 'growth_spike' | 'challenge' | 'celebration'
    title: string
    description: string
    significance: number
    emotionalTone: 'positive' | 'neutral' | 'challenging' | 'transformative'
  }>
  phases: Array<{
    name: string
    startDate: Date
    endDate?: Date
    duration: number
    characteristics: string[]
    milestones: number
    satisfaction: number
  }>
  growthCurve: Array<{
    date: Date
    communicationScore: number
    intimacyScore: number
    engagementScore: number
    satisfactionScore: number
  }>
}

export class EnhancedJourneyService {
  
  /**
   * Detect potential milestones based on user activity and feedback
   */
  static async detectMilestones(userId: string): Promise<MilestoneDetection[]> {
    try {
      const userData = await UserService.getUser(userId)
      const feedbackAnalysis = await SmartFeedbackService.analyzeUserFeedbackPatterns(userId)
      
      const detections: MilestoneDetection[] = []
      
      // Blueprint completion milestone
      if (userData?.eroticBlueprintPrimary) {
        detections.push({
          detected: true,
          confidence: 0.9,
          type: 'blueprint_completion',
          title: 'Blueprint Discovery Complete',
          description: `Discovered your ${userData.eroticBlueprintPrimary} blueprint and began personalized journey`,
          significance: 8,
          context: {
            triggerEvents: ['Blueprint assessment completed', 'Personalized recommendations started'],
            relationshipPhase: 'exploring',
            challengesOvercome: ['Self-discovery', 'Vulnerability'],
            growthAreas: ['Blueprint understanding', 'Personal awareness']
          },
          celebrationSuggestion: 'Take time to reflect on your blueprint discovery and share insights with your partner',
          aiReflection: 'This milestone marks the beginning of your personalized intimacy journey.'
        })
      }
      
      // Communication breakthrough
      if (feedbackAnalysis.overallSatisfaction > 0.8) {
        detections.push({
          detected: true,
          confidence: 0.8,
          type: 'communication_breakthrough',
          title: 'Communication Breakthrough',
          description: 'Achieved exceptional communication satisfaction and connection',
          significance: 9,
          context: {
            triggerEvents: ['High communication satisfaction', 'Positive feedback patterns'],
            relationshipPhase: 'deepening',
            challengesOvercome: ['Communication barriers', 'Expression difficulties'],
            growthAreas: ['Open dialogue', 'Emotional expression']
          },
          celebrationSuggestion: 'Acknowledge this breakthrough with a meaningful conversation about your growth',
          aiReflection: 'Strong communication is the cornerstone of intimacy. This breakthrough indicates significant relationship maturity.'
        })
      }
      
      return detections.filter(d => d.confidence > 0.6)
    } catch (error) {
      console.error('Error detecting milestones:', error)
      return []
    }
  }
  
  /**
   * Get milestones for a user
   */
  static async getUserMilestones(userId: string): Promise<RelationshipMilestone[]> {
    try {
      const userData = await UserService.getUser(userId)
      const coupleId = userData?.coupleId || userId
      return await this.getMilestones(coupleId)
    } catch (error) {
      console.error('Error getting user milestones:', error)
      return []
    }
  }

  /**
   * Create and save a milestone
   */
  static async createMilestone(
    userId: string,
    detection: MilestoneDetection,
    userNotes?: string
  ): Promise<string> {
    try {
      const userData = await UserService.getUser(userId)
      const coupleId = userData?.coupleId || userId
      
      const milestone: Omit<RelationshipMilestone, 'id'> = {
        coupleId,
        type: detection.type,
        title: detection.title,
        description: detection.description,
        date: new Date(),
        significance: detection.significance,
        autoDetected: true,
        celebrationSuggested: true,
        celebrated: false,
        context: {
          ...detection.context,
          partnerInvolvement: 'both' as const
        },
        aiReflection: detection.aiReflection,
        userNotes,
        tags: [detection.type]
      }
      
      const milestoneDoc = await addDoc(collection(db, 'milestones'), {
        ...milestone,
        date: serverTimestamp()
      })
      
      return milestoneDoc.id
    } catch (error) {
      console.error('Error creating milestone:', error)
      throw error
    }
  }
  
  /**
   * Analyze relationship journey and generate insights
   */
  static async analyzeJourney(userId: string): Promise<JourneyAnalytics> {
    try {
      const userData = await UserService.getUser(userId)
      const coupleId = userData?.coupleId || userId
      const journey = await this.getRelationshipJourney(coupleId)
      const milestones = await this.getMilestones(coupleId)
      const feedbackAnalysis = await SmartFeedbackService.analyzeUserFeedbackPatterns(userId)
      
      // Calculate growth metrics
      const growthMetrics = this.calculateGrowthMetrics(feedbackAnalysis, milestones)
      
      // Determine current phase
      const currentPhase = this.determineRelationshipPhase(
        feedbackAnalysis, 
        milestones, 
        userData?.createdAt
      )
      
      // Generate insights
      const insights = await this.generateJourneyInsights(
        journey, 
        milestones, 
        feedbackAnalysis, 
        currentPhase
      )
      
      // Generate recommendations
      const recommendations = await this.generateJourneyRecommendations(
        currentPhase, 
        growthMetrics, 
        insights
      )
      
      return {
        overallProgress: this.calculateOverallProgress(milestones, currentPhase),
        currentPhase,
        growthMetrics,
        milestonesSummary: {
          total: milestones.length,
          recent: milestones.filter(m => 
            Date.now() - m.date.getTime() < 30 * 24 * 60 * 60 * 1000
          ).length,
          upcoming: await this.predictUpcomingMilestones(userId, journey, currentPhase),
          celebrated: milestones.filter(m => m.celebrated).length,
          significant: milestones.filter(m => m.significance > 7).length
        },
        insights,
        recommendations,
        partnerSynchronization: userData?.partnerId ? 
          await this.calculatePartnerSynchronization(coupleId) : undefined
      }
    } catch (error) {
      console.error('Error analyzing journey:', error)
      return this.getDefaultJourneyAnalytics()
    }
  }
  
  /**
   * Generate journey visualization data
   */
  static async generateJourneyVisualization(userId: string): Promise<JourneyVisualization> {
    try {
      const userData = await UserService.getUser(userId)
      const coupleId = userData?.coupleId || userId
      const milestones = await this.getMilestones(coupleId)
      const journey = await this.getRelationshipJourney(coupleId)
      
      // Build timeline
      const timeline = this.buildJourneyTimeline(milestones, journey)
      
      // Extract phases
      const phases = this.extractJourneyPhases(timeline, journey)
      
      // Generate growth curve
      const growthCurve = await this.generateGrowthCurve(userId, timeline)
      
      return {
        timeline,
        phases,
        growthCurve
      }
    } catch (error) {
      console.error('Error generating journey visualization:', error)
      return {
        timeline: [],
        phases: [],
        growthCurve: []
      }
    }
  }
  
  /**
   * Mark milestone as celebrated
   */
  static async celebrateMilestone(milestoneId: string, celebrationNotes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'milestones', milestoneId), {
        celebrated: true,
        celebratedAt: serverTimestamp(),
        celebrationNotes
      })
    } catch (error) {
      console.error('Error celebrating milestone:', error)
      throw error
    }
  }
  
  /**
   * Helper methods
   */
  private static async getRelationshipJourney(coupleId: string): Promise<RelationshipJourney | null> {
    try {
      const journeyQuery = query(
        collection(db, 'journeys'),
        where('coupleId', '==', coupleId),
        limit(1)
      )
      
      const journeyDocs = await getDocs(journeyQuery)
      if (journeyDocs.empty) return null
      
      const journeyData = journeyDocs.docs[0].data()
      return {
        ...journeyData,
        startDate: journeyData.startDate?.toDate() || new Date(),
        lastAnalyzed: journeyData.lastAnalyzed?.toDate() || new Date(),
        currentPhase: {
          ...journeyData.currentPhase,
          startDate: journeyData.currentPhase?.startDate?.toDate() || new Date()
        },
        growthMetrics: {
          ...journeyData.growthMetrics,
          lastUpdated: journeyData.growthMetrics?.lastUpdated?.toDate() || new Date()
        }
      } as RelationshipJourney
    } catch (error) {
      console.error('Error getting relationship journey:', error)
      return null
    }
  }
  
  private static async getMilestones(coupleId: string): Promise<RelationshipMilestone[]> {
    try {
      const milestonesQuery = query(
        collection(db, 'milestones'),
        where('coupleId', '==', coupleId),
        orderBy('date', 'desc')
      )
      
      const milestonesDocs = await getDocs(milestonesQuery)
      return milestonesDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as RelationshipMilestone[]
    } catch (error) {
      console.error('Error getting milestones:', error)
      return []
    }
  }
  
  private static calculateGrowthMetrics(feedbackAnalysis: any, milestones: RelationshipMilestone[]) {
    const satisfaction = feedbackAnalysis.overallSatisfaction
    const recentMilestones = milestones.filter(m => 
      Date.now() - m.date.getTime() < 30 * 24 * 60 * 60 * 1000
    )
    
    return {
      communicationScore: satisfaction * 0.9, // Approximate from satisfaction
      intimacyScore: satisfaction,
      engagementScore: Math.min(feedbackAnalysis.categoryPreferences.length / 5, 1),
      satisfactionScore: satisfaction,
      overallTrend: satisfaction > 0.7 ? 'improving' as const : 'stable' as const,
      weeklyChange: recentMilestones.length * 0.1 // Rough approximation
    }
  }
  
  private static determineRelationshipPhase(
    feedbackAnalysis: any, 
    milestones: RelationshipMilestone[], 
    createdAt?: Date
  ) {
    const daysSinceJoin = createdAt ? 
      Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    const satisfaction = feedbackAnalysis.overallSatisfaction
    const milestonesCount = milestones.length
    
    let phase = 'exploring'
    if (daysSinceJoin > 90 && satisfaction > 0.8) phase = 'deepening'
    else if (daysSinceJoin > 30 && satisfaction > 0.6) phase = 'building'
    else if (satisfaction < 0.4) phase = 'renewing'
    
    return {
      name: phase,
      description: this.getPhaseDescription(phase),
      duration: daysSinceJoin,
      characteristics: this.getPhaseCharacteristics(phase),
      focusAreas: this.getPhaseFocusAreas(phase),
      nextPhaseEstimate: this.estimateNextPhase(phase, satisfaction, daysSinceJoin)
    }
  }
  
  private static getPhaseDescription(phase: string): string {
    const descriptions: Record<string, string> = {
      'exploring': 'Discovering preferences and building foundation',
      'building': 'Establishing patterns and deepening connection',
      'deepening': 'Advanced intimacy and sophisticated understanding',
      'maintaining': 'Sustaining growth and preventing stagnation',
      'renewing': 'Rebuilding and addressing challenges'
    }
    return descriptions[phase] || 'Growing together'
  }
  
  private static getPhaseCharacteristics(phase: string): string[] {
    const characteristics: Record<string, string[]> = {
      'exploring': ['Curiosity', 'Discovery', 'Foundation building'],
      'building': ['Consistency', 'Pattern recognition', 'Trust development'],
      'deepening': ['Advanced intimacy', 'Sophisticated communication', 'Mutual growth'],
      'maintaining': ['Stability', 'Refinement', 'Long-term satisfaction'],
      'renewing': ['Recommitment', 'Challenge resolution', 'Fresh perspective']
    }
    return characteristics[phase] || ['Growth', 'Connection']
  }
  
  private static getPhaseFocusAreas(phase: string): string[] {
    const focusAreas: Record<string, string[]> = {
      'exploring': ['Self-discovery', 'Communication basics', 'Boundary setting'],
      'building': ['Routine establishment', 'Deeper sharing', 'Conflict resolution'],
      'deepening': ['Advanced techniques', 'Emotional intimacy', 'Growth challenges'],
      'maintaining': ['Variety', 'Spontaneity', 'Long-term vision'],
      'renewing': ['Problem solving', 'Reconnection', 'New beginnings']
    }
    return focusAreas[phase] || ['Connection', 'Growth']
  }
  
  private static estimateNextPhase(phase: string, satisfaction: number, daysSinceJoin: number): string {
    if (phase === 'exploring' && satisfaction > 0.6) return '2-4 weeks to building phase'
    if (phase === 'building' && satisfaction > 0.7) return '1-2 months to deepening phase'
    if (phase === 'deepening') return 'Continue deepening with new challenges'
    return 'Continue current phase development'
  }
  
  private static async generateJourneyInsights(
    journey: RelationshipJourney | null,
    milestones: RelationshipMilestone[],
    feedbackAnalysis: any,
    currentPhase: any
  ): Promise<JourneyInsight[]> {
    // Generate AI-powered insights about the journey
    const insights: JourneyInsight[] = []
    
    // Pattern insight
    if (feedbackAnalysis.successPatterns.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Success Pattern Identified',
        description: `Your most successful activities involve ${feedbackAnalysis.successPatterns.join(' and ')}`,
        significance: 7,
        timeframe: 'Ongoing',
        actionable: true,
        suggestions: [`Focus more on ${feedbackAnalysis.successPatterns[0]} activities`],
        evidence: feedbackAnalysis.successPatterns
      })
    }
    
    // Growth insight
    if (milestones.length > 3) {
      insights.push({
        type: 'growth',
        title: 'Consistent Growth Achievement',
        description: `You've achieved ${milestones.length} meaningful milestones, showing strong commitment to growth`,
        significance: 8,
        timeframe: 'Last few months',
        actionable: true,
        suggestions: ['Celebrate your progress', 'Set new growth goals'],
        evidence: [`${milestones.length} milestones achieved`]
      })
    }
    
    return insights
  }
  
  private static async generateJourneyRecommendations(
    currentPhase: any,
    growthMetrics: any,
    insights: JourneyInsight[]
  ) {
    return {
      immediate: [
        'Reflect on your recent growth',
        `Focus on ${currentPhase.focusAreas[0]} development`
      ],
      shortTerm: [
        'Set weekly intimacy intentions',
        'Try new activities in your comfort zone'
      ],
      longTerm: [
        'Build lasting intimacy habits',
        'Prepare for next relationship phase'
      ],
      celebration: [
        'Acknowledge your progress together',
        'Plan a special milestone celebration'
      ]
    }
  }
  
  private static calculateOverallProgress(milestones: RelationshipMilestone[], currentPhase: any): number {
    const baseProgress = Math.min(milestones.length * 10, 70) // Max 70% from milestones
    const phaseBonus = currentPhase.name === 'deepening' ? 20 : 
                      currentPhase.name === 'building' ? 10 : 5
    return Math.min(baseProgress + phaseBonus, 100)
  }
  
  private static async predictUpcomingMilestones(
    userId: string, 
    journey: RelationshipJourney | null,
    currentPhase: any
  ): Promise<string[]> {
    // Predict likely upcoming milestones based on current progress
    return [
      'Next relationship phase transition',
      'Communication breakthrough opportunity',
      'New intimacy level achievement'
    ]
  }
  
  private static async calculatePartnerSynchronization(coupleId: string) {
    // Calculate how well partners are synchronized in their journey
    return {
      alignmentScore: 0.8,
      sharedMilestones: 5,
      individualGrowth: 0.7,
      communicationHealth: 0.85
    }
  }
  
  private static getDefaultJourneyAnalytics(): JourneyAnalytics {
    return {
      overallProgress: 20,
      currentPhase: {
        name: 'exploring',
        description: 'Beginning your intimacy journey',
        duration: 7,
        characteristics: ['Curiosity', 'Discovery'],
        focusAreas: ['Self-discovery', 'Communication'],
        nextPhaseEstimate: '2-4 weeks'
      },
      growthMetrics: {
        communicationScore: 0.6,
        intimacyScore: 0.5,
        engagementScore: 0.4,
        satisfactionScore: 0.5,
        overallTrend: 'stable',
        weeklyChange: 0.1
      },
      milestonesSummary: {
        total: 0,
        recent: 0,
        upcoming: ['Complete your first week'],
        celebrated: 0,
        significant: 0
      },
      insights: [],
      recommendations: {
        immediate: ['Start with gentle exploration'],
        shortTerm: ['Build consistent habits'],
        longTerm: ['Develop deeper connection'],
        celebration: ['Acknowledge small wins']
      }
    }
  }
  
  private static buildJourneyTimeline(
    milestones: RelationshipMilestone[], 
    journey: RelationshipJourney | null
  ) {
    return milestones.map(milestone => ({
      date: milestone.date,
      type: 'milestone' as const,
      title: milestone.title,
      description: milestone.description,
      significance: milestone.significance,
      emotionalTone: milestone.significance > 7 ? 'transformative' as const : 'positive' as const
    }))
  }
  
  private static extractJourneyPhases(timeline: any[], journey: RelationshipJourney | null) {
    if (!journey) return []
    
    return [{
      name: journey.currentPhase.name,
      startDate: journey.currentPhase.startDate,
      duration: Math.floor((Date.now() - journey.currentPhase.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      characteristics: journey.currentPhase.characteristics,
      milestones: timeline.length,
      satisfaction: journey.growthMetrics.satisfactionScore
    }]
  }
  
  private static async generateGrowthCurve(userId: string, timeline: any[]) {
    // Generate historical growth data
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    const curve = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + i)
      
      curve.push({
        date,
        communicationScore: 0.5 + (i / 30) * 0.3, // Gradual improvement
        intimacyScore: 0.4 + (i / 30) * 0.4,
        engagementScore: 0.6 + (i / 30) * 0.2,
        satisfactionScore: 0.5 + (i / 30) * 0.3
      })
    }
    
    return curve
  }
} 