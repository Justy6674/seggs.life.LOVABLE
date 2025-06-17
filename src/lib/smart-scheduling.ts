import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { personalizationEngine } from './personalization'
import { recommendationEngine } from './recommendations'

// ===== TYPES =====

export interface ScheduleEvent {
  id: string
  userId: string
  partnerId?: string
  parentEventId?: string
  title: string
  description: string
  type: 'activity' | 'check_in' | 'goal_review' | 'challenge' | 'date_night' | 'reflection' | 'custom'
  category: 'communication' | 'intimacy' | 'wellness' | 'growth' | 'fun' | 'routine'
  
  // Timing
  startTime: Date
  endTime: Date
  duration: number // minutes
  timeZone: string
  allDay: boolean
  
  // Recurrence
  recurring: boolean
  recurrenceRule?: RecurrenceRule
  
  // Smart Features
  aiGenerated: boolean
  adaptiveScheduling: boolean
  smartReminders: boolean
  contextAware: boolean
  
  // Content
  content?: any
  activities?: string[]
  goals?: string[]
  
  // Status
  status: 'scheduled' | 'reminded' | 'started' | 'completed' | 'skipped' | 'rescheduled'
  completedAt?: Date
  feedback?: EventFeedback
  
  // Metadata
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: 'user' | 'ai' | 'system'
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number // every X days/weeks/months
  daysOfWeek?: number[] // 0-6, Sunday = 0
  endDate?: Date
  maxOccurrences?: number
  exceptions?: Date[] // Skip these dates
}

export interface EventFeedback {
  rating: number // 1-5
  enjoyed: boolean
  tooLong: boolean
  tooShort: boolean
  wrongTime: boolean
  tooEasy: boolean
  tooHard: boolean
  comments?: string
  improvements?: string[]
}

export interface SchedulingPreferences {
  userId: string
  
  // Time preferences
  morningAvailability: TimeSlot[]
  afternoonAvailability: TimeSlot[]
  eveningAvailability: TimeSlot[]
  weekendPreferences: TimeSlot[]
  
  // Activity preferences
  preferredActivityTypes: string[]
  avoidActivityTypes: string[]
  maxDailyActivities: number
  preferredDuration: number // minutes
  
  // Smart features
  allowAIScheduling: boolean
  adaptiveRescheduling: boolean
  smartNotifications: boolean
  bufferTime: number // minutes between activities
  
  // Relationship preferences
  coupleActivities: boolean
  soloActivities: boolean
  preferredIntimacyTimes: string[]
  avoidConflictTimes: string[]
  
  updatedAt: Date
}

export interface TimeSlot {
  startHour: number // 0-23
  startMinute: number // 0-59
  endHour: number
  endMinute: number
  daysOfWeek: number[] // 0-6
}

export interface ScheduleSuggestion {
  id: string
  userId: string
  type: 'activity' | 'routine' | 'goal_work' | 'relationship_time'
  title: string
  description: string
  suggestedTime: Date
  duration: number
  priority: number
  reasoning: string[]
  alternatives: Date[]
  accepted: boolean
  createdAt: Date
}

export interface ScheduleConflict {
  id: string
  userId: string
  eventId: string
  conflictType: 'double_booking' | 'preference_violation' | 'partner_unavailable' | 'buffer_time'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestions: string[]
  autoResolved: boolean
  resolvedAt?: Date
}

// ===== SMART SCHEDULING SERVICE =====

export class SmartSchedulingService {
  private static instance: SmartSchedulingService
  private scheduleCache: Map<string, ScheduleEvent[]> = new Map()
  private preferencesCache: Map<string, SchedulingPreferences> = new Map()

  static getInstance(): SmartSchedulingService {
    if (!SmartSchedulingService.instance) {
      SmartSchedulingService.instance = new SmartSchedulingService()
    }
    return SmartSchedulingService.instance
  }

  // ===== EVENT MANAGEMENT =====

  async createEvent(userId: string, eventData: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check for conflicts before creating
      const conflicts = await this.detectConflicts(userId, eventData)
      
      if (conflicts.length > 0 && conflicts.some(c => c.severity === 'high')) {
        throw new Error('Schedule conflict detected')
      }

      const event: Omit<ScheduleEvent, 'id'> = {
        ...eventData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'scheduleEvents'), {
        ...event,
        startTime: Timestamp.fromDate(event.startTime),
        endTime: Timestamp.fromDate(event.endTime),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Clear cache
      this.scheduleCache.delete(userId)

      // Create recurring events if needed
      if (event.recurring && event.recurrenceRule) {
        const fullEvent: ScheduleEvent = {
          ...event,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await this.createRecurringEvents(docRef.id, fullEvent)
      }

      // Set up smart reminders
      if (event.smartReminders) {
        const fullEvent: ScheduleEvent = {
          ...event,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await this.scheduleSmartReminders(docRef.id, fullEvent)
      }

      return docRef.id
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async updateEvent(eventId: string, updates: Partial<ScheduleEvent>): Promise<void> {
    try {
      const eventRef = doc(db, 'scheduleEvents', eventId)
      
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        ...(updates.startTime && { startTime: Timestamp.fromDate(updates.startTime) }),
        ...(updates.endTime && { endTime: Timestamp.fromDate(updates.endTime) })
      })

      // Clear cache
      if (updates.userId) {
        this.scheduleCache.delete(updates.userId)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string, deleteRecurring: boolean = false): Promise<void> {
    try {
      if (deleteRecurring) {
        // Delete all recurring instances
        const recurringQuery = query(
          collection(db, 'scheduleEvents'),
          where('parentEventId', '==', eventId)
        )
        const snapshot = await getDocs(recurringQuery)
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }

      await deleteDoc(doc(db, 'scheduleEvents', eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  async getUserEvents(
    userId: string, 
    startDate: Date, 
    endDate: Date,
    includePartner: boolean = true
  ): Promise<ScheduleEvent[]> {
    try {
      const cacheKey = `${userId}_${startDate.getTime()}_${endDate.getTime()}`
      if (this.scheduleCache.has(cacheKey)) {
        return this.scheduleCache.get(cacheKey)!
      }

      const eventsRef = collection(db, 'scheduleEvents')
      let eventsQuery = query(
        eventsRef,
        where('userId', '==', userId),
        where('startTime', '>=', Timestamp.fromDate(startDate)),
        where('startTime', '<=', Timestamp.fromDate(endDate)),
        orderBy('startTime', 'asc')
      )

      const snapshot = await getDocs(eventsQuery)
      let events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as ScheduleEvent[]

      // Include partner events if requested
      if (includePartner) {
        const partnerEvents = await this.getPartnerEvents(userId, startDate, endDate)
        events = [...events, ...partnerEvents]
        events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      }

      this.scheduleCache.set(cacheKey, events)
      return events
    } catch (error) {
      console.error('Error getting user events:', error)
      return []
    }
  }

  // ===== AI-POWERED SCHEDULING =====

  async generateSmartSchedule(userId: string, preferences?: Partial<SchedulingPreferences>): Promise<ScheduleSuggestion[]> {
    try {
      const [userProfile, userPrefs, existingEvents, recommendations] = await Promise.all([
        personalizationEngine.buildUserProfile(userId),
        this.getSchedulingPreferences(userId),
        this.getUserEvents(userId, new Date(), this.getDateInDays(7)),
        recommendationEngine.generateRecommendations(userId, { limit: 5 })
      ])

      const suggestions: ScheduleSuggestion[] = []

      // 1. Daily routine suggestions
      suggestions.push(...this.generateRoutineSuggestions(userId, userProfile, userPrefs))

      // 2. Goal-based activity suggestions
      suggestions.push(...this.generateGoalBasedSuggestions(userId, userProfile, recommendations))

      // 3. Relationship time suggestions
      suggestions.push(...this.generateRelationshipSuggestions(userId, userProfile, userPrefs))

      // 4. Wellness and self-care suggestions
      suggestions.push(...this.generateWellnessSuggestions(userId, userProfile, userPrefs))

      // Filter out conflicts and rank by priority
      const conflictFreesuggestions = await this.filterConflicts(userId, suggestions, existingEvents)
      
      return conflictFreesuggestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 10)
    } catch (error) {
      console.error('Error generating smart schedule:', error)
      return []
    }
  }

  async acceptSuggestion(suggestionId: string): Promise<string> {
    try {
      // Get suggestion details
      const suggestionRef = doc(db, 'scheduleSuggestions', suggestionId)
      const suggestionDoc = await getDoc(suggestionRef)
      
      if (!suggestionDoc.exists()) {
        throw new Error('Suggestion not found')
      }

      const suggestion = suggestionDoc.data() as ScheduleSuggestion

      // Create the actual event
      const eventId = await this.createEvent(suggestion.userId, {
        userId: suggestion.userId,
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.type as any,
        category: this.getEventCategory(suggestion.type),
        startTime: suggestion.suggestedTime,
        endTime: new Date(suggestion.suggestedTime.getTime() + suggestion.duration * 60000),
        duration: suggestion.duration,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: false,
        recurring: false,
        aiGenerated: true,
        adaptiveScheduling: true,
        smartReminders: true,
        contextAware: true,
        status: 'scheduled',
        priority: 'medium',
        tags: [],
        createdBy: 'ai'
      })

      // Mark suggestion as accepted
      await updateDoc(suggestionRef, {
        accepted: true,
        acceptedAt: serverTimestamp()
      })

      return eventId
    } catch (error) {
      console.error('Error accepting suggestion:', error)
      throw error
    }
  }

  // ===== ADAPTIVE SCHEDULING =====

  async adaptScheduleBasedOnFeedback(userId: string, eventId: string, feedback: EventFeedback): Promise<void> {
    try {
      // Update event with feedback
      await updateDoc(doc(db, 'scheduleEvents', eventId), {
        feedback,
        updatedAt: serverTimestamp()
      })

      // Learn from feedback and adjust future scheduling
      await this.learnFromFeedback(userId, eventId, feedback)

      // Update scheduling preferences based on feedback
      await this.updatePreferencesFromFeedback(userId, feedback)
    } catch (error) {
      console.error('Error adapting schedule based on feedback:', error)
    }
  }

  async rescheduleConflicts(userId: string): Promise<ScheduleEvent[]> {
    try {
      const today = new Date()
      const nextWeek = this.getDateInDays(7)
      const events = await this.getUserEvents(userId, today, nextWeek)
      
      const conflicts = await this.detectMultipleConflicts(userId, events)
      const rescheduledEvents: ScheduleEvent[] = []

      for (const conflict of conflicts) {
        if (conflict.autoResolved) continue

        const event = events.find(e => e.id === conflict.eventId)
        if (!event || !event.adaptiveScheduling) continue

        // Find a better time slot
        const newTime = await this.findOptimalTimeSlot(userId, event)
        if (newTime) {
          await this.updateEvent(event.id, {
            startTime: newTime,
            endTime: new Date(newTime.getTime() + event.duration * 60000),
            status: 'rescheduled'
          })

          rescheduledEvents.push({
            ...event,
            startTime: newTime,
            endTime: new Date(newTime.getTime() + event.duration * 60000),
            status: 'rescheduled'
          })

          // Mark conflict as resolved
          await updateDoc(doc(db, 'scheduleConflicts', conflict.id), {
            autoResolved: true,
            resolvedAt: serverTimestamp()
          })
        }
      }

      return rescheduledEvents
    } catch (error) {
      console.error('Error rescheduling conflicts:', error)
      return []
    }
  }

  // ===== PREFERENCES MANAGEMENT =====

  async updateSchedulingPreferences(userId: string, preferences: Partial<SchedulingPreferences>): Promise<void> {
    try {
      const prefsRef = doc(db, 'schedulingPreferences', userId)
      
      await updateDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      })

      // Clear cache
      this.preferencesCache.delete(userId)
    } catch (error) {
      console.error('Error updating scheduling preferences:', error)
      throw error
    }
  }

  async getSchedulingPreferences(userId: string): Promise<SchedulingPreferences> {
    try {
      if (this.preferencesCache.has(userId)) {
        return this.preferencesCache.get(userId)!
      }

      const prefsRef = doc(db, 'schedulingPreferences', userId)
      const prefsDoc = await getDoc(prefsRef)

      if (prefsDoc.exists()) {
        const prefs = {
          ...prefsDoc.data(),
          updatedAt: prefsDoc.data().updatedAt.toDate()
        } as SchedulingPreferences

        this.preferencesCache.set(userId, prefs)
        return prefs
      }

      // Return default preferences
      return this.getDefaultPreferences(userId)
    } catch (error) {
      console.error('Error getting scheduling preferences:', error)
      return this.getDefaultPreferences(userId)
    }
  }

  // ===== CONFLICT DETECTION =====

  private async detectConflicts(userId: string, eventData: Partial<ScheduleEvent>): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = []
    
    if (!eventData.startTime || !eventData.endTime) return conflicts

    // Get existing events in the time range
    const existingEvents = await this.getUserEvents(
      userId, 
      eventData.startTime, 
      eventData.endTime
    )

    // Check for double booking
    const overlappingEvents = existingEvents.filter(event => 
      this.eventsOverlap(eventData as ScheduleEvent, event)
    )

    if (overlappingEvents.length > 0) {
      conflicts.push({
        id: `conflict_${Date.now()}`,
        userId,
        eventId: overlappingEvents[0].id,
        conflictType: 'double_booking',
        severity: 'high',
        description: `Double booking detected with "${overlappingEvents[0].title}"`,
        suggestions: ['Reschedule one of the events', 'Combine activities if possible'],
        autoResolved: false
      })
    }

    // Check preference violations
    const preferences = await this.getSchedulingPreferences(userId)
    const preferenceViolations = this.checkPreferenceViolations(eventData, preferences)
    
    conflicts.push(...preferenceViolations.map(violation => ({
      id: `conflict_${Date.now()}_${Math.random()}`,
      userId,
      eventId: eventData.id || '',
      conflictType: 'preference_violation' as const,
      severity: 'medium' as const,
      description: violation,
      suggestions: ['Adjust timing to match preferences', 'Update preferences if this works better'],
      autoResolved: false
    })))

    return conflicts
  }

  private async detectMultipleConflicts(userId: string, events: ScheduleEvent[]): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = []

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (this.eventsOverlap(events[i], events[j])) {
          conflicts.push({
            id: `conflict_${events[i].id}_${events[j].id}`,
            userId,
            eventId: events[i].id,
            conflictType: 'double_booking',
            severity: 'high',
            description: `Overlap between "${events[i].title}" and "${events[j].title}"`,
            suggestions: ['Reschedule one event', 'Reduce duration of one event'],
            autoResolved: false
          })
        }
      }
    }

    return conflicts
  }

  // ===== HELPER METHODS =====

  private eventsOverlap(event1: ScheduleEvent, event2: ScheduleEvent): boolean {
    return event1.startTime < event2.endTime && event2.startTime < event1.endTime
  }

  private checkPreferenceViolations(eventData: Partial<ScheduleEvent>, preferences: SchedulingPreferences): string[] {
    const violations: string[] = []

    if (!eventData.startTime) return violations

    const hour = eventData.startTime.getHours()
    const dayOfWeek = eventData.startTime.getDay()

    // Check if time falls within available slots
    const availableSlots = [
      ...preferences.morningAvailability,
      ...preferences.afternoonAvailability,
      ...preferences.eveningAvailability
    ]

    const isTimeAvailable = availableSlots.some(slot => 
      slot.daysOfWeek.includes(dayOfWeek) &&
      hour >= slot.startHour && hour < slot.endHour
    )

    if (!isTimeAvailable) {
      violations.push('Scheduled outside of available time slots')
    }

    // Check activity type preferences
    if (eventData.type && preferences.avoidActivityTypes.includes(eventData.type)) {
      violations.push('Activity type is in avoid list')
    }

    return violations
  }

  private async createRecurringEvents(parentEventId: string, event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!event.recurrenceRule) return

    const rule = event.recurrenceRule
    const recurringEvents: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>[] = []
    
    let currentDate = new Date(event.startTime)
    let occurrenceCount = 0

    while (
      (!rule.endDate || currentDate <= rule.endDate) &&
      (!rule.maxOccurrences || occurrenceCount < rule.maxOccurrences)
    ) {
      // Move to next occurrence
      switch (rule.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + rule.interval)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * rule.interval))
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + rule.interval)
          break
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + rule.interval)
          break
      }

      // Check if this date should be skipped
      if (rule.exceptions?.some(date => this.isSameDay(date, currentDate))) {
        continue
      }

      // Check day of week filter
      if (rule.daysOfWeek && !rule.daysOfWeek.includes(currentDate.getDay())) {
        continue
      }

      const endTime = new Date(currentDate.getTime() + event.duration * 60000)

      recurringEvents.push({
        ...event,
        startTime: new Date(currentDate),
        endTime,
        parentEventId
      })

      occurrenceCount++

      // Safety limit
      if (occurrenceCount >= 100) break
    }

    // Create all recurring events
    const promises = recurringEvents.map(recurringEvent =>
      addDoc(collection(db, 'scheduleEvents'), {
        ...recurringEvent,
        startTime: Timestamp.fromDate(recurringEvent.startTime),
        endTime: Timestamp.fromDate(recurringEvent.endTime),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    )

    await Promise.all(promises)
  }

  private async scheduleSmartReminders(eventId: string, event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // This would integrate with a notification service
    // For now, we'll just log the reminder scheduling
    console.log(`Scheduling smart reminders for event: ${event.title}`)
  }

  private generateRoutineSuggestions(
    userId: string, 
    profile: any, 
    preferences: SchedulingPreferences
  ): ScheduleSuggestion[] {
    const suggestions: ScheduleSuggestion[] = []

    // Morning routine suggestion
    if (preferences.morningAvailability.length > 0) {
      suggestions.push({
        id: `routine_morning_${Date.now()}`,
        userId,
        type: 'routine',
        title: 'Morning Connection Moment',
        description: 'Start your day with a brief check-in',
        suggestedTime: this.getNextAvailableSlot(preferences.morningAvailability),
        duration: 10,
        priority: 7,
        reasoning: ['Builds daily connection habit', 'Sets positive tone for the day'],
        alternatives: [],
        accepted: false,
        createdAt: new Date()
      })
    }

    // Evening routine suggestion
    if (preferences.eveningAvailability.length > 0) {
      suggestions.push({
        id: `routine_evening_${Date.now()}`,
        userId,
        type: 'routine',
        title: 'Evening Reflection',
        description: 'Reflect on the day together',
        suggestedTime: this.getNextAvailableSlot(preferences.eveningAvailability),
        duration: 15,
        priority: 6,
        reasoning: ['Processes daily experiences', 'Strengthens emotional connection'],
        alternatives: [],
        accepted: false,
        createdAt: new Date()
      })
    }

    return suggestions
  }

  private generateGoalBasedSuggestions(
    userId: string, 
    profile: any, 
    recommendations: any[]
  ): ScheduleSuggestion[] {
    const suggestions: ScheduleSuggestion[] = []

    recommendations.slice(0, 3).forEach((rec, index) => {
      suggestions.push({
        id: `goal_${rec.id}_${Date.now()}`,
        userId,
        type: 'goal_work',
        title: `Work on: ${rec.contentItem.title}`,
        description: rec.contentItem.description,
        suggestedTime: this.getOptimalTimeForActivity(rec.contentItem.type),
        duration: rec.contentItem.duration || 20,
        priority: 10 - index,
        reasoning: rec.reasons,
        alternatives: [],
        accepted: false,
        createdAt: new Date()
      })
    })

    return suggestions
  }

  private generateRelationshipSuggestions(
    userId: string, 
    profile: any, 
    preferences: SchedulingPreferences
  ): ScheduleSuggestion[] {
    const suggestions: ScheduleSuggestion[] = []

    if (preferences.coupleActivities) {
      suggestions.push({
        id: `relationship_${Date.now()}`,
        userId,
        type: 'relationship_time',
        title: 'Quality Time Together',
        description: 'Dedicated time for connection and intimacy',
        suggestedTime: this.getOptimalTimeForRelationship(preferences),
        duration: 45,
        priority: 9,
        reasoning: ['Strengthens relationship bond', 'Creates shared experiences'],
        alternatives: [],
        accepted: false,
        createdAt: new Date()
      })
    }

    return suggestions
  }

  private generateWellnessSuggestions(
    userId: string, 
    profile: any, 
    preferences: SchedulingPreferences
  ): ScheduleSuggestion[] {
    const suggestions: ScheduleSuggestion[] = []

    if (preferences.soloActivities) {
      suggestions.push({
        id: `wellness_${Date.now()}`,
        userId,
        type: 'activity',
        title: 'Personal Wellness Time',
        description: 'Time for self-care and personal reflection',
        suggestedTime: this.getOptimalTimeForWellness(preferences),
        duration: 30,
        priority: 5,
        reasoning: ['Maintains personal well-being', 'Supports relationship health'],
        alternatives: [],
        accepted: false,
        createdAt: new Date()
      })
    }

    return suggestions
  }

  private async filterConflicts(
    userId: string, 
    suggestions: ScheduleSuggestion[], 
    existingEvents: ScheduleEvent[]
  ): Promise<ScheduleSuggestion[]> {
    return suggestions.filter(suggestion => {
      const endTime = new Date(suggestion.suggestedTime.getTime() + suggestion.duration * 60000)
      
      return !existingEvents.some(event => 
        suggestion.suggestedTime < event.endTime && event.startTime < endTime
      )
    })
  }

  private async learnFromFeedback(userId: string, eventId: string, feedback: EventFeedback): Promise<void> {
    // Use personalization engine to learn from feedback
    await personalizationEngine.learnFromBehavior(
      userId,
      'event_completed',
      {
        eventId,
        rating: feedback.rating,
        feedback: feedback
      },
      feedback.rating >= 4 ? 'positive' : feedback.rating <= 2 ? 'negative' : 'neutral'
    )
  }

  private async updatePreferencesFromFeedback(userId: string, feedback: EventFeedback): Promise<void> {
    const preferences = await this.getSchedulingPreferences(userId)
    const updates: Partial<SchedulingPreferences> = {}

    if (feedback.wrongTime) {
      // Learn that this time didn't work well
      // Implementation would adjust time preferences
    }

    if (feedback.tooLong) {
      updates.preferredDuration = Math.max(5, preferences.preferredDuration - 5)
    } else if (feedback.tooShort) {
      updates.preferredDuration = Math.min(120, preferences.preferredDuration + 5)
    }

    if (Object.keys(updates).length > 0) {
      await this.updateSchedulingPreferences(userId, updates)
    }
  }

  private async findOptimalTimeSlot(userId: string, event: ScheduleEvent): Promise<Date | null> {
    const preferences = await this.getSchedulingPreferences(userId)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Simple implementation - find next available slot
    for (let hour = 9; hour < 21; hour++) {
      const testTime = new Date(tomorrow)
      testTime.setHours(hour, 0, 0, 0)
      
      const conflicts = await this.detectConflicts(userId, {
        ...event,
        startTime: testTime,
        endTime: new Date(testTime.getTime() + event.duration * 60000)
      })
      
      if (conflicts.length === 0) {
        return testTime
      }
    }
    
    return null
  }

  private async getPartnerEvents(userId: string, startDate: Date, endDate: Date): Promise<ScheduleEvent[]> {
    // This would fetch partner's shared events
    // For now, return empty array
    return []
  }

  private getEventCategory(type: string): ScheduleEvent['category'] {
    const categoryMap: Record<string, ScheduleEvent['category']> = {
      'activity': 'fun',
      'routine': 'routine',
      'goal_work': 'growth',
      'relationship_time': 'intimacy'
    }
    
    return categoryMap[type] || 'routine'
  }

  private getDateInDays(days: number): Date {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  private getNextAvailableSlot(slots: TimeSlot[]): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (slots.length > 0) {
      const slot = slots[0]
      tomorrow.setHours(slot.startHour, slot.startMinute, 0, 0)
    }
    
    return tomorrow
  }

  private getOptimalTimeForActivity(activityType: string): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Default to evening
    tomorrow.setHours(19, 0, 0, 0)
    
    return tomorrow
  }

  private getOptimalTimeForRelationship(preferences: SchedulingPreferences): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (preferences.eveningAvailability.length > 0) {
      const slot = preferences.eveningAvailability[0]
      tomorrow.setHours(slot.startHour, slot.startMinute, 0, 0)
    } else {
      tomorrow.setHours(20, 0, 0, 0)
    }
    
    return tomorrow
  }

  private getOptimalTimeForWellness(preferences: SchedulingPreferences): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (preferences.morningAvailability.length > 0) {
      const slot = preferences.morningAvailability[0]
      tomorrow.setHours(slot.startHour, slot.startMinute, 0, 0)
    } else {
      tomorrow.setHours(8, 0, 0, 0)
    }
    
    return tomorrow
  }

  private getDefaultPreferences(userId: string): SchedulingPreferences {
    return {
      userId,
      morningAvailability: [
        { startHour: 7, startMinute: 0, endHour: 9, endMinute: 0, daysOfWeek: [1, 2, 3, 4, 5] }
      ],
      afternoonAvailability: [
        { startHour: 12, startMinute: 0, endHour: 14, endMinute: 0, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }
      ],
      eveningAvailability: [
        { startHour: 18, startMinute: 0, endHour: 22, endMinute: 0, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }
      ],
      weekendPreferences: [
        { startHour: 9, startMinute: 0, endHour: 21, endMinute: 0, daysOfWeek: [0, 6] }
      ],
      preferredActivityTypes: ['communication', 'wellness', 'growth'],
      avoidActivityTypes: [],
      maxDailyActivities: 3,
      preferredDuration: 20,
      allowAIScheduling: true,
      adaptiveRescheduling: true,
      smartNotifications: true,
      bufferTime: 15,
      coupleActivities: true,
      soloActivities: true,
      preferredIntimacyTimes: ['evening'],
      avoidConflictTimes: [],
      updatedAt: new Date()
    }
  }
}

// Export singleton instance
export const smartScheduler = SmartSchedulingService.getInstance() 