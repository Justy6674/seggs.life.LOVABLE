'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import Link from 'next/link'

export default function PartnerConnect() {
  const [user] = useAuthState(auth)
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate sending invite
    const code = generateInviteCode()
    setInviteCode(code)
    
    // In a real app, you'd send an email here
    setTimeout(() => {
      setInviteSent(true)
      setLoading(false)
    }, 1500)
  }

  const handleConnectWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // In a real app, you'd validate the code and connect partners
    setTimeout(() => {
      alert('Partner connected successfully!')
      setLoading(false)
    }, 1500)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in first</h1>
          <Link href="/auth/signin" className="text-red-400 hover:text-red-300">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Connect with Your <span className="bg-gradient-to-r from-red-800 via-red-900 to-red-950 bg-clip-text text-transparent">Partner</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Start your intimate journey together. Invite your partner to join you on seggs.life for a private, playful space to explore your connection.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Send Invite */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">💌 Invite Your Partner</h2>
                
                {!inviteSent ? (
                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Partner's Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none"
                        placeholder="partner@example.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-xl font-bold text-green-400">Invitation Sent!</h3>
                    <p className="text-gray-300">Your partner will receive an email with instructions to join.</p>
                    <div className="bg-gray-800 p-4 rounded-xl">
                      <p className="text-sm text-gray-400 mb-2">Share this code with your partner:</p>
                      <code className="text-red-400 font-mono text-lg">{inviteCode}</code>
                    </div>
                  </div>
                )}
              </div>

              {/* Join with Code */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">🔗 Join Your Partner</h2>
                
                <form onSubmit={handleConnectWithCode} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Invitation Code</label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none"
                      placeholder="Enter code from your partner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="w-full bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Connect with Partner'}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have a code? Ask your partner to send you an invitation.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-white">🔒 Your Privacy Matters</h3>
                <p className="text-gray-300 max-w-lg mx-auto">
                  Only you and your partner will have access to your shared space. All data is encrypted and private.
                </p>
                
                <div className="flex justify-center space-x-4 pt-4">
                  <Link 
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ← Back to Home
                  </Link>
                  <Link 
                    href="/intimacy-hub"
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Skip for Now →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 