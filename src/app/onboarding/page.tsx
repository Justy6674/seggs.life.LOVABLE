'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeUserSubscription } from '@/lib/subscription-plans';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Auth from '@/components/Auth';
import { CheckCircle, Heart, Users, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Seggs.Life! 💕',
    description: 'Your journey to deeper intimacy starts here',
    component: 'welcome'
  },
  {
    id: 'trial',
    title: 'Your Free Trial Awaits ✨',
    description: 'Get 7 days of full access to explore everything',
    component: 'trial'
  },
  {
    id: 'privacy',
    title: 'Privacy First 🔒',
    description: 'Your intimate journey stays completely private',
    component: 'privacy'
  },
  {
    id: 'blueprint',
    title: 'Take Your Blueprint Quiz 🎯',
    description: 'Discover your unique intimacy style',
    component: 'blueprint'
  },
  {
    id: 'partner',
    title: 'Partner Connection (Optional) 👫',
    description: 'Invite your partner when you\'re ready',
    component: 'partner'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start exploring your personalized experience',
    component: 'complete'
  }
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [trialActivated, setTrialActivated] = useState(false);

  const activateTrial = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Initialize subscription (starts free trial)
      await initializeUserSubscription(user.uid);
      setTrialActivated(true);
    } catch (error) {
      console.error('Error activating trial:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Mark onboarding as complete
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date()
      });

      // Redirect to app
      router.push('/app?onboarding=complete');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
              Join Seggs.Life
            </h1>
            <p className="text-wheat/80">
              Create your account to begin your intimate journey
            </p>
          </div>
          <Auth />
        </div>
      </div>
    );
  }

  const currentStepData = onboardingSteps[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">💕</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Welcome to Your Intimate Journey
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                You've taken the first step toward deeper connection and intimacy. 
                Seggs.Life is designed to help you explore, understand, and enhance your unique intimate style.
              </p>
              <div className="bg-wheat/10 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-deepRed" />
                  <span>Personalized suggestions based on your blueprint</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-deepRed" />
                  <span>Optional partner connection when you're ready</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-deepRed" />
                  <span>AI-powered daily sparks and intimate activities</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'trial':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Start Your 3-Day Free Trial
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                Get complete access to all premium features for 3 days. No credit card required.
              </p>
              <div className="bg-emerald-600/20 rounded-lg p-6 border border-emerald-400/30">
                <h3 className="text-wheat font-semibold mb-3">What's included:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited AI-powered daily sparks</li>
                  <li>• Complete blueprint assessment & insights</li>
                  <li>• Premium intimacy tools and activities</li>
                  <li>• Partner invitation with shared access</li>
                  <li>• All heat levels and content</li>
                </ul>
              </div>
              {!trialActivated && (
                <button
                  onClick={activateTrial}
                  disabled={loading}
                  className="bg-deepRed hover:bg-deepRed/90 disabled:bg-deepRed/50 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin" />
                      Activating Trial...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Activate Free Trial
                    </>
                  )}
                </button>
              )}
              {trialActivated && (
                <div className="bg-green-600/20 rounded-lg p-4 border border-green-400/30">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Trial Activated!</span>
                  </div>
                  <p className="text-wheat/70 text-sm mt-2">
                    You now have 7 days of full access to explore everything Seggs.Life offers.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Your Privacy is Sacred
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                We understand intimacy requires absolute trust. Here's how we protect you:
              </p>
              <div className="grid gap-4">
                <div className="bg-wheat/10 rounded-lg p-4 text-left">
                  <h3 className="text-wheat font-semibold mb-2">🔐 End-to-End Privacy</h3>
                  <p className="text-sm">Your data is encrypted and never shared with third parties.</p>
                </div>
                <div className="bg-wheat/10 rounded-lg p-4 text-left">
                  <h3 className="text-wheat font-semibold mb-2">👥 Your Choice to Share</h3>
                  <p className="text-sm">Partner connections are optional and controlled by you.</p>
                </div>
                <div className="bg-wheat/10 rounded-lg p-4 text-left">
                  <h3 className="text-wheat font-semibold mb-2">🗑️ Full Control</h3>
                  <p className="text-sm">Delete your data anytime with one click.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'blueprint':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Discover Your Blueprint
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                Every person has a unique intimacy style. Our blueprint assessment helps you understand yours.
              </p>
              <div className="bg-wheat/10 rounded-lg p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-primary/40 rounded-lg">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="font-semibold">Energetic</div>
                  </div>
                  <div className="text-center p-3 bg-primary/40 rounded-lg">
                    <div className="text-2xl mb-1">🕯️</div>
                    <div className="font-semibold">Sensual</div>
                  </div>
                  <div className="text-center p-3 bg-primary/40 rounded-lg">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="font-semibold">Sexual</div>
                  </div>
                  <div className="text-center p-3 bg-primary/40 rounded-lg">
                    <div className="text-2xl mb-1">🎭</div>
                    <div className="font-semibold">Kinky</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/test-quiz?from=onboarding')}
                className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Take Blueprint Quiz
              </button>
              <p className="text-wheat/60 text-sm">
                Takes about 5-10 minutes • Can be retaken anytime
              </p>
            </div>
          </div>
        );

      case 'partner':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">👫</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Partner Connection (Optional)
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                Seggs.Life works great solo or with a partner. You can always invite them later when you're ready.
              </p>
              <div className="bg-wheat/10 rounded-lg p-6 space-y-3 text-left">
                <h3 className="text-wheat font-semibold mb-3">How partner connection works:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Send a private invitation when you're ready</li>
                  <li>• They get their own space to explore at their pace</li>
                  <li>• You both control what to share and when</li>
                  <li>• Sync your journeys together when you both agree</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/app?partner=later')}
                  className="bg-wheat/20 hover:bg-wheat/30 text-wheat px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => router.push('/app?partner=invite')}
                  className="bg-deepRed hover:bg-deepRed/90 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Invite Partner
                </button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              You're All Set!
            </h2>
            <div className="space-y-4 text-wheat/80">
              <p className="text-lg">
                Your intimate journey awaits. Start exploring personalized suggestions, take your blueprint quiz, and discover new ways to connect.
              </p>
              <div className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 rounded-lg p-6 border border-wheat/30">
                <h3 className="text-wheat font-semibold mb-3">Ready to explore:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Daily personalized sparks</li>
                  <li>• Blueprint assessment & insights</li>
                  <li>• Intimate activities and games</li>
                  <li>• AI-powered suggestions</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              <button
                onClick={completeOnboarding}
                disabled={loading}
                className="bg-deepRed hover:bg-deepRed/90 disabled:bg-deepRed/50 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enter Seggs.Life
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-deepRed' : 'bg-wheat/20'
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <span className="text-wheat/60 text-sm">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/30"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="bg-wheat/20 hover:bg-wheat/30 disabled:bg-wheat/10 disabled:text-wheat/30 text-wheat px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < onboardingSteps.length - 1 && (
              <button
                onClick={nextStep}
                disabled={(currentStep === 1 && !trialActivated)}
                className="bg-deepRed hover:bg-deepRed/90 disabled:bg-deepRed/30 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 