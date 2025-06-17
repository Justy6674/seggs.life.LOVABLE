'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService, CoupleService } from '../lib/database'
import type { User } from '../lib/firebase'
import Image from 'next/image'
import { deleteField } from 'firebase/firestore'

type ConnectionMode = 'invite' | 'join'

interface PartnerConnectProps {
  onComplete: () => void
  onRestartOnboarding?: () => void
}

export default function PartnerConnect({ onComplete, onRestartOnboarding }: PartnerConnectProps) {
  const [user] = useAuthState(auth)
  const [mode, setMode] = useState<ConnectionMode>('invite')
  const [inviteCode, setInviteCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'invite') {
      generateInviteCode()
    }
  }, [mode])

  const generateInviteCode = () => {
    // Generate a 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
  }

  const createInviteCode = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await UserService.updateUser(user.uid, {
        inviteCode: generatedCode,
        updatedAt: new Date()
      })

      setSuccess('Invite code created! Share this with your partner.')
    } catch (error) {
      console.error('Error creating invite code:', error)
      setError('Failed to create invite code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const joinWithCode = async () => {
    if (!user || !inviteCode.trim()) {
      setError('Please enter an invite code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Find user with this invite code
      const invitingUser = await UserService.findUserByInviteCode(inviteCode.toUpperCase())
      
      if (!invitingUser) {
        setError('Invalid invite code. Please check and try again.')
        return
      }

      if (invitingUser.id === user.uid) {
        setError('You cannot use your own invite code.')
        return
      }

      if (invitingUser.partnerId) {
        setError('This user is already paired with someone else.')
        return
      }

      // Create couple relationship
      const coupleId = await CoupleService.createCouple(invitingUser.id, user.uid)

      // Clear the invite code from the inviting user
      await UserService.updateUser(invitingUser.id, {
        inviteCode: undefined,
        updatedAt: new Date()
      })

      setSuccess('Successfully connected! Welcome to your shared space.')
      
      // Complete the connection after a short delay
      setTimeout(() => {
        onComplete()
      }, 2000)

    } catch (error) {
      console.error('Error joining with code:', error)
      setError('Failed to connect with partner. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const skipPartnerConnection = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Mark as wanting to use solo for now
      await UserService.updateUser(user.uid, {
        usingAs: 'solo',
        updatedAt: new Date()
      })

      setSuccess('Continuing solo - you can always connect with a partner later!')
      
      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (error) {
      console.error('Error skipping partner connection:', error)
      setError('Failed to continue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const restartOnboarding = async () => {
    if (!user || !onRestartOnboarding) return

    setLoading(true)
    try {
      // Reset all onboarding-related fields properly - don't use undefined values
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

      setSuccess('Resetting onboarding...')
      
      setTimeout(() => {
        onRestartOnboarding()
      }, 1000)
    } catch (error) {
      console.error('Error restarting onboarding:', error)
      setError('Failed to restart onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setSuccess('Invite code copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Failed to copy code. Please copy it manually.')
    }
  }

  const shareInviteCode = async () => {
    const shareData = {
      title: 'Join me on seggs.life',
      text: `Join me on seggs.life for intimate connection! Use invite code: ${generatedCode}`,
      url: window.location.origin
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error occurred, fallback to copy
        copyInviteCode()
      }
    } else {
      copyInviteCode()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Image 
              src="/SeggsLogoNoBackground.png"
              alt="seggs.life logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Connect with Your Partner</h1>
          <p className="text-gray-300">Create a secure, private space for you and your partner</p>
        </div>

        {/* Navigation Options */}
        <div className="mb-6 flex justify-center space-x-3">
          <button
            onClick={skipPartnerConnection}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
          >
            Continue Solo
          </button>
          
          {onRestartOnboarding && (
            <button
              onClick={restartOnboarding}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
            >
              Restart Onboarding
            </button>
          )}
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode('invite')}
            className={`card p-4 text-center transition-all ${
              mode === 'invite' 
                ? 'ring-2 ring-red-deep bg-slate-700' 
                : 'hover:bg-slate-700'
            }`}
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-white mb-1">Create Invite</div>
            <div className="text-xs text-gray-400">Send an invite to your partner</div>
          </button>

          <button
            onClick={() => setMode('join')}
            className={`card p-4 text-center transition-all ${
              mode === 'join' 
                ? 'ring-2 ring-red-deep bg-slate-700' 
                : 'hover:bg-slate-700'
            }`}
          >
            <div className="text-3xl mb-2">🔗</div>
            <div className="font-semibold text-white mb-1">Join Partner</div>
            <div className="text-xs text-gray-400">Use your partner's invite code</div>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card-elegant"
          >
            {mode === 'invite' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-2">Create Your Invite</h2>
                  <p className="text-gray-300">Share this code with your partner to connect</p>
                </div>

                <div className="text-center">
                  <div className="bg-slate-800 rounded-lg p-6 mb-4">
                    <div className="text-sm text-gray-400 mb-2">Your Invite Code</div>
                    <div className="text-4xl font-mono font-bold text-white tracking-wider">
                      {generatedCode}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={copyInviteCode}
                      className="btn-secondary text-sm"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={shareInviteCode}
                      className="btn-secondary text-sm"
                    >
                      📤 Share Code
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={createInviteCode}
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Activate Invite Code'
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    This makes your code active for your partner to use
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">How it works:</h3>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Click "Activate Invite Code" above</li>
                    <li>2. Share your code with your partner</li>
                    <li>3. They use the code to connect with you</li>
                    <li>4. Start your intimate journey together</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-2">Join Your Partner</h2>
                  <p className="text-gray-300">Enter the invite code they shared with you</p>
                </div>

                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Partner's Invite Code
                  </label>
                  <input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter 6-character code"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase())
                      setError(null)
                    }}
                    className="input-primary text-center text-2xl font-mono tracking-wider"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={joinWithCode}
                  disabled={loading || inviteCode.length !== 6}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Connect with Partner'
                  )}
                </button>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Don't have a code?</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Ask your partner to create an invite code and share it with you. 
                    Make sure they activate it first.
                  </p>
                  <button
                    onClick={() => setMode('invite')}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Or create your own invite →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 mt-4"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 mt-4"
            >
              <p className="text-green-300 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Help */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 mb-2">
            All connections are encrypted and private. Only you and your partner have access.
          </p>
          <p className="text-xs text-gray-400">
            You can always connect with a partner later from your settings
          </p>
        </div>
      </div>
    </div>
  )
} 