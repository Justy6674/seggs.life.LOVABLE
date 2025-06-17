'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/lib/database'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface GentleReEntryFlowProps {
  className?: string
  onComplete?: () => void
}

interface UserActivity {
  lastActive: Date
  daysSinceLastActive: number
  partnerName?: string
  userBlueprint?: string
  partnerBlueprint?: string
  hasNewInsights?: boolean
}

export default function GentleReEntryFlow({ className = '', onComplete }: GentleReEntryFlowProps) {
  const { user } = useAuth()
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFlow, setShowFlow] = useState(false)

  useEffect(() => {
    checkReEntryConditions()
  }, [user])

  const checkReEntryConditions = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Get user data and activity info
      const userData = await UserService.getUser(user.uid)
      
      if (!userData) {
        setIsLoading(false)
        return
      }

      const lastActive = userData.createdAt ? new Date(userData.createdAt) : new Date()
      const daysSinceLastActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

      // Show gentle re-entry flow if user has been away for 3+ days
      if (daysSinceLastActive >= 3) {
        // Get partner data if available
        let partnerData = null
        if (userData.coupleId) {
          try {
            partnerData = await UserService.getPartnerData(user.uid)
          } catch (err) {
            console.log('Partner data not available')
          }
        }

        setActivity({
          lastActive,
          daysSinceLastActive,
          partnerName: partnerData?.displayName,
          userBlueprint: userData.eroticBlueprintPrimary,
          partnerBlueprint: partnerData?.eroticBlueprintPrimary,
          hasNewInsights: daysSinceLastActive >= 7 // Weekly insights
        })

        setShowFlow(true)
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error checking re-entry conditions:', err)
      setIsLoading(false)
    }
  }

  const getBlueprintValue = (blueprint: string): string => {
    const values = {
      energetic: 'vibrant energy and anticipation',
      sensual: 'beauty, comfort, and sensory richness',
      sexual: 'directness, passion, and physical connection',
      kinky: 'playfulness, variety, and exploration',
      shapeshifter: 'adaptability and multi-faceted connection'
    }
    return values[blueprint as keyof typeof values] || 'unique perspective'
  }

  const getBlueprintEmoji = (blueprint: string): string => {
    const emojis = {
      energetic: '⚡',
      sensual: '🌸',
      sexual: '🔥',
      kinky: '🎭',
      shapeshifter: '🦋'
    }
    return emojis[blueprint as keyof typeof emojis] || '💫'
  }

  const getWelcomeMessage = () => {
    if (!activity) return null

    const { daysSinceLastActive, partnerName, userBlueprint, partnerBlueprint } = activity

    if (daysSinceLastActive >= 14) {
      return {
        title: '🌟 Welcome Back!',
        subtitle: `It's been ${daysSinceLastActive} days since you last checked in.`,
        message: partnerName 
          ? `While you were away, ${partnerName} has been exploring your connection together. No pressure to catch up on everything—just see what feels meaningful to you right now.`
          : `Take your time reconnecting with your relationship insights. There's no rush—just explore what resonates with you today.`
      }
    } else if (daysSinceLastActive >= 7) {
      return {
        title: '💕 Good to See You Again',
        subtitle: `Welcome back after ${daysSinceLastActive} days.`,
        message: partnerName 
          ? `${partnerName} has been discovering new things about your connection. Feel free to explore at your own pace—every glimpse adds value.`
          : `Your relationship insights have been growing while you were away. Dive in wherever feels right.`
      }
    } else {
      return {
        title: '✨ You\'re Back!',
        subtitle: `It's been a few days since your last visit.`,
        message: 'No need to catch up on everything—just explore what catches your interest.'
      }
    }
  }

  const handleContinue = () => {
    setShowFlow(false)
    if (onComplete) {
      onComplete()
    }
  }

  if (isLoading || !showFlow || !activity) {
    return null
  }

  const welcomeMessage = getWelcomeMessage()
  if (!welcomeMessage) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl">💕</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">
            {welcomeMessage.title}
          </h1>
          <p className="text-gray-400">
            {welcomeMessage.subtitle}
          </p>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <p className="text-gray-300 leading-relaxed mb-6">
            {welcomeMessage.message}
          </p>

          {/* Blueprint Appreciation */}
          {activity.userBlueprint && (
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/30 mb-6">
              <h3 className="text-green-200 font-medium mb-2 flex items-center">
                {getBlueprintEmoji(activity.userBlueprint)} Your Gift to the Relationship
              </h3>
              <p className="text-green-300 text-sm">
                Your {activity.userBlueprint} blueprint brings {getBlueprintValue(activity.userBlueprint)} 
                to your connection. This is valuable whether you check in daily or occasionally.
              </p>
            </div>
          )}

          {/* What's New (if applicable) */}
          {activity.hasNewInsights && (
            <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30">
              <h3 className="text-blue-200 font-medium mb-2 flex items-center">
                💡 What's New
              </h3>
              <p className="text-blue-300 text-sm">
                {activity.partnerName 
                  ? `New insights about your ${activity.userBlueprint}${activity.partnerBlueprint ? ` + ${activity.partnerBlueprint}` : ''} connection are waiting.`
                  : 'New relationship insights have been generated based on your blueprint.'
                } No need to read everything—just browse what interests you.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            ✨ Explore What's Here
          </button>

          {activity.partnerName && (
            <Link
              href="/our-connection"
              onClick={handleContinue}
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
            >
              💕 See Your Connection
            </Link>
          )}

          <Link
            href="/understanding-partner"
            onClick={handleContinue}
            className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
          >
            🧠 Solo Insights
          </Link>

          <button
            onClick={handleContinue}
            className="w-full text-gray-400 hover:text-gray-300 py-2 transition-colors duration-200"
          >
            Skip - Go to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 