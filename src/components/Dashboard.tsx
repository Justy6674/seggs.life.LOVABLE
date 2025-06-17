'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { UpgradeButton } from './UpgradeButton';
import NotificationBell from './NotificationBell';
import { Sparkles, Heart, MessageCircle, TrendingUp, Users, Calendar, Star, Play } from 'lucide-react';

interface DashboardProps {
  user: any;
}

interface BlueprintResult {
  sensual: number;
  sexual: number;
  energetic: number;
  kinky: number;
  shapeshifter: number;
  dominantType: string;
  completedAt: Date;
}

interface DailySpark {
  id: string;
  content: string;
  category: string;
  heatLevel: 'sweet' | 'spicy' | 'steamy' | 'wild';
  createdAt: Date;
  used: boolean;
}

interface StreakData {
  current: number;
  longest: number;
  lastActivity: Date;
}

export default function Dashboard({ user }: DashboardProps) {
  const [blueprintResult, setBlueprintResult] = useState<BlueprintResult | null>(null);
  const [partnerBlueprint, setPartnerBlueprint] = useState<BlueprintResult | null>(null);
  const [dailySpark, setDailySpark] = useState<DailySpark | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0, lastActivity: new Date() });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPartner, setHasPartner] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user's blueprint
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.blueprintResult) {
        setBlueprintResult(userData.blueprintResult);
      }
      
      // Check for partner
      if (userData?.partnerId) {
        setHasPartner(true);
        const partnerDoc = await getDoc(doc(db, 'users', userData.partnerId));
        const partnerData = partnerDoc.data();
        if (partnerData?.blueprintResult) {
          setPartnerBlueprint(partnerData.blueprintResult);
        }
      }
      
      // Load daily spark
      await loadDailySpark();
      
      // Load streak data
      await loadStreakData();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailySpark = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sparksQuery = query(
        collection(db, 'dailySparks'),
        where('userId', '==', user.uid),
        where('date', '==', today),
        limit(1)
      );
      
      const sparksSnapshot = await getDocs(sparksQuery);
      if (!sparksSnapshot.empty) {
        const sparkData = sparksSnapshot.docs[0].data();
        setDailySpark({
          id: sparksSnapshot.docs[0].id,
          ...sparkData,
          createdAt: sparkData.createdAt?.toDate() || new Date()
        } as DailySpark);
      } else {
        // Generate new daily spark if none exists
        await generateDailySpark();
      }
    } catch (error) {
      console.error('Error loading daily spark:', error);
    }
  };

  const loadStreakData = async () => {
    try {
      const streakDoc = await getDoc(doc(db, 'userStats', user.uid));
      if (streakDoc.exists()) {
        const data = streakDoc.data();
        setStreakData({
          current: data.currentStreak || 0,
          longest: data.longestStreak || 0,
          lastActivity: data.lastActivity?.toDate() || new Date()
        });
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const generateDailySpark = async () => {
    // This would call your AI API to generate a personalized suggestion
    const mockSpark: DailySpark = {
      id: 'temp-' + Date.now(),
      content: "Try a 5-minute gratitude sharing session - each partner shares something they appreciate about the other while maintaining eye contact.",
      category: "Connection",
      heatLevel: "sweet",
      createdAt: new Date(),
      used: false
    };
    setDailySpark(mockSpark);
  };

  const getHeatLevelColor = (level: string) => {
    switch (level) {
      case 'sweet': return 'text-accent';
      case 'spicy': return 'text-orange-500';
      case 'steamy': return 'text-red-500';
      case 'wild': return 'text-emphasis';
      default: return 'text-accent';
    }
  };

  const getHeatLevelIcon = (level: string) => {
    switch (level) {
      case 'sweet': return '🌸';
      case 'spicy': return '🌶️';
      case 'steamy': return '🔥';
      case 'wild': return '💥';
      default: return '✨';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-serif font-bold text-primary">
                Welcome back, {user.displayName?.split(' ')[0] || 'Partner'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <UpgradeButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Spark Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-primary">Today's Spark</h2>
                  <p className="text-sm text-slate-600">Your personalized connection moment</p>
                </div>
              </div>
              {dailySpark && (
                <span className={`text-2xl ${getHeatLevelColor(dailySpark.heatLevel)}`}>
                  {getHeatLevelIcon(dailySpark.heatLevel)}
                </span>
              )}
            </div>
            
            {dailySpark ? (
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-slate-700 font-serif">
                  {dailySpark.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {dailySpark.category}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 ${getHeatLevelColor(dailySpark.heatLevel)}`}>
                      {dailySpark.heatLevel}
                    </span>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium">
                    <Play className="h-4 w-4 mr-2" />
                    Try This Spark
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Generating your personalized spark...</p>
                <div className="animate-pulse bg-slate-200 h-4 w-3/4 mx-auto rounded"></div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Blueprint Snapshot */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-semibold text-slate-900">Your Blueprint</h3>
                <Heart className="h-5 w-5 text-emphasis" />
              </div>
              
              {blueprintResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Dominant Type</span>
                    <span className="font-serif font-semibold text-primary text-lg">
                      {blueprintResult.dominantType}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(blueprintResult).map(([key, value]) => {
                      if (key === 'dominantType' || key === 'completedAt') return null;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize text-slate-600">{key}</span>
                            <span className="font-medium text-slate-900">{value}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {hasPartner && partnerBlueprint && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Compatibility Highlights</h4>
                      <p className="text-sm text-slate-600">
                        You and your partner both score high in {blueprintResult.dominantType} traits, 
                        creating natural harmony in your intimacy styles.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4">Take your Erotic Blueprint Quiz to unlock personalized insights</p>
                  <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">
                    Take Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-serif font-semibold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium text-slate-700">Chat with Seggsy</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium text-slate-700">Couple Games</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium text-slate-700">Plan Date Night</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-medium text-slate-700">Saved Favorites</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-slate-900">Connection Streak</h3>
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{streakData.current}</div>
                <div className="text-sm text-slate-600 mb-4">days in a row</div>
                <div className="text-xs text-slate-500">
                  Best streak: {streakData.longest} days
                </div>
              </div>
            </div>

            {/* Partner Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-serif font-semibold text-slate-900 mb-4">Partner Connection</h3>
              {hasPartner ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Connected</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Both blueprints completed. Ready for personalized suggestions!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Waiting for partner</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Invite your partner to unlock couple's features.
                  </p>
                  <button className="w-full bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors">
                    Send Invite
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-serif font-semibold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Completed blueprint quiz</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Saved 3 conversation starters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <span>Chatted with Seggsy AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 