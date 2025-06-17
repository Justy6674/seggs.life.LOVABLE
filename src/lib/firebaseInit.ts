import { auth, db, messaging, analytics, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from './firebase';

/**
 * Firebase initialization and setup helpers for seggs.life
 */

export interface FirebaseInitResult {
  success: boolean;
  error?: string;
  services: {
    auth: boolean;
    firestore: boolean;
    messaging: boolean;
    analytics: boolean;
  };
}

/**
 * Initialize Firebase services and check configuration
 */
export async function initializeFirebaseServices(): Promise<FirebaseInitResult> {
  const result: FirebaseInitResult = {
    success: false,
    services: {
      auth: false,
      firestore: false,
      messaging: false,
      analytics: false
    }
  };

  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      result.error = 'Firebase configuration is incomplete. Please check your environment variables.';
      return result;
    }

    // Test Firebase Auth
    if (auth) {
      result.services.auth = true;
      console.log('✅ Firebase Auth initialized');
    }

    // Test Firestore
    if (db) {
      result.services.firestore = true;
      console.log('✅ Firestore initialized');
    }

    // Test Firebase Messaging (client-side only)
    if (typeof window !== 'undefined' && messaging) {
      result.services.messaging = true;
      console.log('✅ Firebase Messaging initialized');
    }

    // Test Analytics (client-side only)
    if (typeof window !== 'undefined' && analytics) {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        result.services.analytics = true;
        console.log('✅ Firebase Analytics initialized');
      }
    }

    result.success = true;
    return result;

  } catch (error) {
    result.error = `Firebase initialization failed: ${error}`;
    console.error('❌ Firebase initialization error:', error);
    return result;
  }
}

/**
 * Set up authentication state listener
 */
export function setupAuthStateListener(
  onSignIn: (user: User) => void,
  onSignOut: () => void
) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onSignIn(user);
    } else {
      onSignOut();
    }
  });
}

/**
 * Create initial user document in Firestore
 */
export async function createUserDocument(user: User, additionalData?: any) {
  if (!user) return;

  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { displayName, email } = user;
    const createdAt = new Date();

    const userData = {
      id: user.uid,
      displayName: displayName || '',
      email: email || '',
      createdAt,
      updatedAt: createdAt,
      onboardingCompleted: false,
      sexualOrientation: 'prefer_not_to_say',
      relationshipType: 'exploring',
      boundaries: [],
      noGoList: [],
      safeWord: '',
      intensityLevel: 'sweet',
      healthInterests: {
        prepReminders: false,
        stiEducation: false,
        telehealthLinks: false,
        pathologyReminders: false,
      },
      notificationPreferences: {
        email: true,
        sms: false,
        push: false,
        frequency: 'weekly',
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      },
      panicLockEnabled: false,
      encryptionEnabled: true,
      ...additionalData
    };

    try {
      await setDoc(userRef, userData);
      console.log('✅ User document created successfully');
    } catch (error) {
      console.error('❌ Error creating user document:', error);
      throw error;
    }
  }
}

/**
 * Create initial push settings for a user
 */
export async function createUserPushSettings(userId: string) {
  const pushSettingsRef = doc(db, COLLECTIONS.PUSH_SETTINGS, userId);
  const pushSettingsSnapshot = await getDoc(pushSettingsRef);

  if (!pushSettingsSnapshot.exists()) {
    const defaultPushSettings = {
      id: userId,
      userId: userId,
      coupleId: '',
      toggles: {
        // Mood & desire alerts (default to off for privacy)
        receiveMoodNudges: false,
        receiveHornyAlerts: false,
        receiveEnergyChecks: false,
        receiveConsentPrompts: false,
        
        // Health reminders (default to off, user can enable)
        prepReminders: false,
        stiCheckReminders: false,
        pathologyReminders: false,
        mentalHealthChecks: false,
        
        // Connection modes (default to mixed for inclusivity)
        asexualModeOnly: false,
        sexualModeEnabled: true,
        mixedModeEnabled: true,
        
        // Partner-enabled settings (require explicit consent)
        allowPartnerMoodAlerts: false,
        allowPartnerHornyAlerts: false,
        allowPartnerConsentChecks: false,
        allowPartnerHealthReminders: false,
        
        // Timing and frequency (respectful defaults)
        nightModeEnabled: true,
        workHoursRespect: true,
        weekendOnlyMode: false,
        
        // Content preferences (opt-in approach)
        aiSuggestionsEnabled: false,
        educationalContentEnabled: true,
        shoppingSuggestionsEnabled: false,
      },
      partnerConsentGiven: {
        moodAlerts: false,
        hornyAlerts: false,
        consentChecks: false,
        healthReminders: false,
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(pushSettingsRef, defaultPushSettings);
      console.log('✅ Push settings created successfully');
    } catch (error) {
      console.error('❌ Error creating push settings:', error);
      throw error;
    }
  }
}

/**
 * Log analytics event (privacy-conscious)
 */
export async function logAnalyticsEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      const { logEvent } = await import('firebase/analytics');
      
      // Only log non-sensitive events for privacy
      const allowedEvents = [
        'page_view',
        'user_engagement',
        'app_open',
        'first_visit',
        'session_start'
      ];
      
      if (allowedEvents.includes(eventName)) {
        logEvent(analyticsInstance, eventName, parameters);
      }
    }
  } catch (error) {
    console.error('Analytics event error:', error);
  }
}

/**
 * Check Firebase service health
 */
export async function checkFirebaseHealth(): Promise<{[key: string]: boolean}> {
  const health = {
    auth: false,
    firestore: false,
    messaging: false,
    analytics: false
  };

  try {
    // Check Auth
    health.auth = !!auth;

    // Check Firestore
    if (db) {
      health.firestore = true;
    }

    // Check Messaging (client-side only)
    if (typeof window !== 'undefined' && messaging) {
      health.messaging = true;
    }

    // Check Analytics (client-side only)
    if (typeof window !== 'undefined' && analytics) {
      const analyticsInstance = await analytics;
      health.analytics = !!analyticsInstance;
    }

  } catch (error) {
    console.error('Firebase health check error:', error);
  }

  return health;
} 