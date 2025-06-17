'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import { UserService } from '../../lib/database'
import { deleteField } from 'firebase/firestore'

export default function TestPage() {
  const [user] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const testRestartOnboarding = async () => {
    if (!user) {
      setMessage('Please sign in first')
      return
    }

    setLoading(true)
    setMessage('Testing restart onboarding...')

    try {
      const updateData: any = {
        onboardingCompleted: false,
        onboardingCompletedAt: deleteField(), // Remove the field entirely
        onboardingProgress: {
          responses: {},
          currentStepIndex: 0,
          currentQuestionIndex: 0,
          blueprintQuizAnswers: {},
          lastUpdated: new Date()
        },
        updatedAt: new Date()
      }

      await UserService.updateUser(user.uid, updateData)
      setMessage('✅ Onboarding restart successful! No Firebase errors.')
    } catch (error: any) {
      console.error('Error:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Onboarding Restart</h1>
        
        <div className="mb-4">
          <p className="text-gray-300 mb-2">User: {user?.email || 'Not signed in'}</p>
        </div>

        <button
          onClick={testRestartOnboarding}
          disabled={loading || !user}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors w-full mb-4"
        >
          {loading ? 'Testing...' : 'Test Restart Onboarding'}
        </button>

        {message && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>This tests the deleteField() function to ensure it properly removes the onboardingCompletedAt field without causing undefined value errors.</p>
        </div>
      </div>
    </div>
  )
} 