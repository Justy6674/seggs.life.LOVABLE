import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Premium subscription configuration for simplified model
export const PREMIUM_CONFIG = {
  MONTHLY: {
    name: 'Seggs.life Premium Monthly',
    price: 19.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    interval: 'month'
  },
  YEARLY: {
    name: 'Seggs.life Premium Yearly',
    price: 199.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    interval: 'year'
  }
};

// Features included in premium subscription
export const PREMIUM_FEATURES = [
  'Unlimited AI-powered daily sparks',
  'Personalized suggestions based on your blueprint',
  'Advanced intimacy tools and games',
  'Relationship insights and coaching',
  'Partner invitation and sync',
  'Privacy-first design',
  'Premium content library',
  'All heat levels (romantic, playful, sensual)',
  'Advanced erotic blueprint analysis',
  'Couple compatibility insights',
  'Progress tracking and analytics',
  'Priority customer support'
];

// Trial configuration
export const TRIAL_CONFIG = {
  DAYS: 7,
  FEATURES: PREMIUM_FEATURES // Full access during trial
};

// Usage limits for free tier
export const USAGE_LIMITS = {
  FREE: {
    AI_SUGGESTIONS_PER_WEEK: 3,
    CONVERSATION_STARTERS_PER_WEEK: 1,
  }
}; 