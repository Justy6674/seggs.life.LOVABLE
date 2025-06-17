'use client';

import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { motion } from 'framer-motion';
import { useSubscriptionAccess } from './SubscriptionGate';

interface SubscriptionPlansProps {
  onUpgrade?: () => void;
}

export default function SubscriptionPlans({ onUpgrade }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const { hasAccess, subscription, loading, trialDaysRemaining } = useSubscriptionAccess();

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    try {
      // Use direct Stripe payment URL for faster checkout
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (plan?.stripePaymentUrl) {
        // Add user metadata to the URL for tracking
        const urlWithParams = `${plan.stripePaymentUrl}?client_reference_id=${user.uid}&prefilled_email=${encodeURIComponent(user.email || '')}`;
        window.location.href = urlWithParams;
        return;
      }

      // Fallback to custom checkout session creation
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: user.uid
        })
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Trial Status Banner */}
      {subscription?.status === 'trial' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-wheat/30 text-center"
        >
          <h2 className="text-2xl font-serif font-bold text-wheat mb-2">
            🎉 Welcome to Your Free Trial!
          </h2>
          <p className="text-wheat/80 text-lg">
            {trialDaysRemaining > 0 ? (
              <>You have <span className="text-deepRed font-semibold">{trialDaysRemaining} days</span> left to explore everything Seggs.Life has to offer</>
            ) : (
              <>Your 3-day trial has ended. Subscribe to continue your intimate journey</>
            )}
          </p>
        </motion.div>
      )}

      {/* Current Status */}
      {hasAccess ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-emerald-400/30 text-center"
        >
          <h2 className="text-2xl font-serif font-bold text-wheat mb-2">
            ✨ You're All Set!
          </h2>
          <p className="text-wheat/80 text-lg">
            {subscription?.status === 'trial' 
              ? 'Enjoying your free trial with full access to all features'
              : 'You have premium access to all Seggs.Life features'
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
            Continue Your Intimate Journey
          </h1>
          <p className="text-wheat/80 text-xl max-w-2xl mx-auto">
            Unlock unlimited personalized suggestions, advanced features, and premium content designed to deepen your connection
          </p>
        </motion.div>
      )}

      {/* Pricing Plans */}
      {!hasAccess && (
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative bg-gradient-to-br backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 hover:scale-105
                ${plan.isPopular 
                  ? 'from-deepRed/30 to-burgundy/30 border-deepRed/50 shadow-lg shadow-deepRed/20' 
                  : 'from-burgundy/20 to-primary/20 border-wheat/30'
                }
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-deepRed text-wheat px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-wheat mb-2">{plan.name}</h3>
                <p className="text-wheat/70">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-wheat">${plan.price}</span>
                  <span className="text-wheat/70">/{plan.interval}</span>
                  {plan.interval === 'year' && (
                    <div className="text-emerald-400 text-sm font-medium mt-1">Save 17%</div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <span className="text-deepRed mt-1">✓</span>
                    <span className="text-wheat/90 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                className={`
                  w-full py-4 rounded-xl font-semibold transition-all duration-300
                  ${plan.isPopular
                    ? 'bg-deepRed hover:bg-deepRed/90 text-wheat shadow-lg'
                    : 'bg-wheat/20 hover:bg-wheat/30 text-wheat'
                  }
                `}
              >
                Get Premium Access
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <div className="flex flex-wrap justify-center items-center gap-8 text-wheat/60 text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Privacy-First Design</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💝</span>
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Personalized for Your Relationship</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🤝</span>
            <span>Built by Relationship Experts</span>
          </div>
        </div>
      </motion.div>

      {/* Partner Invitation Note */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-wheat/10 rounded-2xl p-6 text-center border border-wheat/20"
      >
        <h3 className="text-lg font-semibold text-wheat mb-2">👫 Partner Invitation</h3>
        <p className="text-wheat/80 text-sm">
          Once subscribed, you can invite your partner to join when you're both ready. 
          They'll get their own private space while you can sync your journeys together.
        </p>
      </motion.div>
    </div>
  );
} 