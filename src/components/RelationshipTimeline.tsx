'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/lib/database'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface TimelineEvent {
  id: string
  date: Date
  type: 'milestone' | 'assessment' | 'insight' | 'growth'
  title: string
  description: string
  icon: string
  blueprintData?: any
  compatibilityScore?: number
}

interface RelationshipTimelineProps {
  className?: string
  showHeader?: boolean
}

export default function RelationshipTimeline({ className = '', showHeader = true }: RelationshipTimelineProps) {
  const { user } = useAuth()
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [partnerData, setPartnerData] = useState<any>(null)

  useEffect(() => {
    loadTimelineData()
  }, [user])

  const loadTimelineData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Get user data
      const userProfile = await UserService.getUser(user.uid)
      setUserData(userProfile)

      // Get partner data if available
      let partnerProfile = null
      if (userProfile?.coupleId) {
        try {
          partnerProfile = await UserService.getPartnerData(user.uid)
          setPartnerData(partnerProfile)
        } catch (err) {
          console.log('Partner data not available')
        }
      }

      // Generate timeline events (in the future, this would come from database)
      const events = generateTimelineEvents(userProfile, partnerProfile)
      setTimelineEvents(events)

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading timeline data:', err)
      setIsLoading(false)
    }
  }

  const generateTimelineEvents = (user: any, partner: any): TimelineEvent[] => {
    const events: TimelineEvent[] = []
    const now = new Date()

    // User blueprint completion
    if (user?.eroticBlueprintPrimary) {
      events.push({
        id: 'user-blueprint',
        date: user.createdAt ? new Date(user.createdAt) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        type: 'assessment',
        title: 'You Discovered Your Blueprint',
        description: `Completed the Erotic Blueprint assessment and identified as ${user.eroticBlueprintPrimary}. This was the beginning of your intimate self-discovery journey.`,
        icon: '🧭',
        blueprintData: {
          primary: user.eroticBlueprintPrimary,
          secondary: user.eroticBlueprintSecondary,
          scores: user.eroticBlueprintScores
        }
      })
    }

    // Partner blueprint completion
    if (partner?.eroticBlueprintPrimary) {
      events.push({
        id: 'partner-blueprint',
        date: partner.createdAt ? new Date(partner.createdAt) : new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        type: 'assessment',
        title: `${partner.displayName} Joined Your Journey`,
        description: `${partner.displayName} completed their blueprint assessment as ${partner.eroticBlueprintPrimary}. Your combined journey of discovery began!`,
        icon: '💑',
        blueprintData: {
          primary: partner.eroticBlueprintPrimary,
          secondary: partner.eroticBlueprintSecondary,
          scores: partner.eroticBlueprintScores
        }
      })
    }

    // Combined analysis milestone
    if (user?.coupleId && partner) {
      const compatibility = calculateCompatibility(user, partner)
      events.push({
        id: 'combined-analysis',
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        type: 'milestone',
        title: 'Combined Analysis Generated',
        description: `Your ${user.eroticBlueprintPrimary} and ${partner.eroticBlueprintPrimary} blueprints combined to show ${compatibility}% compatibility. This became the foundation for your ongoing relationship insights.`,
        icon: '💕',
        compatibilityScore: compatibility
      })
    }

    // Recent engagement milestones (mock data - would be real in production)
    if (events.length > 0) {
      events.push({
        id: 'engagement-milestone',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        type: 'growth',
        title: 'Active Engagement Week',
        description: 'You both engaged with relationship insights and tools this week, strengthening your understanding of each other.',
        icon: '📈'
      })

      events.push({
        id: 'insight-application',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'insight',
        title: 'Applied Solo Insights',
        description: 'Used the understanding partner toolkit to practice appreciation techniques specific to your blueprint combination.',
        icon: '🧠'
      })

      // Future milestone
      events.push({
        id: 'future-milestone',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        type: 'milestone',
        title: 'Upcoming Check-In',
        description: 'Scheduled relationship check-in to assess growth and set new intentions together.',
        icon: '🎯'
      })
    }

    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const calculateCompatibility = (user: any, partner: any): number => {
    if (!user?.eroticBlueprintScores || !partner?.eroticBlueprintScores) return 0
    
    const blueprintTypes = ['energetic', 'sensual', 'sexual', 'kinky', 'shapeshifter'] as const
    
    let totalDifference = 0
    blueprintTypes.forEach(type => {
      const userScore = user.eroticBlueprintScores[type] || 0
      const partnerScore = partner.eroticBlueprintScores[type] || 0
      totalDifference += Math.abs(userScore - partnerScore)
    })
    
    const compatibility = Math.max(0, 100 - (totalDifference / 5))
    return Math.round(compatibility)
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

  const getEventColor = (type: string): string => {
    const colors = {
      milestone: 'from-purple-500 to-pink-500',
      assessment: 'from-blue-500 to-cyan-500',
      insight: 'from-green-500 to-emerald-500',
      growth: 'from-orange-500 to-yellow-500'
    }
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 0) return `In ${diffDays} days`
    if (diffDays < -7) return date.toLocaleDateString()
    return `${Math.abs(diffDays)} days ago`
  }

  const isFutureEvent = (date: Date): boolean => {
    return date.getTime() > new Date().getTime()
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Your Relationship Timeline</h2>
            <p className="text-gray-400">Loading your journey...</p>
          </div>
        )}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-3xl">📈</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Your Relationship Timeline
          </h1>
          <p className="text-gray-400 text-lg">
            Track your journey of intimate discovery and growth together
          </p>
        </motion.div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500"></div>

        {/* Timeline Events */}
        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-start ${isFutureEvent(event.date) ? 'opacity-70' : ''}`}
            >
              {/* Event Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-full bg-gradient-to-r ${getEventColor(event.type)} flex items-center justify-center text-white font-bold shadow-lg`}>
                <span className="text-xl">{event.icon}</span>
              </div>

              {/* Event Content */}
              <div className="ml-6 flex-1 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      isFutureEvent(event.date) 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                  {event.compatibilityScore && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{event.compatibilityScore}%</div>
                      <div className="text-xs text-gray-400">Compatibility</div>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-300 mb-4">{event.description}</p>

                {/* Blueprint Data */}
                {event.blueprintData && (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getBlueprintEmoji(event.blueprintData.primary)}</span>
                      <span className="text-white font-medium capitalize">
                        {event.blueprintData.primary}
                        {event.blueprintData.secondary && (
                          <span className="text-gray-400"> • {event.blueprintData.secondary}</span>
                        )}
                      </span>
                    </div>
                    {event.blueprintData.scores && (
                      <div className="grid grid-cols-5 gap-2 mt-3">
                        {Object.entries(event.blueprintData.scores).map(([blueprint, score]) => (
                          <div key={blueprint} className="text-center">
                            <div className="text-sm">{getBlueprintEmoji(blueprint)}</div>
                            <div className="text-xs text-gray-400">{String(score)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Future Event Actions */}
                {isFutureEvent(event.date) && (
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors duration-200">
                      Set Reminder
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors duration-200">
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: timelineEvents.length * 0.1 + 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-8 border border-purple-700/30">
            <h3 className="text-xl font-serif font-bold text-white mb-4">
              Keep Growing Together
            </h3>
            <p className="text-gray-300 mb-6">
              Your relationship timeline grows with every insight gained and connection deepened.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/relationship-insights"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                💡 Explore Insights
              </Link>
              <Link 
                href="/understanding-partner"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                🧠 Solo Toolkit
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 