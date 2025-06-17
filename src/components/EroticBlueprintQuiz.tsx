'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import { CouplesAnalysisService } from '../lib/database'
import type { User } from '../lib/firebase'
import Link from 'next/link'

interface QuizQuestion {
  id: string
  text: string
  blueprint: 'energetic' | 'sensual' | 'sexual' | 'kinky' | 'shapeshifter'
}

interface QuizAnswers {
  [questionId: string]: number // 1-5 scale
}

interface BlueprintScores {
  energetic: number
  sensual: number
  sexual: number
  kinky: number
  shapeshifter: number
}

interface EroticBlueprintQuizProps {
  onComplete: (scores: BlueprintScores, primary: string, secondary?: string) => void
  onBackToHome?: () => void
}

// 40 Questions - 8 per blueprint type
const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Energetic (8 questions)
  { id: 'e1', text: 'I get turned on by anticipation and the buildup before physical touch', blueprint: 'energetic' },
  { id: 'e2', text: 'I get excited when there\'s a build-up — like teasing, texting or flirting, but not touching yet.', blueprint: 'energetic' },
  { id: 'e3', text: 'Eye contact and tension without touching can be incredibly arousing', blueprint: 'energetic' },
  { id: 'e4', text: 'I prefer a slow burn approach to intimacy rather than jumping straight in', blueprint: 'energetic' },
  { id: 'e5', text: 'Teasing and being teased (without touching) really turns me on', blueprint: 'energetic' },
  { id: 'e6', text: 'I find breathing exercises and energy work sexually exciting', blueprint: 'energetic' },
  { id: 'e7', text: 'The thought of intimate connection often excites me more than the physical act', blueprint: 'energetic' },
  { id: 'e8', text: 'I can reach high states of arousal through mental/emotional connection alone', blueprint: 'energetic' },

  // Sensual (8 questions)
  { id: 's1', text: 'I love being touched all over my body, not just erogenous zones', blueprint: 'sensual' },
  { id: 's2', text: 'The setting and ambiance are crucial for my arousal (lighting, music, scents)', blueprint: 'sensual' },
  { id: 's3', text: 'Soft textures, silk, and different materials on my skin turn me on', blueprint: 'sensual' },
  { id: 's4', text: 'I prefer long, slow, full-body experiences rather than quick encounters', blueprint: 'sensual' },
  { id: 's5', text: 'Massages and gentle caressing are incredibly arousing to me', blueprint: 'sensual' },
  { id: 's6', text: 'I need to feel emotionally safe and connected to become fully aroused', blueprint: 'sensual' },
  { id: 's7', text: 'Temperature play (warm oils, ice) and different sensations excite me', blueprint: 'sensual' },
  { id: 's8', text: 'I get turned on through all my senses: taste, smell, sight, sound, and touch', blueprint: 'sensual' },

  // Sexual (8 questions)
  { id: 'x1', text: 'I enjoy direct stimulation of my genitals and erogenous zones', blueprint: 'sexual' },
  { id: 'x2', text: 'Visual stimulation (seeing bodies, watching) really turns me on', blueprint: 'sexual' },
  { id: 'x3', text: 'I like clear, direct communication about what feels good sexually', blueprint: 'sexual' },
  { id: 'x4', text: 'Nudity and seeing/being seen naked is exciting for me', blueprint: 'sexual' },
  { id: 'x5', text: 'I prefer more straightforward, physical sexual experiences', blueprint: 'sexual' },
  { id: 'x6', text: 'Traditional sexual activities (penetration, oral) are very satisfying to me', blueprint: 'sexual' },
  { id: 'x7', text: 'I can become aroused relatively quickly with physical stimulation', blueprint: 'sexual' },
  { id: 'x8', text: 'I enjoy being touched in obviously sexual ways and places', blueprint: 'sexual' },

  // Kinky (8 questions)
  { id: 'k1', text: 'I\'m aroused by power dynamics and control in intimate situations', blueprint: 'kinky' },
  { id: 'k2', text: 'Taboo or forbidden scenarios excite me sexually', blueprint: 'kinky' },
  { id: 'k3', text: 'I enjoy role-playing and fantasy scenarios during intimate time', blueprint: 'kinky' },
  { id: 'k4', text: 'Using toys, restraints, or props during sex appeals to me', blueprint: 'kinky' },
  { id: 'k5', text: 'I find psychological games and mental dominance/submission arousing', blueprint: 'kinky' },
  { id: 'k6', text: 'Breaking rules or social norms in intimate contexts turns me on', blueprint: 'kinky' },
  { id: 'k7', text: 'I enjoy exploring different identities or personas during intimate time', blueprint: 'kinky' },
  { id: 'k8', text: 'The element of surprise or unpredictability in sex excites me', blueprint: 'kinky' },

  // Shapeshifter (8 questions)
  { id: 'sh1', text: 'I enjoy variety and trying new things in my intimate life', blueprint: 'shapeshifter' },
  { id: 'sh2', text: 'My turn-ons change depending on my mood or the situation', blueprint: 'shapeshifter' },
  { id: 'sh3', text: 'I can be aroused by elements from all different erotic styles', blueprint: 'shapeshifter' },
  { id: 'sh4', text: 'I like to explore and experiment with different approaches to intimacy', blueprint: 'shapeshifter' },
  { id: 'sh5', text: 'Sometimes I want gentle sensuality, other times I want wild passion', blueprint: 'shapeshifter' },
  { id: 'sh6', text: 'I enjoy adapting my erotic energy to match my partner\'s blueprint', blueprint: 'shapeshifter' },
  { id: 'sh7', text: 'I find it exciting to discover new aspects of my sexuality over time', blueprint: 'shapeshifter' },
  { id: 'sh8', text: 'I don\'t want to be limited to just one way of experiencing pleasure', blueprint: 'shapeshifter' }
]

export default function EroticBlueprintQuiz({ onComplete, onBackToHome }: EroticBlueprintQuizProps) {
  const [user] = useAuthState(auth)
  const [showIntro, setShowIntro] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState<BlueprintScores>({
    energetic: 0,
    sensual: 0,
    sexual: 0,
    kinky: 0,
    shapeshifter: 0
  })
  const [primaryBlueprint, setPrimaryBlueprint] = useState<string>('')
  const [secondaryBlueprint, setSecondaryBlueprint] = useState<string>('')

  const currentQ = QUIZ_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100

  const handleStartAssessment = () => {
    setShowIntro(false)
  }

  const handleAnswer = async (rating: number) => {
    const newAnswers = { ...answers, [currentQ.id]: rating }
    setAnswers(newAnswers)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete, calculate scores
      await calculateScores(newAnswers)
    }
  }

  const calculateScores = async (finalAnswers: QuizAnswers) => {
    const newScores: BlueprintScores = {
      energetic: 0,
      sensual: 0,
      sexual: 0,
      kinky: 0,
      shapeshifter: 0
    }

    // Sum up scores for each blueprint
    QUIZ_QUESTIONS.forEach(question => {
      const answer = finalAnswers[question.id] || 0
      newScores[question.blueprint] += answer
    })

    // Find primary and secondary blueprints
    const sortedScores = Object.entries(newScores).sort(([,a], [,b]) => b - a)
    const primary = sortedScores[0][0]
    const secondary = sortedScores[1][1] >= (sortedScores[0][1] - 5) ? sortedScores[1][0] : undefined

    setScores(newScores)
    setPrimaryBlueprint(primary)
    setSecondaryBlueprint(secondary || '')
    setShowResults(true)

    // Save to database
    if (user) {
      try {
        // Update user document with quiz results
        await UserService.updateUser(user.uid, {
          eroticBlueprintScores: newScores,
          eroticBlueprintPrimary: primary,
          eroticBlueprintSecondary: secondary,
          onboardingCompletedAt: new Date()
        })

        // Get user data to check if they have a partner
        const userData = await UserService.getUser(user.uid)
        
        // If user has a partner, save results to couples analysis flow
        if (userData?.coupleId) {
          console.log('💕 User has partner, saving to couples analysis flow...')
          await CouplesAnalysisService.savePartnerQuizResults(
            user.uid,
            userData.coupleId,
            newScores,
            primary,
            secondary
          )
          console.log('✅ Quiz results saved to couples flow')
        }
      } catch (error) {
        console.error('Error saving quiz results:', error)
        // Don't block the UI if saving fails
      }
    }
  }

  const handleComplete = () => {
    onComplete(scores, primaryBlueprint, secondaryBlueprint)
  }

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const getBlueprintDescription = (blueprint: string): string => {
    const descriptions = {
      energetic: 'You\'re turned on by anticipation, tease, energy, and space. You enjoy the buildup and mental connection.',
      sensual: 'You love engaging all your senses - touch, taste, smell, sight, and sound. Setting and ambiance matter.',
      sexual: 'You enjoy direct, visual, and straightforward sexual experiences. You like clear communication and physical pleasure.',
      kinky: 'You\'re aroused by taboo, power play, rules, and psychological games. You enjoy exploring the forbidden.',
      shapeshifter: 'You enjoy variety and can be aroused by all different blueprint types depending on your mood and situation.'
    }
    return descriptions[blueprint as keyof typeof descriptions] || ''
  }

  const getBlueprintEmoji = (blueprint: string): string => {
    const emojis = {
      energetic: '⚡',
      sensual: '🌸',
      sexual: '🔥',
      kinky: '🎭',
      shapeshifter: '🦋'
    }
    return emojis[blueprint as keyof typeof emojis] || '❓'
  }

  // Introduction Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl w-full bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl"
        >
          {/* Header with Home Button */}
          <div className="relative mb-8">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="absolute left-0 top-0 flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 group bg-slate-800/50 hover:bg-slate-700/70 px-3 py-2 rounded-lg border border-slate-600 hover:border-slate-500"
                title="Return to home screen"
              >
                <svg 
                  className="w-5 h-5 group-hover:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm">Return Home</span>
              </button>
            )}

            {/* Main Icon */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
                <img 
                  src="/SeggsLogoNoBackground.png" 
                  alt="seggs.life logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Discover Your Erotic Blueprint
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-8">
              Understand your intimacy style, boost connection, and celebrate your unique desires.
            </h2>
          </div>

          {/* Introductory Content */}
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Welcome! The Erotic Blueprint helps you and your partner deeply understand how you both experience intimacy and pleasure. Everyone's different—what excites one person might overwhelm another.
            </p>

            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
              <h3 className="text-white font-semibold mb-4 text-lg">Through this short, private assessment you'll:</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Identify your <strong className="text-white">primary intimacy style</strong> (Energetic, Sensual, Sexual, Kinky, Shapeshifter).</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Discover what genuinely turns you on.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Learn how your desires match or differ from your partner's.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Receive personalised, thoughtful suggestions to enhance your intimate connection.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-600">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Privacy & Security</h3>
              </div>
              <p>
                Your privacy and comfort matter deeply. Your responses are <strong className="text-white">completely secure and confidential</strong>, visible only to you. After you and your partner both finish separately, we'll create a personalised couples report designed to help you explore and deepen your connection.
              </p>
            </div>

            <p className="text-center text-lg">
              Take your time. Be honest with yourself—there are no wrong answers. Let's help you enjoy a more connected and fulfilling intimacy!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-8 space-y-4">
            <motion.button
              onClick={handleStartAssessment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 text-lg shadow-lg"
            >
              ✅ Start Assessment
            </motion.button>
            
            <p className="text-gray-400 text-sm">
              40 questions • 5-10 minutes • Completely private
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-gray-800 rounded-xl p-8 border border-gray-700"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">{getBlueprintEmoji(primaryBlueprint)}</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mb-2">
              Your Erotic Blueprint Results
            </h1>
            <p className="text-gray-400">
              Your personal intimacy profile, private and secure
            </p>
          </div>

          {/* Primary Blueprint */}
          <div className="mb-6 p-6 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{getBlueprintEmoji(primaryBlueprint)}</span>
              <div>
                <h3 className="text-xl font-serif font-bold text-white capitalize">
                  {primaryBlueprint}
                </h3>
                <p className="text-sm text-gray-300">Your Primary Blueprint</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getBlueprintDescription(primaryBlueprint)}
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Score</span>
                <span>{scores[primaryBlueprint as keyof BlueprintScores]}/40</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${(scores[primaryBlueprint as keyof BlueprintScores] / 40) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Secondary Blueprint */}
          {secondaryBlueprint && (
            <div className="mb-6 p-6 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-xl">{getBlueprintEmoji(secondaryBlueprint)}</span>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white capitalize">
                    {secondaryBlueprint}
                  </h3>
                  <p className="text-sm text-gray-300">Your Secondary Blueprint</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {getBlueprintDescription(secondaryBlueprint)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Score</span>
                  <span>{scores[secondaryBlueprint as keyof BlueprintScores]}/40</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(scores[secondaryBlueprint as keyof BlueprintScores] / 40) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* All Scores */}
          <div className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-lg font-serif font-bold text-white mb-4">Your Complete Profile</h3>
            <div className="space-y-3">
              {Object.entries(scores).map(([blueprint, score]) => (
                <div key={blueprint} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getBlueprintEmoji(blueprint)}</span>
                    <span className="text-white capitalize font-medium">{blueprint}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${(score / 40) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm w-8">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <p className="text-gray-300 text-sm text-center">
              🔒 Your results are encrypted and private. Only you and your invited partner can see them.
            </p>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <div className="space-y-4">
              {/* Primary CTA - Partner Connection */}
              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                💕 Invite My Partner
              </button>
              
              {/* Secondary CTA - Dashboard Access */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Or explore your results first:
                </p>
                <Link 
                  href="/app"
                  className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
                >
                  🚀 Go to My Dashboard
                </Link>
              </div>
              
              {/* Helper text */}
              <p className="text-gray-400 text-xs mt-4">
                💡 Your results are saved. You can invite your partner anytime from your dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Quiz Questions
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header with Home Button and Progress */}
        <div className="text-center mb-8 relative">
          {/* Home Button */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="absolute left-0 top-0 flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 group bg-slate-800/50 hover:bg-slate-700/70 px-3 py-2 rounded-lg border border-slate-600 hover:border-slate-500"
              title="Go back to home screen"
            >
              <svg 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm">Home</span>
            </button>
          )}

          <div className="space-y-4">
            <h1 className="text-2xl font-serif font-bold text-white">
              Erotic Blueprint Assessment
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Discover your unique intimacy style. This private assessment will help you understand what turns you on most.
            </p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>{Math.round(progress)}% • {Object.keys(answers).length} answered</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl"
          >
            {/* Blueprint Category */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{getBlueprintEmoji(currentQ.blueprint)}</span>
              <div>
                <h3 className="text-lg font-serif font-bold text-white capitalize">
                  {currentQ.blueprint} Blueprint
                </h3>
                <p className="text-sm text-gray-400">
                  {getBlueprintDescription(currentQ.blueprint).split('.')[0]}
                </p>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl text-white font-medium leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            {/* Rating Scale */}
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                How much does this describe you?
              </p>
              
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = answers[currentQ.id] === rating
                  return (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(rating)}
                      className={`group relative p-4 rounded-lg border-2 ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-600/30' 
                          : 'border-gray-600 hover:border-purple-500'
                      } bg-gray-700 hover:bg-purple-600/20 transition-all duration-200 focus:outline-none focus:border-purple-500`}
                    >
                      <div className="text-center">
                        <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${
                          isSelected ? 'scale-110' : ''
                        }`}>
                          {rating === 1 && '😕'}
                          {rating === 2 && '🤔'}
                          {rating === 3 && '😐'}
                          {rating === 4 && '😊'}
                          {rating === 5 && '🔥'}
                        </div>
                        <div className={`font-medium text-lg ${
                          isSelected ? 'text-purple-200' : 'text-white'
                        }`}>{rating}</div>
                        <div className={`text-xs mt-1 ${
                          isSelected ? 'text-purple-300' : 'text-gray-400'
                        }`}>
                          {rating === 1 && 'Not at all'}
                          {rating === 2 && 'A little'}
                          {rating === 3 && 'Somewhat'}
                          {rating === 4 && 'Quite a bit'}
                          {rating === 5 && 'Very much'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={goBack}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>

              <div className="text-gray-400 text-sm text-center">
                {answers[currentQ.id] ? (
                  <span className="text-purple-400">✓ Answered • {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Continue to next' : 'Ready to finish'}</span>
                ) : (
                  <span>{currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Select an answer to continue' : 'Select an answer to finish'}</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 