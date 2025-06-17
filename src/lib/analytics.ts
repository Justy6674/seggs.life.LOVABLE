import { db } from './firebase';
import { doc, setDoc, updateDoc, getDoc, increment, collection, addDoc } from 'firebase/firestore';

export interface AnalyticsEvent {
  userId: string;
  event: string;
  category: 'navigation' | 'feature' | 'subscription' | 'social' | 'engagement';
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

export interface UserMetrics {
  totalSessions: number;
  totalEvents: number;
  lastActiveDate: Date;
  featuresUsed: string[];
  subscriptionEvents: number;
  partnersInvited: number;
  blueprintCompleted: boolean;
  dailySparksGenerated: number;
  avgSessionDuration: number;
}

// Generate a session ID for grouping events
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Track an analytics event
export async function trackEvent(
  userId: string,
  event: string,
  category: AnalyticsEvent['category'],
  properties?: Record<string, any>,
  sessionId?: string
): Promise<void> {
  try {
    const analyticsEvent: AnalyticsEvent = {
      userId,
      event,
      category,
      properties: properties || {},
      timestamp: new Date(),
      sessionId: sessionId || generateSessionId()
    };

    // Store the event
    await addDoc(collection(db, 'analytics'), analyticsEvent);

    // Update user metrics
    await updateUserMetrics(userId, event, category);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', analyticsEvent);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Update user metrics based on the event
async function updateUserMetrics(
  userId: string,
  event: string,
  category: AnalyticsEvent['category']
): Promise<void> {
  try {
    const metricsRef = doc(db, 'userMetrics', userId);
    const metricsSnap = await getDoc(metricsRef);

    if (!metricsSnap.exists()) {
      // Create initial metrics
      const initialMetrics: UserMetrics = {
        totalSessions: 1,
        totalEvents: 1,
        lastActiveDate: new Date(),
        featuresUsed: [event],
        subscriptionEvents: category === 'subscription' ? 1 : 0,
        partnersInvited: event === 'partner_invited' ? 1 : 0,
        blueprintCompleted: event === 'blueprint_completed',
        dailySparksGenerated: event === 'daily_spark_generated' ? 1 : 0,
        avgSessionDuration: 0
      };

      await setDoc(metricsRef, {
        ...initialMetrics,
        lastActiveDate: new Date().toISOString()
      });
    } else {
      // Update existing metrics
      const updates: any = {
        totalEvents: increment(1),
        lastActiveDate: new Date().toISOString()
      };

      const currentData = metricsSnap.data() as UserMetrics;
      
      // Add to features used if new
      if (!currentData.featuresUsed?.includes(event)) {
        updates.featuresUsed = [...(currentData.featuresUsed || []), event];
      }

      // Category-specific updates
      if (category === 'subscription') {
        updates.subscriptionEvents = increment(1);
      }

      if (event === 'partner_invited') {
        updates.partnersInvited = increment(1);
      }

      if (event === 'blueprint_completed') {
        updates.blueprintCompleted = true;
      }

      if (event === 'daily_spark_generated') {
        updates.dailySparksGenerated = increment(1);
      }

      await updateDoc(metricsRef, updates);
    }
  } catch (error) {
    console.error('Failed to update user metrics:', error);
  }
}

// Predefined event tracking functions for common actions
export const Analytics = {
  // Navigation events
  pageView: (userId: string, page: string, sessionId?: string) => 
    trackEvent(userId, 'page_view', 'navigation', { page }, sessionId),

  // Feature usage events
  blueprintStarted: (userId: string, sessionId?: string) => 
    trackEvent(userId, 'blueprint_started', 'feature', {}, sessionId),
  
  blueprintCompleted: (userId: string, primaryType: string, sessionId?: string) => 
    trackEvent(userId, 'blueprint_completed', 'feature', { primaryType }, sessionId),

  dailySparkGenerated: (userId: string, sparkType: string, sessionId?: string) => 
    trackEvent(userId, 'daily_spark_generated', 'feature', { sparkType }, sessionId),

  sparkFeedback: (userId: string, feedback: 'love' | 'not-for-us', sessionId?: string) => 
    trackEvent(userId, 'spark_feedback', 'engagement', { feedback }, sessionId),

  // Subscription events
  trialStarted: (userId: string, sessionId?: string) => 
    trackEvent(userId, 'trial_started', 'subscription', {}, sessionId),

  subscriptionUpgradeClicked: (userId: string, planId: string, sessionId?: string) => 
    trackEvent(userId, 'subscription_upgrade_clicked', 'subscription', { planId }, sessionId),

  subscriptionCompleted: (userId: string, planId: string, sessionId?: string) => 
    trackEvent(userId, 'subscription_completed', 'subscription', { planId }, sessionId),

  // Social events
  partnerInvited: (userId: string, inviteMethod: 'email' | 'link', sessionId?: string) => 
    trackEvent(userId, 'partner_invited', 'social', { inviteMethod, includesSharedAccess: true }, sessionId),

  partnerConnected: (userId: string, hasSharedAccess: boolean = true, sessionId?: string) => 
    trackEvent(userId, 'partner_connected', 'social', { hasSharedAccess }, sessionId),

  sharedAccessUsed: (userId: string, partnerUserId: string, sessionId?: string) => 
    trackEvent(userId, 'shared_access_used', 'social', { partnerUserId }, sessionId),

  // Engagement events
  featureExplored: (userId: string, feature: string, timeSpent?: number, sessionId?: string) => 
    trackEvent(userId, 'feature_explored', 'engagement', { feature, timeSpent }, sessionId),

  sessionStarted: (userId: string, sessionId: string) => 
    trackEvent(userId, 'session_started', 'engagement', {}, sessionId),

  sessionEnded: (userId: string, duration: number, sessionId: string) => 
    trackEvent(userId, 'session_ended', 'engagement', { duration }, sessionId)
};

// Get user metrics
export async function getUserMetrics(userId: string): Promise<UserMetrics | null> {
  try {
    const metricsRef = doc(db, 'userMetrics', userId);
    const metricsSnap = await getDoc(metricsRef);
    
    if (!metricsSnap.exists()) {
      return null;
    }

    const data = metricsSnap.data();
    return {
      ...data,
      lastActiveDate: data.lastActiveDate.toDate()
    } as UserMetrics;
  } catch (error) {
    console.error('Failed to get user metrics:', error);
    return null;
  }
}

// Performance tracking
export function trackPerformance(metric: string, value: number, userId?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance: ${metric} = ${value}ms`);
  }
  
  // In production, you could send this to analytics services
  // like Google Analytics, Mixpanel, etc.
} 