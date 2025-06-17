'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { UserService } from '@/lib/database'

interface PartnerActivity {
  lastActive?: Date
  daysSinceLastActive: number
  isRecentlyActive: boolean
  engagementLevel: 'high' | 'moderate' | 'low' | 'unknown'
}

interface AdaptiveMessage {
  welcomeMessage: string
  encouragementMessage: string
  actionCTA: string
  tone: 'empowering' | 'appreciative' | 'gentle' | 'neutral'
}

export function useAdaptiveMessaging() {
  const { user } = useAuth()
  const [partnerActivity, setPartnerActivity] = useState<PartnerActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPartnerActivity()
  }, [user])

  const loadPartnerActivity = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Get user data to find partner
      const userData = await UserService.getUser(user.uid)
      
      if (!userData?.coupleId) {
        setPartnerActivity({
          daysSinceLastActive: 0,
          isRecentlyActive: false,
          engagementLevel: 'unknown'
        })
        setIsLoading(false)
        return
      }

      // Get partner data and activity
      const partnerData = await UserService.getPartnerData(user.uid)
      
      if (!partnerData) {
        setPartnerActivity({
          daysSinceLastActive: 0,
          isRecentlyActive: false,
          engagementLevel: 'unknown'
        })
        setIsLoading(false)
        return
      }

      const lastActive = partnerData.createdAt ? new Date(partnerData.createdAt) : null
      const daysSinceLastActive = lastActive 
        ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      const isRecentlyActive = daysSinceLastActive <= 3

      let engagementLevel: 'high' | 'moderate' | 'low' | 'unknown' = 'unknown'
      if (daysSinceLastActive <= 1) {
        engagementLevel = 'high'
      } else if (daysSinceLastActive <= 7) {
        engagementLevel = 'moderate' 
      } else if (daysSinceLastActive <= 30) {
        engagementLevel = 'low'
      }

      setPartnerActivity({
        lastActive: lastActive || undefined,
        daysSinceLastActive,
        isRecentlyActive,
        engagementLevel
      })

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading partner activity:', err)
      setPartnerActivity({
        daysSinceLastActive: 0,
        isRecentlyActive: false,
        engagementLevel: 'unknown'
      })
      setIsLoading(false)
    }
  }

  const getAdaptiveMessage = (context: 'dashboard' | 'insights' | 'connection' | 'solo'): AdaptiveMessage => {
    if (!partnerActivity) {
      return {
        welcomeMessage: 'Welcome to your relationship dashboard',
        encouragementMessage: 'You\'re building relationship intelligence',
        actionCTA: 'Explore',
        tone: 'neutral'
      }
    }

    const { engagementLevel, daysSinceLastActive } = partnerActivity

    switch (context) {
      case 'dashboard':
        return getDashboardMessage(engagementLevel, daysSinceLastActive)
      case 'insights':
        return getInsightsMessage(engagementLevel, daysSinceLastActive)
      case 'connection':
        return getConnectionMessage(engagementLevel, daysSinceLastActive)
      case 'solo':
        return getSoloMessage(engagementLevel, daysSinceLastActive)
      default:
        return {
          welcomeMessage: 'Welcome back',
          encouragementMessage: 'You\'re investing in your relationship',
          actionCTA: 'Continue',
          tone: 'empowering'
        }
    }
  }

  const getDashboardMessage = (level: string, days: number): AdaptiveMessage => {
    switch (level) {
      case 'high':
        return {
          welcomeMessage: 'You\'re both actively building your connection',
          encouragementMessage: 'Your consistent engagement is strengthening your bond',
          actionCTA: 'Keep Growing Together',
          tone: 'empowering'
        }
      case 'moderate':
        return {
          welcomeMessage: 'You\'re investing in your relationship',
          encouragementMessage: 'Your commitment to growth makes a difference, whether your partner checks in daily or weekly',
          actionCTA: 'Continue Your Journey',
          tone: 'appreciative'
        }
      case 'low':
        return {
          welcomeMessage: 'You\'re building relationship wisdom',
          encouragementMessage: `Your solo exploration strengthens your connection. Every insight you gain benefits your relationship`,
          actionCTA: 'Explore Solo Insights',
          tone: 'empowering'
        }
      default:
        return {
          welcomeMessage: 'Welcome to your relationship hub',
          encouragementMessage: 'You\'re taking meaningful steps toward deeper connection',
          actionCTA: 'Start Exploring',
          tone: 'gentle'
        }
    }
  }

  const getInsightsMessage = (level: string, days: number): AdaptiveMessage => {
    switch (level) {
      case 'high':
        return {
          welcomeMessage: 'Fresh insights for your active connection',
          encouragementMessage: 'These insights work best when both partners are engaged—perfect timing!',
          actionCTA: 'Apply Together',
          tone: 'empowering'
        }
      case 'moderate':
        return {
          welcomeMessage: 'Insights that work at your own pace',
          encouragementMessage: 'These insights are valuable whether you explore them together or solo',
          actionCTA: 'Discover More',
          tone: 'appreciative'
        }
      case 'low':
        return {
          welcomeMessage: 'Solo-friendly relationship insights',
          encouragementMessage: 'These insights are designed to be valuable even when your partner isn\'t actively participating',
          actionCTA: 'Learn & Grow',
          tone: 'empowering'
        }
      default:
        return {
          welcomeMessage: 'Personal relationship insights',
          encouragementMessage: 'Every insight you gain strengthens your connection',
          actionCTA: 'Explore Insights',
          tone: 'gentle'
        }
    }
  }

  const getConnectionMessage = (level: string, days: number): AdaptiveMessage => {
    switch (level) {
      case 'high':
        return {
          welcomeMessage: 'Your connection is thriving',
          encouragementMessage: 'You\'re both actively exploring your relationship together',
          actionCTA: 'Dive Deeper',
          tone: 'empowering'
        }
      case 'moderate':
        return {
          welcomeMessage: 'Your connection continues to grow',
          encouragementMessage: 'Connection isn\'t about constant activity—it\'s about meaningful moments',
          actionCTA: 'Explore Your Bond',
          tone: 'appreciative'
        }
      case 'low':
        return {
          welcomeMessage: 'Understanding your connection',
          encouragementMessage: 'Your investment in understanding deepens your bond, regardless of participation timing',
          actionCTA: 'Keep Exploring',
          tone: 'empowering'
        }
      default:
        return {
          welcomeMessage: 'Discovering your connection',
          encouragementMessage: 'Every step toward understanding creates stronger intimacy',
          actionCTA: 'Learn More',
          tone: 'gentle'
        }
    }
  }

  const getSoloMessage = (level: string, days: number): AdaptiveMessage => {
    switch (level) {
      case 'high':
        return {
          welcomeMessage: 'Solo insights for your active relationship',
          encouragementMessage: 'Perfect! These solo tools complement your active partnership',
          actionCTA: 'Enhance Your Connection',
          tone: 'empowering'
        }
      case 'moderate':
        return {
          welcomeMessage: 'Tools for independent relationship growth',
          encouragementMessage: 'You\'re building skills and insights that benefit your relationship',
          actionCTA: 'Continue Growing',
          tone: 'appreciative'
        }
      case 'low':
        return {
          welcomeMessage: 'Solo relationship intelligence',
          encouragementMessage: 'You\'re strengthening your relationship foundation through solo exploration—this is valuable work',
          actionCTA: 'Build Understanding',
          tone: 'empowering'
        }
      default:
        return {
          welcomeMessage: 'Personal relationship development',
          encouragementMessage: 'Solo growth strengthens every relationship',
          actionCTA: 'Start Learning',
          tone: 'gentle'
        }
    }
  }

  const getEncouragementByTone = (tone: 'empowering' | 'appreciative' | 'gentle' | 'neutral'): string[] => {
    switch (tone) {
      case 'empowering':
        return [
          'You\'re building something beautiful',
          'Your commitment makes a real difference',
          'You\'re investing in what matters most',
          'Every step forward strengthens your bond'
        ]
      case 'appreciative':
        return [
          'Your efforts don\'t go unnoticed',
          'Thank you for prioritizing your relationship',
          'You\'re doing important work here',
          'Your dedication is admirable'
        ]
      case 'gentle':
        return [
          'Take your time—there\'s no rush',
          'Every small step counts',
          'You\'re exactly where you need to be',
          'Progress happens at your own pace'
        ]
      default:
        return [
          'You\'re on a meaningful journey',
          'Relationships grow with intention',
          'Every insight adds value',
          'You\'re building understanding'
        ]
    }
  }

  return {
    partnerActivity,
    isLoading,
    getAdaptiveMessage,
    getEncouragementByTone,
    refresh: loadPartnerActivity
  }
} 