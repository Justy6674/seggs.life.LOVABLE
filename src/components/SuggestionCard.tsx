'use client'

import { useState } from 'react'
import { SmartFeedbackService } from '../lib/smartFeedback'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Heart, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: {
    id: string
    content: string
    title?: string
    emoji?: string
    category: string
    heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild'
    estimatedTime?: string
    blueprintTags?: string[]
  }
  userId: string
  onFeedbackComplete?: (feedbackId: string) => void
}

interface FeedbackState {
  given: boolean
  type?: 'loved' | 'tried' | 'not_for_us' | 'maybe_later' | 'too_intense' | 'not_enough'
  outcome?: 'successful' | 'mixed' | 'unsuccessful'
  notes?: string
  showOutcomeForm: boolean
  showNotesForm: boolean
  isSubmitting: boolean
}

export default function SuggestionCard({ 
  suggestion, 
  userId, 
  onFeedbackComplete 
}: SuggestionCardProps) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    given: false,
    showOutcomeForm: false,
    showNotesForm: false,
    isSubmitting: false
  })

  const [isFavorited, setIsFavorited] = useState(false)

  const heatLevelColors = {
    sweet: 'bg-pink-100 text-pink-700 border-pink-200',
    flirty: 'bg-orange-100 text-orange-700 border-orange-200',
    spicy: 'bg-red-100 text-red-700 border-red-200',
    wild: 'bg-purple-100 text-purple-700 border-purple-200'
  }

  const heatLevelEmojis = {
    sweet: '🌸',
    flirty: '😉',
    spicy: '🌶️',
    wild: '🔥'
  }

  const feedbackButtons = [
    { type: 'loved', label: 'Loved it!', emoji: '💕', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
    { type: 'tried', label: 'We tried it', emoji: '✨', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
    { type: 'not_for_us', label: 'Not for us', emoji: '❌', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
    { type: 'maybe_later', label: 'Maybe later', emoji: '⏰', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
    { type: 'too_intense', label: 'Too intense', emoji: '🔥', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    { type: 'not_enough', label: 'Not enough', emoji: '📈', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' }
  ]

  const outcomeButtons = [
    { type: 'successful', label: 'Great success!', emoji: '🎉', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
    { type: 'mixed', label: 'Mixed results', emoji: '😐', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
    { type: 'unsuccessful', label: 'Didn\'t work out', emoji: '😔', color: 'bg-red-100 hover:bg-red-200 text-red-700' }
  ]

  const handleInitialFeedback = (type: string) => {
    setFeedback(prev => ({ 
      ...prev, 
      type: type as any,
      showOutcomeForm: ['loved', 'tried'].includes(type)
    }))
  }

  const handleOutcomeFeedback = (outcome: string) => {
    setFeedback(prev => ({ 
      ...prev, 
      outcome: outcome as any,
      showOutcomeForm: false,
      showNotesForm: true
    }))
  }

  const handleSubmitFeedback = async (notes?: string) => {
    if (!feedback.type) return

    setFeedback(prev => ({ ...prev, isSubmitting: true }))

    try {
      const feedbackId = await SmartFeedbackService.saveSuggestionFeedback(
        userId,
        suggestion.id,
        suggestion.title || 'AI Suggestion',
        suggestion.category,
        suggestion.heatLevel,
        feedback.type,
        feedback.outcome,
        notes || feedback.notes
      )

      setFeedback(prev => ({ 
        ...prev, 
        given: true, 
        showNotesForm: false, 
        isSubmitting: false,
        notes 
      }))

      onFeedbackComplete?.(feedbackId)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setFeedback(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleSkipNotes = () => {
    handleSubmitFeedback()
  }

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {suggestion.emoji && (
            <span className="text-2xl">{suggestion.emoji}</span>
          )}
          <div>
            {suggestion.title && (
              <h3 className="font-serif font-semibold text-slate-900 text-lg">
                {suggestion.title}
              </h3>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full border ${heatLevelColors[suggestion.heatLevel]}`}>
                {heatLevelEmojis[suggestion.heatLevel]} {suggestion.heatLevel}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {suggestion.category}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className={`p-2 rounded-full transition-colors ${
            isFavorited
              ? 'text-red-500 hover:text-red-600'
              : 'text-slate-400 hover:text-red-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <p className="text-slate-700 mb-4 leading-relaxed font-serif">
        {suggestion.content}
      </p>

      {/* Metadata */}
      {(suggestion.estimatedTime || suggestion.blueprintTags) && (
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          {suggestion.estimatedTime && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{suggestion.estimatedTime}</span>
            </div>
          )}
          {suggestion.blueprintTags && (
            <div className="flex items-center space-x-1">
              <span>🏷️ {suggestion.blueprintTags.join(' + ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Feedback Section */}
      <AnimatePresence>
        {!feedback.given && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 pt-4"
          >
            {!feedback.type && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">How was this suggestion?</p>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackButtons.map((btn) => (
                    <button
                      key={btn.type}
                      onClick={() => handleInitialFeedback(btn.type)}
                      className={`text-xs px-3 py-2 rounded-lg transition-colors ${btn.color} flex items-center justify-center space-x-1`}
                    >
                      <span>{btn.emoji}</span>
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {feedback.showOutcomeForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-slate-700 mb-3">How did it go?</p>
                <div className="grid grid-cols-1 gap-2">
                  {outcomeButtons.map((btn) => (
                    <button
                      key={btn.type}
                      onClick={() => handleOutcomeFeedback(btn.type)}
                      className={`text-xs px-3 py-2 rounded-lg transition-colors ${btn.color} flex items-center justify-center space-x-1`}
                    >
                      <span>{btn.emoji}</span>
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {feedback.showNotesForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Any additional thoughts? (Optional)
                </p>
                <textarea
                  placeholder="Share what worked, what didn't, or any variations you tried..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={3}
                  value={feedback.notes || ''}
                  onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleSubmitFeedback(feedback.notes)}
                    disabled={feedback.isSubmitting}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {feedback.isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSkipNotes}
                    disabled={feedback.isSubmitting}
                    className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {feedback.given && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-100 pt-4"
          >
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Thanks for your feedback! This helps us personalize future suggestions.</span>
            </div>
            {feedback.notes && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Your notes:</p>
                <p className="text-sm text-slate-700">{feedback.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 