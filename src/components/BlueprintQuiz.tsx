"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Scientifically accurate Erotic Blueprint questions
const BLUEPRINT_QUESTIONS = [
  {
    id: 1,
    question: "I am most turned on when my partner sets the scene with candles, music, and creates a beautiful ambiance.",
    type: "sensual"
  },
  {
    id: 2,
    question: "I prefer direct, passionate physical connection without too much buildup.",
    type: "sexual"
  },
  {
    id: 3,
    question: "The anticipation and mental teasing excites me more than the actual physical act.",
    type: "energetic"
  },
  {
    id: 4,
    question: "I'm aroused by psychological games, power dynamics, or taboo scenarios.",
    type: "kinky"
  },
  {
    id: 5,
    question: "I enjoy variety and can be turned on by different things depending on my mood.",
    type: "shapeshifter"
  },
  {
    id: 6,
    question: "Touch is important to me, but the way I'm touched matters more than where.",
    type: "sensual"
  },
  {
    id: 7,
    question: "I like when my partner is direct about what they want sexually.",
    type: "sexual"
  },
  {
    id: 8,
    question: "Being desired and pursued is more exciting than the actual sexual encounter.",
    type: "energetic"
  },
  {
    id: 9,
    question: "I'm curious about exploring roles, fantasies, or unconventional scenarios.",
    type: "kinky"
  },
  {
    id: 10,
    question: "My sexual preferences change based on my partner, mood, or circumstances.",
    type: "shapeshifter"
  },
  {
    id: 11,
    question: "I need to feel emotionally connected before I can be fully aroused.",
    type: "sensual"
  },
  {
    id: 12,
    question: "I can be ready for sex quickly without needing much foreplay.",
    type: "sexual"
  },
  {
    id: 13,
    question: "The best part of sex is the buildup and anticipation beforehand.",
    type: "energetic"
  },
  {
    id: 14,
    question: "I'm excited by the idea of being dominated or dominating my partner.",
    type: "kinky"
  },
  {
    id: 15,
    question: "I can enjoy both slow romantic encounters and quick passionate ones.",
    type: "shapeshifter"
  },
  {
    id: 16,
    question: "Romantic gestures and thoughtful details make me feel most desired.",
    type: "sensual"
  },
  {
    id: 17,
    question: "I prefer when my partner shows their desire through physical actions rather than words.",
    type: "sexual"
  },
  {
    id: 18,
    question: "Sexting, flirting, and mental seduction throughout the day turns me on.",
    type: "energetic"
  },
  {
    id: 19,
    question: "I'm interested in using toys, restraints, or other accessories in the bedroom.",
    type: "kinky"
  },
  {
    id: 20,
    question: "I can switch between being the pursuer and being pursued depending on the situation.",
    type: "shapeshifter"
  },
  {
    id: 21,
    question: "I need all my senses engaged - sight, sound, smell, taste, and touch.",
    type: "sensual"
  },
  {
    id: 22,
    question: "I like it when my partner takes charge and initiates physical intimacy confidently.",
    type: "sexual"
  },
  {
    id: 23,
    question: "I prefer being teased and having desire built up slowly over time.",
    type: "energetic"
  },
  {
    id: 24,
    question: "The psychology of sex - the mind games and power play - excites me most.",
    type: "kinky"
  },
  {
    id: 25,
    question: "I can appreciate both vanilla and kinky experiences equally.",
    type: "shapeshifter"
  },
  {
    id: 26,
    question: "Massage, gentle caressing, and skin-to-skin contact are essential for my arousal.",
    type: "sensual"
  },
  {
    id: 27,
    question: "I'm turned on by confident, direct communication about sexual desires.",
    type: "sexual"
  },
  {
    id: 28,
    question: "I love the chase - both being chased and chasing my partner.",
    type: "energetic"
  },
  {
    id: 29,
    question: "I'm curious about exploring different roles and scenarios in the bedroom.",
    type: "kinky"
  },
  {
    id: 30,
    question: "My turn-ons vary greatly from encounter to encounter.",
    type: "shapeshifter"
  },
  {
    id: 31,
    question: "Beautiful lingerie, silk sheets, and aesthetic pleasure enhance my experience.",
    type: "sensual"
  },
  {
    id: 32,
    question: "I appreciate when my partner is straightforward about their physical needs.",
    type: "sexual"
  },
  {
    id: 33,
    question: "Eye contact, whispered promises, and emotional intensity are my biggest turn-ons.",
    type: "energetic"
  },
  {
    id: 34,
    question: "I'm excited by the forbidden, taboo, or unconventional.",
    type: "kinky"
  },
  {
    id: 35,
    question: "I can adapt to and enjoy my partner's preferences even if they're different from mine.",
    type: "shapeshifter"
  },
  {
    id: 36,
    question: "The environment and mood need to be just right for me to fully relax and enjoy myself.",
    type: "sensual"
  },
  {
    id: 37,
    question: "I prefer passionate, intense physical connection over slow romantic buildup.",
    type: "sexual"
  },
  {
    id: 38,
    question: "Mental and emotional foreplay is more important to me than physical foreplay.",
    type: "energetic"
  },
  {
    id: 39,
    question: "I'm interested in exploring power exchange or control dynamics.",
    type: "kinky"
  },
  {
    id: 40,
    question: "I can enjoy being both dominant and submissive depending on the mood.",
    type: "shapeshifter"
  },
  {
    id: 41,
    question: "I need to feel cherished and emotionally safe to be sexually open.",
    type: "sensual"
  },
  {
    id: 42,
    question: "I'm most satisfied when sexual encounters are direct and to the point.",
    type: "sexual"
  },
  {
    id: 43,
    question: "The space between desire and fulfillment is where I find the most excitement.",
    type: "energetic"
  },
  {
    id: 44,
    question: "I'm curious about pushing boundaries and trying new things that feel edgy.",
    type: "kinky"
  },
  {
    id: 45,
    question: "I can find something appealing in most sexual scenarios or approaches.",
    type: "shapeshifter"
  },
  {
    id: 46,
    question: "I need time to warm up and prefer gradual escalation of intimacy.",
    type: "sensual"
  },
  {
    id: 47,
    question: "I appreciate when my partner expresses their desire through bold physical gestures.",
    type: "sexual"
  },
  {
    id: 48,
    question: "Being wanted and pursued feels better than actually having sex sometimes.",
    type: "energetic"
  },
  {
    id: 49,
    question: "I'm drawn to scenarios that involve elements of risk, surprise, or transgression.",
    type: "kinky"
  },
  {
    id: 50,
    question: "I enjoy being the type of lover my partner needs in any given moment.",
    type: "shapeshifter"
  }
]

const BLUEPRINT_DESCRIPTIONS = {
  sensual: {
    name: "Sensual",
    description: "You're aroused through all five senses and need emotional connection, ambiance, and gradual buildup.",
    color: "bg-pink-500"
  },
  sexual: {
    name: "Sexual", 
    description: "You prefer direct, passionate physical connection and appreciate straightforward communication about desires.",
    color: "bg-red-500"
  },
  energetic: {
    name: "Energetic",
    description: "You're turned on by anticipation, mental foreplay, and the space between desire and fulfillment.",
    color: "bg-purple-500"
  },
  kinky: {
    name: "Kinky",
    description: "You're aroused by psychological play, power dynamics, taboo scenarios, and pushing boundaries.",
    color: "bg-indigo-500"
  },
  shapeshifter: {
    name: "Shapeshifter",
    description: "You enjoy variety and can adapt to different scenarios, moods, and partner preferences.",
    color: "bg-emerald-500"
  }
}

interface BlueprintQuizProps {
  onComplete: (results: BlueprintResults) => void
  userEmail?: string
}

interface BlueprintResults {
  sensual: number
  sexual: number
  energetic: number
  kinky: number
  shapeshifter: number
  primaryType: string
  secondaryType: string
  scores: { [key: string]: number }
}

export default function BlueprintQuiz({ onComplete, userEmail }: BlueprintQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<BlueprintResults | null>(null)

  const progress = ((currentQuestion + 1) / BLUEPRINT_QUESTIONS.length) * 100

  const handleAnswer = (rating: number) => {
    const newAnswers = { ...answers, [currentQuestion]: rating }
    setAnswers(newAnswers)

    if (currentQuestion < BLUEPRINT_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      // Quiz complete - calculate results
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (allAnswers: { [key: number]: number }) => {
    const scores = {
      sensual: 0,
      sexual: 0, 
      energetic: 0,
      kinky: 0,
      shapeshifter: 0
    }

    // Calculate scores for each blueprint type
    BLUEPRINT_QUESTIONS.forEach((question, index) => {
      const answer = allAnswers[index] || 0
      scores[question.type as keyof typeof scores] += answer
    })

    // Convert to percentages
    const maxPossibleScore = 10 * 5 // 10 questions per type * max rating of 5
    const percentageScores = {
      sensual: Math.round((scores.sensual / maxPossibleScore) * 100),
      sexual: Math.round((scores.sexual / maxPossibleScore) * 100),
      energetic: Math.round((scores.energetic / maxPossibleScore) * 100),
      kinky: Math.round((scores.kinky / maxPossibleScore) * 100),
      shapeshifter: Math.round((scores.shapeshifter / maxPossibleScore) * 100)
    }

    // Find primary and secondary types
    const sortedTypes = Object.entries(percentageScores)
      .sort(([,a], [,b]) => b - a)
    
    const primaryType = sortedTypes[0][0]
    const secondaryType = sortedTypes[1][0]

    const finalResults: BlueprintResults = {
      ...percentageScores,
      primaryType,
      secondaryType,
      scores: percentageScores
    }

    setResults(finalResults)
    setIsComplete(true)
    onComplete(finalResults)
  }

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (isComplete && results) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-containerAccent rounded-2xl p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-cta rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-3xl font-primary font-bold text-textMain mb-2">
              Your Blueprint is Complete!
            </h2>
            <p className="text-textMain/70">
              Understanding your unique intimacy profile
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-primaryBg rounded-xl p-6">
              <h3 className="text-xl font-semibold text-textMain mb-4">Your Primary Type</h3>
              <div className="flex items-center justify-center mb-3">
                <div className={`w-4 h-4 rounded-full ${BLUEPRINT_DESCRIPTIONS[results.primaryType as keyof typeof BLUEPRINT_DESCRIPTIONS].color} mr-3`}></div>
                <span className="text-2xl font-bold text-textMain">
                  {BLUEPRINT_DESCRIPTIONS[results.primaryType as keyof typeof BLUEPRINT_DESCRIPTIONS].name} ({results.scores[results.primaryType]}%)
                </span>
              </div>
              <p className="text-textMain/80 text-sm">
                {BLUEPRINT_DESCRIPTIONS[results.primaryType as keyof typeof BLUEPRINT_DESCRIPTIONS].description}
              </p>
            </div>

            <div className="bg-primaryBg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-textMain mb-4">Your Full Blueprint Profile</h3>
              <div className="space-y-3">
                {Object.entries(results.scores).map(([type, score]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${BLUEPRINT_DESCRIPTIONS[type as keyof typeof BLUEPRINT_DESCRIPTIONS].color} mr-3`}></div>
                      <span className="text-textMain capitalize">{type}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-primaryBg/50 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${BLUEPRINT_DESCRIPTIONS[type as keyof typeof BLUEPRINT_DESCRIPTIONS].color}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-textMain font-medium w-10 text-right">{score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-textMain/60 text-sm mb-6">
              Ready to discover what this means for your relationship?
            </p>
            <button
              onClick={() => window.location.href = '/app'}
              className="bg-cta hover:bg-cta/90 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primaryBg flex flex-col">
      {/* Header with Progress */}
      <div className="p-4 border-b border-textMain/20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goBack}
              disabled={currentQuestion === 0}
              className={`p-2 rounded-lg transition-colors ${
                currentQuestion === 0 
                  ? 'text-textMain/30 cursor-not-allowed' 
                  : 'text-textMain hover:bg-containerAccent'
              }`}
            >
              ← Back
            </button>
            <span className="text-textMain/70 text-sm">
              {currentQuestion + 1} of {BLUEPRINT_QUESTIONS.length}
            </span>
          </div>
          
          <div className="w-full bg-containerAccent rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-cta h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-primary font-bold text-textMain mb-8 leading-relaxed">
                {BLUEPRINT_QUESTIONS[currentQuestion].question}
              </h2>

              <div className="space-y-4">
                <p className="text-textMain/70 mb-8">
                  How much does this resonate with you?
                </p>
                
                <div className="flex justify-center space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(rating)}
                      className={`w-16 h-16 rounded-full border-2 border-textMain/30 flex items-center justify-center text-lg font-semibold transition-all hover:border-cta hover:bg-cta/10 ${
                        answers[currentQuestion] === rating 
                          ? 'bg-cta border-cta text-white' 
                          : 'text-textMain hover:text-cta'
                      }`}
                    >
                      {rating}
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex justify-between text-sm text-textMain/60 mt-4">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="p-4 text-center">
        <p className="text-textMain/50 text-xs">
          Answer honestly - there are no right or wrong answers
        </p>
      </div>
    </div>
  )
} 