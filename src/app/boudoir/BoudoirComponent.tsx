'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'

const BOUDOIR_CATEGORIES = [
  { id: 'romantic', name: 'Romantic', emoji: '💕', description: 'Sweet and tender moments' },
  { id: 'playful', name: 'Playful', emoji: '😏', description: 'Fun and flirty activities' },
  { id: 'sensual', name: 'Sensual', emoji: '🌹', description: 'Touch and sensation focused' },
  { id: 'passionate', name: 'Passionate', emoji: '🔥', description: 'Intense and steamy' },
  { id: 'kinky', name: 'Kinky', emoji: '⚡', description: 'Power play and kink' },
  { id: 'experimental', name: 'Experimental', emoji: '🎭', description: 'Try something new' },
  { id: 'quickies', name: 'Quickies', emoji: '⚡', description: 'Short but sweet' },
  { id: 'extended', name: 'Extended', emoji: '🕰️', description: 'Take your time' },
  { id: 'verbal', name: 'Verbal', emoji: '💬', description: 'Talk and tease' },
  { id: 'visual', name: 'Visual', emoji: '👀', description: 'See and be seen' },
  { id: 'toys', name: 'Toys', emoji: '🎲', description: 'Add some fun tools' },
  { id: 'roleplay', name: 'Roleplay', emoji: '🎪', description: 'Fantasy scenarios' },
  { id: 'outdoor', name: 'Adventure', emoji: '🌄', description: 'New locations' },
  { id: 'massage', name: 'Massage', emoji: '💆', description: 'Touch and relaxation' },
  { id: 'fantasy', name: 'Fantasy', emoji: '✨', description: 'Dream scenarios' },
  { id: 'morning', name: 'Morning', emoji: '🌅', description: 'Start the day right' },
  { id: 'evening', name: 'Evening', emoji: '🌙', description: 'End the day together' },
  { id: 'surprise', name: 'Surprise', emoji: '🎁', description: 'Unexpected delights' },
  { id: 'connection', name: 'Connection', emoji: '💞', description: 'Emotional intimacy' },
  { id: 'celebration', name: 'Celebration', emoji: '🎉', description: 'Special occasions' }
]

interface Suggestion {
  id: string
  category: string
  title: string
  description: string
  intensity: 'sweet' | 'flirty' | 'spicy' | 'wild'
  duration: string
  tips: string[]
}

export default function BoudoirComponent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState(BOUDOIR_CATEGORIES[0])
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    intensity: 'spicy' as const,
    blueprint: 'sexual' as const
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadSuggestions()
    }
  }, [selectedCategory, user])

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      // Generate AI-powered suggestions for the selected category
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          category: selectedCategory.id,
          intensity: userPreferences.intensity,
          blueprint: userPreferences.blueprint,
          count: 10
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setCurrentIndex(0)
        setCurrentSuggestion(data.suggestions?.[0] || null)
      } else {
        // Fallback suggestions if API fails
        const fallbackSuggestions = generateFallbackSuggestions(selectedCategory.id)
        setSuggestions(fallbackSuggestions)
        setCurrentSuggestion(fallbackSuggestions[0])
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
      // Fallback suggestions
      const fallbackSuggestions = generateFallbackSuggestions(selectedCategory.id)
      setSuggestions(fallbackSuggestions)
      setCurrentSuggestion(fallbackSuggestions[0])
    }
    setLoadingSuggestions(false)
  }

  const generateFallbackSuggestions = (categoryId: string): Suggestion[] => {
    const baseId = `${categoryId}_${Date.now()}`
    return [
      {
        id: `${baseId}_1`,
        category: categoryId,
        title: `${selectedCategory.name} Experience`,
        description: `A carefully crafted ${selectedCategory.name.toLowerCase()} experience tailored to your preferences.`,
        intensity: userPreferences.intensity,
        duration: '15-30 minutes',
        tips: [
          'Take your time and communicate openly',
          'Focus on what feels good for both of you',
          'Remember that consent is ongoing'
        ]
      }
    ]
  }

  const nextSuggestion = () => {
    if (currentIndex < suggestions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setCurrentSuggestion(suggestions[newIndex])
    }
  }

  const previousSuggestion = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setCurrentSuggestion(suggestions[newIndex])
    }
  }

  const handleFeedback = async (feedback: 'love' | 'maybe' | 'pass') => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          suggestionId: currentSuggestion?.id,
          feedback,
          category: selectedCategory.id
        })
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
    
    // Move to next suggestion after feedback
    nextSuggestion()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💕 Boudoir
          </h1>
          <p className="text-gray-300">
            Private intimate suggestions tailored to your relationship
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Choose Your Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {BOUDOIR_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory.id === category.id ? "primary" : "outline"}
                className={`p-3 h-auto flex flex-col items-center space-y-1 ${
                  selectedCategory.id === category.id 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Suggestion */}
        <div className="max-w-2xl mx-auto">
          {loadingSuggestions ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="text-white">Loading personalized suggestions...</div>
              </CardContent>
            </Card>
          ) : currentSuggestion ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">
                    {currentSuggestion.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-pink-600 text-white">
                    {currentSuggestion.intensity}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-gray-400 text-sm">
                  <span>⏱️ {currentSuggestion.duration}</span>
                  <span>📍 {selectedCategory.name}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentSuggestion.description}
                </p>
                
                {currentSuggestion.tips && currentSuggestion.tips.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">💡 Tips</h3>
                    <ul className="space-y-1 text-gray-300">
                      {currentSuggestion.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Suggestion {currentIndex + 1} of {suggestions.length}</span>
                    <span>{Math.round(((currentIndex + 1) / suggestions.length) * 100)}%</span>
                  </div>
                  <Progress 
                    value={((currentIndex + 1) / suggestions.length) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Feedback Buttons */}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback('pass')}
                    className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    😐 Pass
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback('maybe')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                  >
                    🤔 Maybe
                  </Button>
                  <Button
                    onClick={() => handleFeedback('love')}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    💕 Love It
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousSuggestion}
                    disabled={currentIndex === 0}
                    className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 disabled:opacity-50"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextSuggestion}
                    disabled={currentIndex === suggestions.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 disabled:opacity-50"
                  >
                    Next →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="text-gray-300">
                  No suggestions available for this category yet.
                </div>
                <Button
                  onClick={loadSuggestions}
                  className="mt-4 bg-pink-600 hover:bg-pink-700 text-white"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            🔒 All suggestions are private and tailored to your preferences. 
            Your feedback helps us provide better recommendations.
          </p>
        </div>
      </div>
    </div>
  )
} 