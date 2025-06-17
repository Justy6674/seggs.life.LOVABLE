'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdaptiveMessaging } from '@/hooks/useAdaptiveMessaging'
import { CouplesAnalysisService, UserService } from '@/lib/database'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { CouplesAnalysisResult } from '@/lib/firebase'

interface CombinedAnalysisHeroProps {
  className?: string
}

export default function CombinedAnalysisHero({ className = '' }: CombinedAnalysisHeroProps) {
  const { user } = useAuth()
  const { getAdaptiveMessage, partnerActivity } = useAdaptiveMessaging()
  const [analysisResult, setAnalysisResult] = useState<CouplesAnalysisResult | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [partnerData, setPartnerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analysisStatus, setAnalysisStatus] = useState<'loading' | 'no-partner' | 'partner-pending' | 'analysis-ready' | 'error'>('loading')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Get user data
      const userProfile = await UserService.getUser(user.uid)
      setUserData(userProfile)

      if (!userProfile?.coupleId) {
        setAnalysisStatus('no-partner')
        setIsLoading(false)
        return
      }

      // Check if analysis is ready
      const status = await CouplesAnalysisService.checkCoupleStatus(userProfile.coupleId)
      
      if (!status.analysisReady) {
        setAnalysisStatus('partner-pending')
        setIsLoading(false)
        return
      }

      // Load analysis and partner data
      const [result, partner] = await Promise.all([
        CouplesAnalysisService.getCouplesAnalysis(userProfile.coupleId),
        UserService.getPartnerData(user.uid)
      ])

      if (result) {
        setAnalysisResult(result)
        setPartnerData(partner)
        setAnalysisStatus('analysis-ready')
      } else {
        setAnalysisStatus('error')
      }

      setIsLoading(false)

    } catch (err) {
      console.error('Error loading combined analysis:', err)
      setAnalysisStatus('error')
      setIsLoading(false)
    }
  }

  const calculateCompatibility = (): number => {
    if (!analysisResult) return 0
    
    const { partnerA, partnerB } = analysisResult
    const blueprintTypes = ['energetic', 'sensual', 'sexual', 'kinky', 'shapeshifter'] as const
    
    let totalDifference = 0
    blueprintTypes.forEach(type => {
      totalDifference += Math.abs(partnerA.scores[type] - partnerB.scores[type])
    })
    
    // Convert to compatibility percentage (lower difference = higher compatibility)
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
    return emojis[blueprint as keyof typeof emojis] || '❓'
  }

  const getEngagementMessage = () => {
    if (!userData?.eroticBlueprintPrimary) {
      return {
        title: '🧭 Discover Your Blueprint',
        subtitle: 'Start your intimate journey with our blueprint assessment',
        action: { text: 'Take Assessment', href: '/blueprint' },
        color: 'from-blue-600 to-purple-600'
      }
    }

    if (analysisStatus === 'no-partner') {
      return {
        title: '💕 Connect with Your Partner',
        subtitle: 'Invite your partner to unlock your combined analysis',
        action: { text: 'Send Invitation', href: '/partner-connect' },
        color: 'from-pink-600 to-rose-600'
      }
    }

    if (analysisStatus === 'partner-pending') {
      return {
        title: '⏳ Analysis In Progress',
        subtitle: 'Your partner is completing their assessment. Meanwhile, explore solo insights.',
        action: { text: 'Solo Insights', href: '/understanding-partner' },
        color: 'from-yellow-600 to-orange-600'
      }
    }

    if (analysisStatus === 'analysis-ready' && analysisResult && partnerData) {
      const isUserPartnerA = analysisResult.partnerA.userId === user?.uid
      const currentUser = isUserPartnerA ? analysisResult.partnerA : analysisResult.partnerB
      const partner = isUserPartnerA ? analysisResult.partnerB : analysisResult.partnerA
      const compatibility = calculateCompatibility()

      return {
        title: `${getBlueprintEmoji(currentUser.primaryBlueprint)} + ${getBlueprintEmoji(partner.primaryBlueprint)} = ${compatibility}% Harmony`,
        subtitle: `Your ${currentUser.primaryBlueprint} nature beautifully complements ${partner.name}'s ${partner.primaryBlueprint} style`,
        action: { text: 'Explore Your Connection', href: '/our-connection' },
        color: 'from-purple-600 to-pink-600',
        showPartnerInfo: true,
        partnerName: partner.name,
        compatibility
      }
    }

    return {
      title: '🔄 Loading Your Connection',
      subtitle: 'Preparing your personalized analysis...',
      action: { text: 'Refresh', href: '/app' },
      color: 'from-gray-600 to-gray-700'
    }
  }

  const message = getEngagementMessage()

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-700/50 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <span className="text-2xl">💕</span>
          </div>
          <div className="h-6 bg-gray-700 rounded w-64 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${message.color === 'from-purple-600 to-pink-600' ? 'from-purple-900/70 to-pink-900/70' : 'from-gray-900/70 to-gray-800/70'} rounded-2xl p-8 border ${message.color === 'from-purple-600 to-pink-600' ? 'border-purple-700/50' : 'border-gray-700/50'} ${className}`}
    >
      <div className="text-center">
        {/* Status Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          {analysisStatus === 'analysis-ready' ? (
            <span className="text-3xl">💕</span>
          ) : analysisStatus === 'no-partner' ? (
            <span className="text-3xl">👥</span>
          ) : analysisStatus === 'partner-pending' ? (
            <span className="text-3xl">⏳</span>
          ) : (
            <span className="text-3xl">🧭</span>
          )}
        </div>

        {/* Main Message */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
          {message.title}
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          {message.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link 
            href={message.action.href}
            className={`bg-gradient-to-r ${message.color} hover:opacity-90 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 text-center`}
          >
            {message.action.text}
          </Link>

          {analysisStatus === 'analysis-ready' && (
            <div className="flex gap-3">
              <Link 
                href="/understanding-partner"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                🧠 Partner Toolkit
              </Link>
              <Link 
                href="/relationship-insights"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                💡 Weekly Insights
              </Link>
            </div>
          )}

          {(analysisStatus === 'no-partner' || analysisStatus === 'partner-pending') && userData?.eroticBlueprintPrimary && (
            <Link 
              href="/relationship-insights"
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              💡 Solo Insights
            </Link>
          )}
        </div>

        {/* Empowerment Message */}
        {analysisStatus !== 'analysis-ready' && userData?.eroticBlueprintPrimary && (
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-800/30">
            <p className="text-green-200 text-sm">
              💪 <strong>You're building relationship intelligence!</strong> 
              {analysisStatus === 'partner-pending' 
                ? ' Your commitment to growth strengthens your connection, even while your partner completes their journey.'
                : ' Every step you take toward understanding creates a stronger foundation for intimacy.'
              }
            </p>
          </div>
        )}

        {/* Weekly Focus (for ready analysis) */}
        {analysisStatus === 'analysis-ready' && partnerData && (
          <div className="mt-6 bg-blue-900/30 rounded-lg p-4 border border-blue-800/30">
            <h3 className="text-white font-semibold mb-2 flex items-center justify-center">
              <Image
                src="/SEGGSYCHATBOT.png"
                alt="Seggsy AI"
                width={20}
                height={20}
                className="w-5 h-5 mr-2"
              />
              This Week's Focus
            </h3>
            <p className="text-blue-200 text-sm">
              Practice appreciating {partnerData.displayName}'s {partnerData.eroticBlueprintPrimary} energy. 
              Notice how their approach to intimacy complements your {userData.eroticBlueprintPrimary} style.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 