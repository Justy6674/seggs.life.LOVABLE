'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import { CouplesService } from '../lib/couplesService'

interface ModernOnboardingProps {
  onComplete: () => void
}

interface BaseQuestion {
  id: string
  question: string
  type: string
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice'
  options: string[]
}

interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice'
  options: string[]
}

interface SliderQuestion extends BaseQuestion {
  type: 'slider'
  min: number
  max: number
}

interface ScaleQuestion extends BaseQuestion {
  type: 'scale'
  category: string
}

interface TextQuestion extends BaseQuestion {
  type: 'text'
  placeholder: string
}

type Question = SingleChoiceQuestion | MultiChoiceQuestion | SliderQuestion | ScaleQuestion | TextQuestion

interface OnboardingStep {
  id: string
  title: string
  questions: Question[]
}

export default function ModernOnboarding({ onComplete }: ModernOnboardingProps) {
  const [user] = useAuthState(auth)
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  const [saving, setSaving] = useState(false)

  // Individual-focused onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'relationship_basics',
      title: 'About Your Relationship',
      questions: [
        {
          id: 'relationshipType',
          question: 'How would you describe your relationship?',
          type: 'single-choice',
          options: [
            'Heterosexual couple',
            'Same-sex couple',
            'Non-binary/queer relationship',
            'Polyamorous/open relationship',
            'Prefer not to say'
          ]
        },
        {
          id: 'relationshipStage',
          question: 'What stage best describes your relationship?',
          type: 'single-choice',
          options: [
            'Just started dating',
            'Newly committed/exclusive',
            'Living together',
            'Married/long-term partnership',
            'Parenting young children',
            'Parenting teenagers',
            'Empty nesters'
          ]
        },
        {
          id: 'timeTogethers',
          question: 'How long have you been together?',
          type: 'single-choice',
          options: [
            'Less than 6 months',
            '6 months - 2 years',
            '2-5 years',
            '5-10 years',
            '10+ years'
          ]
        }
      ]
    },
    {
      id: 'intimacy_assessment',
      title: 'Your Intimacy & Connection',
      questions: [
        {
          id: 'sexLifeSatisfaction',
          question: 'How satisfied are YOU with your sex life together? (0-10)',
          type: 'slider',
          min: 0,
          max: 10
        },
        {
          id: 'sexFrequency',
          question: 'How often do you typically have sex?',
          type: 'single-choice',
          options: [
            'Never/very rarely',
            'Once a month or less',
            '2-3 times a month',
            'Once a week',
            '2-3 times a week',
            '4-6 times a week',
            'Once a day',
            'Multiple times daily'
          ]
        },
        {
          id: 'biggestChallenge',
          question: 'What are YOUR biggest challenges with intimacy?',
          type: 'multi-choice',
          options: [
            'Different desire levels',
            'Lack of time/energy',
            'Communication about desires',
            'Stress from kids/life',
            'Body confidence issues',
            'Difficulty reaching orgasm',
            'Pain or discomfort',
            'Feeling routine/bored',
            'No major challenges'
          ]
        }
      ]
    },
    {
      id: 'erotic_blueprint',
      title: 'Your Erotic Blueprint (Rate 1-5: Not me at all → Very much me)',
      questions: [
        // Energetic
        { id: 'eb_energetic_1', question: 'Anticipation and teasing get me more turned on than immediate touch.', type: 'scale', category: 'energetic' },
        { id: 'eb_energetic_2', question: 'I enjoy eye contact and sexual tension from afar.', type: 'scale', category: 'energetic' },
        { id: 'eb_energetic_3', question: 'I can get overwhelmed by too much direct stimulation.', type: 'scale', category: 'energetic' },
        { id: 'eb_energetic_4', question: 'Space, breath, and pauses make intimacy better for me.', type: 'scale', category: 'energetic' },
        
        // Sensual  
        { id: 'eb_sensual_1', question: 'Setting, music, lighting, or scents are really important to my arousal.', type: 'scale', category: 'sensual' },
        { id: 'eb_sensual_2', question: 'I love long, sensual touch—massages, cuddles, or skin-on-skin.', type: 'scale', category: 'sensual' },
        { id: 'eb_sensual_3', question: 'I need to feel relaxed and comfortable to really enjoy sex.', type: 'scale', category: 'sensual' },
        { id: 'eb_sensual_4', question: 'Emotional connection is more important than orgasm.', type: 'scale', category: 'sensual' },
        
        // Sexual
        { id: 'eb_sexual_1', question: 'Nudity, sexual talk, and seeing my partner\'s body turn me on.', type: 'scale', category: 'sexual' },
        { id: 'eb_sexual_2', question: 'I love enthusiastic, straightforward, physical sex.', type: 'scale', category: 'sexual' },
        { id: 'eb_sexual_3', question: 'Orgasms and intercourse are high priorities for me.', type: 'scale', category: 'sexual' },
        { id: 'eb_sexual_4', question: 'I don\'t need a lot of warm-up—just get to it!', type: 'scale', category: 'sexual' },
        
        // Kinky
        { id: 'eb_kinky_1', question: 'I fantasize about trying forbidden, taboo, or "naughty" things.', type: 'scale', category: 'kinky' },
        { id: 'eb_kinky_2', question: 'Power play (dominance or submission) excites me.', type: 'scale', category: 'kinky' },
        { id: 'eb_kinky_3', question: 'Role-play, costumes, or taking on characters turns me on.', type: 'scale', category: 'kinky' },
        { id: 'eb_kinky_4', question: 'I feel safest when we agree on rules, boundaries, and consent.', type: 'scale', category: 'kinky' },
        
        // Shapeshifter
        { id: 'eb_shapeshifter_1', question: 'I enjoy all of the above and crave variety in sex.', type: 'scale', category: 'shapeshifter' },
        { id: 'eb_shapeshifter_2', question: 'Doing the same thing every time bores me.', type: 'scale', category: 'shapeshifter' },
        { id: 'eb_shapeshifter_3', question: 'My desires change with mood, partner, or situation.', type: 'scale', category: 'shapeshifter' },
        { id: 'eb_shapeshifter_4', question: 'I need novelty, surprise, or unpredictability to stay turned on.', type: 'scale', category: 'shapeshifter' }
      ]
    },
    {
      id: 'goals_and_desires',
      title: 'Your Goals & Future Vision',
      questions: [
        {
          id: 'improvementGoals',
          question: 'What would YOU most like to improve in your intimate relationship?',
          type: 'multi-choice',
          options: [
            'More frequent intimacy',
            'Try new things together',
            'Better communication about desires',
            'More non-sexual intimacy',
            'Feel more confident sexually',
            'Reduce stress affecting our sex life',
            'Address physical health concerns',
            'Deepen emotional connection'
          ]
        },
        {
          id: 'futureVision',
          question: 'How do YOU want your intimate relationship to feel in 6 months?',
          type: 'text',
          placeholder: 'Describe your ideal...'
        }
      ]
    }
  ]

  const currentStepData = steps[currentStep]
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const currentQuestionData = currentStepData.questions[currentQuestion]
  
  const totalQuestions = steps.reduce((sum, step) => sum + step.questions.length, 0)
  const completedQuestions = steps.slice(0, currentStep).reduce((sum, step) => sum + step.questions.length, 0) + currentQuestion
  const progress = Math.round((completedQuestions / totalQuestions) * 100)

  const handleAnswer = async (value: any) => {
    const newResponses = { ...responses, [currentQuestionData.id]: value }
    setResponses(newResponses)
    await saveProgress(newResponses)
    nextQuestion()
  }

  const nextQuestion = () => {
    if (currentQuestion < currentStepData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setCurrentQuestion(0)
    } else {
      completeOnboarding()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setCurrentQuestion(steps[currentStep - 1].questions.length - 1)
    }
  }

  const saveProgress = async (newResponses: any) => {
    if (!user) return
    
    setSaving(true)
    try {
      await UserService.updateUser(user.uid, {
        onboardingProgress: {
          responses: newResponses,
          currentStepIndex: currentStep,
          currentQuestionIndex: currentQuestion,
          lastUpdated: new Date()
        }
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const completeOnboarding = async () => {
    if (!user) return

    const blueprintScores = calculateBlueprintScores(responses)
    
    setSaving(true)
    try {
      await UserService.updateUser(user.uid, {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        ...responses,
        eroticBlueprintScores: blueprintScores.scores,
        eroticBlueprintPrimary: blueprintScores.primary,
        eroticBlueprintSecondary: blueprintScores.secondary
      })

      // Check if partner has also completed onboarding and generate AI report if so
      const reportGenerated = await CouplesService.checkForReportGeneration(user.uid)
      
      if (reportGenerated) {
        console.log('Couples AI report generated successfully!')
      }

      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateBlueprintScores = (responses: any) => {
    const scores = { energetic: 0, sensual: 0, sexual: 0, kinky: 0, shapeshifter: 0 }
    
    Object.entries(responses).forEach(([key, value]) => {
      if (key.startsWith('eb_')) {
        const category = key.split('_')[1] as keyof typeof scores
        if (category && scores.hasOwnProperty(category)) {
          scores[category] += Number(value) || 0
        }
      }
    })

    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a)
    return {
      scores,
      primary: sortedScores[0][0],
      secondary: sortedScores[1][1] >= sortedScores[0][1] - 3 ? sortedScores[1][0] : undefined
    }
  }

  const renderQuestion = () => {
    switch (currentQuestionData.type) {
      case 'single-choice':
        const singleChoice = currentQuestionData as SingleChoiceQuestion
        return (
          <div className="space-y-3">
            {singleChoice.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  responses[currentQuestionData.id] === option
                    ? 'border-red-deep bg-red-deep/10 text-white'
                    : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'multi-choice':
        const multiChoice = currentQuestionData as MultiChoiceQuestion
        return (
          <div className="space-y-3">
            {multiChoice.options.map((option: string, index: number) => {
              const selected = responses[currentQuestionData.id] || []
              const isSelected = selected.includes(option)
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    const newSelected = isSelected 
                      ? selected.filter((v: string) => v !== option)
                      : [...selected, option]
                    setResponses({ ...responses, [currentQuestionData.id]: newSelected })
                  }}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-red-deep bg-red-deep/10 text-white'
                      : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 ${
                      isSelected ? 'bg-red-deep border-red-deep' : 'border-gray-400'
                    }`}>
                      {isSelected && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                    </div>
                    {option}
                  </div>
                </button>
              )
            })}
            <button
              onClick={() => handleAnswer(responses[currentQuestionData.id] || [])}
              className="w-full mt-6 btn-primary"
              disabled={!responses[currentQuestionData.id]?.length}
            >
              Continue
            </button>
          </div>
        )

      case 'slider':
        const slider = currentQuestionData as SliderQuestion
        return (
          <div className="space-y-6">
            <div className="px-2">
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={responses[currentQuestionData.id] || slider.min}
                onChange={(e) => setResponses({ ...responses, [currentQuestionData.id]: Number(e.target.value) })}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Not satisfied</span>
                <span className="text-white font-semibold">
                  {responses[currentQuestionData.id] || slider.min}
                </span>
                <span>Extremely satisfied</span>
              </div>
            </div>
            <button
              onClick={() => handleAnswer(responses[currentQuestionData.id] || slider.min)}
              className="w-full btn-primary"
            >
              Continue
            </button>
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    responses[currentQuestionData.id] === value
                      ? 'border-red-deep bg-red-deep text-white'
                      : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Not me at all</span>
              <span>Very much me</span>
            </div>
          </div>
        )

      case 'text':
        const textQuestion = currentQuestionData as TextQuestion
        return (
          <div className="space-y-4">
            <textarea
              value={responses[currentQuestionData.id] || ''}
              onChange={(e) => setResponses({ ...responses, [currentQuestionData.id]: e.target.value })}
              placeholder={textQuestion.placeholder}
              className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:border-red-deep focus:ring-1 focus:ring-red-deep"
              rows={4}
            />
            <button
              onClick={() => handleAnswer(responses[currentQuestionData.id] || '')}
              className="w-full btn-primary"
            >
              Continue
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-serif font-bold text-white">{currentStepData.title}</h1>
            <span className="text-sm text-gray-400">
              {progress}% complete
            </span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-deep to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStep}-${currentQuestion}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800 rounded-lg p-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQuestionData.question}
            </h2>
            
            {renderQuestion()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={previousQuestion}
            disabled={currentStep === 0 && currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-400">
            Question {completedQuestions + 1} of {totalQuestions}
          </div>

          {saving && (
            <div className="text-sm text-gray-400 flex items-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 