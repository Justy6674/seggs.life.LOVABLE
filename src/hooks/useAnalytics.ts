import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Analytics, generateSessionId, trackPerformance } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

export function useAnalytics() {
  const { user } = useAuth();
  const router = useRouter();
  const sessionId = useRef<string>(generateSessionId());
  const sessionStart = useRef<number>(Date.now());
  const lastPageView = useRef<string>('');

  // Track page views automatically
  useEffect(() => {
    if (!user) return;

    const handleRouteChange = (url: string) => {
      if (url !== lastPageView.current) {
        Analytics.pageView(user.uid, url, sessionId.current);
        lastPageView.current = url;
      }
    };

    // Track initial page load
    handleRouteChange(window.location.pathname);

    // Listen for route changes (Next.js 13+ app router)
    const originalPush = router.push;
    router.push = (...args) => {
      const result = originalPush.apply(router, args);
      handleRouteChange(args[0] as string);
      return result;
    };

    return () => {
      router.push = originalPush;
    };
  }, [user, router]);

  // Track session start/end
  useEffect(() => {
    if (!user) return;

    // Track session start
    Analytics.sessionStarted(user.uid, sessionId.current);

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const duration = Date.now() - sessionStart.current;
      Analytics.sessionEnded(user.uid, duration, sessionId.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Track session end on component unmount
      const duration = Date.now() - sessionStart.current;
      Analytics.sessionEnded(user.uid, duration, sessionId.current);
    };
  }, [user]);

  // Return analytics functions bound to current user and session
  return {
    sessionId: sessionId.current,
    
    // Feature tracking
    trackBlueprintStarted: () => user && Analytics.blueprintStarted(user.uid, sessionId.current),
    trackBlueprintCompleted: (primaryType: string) => user && Analytics.blueprintCompleted(user.uid, primaryType, sessionId.current),
    trackDailySparkGenerated: (sparkType: string) => user && Analytics.dailySparkGenerated(user.uid, sparkType, sessionId.current),
    trackSparkFeedback: (feedback: 'love' | 'not-for-us') => user && Analytics.sparkFeedback(user.uid, feedback, sessionId.current),
    
    // Subscription tracking
    trackTrialStarted: () => user && Analytics.trialStarted(user.uid, sessionId.current),
    trackSubscriptionUpgradeClicked: (planId: string) => user && Analytics.subscriptionUpgradeClicked(user.uid, planId, sessionId.current),
    trackSubscriptionCompleted: (planId: string) => user && Analytics.subscriptionCompleted(user.uid, planId, sessionId.current),
    
    // Social tracking
    trackPartnerInvited: (inviteMethod: 'email' | 'link') => user && Analytics.partnerInvited(user.uid, inviteMethod, sessionId.current),
    trackPartnerConnected: () => user && Analytics.partnerConnected(user.uid, true, sessionId.current),
    
    // Engagement tracking
    trackFeatureExplored: (feature: string, timeSpent?: number) => user && Analytics.featureExplored(user.uid, feature, timeSpent, sessionId.current),
    
    // Performance tracking
    trackPerformance: (metric: string, value: number) => trackPerformance(metric, value, user?.uid),
    
    // Custom event tracking
    trackCustomEvent: (event: string, category: 'navigation' | 'feature' | 'subscription' | 'social' | 'engagement', properties?: Record<string, any>) => {
      if (user) {
        import('@/lib/analytics').then(({ trackEvent }) => {
          trackEvent(user.uid, event, category, properties, sessionId.current);
        });
      }
    }
  };
}

// Hook for timing operations
export function usePerformanceTimer() {
  const { trackPerformance } = useAnalytics();
  
  const startTimer = (metric: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        trackPerformance(metric, duration);
        return duration;
      }
    };
  };
  
  return { startTimer };
} 