import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Billing, Couple } from './firebase';

export interface SubscriptionStatus {
  isPremium: boolean;
  planType: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'past_due' | 'free';
  coupleId?: string;
  billingInfo?: Billing;
}

/**
 * Check if a user has premium access based on their couple's billing status
 */
export async function checkUserSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    // First, get user's couple information
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return {
        isPremium: false,
        planType: 'free',
        status: 'free'
      };
    }

    const userData = userDoc.data();
    const coupleId = userData.coupleId;

    if (!coupleId) {
      // User not in a couple yet
      return {
        isPremium: false,
        planType: 'free',
        status: 'free'
      };
    }

    // Get couple's subscription status
    const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
    
    if (!coupleDoc.exists()) {
      return {
        isPremium: false,
        planType: 'free',
        status: 'free',
        coupleId
      };
    }

    const coupleData = coupleDoc.data() as Couple;
    
    // Check if couple has premium subscription
    if (coupleData.subscriptionStatus === 'premium') {
      // Optionally get detailed billing info
      let billingInfo: Billing | undefined;
      
      try {
        const billingDoc = await getDoc(doc(db, 'billing', coupleId));
        if (billingDoc.exists()) {
          billingInfo = { id: billingDoc.id, ...billingDoc.data() } as Billing;
        }
      } catch (error) {
        console.warn('Could not fetch billing info:', error);
      }

      return {
        isPremium: true,
        planType: 'premium',
        status: billingInfo?.status || 'active',
        coupleId,
        billingInfo
      };
    }

    return {
      isPremium: false,
      planType: 'free',
      status: 'free',
      coupleId
    };

  } catch (error) {
    console.error('Error checking subscription status:', error);
    
    // Default to free on error
    return {
      isPremium: false,
      planType: 'free',
      status: 'free'
    };
  }
}

/**
 * Quick check if user is premium (simplified version)
 */
export async function isUserPremium(userId: string): Promise<boolean> {
  const status = await checkUserSubscription(userId);
  return status.isPremium;
}

/**
 * Get usage limits based on subscription status
 */
export function getUsageLimits(subscriptionStatus: SubscriptionStatus) {
  if (subscriptionStatus.isPremium) {
    return {
      AI_SUGGESTIONS_PER_WEEK: -1, // Unlimited
      CONVERSATION_STARTERS_PER_WEEK: -1, // Unlimited
      HEAT_LEVELS: ['sweet', 'flirty', 'spicy', 'wild'],
      SUGGESTION_TYPES: ['daily_spark', 'conversation', 'activity', 'fantasy', 'game'],
      VOICE_CHAT_ACCESS: true
    };
  }

  return {
    AI_SUGGESTIONS_PER_WEEK: 3,
    CONVERSATION_STARTERS_PER_WEEK: 1,
    HEAT_LEVELS: ['sweet', 'flirty'],
    SUGGESTION_TYPES: ['daily_spark', 'conversation', 'activity'],
    VOICE_CHAT_ACCESS: false
  };
} 