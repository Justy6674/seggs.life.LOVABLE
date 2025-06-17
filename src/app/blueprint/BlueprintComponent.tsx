'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Badge } from '../../components/ui/badge'

const EROTIC_BLUEPRINTS = [
  {
    id: 'energetic',
    name: 'Energetic',
    emoji: '✨',
    description: 'You crave anticipation, space, and mental stimulation',
    characteristics: ['Anticipation', 'Space', 'Tease', 'Mental connection']
  },
  {
    id: 'sensual',
    name: 'Sensual',
    emoji: '🌹',
    description: 'You need to feel relaxed, with all senses engaged',
    characteristics: ['All senses', 'Relaxation', 'Ambiance', 'Slow buildup']
  },
  {
    id: 'sexual',
    name: 'Sexual',
    emoji: '🔥',
    description: 'You love nudity, genitals, and sexual acts',
    characteristics: ['Nudity', 'Direct', 'Genitals', 'Sexual acts']
  },
  {
    id: 'kinky',
    name: 'Kinky',
    emoji: '⚡',
    description: 'You enjoy psychological or physical power exchange',
    characteristics: ['Power play', 'Taboo', 'Intensity', 'Psychological']
  },
  {
    id: 'shapeshifter',
    name: 'Shapeshifter',
    emoji: '🎭',
    description: 'You speak all languages but may get bored easily',
    characteristics: ['Variety', 'Adaptable', 'All types', 'Novelty']
  }
]

const QUIZ_QUESTIONS = [
  // Energetic Questions
  { id: 'e1', blueprint: 'energetic', question: 'Anticipation and longing turn me on more than the physical act itself.', category: 'energetic' },
  { id: 'e2', blueprint: 'energetic', question: 'I prefer to be pursued rather than being the pursuer.', category: 'energetic' },
  { id: 'e3', blueprint: 'energetic', question: 'Space and mystery in my relationship keep the passion alive.', category: 'energetic' },
  { id: 'e4', blueprint: 'energetic', question: 'I am turned on by what is NOT happening as much as what is happening.', category: 'energetic' },
  { id: 'e5', blueprint: 'energetic', question: 'Too much closeness or touching can turn me off.', category: 'energetic' },

  // Sensual Questions
  { id: 's1', blueprint: 'sensual', question: 'I need to feel relaxed and stress-free to be turned on.', category: 'sensual' },
  { id: 's2', blueprint: 'sensual', question: 'The environment (lighting, music, scents) greatly affects my arousal.', category: 'sensual' },
  { id: 's3', blueprint: 'sensual', question: 'I love being touched all over my body, not just erogenous zones.', category: 'sensual' },
  { id: 's4', blueprint: 'sensual', question: 'I prefer a slow buildup to intimacy rather than jumping straight to sex.', category: 'sensual' },
  { id: 's5', blueprint: 'sensual', question: 'Massages and gentle caressing are essential for my arousal.', category: 'sensual' },

  // Sexual Questions
  { id: 'x1', blueprint: 'sexual', question: 'I love seeing and being seen naked by my partner.', category: 'sexual' },
  { id: 'x2', blueprint: 'sexual', question: 'I can get turned on quickly and don\'t need much foreplay.', category: 'sexual' },
  { id: 'x3', blueprint: 'sexual', question: 'Genital stimulation is what I crave most in intimate moments.', category: 'sexual' },
  { id: 'x4', blueprint: 'sexual', question: 'I enjoy direct communication about sex and sexual acts.', category: 'sexual' },
  { id: 'x5', blueprint: 'sexual', question: 'Orgasm is often my main goal during sexual encounters.', category: 'sexual' },

  // Kinky Questions
  { id: 'k1', blueprint: 'kinky', question: 'I enjoy power dynamics and control in my intimate relationships.', category: 'kinky' },
  { id: 'k2', blueprint: 'kinky', question: 'Taboo or forbidden aspects of sexuality excite me.', category: 'kinky' },
  { id: 'k3', blueprint: 'kinky', question: 'I like to explore intense sensations, whether pleasure or pain.', category: 'kinky' },
  { id: 'k4', blueprint: 'kinky', question: 'Psychological games and mind play turn me on.', category: 'kinky' },
  { id: 'k5', blueprint: 'kinky', question: 'I feel safest when we agree on rules, boundaries, and consent.', category: 'kinky' },

  // Shapeshifter Questions
  { id: 'sh1', blueprint: 'shapeshifter', question: 'I enjoy variety and trying new things sexually.', category: 'shapeshifter' },
  { id: 'sh2', blueprint: 'shapeshifter', question: 'I can be turned on by all the other blueprint types at different times.', category: 'shapeshifter' },
  { id: 'sh3', blueprint: 'shapeshifter', question: 'I get bored easily if we do the same things repeatedly.', category: 'shapeshifter' },
  { id: 'sh4', blueprint: 'shapeshifter', question: 'I adapt my sexual style to match my partner\'s preferences.', category: 'shapeshifter' },
  { id: 'sh5', blueprint: 'shapeshifter', question: 'I can switch between different erotic personalities or moods.', category: 'shapeshifter' }
]

export default function BlueprintComponent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [results, setResults] = useState<Record<string, number> | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [saveInProgress, setSaveInProgress] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
  }, [user, loading, router])

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
  const progress = (currentQuestionIndex / QUIZ_QUESTIONS.length) * 100

  const handleAnswer = (rating: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: rating
    }
    setAnswers(newAnswers)

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateResults(newAnswers)
    }
  }

  const calculateResults = async (finalAnswers: Record<string, number>) => {
    // Calculate scores for each blueprint
    const scores = {
      energetic: 0,
      sensual: 0,
      sexual: 0,
      kinky: 0,
      shapeshifter: 0
    }

    // Sum up scores for each blueprint category
    QUIZ_QUESTIONS.forEach(question => {
      const answer = finalAnswers[question.id] || 0
      scores[question.blueprint as keyof typeof scores] += answer
    })

    // Convert to percentages
    const maxPossibleScore = 5 * 5 // 5 questions per blueprint, max 5 points each
    const percentageScores = Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [
        key,
        Math.round((value / maxPossibleScore) * 100)
      ])
    )

    setResults(percentageScores)
    setIsCompleted(true)

    // Save results to user profile
    await saveResultsToProfile(percentageScores)
  }

  const saveResultsToProfile = async (scores: Record<string, number>) => {
    setSaveInProgress(true)
    try {
      // Find primary and secondary blueprints
      const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a)
      const primary = sortedScores[0][0]
      const secondary = sortedScores[1][1] > 60 ? sortedScores[1][0] : undefined

      // Track analytics event for assessment completion
      if (typeof window !== 'undefined') {
        try {
          // Track assessment completion - key conversion event
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'assessment_completed',
              userId: user?.uid,
              properties: {
                assessmentType: 'blueprint_quiz',
                primaryBlueprint: primary,
                secondaryBlueprint: secondary,
                totalQuestions: QUIZ_QUESTIONS.length,
                completedAt: new Date().toISOString()
              }
            })
          })
        } catch (analyticsError) {
          console.log('Analytics tracking failed:', analyticsError)
        }
      }

      // Save to Firestore user profile
      const response = await fetch('/api/blueprint/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          scores,
          primary,
          secondary,
          completedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.error('Failed to save blueprint results')
      }
    } catch (error) {
      console.error('Error saving blueprint results:', error)
    }
    setSaveInProgress(false)
  }

  const restartQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults(null)
    setIsCompleted(false)
  }

  const getPrimaryBlueprint = () => {
    if (!results) return null
    const sortedResults = Object.entries(results).sort(([,a], [,b]) => b - a)
    return EROTIC_BLUEPRINTS.find(bp => bp.id === sortedResults[0][0])
  }

  const getSecondaryBlueprint = () => {
    if (!results) return null
    const sortedResults = Object.entries(results).sort(([,a], [,b]) => b - a)
    const secondaryScore = sortedResults[1][1]
    if (secondaryScore > 60) {
      return EROTIC_BLUEPRINTS.find(bp => bp.id === sortedResults[1][0])
    }
    return null
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

  // Quiz not started - show intro
  if (!quizStarted && !isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                🧩 Erotic Blueprint Quiz
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                Discover your unique erotic blueprint to better understand your sexual desires and improve intimacy with your partner.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {EROTIC_BLUEPRINTS.map((blueprint) => (
                <Card key={blueprint.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <span className="text-2xl">{blueprint.emoji}</span>
                      {blueprint.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{blueprint.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.characteristics.map((char) => (
                        <Badge key={char} variant="secondary" className="bg-gray-700 text-gray-300">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setQuizStarted(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg"
              >
                Start Your Blueprint Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (quizStarted && !isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                </h2>
                <span className="text-gray-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">
                  Rate how much this statement applies to you:
                </p>
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      onClick={() => handleAnswer(rating)}
                      variant={answers[currentQuestion.id] === rating ? "primary" : "outline"}
                      className="h-16 text-lg"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>
              </CardContent>
            </Card>

            {currentQuestionIndex > 0 && (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                variant="outline"
                className="mr-4"
              >
                Previous
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Results page
  if (isCompleted && results) {
    const primaryBlueprint = getPrimaryBlueprint()
    const secondaryBlueprint = getSecondaryBlueprint()

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                🎉 Your Erotic Blueprint Results
              </h1>
              <p className="text-gray-300 text-lg">
                Understanding your blueprint can transform your intimate relationships
              </p>
            </div>

            {primaryBlueprint && (
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-3">
                    <span className="text-3xl">{primaryBlueprint.emoji}</span>
                    Your Primary Blueprint: {primaryBlueprint.name}
                    <Badge className="bg-pink-600 text-white">
                      {results[primaryBlueprint.id]}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-lg mb-4">
                    {primaryBlueprint.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {primaryBlueprint.characteristics.map((char) => (
                      <Badge key={char} variant="secondary" className="bg-gray-700 text-gray-300">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {secondaryBlueprint && (
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-3">
                    <span className="text-2xl">{secondaryBlueprint.emoji}</span>
                    Your Secondary Blueprint: {secondaryBlueprint.name}
                    <Badge variant="outline" className="border-gray-500 text-gray-300">
                      {results[secondaryBlueprint.id]}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    {secondaryBlueprint.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">All Your Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(results)
                    .sort(([,a], [,b]) => b - a)
                    .map(([blueprintId, score]) => {
                      const blueprint = EROTIC_BLUEPRINTS.find(bp => bp.id === blueprintId)
                      return (
                        <div key={blueprintId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{blueprint?.emoji}</span>
                            <span className="text-white">{blueprint?.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={score} className="w-32" />
                            <span className="text-white font-semibold w-12">{score}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-x-4">
              <Button
                onClick={restartQuiz}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Retake Quiz
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>

            {saveInProgress && (
              <div className="text-center mt-4">
                <p className="text-gray-400">Saving your results...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
} 