'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import DOMPurify from 'dompurify'
import type { User } from '../lib/firebase'
import type { CouplesReport as CouplesReportType } from '../lib/aiService'

interface CouplesReportProps {
  userData: User
  partnerData: User
  report: CouplesReportType
  onRegenerateReport?: () => void
}

const blueprintConfig = {
  energetic: {
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Turned on by anticipation, tease, energy, space, and slow build-up'
  },
  sensual: {
    emoji: '🌸',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'Loves senses, touch, comfort, setting, and emotional connection'
  },
  sexual: {
    emoji: '🔥',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'Direct, visual, physical, straightforward, and genital-focused'
  },
  kinky: {
    emoji: '🎭',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Taboo, power play, rules, boundaries, and psychological games'
  },
  shapeshifter: {
    emoji: '🌈',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Variety, change, all blueprint types at different times'
  }
}

export default function CouplesReport({ userData, partnerData, report, onRegenerateReport }: CouplesReportProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'compatibility' | 'advice' | 'prompts'>('overview')
  const [showShareModal, setShowShareModal] = useState(false)

  const getUserBlueprint = (user: User) => {
    const primary = user.eroticBlueprintPrimary || 'energetic'
    const secondary = user.eroticBlueprintSecondary
    return {
      primary: primary as keyof typeof blueprintConfig,
      secondary: secondary as keyof typeof blueprintConfig | undefined,
      scores: user.eroticBlueprintScores || { energetic: 0, sensual: 0, sexual: 0, kinky: 0, shapeshifter: 0 }
    }
  }

  const user1Blueprint = getUserBlueprint(userData)
  const user2Blueprint = getUserBlueprint(partnerData)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
            <Image 
              src="/SeggsLogoNoBackground.png" 
              alt="seggs.life logo" 
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Your Intimate Compatibility Report
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A personalised analysis of your Erotic Blueprint compatibility, with AI-powered insights and actionable guidance for deeper intimacy.
          </p>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 mb-8 border border-purple-800/30"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-white text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(report.welcomeMessage) }} />
          </div>
        </motion.div>

        {/* Blueprint Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          {/* User 1 Blueprint */}
          <div className={`card-elegant ${blueprintConfig[user1Blueprint.primary].borderColor} border-2`}>
            <div className="flex items-center mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${blueprintConfig[user1Blueprint.primary].color} flex items-center justify-center text-2xl mr-4`}>
                {blueprintConfig[user1Blueprint.primary].emoji}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{userData.displayName}</h3>
                <p className="text-gray-300 capitalize">
                  {user1Blueprint.primary}
                  {user1Blueprint.secondary && ` + ${user1Blueprint.secondary}`}
                </p>
              </div>
            </div>
            
            <div className={`${blueprintConfig[user1Blueprint.primary].bgColor} rounded-lg p-4 mb-4`}>
              <p className="text-gray-200 text-sm">
                {blueprintConfig[user1Blueprint.primary].description}
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(user1Blueprint.scores).map(([blueprint, score]) => (
                <div key={blueprint} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{blueprint}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-700 rounded-full mr-2">
                      <div 
                        className={`h-full bg-gradient-to-r ${blueprintConfig[blueprint as keyof typeof blueprintConfig].color} rounded-full transition-all duration-300`}
                        style={{ width: `${(score / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User 2 Blueprint */}
          <div className={`card-elegant ${blueprintConfig[user2Blueprint.primary].borderColor} border-2`}>
            <div className="flex items-center mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${blueprintConfig[user2Blueprint.primary].color} flex items-center justify-center text-2xl mr-4`}>
                {blueprintConfig[user2Blueprint.primary].emoji}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{partnerData.displayName}</h3>
                <p className="text-gray-300 capitalize">
                  {user2Blueprint.primary}
                  {user2Blueprint.secondary && ` + ${user2Blueprint.secondary}`}
                </p>
              </div>
            </div>
            
            <div className={`${blueprintConfig[user2Blueprint.primary].bgColor} rounded-lg p-4 mb-4`}>
              <p className="text-gray-200 text-sm">
                {blueprintConfig[user2Blueprint.primary].description}
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(user2Blueprint.scores).map(([blueprint, score]) => (
                <div key={blueprint} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{blueprint}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-700 rounded-full mr-2">
                      <div 
                        className={`h-full bg-gradient-to-r ${blueprintConfig[blueprint as keyof typeof blueprintConfig].color} rounded-full transition-all duration-300`}
                        style={{ width: `${(score / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-lg p-2 flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: '🔍' },
              { id: 'compatibility', label: 'Compatibility', icon: '💕' },
              { id: 'advice', label: 'Guidance', icon: '💡' },
              { id: 'prompts', label: 'Try Tonight', icon: '🌟' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeSection === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card-elegant">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🎯</span>
                  Your Blueprint Compatibility
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-green-400 mb-3">Natural Strengths</h4>
                    <ul className="space-y-2">
                      {report.compatibility.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-400 mr-2 mt-1">✓</span>
                          <span className="text-gray-200">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-3">Growth Areas</h4>
                    <ul className="space-y-2">
                      {report.compatibility.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-400 mr-2 mt-1">→</span>
                          <span className="text-gray-200">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card-elegant">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🌟</span>
                  Unique Connection Points
                </h3>
                <div className="space-y-3">
                  {report.compatibility.overlapAreas.map((overlap, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-800/30">
                      <p className="text-gray-200">{overlap}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'compatibility' && (
            <motion.div
              key="compatibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-elegant"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">💕</span>
                Deep Compatibility Analysis
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-white mb-4">Blueprint Summaries</h4>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-800/30">
                    <p className="text-gray-200">{report.blueprintSummary.user1Summary}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg p-4 border border-blue-800/30">
                    <p className="text-gray-200">{report.blueprintSummary.user2Summary}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-6 border border-yellow-800/30">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">💡 AI Insight</h4>
                <p className="text-gray-200 leading-relaxed">
                  Your combination of <strong>{user1Blueprint.primary}</strong> and <strong>{user2Blueprint.primary}</strong> creates a dynamic where 
                  {user1Blueprint.primary === user2Blueprint.primary 
                    ? " you both share the same primary language of intimacy, creating natural understanding and compatibility."
                    : " you can learn from each other's different approaches to intimacy, creating opportunities for growth and exploration."
                  }
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'advice' && (
            <motion.div
              key="advice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-elegant">
                  <h4 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    This Week
                  </h4>
                  <ul className="space-y-3">
                    {report.actionableAdvice.immediateSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">{index + 1}</span>
                        <span className="text-gray-200 text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-elegant">
                  <h4 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                    <span className="mr-2">🗓️</span>
                    Monthly
                  </h4>
                  <ul className="space-y-3">
                    {report.actionableAdvice.weeklyIdeas.map((idea, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">{index + 1}</span>
                        <span className="text-gray-200 text-sm">{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-elegant">
                  <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
                    <span className="mr-2">🚀</span>
                    Long-term
                  </h4>
                  <ul className="space-y-3">
                    {report.actionableAdvice.longTermGoals.map((goal, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">{index + 1}</span>
                        <span className="text-gray-200 text-sm">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card-elegant">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">🌟</span>
                  Personalised Prompts for Tonight
                </h3>
                <div className="grid gap-4">
                  {report.personalisedPrompts.map((prompt, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg p-6 border border-pink-800/30 group hover:border-pink-600/50 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <p className="text-gray-200 leading-relaxed flex-1">{prompt}</p>
                        <button
                          onClick={() => copyToClipboard(prompt)}
                          className="ml-4 text-gray-400 hover:text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-elegant">
                <h4 className="text-xl font-bold text-white mb-4">🎯 Next Steps</h4>
                <div className="bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg p-6 border border-blue-800/30">
                  <p className="text-gray-200 leading-relaxed">{report.nextSteps}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <span>📤</span>
            <span>Share Report</span>
          </button>
          
          {onRegenerateReport && (
            <button
              onClick={onRegenerateReport}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Generate New Insights</span>
            </button>
          )}
          
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>Save as PDF</span>
          </button>
        </motion.div>

        {/* Privacy Assurance */}
        <div className="mt-8 text-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🔒</span>
              <h4 className="text-lg font-semibold text-white">Privacy & Security</h4>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your intimate data is completely private and secure. This report is stored locally and encrypted. 
              Only you and your partner have access to these insights. We never share your personal information with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Share Your Report</h3>
            <p className="text-gray-300 mb-6">
              Your report contains intimate information. Only share with your partner or trusted individuals.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="btn-primary flex-1"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 