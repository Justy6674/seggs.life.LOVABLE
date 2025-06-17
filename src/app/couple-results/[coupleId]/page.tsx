'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../../lib/firebase'
import { CouplesAnalysisService, NotificationService } from '../../../lib/database'
import type { CouplesAnalysisResult } from '../../../lib/firebase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CoupleResultsPage() {
  const [user] = useAuthState(auth)
  const params = useParams()
  const coupleId = params?.coupleId as string
  
  const [analysisResult, setAnalysisResult] = useState<CouplesAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAnalysisReady, setIsAnalysisReady] = useState(false)

  useEffect(() => {
    if (!coupleId || !user) return

    loadCouplesAnalysis()
  }, [coupleId, user])

  const loadCouplesAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if analysis is ready
      const status = await CouplesAnalysisService.checkCoupleStatus(coupleId)
      
      if (status.analysisInProgress) {
        setError('Your analysis is being generated... Please check back in a few minutes!')
        setLoading(false)
        return
      }

      if (!status.analysisReady) {
        if (!status.partnerAComplete || !status.partnerBComplete) {
          setError('Waiting for both partners to complete their blueprints...')
        } else {
          setError('Analysis is being prepared... Please check back shortly!')
        }
        setLoading(false)
        return
      }

      // Load the analysis
      const result = await CouplesAnalysisService.getCouplesAnalysis(coupleId)
      
      if (!result) {
        setError('Analysis not found. Please try again later.')
        setLoading(false)
        return
      }

      setAnalysisResult(result)
      setIsAnalysisReady(true)
      setLoading(false)

    } catch (err) {
      console.error('Error loading couples analysis:', err)
      setError('Failed to load your analysis. Please try again.')
      setLoading(false)
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-xl text-white font-medium mb-2">Loading Your Analysis...</h2>
          <p className="text-gray-400">This may take a moment</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl text-white font-medium mb-4">Analysis Not Ready</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadCouplesAnalysis}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              🔄 Check Again
            </button>
            <Link 
              href="/app"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
            >
              🏠 Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Analysis ready - show results
  if (!analysisResult) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
            Personalized insights for {analysisResult.partnerA.name} & {analysisResult.partnerB.name}
          </p>
        </motion.div>

        {/* Partners' Blueprints Side-by-Side */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Partner A */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getBlueprintColor(analysisResult.partnerA.primaryBlueprint)} flex items-center justify-center`}>
                <span className="text-2xl">{getBlueprintEmoji(analysisResult.partnerA.primaryBlueprint)}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                {analysisResult.partnerA.name}
              </h3>
              <p className="text-purple-400 font-medium capitalize">
                {analysisResult.partnerA.primaryBlueprint}
                {analysisResult.partnerA.secondaryBlueprint && (
                  <span className="text-gray-400"> • {analysisResult.partnerA.secondaryBlueprint}</span>
                )}
              </p>
            </div>
            
            {/* Scores */}
            <div className="space-y-3">
              {Object.entries(analysisResult.partnerA.scores).map(([blueprint, score]) => (
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

          {/* Partner B */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getBlueprintColor(analysisResult.partnerB.primaryBlueprint)} flex items-center justify-center`}>
                <span className="text-2xl">{getBlueprintEmoji(analysisResult.partnerB.primaryBlueprint)}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                {analysisResult.partnerB.name}
              </h3>
              <p className="text-purple-400 font-medium capitalize">
                {analysisResult.partnerB.primaryBlueprint}
                {analysisResult.partnerB.secondaryBlueprint && (
                  <span className="text-gray-400"> • {analysisResult.partnerB.secondaryBlueprint}</span>
                )}
              </p>
            </div>
            
            {/* Scores */}
            <div className="space-y-3">
              {Object.entries(analysisResult.partnerB.scores).map(([blueprint, score]) => (
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
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            ✨ Your Connection Analysis
          </h2>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed text-lg">
              {analysisResult.analysis.summary}
            </p>
          </div>
        </motion.div>

        {/* Individual Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Tips for Partner A */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-serif font-bold text-white mb-4">
              💡 For {analysisResult.partnerA.name}
            </h3>
            <div className="space-y-3">
              {analysisResult.analysis.individualTips.forPartnerA.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <p className="text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for Partner B */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-serif font-bold text-white mb-4">
              💡 For {analysisResult.partnerB.name}
            </h3>
            <div className="space-y-3">
              {analysisResult.analysis.individualTips.forPartnerB.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <p className="text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Shared Exercises */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            🎯 Try This Week
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisResult.analysis.sharedExercises.map((exercise, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-400 font-bold text-lg">{index + 1}.</span>
                  <p className="text-gray-200">{exercise}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Conversation Starters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            💬 Conversation Starters
          </h2>
          <div className="space-y-4">
            {analysisResult.analysis.conversationStarters.map((starter, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-200">{starter}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-700/50 mb-8"
        >
          <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center">
            🌟 Keep Growing Together
          </h2>
          <p className="text-gray-200 text-center leading-relaxed mb-6">
            {analysisResult.analysis.nextSteps}
          </p>
          <div className="text-center">
            <Link 
              href="/app"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 Continue to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <p className="text-gray-400 text-sm">
            🔒 Your analysis is private and secure. Generated on {new Date(
              (analysisResult.analysis.generatedAt as any)?.toDate ? 
              (analysisResult.analysis.generatedAt as any).toDate() : 
              analysisResult.analysis.generatedAt
            ).toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </div>
  )
} 