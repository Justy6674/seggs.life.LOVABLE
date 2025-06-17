"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../hooks/useUserData'
import AppLayout from '../../components/navigation/AppLayout'
import Auth from '../../components/Auth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import CombinedAnalysisHero from '@/components/CombinedAnalysisHero'
import { initializeUserSubscription, getUserSubscription, hasActiveAccess, getTrialDaysRemaining } from '@/lib/subscription-plans'
import SubscriptionGate from '@/components/SubscriptionGate'
import PartnerInvitation from '@/components/PartnerInvitation'
import { Crown, Lock, Zap } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface DailySpark {
  content: string
  emoji: string
  title: string
  estimatedTime: string
  category: string
}

export default function AppPage() {
  const { user } = useAuth()
  const { userData, loading, error } = useUserData()
  const [dailySpark, setDailySpark] = useState<DailySpark | null>(null)
  const [loadingSpark, setLoadingSpark] = useState(false)
  const [sparkError, setSparkError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [suggestionHistory, setSuggestionHistory] = useState<string[]>([])
  const [currentFilters, setCurrentFilters] = useState({
    timeAvailable: '15min',
    energyLevel: 'medium',
    mood: 'any'
  })

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  // Initialize subscription for new users and check access
  useEffect(() => {
    async function checkSubscription() {
      if (!user) return

      try {
        // Initialize subscription for new users (starts free trial)
        const sub = await initializeUserSubscription(user.uid)
        setSubscription(sub)
        const accessResult = await hasActiveAccess(sub, user.uid)
        setHasAccess(accessResult)
        setTrialDaysRemaining(getTrialDaysRemaining(sub))
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }

    checkSubscription()
  }, [user])

  // Helper functions for special spark types that require premium access
  const canAccessSpecialSpark = (mood: string) => {
    // All special sparks require subscription after trial
    return hasAccess
  }

  // Helper function to get weekly usage count
  const getWeeklyUsageCount = () => {
    const weekStart = getWeekStart()
    const usageKey = `usage_${user?.uid}_${weekStart.toISOString().split('T')[0]}`
    return parseInt(localStorage.getItem(usageKey) || '0')
  }

  // Helper function to increment weekly usage
  const incrementWeeklyUsage = () => {
    const weekStart = getWeekStart()
    const usageKey = `usage_${user?.uid}_${weekStart.toISOString().split('T')[0]}`
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0')
    const newUsage = currentUsage + 1
    localStorage.setItem(usageKey, newUsage.toString())
  }

  // Helper function to get week start
  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToSubtract)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  // Check if user can make AI suggestion
  const canMakeAISuggestion = () => {
    if (!subscription) return { allowed: false, reason: 'Loading...' }
    
    if (subscription.AI_SUGGESTIONS_PER_WEEK === -1) {
      return { allowed: true } // Unlimited for premium
    }
    
    const remaining = subscription.AI_SUGGESTIONS_PER_WEEK - getWeeklyUsageCount()
    if (remaining <= 0) {
      return { 
        allowed: false, 
        reason: `You've used all ${subscription.AI_SUGGESTIONS_PER_WEEK} free AI suggestions this week. Upgrade to Premium for unlimited suggestions!`
      }
    }
    
    return { allowed: true, remaining }
  }

  // Show upgrade modal
  const showUpgrade = (reason: string) => {
    // Implementation of showUpgrade function
  }

  useEffect(() => {
    if (userData?.eroticBlueprintPrimary) {
      generateDailySpark(userData)
    }
  }, [userData])

  const generateDailySpark = async (user: any) => {
    // Check if user can make suggestion
    const canSuggest = canMakeAISuggestion()
    if (!canSuggest.allowed) {
      showUpgrade(canSuggest.reason || 'Upgrade required')
      return
    }

    setLoadingSpark(true)
    try {
      // Get suggestion history to avoid repeats
      const storedHistory = JSON.parse(localStorage.getItem('suggestionHistory') || '[]')
      
      // Add seasonal/contextual data
      const now = new Date()
      const season = getSeasonFromDate(now)
      const timeOfDay = getTimeOfDay(now)
      const isWeekend = now.getDay() === 0 || now.getDay() === 6
      const isHoliday = checkIfHoliday(now)
      
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerA: {
            primaryType: user.eroticBlueprintPrimary,
            secondaryType: user.eroticBlueprintSecondary || user.eroticBlueprintPrimary,
            scores: user.eroticBlueprintScores || {}
          },
          partnerB: {
            primaryType: user.eroticBlueprintPrimary,
            secondaryType: user.eroticBlueprintSecondary || user.eroticBlueprintPrimary,
            scores: user.eroticBlueprintScores || {}
          },
          heatLevel: 'flirty',
          suggestionType: 'daily_spark',
          userId: user.id,
          filters: currentFilters,
          excludeHistory: storedHistory.slice(-50), // Last 50 to avoid repeats
          contextualData: {
            season,
            timeOfDay,
            isWeekend,
            isHoliday,
            currentDate: now.toISOString().split('T')[0]
          }
        }),
      })

      const data = await response.json()
      if (data.success) {
        const newSuggestion = {
          content: data.suggestion.content,
          emoji: data.suggestion.emoji,
          title: data.suggestion.title,
          estimatedTime: data.suggestion.estimatedTime,
          category: 'Daily Spark'
        }
        
        setDailySpark(newSuggestion)
        
        // Track usage for non-premium users
        if (!hasAccess) {
          incrementWeeklyUsage()
        }
        
        // Add to history
        const suggestionId = newSuggestion.title + newSuggestion.content.substring(0, 50)
        const updatedHistory = [...storedHistory, suggestionId].slice(-100) // Keep last 100
        localStorage.setItem('suggestionHistory', JSON.stringify(updatedHistory))
        setSuggestionHistory(updatedHistory)
      }
    } catch (error) {
      console.error('Error generating daily spark:', error)
      // Fallback suggestion
      setDailySpark({
        content: "Take a moment to look into each other's eyes and share one thing you appreciate about your partner today.",
        emoji: '💕',
        title: "Today's Connection",
        estimatedTime: '5 min',
        category: 'Daily Spark'
      })
    } finally {
      setLoadingSpark(false)
    }
  }

  // Helper functions for contextual awareness
  const getSeasonFromDate = (date: Date) => {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  const checkIfHoliday = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // Basic holiday detection (can be expanded)
    const holidays = [
      { month: 2, day: 14 }, // Valentine's Day
      { month: 12, day: 25 }, // Christmas
      { month: 1, day: 1 },   // New Year's Day
      { month: 10, day: 31 }, // Halloween
    ]
    
    return holidays.some(h => h.month === month && h.day === day)
  }

  const getNewSpark = () => {
    if (userData) {
      generateDailySpark(userData)
    }
  }

  const generateSpecialSpark = async (mood: 'romantic' | 'playful' | 'sensual') => {
    if (!userData) return
    
    // Check if sensual mood requires premium
    if (mood === 'sensual' && !hasAccess) {
      showUpgrade('Sensual suggestions with spicy heat level are a Premium feature. Unlock passionate suggestions tailored to your Blueprint!')
      return
    }
    
    // Check usage limits for non-premium users
    if (!hasAccess) {
      const canSuggest = canMakeAISuggestion()
      if (!canSuggest.allowed) {
        showUpgrade(canSuggest.reason || 'Upgrade required')
        return
      }
    }
    
    setLoadingSpark(true)
    try {
      // Get suggestion history to avoid repeats
      const storedHistory = JSON.parse(localStorage.getItem('suggestionHistory') || '[]')
      
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          heatLevel: mood === 'romantic' ? 'sweet' : mood === 'playful' ? 'flirty' : 'spicy',
          suggestionType: `${mood}_spark`,
          userId: userData.id,
          mood: mood,
          filters: currentFilters,
          excludeHistory: storedHistory.slice(-50)
        }),
      })

      const data = await response.json()
      if (data.success) {
        const newSuggestion = {
          content: data.suggestion.content,
          emoji: data.suggestion.emoji,
          title: data.suggestion.title,
          estimatedTime: data.suggestion.estimatedTime,
          category: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Spark`
        }
        
        setDailySpark(newSuggestion)
        
        // Track usage for non-premium users
        if (!hasAccess) {
          incrementWeeklyUsage()
        }
        
        // Add to history
        const suggestionId = newSuggestion.title + newSuggestion.content.substring(0, 50)
        const updatedHistory = [...storedHistory, suggestionId].slice(-100)
        localStorage.setItem('suggestionHistory', JSON.stringify(updatedHistory))
        setSuggestionHistory(updatedHistory)
      }
    } catch (error) {
      console.error('Error generating special spark:', error)
      // Fallback suggestions based on mood
      const fallbacks = {
        romantic: {
          content: "Create a cozy atmosphere with candles and soft music. Share three things you love about each other while slow dancing in your living room.",
          emoji: '🌹',
          title: "Romantic Evening",
          estimatedTime: '20 min'
        },
        playful: {
          content: "Have a pillow fight, then collapse together laughing. Share silly childhood stories and recreate your favorite dance moves.",
          emoji: '😏',
          title: "Playful Connection",
          estimatedTime: '15 min'
        },
        sensual: {
          content: "Take turns giving each other a slow, mindful massage with your favorite oils. Focus on touch, breathing, and being present together.",
          emoji: '🔥',
          title: "Sensual Touch",
          estimatedTime: '30 min'
        }
      }
      
      const fallback = fallbacks[mood]
      setDailySpark({
        ...fallback,
        category: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Spark`
      })
    } finally {
      setLoadingSpark(false)
    }
  }

  const generateMoreLikeThis = async () => {
    if (!userData || !dailySpark) return
    
    setLoadingSpark(true)
    try {
      // Track analytics event for "More Like This" usage - key engagement metric
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'more_like_this_clicked',
            userId: userData.id,
            properties: {
              originalCategory: dailySpark.category,
              userBlueprint: userData.eroticBlueprintPrimary,
              estimatedTime: dailySpark.estimatedTime,
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (analyticsError) {
        console.log('Analytics tracking failed:', analyticsError)
      }
      
      // Get suggestion history and favorites for context
      const storedHistory = JSON.parse(localStorage.getItem('suggestionHistory') || '[]')
      const favorites = JSON.parse(localStorage.getItem('suggestionFeedback') || '[]')
        .filter((f: any) => f.feedback === 'love')
      
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          suggestionType: 'similar_suggestion',
          userId: userData.id,
          currentSuggestion: {
            title: dailySpark.title,
            content: dailySpark.content,
            category: dailySpark.category,
            estimatedTime: dailySpark.estimatedTime
          },
          favorites: favorites.slice(-10), // Recent favorites for preference learning
          filters: currentFilters,
          excludeHistory: storedHistory.slice(-50)
        }),
      })

      const data = await response.json()
      if (data.success) {
        const newSuggestion = {
          content: data.suggestion.content,
          emoji: data.suggestion.emoji,
          title: data.suggestion.title,
          estimatedTime: data.suggestion.estimatedTime,
          category: 'Similar Suggestion'
        }
        
        setDailySpark(newSuggestion)
        
        // Add to history
        const suggestionId = newSuggestion.title + newSuggestion.content.substring(0, 50)
        const updatedHistory = [...storedHistory, suggestionId].slice(-100)
        localStorage.setItem('suggestionHistory', JSON.stringify(updatedHistory))
        setSuggestionHistory(updatedHistory)
      }
    } catch (error) {
      console.error('Error generating similar suggestion:', error)
      // Fallback to regular new spark
      getNewSpark()
    } finally {
      setLoadingSpark(false)
    }
  }

  const handleFeedback = async (feedback: 'love' | 'not-for-us') => {
    if (!dailySpark || !userData) return
    
    try {
      // Enhanced feedback data for learning
      const feedbackData = {
        suggestionId: dailySpark.title + dailySpark.content.substring(0, 50),
        feedback: feedback,
        timestamp: new Date().toISOString(),
        category: dailySpark.category,
        userBlueprint: userData.eroticBlueprintPrimary,
        title: dailySpark.title,
        content: dailySpark.content,
        emoji: dailySpark.emoji,
        estimatedTime: dailySpark.estimatedTime,
        filters: currentFilters,
        contextualData: {
          season: getSeasonFromDate(new Date()),
          timeOfDay: getTimeOfDay(new Date()),
          isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6
        }
      }
      
      // Track analytics event for suggestion feedback - key engagement metric
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'suggestion_feedback',
            userId: userData.id,
            properties: {
              feedback: feedback,
              category: dailySpark.category,
              userBlueprint: userData.eroticBlueprintPrimary,
              estimatedTime: dailySpark.estimatedTime,
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (analyticsError) {
        console.log('Analytics tracking failed:', analyticsError)
      }
      
      // Store feedback locally
      const existingFeedback = JSON.parse(localStorage.getItem('suggestionFeedback') || '[]')
      existingFeedback.push(feedbackData)
      localStorage.setItem('suggestionFeedback', JSON.stringify(existingFeedback))
      
      // Analyze patterns for learning
      const recentFeedback = existingFeedback.slice(-20) // Last 20 for pattern analysis
      const loveRate = recentFeedback.filter((f: any) => f.feedback === 'love').length / recentFeedback.length
      
      // Store user preference patterns
      const preferenceData = {
        overallSatisfaction: loveRate,
        preferredCategories: getPreferredCategories(existingFeedback),
        preferredTimeframes: getPreferredTimeframes(existingFeedback),
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('userPreferences', JSON.stringify(preferenceData))
      
      // Show feedback confirmation with learning hint
      if (feedback === 'love') {
        console.log('💕 Added to favorites! We\'ll suggest more like this.')
      } else {
        console.log('📝 Noted your preference. We\'ll adjust future suggestions.')
      }
      
      // Auto-generate new suggestion after feedback
      setTimeout(() => {
        getNewSpark()
      }, 500)
      
    } catch (error) {
      console.error('Error saving feedback:', error)
    }
  }

  // Helper functions for preference learning
  const getPreferredCategories = (feedbackArray: any[]) => {
    const loved = feedbackArray.filter(f => f.feedback === 'love')
    const categoryCounts: Record<string, number> = {}
    
    loved.forEach(f => {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1
    })
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)
  }

  const getPreferredTimeframes = (feedbackArray: any[]) => {
    const loved = feedbackArray.filter(f => f.feedback === 'love')
    const timeCounts: Record<string, number> = {}
    
    loved.forEach(f => {
      if (f.estimatedTime) {
        timeCounts[f.estimatedTime] = (timeCounts[f.estimatedTime] || 0) + 1
      }
    })
    
    return Object.entries(timeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([time]) => time)
  }

  // Get user's first name for personalization
  const getFirstName = () => {
    if (userData?.displayName) {
      return userData.displayName.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'there'
  }

  // Explain why suggestions work for specific blueprint types
  const getBlueprintReasoning = (blueprint: string, category: string) => {
    const blueprintInsights: Record<string, Record<string, string>> = {
      energetic: {
        default: "As an Energetic type, you thrive on anticipation and mental foreplay. This suggestion builds excitement through the mind-body connection.",
        'Romantic Spark': "Romance for you is about the energy exchange and emotional buildup that creates delicious anticipation.",
        'Playful Spark': "Playful activities feed your need for teasing energy and the thrill of chase that ignites your passion.",
        'Sensual Spark': "This bridges to your sensual side, helping you appreciate slower buildups while honoring your energetic nature."
      },
      sensual: {
        default: "As a Sensual type, you need all your senses engaged to feel deeply connected. This suggestion creates the rich sensory experience you crave.",
        'Romantic Spark': "Romance for you is about creating beautiful environments and tender touch that awakens all your senses.",
        'Playful Spark': "This adds gentle playfulness while maintaining the sensory richness and emotional safety you need.",
        'Sensual Spark': "Perfect for your blueprint - this suggestion is designed to create the full sensory immersion you love."
      },
      sexual: {
        default: "As a Sexual type, you appreciate directness and physical connection. This suggestion gets straight to passionate intimacy.",
        'Romantic Spark': "Romance for you can be beautifully direct - creating intimacy through clear, passionate connection.",
        'Playful Spark': "This adds fun while keeping things straightforward and physically engaging in your preferred style.",
        'Sensual Spark': "This helps bridge to sensuality while honoring your need for direct, passionate physical connection."
      },
      kinky: {
        default: "As a Kinky type, you're energized by psychological play and breaking routine. This suggestion adds the element of 'naughty' you love.",
        'Romantic Spark': "Romance for you can include power dynamics and psychological elements that make it deliciously complex.",
        'Playful Spark': "Perfect for your blueprint - this adds the element of taboo and psychological play that excites you.",
        'Sensual Spark': "This creates intrigue while building sensual elements, appealing to your love of variety and depth."
      },
      shapeshifter: {
        default: "As a Shapeshifter, you love variety and can embody different blueprint energies. This suggestion offers flexibility to adapt to your current mood.",
        'Romantic Spark': "This gives you options to express romance in whatever way feels authentic to your current energy.",
        'Playful Spark': "Perfect for your adaptable nature - you can make this as energetic, sensual, or kinky as feels right.",
        'Sensual Spark': "This allows you to explore sensuality while maintaining the variety and choice that energizes you."
      }
    }

    const insights = blueprintInsights[blueprint]
    return insights?.[category] || insights?.default || "This suggestion is tailored to create deeper intimacy based on your unique blueprint preferences."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wheat">Loading your member area...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
            Private Member Area
          </h1>
          <p className="text-wheat/70 mb-6">
            This is a private intimacy app for couples. Please sign in to access your member dashboard and personal content.
          </p>
          <div className="bg-wheat/10 border border-wheat/20 rounded-lg p-4 mb-6">
            <p className="text-wheat/80 text-sm">
              <strong>New here?</strong> You'll need to create an account, take the Erotic Blueprint quiz, and connect with your partner to access all features.
            </p>
          </div>
          <Auth />
        </div>
      </div>
    )
  }

  return (
    <AppLayout 
      headerProps={{
        title: 'Dashboard',
        subtitle: 'Your intimate connection hub',
        icon: '🏠',
        showBack: false
      }}
    >
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          {/* Combined Analysis Hero - New centerpiece */}
          <CombinedAnalysisHero className="mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Daily Spark & Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* TRIAL STATUS BANNER */}
              {subscription?.status === 'trial' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-wheat/30 text-center"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <h3 className="text-lg font-semibold text-wheat">
                        {trialDaysRemaining > 0 ? `${trialDaysRemaining} Days Left` : 'Trial Ended'}
                      </h3>
                      <p className="text-wheat/70 text-sm">
                        {trialDaysRemaining > 0 
                          ? 'in your free trial - enjoy full access!'
                          : 'Subscribe to continue your intimate journey'
                        }
                      </p>
                    </div>
                    {trialDaysRemaining <= 2 && (
                      <Link 
                        href="/subscription"
                        className="bg-deepRed hover:bg-deepRed/90 text-wheat px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                      >
                        {trialDaysRemaining > 0 ? 'Subscribe' : 'Upgrade Now'}
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CONTEXTUAL FILTERS */}
              {userData?.eroticBlueprintPrimary && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-gradient-to-r from-primary/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-6 border border-wheat/20"
                >
                  <h3 className="text-lg font-semibold text-wheat mb-4 text-center">Customize Your Experience</h3>
                  <div className="grid grid-cols-3 gap-4">
                    
                    {/* Time Available */}
                    <div>
                      <label className="text-wheat/80 text-sm font-medium mb-2 block">⏰ Time Available</label>
                      <select 
                        value={currentFilters.timeAvailable}
                        onChange={(e) => setCurrentFilters(prev => ({...prev, timeAvailable: e.target.value}))}
                        className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm focus:outline-none focus:border-wheat/50"
                      >
                        <option value="5min">5 minutes</option>
                        <option value="15min">15 minutes</option>
                        <option value="30min">30 minutes</option>
                        <option value="1hour">1+ hours</option>
                      </select>
                    </div>

                    {/* Energy Level */}
                    <div>
                      <label className="text-wheat/80 text-sm font-medium mb-2 block">⚡ Energy Level</label>
                      <select 
                        value={currentFilters.energyLevel}
                        onChange={(e) => setCurrentFilters(prev => ({...prev, energyLevel: e.target.value}))}
                        className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm focus:outline-none focus:border-wheat/50"
                      >
                        <option value="low">Relaxed</option>
                        <option value="medium">Moderate</option>
                        <option value="high">High Energy</option>
                      </select>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="text-wheat/80 text-sm font-medium mb-2 block">💫 Mood</label>
                      <select 
                        value={currentFilters.mood}
                        onChange={(e) => setCurrentFilters(prev => ({...prev, mood: e.target.value}))}
                        className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm focus:outline-none focus:border-wheat/50"
                      >
                        <option value="any">Surprise me</option>
                        <option value="romantic">Romantic</option>
                        <option value="playful">Playful</option>
                        <option value="sensual">Sensual</option>
                        <option value="adventurous">Adventurous</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DAILY SPARK CARD - FRONT AND CENTER */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/30"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-serif font-bold text-wheat mb-2">✨ Today's Spark</h2>
                  <p className="text-wheat/70">Your personalized daily suggestion</p>
                </div>

                {userData?.eroticBlueprintPrimary ? (
                  <div className="space-y-6">
                    {loadingSpark ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-wheat/70">Generating your personalized spark...</p>
                      </div>
                    ) : dailySpark ? (
                      <div className="bg-wheat/10 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-4">{dailySpark.emoji}</div>
                        <h3 className="text-xl font-semibold text-wheat mb-4">{dailySpark.title}</h3>
                        <p className="text-wheat/90 text-lg leading-relaxed mb-4">{dailySpark.content}</p>
                        
                        {/* Why this works for you explanation */}
                        {userData?.eroticBlueprintPrimary && (
                          <div className="bg-deepRed/20 rounded-lg p-4 mb-4 border border-deepRed/30">
                            <h4 className="text-deepRed text-sm font-semibold mb-2">💡 Why this works for you:</h4>
                            <p className="text-wheat/80 text-sm">
                              {getBlueprintReasoning(userData.eroticBlueprintPrimary, dailySpark.category)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-center gap-4 text-sm text-wheat/70 mb-6">
                          <span>⏱️ {dailySpark.estimatedTime}</span>
                          <span>•</span>
                          <span>🎯 {userData.eroticBlueprintPrimary} Blueprint</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3 justify-center">
                            <button 
                              onClick={() => handleFeedback('love')}
                              className="bg-deepRed hover:bg-deepRed/90 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                            >
                              💕 Love it!
                            </button>
                            <button 
                              onClick={() => handleFeedback('not-for-us')}
                              className="bg-wheat/20 hover:bg-wheat/30 text-wheat px-4 py-3 rounded-xl font-medium transition-all duration-300"
                            >
                              😐 Not for us
                            </button>
                            <button 
                              onClick={generateMoreLikeThis}
                              className="bg-emerald-600/60 hover:bg-emerald-600/80 text-wheat px-6 py-3 rounded-xl font-medium transition-all duration-300"
                            >
                              ✨ More like this
                            </button>
                            <button 
                              onClick={getNewSpark}
                              className="bg-burgundy/60 hover:bg-burgundy/80 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                            >
                              🎲 Another
                            </button>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => generateSpecialSpark('romantic')}
                              className="bg-burgundy/60 hover:bg-burgundy/80 text-wheat px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                            >
                              🌹 Romantic
                            </button>
                            <button 
                              onClick={() => generateSpecialSpark('playful')}
                              className="bg-primary/60 hover:bg-primary/80 text-wheat px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                            >
                              😏 Playful
                            </button>
                            <SubscriptionGate 
                              feature="Sensual Suggestions"
                              fallback={
                                <div className="relative">
                                  <button 
                                    disabled
                                    className="bg-deepRed/30 text-wheat/50 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed relative"
                                  >
                                    🔥 Sensual
                                    <Lock className="w-3 h-3 absolute top-1 right-1" />
                                  </button>
                                </div>
                              }
                            >
                              <button 
                                onClick={() => generateSpecialSpark('sensual')}
                                className="bg-deepRed/60 hover:bg-deepRed/80 text-wheat px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                              >
                                🔥 Sensual
                              </button>
                            </SubscriptionGate>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <button 
                          onClick={getNewSpark}
                          className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                        >
                          Generate Today's Spark
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🧭</div>
                    <h3 className="text-xl font-semibold text-wheat mb-4">Complete Your Blueprint First</h3>
                    <p className="text-wheat/70 mb-6">Take your Erotic Blueprint assessment to unlock personalized daily sparks</p>
                    <Link 
                      href="/test-quiz"
                      className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
                    >
                      Take Blueprint Quiz
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* CONTENT MODULES */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20"
              >
                <h2 className="text-2xl font-serif font-bold text-wheat mb-6 text-center">
                  {userData?.eroticBlueprintPrimary ? 
                    `Perfect for ${userData.eroticBlueprintPrimary} Types` : 
                    'Explore Together'
                  }
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  <Link 
                    href="/boudoir"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3">🎲</div>
                    <h3 className="text-wheat font-semibold mb-2">Playful Games</h3>
                    <p className="text-wheat/60 text-sm">
                      {userData?.eroticBlueprintPrimary === 'energetic' ? 
                        'Perfect for your energy!' : 
                        userData?.eroticBlueprintPrimary === 'sensual' ?
                        'Build up your energy' :
                        'Truth or dare, challenges'
                      }
                    </p>
                    {userData?.eroticBlueprintPrimary === 'energetic' && (
                      <div className="text-xs text-green-400 mt-1">✨ Blueprint Match</div>
                    )}
                  </Link>

                  <Link 
                    href="/coaching"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3">💬</div>
                    <h3 className="text-wheat font-semibold mb-2">Deep Talk</h3>
                    <p className="text-wheat/60 text-sm">
                      {userData?.eroticBlueprintPrimary === 'emotional' ? 
                        'Your specialty!' : 
                        'Emotional intimacy'
                      }
                    </p>
                    {userData?.eroticBlueprintPrimary === 'emotional' && (
                      <div className="text-xs text-green-400 mt-1">✨ Blueprint Match</div>
                    )}
                  </Link>

                  <Link 
                    href="/explore"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3">🕯️</div>
                    <h3 className="text-wheat font-semibold mb-2">Sensory Play</h3>
                    <p className="text-wheat/60 text-sm">
                      {userData?.eroticBlueprintPrimary === 'sensual' ? 
                        'Made for you!' : 
                        'Touch, massage, senses'
                      }
                    </p>
                    {userData?.eroticBlueprintPrimary === 'sensual' && (
                      <div className="text-xs text-green-400 mt-1">✨ Blueprint Match</div>
                    )}
                  </Link>

                  <Link 
                    href="/boudoir"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3">🎭</div>
                    <h3 className="text-wheat font-semibold mb-2">Fantasy Builder</h3>
                    <p className="text-wheat/60 text-sm">
                      {userData?.eroticBlueprintPrimary === 'kinky' ? 
                        'Your playground!' : 
                        'Roleplay scenarios'
                      }
                    </p>
                    {userData?.eroticBlueprintPrimary === 'kinky' && (
                      <div className="text-xs text-green-400 mt-1">✨ Blueprint Match</div>
                    )}
                  </Link>

                  <Link 
                    href="/ai-suggestions"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3 flex justify-center">
                      <Image
                        src="/SEGGSYCHATBOT.png"
                        alt="AI Suggestions"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <h3 className="text-wheat font-semibold mb-2">AI Suggestions</h3>
                    <p className="text-wheat/60 text-sm">
                      {userData?.eroticBlueprintPrimary ? 
                        `${userData.eroticBlueprintPrimary} ideas` : 
                        'Personalized ideas'
                      }
                    </p>
                    {userData?.eroticBlueprintPrimary && (
                      <div className="text-xs text-green-400 mt-1">✨ Blueprint Match</div>
                    )}
                  </Link>

                  <Link 
                    href="/favorites"
                    className="p-6 bg-primary/40 rounded-xl border border-wheat/10 hover:border-wheat/30 transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl mb-3">💖</div>
                    <h3 className="text-wheat font-semibold mb-2">Saved Ideas</h3>
                    <p className="text-wheat/60 text-sm">Your favorites collection</p>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Blueprint & Progress */}
            <div className="space-y-8">
              
              {/* Blueprint Snapshot */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-burgundy/30 to-primary/30 backdrop-blur-sm rounded-3xl p-6 border border-wheat/20"
              >
                <h3 className="text-xl font-serif font-bold text-wheat mb-4 text-center">Your Blueprint</h3>
                
                {userData?.eroticBlueprintPrimary ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-deepRed/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Image
                        src="/SEGGSYCHATBOT.png"
                        alt="Your Blueprint"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <h4 className="text-lg font-semibold text-wheat capitalize mb-2">
                      {userData.eroticBlueprintPrimary}
                    </h4>
                    {userData.eroticBlueprintSecondary && (
                      <p className="text-wheat/70 text-sm mb-3">
                        + {userData.eroticBlueprintSecondary}
                      </p>
                    )}
                    <Link 
                      href="/blueprint-combo"
                      className="text-wheat/70 hover:text-wheat text-sm transition-colors"
                    >
                      View Combination Insights →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-wheat/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🧭</span>
                    </div>
                    <p className="text-wheat/70 text-sm mb-3">Discover your unique intimacy style</p>
                    <Link 
                      href="/test-quiz"
                      className="text-deepRed hover:text-deepRed/80 text-sm font-semibold transition-colors"
                    >
                      Take Assessment →
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Journey Progress */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-burgundy/30 to-primary/30 backdrop-blur-sm rounded-3xl p-6 border border-wheat/20"
              >
                <h3 className="text-xl font-serif font-bold text-wheat mb-4 text-center">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-wheat/80 text-sm">Blueprint Assessment</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      userData?.eroticBlueprintPrimary ? 'bg-green-600 text-white' : 'bg-wheat/20 text-wheat/60'
                    }`}>
                      {userData?.eroticBlueprintPrimary ? '✓' : '○'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wheat/80 text-sm">Partner Connection</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      userData?.partnerId ? 'bg-green-600 text-white' : 'bg-wheat/20 text-wheat/60'
                    }`}>
                      {userData?.partnerId ? '✓' : '○'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wheat/80 text-sm">Daily Sparks</span>
                    <div className="bg-wheat/20 text-wheat/60 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      3
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Partner Connection */}
              {!userData?.partnerId && userData?.eroticBlueprintPrimary && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <PartnerInvitation />
                </motion.div>
              )}

              {/* Seggsy AI */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-3xl p-6 border border-wheat/20"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/SEGGSYCHATBOT.png"
                      alt="Seggsy"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-wheat mb-2">Seggsy AI Assistant</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    Your private AI companion for personalized intimacy guidance
                  </p>
                  <div className="text-wheat/60 text-xs">
                    Look for the floating bubble →
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 