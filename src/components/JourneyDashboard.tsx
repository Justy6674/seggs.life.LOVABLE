'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCalendar, 
  FiTrendingUp, 
  FiStar, 
  FiHeart, 
  FiAward,
  FiTarget,
  FiActivity,
  FiBookOpen,
  FiGift,
  FiBarChart,
  FiClock,
  FiUsers
} from 'react-icons/fi'
import { EnhancedJourneyService, MilestoneDetection, JourneyInsight } from '../lib/enhancedJourney'
import { RelationshipMilestone } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'

interface JourneyStats {
  totalMilestones: number
  recentMilestones: number
  celebratedMilestones: number
  overallProgress: number
  currentPhase: string
  daysInJourney: number
  satisfactionTrend: 'up' | 'down' | 'stable'
}

const JourneyDashboard: React.FC = () => {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [milestones, setMilestones] = useState<RelationshipMilestone[]>([])
  const [detectedMilestones, setDetectedMilestones] = useState<MilestoneDetection[]>([])
  const [stats, setStats] = useState<JourneyStats | null>(null)
  const [insights, setInsights] = useState<JourneyInsight[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<RelationshipMilestone | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'insights' | 'progress'>('overview')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user?.uid) {
      loadJourneyData()
    }
  }, [mounted, user])

  const loadJourneyData = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      
      // Load existing milestones
      const existingMilestones = await EnhancedJourneyService.getUserMilestones(user.uid)
      setMilestones(existingMilestones)
      
      // Detect new milestones
      const detected = await EnhancedJourneyService.detectMilestones(user.uid)
      setDetectedMilestones(detected)
      
      // Calculate stats
      const journeyStats = calculateJourneyStats(existingMilestones)
      setStats(journeyStats)
      
      // Generate insights
      const journeyInsights = generateInsights(existingMilestones, detected, journeyStats)
      setInsights(journeyInsights)
      
    } catch (error) {
      console.error('Error loading journey data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMilestone = async (detection: MilestoneDetection) => {
    if (!user?.uid) return

    try {
      await EnhancedJourneyService.createMilestone(user.uid, detection)
      await loadJourneyData()
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  const handleCelebrateMilestone = async (milestoneId: string, notes?: string) => {
    try {
      await EnhancedJourneyService.celebrateMilestone(milestoneId, notes)
      await loadJourneyData()
    } catch (error) {
      console.error('Error celebrating milestone:', error)
    }
  }

  const calculateJourneyStats = (milestones: RelationshipMilestone[]): JourneyStats => {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    
    return {
      totalMilestones: milestones.length,
      recentMilestones: milestones.filter(m => m.date.getTime() > thirtyDaysAgo).length,
      celebratedMilestones: milestones.filter(m => m.celebrated).length,
      overallProgress: Math.min(milestones.length * 15, 100),
      currentPhase: 'exploring',
      daysInJourney: user?.metadata?.creationTime ? Math.floor((now - new Date(user.metadata.creationTime).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      satisfactionTrend: 'up'
    }
  }

  const generateInsights = (
    milestones: RelationshipMilestone[], 
    detected: MilestoneDetection[],
    stats: JourneyStats
  ): JourneyInsight[] => {
    const insights: JourneyInsight[] = []
    
    if (detected.length > 0) {
      insights.push({
        type: 'milestone',
        title: 'New Milestones Detected',
        description: `${detected.length} potential milestone${detected.length > 1 ? 's' : ''} ready for celebration`,
        significance: 8,
        timeframe: 'Now',
        actionable: true,
        suggestions: ['Review and celebrate your achievements'],
        evidence: detected.map(d => d.title)
      })
    }
    
    if (stats.recentMilestones > 2) {
      insights.push({
        type: 'growth',
        title: 'Accelerated Growth Period',
        description: `You've achieved ${stats.recentMilestones} milestones in the last 30 days`,
        significance: 9,
        timeframe: 'Last month',
        actionable: true,
        suggestions: ['Maintain this momentum', 'Consider setting bigger goals'],
        evidence: [`${stats.recentMilestones} recent milestones`]
      })
    }
    
    return insights
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-white/50 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Your Intimacy Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Track your growth, celebrate milestones, and discover insights
          </p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
              <FiAward className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.totalMilestones}</div>
              <div className="text-sm text-gray-600">Total Milestones</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
              <FiTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
              <FiClock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.daysInJourney}</div>
              <div className="text-sm text-gray-600">Days of Growth</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
              <FiGift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.celebratedMilestones}</div>
              <div className="text-sm text-gray-600">Celebrated</div>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2">
            {(['overview', 'milestones', 'insights', 'progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content - Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Detected Milestones */}
            {detectedMilestones.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FiStar className="w-6 h-6 text-yellow-500 mr-2" />
                  New Achievements Detected!
                </h3>
                <div className="space-y-4">
                  {detectedMilestones.map((detection, index) => (
                    <div
                      key={index}
                      className="border border-pink-200 rounded-xl p-4 bg-gradient-to-r from-pink-50 to-rose-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800">{detection.title}</h4>
                          <p className="text-gray-600 text-sm">{detection.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-pink-600">
                            {Math.round(detection.confidence * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {detection.context.growthAreas.map((area, idx) => (
                          <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          💡 {detection.celebrationSuggestion}
                        </div>
                        <button
                          onClick={() => handleCreateMilestone(detection)}
                          className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
                        >
                          Add to Journey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Milestones */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiCalendar className="w-6 h-6 text-blue-500 mr-2" />
                Recent Milestones
              </h3>
              {milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.slice(0, 5).map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.celebrated ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {milestone.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: Math.round(milestone.significance / 2) }).map((_, i) => (
                            <FiStar key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiHeart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your journey is just beginning! Complete activities to unlock your first milestone.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content - Insights */}
        {activeTab === 'insights' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FiBarChart className="w-6 h-6 text-purple-500 mr-2" />
              AI-Powered Insights
            </h3>
            
            {insights.length > 0 ? (
              <div className="space-y-6">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-purple-500 pl-6 py-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{insight.title}</h4>
                        <p className="text-gray-600">{insight.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {insight.significance}/10
                        </div>
                        <div className="text-xs text-gray-500">Significance</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {insight.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <FiTarget className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Evidence:</h5>
                        <div className="flex flex-wrap gap-2">
                          {insight.evidence.map((evidence, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {evidence}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No insights available yet</p>
                <p>Continue your journey to unlock AI-powered insights about your growth!</p>
              </div>
            )}
          </div>
        )}

        {/* Milestone Detail Modal */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMilestone(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <FiAward className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedMilestone.title}
                  </h2>
                  <p className="text-gray-600">{selectedMilestone.description}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Date Achieved:</span>
                    <span className="text-gray-600">{selectedMilestone.date.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Significance:</span>
                    <div className="flex items-center">
                      {Array.from({ length: Math.round(selectedMilestone.significance / 2) }).map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-gray-600">{selectedMilestone.significance}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedMilestone.celebrated
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedMilestone.celebrated ? 'Celebrated' : 'Ready to Celebrate'}
                    </span>
                  </div>
                </div>
                
                {selectedMilestone.aiReflection && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FiBookOpen className="w-4 h-4 mr-2" />
                      AI Reflection
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedMilestone.aiReflection}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMilestone(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {!selectedMilestone.celebrated && (
                    <button
                      onClick={() => {
                        handleCelebrateMilestone(selectedMilestone.id)
                        setSelectedMilestone(null)
                      }}
                      className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
                    >
                      Celebrate! 🎉
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default JourneyDashboard 