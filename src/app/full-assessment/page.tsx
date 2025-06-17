'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type AssessmentPhase = 'intro' | 'personal' | 'partner' | 'results'

interface Question {
  id: string
  question: string
  options: {
    blueprint: string
    text: string
    weight: number
  }[]
}

const PERSONAL_QUESTIONS: Question[] = [
  {
    id: 'personal_turn_on',
    question: "What turns you on most?",
    options: [
      { blueprint: 'sensual', text: 'Being touched and caressed all over', weight: 3 },
      { blueprint: 'sexual', text: 'Direct physical contact and penetration', weight: 3 },
      { blueprint: 'energetic', text: 'Anticipation, flirtation, and buildup', weight: 3 },
      { blueprint: 'kinky', text: 'Psychological play and power dynamics', weight: 3 },
      { blueprint: 'shapeshifter', text: 'It depends on my mood', weight: 3 }
    ]
  },
  {
    id: 'personal_pace',
    question: "Your preferred pace of intimacy?",
    options: [
      { blueprint: 'sensual', text: 'Slow and deliberate', weight: 2 },
      { blueprint: 'sexual', text: 'Direct and passionate', weight: 2 },
      { blueprint: 'energetic', text: 'Building anticipation first', weight: 2 },
      { blueprint: 'kinky', text: 'Complex scenarios and roleplay', weight: 2 },
      { blueprint: 'shapeshifter', text: 'Varies by situation', weight: 2 }
    ]
  },
  {
    id: 'personal_communication',
    question: "How do you communicate desires?",
    options: [
      { blueprint: 'sensual', text: 'Through emotional connection', weight: 2 },
      { blueprint: 'sexual', text: 'Directly and clearly', weight: 2 },
      { blueprint: 'energetic', text: 'Through hints and teasing', weight: 2 },
      { blueprint: 'kinky', text: 'Through fantasy and scenarios', weight: 2 },
      { blueprint: 'shapeshifter', text: 'Depends on the moment', weight: 2 }
    ]
  }
]

const PARTNER_QUESTIONS: Question[] = [
  {
    id: 'partner_response',
    question: "Your partner responds best to...",
    options: [
      { blueprint: 'sensual', text: 'Gentle, sensory experiences', weight: 3 },
      { blueprint: 'sexual', text: 'Direct physical attraction', weight: 3 },
      { blueprint: 'energetic', text: 'Mental stimulation and anticipation', weight: 3 },
      { blueprint: 'kinky', text: 'Novelty and psychological play', weight: 3 },
      { blueprint: 'shapeshifter', text: 'Different approaches at different times', weight: 3 }
    ]
  },
  {
    id: 'partner_energy',
    question: "Your partner's energy style is...",
    options: [
      { blueprint: 'sensual', text: 'Calm and grounding', weight: 2 },
      { blueprint: 'sexual', text: 'High passion and intensity', weight: 2 },
      { blueprint: 'energetic', text: 'Electric and anticipatory', weight: 2 },
      { blueprint: 'kinky', text: 'Complex and psychological', weight: 2 },
      { blueprint: 'shapeshifter', text: 'Changes based on mood', weight: 2 }
    ]
  }
]

export default function FullAssessmentPage() {
  const [phase, setPhase] = useState<AssessmentPhase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [personalAnswers, setPersonalAnswers] = useState<Record<string, string>>({})
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<{
    personal: { blueprint: string; confidence: number }
    partner: { blueprint: string; confidence: number }
    compatibility: number
  } | null>(null)

  const calculateBlueprint = (answers: Record<string, string>, questions: Question[]) => {
    const blueprintScores: Record<string, number> = {}
    
    Object.entries(answers).forEach(([questionId, selectedBlueprint]) => {
      const question = questions.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.blueprint === selectedBlueprint)
        if (option) {
          blueprintScores[selectedBlueprint] = (blueprintScores[selectedBlueprint] || 0) + option.weight
        }
      }
    })

    const totalWeight = Object.values(blueprintScores).reduce((sum, weight) => sum + weight, 0)
    const topBlueprint = Object.entries(blueprintScores)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      blueprint: topBlueprint[0],
      confidence: Math.round((topBlueprint[1] / totalWeight) * 100)
    }
  }

  const calculateCompatibility = (personal: string, partner: string) => {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      sensual: { sensual: 95, sexual: 75, energetic: 80, kinky: 65, shapeshifter: 85 },
      sexual: { sensual: 75, sexual: 90, energetic: 70, kinky: 80, shapeshifter: 85 },
      energetic: { sensual: 80, sexual: 70, energetic: 95, kinky: 85, shapeshifter: 90 },
      kinky: { sensual: 65, sexual: 80, energetic: 85, kinky: 95, shapeshifter: 90 },
      shapeshifter: { sensual: 85, sexual: 85, energetic: 90, kinky: 90, shapeshifter: 95 }
    }
    
    return compatibilityMatrix[personal]?.[partner] || 70
  }

  const handlePersonalAnswer = (questionId: string, blueprint: string) => {
    const newAnswers = { ...personalAnswers, [questionId]: blueprint }
    setPersonalAnswers(newAnswers)

    if (currentQuestion < PERSONAL_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setPhase('partner')
      setCurrentQuestion(0)
    }
  }

  const handlePartnerAnswer = (questionId: string, blueprint: string) => {
    const newAnswers = { ...partnerAnswers, [questionId]: blueprint }
    setPartnerAnswers(newAnswers)

    if (currentQuestion < PARTNER_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate final results
      const personalResult = calculateBlueprint(personalAnswers, PERSONAL_QUESTIONS)
      const partnerResult = calculateBlueprint(newAnswers, PARTNER_QUESTIONS)
      const compatibility = calculateCompatibility(personalResult.blueprint, partnerResult.blueprint)

      setResults({
        personal: personalResult,
        partner: partnerResult,
        compatibility
      })
      setPhase('results')
    }
  }

  const getBlueprintDescription = (blueprint: string) => {
    const descriptions = {
      sensual: "Sensual types need all their senses engaged and prefer slow, romantic buildup with emotional connection.",
      sexual: "Sexual types are direct and passionate, preferring straightforward physical intimacy and clear communication.",
      energetic: "Energetic types thrive on anticipation and mental foreplay, loving teasing and psychological buildup.",
      kinky: "Kinky types enjoy psychological play, power dynamics, and exploring taboo or unconventional scenarios.",
      shapeshifter: "Shapeshifters are adaptable and enjoy variety, expressing different blueprint energies at different times."
    }
    return descriptions[blueprint as keyof typeof descriptions]
  }

  const getCompatibilityInsight = (personal: string, partner: string, score: number) => {
    if (score >= 90) {
      return "🔥 Exceptional compatibility! Your blueprints naturally complement and enhance each other."
    } else if (score >= 80) {
      return "✨ Great compatibility! You have strong potential for amazing connection with some awareness."
    } else if (score >= 70) {
      return "💫 Good compatibility! Understanding your differences will unlock incredible experiences."
    } else {
      return "🌱 Growing compatibility! Your different styles offer exciting opportunities for exploration."
    }
  }

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Complete Relationship Intelligence
            </h1>
            <p className="text-wheat/70 mb-8">
              Get the full picture of your dynamic with both personal and partner assessments
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-900/40 to-emerald-700/40 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30 mb-8"
          >
            <div className="text-6xl mb-4 text-center">🚀</div>
            <h2 className="text-2xl font-semibold text-wheat mb-4 text-center">
              What You'll Discover
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="text-emerald-300 text-xl">📋</div>
                <div>
                  <h3 className="text-wheat font-medium">Your Personal Blueprint</h3>
                  <p className="text-wheat/70 text-sm">Deep understanding of your unique intimacy style</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-emerald-300 text-xl">🔮</div>
                <div>
                  <h3 className="text-wheat font-medium">Your Partner's Blueprint</h3>
                  <p className="text-wheat/70 text-sm">Predictive analysis of their preferences and style</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-emerald-300 text-xl">💫</div>
                <div>
                  <h3 className="text-wheat font-medium">Compatibility Analysis</h3>
                  <p className="text-wheat/70 text-sm">How your blueprints work together and where to focus</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-emerald-300 text-xl">🎯</div>
                <div>
                  <h3 className="text-wheat font-medium">Personalized Suggestions</h3>
                  <p className="text-wheat/70 text-sm">AI-generated ideas perfect for your combination</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPhase('personal')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200"
              >
                Start Full Assessment
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link 
              href="/"
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Back to start
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  if (phase === 'personal') {
    const currentQ = PERSONAL_QUESTIONS[currentQuestion]
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Your Personal Blueprint
            </h1>
            <p className="text-wheat/70 mb-4">
              Answer honestly about your own preferences and desires
            </p>
            <div className="text-wheat/50">
              Question {currentQuestion + 1} of {PERSONAL_QUESTIONS.length} (Personal)
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / PERSONAL_QUESTIONS.length) * 50}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/30"
          >
            <h2 className="text-xl font-semibold text-wheat mb-6 text-center">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePersonalAnswer(currentQ.id, option.blueprint)}
                  className="w-full text-left p-4 bg-gray-700/40 hover:bg-gray-600/60 rounded-xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-200 group"
                >
                  <div className="text-wheat font-medium group-hover:text-blue-200 transition-colors">
                    {option.text}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (phase === 'partner') {
    const currentQ = PARTNER_QUESTIONS[currentQuestion]
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Your Partner's Blueprint
            </h1>
            <p className="text-wheat/70 mb-4">
              Based on your observations of your partner
            </p>
            <div className="text-wheat/50">
              Question {currentQuestion + 1} of {PARTNER_QUESTIONS.length} (Partner)
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${50 + ((currentQuestion + 1) / PARTNER_QUESTIONS.length) * 50}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/30"
          >
            <h2 className="text-xl font-semibold text-wheat mb-6 text-center">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePartnerAnswer(currentQ.id, option.blueprint)}
                  className="w-full text-left p-4 bg-gray-700/40 hover:bg-gray-600/60 rounded-xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-200 group"
                >
                  <div className="text-wheat font-medium group-hover:text-purple-200 transition-colors">
                    {option.text}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (phase === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Your Complete Relationship Intelligence
            </h1>
            <p className="text-wheat/70">
              Here's the full picture of your dynamic together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Results */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 backdrop-blur-sm rounded-3xl p-6 border border-blue-500/30"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h2 className="text-xl font-semibold text-wheat mb-2">Your Blueprint</h2>
                <div className="text-2xl font-bold text-blue-300 capitalize mb-3">{results.personal.blueprint}</div>
                <div className="text-blue-200 text-sm mb-4">Confidence: {results.personal.confidence}%</div>
                <p className="text-wheat/70 text-sm">
                  {getBlueprintDescription(results.personal.blueprint)}
                </p>
              </div>
            </motion.div>

            {/* Partner Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🔮</div>
                <h2 className="text-xl font-semibold text-wheat mb-2">Partner's Blueprint</h2>
                <div className="text-2xl font-bold text-purple-300 capitalize mb-3">{results.partner.blueprint}</div>
                <div className="text-purple-200 text-sm mb-4">Confidence: {results.partner.confidence}%</div>
                <p className="text-wheat/70 text-sm">
                  {getBlueprintDescription(results.partner.blueprint)}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Compatibility Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-900/40 to-emerald-700/40 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30 text-center mb-8"
          >
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-2xl font-semibold text-wheat mb-4">
              Compatibility Score: {results.compatibility}%
            </h2>
            <p className="text-wheat/80 mb-6 max-w-2xl mx-auto">
              {getCompatibilityInsight(results.personal.blueprint, results.partner.blueprint, results.compatibility)}
            </p>
            
            <div className="bg-emerald-800/30 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-emerald-200 mb-2">🎯 Your Dynamic</h3>
              <p className="text-emerald-100/80 text-sm">
                As a {results.personal.blueprint} paired with a {results.partner.blueprint}, you have a unique opportunity to explore 
                both {results.personal.blueprint} and {results.partner.blueprint} experiences together.
              </p>
            </div>
          </motion.div>

          {/* Action Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Link 
              href="/app"
              className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              🚀 Get Personalized Suggestions for Your Dynamic
            </Link>
            
            <Link 
              href="/blueprint-combo"
              className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              📊 Deep Dive into Your Combination
            </Link>

            <Link 
              href="/invite-partner"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              💌 Invite Partner to Confirm Their Blueprint
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
