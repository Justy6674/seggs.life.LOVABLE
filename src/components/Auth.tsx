'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import Image from 'next/image'

type AuthMode = 'signin' | 'signup' | 'reset'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
  displayName?: string
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [ageVerified, setAgeVerified] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const router = useRouter()
  const [user] = useAuthState(auth)

  // Handle successful authentication with smarter redirection
  useEffect(() => {
    if (user && !loading) {
      // Check if we just completed authentication (not just loading the component with existing auth)
      console.log('🔐 User authenticated, preparing redirect...')
      
      // Add a small delay to ensure Firebase user document is created
      setTimeout(() => {
        // Redirect to the appropriate page based on user state
        // For now, redirect to /app which will handle routing based on user completion status
        router.push('/app')
      }, 500)
    }
  }, [user, loading, router])

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setMessage(null)
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }

    if (mode !== 'reset' && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (mode === 'signup') {
      if (!formData.displayName?.trim()) {
        setError('Please enter your name')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (!ageVerified) {
        setError('You must confirm that you are 18 years or older to use this app')
        return false
      }
      if (!termsAccepted) {
        setError('You must agree to the Terms, Consent & Safety guidelines to continue')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      switch (mode) {
        case 'signin':
          await signInWithEmailAndPassword(auth, formData.email, formData.password)
          // Redirection handled by useEffect when auth state changes
          break

        case 'signup':
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
          )
          
          // Update user profile
          await updateProfile(userCredential.user, {
            displayName: formData.displayName
          })

          // Create user document in Firestore
          await UserService.createUser(userCredential.user.uid, {
            email: formData.email,
            displayName: formData.displayName,
            onboardingCompleted: false,
            relationshipType: 'heterosexual',
            boundaries: [],
            noGoList: [],
            safeWord: '',
            intensityLevel: 'sweet',
            healthInterests: {
              prepReminders: false,
              stiEducation: false,
              telehealthLinks: false,
              pathologyReminders: false
            },
            notificationPreferences: {
              email: true,
              sms: false,
              push: true,
              frequency: 'daily',
              quietHours: {
                start: '22:00',
                end: '08:00'
              }
            },
            panicLockEnabled: false,
            encryptionEnabled: true
          })
          // Redirection handled by useEffect when auth state changes
          break

        case 'reset':
          await sendPasswordResetEmail(auth, formData.email)
          setMessage('Password reset email sent! Check your inbox.')
          break
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // User-friendly error messages
      const errorMessages: { [key: string]: string } = {
        'auth/user-not-found': 'No account found with this email address',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Please enter a valid email address',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      }
      
      setError(errorMessages[error.code] || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setMessage(null)
    setFormData({
      email: formData.email,
      password: '',
      confirmPassword: '',
      displayName: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Image 
              src="/SeggsLogoNoBackground.png"
              alt="seggs.life logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-primary font-bold text-accent mb-2">seggs.life</h1>
          <p className="text-accent/70">Private intimacy app for couples</p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elegant"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-accent mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-accent/70">
              {mode === 'signin' && 'Sign in to your intimate space'}
              {mode === 'signup' && 'Begin your journey of connection'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Display Name (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="displayName" className="block text-sm font-medium text-accent/80 mb-2">
                    Your Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    placeholder="How should we address you?"
                    value={formData.displayName || ''}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="input-primary"
                    required={mode === 'signup'}
                  />
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-accent/80 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-primary"
                  required
                />
              </div>

              {/* Password (Not for reset) */}
              {mode !== 'reset' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-accent/80 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="input-primary"
                    required
                  />
                </div>
              )}

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-accent/80 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword || ''}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="input-primary"
                    required
                  />
                </motion.div>
              )}

              {/* Age Verification & Terms (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-4 border-t border-accent/30"
                >
                  {/* Age Verification */}
                  <div className="flex items-start space-x-3">
                    <input
                      id="ageVerification"
                      type="checkbox"
                      checked={ageVerified}
                      onChange={(e) => setAgeVerified(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emphasis bg-primary/60 border-accent/30 rounded focus:ring-emphasis focus:ring-2"
                      required
                    />
                    <label htmlFor="ageVerification" className="text-sm text-accent/80">
                      <span className="font-semibold text-emphasis">I confirm that I am 18 years of age or older</span> and understand that this app contains adult content and themes.
                    </label>
                  </div>

                  {/* Terms Acceptance */}
                  <div className="flex items-start space-x-3">
                    <input
                      id="termsAcceptance"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emphasis bg-primary/60 border-accent/30 rounded focus:ring-emphasis focus:ring-2"
                      required
                    />
                    <label htmlFor="termsAcceptance" className="text-sm text-accent/80">
                      I agree to the{' '}
                      <a 
                        href="/terms-consent" 
                        target="_blank" 
                        className="text-emphasis hover:text-emphasis/80 underline"
                      >
                        Terms, Consent & Safety guidelines
                      </a>
                      {' '}and{' '}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        className="text-emphasis hover:text-emphasis/80 underline"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mt-4">
                    <p className="text-accent/90 text-xs">
                      🔒 <strong>Privacy First:</strong> Only you and your partner will see your data. 
                      We use end-to-end encryption and never store intimate content on our servers.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-900/50 border border-red-500/50 rounded-lg p-3"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
              
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-900/50 border border-green-500/50 rounded-lg p-3"
                >
                  <p className="text-green-300 text-sm">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === 'signin' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'reset' && 'Sending Email...'}
                </div>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Forgot your password?
                </button>
                <div>
                  <span className="text-gray-400 text-sm">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div>
                <span className="text-gray-400 text-sm">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Back to sign in
              </button>
            )}
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our privacy-first approach.
            Your data is encrypted and never shared.
          </p>
        </motion.div>
      </div>
    </div>
  )
} 