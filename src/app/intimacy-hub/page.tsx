'use client'

import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import { UserService } from '../../lib/database'
import type { User } from '../../lib/firebase'
import IntimacyActionHub from '../../components/IntimacyActionHub'

export default function IntimacyHubPage() {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [partnerData, setPartnerData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 Auth state changed:', { user, userType: typeof user, isNull: user === null, isUndefined: user === undefined })
    
    if (user) {
      console.log('✅ User authenticated, loading data...')
      loadUserData()
    } else if (user === null) {
      // User is not authenticated, stop loading and show error
      console.log('❌ User not authenticated')
      setLoading(false)
      setError('Please sign in to access the Intimacy Hub')
    } else {
      console.log('⏳ Auth state still checking...')
    }
    // Note: user === undefined means still checking auth state, keep loading
  }, [user])

  const loadUserData = async () => {
    try {
      if (!user) return

      const userDoc = await UserService.getUser(user.uid)
      if (!userDoc) {
        setError('User data not found')
        return
      }

      setUserData(userDoc)

      // Check if user has completed blueprint assessment
      if (!userDoc.eroticBlueprintPrimary) {
        setError('Please complete your Erotic Blueprint assessment first')
        return
      }

      // Check if user has a partner
      if (!userDoc.partnerId) {
        setError('Please connect with your partner first to access the Intimacy Action Hub')
        return
      }

      // Load partner data
      const partnerDoc = await UserService.getUser(userDoc.partnerId)
      if (!partnerDoc) {
        setError('Partner data not found')
        return
      }

      // Check if partner has completed blueprint assessment
      if (!partnerDoc.eroticBlueprintPrimary) {
        setError('Your partner needs to complete their Erotic Blueprint assessment before you can access personalised suggestions')
        return
      }

      setPartnerData(partnerDoc)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
              <img 
                src="/SeggsLogoNoBackground.png" 
                alt="seggs.life logo" 
                className="w-full h-full object-contain"
              />
            </div>
          
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Loading Your Intimacy Hub</h2>
          <p className="text-gray-300 leading-relaxed">
            Preparing your personalised intimacy suggestions...
          </p>
        </div>
      </div>
    )
  }

  if (error || !userData || !partnerData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
            <img 
              src="/SeggsLogoNoBackground.png" 
              alt="seggs.life logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Access Requirements</h2>
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="text-left space-y-2">
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${userData?.eroticBlueprintPrimary ? 'text-green-400' : 'text-gray-400'}`}>
                  {userData?.eroticBlueprintPrimary ? '✓' : '○'}
                </span>
                <span className="text-gray-300">Complete your Erotic Blueprint assessment</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${userData?.partnerId ? 'text-green-400' : 'text-gray-400'}`}>
                  {userData?.partnerId ? '✓' : '○'}
                </span>
                <span className="text-gray-300">Connect with your partner</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${partnerData?.eroticBlueprintPrimary ? 'text-green-400' : 'text-gray-400'}`}>
                  {partnerData?.eroticBlueprintPrimary ? '✓' : '○'}
                </span>
                <span className="text-gray-300">Partner completes their assessment</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {!userData?.eroticBlueprintPrimary && (
              <button
                onClick={() => window.location.href = '/test-quiz'}
                className="btn-primary w-full"
              >
                Take Blueprint Assessment
              </button>
            )}
            {!userData?.partnerId && userData?.eroticBlueprintPrimary && (
              <button
                onClick={() => window.location.href = '/partner-connect'}
                className="btn-primary w-full"
              >
                Connect with Partner
              </button>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="btn-secondary w-full"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <IntimacyActionHub userData={userData} partnerData={partnerData} />
} 