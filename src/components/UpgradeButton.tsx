'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Crown, Sparkles, X } from 'lucide-react';

interface UpgradeButtonProps {
  variant?: 'button' | 'banner' | 'modal';
  className?: string;
}

export function UpgradeButton({ variant = 'button', className = '' }: UpgradeButtonProps) {
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has premium subscription
  const isPremium = (user as any)?.subscriptionStatus === 'active';

  const handleUpgrade = async () => {
    if (isPremium) return;

    setIsLoading(true);
    try {
      // Call Stripe API to create subscription
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className={`flex items-center space-x-2 text-amber-600 ${className}`}>
        <Crown className="h-4 w-4" />
        <span className="text-sm font-medium">Premium</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold">Unlock Premium Features</h3>
              <p className="text-white/90 text-sm">Get unlimited access to all content and AI chat</p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-white text-primary px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full hover:shadow-lg transition-all ${className}`}
        >
          <Crown className="h-4 w-4" />
          <span className="font-medium">Upgrade</span>
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-primary to-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                  Upgrade to Premium
                </h2>
                <p className="text-slate-600">
                  Unlock the full potential of your relationship
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">$25</div>
                    <div className="text-slate-600 text-sm">per month</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Unlimited AI chat with Seggsy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Daily personalized suggestions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Advanced couple games & challenges</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Fantasy & roleplay builder</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Progress tracking & insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-slate-700">Priority customer support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Start Premium Trial'}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Cancel anytime. No commitment required.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={`inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 ${className}`}
    >
      <Crown className="h-4 w-4" />
      <span className="font-medium">{isLoading ? 'Loading...' : 'Upgrade'}</span>
    </button>
  );
} 