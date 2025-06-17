'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type InviteMethod = 'text' | 'email' | 'link' | null

export default function InvitePartnerPage() {
  const [inviteCode, setInviteCode] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<InviteMethod>(null)
  const [copied, setCopied] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [partnerPhone, setPartnerPhone] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const linkRef = useRef<HTMLInputElement>(null)

  const generateInviteCode = async () => {
    // Generate a unique invite code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setInviteCode(result)
    
    // Track analytics event for partner invitation - key conversion event
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'partner_invited',
          userId: 'current_user', // Would get actual user ID in real implementation
          properties: {
            inviteCode: result,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (analyticsError) {
      console.log('Analytics tracking failed:', analyticsError)
    }
  }

  const generateInviteLink = () => {
    if (!inviteCode) generateInviteCode()
    return `https://seggs.life/join/${inviteCode || 'DEMO1234'}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const getTextMessage = () => {
    const link = generateInviteLink()
    return customMessage || 
      `Hey! I found this amazing app that helps couples discover new ways to connect. Want to take a quick assessment together? It's free for partners! ${link}`
  }

  const getEmailMessage = () => {
    const link = generateInviteLink()
    return customMessage || 
      `Hi,\n\nI've been exploring this interesting app called Seggs.life that helps couples understand their intimacy styles and get personalized suggestions. I'd love for you to take the assessment too so we can see how we connect!\n\nIt's completely free for partners and takes just 5 minutes. Here's your invite link:\n\n${link}\n\nLooking forward to discovering more about us together!\n\nLove,\n[Your name]`
  }

  const handleEmailShare = async () => {
    // Track analytics for email sharing
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'partner_invited',
          userId: 'current_user',
          properties: {
            shareMethod: 'email',
            inviteCode: inviteCode,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (analyticsError) {
      console.log('Analytics tracking failed:', analyticsError)
    }
    
    const subject = "Let's discover our intimacy style together!"
    const body = encodeURIComponent(getEmailMessage())
    const emailUrl = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${body}`
    window.open(emailUrl)
  }

  const handleTextShare = async () => {
    // Track analytics for text sharing
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'partner_invited',
          userId: 'current_user',
          properties: {
            shareMethod: 'text',
            inviteCode: inviteCode,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (analyticsError) {
      console.log('Analytics tracking failed:', analyticsError)
    }
    
    const message = encodeURIComponent(getTextMessage())
    const smsUrl = `sms:${partnerPhone}${/iPhone|iPad|iPod|Mac/.test(navigator.userAgent) ? '&' : '?'}body=${message}`
    window.open(smsUrl)
  }

  if (!inviteCode && selectedMethod === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Invite Your Partner
            </h1>
            <p className="text-wheat/70 mb-8">
              They can join free and take their assessment at their own pace
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-900/40 to-pink-700/40 backdrop-blur-sm rounded-3xl p-8 border border-pink-500/30 mb-8"
          >
            <div className="text-6xl mb-4 text-center">💌</div>
            <h2 className="text-2xl font-semibold text-wheat mb-4 text-center">
              Why Invite Your Partner?
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="text-pink-300 text-xl">🔗</div>
                <div>
                  <h3 className="text-wheat font-medium">Account Linking</h3>
                  <p className="text-wheat/70 text-sm">Your profiles connect for shared suggestions and compatibility analysis</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-pink-300 text-xl">🎯</div>
                <div>
                  <h3 className="text-wheat font-medium">Better Suggestions</h3>
                  <p className="text-wheat/70 text-sm">AI generates ideas based on both your actual blueprints</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-pink-300 text-xl">🆓</div>
                <div>
                  <h3 className="text-wheat font-medium">Free for Partners</h3>
                  <p className="text-wheat/70 text-sm">They get full assessment access at no cost when you invite them</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-pink-300 text-xl">🔒</div>
                <div>
                  <h3 className="text-wheat font-medium">Private & Safe</h3>
                  <p className="text-wheat/70 text-sm">They control their own data and can join at their comfort level</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-wheat mb-4 text-center">
              How would you like to invite them?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  generateInviteCode()
                  setSelectedMethod('text')
                }}
                className="bg-gradient-to-br from-green-600/40 to-green-500/40 hover:from-green-500/60 hover:to-green-400/60 border border-green-500/30 hover:border-green-400/50 rounded-xl p-4 transition-all duration-200 text-center"
              >
                <div className="text-3xl mb-2">📱</div>
                <div className="text-wheat font-medium">Text Message</div>
                <div className="text-wheat/60 text-xs">Send via SMS</div>
              </button>

              <button
                onClick={() => {
                  generateInviteCode()
                  setSelectedMethod('email')
                }}
                className="bg-gradient-to-br from-blue-600/40 to-blue-500/40 hover:from-blue-500/60 hover:to-blue-400/60 border border-blue-500/30 hover:border-blue-400/50 rounded-xl p-4 transition-all duration-200 text-center"
              >
                <div className="text-3xl mb-2">📧</div>
                <div className="text-wheat font-medium">Email</div>
                <div className="text-wheat/60 text-xs">Send via email</div>
              </button>

              <button
                onClick={() => {
                  generateInviteCode()
                  setSelectedMethod('link')
                }}
                className="bg-gradient-to-br from-purple-600/40 to-purple-500/40 hover:from-purple-500/60 hover:to-purple-400/60 border border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-200 text-center"
              >
                <div className="text-3xl mb-2">🔗</div>
                <div className="text-wheat font-medium">Share Link</div>
                <div className="text-wheat/60 text-xs">Copy & share anywhere</div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link 
              href="/"
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Back to start
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  if (selectedMethod === 'text') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Send Text Invitation
            </h1>
            <p className="text-wheat/70">
              Your invite code: <span className="text-green-300 font-mono">{inviteCode}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-900/40 to-green-700/40 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30 mb-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Partner's Phone Number
                </label>
                <input
                  type="tel"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-wheat placeholder:text-wheat/40 focus:border-green-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal touch to your invitation..."
                  rows={4}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-wheat placeholder:text-wheat/40 focus:border-green-500/50 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Message Preview:
                </label>
                <div className="bg-gray-800/50 rounded-xl p-4 text-wheat/70 text-sm whitespace-pre-wrap">
                  {getTextMessage()}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleTextShare}
                  disabled={!partnerPhone}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  📱 Send Text Message
                </button>
                
                <button
                  onClick={() => copyToClipboard(getTextMessage())}
                  className="bg-gray-700/50 hover:bg-gray-600/60 text-wheat border border-gray-600/30 hover:border-gray-500/50 font-medium py-4 px-6 rounded-xl transition-all duration-200"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="text-center">
            <button
              onClick={() => {
                setSelectedMethod(null)
                setInviteCode('')
              }}
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Choose different method
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedMethod === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Send Email Invitation
            </h1>
            <p className="text-wheat/70">
              Your invite code: <span className="text-blue-300 font-mono">{inviteCode}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30 mb-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Partner's Email Address
                </label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-wheat placeholder:text-wheat/40 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal touch to your invitation..."
                  rows={6}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-wheat placeholder:text-wheat/40 focus:border-blue-500/50 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Email Preview:
                </label>
                <div className="bg-gray-800/50 rounded-xl p-4 text-wheat/70 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {getEmailMessage()}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleEmailShare}
                  disabled={!partnerEmail}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  📧 Send Email
                </button>
                
                <button
                  onClick={() => copyToClipboard(getEmailMessage())}
                  className="bg-gray-700/50 hover:bg-gray-600/60 text-wheat border border-gray-600/30 hover:border-gray-500/50 font-medium py-4 px-6 rounded-xl transition-all duration-200"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="text-center">
            <button
              onClick={() => {
                setSelectedMethod(null)
                setInviteCode('')
              }}
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Choose different method
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedMethod === 'link') {
    const inviteLink = generateInviteLink()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Share Invitation Link
            </h1>
            <p className="text-wheat/70">
              Your invite code: <span className="text-purple-300 font-mono">{inviteCode}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 mb-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-wheat/80 text-sm font-medium mb-2">
                  Your Unique Invitation Link:
                </label>
                <div className="flex space-x-2">
                  <input
                    ref={linkRef}
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-wheat focus:border-purple-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>

              <div className="bg-purple-800/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-200 mb-2">📱 Share Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join me on Seggs.life',
                          text: 'Take this intimacy assessment with me!',
                          url: inviteLink
                        })
                      } else {
                        copyToClipboard(inviteLink)
                      }
                    }}
                    className="bg-purple-700/50 hover:bg-purple-600/60 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    📱 Share
                  </button>
                  
                  <button
                    onClick={() => {
                      const message = `Hey! Take this intimacy assessment with me: ${inviteLink}`
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                      window.open(whatsappUrl, '_blank')
                    }}
                    className="bg-green-600/50 hover:bg-green-500/60 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    💬 WhatsApp
                  </button>
                  
                  <button
                    onClick={() => {
                      const message = `Take this intimacy assessment with me! ${inviteLink}`
                      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`
                      window.open(telegramUrl, '_blank')
                    }}
                    className="bg-blue-500/50 hover:bg-blue-400/60 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    ✈️ Telegram
                  </button>
                  
                  <button
                    onClick={() => {
                      const message = `Take this intimacy assessment with me! ${inviteLink}`
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
                      window.open(twitterUrl, '_blank')
                    }}
                    className="bg-gray-600/50 hover:bg-gray-500/60 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    🐦 Twitter
                  </button>
                </div>
              </div>

              <div className="bg-purple-800/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-200 mb-2">🔗 What happens next?</h3>
                <ul className="text-purple-100/80 text-sm space-y-1">
                  <li>• Your partner clicks the link and takes their assessment</li>
                  <li>• Their account automatically links to yours</li>
                  <li>• You both get compatibility analysis and shared suggestions</li>
                  <li>• They get full access at no cost (partner benefit!)</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <Link 
              href="/app"
              className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              🚀 Continue to Dashboard
            </Link>
            
            <button
              onClick={() => {
                setSelectedMethod(null)
                setInviteCode('')
              }}
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Choose different method
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
