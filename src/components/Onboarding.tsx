'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService, CoupleService } from '../lib/database'
import type { User } from '../lib/firebase'
import EroticBlueprintQuiz from './EroticBlueprintQuiz'
import PartnerConnect from './PartnerConnect'

interface OnboardingProps {
  onComplete: () => void
  onBackToHome?: () => void
}

interface BlueprintScores {
  energetic: number
  sensual: number
  sexual: number
  kinky: number
  shapeshifter: number
}

export default function Onboarding({ onComplete, onBackToHome }: OnboardingProps) {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [currentStep, setCurrentStep] = useState<'basics' | 'quiz' | 'partner'>('basics')
  const [loading, setLoading] = useState(false)

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      const data = await UserService.getUser(user.uid)
      setUserData(data)
      
      // Determine starting step based on completion status
      if (data?.onboardingCompletedAt) {
        // User has completed onboarding, go to partner step
        setCurrentStep('partner')
      } else if (data?.relationshipType) {
        // User has filled basics, go to quiz
        setCurrentStep('quiz')
      } else {
        // Start from basics
        setCurrentStep('basics')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleBasicsComplete = async (basicInfo: {
    relationshipType: 'heterosexual' | 'same_sex' | 'non_binary_queer' | 'poly_open' | 'prefer_not_to_say'
    relationshipLength: string
    sexLifeSatisfaction: number
    biggestChallenge: string[]
    improvementGoals: string[]
  }) => {
    if (!user) return

    setLoading(true)
    try {
      // Map to the correct User interface fields
      await UserService.updateUser(user.uid, {
        relationshipType: basicInfo.relationshipType,
        timeTogethers: basicInfo.relationshipLength as '<6_months' | '6_24_months' | '2_5_years' | '5_10_years' | '10_plus_years',
        sexLifeSatisfaction: basicInfo.sexLifeSatisfaction,
        biggestChallenges: basicInfo.biggestChallenge,
        improvementGoals: basicInfo.improvementGoals
      })
      setCurrentStep('quiz')
    } catch (error) {
      console.error('Error saving basics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = async (scores: BlueprintScores, primary: string, secondary?: string) => {
    if (!user) return

    setLoading(true)
    try {
      await UserService.updateUser(user.uid, {
        eroticBlueprintScores: scores,
        eroticBlueprintPrimary: primary,
        eroticBlueprintSecondary: secondary,
        onboardingCompletedAt: new Date()
      })
      setCurrentStep('partner')
    } catch (error) {
      console.error('Error saving quiz results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePartnerComplete = () => {
    onComplete()
  }

  // Render basics form
  if (currentStep === 'basics') {
    return <BasicsForm onComplete={handleBasicsComplete} onBackToHome={onBackToHome} />
  }

  // Render quiz
  if (currentStep === 'quiz') {
    return (
      <EroticBlueprintQuiz 
        onComplete={handleQuizComplete}
        onBackToHome={onBackToHome}
      />
    )
  }

  // Render partner connection
  if (currentStep === 'partner') {
    return (
      <PartnerConnect 
        onComplete={handlePartnerComplete}
      />
    )
  }

  return null
}

// Relationship basics form component
function BasicsForm({ 
  onComplete, 
  onBackToHome 
}: { 
  onComplete: (data: {
    relationshipType: 'heterosexual' | 'same_sex' | 'non_binary_queer' | 'poly_open' | 'prefer_not_to_say'
    relationshipLength: string
    sexLifeSatisfaction: number
    biggestChallenge: string[]
    improvementGoals: string[]
  }) => void
  onBackToHome?: () => void 
}) {
  const [formData, setFormData] = useState({
    relationshipType: '' as 'heterosexual' | 'same_sex' | 'non_binary_queer' | 'poly_open' | 'prefer_not_to_say' | '',
    relationshipLength: '',
    sexLifeSatisfaction: 5,
    biggestChallenge: [] as string[],
    improvementGoals: [] as string[]
  })

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const questions = [
    {
      id: 'relationshipType' as const,
      title: 'What is your relationship type?',
      type: 'radio' as const,
      options: [
        { value: 'heterosexual' as const, label: 'Heterosexual couple' },
        { value: 'same_sex' as const, label: 'Same-sex couple' },
        { value: 'non_binary_queer' as const, label: 'Non-binary/queer' },
        { value: 'poly_open' as const, label: 'Polyamorous' },
        { value: 'prefer_not_to_say' as const, label: 'Prefer not to say' }
      ]
    },
    {
      id: 'relationshipLength' as const,
      title: 'How long have you been together?',
      type: 'radio' as const,
      options: [
        { value: '<6_months', label: 'Less than 6 months' },
        { value: '6_24_months', label: '6 months to 2 years' },
        { value: '2_5_years', label: '2-5 years' },
        { value: '5_10_years', label: '5-10 years' },
        { value: '10_plus_years', label: 'More than 10 years' }
      ]
    },
    {
      id: 'sexLifeSatisfaction' as const,
      title: 'How satisfied are YOU personally with your intimate life?',
      type: 'slider' as const,
      min: 1,
      max: 10
    },
    {
      id: 'biggestChallenge' as const,
      title: 'What is YOUR biggest personal challenge in intimacy?',
      type: 'multiselect' as const,
      options: [
        { value: 'low_desire', label: 'Low desire or libido' },
        { value: 'time_energy', label: 'Lack of time or energy' },
        { value: 'stress_kids', label: 'Stress from work/kids' },
        { value: 'different_turn_ons', label: 'Different turn-ons than partner' },
        { value: 'orgasm_difficulty', label: 'Difficulty reaching orgasm' },
        { value: 'pain_discomfort', label: 'Pain or discomfort during sex' },
        { value: 'body_confidence', label: 'Body confidence issues' },
        { value: 'relationship_tension', label: 'Relationship tension' },
        { value: 'medical_medications', label: 'Medical/medication side effects' },
        { value: 'communication', label: 'Communication about desires' },
        { value: 'no_challenges', label: 'No significant challenges' }
      ]
    },
    {
      id: 'improvementGoals' as const,
      title: 'What are YOUR personal goals for improving intimacy?',
      type: 'multiselect' as const,
      options: [
        { value: 'more_frequent_sex', label: 'More frequent intimacy' },
        { value: 'new_adventures', label: 'Try new things/adventures' },
        { value: 'better_communication', label: 'Better communication about desires' },
        { value: 'more_intimacy_non_sexual', label: 'More non-sexual intimacy' },
        { value: 'more_confidence', label: 'Build confidence in bedroom' },
        { value: 'fix_specific_issue', label: 'Address specific physical issue' },
        { value: 'emotional_connection', label: 'Deeper emotional connection' },
        { value: 'stress_reduction', label: 'Reduce stress affecting intimacy' },
        { value: 'explore_fantasies', label: 'Explore fantasies safely' }
      ]
    }
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Type-safe completion call
      if (formData.relationshipType !== '') {
        onComplete({
          relationshipType: formData.relationshipType,
          relationshipLength: formData.relationshipLength,
          sexLifeSatisfaction: formData.sexLifeSatisfaction,
          biggestChallenge: formData.biggestChallenge,
          improvementGoals: formData.improvementGoals
        })
      }
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleMultiselect = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[]
      const isSelected = currentArray.includes(value)
      
      if (isSelected) {
        return { ...prev, [field]: currentArray.filter(item => item !== value) }
      } else {
        return { ...prev, [field]: [...currentArray, value] }
      }
    })
  }

  const isCurrentAnswered = () => {
    const value = formData[currentQ.id as keyof typeof formData]
    if (currentQ.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0
    }
    return value !== '' && value !== undefined
  }

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
              Your Personal Assessment
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Help us personalise your experience. This is private and individual - only you will see these answers.
            </p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Step {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
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
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl text-white font-medium leading-relaxed">
                {currentQ.title}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQ.type === 'radio' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFormData(currentQ.id, option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData[currentQ.id as keyof typeof formData] === option.value
                          ? 'border-purple-500 bg-purple-600/20 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'multiselect' && (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">Select all that apply:</p>
                  {currentQ.options?.map((option) => {
                    const isSelected = (formData[currentQ.id as keyof typeof formData] as string[]).includes(option.value)
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleMultiselect(currentQ.id, option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-600/20 text-white'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-400 bg-purple-500' : 'border-gray-500'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQ.type === 'slider' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      {formData.sexLifeSatisfaction}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formData.sexLifeSatisfaction <= 3 && 'Not very satisfied'}
                      {formData.sexLifeSatisfaction > 3 && formData.sexLifeSatisfaction <= 7 && 'Moderately satisfied'}
                      {formData.sexLifeSatisfaction > 7 && 'Very satisfied'}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={currentQ.min}
                    max={currentQ.max}
                    value={formData.sexLifeSatisfaction}
                    onChange={(e) => updateFormData(currentQ.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Not satisfied</span>
                    <span>Extremely satisfied</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!isCurrentAnswered()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                {currentQuestion === questions.length - 1 ? 'Continue to Quiz' : 'Next'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 