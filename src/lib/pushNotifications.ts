import { messaging } from './firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS, type PushSettings, type User } from './firebase';

/**
 * Push Notification Service for seggs.life
 * Implements the ~20 toggle system with privacy-first approach
 * Push notifications are discreet and not logged for privacy
 */

export interface PushTrigger {
  type: 'mood_nudge' | 'horny_alert' | 'consent_check' | 'health_reminder' | 'ai_suggestion';
  fromUserId: string;
  toUserId: string;
  context?: {
    mood?: string;
    intensity?: string;
    healthType?: string;
  };
}

export interface DiscreetPushContent {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Check if a specific push type is allowed based on user's toggle settings
 */
export async function isPushAllowed(
  userId: string, 
  pushType: PushTrigger['type'],
  fromPartnerId?: string
): Promise<boolean> {
  try {
    const pushSettingsDoc = await getDoc(doc(db, COLLECTIONS.PUSH_SETTINGS, userId));
    if (!pushSettingsDoc.exists()) return false;
    
    const settings = pushSettingsDoc.data() as PushSettings;
    const toggles = settings.toggles;
    
    // Check individual toggles based on push type
    switch (pushType) {
      case 'mood_nudge':
        return toggles.receiveMoodNudges;
      
      case 'horny_alert':
        // Requires both user consent and partner permission if from partner
        if (fromPartnerId) {
          return toggles.receiveHornyAlerts && 
                 toggles.allowPartnerHornyAlerts && 
                 settings.partnerConsentGiven.hornyAlerts;
        }
        return toggles.receiveHornyAlerts;
      
      case 'consent_check':
        if (fromPartnerId) {
          return toggles.receiveConsentPrompts && 
                 toggles.allowPartnerConsentChecks && 
                 settings.partnerConsentGiven.consentChecks;
        }
        return toggles.receiveConsentPrompts;
      
      case 'health_reminder':
        return toggles.prepReminders || toggles.stiCheckReminders || toggles.pathologyReminders;
      
      case 'ai_suggestion':
        return toggles.aiSuggestionsEnabled;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking push permission:', error);
    return false;
  }
}

/**
 * Check quiet hours and timing restrictions
 */
export async function isWithinAllowedHours(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) return false;
    
    const user = userDoc.data() as User;
    const pushSettingsDoc = await getDoc(doc(db, COLLECTIONS.PUSH_SETTINGS, userId));
    
    if (!pushSettingsDoc.exists()) return true; // Default to allowing
    
    const settings = pushSettingsDoc.data() as PushSettings;
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check night mode
    if (settings.toggles.nightModeEnabled && user.notificationPreferences?.quietHours) {
      const quietStart = parseInt(user.notificationPreferences.quietHours.start.split(':')[0]);
      const quietEnd = parseInt(user.notificationPreferences.quietHours.end.split(':')[0]);
      
      if (quietStart <= quietEnd) {
        // Same day quiet hours (e.g., 22:00 to 06:00 next day)
        if (currentHour >= quietStart || currentHour < quietEnd) return false;
      } else {
        // Cross-midnight quiet hours (e.g., 08:00 to 22:00)
        if (currentHour >= quietStart && currentHour < quietEnd) return false;
      }
    }
    
    // Check work hours (assuming 9-17 weekdays)
    if (settings.toggles.workHoursRespect) {
      const isWeekday = currentDay >= 1 && currentDay <= 5;
      const isWorkHours = currentHour >= 9 && currentHour <= 17;
      if (isWeekday && isWorkHours) return false;
    }
    
    // Check weekend only mode
    if (settings.toggles.weekendOnlyMode) {
      const isWeekend = currentDay === 0 || currentDay === 6;
      if (!isWeekend) return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking allowed hours:', error);
    return true; // Default to allowing if error
  }
}

/**
 * Generate discreet push notification content
 * All notifications are non-explicit and privacy-conscious
 */
export function generateDiscreetContent(trigger: PushTrigger): DiscreetPushContent {
  const discreetMessages = {
    mood_nudge: {
      titles: ['Thinking of you', 'Connection moment', 'Your partner'],
      bodies: ['Someone is thinking of you 💭', 'Your partner wants to connect', 'Check your app when you have a moment']
    },
    horny_alert: {
      titles: ['Special message', 'Your partner', 'Connection'],
      bodies: ['Your partner wants you 😏', 'Someone is in the mood', 'You have a special message waiting']
    },
    consent_check: {
      titles: ['Check-in', 'Your partner', 'Relationship'],
      bodies: ['Your partner wants to check in', 'How are you feeling?', 'Quick relationship check-in']
    },
    health_reminder: {
      titles: ['Health reminder', 'Wellness check', 'Your health'],
      bodies: ['Time for your health check-in', 'Wellness reminder waiting', 'Health notification']
    },
    ai_suggestion: {
      titles: ['New suggestion', 'AI insight', 'Recommendation'],
      bodies: ['Your AI has a suggestion', 'New connection idea available', 'Personalised recommendation ready']
    }
  };
  
  const options = discreetMessages[trigger.type];
  const randomTitle = options.titles[Math.floor(Math.random() * options.titles.length)];
  const randomBody = options.bodies[Math.floor(Math.random() * options.bodies.length)];
  
  return {
    title: randomTitle,
    body: randomBody,
    data: {
      type: trigger.type,
      timestamp: Date.now().toString(),
      // Note: No sensitive data in push payload for privacy
    }
  };
}

/**
 * Send a push notification through FCM
 * This would typically be called from a Firebase Function for security
 */
export async function sendPushNotification(trigger: PushTrigger): Promise<boolean> {
  try {
    // Check if push is allowed
    const isAllowed = await isPushAllowed(trigger.toUserId, trigger.type, trigger.fromUserId);
    if (!isAllowed) return false;
    
    // Check timing restrictions
    const isAllowedTime = await isWithinAllowedHours(trigger.toUserId);
    if (!isAllowedTime) return false;
    
    // Get user's FCM token
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, trigger.toUserId));
    if (!userDoc.exists()) return false;
    
    const user = userDoc.data() as User;
    if (!user.fcmToken) return false;
    
    // Generate discreet content
    const content = generateDiscreetContent(trigger);
    
    // This would be sent via Firebase Function to FCM
    // For now, we'll just log the action (in production, this calls FCM API)
    console.log('Push notification would be sent:', {
      token: user.fcmToken,
      title: content.title,
      body: content.body,
      data: content.data
    });
    
    // Note: Push notifications are NOT logged to database for privacy
    // Only delivery confirmation is tracked temporarily
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Common push notification triggers for the app
 */
export const PushTriggers = {
  // User initiated actions
  hornyAlert: (fromUserId: string, toUserId: string) => 
    sendPushNotification({ type: 'horny_alert', fromUserId, toUserId }),
  
  moodNudge: (fromUserId: string, toUserId: string, mood: string) =>
    sendPushNotification({ 
      type: 'mood_nudge', 
      fromUserId, 
      toUserId, 
      context: { mood } 
    }),
  
  consentCheck: (fromUserId: string, toUserId: string) =>
    sendPushNotification({ type: 'consent_check', fromUserId, toUserId }),
  
  // AI initiated
  aiSuggestion: (toUserId: string, context?: string) =>
    sendPushNotification({ 
      type: 'ai_suggestion', 
      fromUserId: 'ai', 
      toUserId,
      context: { mood: context }
    }),
  
  // Health reminders
  healthReminder: (toUserId: string, healthType: string) =>
    sendPushNotification({ 
      type: 'health_reminder', 
      fromUserId: 'system', 
      toUserId,
      context: { healthType }
    })
};

/**
 * Update user's FCM token
 */
export async function updateFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await import('firebase/firestore').then(({ updateDoc }) => 
      updateDoc(userRef, { fcmToken: token, updatedAt: new Date() })
    );
    return true;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return false;
  }
}

/**
 * Initialize push notifications for a user
 */
export async function initializePushNotifications(userId: string): Promise<boolean> {
  try {
    const token = await requestNotificationPermission();
    if (!token) return false;
    
    return await updateFCMToken(userId, token);
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
} 