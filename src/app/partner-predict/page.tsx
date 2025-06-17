'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PredictiveQuestion {
  id: string
  question: string
  options: {
    blueprint: string
    text: string
    description: string
  }[]
}

const PREDICTIVE_QUESTIONS: PredictiveQuestion[] = [
  {
    id: 'intimacy_preference',
    question: "When it comes to intimacy, your partner typically prefers...",
    options: [
      { blueprint: 'sensual', text: 'Slow, romantic buildup', description: 'Candles, music, all senses engaged' },
      { blueprint: 'sexual', text: 'Direct, passionate connection', description: 'Straightforward physical intimacy' },
      { blueprint: 'energetic', text: 'Anticipation and teasing', description: 'Mental foreplay, buildup, surprise' },
      { blueprint: 'kinky', text: 'Creative, boundary-exploring', description: 'Power play, psychological elements' },
      { blueprint: 'shapeshifter', text: 'Variety - depends on mood', description: 'Different approaches at different times' }
    ]
  },
  {
    id: 'communication_style',
    question: "When discussing desires, your partner...",
    options: [
      { blueprint: 'sensual', text: 'Wants emotional connection first', description: 'Needs to feel safe and understood' },
      { blueprint: 'sexual', text: 'Is direct and clear about wants', description: 'Says exactly what they mean' },
      { blueprint: 'energetic', text: 'Hints and builds anticipation', description: 'Uses suggestion and buildup' },
      { blueprint: 'kinky', text: 'Explores fantasies and scenarios', description: 'Discusses roles and dynamics' },
      { blueprint: 'shapeshifter', text: 'Adapts based on the situation', description: 'Changes approach based on mood' }
    ]
  },
  {
    id: 'turn_on_pattern',
    question: "What seems to turn your partner on most?",
    options: [
      { blueprint: 'sensual', text: 'Touch, ambiance, sensory experience', description: 'Massage, soft textures, beautiful settings' },
      { blueprint: 'sexual', text: 'Visual attraction, physical touch', description: 'Seeing you, direct physical contact' },
      { blueprint: 'energetic', text: 'Mental stimulation, anticipation', description: 'Texts, teasing, buildup over time' },
      { blueprint: 'kinky', text: 'Novelty, taboo, power dynamics', description: 'Breaking routine, psychological play' },
      { blueprint: 'shapeshifter', text: 'Depends entirely on their mood', description: 'Sometimes one way, sometimes another' }
    ]
  },
  {
    id: 'energy_response',
    question: "How does your partner respond to energy and excitement?",
    options: [
      { blueprint: 'sensual', text: 'Prefers calm, grounding energy', description: 'Too much excitement can be overwhelming' },
      { blueprint: 'sexual', text: 'Matches and amplifies passion', description: 'Loves high-energy, intense moments' },
      { blueprint: 'energetic', text: 'Thrives on electric tension', description: 'The more buildup, the better' },
      { blueprint: 'kinky', text: 'Enjoys psychological intensity', description: 'Mental challenge and complexity' },
      { blueprint: 'shapeshifter', text: 'Varies by mood and timing', description: 'Sometimes calm, sometimes intense' }
    ]
  },
  {
    id: 'boundary_comfort',
    question: "When it comes to trying new things, your partner...",
    options: [
      { blueprint: 'sensual', text: 'Likes familiar with small variations', description: 'Comfort and safety first' },
      { blueprint: 'sexual', text: 'Is open if it enhances pleasure', description: 'Practical about what works' },
      { blueprint: 'energetic', text: 'Loves surprises and anticipation', description: 'Enjoys the unknown and mystery' },
      { blueprint: 'kinky', text: 'Actively seeks new experiences', description: 'Thrives on pushing boundaries' },
      { blueprint: 'shapeshifter', text: 'Depends on their current phase', description: 'Sometimes adventurous, sometimes not' }
    ]
  }
]

export default function PartnerPredictPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<{ blueprint: string; confidence: number } | null>(null)

  const handleAnswer = (questionId: string, blueprint: string) => {
    const newAnswers = { ...answers, [questionId]: blueprint }
    setAnswers(newAnswers)

    if (currentQuestion < PREDICTIVE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate results
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (allAnswers: Record<string, string>) => {
    const blueprintCounts: Record<string, number> = {}
    
    Object.values(allAnswers).forEach(blueprint => {
      blueprintCounts[blueprint] = (blueprintCounts[blueprint] || 0) + 1
    })

    const topBlueprint = Object.entries(blueprintCounts)
      .sort(([,a], [,b]) => b - a)[0]

    const confidence = (topBlueprint[1] / Object.keys(allAnswers).length) * 100

    setResults({
      blueprint: topBlueprint[0],
      confidence: Math.round(confidence)
    })
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

  const getBlueprintCompatibility = (blueprint: string) => {
    const compatibility = {
      sensual: "Focus on emotional safety, sensory experiences, and taking time to build connection.",
      sexual: "Be direct about desires, maintain physical touch, and appreciate their straightforward nature.",
      energetic: "Build anticipation through texts and teasing, create mystery and mental stimulation.",
      kinky: "Explore power dynamics respectfully, discuss fantasies, and embrace creative scenarios.",
      shapeshifter: "Stay flexible and adapt to their moods, offer variety and check in regularly."
    }
    return compatibility[blueprint as keyof typeof compatibility]
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Partner Prediction Results
            </h1>
            <p className="text-wheat/70">
              Based on your observations, here's what we predict about your partner's blueprint
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 text-center mb-8"
          >
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-semibold text-wheat mb-2">
              Predicted Blueprint: <span className="text-purple-300 capitalize">{results.blueprint}</span>
            </h2>
            <div className="text-lg text-wheat/80 mb-4">
              Confidence: {results.confidence}%
            </div>
            <p className="text-wheat/70 leading-relaxed mb-6">
              {getBlueprintDescription(results.blueprint)}
            </p>
            
            <div className="bg-purple-800/30 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">💡 How to Connect</h3>
              <p className="text-purple-100/80 text-sm">
                {getBlueprintCompatibility(results.blueprint)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Link 
              href="/app"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              🚀 Get Suggestions for Your Dynamic
            </Link>
            
            <Link 
              href="/blueprint"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              📋 Take Your Own Blueprint Assessment
            </Link>

            <Link 
              href="/invite-partner"
              className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              💌 Invite Partner to Take Their Own Assessment
            </Link>

            <div className="text-center pt-4">
              <p className="text-wheat/60 text-sm mb-2">Want to confirm this prediction?</p>
              <Link 
                href="/full-assessment"
                className="text-wheat/80 hover:text-wheat text-sm underline"
              >
                Take the full assessment together →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
            Partner Blueprint Prediction
          </h1>
          <p className="text-wheat/70 mb-4">
            Answer based on what you've observed about your partner's preferences
          </p>
          <div className="text-wheat/50">
            Question {currentQuestion + 1} of {PREDICTIVE_QUESTIONS.length}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / PREDICTIVE_QUESTIONS.length) * 100}%` }}
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
            {PREDICTIVE_QUESTIONS[currentQuestion].question}
          </h2>

          <div className="space-y-4">
            {PREDICTIVE_QUESTIONS[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(PREDICTIVE_QUESTIONS[currentQuestion].id, option.blueprint)}
                className="w-full text-left p-4 bg-gray-700/40 hover:bg-gray-600/60 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 group"
              >
                <div className="text-wheat font-medium mb-1 group-hover:text-purple-200 transition-colors">
                  {option.text}
                </div>
                <div className="text-wheat/60 text-sm">{option.description}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
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
