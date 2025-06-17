'use client'

import { useState } from 'react'
import Onboarding from '../../components/Onboarding'

export default function TestOnboardingPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showHome, setShowHome] = useState(false)

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowHome(true)
  }

  const handleBackToHome = () => {
    setShowOnboarding(false)
    setShowHome(true)
  }

  const restartOnboarding = () => {
    setShowOnboarding(true)
    setShowHome(false)
  }

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete}
        onBackToHome={handleBackToHome}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-white mb-4">
          ✅ Test Complete!
        </h1>
        <p className="text-gray-300 mb-8">
          You successfully navigated to the home screen from the onboarding questionnaire.
        </p>
        <button
          onClick={restartOnboarding}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  )
} 