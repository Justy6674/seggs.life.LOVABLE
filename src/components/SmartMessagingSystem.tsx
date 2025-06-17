'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Clock, TrendingUp } from 'lucide-react'

interface MessageContext {
  partnerLastActive?: Date
  userEngagementLevel: 'high' | 'medium' | 'low'
  partnerEngagementLevel: 'high' | 'medium' | 'low'
  relationshipPhase: 'new' | 'exploring' | 'established'
  hasCompletedAnalysis: boolean
}

interface SmartMessage {
  id: string
  content: string
  tone: 'encouraging' | 'celebratory' | 'gentle' | 'motivational'
  context: string[]
  icon: string
  color: string
}

interface SmartMessagingSystemProps {
  context: MessageContext
  location: 'dashboard' | 'analysis' | 'suggestions' | 'journey'
}

export default function SmartMessagingSystem({ context, location }: SmartMessagingSystemProps) {
  const [currentMessage, setCurrentMessage] = useState<SmartMessage | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const message = generateContextualMessage(context, location)
    setCurrentMessage(message)
  }, [context, location])

  const generateContextualMessage = (ctx: MessageContext, loc: string): SmartMessage => {
    const daysSincePartnerActive = ctx.partnerLastActive 
      ? Math.floor((Date.now() - ctx.partnerLastActive.getTime()) / (1000 * 60 * 60 * 24))
      : null

    // High engagement user with less engaged partner
    if (ctx.userEngagementLevel === 'high' && ctx.partnerEngagementLevel === 'low') {
      if (loc === 'dashboard') {
        return {
          id: 'solo_empowerment_dashboard',
          content: "You're investing in your relationship growth! These insights work whether your partner is actively exploring or not.",
          tone: 'encouraging',
          context: ['solo_value', 'empowerment'],
          icon: '🌟',
          color: 'from-blue-500 to-purple-600'
        }
      }
      if (loc === 'analysis') {
        return {
          id: 'solo_analysis_value',
          content: "Your combined analysis is ready to view anytime. Understanding your blueprint combination creates value regardless of when your partner engages.",
          tone: 'encouraging',
          context: ['analysis_ready', 'solo_value'],
          icon: '💎',
          color: 'from-green-500 to-teal-600'
        }
      }
    }

    // Both partners engaged
    if (ctx.userEngagementLevel === 'high' && ctx.partnerEngagementLevel === 'high') {
      if (loc === 'dashboard') {
        return {
          id: 'both_engaged_celebration',
          content: "Amazing! You're both actively exploring together. This kind of shared commitment creates lasting transformation.",
          tone: 'celebratory',
          context: ['mutual_engagement', 'growth'],
          icon: '🎉',
          color: 'from-pink-500 to-rose-600'
        }
      }
    }

    // Partner recently active but user hasn't been
    if (ctx.userEngagementLevel === 'low' && ctx.partnerEngagementLevel === 'medium') {
      return {
        id: 'gentle_re_engagement',
        content: "Welcome back! Your partner has been exploring some new insights. No pressure to catch up—just see what resonates with you.",
        tone: 'gentle',
        context: ['welcome_back', 'no_pressure'],
        icon: '💕',
        color: 'from-yellow-400 to-orange-500'
      }
    }

    // New relationship phase
    if (ctx.relationshipPhase === 'new') {
      return {
        id: 'new_journey_start',
        content: "You're at the beginning of an exciting journey of discovery. Every small step creates positive momentum.",
        tone: 'motivational',
        context: ['new_start', 'momentum'],
        icon: '🚀',
        color: 'from-indigo-500 to-blue-600'
      }
    }

    // Has completed analysis - celebrate
    if (ctx.hasCompletedAnalysis) {
      return {
        id: 'analysis_complete_celebration',
        content: "Your blueprint analysis is complete! This understanding becomes more valuable as you both grow and explore together.",
        tone: 'celebratory',
        context: ['analysis_complete', 'ongoing_value'],
        icon: '✨',
        color: 'from-emerald-500 to-green-600'
      }
    }

    // Default encouraging message
    return {
      id: 'default_encouragement',
      content: "Every step you take in understanding your relationship patterns creates positive change.",
      tone: 'encouraging',
      context: ['general_encouragement'],
      icon: '💫',
      color: 'from-purple-500 to-pink-600'
    }
  }

  const getPartnerActivityMessage = () => {
    const partnerLastActive = context.partnerLastActive
    if (!partnerLastActive) return null

    const daysSince = Math.floor((Date.now() - partnerLastActive.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince === 0) return "Partner active today"
    if (daysSince === 1) return "Partner active yesterday"
    if (daysSince < 7) return `Partner active ${daysSince} days ago`
    if (daysSince < 14) return "Partner active this week"
    if (daysSince < 30) return "Partner active recently"
    return null // Don't show for longer periods
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!currentMessage || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-gradient-to-r ${currentMessage.color} rounded-xl p-4 text-white shadow-lg mb-6`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-2xl">{currentMessage.icon}</span>
            <div className="flex-1">
              <p className="text-white/95 leading-relaxed">{currentMessage.content}</p>
              
              {/* Partner activity indicator (subtle, non-judgmental) */}
              {getPartnerActivityMessage() && (
                <div className="mt-2 flex items-center space-x-2">
                  <Clock size={14} className="text-white/70" />
                  <span className="text-white/70 text-sm">{getPartnerActivityMessage()}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors ml-2"
          >
            ✕
          </button>
        </div>

        {/* Context tags for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 flex flex-wrap gap-1">
            {currentMessage.context.map(tag => (
              <span key={tag} className="text-xs bg-white/20 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 