'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import Home from './Home'
import { useEffect, useState } from 'react'

export default function AppWrapper() {
  const [user, loading, error] = useAuthState(auth)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Give Firebase auth a moment to initialize properly
    if (!loading) {
      const timer = setTimeout(() => {
        setInitialLoading(false)
      }, 1000) // Brief delay to ensure proper auth state
      
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wheat">Loading seggs.life...</p>
          <p className="text-wheat/60 text-sm mt-2">Securing your private connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-wheat mb-4">Authentication Error</h1>
          <p className="text-wheat/70 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-accent hover:bg-accent/80 text-primary px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Always show Home component - it handles the auth flow and public/private content
  // This preserves the beautiful landing page while providing proper member access
  return <Home />
} 