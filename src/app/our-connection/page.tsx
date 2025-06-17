'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CouplesAnalysisService, UserService } from '@/lib/database'
import AppLayout from '@/components/navigation/AppLayout'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { CouplesAnalysisResult } from '@/lib/firebase'

export default function OurConnectionPage() {
  const { user, loading: authLoading } = useAuth()
  const [analysisResult, setAnalysisResult] = useState<CouplesAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadConnectionAnalysis()
  }, [user])

  const refreshAnalysis = async () => {
    setIsRefreshing(true)
    await loadConnectionAnalysis()
    setIsRefreshing(false)
  }

  const loadConnectionAnalysis = async () => {
    if (!user) return

    try {
      if (!isRefreshing) {
        setIsLoading(true)
      }
      setError(null)

      // Get user data to find couple ID
      const userProfile = await UserService.getUser(user.uid)
      setUserData(userProfile)

      if (!userProfile?.coupleId) {
        setError('No partner connection found. Complete your blueprint and connect with your partner to see your combined analysis.')
        setIsLoading(false)
        return
      }

      // Check if analysis is ready
      const status = await CouplesAnalysisService.checkCoupleStatus(userProfile.coupleId)
      
      if (!status.analysisReady) {
        if (!status.partnerAComplete || !status.partnerBComplete) {
          setError('Waiting for both partners to complete their blueprints...')
        } else {
          setError('Your analysis is being generated... Please check back in a few minutes!')
        }
        setIsLoading(false)
        return
      }

      // Load the analysis
      const result = await CouplesAnalysisService.getCouplesAnalysis(userProfile.coupleId)
      
      if (!result) {
        setError('Analysis not found. Please try again later.')
        setIsLoading(false)
        return
      }

      setAnalysisResult(result)
      setIsLoading(false)
      setLastUpdated(new Date())

    } catch (err) {
      console.error('Error loading connection analysis:', err)
      setError('Failed to load your analysis. Please try again.')
      setIsLoading(false)
    }
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

  const getBlueprintColor = (blueprint: string): string => {
    const colors = {
      energetic: 'from-yellow-500 to-orange-500',
      sensual: 'from-pink-500 to-rose-500',
      sexual: 'from-red-500 to-red-600',
      kinky: 'from-purple-500 to-purple-700',
      shapeshifter: 'from-blue-500 to-purple-500'
    }
    return colors[blueprint as keyof typeof colors] || 'from-gray-500 to-gray-600'
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

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <span className="text-2xl">💕</span>
            </div>
            <p className="text-gray-300">Loading your connection analysis...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl text-white font-medium mb-4">Connection Analysis</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={loadConnectionAnalysis}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                >
                  🔄 Try Again
                </button>
                <Link 
                  href="/app"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
                >
                  🏠 Back to Dashboard
                </Link>
                {!userData?.coupleId && (
                  <Link 
                    href="/partner-connect"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
                  >
                    💕 Connect with Partner
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!analysisResult) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <p className="text-gray-300">No analysis data available</p>
        </div>
      </AppLayout>
    )
  }

  const compatibility = calculateCompatibility()
  const isUserPartnerA = analysisResult.partnerA.userId === user?.uid
  const currentUser = isUserPartnerA ? analysisResult.partnerA : analysisResult.partnerB
  const partner = isUserPartnerA ? analysisResult.partnerB : analysisResult.partnerA

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-3xl">💕</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Your Connection Profile
            </h1>
            <p className="text-gray-400 text-lg">
              Understanding {currentUser.name} & {partner.name} together
            </p>
            
            {/* Last Updated & Refresh */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-3">
              {lastUpdated && (
                <span>
                  Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={refreshAnalysis}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                <svg 
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
              </button>
            </div>
          </motion.div>

          {/* Compatibility Score Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-700/50 mb-8 text-center"
          >
            <h2 className="text-2xl font-serif font-bold text-white mb-4">
              Combined Blueprint Compatibility
            </h2>
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {compatibility}%
            </div>
            <p className="text-gray-300">
              {currentUser.primaryBlueprint} + {partner.primaryBlueprint} = Beautiful synergy
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/understanding-partner"
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors duration-200"
              >
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="text-white font-medium mb-1">Understanding {partner.name}</h3>
                <p className="text-gray-400 text-sm">Learn about their {partner.primaryBlueprint} blueprint</p>
              </Link>
              <Link 
                href="/relationship-insights"
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors duration-200"
              >
                <div className="text-2xl mb-2">💡</div>
                <h3 className="text-white font-medium mb-1">Weekly Insights</h3>
                <p className="text-gray-400 text-sm">AI coaching for your combination</p>
              </Link>
              <Link 
                href="/relationship-timeline"
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors duration-200"
              >
                <div className="text-2xl mb-2">📈</div>
                <h3 className="text-white font-medium mb-1">Your Journey</h3>
                <p className="text-gray-400 text-sm">Track growth over time</p>
              </Link>
            </div>
          </motion.div>

          {/* Side-by-Side Blueprints */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Current User */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getBlueprintColor(currentUser.primaryBlueprint)} flex items-center justify-center`}>
                  <span className="text-2xl">{getBlueprintEmoji(currentUser.primaryBlueprint)}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  {currentUser.name} (You)
                </h3>
                <p className="text-purple-400 font-medium capitalize">
                  {currentUser.primaryBlueprint}
                  {currentUser.secondaryBlueprint && (
                    <span className="text-gray-400"> • {currentUser.secondaryBlueprint}</span>
                  )}
                </p>
              </div>
              
              {/* Scores */}
              <div className="space-y-3">
                {Object.entries(currentUser.scores).map(([blueprint, score]) => (
                  <div key={blueprint} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getBlueprintEmoji(blueprint)}</span>
                      <span className="text-white capitalize font-medium">{blueprint}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getBlueprintColor(blueprint)}`}
                          style={{ width: `${(score / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm w-8">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getBlueprintColor(partner.primaryBlueprint)} flex items-center justify-center`}>
                  <span className="text-2xl">{getBlueprintEmoji(partner.primaryBlueprint)}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  {partner.name}
                </h3>
                <p className="text-purple-400 font-medium capitalize">
                  {partner.primaryBlueprint}
                  {partner.secondaryBlueprint && (
                    <span className="text-gray-400"> • {partner.secondaryBlueprint}</span>
                  )}
                </p>
              </div>
              
              {/* Scores */}
              <div className="space-y-3">
                {Object.entries(partner.scores).map(([blueprint, score]) => (
                  <div key={blueprint} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getBlueprintEmoji(blueprint)}</span>
                      <span className="text-white capitalize font-medium">{blueprint}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getBlueprintColor(blueprint)}`}
                          style={{ width: `${(score / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm w-8">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Analysis Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center flex items-center justify-center">
              <Image
                src="/SEGGSYCHATBOT.png"
                alt="Seggsy AI"
                width={32}
                height={32}
                className="w-8 h-8 mr-3"
              />
              Your Connection Analysis
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">
                {analysisResult.analysis.summary}
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Link 
              href="/ai-suggestions"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors duration-200 text-center"
            >
              <div className="text-3xl mb-3">
                <Image
                  src="/SEGGSYCHATBOT.png"
                  alt="AI Suggestions"
                  width={32}
                  height={32}
                  className="w-8 h-8 mx-auto"
                />
              </div>
              <h3 className="text-white font-semibold mb-2">AI Suggestions</h3>
              <p className="text-gray-400 text-sm">Personalized for your combination</p>
            </Link>
            
            <Link 
              href="/intimacy-hub"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors duration-200 text-center"
            >
              <div className="text-3xl mb-3">💕</div>
              <h3 className="text-white font-semibold mb-2">Intimacy Hub</h3>
              <p className="text-gray-400 text-sm">Activities for your blueprints</p>
            </Link>

            <Link 
              href="/journey"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors duration-200 text-center"
            >
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="text-white font-semibold mb-2">Your Journey</h3>
              <p className="text-gray-400 text-sm">Track relationship growth</p>
            </Link>

            <button
              onClick={refreshAnalysis}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg p-6 transition-colors duration-200 text-center"
            >
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-white font-semibold mb-2">Refresh Analysis</h3>
              <p className="text-gray-300 text-sm">Update with latest insights</p>
            </button>
          </motion.div>

          {/* Footer Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm">
              🔒 Your analysis is private and secure. Last updated on {lastUpdated?.toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
} 