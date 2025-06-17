'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import { SmartFeedbackService } from '../../lib/smartFeedback'
import Auth from '../../components/Auth'
import SuggestionCard from '../../components/SuggestionCard'

interface FeedbackAnalysisDisplay {
  analysis: any
  insights: any[]
  predictions: any[]
  personalized: any[]
}

export default function TestFeedback() {
  const [user] = useAuthState(auth)
  const [analysis, setAnalysis] = useState<FeedbackAnalysisDisplay | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testSuggestions] = useState([
    {
      id: 'test-1',
      content: 'Create a cozy reading nook together and take turns reading poetry to each other.',
      title: 'Poetry & Connection',
      emoji: '📚',
      category: 'connection',
      heatLevel: 'sweet' as const,
      estimatedTime: '20 min',
      blueprintTags: ['sensual', 'energetic']
    },
    {
      id: 'test-2',
      content: 'Plan a sensory experience with different textures, scents, and tastes to explore together.',
      title: 'Sensory Journey',
      emoji: '🌸',
      category: 'touch',
      heatLevel: 'flirty' as const,
      estimatedTime: '30 min',
      blueprintTags: ['sensual', 'kinky']
    },
    {
      id: 'test-3',
      content: 'Create an intimate playlist and slow dance together in your living room by candlelight.',
      title: 'Intimate Dance',
      emoji: '💃',
      category: 'intimate',
      heatLevel: 'spicy' as const,
      estimatedTime: '15 min',
      blueprintTags: ['sensual', 'sexual']
    }
  ])

  const runFeedbackAnalysis = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get comprehensive feedback analysis
      const feedbackAnalysis = await SmartFeedbackService.analyzeUserFeedbackPatterns(user.uid)
      
      // Get category insights
      const categoryInsights = await SmartFeedbackService.getCategoryInsights(
        user.uid,
        ['connection', 'touch', 'intimate', 'playful', 'adventure']
      )

      // Get predictions for each test suggestion
      const predictions = await Promise.all(
        testSuggestions.map(async (suggestion) => {
          const prediction = await SmartFeedbackService.predictUserResponse(
            user.uid,
            suggestion.title,
            suggestion.category,
            suggestion.heatLevel
          )
          return { suggestion: suggestion.title, ...prediction }
        })
      )

      // Generate personalized suggestions
      const personalizedSuggestions = await SmartFeedbackService.generatePersonalizedSuggestions(
        user.uid,
        'connection', // Focus on connection category
        3
      )

      setAnalysis({
        analysis: feedbackAnalysis,
        insights: categoryInsights,
        predictions,
        personalized: personalizedSuggestions
      })
    } catch (error) {
      console.error('Error running feedback analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedbackComplete = (feedbackId: string) => {
    console.log('Feedback collected:', feedbackId)
    // Automatically refresh analysis after feedback
    setTimeout(() => {
      runFeedbackAnalysis()
    }, 1000)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
            Smart Feedback Test
          </h1>
          <p className="text-wheat/70 mb-6">
            Please sign in to test the intelligent feedback system.
          </p>
          <Auth />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
            📊 Smart Feedback System Test
          </h1>
          <p className="text-wheat/70 mb-6">
            Test our intelligent feedback collection, pattern analysis, and personalized suggestion generation.
          </p>
          
          <button
            onClick={runFeedbackAnalysis}
            disabled={isLoading}
            className="bg-burgundy hover:bg-burgundy/80 disabled:bg-burgundy/50 text-wheat px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? '⏳ Analyzing...' : '🔍 Run Feedback Analysis'}
          </button>
        </div>

        {/* Test Suggestions */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
            🧪 Test Suggestions (Provide Feedback)
          </h2>
          <p className="text-wheat/70 mb-6">
            Try providing feedback on these test suggestions to see how the system learns from your preferences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                userId={user.uid}
                onFeedbackComplete={handleFeedbackComplete}
              />
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Overall Analysis */}
            <div className="bg-wheat/10 rounded-xl p-6 border border-wheat/20">
              <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
                📈 Feedback Pattern Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-wheat mb-2">Overall Satisfaction</h3>
                  <div className="text-3xl font-bold text-wheat">
                    {Math.round(analysis.analysis.overallSatisfaction * 100)}%
                  </div>
                  <p className="text-wheat/70 text-sm">Based on your feedback</p>
                </div>
                
                <div className="bg-primary/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-wheat mb-2">Optimal Intensity</h3>
                  <div className="text-2xl font-bold text-wheat capitalize">
                    {analysis.analysis.intensityPreferences.optimal}
                  </div>
                  <p className="text-wheat/70 text-sm">Your preferred heat level</p>
                </div>
                
                <div className="bg-primary/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-wheat mb-2">Categories Tried</h3>
                  <div className="text-3xl font-bold text-wheat">
                    {analysis.analysis.categoryPreferences.length}
                  </div>
                  <p className="text-wheat/70 text-sm">Different activity types</p>
                </div>
              </div>

              {/* Category Preferences */}
              {analysis.analysis.categoryPreferences.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-wheat mb-3">Category Preferences</h3>
                  <div className="space-y-2">
                    {analysis.analysis.categoryPreferences.slice(0, 5).map((cat: any, index: number) => (
                      <div key={cat.category} className="flex items-center justify-between bg-primary/20 rounded-lg p-3">
                        <span className="text-wheat capitalize">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-wheat/20 rounded-full h-2">
                            <div 
                              className="bg-wheat h-full rounded-full transition-all duration-300"
                              style={{ width: `${cat.satisfaction * 100}%` }}
                            />
                          </div>
                          <span className="text-wheat/70 text-sm">
                            {Math.round(cat.satisfaction * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {analysis.analysis.personalizedInsights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-wheat mb-3">AI Insights</h3>
                  <div className="space-y-2">
                    {analysis.analysis.personalizedInsights.map((insight: string, index: number) => (
                      <div key={index} className="bg-primary/20 rounded-lg p-3">
                        <p className="text-wheat/90 text-sm">💡 {insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Insights */}
            {analysis.insights.length > 0 && (
              <div className="bg-wheat/10 rounded-xl p-6 border border-wheat/20">
                <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
                  🎯 Category Insights
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.insights.map((insight: any, index: number) => (
                    <div key={index} className="bg-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-wheat capitalize">{insight.category}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.preference === 'loved' 
                            ? 'bg-green-500/20 text-green-300'
                            : insight.preference === 'disliked'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {insight.preference}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-wheat/70 text-sm">Confidence:</span>
                          <div className="w-20 bg-wheat/20 rounded-full h-1">
                            <div 
                              className="bg-wheat h-full rounded-full"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-wheat/70 text-xs">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-wheat/70 text-xs mb-1">Evidence:</p>
                          {insight.evidence.slice(0, 2).map((ev: string, i: number) => (
                            <p key={i} className="text-wheat/90 text-xs">• {ev}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            <div className="bg-wheat/10 rounded-xl p-6 border border-wheat/20">
              <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
                🔮 AI Predictions
              </h2>
              <p className="text-wheat/70 mb-4">
                How the AI predicts you'll respond to different suggestions based on your patterns.
              </p>
              
              <div className="space-y-3">
                {analysis.predictions.map((pred: any, index: number) => (
                  <div key={index} className="bg-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-wheat font-medium">{pred.suggestion}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pred.predictedFeedback === 'loved' 
                          ? 'bg-green-500/20 text-green-300'
                          : pred.predictedFeedback === 'not_for_us'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {pred.predictedFeedback.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-wheat/70 text-sm">Confidence:</span>
                      <div className="w-24 bg-wheat/20 rounded-full h-1">
                        <div 
                          className="bg-wheat h-full rounded-full"
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-wheat/70 text-xs">
                        {Math.round(pred.confidence * 100)}%
                      </span>
                    </div>
                    
                    <p className="text-wheat/90 text-sm">{pred.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Suggestions */}
            {analysis.personalized.length > 0 && (
              <div className="bg-wheat/10 rounded-xl p-6 border border-wheat/20">
                <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
                  ✨ AI-Generated Personalized Suggestions
                </h2>
                <p className="text-wheat/70 mb-4">
                  Custom suggestions generated based on your feedback patterns and preferences.
                </p>
                
                <div className="space-y-4">
                  {analysis.personalized.map((sugg: any, index: number) => (
                    <div key={index} className="bg-primary/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-wheat font-medium flex-1">{sugg.suggestion}</h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs px-2 py-1 rounded bg-wheat/20 text-wheat capitalize">
                            {sugg.category}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-wheat/20 text-wheat capitalize">
                            {sugg.heatLevel}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-wheat/70 text-sm">AI Confidence:</span>
                        <div className="w-20 bg-wheat/20 rounded-full h-1">
                          <div 
                            className="bg-wheat h-full rounded-full"
                            style={{ width: `${sugg.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-wheat/70 text-xs">
                          {Math.round(sugg.confidence * 100)}%
                        </span>
                      </div>
                      
                      <p className="text-wheat/80 text-sm italic">{sugg.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center space-x-4">
          <a
            href="/ai-suggestions"
            className="inline-block bg-primary hover:bg-primary/80 text-wheat px-6 py-3 rounded-lg transition-colors"
          >
            ← Try AI Suggestions
          </a>
          <a
            href="/test-conversation-memory"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Test Conversation Memory
          </a>
          <a
            href="/test-journey"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Test Journey System →
          </a>
        </div>
      </div>
    </div>
  )
} 