import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  stripePaymentUrl: string;
  features: string[];
  isPopular?: boolean;
}

// Simplified subscription model: 3-day trial then single premium tier
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    description: 'Full access for you and your partner',
    price: 14.95,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    stripePaymentUrl: 'https://buy.stripe.com/6oUcN550z6j3eSvc6CcZa01',
    features: [
      'Unlimited AI-powered daily sparks',
      'Personalized suggestions based on your blueprint',
      'Advanced intimacy tools and games',
      'Relationship insights and coaching',
      'Partner invitation and shared access',
      'Privacy-first design',
      'Premium content library',
      'Both partners included in one subscription'
    ],
    isPopular: true
  }
];

// Trial configuration - 3 days as per Stripe setup
export const FREE_TRIAL_DAYS = 3;

export interface UserSubscription {
  planId: string | null;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  includesPartner: boolean; // New field for partner access
  sharedWithPartners: string[]; // Array of partner user IDs with access
}

export async function initializeUserSubscription(userId: string): Promise<UserSubscription> {
  const subscriptionRef = doc(db, 'userSubscriptions', userId);
  const subscriptionDoc = await getDoc(subscriptionRef);
  
  if (!subscriptionDoc.exists()) {
    // New user - start 3-day free trial
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + FREE_TRIAL_DAYS);
    
    const newSubscription: UserSubscription = {
      planId: null,
      status: 'trial',
      trialStartDate: now,
      trialEndDate: trialEnd,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      includesPartner: true, // All subscriptions include partner access
      sharedWithPartners: []
    };
    
    await setDoc(subscriptionRef, {
      ...newSubscription,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString()
    });
    
    return newSubscription;
  }
  
  const data = subscriptionDoc.data();
  return {
    planId: data.planId || null,
    status: data.status || 'expired',
    trialStartDate: data.trialStartDate ? new Date(data.trialStartDate) : null,
    trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
    subscriptionStartDate: data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : null,
    subscriptionEndDate: data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null,
    stripeCustomerId: data.stripeCustomerId || null,
    stripeSubscriptionId: data.stripeSubscriptionId || null,
    includesPartner: data.includesPartner !== false, // Default to true
    sharedWithPartners: data.sharedWithPartners || []
  };
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const subscriptionRef = doc(db, 'userSubscriptions', userId);
  const subscriptionDoc = await getDoc(subscriptionRef);
  
  if (!subscriptionDoc.exists()) {
    return null;
  }
  
  const data = subscriptionDoc.data();
  return {
    planId: data.planId || null,
    status: data.status || 'expired',
    trialStartDate: data.trialStartDate ? new Date(data.trialStartDate) : null,
    trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
    subscriptionStartDate: data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : null,
    subscriptionEndDate: data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null,
    stripeCustomerId: data.stripeCustomerId || null,
    stripeSubscriptionId: data.stripeSubscriptionId || null,
    includesPartner: data.includesPartner !== false,
    sharedWithPartners: data.sharedWithPartners || []
  };
}

// Check if user has access (including shared access from partner)
export async function hasActiveAccess(subscription: UserSubscription | null, userId?: string): Promise<boolean> {
  if (!subscription) return false;
  
  const now = new Date();
  
  // Check if in trial period
  if (subscription.status === 'trial' && subscription.trialEndDate && now <= subscription.trialEndDate) {
    return true;
  }
  
  // Check if has active subscription
  if (subscription.status === 'active' && subscription.subscriptionEndDate && now <= subscription.subscriptionEndDate) {
    return true;
  }
  
  // If userId provided, check if they have shared access from a partner
  if (userId) {
    const hasSharedAccess = await checkSharedAccess(userId);
    if (hasSharedAccess) return true;
  }
  
  return false;
}

// Check if user has shared access from a partner's subscription
export async function checkSharedAccess(userId: string): Promise<boolean> {
  try {
    // Get user's partner connections
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return false;
    
    const userData = userSnap.data();
    const partnerId = userData.partnerId;
    
    if (!partnerId) return false;
    
    // Check partner's subscription
    const partnerSubscription = await getUserSubscription(partnerId);
    if (!partnerSubscription) return false;
    
    // Check if partner's subscription is active and includes this user
    const partnerHasActiveAccess = await hasActiveAccess(partnerSubscription);
    const isIncludedInPartnerSubscription = partnerSubscription.sharedWithPartners.includes(userId);
    
    return partnerHasActiveAccess && isIncludedInPartnerSubscription;
  } catch (error) {
    console.error('Error checking shared access:', error);
    return false;
  }
}

export function getTrialDaysRemaining(subscription: UserSubscription | null): number {
  if (!subscription || subscription.status !== 'trial' || !subscription.trialEndDate) {
    return 0;
  }
  
  const now = new Date();
  const diffTime = subscription.trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export function isTrialExpired(subscription: UserSubscription | null): boolean {
  if (!subscription || subscription.status !== 'trial' || !subscription.trialEndDate) {
    return false;
  }
  
  return new Date() > subscription.trialEndDate;
}

export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
} 