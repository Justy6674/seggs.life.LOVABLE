'use client';

import React, { useState } from 'react';
import { X, Star, Heart, Zap, Crown, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'usage_limit' | 'premium_feature' | 'heat_level' | 'suggestion_type';
  message?: string;
}

export default function UpgradeModal({ isOpen, onClose, trigger, message }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // Use existing Stripe buy URL for now (simplest, most reliable)
      const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_URL || 'https://buy.stripe.com/14A4gz50zcHr7q3b2ycZa00';
      
      // Add success/cancel URLs with context
      const successUrl = encodeURIComponent(`${window.location.origin}/app?upgrade=success`);
      const cancelUrl = encodeURIComponent(`${window.location.origin}/ai-suggestions?upgrade=cancelled`);
      
      const fullUrl = `${stripeUrl}?success_url=${successUrl}&cancel_url=${cancelUrl}`;
      
      // Open in same tab for better mobile experience
      window.location.href = fullUrl;
      
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const getTriggerContent = () => {
    switch (trigger) {
      case 'usage_limit':
        return {
          icon: <Zap className="w-8 h-8 text-amber-500" />,
          title: "You've Hit Your Weekly Limit! ⚡",
          subtitle: "Unlock unlimited AI suggestions with Premium",
          urgency: "Only 3 suggestions per week on free tier"
        };
      case 'heat_level':
        return {
          icon: <Heart className="w-8 h-8 text-red-500" />,
          title: "Spicy & Wild Heat Levels 🔥",
          subtitle: "Premium exclusive features await",
          urgency: "95% of couples love the advanced heat levels"
        };
      case 'suggestion_type':
        return {
          icon: <Star className="w-8 h-8 text-purple-500" />,
          title: "Fantasy & Game Suggestions ✨",
          subtitle: "Premium users get access to all suggestion types",
          urgency: "The most requested features by couples"
        };
      default:
        return {
          icon: <Crown className="w-8 h-8 text-yellow-500" />,
          title: "Upgrade to Premium 👑",
          subtitle: "Unlock the full seggs.life experience",
          urgency: "Join 1,000+ couples exploring deeper intimacy"
        };
    }
  };

  const content = getTriggerContent();

  const premiumFeatures = [
    'Unlimited AI suggestions',
    'Full couple compatibility analysis',
    'All heat levels (Sweet, Flirty, Spicy, Wild)',
    'Seggsy voice chat access',
    'Fantasy & game suggestions',
    'Progress tracking & intimacy scores',
    'Partner mood sharing',
    'Date night planning',
    'Priority support'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-4">
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          
          <p className="text-gray-600 mb-2">
            {content.subtitle}
          </p>

          {/* Urgency/Social Proof */}
          <div className="text-sm text-purple-600 font-medium">
            {content.urgency}
          </div>

          {message && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">{message}</p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              $25<span className="text-lg text-gray-500">/month</span>
            </div>
            <p className="text-gray-600 mb-2">per couple</p>
            <div className="text-sm text-green-600 font-medium">
              🎁 First month 50% off - Limited time!
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to secure payment...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Upgrade to Premium Now
              </>
            )}
          </button>

          {/* Trust Signals */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-2">
              <span>🔒 Secure Payment</span>
              <span>❌ Cancel Anytime</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Powered by Stripe • 30-day money-back guarantee
            </p>
            <div className="text-xs text-green-600 font-medium">
              ⭐ Trusted by 1,000+ couples
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 