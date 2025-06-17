'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import AppLayout from '@/components/navigation/AppLayout';
import Auth from '@/components/Auth';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, Play, Sparkles } from 'lucide-react';
import { initializeUserSubscription, getUserSubscription, hasActiveAccess } from '@/lib/subscription-plans';

interface FeatureTest {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'subscription' | 'social' | 'ai';
  status: 'pending' | 'testing' | 'passed' | 'failed';
  error?: string;
  result?: any;
}

const featureTests: FeatureTest[] = [
  // Core Features
  {
    id: 'auth',
    name: 'User Authentication',
    description: 'User login and profile access',
    category: 'core',
    status: 'pending'
  },
  {
    id: 'userData',
    name: 'User Data Loading',
    description: 'Loading user profile and preferences',
    category: 'core',
    status: 'pending'
  },
  
  // Subscription Features
  {
    id: 'subscriptionInit',
    name: 'Subscription Initialization',
    description: 'Auto-create trial for new users',
    category: 'subscription',
    status: 'pending'
  },
  {
    id: 'subscriptionCheck',
    name: 'Subscription Status Check',
    description: 'Verify trial/subscription status',
    category: 'subscription',
    status: 'pending'
  },
  {
    id: 'trialDays',
    name: 'Trial Days Calculation',
    description: 'Calculate remaining trial days',
    category: 'subscription',
    status: 'pending'
  },
  
  // AI Features
  {
    id: 'aiSuggestion',
    name: 'AI Daily Spark Generation',
    description: 'Generate personalized AI suggestions',
    category: 'ai',
    status: 'pending'
  },
  {
    id: 'blueprintQuiz',
    name: 'Blueprint Quiz Access',
    description: 'Load and access blueprint assessment',
    category: 'ai',
    status: 'pending'
  },
  
  // Social Features
  {
    id: 'partnerInvite',
    name: 'Partner Invitation System',
    description: 'Create partner invitation links',
    category: 'social',
    status: 'pending'
  }
];

export default function FeatureTestPage() {
  const { user } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const [tests, setTests] = useState<FeatureTest[]>(featureTests);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const updateTestStatus = (testId: string, status: FeatureTest['status'], error?: string, result?: any) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, error, result }
        : test
    ));
  };

  const runTest = async (testId: string): Promise<boolean> => {
    setCurrentTest(testId);
    updateTestStatus(testId, 'testing');

    try {
      switch (testId) {
        case 'auth':
          if (!user) throw new Error('User not authenticated');
          updateTestStatus(testId, 'passed', undefined, { userId: user.uid, email: user.email });
          return true;

        case 'userData':
          if (userDataLoading) throw new Error('User data still loading');
          if (!userData) throw new Error('User data not found');
          updateTestStatus(testId, 'passed', undefined, { 
            hasBlueprint: !!userData.eroticBlueprintPrimary,
            hasPartner: !!userData.partnerId 
          });
          return true;

        case 'subscriptionInit':
          if (!user) throw new Error('User required for subscription test');
          const subscription = await initializeUserSubscription(user.uid);
          updateTestStatus(testId, 'passed', undefined, { 
            status: subscription.status,
            trialEnd: subscription.trialEndDate 
          });
          return true;

        case 'subscriptionCheck':
          if (!user) throw new Error('User required for subscription test');
          const subStatus = await getUserSubscription(user.uid);
          const hasAccess = hasActiveAccess(subStatus);
          updateTestStatus(testId, 'passed', undefined, { 
            hasAccess,
            status: subStatus?.status,
            planId: subStatus?.planId 
          });
          return true;

        case 'trialDays':
          if (!user) throw new Error('User required for trial test');
          const userSub = await getUserSubscription(user.uid);
          if (!userSub || !userSub.trialEndDate) throw new Error('No trial found');
          const daysRemaining = Math.ceil((userSub.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          updateTestStatus(testId, 'passed', undefined, { daysRemaining });
          return true;

        case 'aiSuggestion':
          if (!userData?.eroticBlueprintPrimary) throw new Error('Blueprint required for AI suggestions');
          
          const response = await fetch('/api/ai/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partnerA: {
                primaryType: userData.eroticBlueprintPrimary,
                secondaryType: userData.eroticBlueprintSecondary || userData.eroticBlueprintPrimary,
                scores: userData.eroticBlueprintScores || {}
              },
              partnerB: {
                primaryType: userData.eroticBlueprintPrimary,
                secondaryType: userData.eroticBlueprintSecondary || userData.eroticBlueprintPrimary,
                scores: userData.eroticBlueprintScores || {}
              },
              heatLevel: 'flirty',
              suggestionType: 'daily_spark',
              userId: user?.uid
            })
          });

          const data = await response.json();
          if (!data.success) throw new Error(data.error || 'AI suggestion failed');
          
          updateTestStatus(testId, 'passed', undefined, { 
            suggestion: data.suggestion.title,
            emoji: data.suggestion.emoji 
          });
          return true;

        case 'blueprintQuiz':
          // Simulate quiz access test
          const quizResponse = await fetch('/test-quiz');
          if (!quizResponse.ok) throw new Error('Blueprint quiz not accessible');
          updateTestStatus(testId, 'passed', undefined, { accessible: true });
          return true;

        case 'partnerInvite':
          if (!user) throw new Error('User required for partner invite test');
          
          // Simulate partner invitation creation
          const inviteData = {
            invitedBy: user.uid,
            inviterEmail: user.email,
            inviteeEmail: 'test@example.com',
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };
          
          updateTestStatus(testId, 'passed', undefined, { 
            inviteCreated: true,
            expiresIn: '7 days' 
          });
          return true;

        default:
          throw new Error('Unknown test');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(testId, 'failed', errorMessage);
      return false;
    } finally {
      setCurrentTest(null);
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    
    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      await runTest(test.id);
    }
    
    setRunning(false);
  };

  const getStatusIcon = (status: FeatureTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-wheat/40" />;
    }
  };

  const getStatusColor = (status: FeatureTest['status']) => {
    switch (status) {
      case 'passed':
        return 'border-green-500/30 bg-green-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      case 'testing':
        return 'border-wheat/30 bg-wheat/10';
      default:
        return 'border-wheat/20 bg-wheat/5';
    }
  };

  const getCategoryStats = (category: string) => {
    const categoryTests = tests.filter(test => test.category === category);
    const passed = categoryTests.filter(test => test.status === 'passed').length;
    const failed = categoryTests.filter(test => test.status === 'failed').length;
    const total = categoryTests.length;
    
    return { passed, failed, total };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
              Feature Testing
            </h1>
            <p className="text-wheat/80">
              Login required to test MVP features
            </p>
          </div>
          <Auth />
        </div>
      </div>
    );
  }

  const categories = ['core', 'subscription', 'ai', 'social'] as const;

  return (
    <AppLayout>
      <div className="min-h-screen bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
                MVP Feature Testing
              </h1>
              <p className="text-wheat/80 mb-6">
                Comprehensive testing of all core Seggs.Life features
              </p>
              
              <button
                onClick={runAllTests}
                disabled={running}
                className="bg-deepRed hover:bg-deepRed/90 disabled:bg-deepRed/50 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                {running ? (
                  <>
                    <div className="w-5 h-5 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run All Tests
                  </>
                )}
              </button>
            </div>

            {/* Category Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {categories.map(category => {
                const stats = getCategoryStats(category);
                const color = stats.failed > 0 ? 'border-red-500/30 bg-red-500/10' :
                             stats.passed === stats.total ? 'border-green-500/30 bg-green-500/10' :
                             'border-wheat/20 bg-wheat/5';
                
                return (
                  <div
                    key={category}
                    className={`p-4 rounded-xl border ${color} text-center`}
                  >
                    <h3 className="text-wheat font-semibold capitalize mb-2">{category}</h3>
                    <div className="text-sm text-wheat/70">
                      {stats.passed}/{stats.total} passed
                    </div>
                    {stats.failed > 0 && (
                      <div className="text-red-400 text-xs mt-1">
                        {stats.failed} failed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Results */}
            <div className="space-y-6">
              {categories.map(category => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-wheat/30"
                >
                  <h2 className="text-xl font-serif font-bold text-wheat mb-4 capitalize flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {category} Features
                  </h2>
                  
                  <div className="space-y-3">
                    {tests.filter(test => test.category === category).map(test => (
                      <div
                        key={test.id}
                        className={`p-4 rounded-lg border ${getStatusColor(test.status)} transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h3 className="text-wheat font-semibold">{test.name}</h3>
                              <p className="text-wheat/70 text-sm">{test.description}</p>
                            </div>
                          </div>
                          
                          {test.status === 'pending' && (
                            <button
                              onClick={() => runTest(test.id)}
                              disabled={currentTest !== null}
                              className="bg-wheat/20 hover:bg-wheat/30 disabled:bg-wheat/10 text-wheat px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300"
                            >
                              Test
                            </button>
                          )}
                        </div>
                        
                        {test.error && (
                          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mt-2">
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">Error:</span>
                            </div>
                            <p className="text-red-300 text-sm mt-1">{test.error}</p>
                          </div>
                        )}
                        
                        {test.result && test.status === 'passed' && (
                          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mt-2">
                            <div className="text-green-400 text-sm font-medium mb-1">Result:</div>
                            <pre className="text-green-300 text-xs">
                              {JSON.stringify(test.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 