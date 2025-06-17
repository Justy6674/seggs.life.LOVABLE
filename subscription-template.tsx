'use client';

import { useAuth } from '@/hooks/useAuth';
import { getUserSubscription, hasActiveAccess, getTrialDaysRemaining, isTrialExpired } from '@/lib/subscription-plans';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
}

export default function SubscriptionGate({ children, feature, fallback }: SubscriptionGateProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    try {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
      const access = await hasActiveAccess(sub, user.uid);
      setHasAccess(access);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-6 h-6 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user has access (trial or subscription), show content
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback provided, show that instead
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show subscription prompt
  const trialExpired = isTrialExpired(subscription);
  const trialDays = getTrialDaysRemaining(subscription);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-8 border border-wheat/30 text-center"
    >
      <div className="text-4xl mb-4">✨</div>
      
      {subscription?.status === 'trial' && trialExpired ? (
        <>
          <h3 className="text-2xl font-serif font-bold text-wheat mb-4">
            Trial Ended
          </h3>
          <p className="text-wheat/80 mb-6">
            Your free trial has ended. Subscribe to continue accessing <span className="text-deepRed font-semibold">{feature}</span> and all premium features.
          </p>
        </>
      ) : !subscription ? (
        <>
          <h3 className="text-2xl font-serif font-bold text-wheat mb-4">
            Start Your Free Trial
          </h3>
          <p className="text-wheat/80 mb-6">
            Get 7 days free to explore <span className="text-deepRed font-semibold">{feature}</span> and all our premium features.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-serif font-bold text-wheat mb-4">
            Premium Feature
          </h3>
          <p className="text-wheat/80 mb-6">
            <span className="text-deepRed font-semibold">{feature}</span> is a premium feature. Subscribe to unlock this and all other premium content.
          </p>
        </>
      )}

      <div className="space-y-4">
        <Link 
          href="/subscription"
          className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
        >
          {subscription?.status === 'trial' && trialExpired ? 'Subscribe Now' : 'Start Free Trial'}
        </Link>
        
        {subscription?.status === 'trial' && !trialExpired && (
          <p className="text-wheat/60 text-sm">
            You have {trialDays} days left in your trial
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Hook for easy access checking in components
export function useSubscriptionAccess() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    try {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
      const access = await hasActiveAccess(sub, user.uid);
      setHasAccess(access);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasAccess,
    subscription,
    loading,
    trialDaysRemaining: getTrialDaysRemaining(subscription),
    isTrialExpired: isTrialExpired(subscription)
  };
}
