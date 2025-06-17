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
import { personalizationEngine } from './personalization'

// ===== TYPES =====

export interface GrowthMetrics {
  userId: string
  timestamp: Date
  
  // Core Relationship Skills (0-100)
  communicationSkill: number
  emotionalIntelligence: number
  conflictResolution: number
  intimacyComfort: number
  empathy: number
  activeListening: number
  expressionClarity: number
  
  // Self-Development (0-100)
  selfAwareness: number
  emotionalRegulation: number
  stressManagement: number
  personalBoundaries: number
  selfCare: number
  mindfulness: number
  resilience: number
  
  // Relationship Dynamics (0-100)
  partnerAwareness: number
  relationshipSatisfaction: number
  trustLevel: number
  intimacyDepth: number
  sharedGoals: number
  conflictFrequency: number // Lower is better
  supportiveActions: number
  
  // Growth Indicators
  goalsAchieved: number
  challengesCompleted: number
  streakDays: number
  engagementLevel: number
  learningVelocity: number // Rate of skill improvement
  consistencyScore: number
  
  // Calculated Scores
  overallGrowthScore: number
  weeklyImprovement: number
  monthlyProgress: number
  strengths: string[]
  growthAreas: string[]
}

export interface GrowthGoal {
  id: string
  userId: string
  title: string
  description: string
  category: 'communication' | 'emotional' | 'intimacy' | 'personal' | 'relationship' | 'wellness'
  targetMetric: keyof GrowthMetrics
  currentValue: number
  targetValue: number
  deadline: Date
  milestones: GrowthMilestone[]
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  tags: string[]
}

export interface GrowthMilestone {
  id: string
  title: string
  description: string
  targetValue: number
  achievedAt?: Date
  completed: boolean
  reward?: string
}

export interface GrowthInsight {
  id: string
  userId: string
  type: 'strength' | 'improvement' | 'trend' | 'achievement' | 'recommendation'
  title: string
  description: string
  data: Record<string, any>
  actionable: boolean
  actions?: string[]
  priority: number
  generatedAt: Date
  viewed: boolean
}

export interface GrowthChallenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: number
  duration: number // days
  requirements: string[]
  rewards: string[]
  skills: string[]
  activities: GrowthActivity[]
  completionCriteria: string[]
}

export interface GrowthActivity {
  id: string
  title: string
  description: string
  type: 'exercise' | 'reflection' | 'practice' | 'measurement' | 'discussion'
  duration: number // minutes
  instructions: string[]
  resources?: string[]
  checkpoints?: string[]
}

export interface ProgressReport {
  userId: string
  period: 'weekly' | 'monthly' | 'quarterly'
  startDate: Date
  endDate: Date
  summary: {
    overallProgress: number
    topAchievements: string[]
    biggestImprovements: Array<{ metric: string; improvement: number }>
    currentStreaks: number
    goalsCompleted: number
    challengesCompleted: number
    totalEngagement: number
  }
  detailedMetrics: Record<string, { previous: number; current: number; change: number }>
  insights: GrowthInsight[]
  recommendations: string[]
  nextSteps: string[]
  generatedAt: Date
}

// ===== PERSONAL GROWTH TRACKING SERVICE =====

export class PersonalGrowthTracker {
  private static instance: PersonalGrowthTracker
  private metricsCache: Map<string, GrowthMetrics[]> = new Map()

  static getInstance(): PersonalGrowthTracker {
    if (!PersonalGrowthTracker.instance) {
      PersonalGrowthTracker.instance = new PersonalGrowthTracker()
    }
    return PersonalGrowthTracker.instance
  }

  // ===== METRICS TRACKING =====

  async recordGrowthMetrics(userId: string, metrics: Partial<GrowthMetrics>): Promise<void> {
    try {
      const currentMetrics = await this.getCurrentMetrics(userId)
      const updatedMetrics: GrowthMetrics = {
        ...currentMetrics,
        ...metrics,
        userId,
        timestamp: new Date(),
        overallGrowthScore: this.calculateOverallScore({...currentMetrics, ...metrics}),
        weeklyImprovement: await this.calculateWeeklyImprovement(userId, {...currentMetrics, ...metrics}),
        monthlyProgress: await this.calculateMonthlyProgress(userId, {...currentMetrics, ...metrics})
      }

      // Update strengths and growth areas
      updatedMetrics.strengths = this.identifyStrengths(updatedMetrics)
      updatedMetrics.growthAreas = this.identifyGrowthAreas(updatedMetrics)

      await addDoc(collection(db, 'growthMetrics'), {
        ...updatedMetrics,
        timestamp: serverTimestamp()
      })

      // Clear cache to force refresh
      this.metricsCache.delete(userId)

      // Generate insights based on new metrics
      await this.generateInsights(userId, updatedMetrics)

      // Check goal progress
      await this.updateGoalProgress(userId, updatedMetrics)

    } catch (error) {
      console.error('Error recording growth metrics:', error)
    }
  }

  async getCurrentMetrics(userId: string): Promise<GrowthMetrics> {
    try {
      const metricsRef = collection(db, 'growthMetrics')
      const metricsQuery = query(
        metricsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(metricsQuery)
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        return {
          ...data,
          timestamp: data.timestamp.toDate()
        } as GrowthMetrics
      }

      // Return default metrics for new users
      return this.getDefaultMetrics(userId)
    } catch (error) {
      console.error('Error getting current metrics:', error)
      return this.getDefaultMetrics(userId)
    }
  }

  async getMetricsHistory(userId: string, days: number = 30): Promise<GrowthMetrics[]> {
    try {
      // Check cache first
      const cacheKey = `${userId}_${days}`
      if (this.metricsCache.has(cacheKey)) {
        return this.metricsCache.get(cacheKey)!
      }

      const metricsRef = collection(db, 'growthMetrics')
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const metricsQuery = query(
        metricsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(metricsQuery)
      const metrics = snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as GrowthMetrics[]

      // Cache the results
      this.metricsCache.set(cacheKey, metrics)
      return metrics
    } catch (error) {
      console.error('Error getting metrics history:', error)
      return []
    }
  }

  // ===== GOAL MANAGEMENT =====

  async createGrowthGoal(userId: string, goalData: Omit<GrowthGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const goal: Omit<GrowthGoal, 'id'> = {
        ...goalData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'growthGoals'), {
        ...goal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deadline: Timestamp.fromDate(goal.deadline)
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating growth goal:', error)
      throw error
    }
  }

  async updateGoalProgress(userId: string, metrics: GrowthMetrics): Promise<void> {
    try {
      const goalsRef = collection(db, 'growthGoals')
      const activeGoalsQuery = query(
        goalsRef,
        where('userId', '==', userId),
        where('status', '==', 'active')
      )

      const snapshot = await getDocs(activeGoalsQuery)
      
      for (const doc of snapshot.docs) {
        const goal = doc.data() as GrowthGoal
        const currentValue = metrics[goal.targetMetric] as number
        
        if (currentValue !== undefined) {
          // Update current value
          await updateDoc(doc.ref, {
            currentValue,
            updatedAt: serverTimestamp()
          })

          // Check if goal is completed
          if (this.isGoalCompleted(goal, currentValue)) {
            await updateDoc(doc.ref, {
              status: 'completed',
              completedAt: serverTimestamp()
            })

            // Generate achievement insight
            await this.generateAchievementInsight(userId, goal)
          }

          // Update milestones
          await this.updateMilestones(doc.ref, goal, currentValue)
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error)
    }
  }

  async getUserGoals(userId: string, status?: string): Promise<GrowthGoal[]> {
    try {
      const goalsRef = collection(db, 'growthGoals')
      let goalsQuery = query(
        goalsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      if (status) {
        goalsQuery = query(
          goalsRef,
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(goalsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        deadline: doc.data().deadline.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as GrowthGoal[]
    } catch (error) {
      console.error('Error getting user goals:', error)
      return []
    }
  }

  // ===== INSIGHTS GENERATION =====

  async generateInsights(userId: string, metrics: GrowthMetrics): Promise<GrowthInsight[]> {
    try {
      const insights: GrowthInsight[] = []
      const history = await this.getMetricsHistory(userId, 30)

      // Trend analysis
      insights.push(...this.analyzeTrends(userId, metrics, history))

      // Strength identification
      insights.push(...this.analyzeStrengths(userId, metrics))

      // Improvement opportunities
      insights.push(...this.analyzeImprovementOpportunities(userId, metrics, history))

      // Achievement recognition
      insights.push(...this.analyzeAchievements(userId, metrics, history))

      // Save insights
      for (const insight of insights) {
        await addDoc(collection(db, 'growthInsights'), {
          ...insight,
          generatedAt: serverTimestamp()
        })
      }

      return insights
    } catch (error) {
      console.error('Error generating insights:', error)
      return []
    }
  }

  async getUserInsights(userId: string, maxResults: number = 10): Promise<GrowthInsight[]> {
    try {
      const insightsRef = collection(db, 'growthInsights')
      const insightsQuery = query(
        insightsRef,
        where('userId', '==', userId),
        orderBy('generatedAt', 'desc'),
        limit(maxResults)
      )

      const snapshot = await getDocs(insightsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        generatedAt: doc.data().generatedAt.toDate()
      })) as GrowthInsight[]
    } catch (error) {
      console.error('Error getting user insights:', error)
      return []
    }
  }

  // ===== PROGRESS REPORTS =====

  async generateProgressReport(
    userId: string, 
    period: 'weekly' | 'monthly' | 'quarterly'
  ): Promise<ProgressReport> {
    try {
      const now = new Date()
      let startDate = new Date()
      
      switch (period) {
        case 'weekly':
          startDate.setDate(now.getDate() - 7)
          break
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarterly':
          startDate.setMonth(now.getMonth() - 3)
          break
      }

      const [currentMetrics, historicalMetrics, insights, goals] = await Promise.all([
        this.getCurrentMetrics(userId),
        this.getMetricsHistory(userId, this.getDaysForPeriod(period)),
        this.getUserInsights(userId, 20),
        this.getUserGoals(userId)
      ])

      const summary = this.calculateSummary(currentMetrics, historicalMetrics, goals, period)
      const detailedMetrics = this.calculateDetailedMetrics(currentMetrics, historicalMetrics, period)
      const recommendations = await this.generateRecommendations(userId, currentMetrics, historicalMetrics)
      const nextSteps = this.generateNextSteps(currentMetrics, goals)

      const report: ProgressReport = {
        userId,
        period,
        startDate,
        endDate: now,
        summary,
        detailedMetrics,
        insights: insights.slice(0, 10),
        recommendations,
        nextSteps,
        generatedAt: new Date()
      }

      // Save the report
      await addDoc(collection(db, 'progressReports'), {
        ...report,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(now),
        generatedAt: serverTimestamp()
      })

      return report
    } catch (error) {
      console.error('Error generating progress report:', error)
      throw error
    }
  }

  // ===== HELPER METHODS =====

  private getDefaultMetrics(userId: string): GrowthMetrics {
    return {
      userId,
      timestamp: new Date(),
      
      // Core skills - start at moderate levels
      communicationSkill: 50,
      emotionalIntelligence: 50,
      conflictResolution: 45,
      intimacyComfort: 50,
      empathy: 55,
      activeListening: 45,
      expressionClarity: 50,
      
      // Self-development
      selfAwareness: 50,
      emotionalRegulation: 45,
      stressManagement: 45,
      personalBoundaries: 50,
      selfCare: 50,
      mindfulness: 40,
      resilience: 50,
      
      // Relationship dynamics
      partnerAwareness: 50,
      relationshipSatisfaction: 60,
      trustLevel: 70,
      intimacyDepth: 50,
      sharedGoals: 45,
      conflictFrequency: 60, // Lower is better
      supportiveActions: 55,
      
      // Growth indicators
      goalsAchieved: 0,
      challengesCompleted: 0,
      streakDays: 0,
      engagementLevel: 50,
      learningVelocity: 50,
      consistencyScore: 50,
      
      // Calculated scores
      overallGrowthScore: 50,
      weeklyImprovement: 0,
      monthlyProgress: 0,
      strengths: [],
      growthAreas: []
    }
  }

  private calculateOverallScore(metrics: GrowthMetrics): number {
    const coreSkills = [
      metrics.communicationSkill,
      metrics.emotionalIntelligence,
      metrics.conflictResolution,
      metrics.intimacyComfort,
      metrics.empathy
    ]

    const selfDevelopment = [
      metrics.selfAwareness,
      metrics.emotionalRegulation,
      metrics.stressManagement,
      metrics.personalBoundaries,
      metrics.selfCare
    ]

    const relationshipDynamics = [
      metrics.partnerAwareness,
      metrics.relationshipSatisfaction,
      metrics.trustLevel,
      metrics.intimacyDepth,
      metrics.supportiveActions
    ]

    const coreAvg = coreSkills.reduce((sum, val) => sum + val, 0) / coreSkills.length
    const selfAvg = selfDevelopment.reduce((sum, val) => sum + val, 0) / selfDevelopment.length
    const relationshipAvg = relationshipDynamics.reduce((sum, val) => sum + val, 0) / relationshipDynamics.length

    // Weighted average: core skills 40%, self-development 30%, relationship dynamics 30%
    return Math.round(coreAvg * 0.4 + selfAvg * 0.3 + relationshipAvg * 0.3)
  }

  private async calculateWeeklyImprovement(userId: string, currentMetrics: GrowthMetrics): Promise<number> {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const metricsRef = collection(db, 'growthMetrics')
      const weekAgoQuery = query(
        metricsRef,
        where('userId', '==', userId),
        where('timestamp', '<=', weekAgo),
        orderBy('timestamp', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(weekAgoQuery)
      if (!snapshot.empty) {
        const oldMetrics = snapshot.docs[0].data() as GrowthMetrics
        return currentMetrics.overallGrowthScore - oldMetrics.overallGrowthScore
      }

      return 0
    } catch (error) {
      console.error('Error calculating weekly improvement:', error)
      return 0
    }
  }

  private async calculateMonthlyProgress(userId: string, currentMetrics: GrowthMetrics): Promise<number> {
    try {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      const metricsRef = collection(db, 'growthMetrics')
      const monthAgoQuery = query(
        metricsRef,
        where('userId', '==', userId),
        where('timestamp', '<=', monthAgo),
        orderBy('timestamp', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(monthAgoQuery)
      if (!snapshot.empty) {
        const oldMetrics = snapshot.docs[0].data() as GrowthMetrics
        return currentMetrics.overallGrowthScore - oldMetrics.overallGrowthScore
      }

      return 0
    } catch (error) {
      console.error('Error calculating monthly progress:', error)
      return 0
    }
  }

  private identifyStrengths(metrics: GrowthMetrics): string[] {
    const allMetrics = {
      'Communication': metrics.communicationSkill,
      'Emotional Intelligence': metrics.emotionalIntelligence,
      'Conflict Resolution': metrics.conflictResolution,
      'Intimacy': metrics.intimacyComfort,
      'Empathy': metrics.empathy,
      'Self Awareness': metrics.selfAwareness,
      'Trust Building': metrics.trustLevel,
      'Relationship Satisfaction': metrics.relationshipSatisfaction
    }

    return Object.entries(allMetrics)
      .filter(([_, value]) => value >= 75)
      .map(([key, _]) => key)
      .slice(0, 3)
  }

  private identifyGrowthAreas(metrics: GrowthMetrics): string[] {
    const allMetrics = {
      'Communication': metrics.communicationSkill,
      'Emotional Intelligence': metrics.emotionalIntelligence,
      'Conflict Resolution': metrics.conflictResolution,
      'Intimacy': metrics.intimacyComfort,
      'Stress Management': metrics.stressManagement,
      'Mindfulness': metrics.mindfulness,
      'Active Listening': metrics.activeListening
    }

    return Object.entries(allMetrics)
      .filter(([_, value]) => value <= 50)
      .sort(([_, a], [__, b]) => a - b)
      .map(([key, _]) => key)
      .slice(0, 3)
  }

  private isGoalCompleted(goal: GrowthGoal, currentValue: number): boolean {
    return currentValue >= goal.targetValue
  }

  private async updateMilestones(goalRef: any, goal: GrowthGoal, currentValue: number): Promise<void> {
    const updatedMilestones = goal.milestones.map(milestone => {
      if (!milestone.completed && currentValue >= milestone.targetValue) {
        return {
          ...milestone,
          completed: true,
          achievedAt: new Date()
        }
      }
      return milestone
    })

    await updateDoc(goalRef, {
      milestones: updatedMilestones
    })
  }

  private async generateAchievementInsight(userId: string, goal: GrowthGoal): Promise<void> {
    const insight: Omit<GrowthInsight, 'id'> = {
      userId,
      type: 'achievement',
      title: `Goal Achieved: ${goal.title}`,
      description: `Congratulations! You've successfully completed your goal: ${goal.description}`,
      data: { goalId: goal.id, completedAt: new Date() },
      actionable: false,
      priority: 8,
      generatedAt: new Date(),
      viewed: false
    }

    await addDoc(collection(db, 'growthInsights'), {
      ...insight,
      generatedAt: serverTimestamp()
    })
  }

  // Analysis methods for insights
  private analyzeTrends(userId: string, current: GrowthMetrics, history: GrowthMetrics[]): GrowthInsight[] {
    const insights: GrowthInsight[] = []

    if (history.length < 2) return insights

    // Analyze communication trend
    const commTrend = this.calculateTrend(history.map(h => h.communicationSkill))
    if (commTrend > 5) {
      insights.push({
        id: '',
        userId,
        type: 'trend',
        title: 'Communication Skills Improving',
        description: `Your communication skills have improved by ${commTrend.toFixed(1)} points recently`,
        data: { trend: commTrend, metric: 'communicationSkill' },
        actionable: false,
        priority: 7,
        generatedAt: new Date(),
        viewed: false
      })
    }

    return insights
  }

  private analyzeStrengths(userId: string, metrics: GrowthMetrics): GrowthInsight[] {
    const insights: GrowthInsight[] = []
    const strengths = this.identifyStrengths(metrics)

    if (strengths.length > 0) {
      insights.push({
        id: '',
        userId,
        type: 'strength',
        title: 'Your Top Strengths',
        description: `You excel in: ${strengths.join(', ')}`,
        data: { strengths },
        actionable: false,
        priority: 6,
        generatedAt: new Date(),
        viewed: false
      })
    }

    return insights
  }

  private analyzeImprovementOpportunities(userId: string, current: GrowthMetrics, history: GrowthMetrics[]): GrowthInsight[] {
    const insights: GrowthInsight[] = []
    const growthAreas = this.identifyGrowthAreas(current)

    if (growthAreas.length > 0) {
      insights.push({
        id: '',
        userId,
        type: 'improvement',
        title: 'Growth Opportunities',
        description: `Focus on developing: ${growthAreas[0]}`,
        data: { growthAreas },
        actionable: true,
        actions: [`Set a goal for ${growthAreas[0]}`, 'Practice daily exercises', 'Track progress weekly'],
        priority: 8,
        generatedAt: new Date(),
        viewed: false
      })
    }

    return insights
  }

  private analyzeAchievements(userId: string, current: GrowthMetrics, history: GrowthMetrics[]): GrowthInsight[] {
    const insights: GrowthInsight[] = []

    // Check for milestone achievements
    if (current.overallGrowthScore >= 75 && history.some(h => h.overallGrowthScore < 75)) {
      insights.push({
        id: '',
        userId,
        type: 'achievement',
        title: 'Excellent Progress!',
        description: 'You\'ve reached an overall growth score of 75+',
        data: { score: current.overallGrowthScore },
        actionable: false,
        priority: 9,
        generatedAt: new Date(),
        viewed: false
      })
    }

    return insights
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length)
    const older = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, values.length - 3)
    return recent - older
  }

  private calculateSummary(
    current: GrowthMetrics, 
    history: GrowthMetrics[], 
    goals: GrowthGoal[], 
    period: string
  ): ProgressReport['summary'] {
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const biggestImprovements = this.findBiggestImprovements(current, history)

    return {
      overallProgress: current.overallGrowthScore,
      topAchievements: current.strengths,
      biggestImprovements,
      currentStreaks: current.streakDays,
      goalsCompleted: completedGoals,
      challengesCompleted: current.challengesCompleted,
      totalEngagement: current.engagementLevel
    }
  }

  private calculateDetailedMetrics(
    current: GrowthMetrics, 
    history: GrowthMetrics[], 
    period: string
  ): Record<string, { previous: number; current: number; change: number }> {
    const baseline = history.length > 0 ? history[history.length - 1] : current

    return {
      communicationSkill: {
        previous: baseline.communicationSkill,
        current: current.communicationSkill,
        change: current.communicationSkill - baseline.communicationSkill
      },
      emotionalIntelligence: {
        previous: baseline.emotionalIntelligence,
        current: current.emotionalIntelligence,
        change: current.emotionalIntelligence - baseline.emotionalIntelligence
      },
      relationshipSatisfaction: {
        previous: baseline.relationshipSatisfaction,
        current: current.relationshipSatisfaction,
        change: current.relationshipSatisfaction - baseline.relationshipSatisfaction
      }
    }
  }

  private findBiggestImprovements(current: GrowthMetrics, history: GrowthMetrics[]): Array<{ metric: string; improvement: number }> {
    if (history.length === 0) return []

    const baseline = history[history.length - 1]
    const improvements = [
      { metric: 'Communication', improvement: current.communicationSkill - baseline.communicationSkill },
      { metric: 'Emotional Intelligence', improvement: current.emotionalIntelligence - baseline.emotionalIntelligence },
      { metric: 'Conflict Resolution', improvement: current.conflictResolution - baseline.conflictResolution }
    ]

    return improvements
      .filter(i => i.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 3)
  }

  private async generateRecommendations(
    userId: string, 
    current: GrowthMetrics, 
    history: GrowthMetrics[]
  ): Promise<string[]> {
    const recommendations: string[] = []
    const growthAreas = this.identifyGrowthAreas(current)

    if (growthAreas.includes('Communication')) {
      recommendations.push('Practice active listening exercises daily')
      recommendations.push('Set up regular check-ins with your partner')
    }

    if (growthAreas.includes('Stress Management')) {
      recommendations.push('Try mindfulness meditation')
      recommendations.push('Establish a relaxation routine')
    }

    if (current.consistencyScore < 50) {
      recommendations.push('Focus on building daily habits')
      recommendations.push('Set smaller, achievable goals')
    }

    return recommendations.slice(0, 5)
  }

  private generateNextSteps(current: GrowthMetrics, goals: GrowthGoal[]): string[] {
    const nextSteps: string[] = []
    const activeGoals = goals.filter(g => g.status === 'active')

    if (activeGoals.length === 0) {
      nextSteps.push('Set a new growth goal for this month')
    } else {
      nextSteps.push(`Continue working on: ${activeGoals[0].title}`)
    }

    const growthAreas = this.identifyGrowthAreas(current)
    if (growthAreas.length > 0) {
      nextSteps.push(`Focus on improving: ${growthAreas[0]}`)
    }

    nextSteps.push('Complete daily growth activities')
    nextSteps.push('Review progress weekly')

    return nextSteps.slice(0, 4)
  }

  private getDaysForPeriod(period: string): number {
    switch (period) {
      case 'weekly': return 7
      case 'monthly': return 30
      case 'quarterly': return 90
      default: return 30
    }
  }
}

// Export singleton instance
export const growthTracker = PersonalGrowthTracker.getInstance() 