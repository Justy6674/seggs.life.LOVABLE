'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import { IntimacyActionsService, INTIMACY_CATEGORIES, type IntimacyCategory, type BlueprintInsight } from '../lib/intimacyActions'
import type { User } from '../lib/firebase'

interface IntimacyActionHubProps {
  userData: User
  partnerData: User
}

export default function IntimacyActionHub({ userData, partnerData }: IntimacyActionHubProps) {
  const [user] = useAuthState(auth)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryActions, setCategoryActions] = useState<string[]>([])
  const [blueprintAnalysis, setBlueprintAnalysis] = useState<BlueprintInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showPartnerExploration, setShowPartnerExploration] = useState(false)
  const [copiedAction, setCopiedAction] = useState<string | null>(null)
  const [showReassessmentPrompt, setShowReassessmentPrompt] = useState(false)

  useEffect(() => {
    // Check if reassessment is needed
    if (IntimacyActionsService.shouldPromptReassessment(userData)) {
      setShowReassessmentPrompt(true)
    }

    // Load blueprint analysis
    loadBlueprintAnalysis()
  }, [userData, partnerData])

  const loadBlueprintAnalysis = async () => {
    try {
      const analysis = await IntimacyActionsService.getBlueprintAnalysis(userData, partnerData)
      setBlueprintAnalysis(analysis)
    } catch (error) {
      console.error('Error loading blueprint analysis:', error)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setLoading(true)

    try {
      const actions = await IntimacyActionsService.getActionsForCategory(categoryId, userData, partnerData)
      setCategoryActions(actions)
    } catch (error) {
      console.error('Error loading category actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAction = async (action: string, categoryId: string) => {
    try {
      await navigator.clipboard.writeText(action)
      setCopiedAction(action)
      setTimeout(() => setCopiedAction(null), 2000)

      // Log usage analytics
      if (user) {
        await IntimacyActionsService.logActionUsage(categoryId, action, user.uid)
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleReassessment = () => {
    // Navigate to blueprint assessment
    window.location.href = '/test-quiz'
  }

  const CategoryCard = ({ category }: { category: IntimacyCategory }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleCategorySelect(category.id)}
      className="card-elegant cursor-pointer relative overflow-hidden group"
    >
      {category.isNew && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
          NEW
        </div>
      )}
      
      <div className="text-center">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
          {category.emoji}
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{category.name}</h3>
        <p className="text-gray-400 text-sm">{category.description}</p>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
    </motion.div>
  )

  const ActionModal = () => (
    <AnimatePresence>
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedCategory(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {INTIMACY_CATEGORIES.find(cat => cat.id === selectedCategory)?.emoji}
                </span>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {INTIMACY_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Generating personalised suggestions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700 rounded-lg p-4 flex items-start justify-between group hover:bg-slate-600 transition-colors"
                  >
                    <p className="text-gray-200 flex-1 leading-relaxed">{action}</p>
                    <button
                      onClick={() => handleCopyAction(action, selectedCategory)}
                      className="ml-4 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy to clipboard"
                    >
                      {copiedAction === action ? '✓' : '📋'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const BlueprintAnalysisModal = () => (
    <AnimatePresence>
      {showAnalysis && blueprintAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setShowAnalysis(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-white">
                Blueprint Combination Analysis
              </h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-4">💪 Natural Strengths</h3>
                <ul className="space-y-2">
                  {blueprintAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">✓</span>
                      <span className="text-gray-200">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">⚠️ Growth Areas</h3>
                <ul className="space-y-2">
                  {blueprintAnalysis.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-400 mr-2 mt-1">→</span>
                      <span className="text-gray-200">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">💡 Personalised Strategies</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {blueprintAnalysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-200">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">🎯 Try These Activities</h3>
              <div className="space-y-3">
                {blueprintAnalysis.specificActivities.map((activity, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-800/30">
                    <p className="text-gray-200">{activity}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const ReassessmentPrompt = () => (
    <AnimatePresence>
      {showReassessmentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 mb-8 border border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🔄</div>
              <div>
                <h3 className="text-white font-semibold text-lg">Time for a Blueprint Refresh?</h3>
                <p className="text-gray-300">Your intimacy preferences evolve over time. Consider retaking your Erotic Blueprint assessment for fresh insights.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReassessment}
                className="btn-primary"
              >
                Retake Assessment
              </button>
              <button
                onClick={() => setShowReassessmentPrompt(false)}
                className="btn-secondary"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
            <img 
              src="/SeggsLogoNoBackground.png" 
              alt="seggs.life logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Intimacy Action Hub
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Personalised intimacy suggestions based on your unique Erotic Blueprint combination. 
            Choose a category to discover AI-powered ideas crafted just for you two.
          </p>
        </div>

        {/* Reassessment Prompt */}
        <ReassessmentPrompt />

        {/* Quick Access Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowAnalysis(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Blueprint Analysis</span>
          </button>
          <button
            onClick={() => setShowPartnerExploration(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>🔍</span>
            <span>Explore Partner's Blueprint</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {INTIMACY_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Modals */}
        <ActionModal />
        <BlueprintAnalysisModal />

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🔒</span>
              <h4 className="text-lg font-semibold text-white">Privacy & Discretion</h4>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              All suggestions are generated privately using AI and tailored to your unique blueprint combination. 
              Copy suggestions to share discreetly with your partner. Nothing is sent automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 