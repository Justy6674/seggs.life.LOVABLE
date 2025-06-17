'use client'

import { useState, useEffect } from 'react'

interface CheckInPrompt {
  type: 'monthly' | 'quarterly' | 'anniversary'
  title: string
  description: string
  lastShown?: Date
  priority: number
}

export default function ProactiveCheckInSystem() {
  const [currentPrompt, setCurrentPrompt] = useState<CheckInPrompt | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Mock user data for development
    const mockUser = {
      lastActive: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      relationshipStart: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
      lastMonthlyCheckIn: Date.now() - 35 * 24 * 60 * 60 * 1000, // 35 days ago
      lastQuarterlyCheckIn: Date.now() - 95 * 24 * 60 * 60 * 1000, // 95 days ago
      lastAnniversaryCheckIn: Date.now() - 400 * 24 * 60 * 60 * 1000 // 400 days ago
    }

    // Get user's last activity and relationship start date
    const lastActivity = new Date(mockUser.lastActive)
    const relationshipStart = new Date(mockUser.relationshipStart)
    const now = new Date()

    // Calculate time differences
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceStart = Math.floor((now.getTime() - relationshipStart.getTime()) / (1000 * 60 * 60 * 24))

    // Monthly check-in (after 30 days of usage)
    const lastMonthlyCheck = new Date(mockUser.lastMonthlyCheckIn)
    const daysSinceMonthlyCheck = Math.floor((now.getTime() - lastMonthlyCheck.getTime()) / (1000 * 60 * 60 * 24))

    // Quarterly assessment (every 90 days)
    const lastQuarterlyCheck = new Date(mockUser.lastQuarterlyCheckIn)
    const daysSinceQuarterlyCheck = Math.floor((now.getTime() - lastQuarterlyCheck.getTime()) / (1000 * 60 * 60 * 24))

    // Anniversary check (yearly)
    const isAnniversaryMonth = daysSinceStart % 365 < 30 && daysSinceStart > 335
    const lastAnniversaryCheck = new Date(mockUser.lastAnniversaryCheckIn)
    const daysSinceAnniversaryCheck = Math.floor((now.getTime() - lastAnniversaryCheck.getTime()) / (1000 * 60 * 60 * 24))

    let promptToShow: CheckInPrompt | null = null

    // Prioritize prompts (anniversary > quarterly > monthly)
    if (isAnniversaryMonth && daysSinceAnniversaryCheck > 350) {
      promptToShow = {
        type: 'anniversary',
        title: '🎉 Relationship Anniversary Reflection',
        description: 'Take a moment to celebrate how far you\'ve both come. How has your relationship grown this year?',
        priority: 1
      }
    } else if (daysSinceQuarterlyCheck >= 90 && daysSinceStart > 90) {
      promptToShow = {
        type: 'quarterly',
        title: '🔄 Quarterly Blueprint Check-In',
        description: 'Time for a fresh perspective! How have your relationship patterns evolved over the past few months?',
        priority: 2
      }
    } else if (daysSinceMonthlyCheck >= 30 && daysSinceStart > 30) {
      promptToShow = {
        type: 'monthly',
        title: '💫 Monthly Relationship Pulse',
        description: 'How are things going? Let\'s check in on your relationship goals and celebrate recent wins.',
        priority: 3
      }
    }

    // Smart timing: don't show if user just logged in or is very active
    const shouldShow = promptToShow && 
                      daysSinceActivity < 7 && // User is somewhat active
                      daysSinceActivity > 1    // But not just logged in

    if (shouldShow) {
      setCurrentPrompt(promptToShow)
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    // In a real app, this would update the user's last check-in date
    console.log(`Dismissed ${currentPrompt?.type} check-in`)
  }

  const handleAccept = () => {
    if (!currentPrompt) return
    
    setIsVisible(false)
    
    // Route to appropriate check-in flow
    switch (currentPrompt.type) {
      case 'monthly':
        window.location.href = '/monthly-checkin'
        break
      case 'quarterly':
        window.location.href = '/blueprint?reassessment=true'
        break
      case 'anniversary':
        window.location.href = '/relationship-timeline?highlight=anniversary'
        break
    }
  }

  if (!isVisible || !currentPrompt) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentPrompt.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentPrompt.description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Let's Check In
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Smart timing based on your usage patterns
          </p>
        </div>
      </div>
    </div>
  )
} 