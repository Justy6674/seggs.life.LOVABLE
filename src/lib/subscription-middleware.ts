import { checkUserSubscription, type SubscriptionStatus } from './subscription-checker';

/**
 * Subscription middleware for protecting premium features
 */
export class SubscriptionMiddleware {
  private userId: string;
  private subscriptionStatus: SubscriptionStatus | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize subscription status (call once per session)
   */
  async initialize(): Promise<void> {
    try {
      this.subscriptionStatus = await checkUserSubscription(this.userId);
    } catch (error) {
      console.error('Error initializing subscription middleware:', error);
      // Default to free on error
      this.subscriptionStatus = {
        isPremium: false,
        planType: 'free',
        status: 'free'
      };
    }
  }

  /**
   * Check if user has premium access
   */
  isPremium(): boolean {
    return this.subscriptionStatus?.isPremium || false;
  }

  /**
   * Get current plan type
   */
  getPlanType(): string {
    return this.subscriptionStatus?.planType || 'free';
  }

  /**
   * Check if user can access a specific feature
   */
  canAccessFeature(feature: string): boolean {
    if (!this.subscriptionStatus) {
      return false;
    }

    const isPremium = this.subscriptionStatus.planType !== "free";

    switch (feature) {
      case 'voice_chat':
        return isPremium;
      case 'progress_tracking':
        return isPremium;
      case 'full_compatibility_analysis':
        return isPremium;
      case 'partner_mood_sharing':
        return isPremium;
      case 'spicy_heat_level':
        return isPremium;
      case 'wild_heat_level':
        return isPremium;
      case 'fantasy_suggestions':
        return isPremium;
      case 'game_suggestions':
        return isPremium;
      default:
        return false;
    }
  }

  /**
   * Get remaining AI suggestions for the week
   */
  async getAISuggestionLimits(): Promise<{ used: number; limit: number; remaining: number; unlimited: boolean }> {
    if (!this.subscriptionStatus) {
      return { used: 0, limit: 3, remaining: 3, unlimited: false };
    }

    const isPremium = this.subscriptionStatus.planType !== "free";
    const weeklyLimit = isPremium ? -1 : 3;

    // If unlimited
    if (weeklyLimit === -1) {
      return { used: 0, limit: -1, remaining: -1, unlimited: true };
    }

    // Get current week's usage (simplified - in production you'd track this in Firestore)
    const used = await this.getWeeklyUsage('ai_suggestions');
    const remaining = Math.max(0, weeklyLimit - used);

    return { used, limit: weeklyLimit, remaining, unlimited: false };
  }

  /**
   * Check if user can make an AI suggestion request
   */
  async canMakeAISuggestion(): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getAISuggestionLimits();

    if (limits.unlimited) {
      return { allowed: true };
    }

    if (limits.remaining <= 0) {
      return { 
        allowed: false, 
        reason: `You've used all ${limits.limit} free AI suggestions this week. Upgrade to Premium for unlimited suggestions.` 
      };
    }

    return { allowed: true };
  }

  /**
   * Record AI suggestion usage
   */
  async recordAISuggestionUsage(): Promise<void> {
    if (this.isPremium()) {
      return; // No need to track usage for premium users
    }

    try {
      // In production, this would increment the weekly usage counter in Firestore
      await this.incrementWeeklyUsage('ai_suggestions');
    } catch (error) {
      console.error('Error recording AI suggestion usage:', error);
    }
  }

  /**
   * Get available heat levels for user
   */
  getAvailableHeatLevels(): string[] {
    if (!this.subscriptionStatus) {
      return ['sweet', 'flirty'];
    }

    const isPremium = this.subscriptionStatus.planType !== "free";
    return isPremium ? ["sweet", "flirty", "spicy", "wild"] : ["sweet", "flirty"];
  }

  /**
   * Get available suggestion types for user
   */
  getAvailableSuggestionTypes(): string[] {
    if (!this.subscriptionStatus) {
      return ['daily_spark', 'conversation', 'activity'];
    }

    const isPremium = this.subscriptionStatus.planType !== "free";
    return isPremium ? ["daily_spark", "conversation", "activity", "fantasy", "game"] : ["daily_spark", "conversation", "activity"];
  }

  /**
   * Generate upgrade prompt for blocked feature
   */
  getUpgradePrompt(feature: string): string {
    const prompts = {
      voice_chat: "Unlock Seggsy voice chat with Premium! Get personalized intimate conversations powered by AI.",
      progress_tracking: "Track your intimacy journey with Premium! See your relationship growth over time.",
      full_compatibility_analysis: "Get your complete compatibility analysis with Premium! Deep insights into your relationship dynamics.",
      spicy_heat_level: "Spice things up with Premium! Unlock Spicy and Wild heat levels for more adventurous suggestions.",
      wild_heat_level: "Ready to get Wild? Upgrade to Premium for the most passionate suggestions and experiences.",
      fantasy_suggestions: "Explore your fantasies with Premium! Get AI-generated fantasy scenarios tailored to your Blueprint.",
      game_suggestions: "Play intimate games with Premium! Unlock relationship games and challenges designed for your Blueprint.",
      unlimited_suggestions: "Get unlimited AI suggestions with Premium! No more waiting for weekly resets."
    };

    return prompts[feature as keyof typeof prompts] || "Upgrade to Premium to unlock this feature and transform your intimacy!";
  }

  /**
   * Helper method to get weekly usage (simplified implementation)
   * In production, this would query Firestore for actual usage data
   */
  private async getWeeklyUsage(feature: string): Promise<number> {
    // This is a simplified implementation
    // In production, you'd query Firestore for weekly usage data
    const weekStart = this.getWeekStart();
    
    try {
      // For now, return a mock value
      // In production: query Firestore collection 'usage_tracking' for this user and week
      return 0;
    } catch (error) {
      console.error('Error getting weekly usage:', error);
      return 0;
    }
  }

  /**
   * Helper method to increment weekly usage
   */
  private async incrementWeeklyUsage(feature: string): Promise<void> {
    // This is a simplified implementation
    // In production, you'd increment the usage counter in Firestore
    const weekStart = this.getWeekStart();
    
    try {
      // In production: increment usage in Firestore collection 'usage_tracking'
      console.log(`Recording ${feature} usage for user ${this.userId} for week ${weekStart}`);
    } catch (error) {
      console.error('Error incrementing weekly usage:', error);
    }
  }

  /**
   * Get the start of the current week (for usage tracking)
   */
  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}

/**
 * Factory function to create subscription middleware
 */
export async function createSubscriptionMiddleware(userId: string): Promise<SubscriptionMiddleware> {
  const middleware = new SubscriptionMiddleware(userId);
  await middleware.initialize();
  return middleware;
}

/**
 * React hook for using subscription middleware
 */
export function useSubscriptionMiddleware(userId: string | null) {
  const [middleware, setMiddleware] = React.useState<SubscriptionMiddleware | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function initMiddleware() {
      if (!userId) {
        setMiddleware(null);
        setLoading(false);
        return;
      }

      try {
        const newMiddleware = await createSubscriptionMiddleware(userId);
        setMiddleware(newMiddleware);
      } catch (error) {
        console.error('Error initializing subscription middleware:', error);
        setMiddleware(null);
      } finally {
        setLoading(false);
      }
    }

    initMiddleware();
  }, [userId]);

  return { middleware, loading };
}

// Add React import for the hook
import React from 'react'; 