'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import { UserService } from '../../lib/database'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [user, loading, error] = useAuthState(auth)
  const [userData, setUserData] = useState<any>(null)
  const [userDataLoading, setUserDataLoading] = useState(true)
  const [userDataError, setUserDataError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setUserDataLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const userDoc = await UserService.getUser(user!.uid)
      setUserData(userDoc)
    } catch (error) {
      setUserDataError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setUserDataLoading(false)
    }
  }

  const resetOnboarding = async () => {
    if (user) {
      try {
        await UserService.updateUser(user.uid, { 
          onboardingCompleted: false,
          onboardingCompletedAt: undefined,
          onboardingProgress: undefined
        })
        alert('Onboarding reset! Reload the page.')
      } catch (error) {
        alert('Error resetting onboarding: ' + error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl mb-6">Debug Information</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-white text-xl mb-4">Authentication Status</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
            <p><strong>User ID:</strong> {user?.uid || 'Not authenticated'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-white text-xl mb-4">User Data Status</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>Loading:</strong> {userDataLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {userDataError || 'None'}</p>
            <p><strong>User Data Exists:</strong> {userData ? 'Yes' : 'No'}</p>
            {userData && (
              <>
                <p><strong>Onboarding Completed:</strong> {userData.onboardingCompleted ? 'Yes' : 'No'}</p>
                <p><strong>Partner ID:</strong> {userData.partnerId || 'None'}</p>
                <p><strong>Couple ID:</strong> {userData.coupleId || 'None'}</p>
              </>
            )}
          </div>
        </div>

        {userData && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-white text-xl mb-4">Full User Data</h2>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white text-xl mb-4">Actions</h2>
          <button 
            onClick={resetOnboarding}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-4"
            disabled={!user}
          >
            Reset Onboarding
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
} 