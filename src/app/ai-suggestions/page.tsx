"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '../../components/navigation/AppLayout'
import { useAuth } from '../../contexts/AuthContext'
// import { generateAISuggestions } from '../../lib/aiService'

interface Suggestion {
  id: string
  type: 'conversation' | 'activity' | 'gesture' | 'date'
  title: string
  description: string
  intensity: 'gentle' | 'moderate' | 'passionate'
  tags: string[]
  timeEstimate?: string
  difficulty?: 'easy' | 'medium' | 'challenging'
}

export default function AISuggestionsPage() {
  const { user, userData } = useAuth()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all')

  const suggestionTypes = [
    { id: 'all', label: 'All Suggestions', icon: '✨' },
    { id: 'conversation', label: 'Conversations', icon: '💬' },
    { id: 'activity', label: 'Activities', icon: '🎯' },
    { id: 'gesture', label: 'Gestures', icon: '💝' },
    { id: 'date', label: 'Date Ideas', icon: '🌹' }
  ]

  const intensityLevels = [
    { id: 'all', label: 'All Levels', icon: '🌈' },
    { id: 'gentle', label: 'Gentle', icon: '🌸' },
    { id: 'moderate', label: 'Moderate', icon: '🔥' },
    { id: 'passionate', label: 'Passionate', icon: '💫' }
  ]

  useEffect(() => {
    if (userData) {
      generateSuggestions()
    }
  }, [userData])

  const generateSuggestions = async () => {
    if (!userData) return

    setLoading(true)
    try {
      // Mock suggestions for development
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          type: 'conversation',
          title: 'Deep Connection Chat',
          description: 'Share your biggest dreams and fears with each other in a safe, intimate space.',
          intensity: 'gentle',
          tags: ['communication', 'emotional intimacy'],
          timeEstimate: '30-45 min',
          difficulty: 'easy'
        },
        {
          id: '2',
          type: 'activity',
          title: 'Sensual Massage',
          description: 'Take turns giving each other a relaxing, sensual massage with essential oils.',
          intensity: 'moderate',
          tags: ['touch', 'relaxation', 'sensual'],
          timeEstimate: '45-60 min',
          difficulty: 'easy'
        }
      ]
      
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion => {
    const typeMatch = selectedType === 'all' || suggestion.type === selectedType
    const intensityMatch = selectedIntensity === 'all' || suggestion.intensity === selectedIntensity
    return typeMatch && intensityMatch
  })

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'gentle': return 'text-green-400 bg-green-400/10'
      case 'moderate': return 'text-orange-400 bg-orange-400/10'
      case 'passionate': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTypeIcon = (type: string) => {
    const typeObj = suggestionTypes.find(t => t.id === type)
    return typeObj?.icon || '✨'
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-slate-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Generating personalized suggestions...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-accent mb-2">AI Suggestions</h1>
            <p className="text-accent/70">Personalized recommendations just for you</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Type Filter */}
            <div>
              <h3 className="text-accent font-semibold mb-3">Suggestion Type</h3>
              <div className="flex flex-wrap gap-2">
                {suggestionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedType === type.id
                        ? 'bg-accent text-white'
                        : 'bg-primary/40 text-accent/80 hover:bg-accent/20'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Filter */}
            <div>
              <h3 className="text-accent font-semibold mb-3">Intensity Level</h3>
              <div className="flex flex-wrap gap-2">
                {intensityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedIntensity(level.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedIntensity === level.id
                        ? 'bg-accent text-white'
                        : 'bg-primary/40 text-accent/80 hover:bg-accent/20'
                    }`}
                  >
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate New Button */}
          <div className="text-center mb-8">
            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate New Suggestions'}
            </button>
          </div>

          {/* Suggestions Grid */}
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-primary/60 backdrop-blur-sm border border-accent/30 rounded-xl p-6 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                      <div>
                        <h3 className="text-accent font-semibold">{suggestion.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getIntensityColor(suggestion.intensity)}`}>
                            {suggestion.intensity}
                          </span>
                          {suggestion.timeEstimate && (
                            <span className="text-accent/60 text-xs">⏱️ {suggestion.timeEstimate}</span>
                          )}
                          {suggestion.difficulty && (
                            <span className="text-accent/60 text-xs">📊 {suggestion.difficulty}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-accent/80 mb-4 leading-relaxed">{suggestion.description}</p>

                  {/* Tags */}
                  {suggestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestion.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-accent/20 text-accent/80 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-lg text-sm transition-colors">
                      Save for Later
                    </button>
                    <button className="px-4 py-2 border border-accent/30 hover:border-accent/50 text-accent rounded-lg text-sm transition-colors">
                      Share
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredSuggestions.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-accent/60 text-lg mb-4">No suggestions match your current filters</p>
              <button
                onClick={() => {
                  setSelectedType('all')
                  setSelectedIntensity('all')
                }}
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  )
} 