'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/lib/database'
import AppLayout from '@/components/navigation/AppLayout'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const BLUEPRINT_GUIDES = {
  energetic: {
    emoji: '⚡',
    title: 'Understanding Your Energetic Partner',
    description: 'They thrive on anticipation, tease, and mental connection',
    needs: [
      'Space and time to build anticipation',
      'Mental stimulation and emotional connection',
      'Slow buildup rather than rushing',
      'Energy exchange through eye contact and presence',
      'Feeling desired and wanted from a distance first'
    ],
    honoring: [
      'Send flirty texts throughout the day to build anticipation',
      'Create space between you during intimate moments',
      'Focus on the energy between you before physical touch',
      'Use your words to describe how they make you feel',
      'Plan romantic scenarios that build slowly over time'
    ],
    communication: [
      'Share your desires through storytelling or fantasy',
      'Express appreciation for their energy and presence',
      'Ask what kind of anticipation excites them most',
      'Talk about the electricity you feel between you',
      'Create verbal foreplay throughout your day'
    ],
    activities: [
      'Plan surprise dates with mysterious elements',
      'Practice extended eye contact during conversations',
      'Create playlists that build energy together',
      'Try tantric breathing exercises as a couple',
      'Send voice messages describing your attraction to them'
    ]
  },
  sensual: {
    emoji: '🌸',
    title: 'Understanding Your Sensual Partner',
    description: 'They connect through all five senses and need to feel safe and relaxed',
    needs: [
      'A comfortable, beautiful environment',
      'All five senses engaged and honored',
      'Time to relax and feel safe',
      'Emotional connection before physical',
      'Appreciation for beauty and aesthetics'
    ],
    honoring: [
      'Create beautiful, comfortable spaces for intimacy',
      'Use soft textures, pleasant scents, and mood lighting',
      'Take time for non-sexual touch and massage',
      'Show appreciation for their body and beauty',
      'Focus on the sensory experience over the goal'
    ],
    communication: [
      'Describe what you love about their appearance',
      'Share how they make you feel through your senses',
      'Ask about their favorite textures, scents, or sensations',
      'Express gratitude for the beauty they bring to your life',
      'Talk about creating sensory experiences together'
    ],
    activities: [
      'Take luxurious baths or showers together',
      'Practice giving each other sensual massages',
      'Cook beautiful meals together with intention',
      'Create romantic environments with candles and music',
      'Explore different textures and temperatures together'
    ]
  },
  sexual: {
    emoji: '🔥',
    title: 'Understanding Your Sexual Partner',
    description: 'They appreciate directness, visual stimulation, and physical connection',
    needs: [
      'Direct communication about desires',
      'Visual stimulation and attraction',
      'Physical touch and sexual connection',
      'Straightforward approach to intimacy',
      'Appreciation for their sexual nature'
    ],
    honoring: [
      'Be direct and clear about your attraction to them',
      'Appreciate their body and express your desire openly',
      'Engage in regular physical affection',
      'Be straightforward about your sexual needs',
      'Create visually stimulating experiences together'
    ],
    communication: [
      'Tell them directly what you find attractive about them',
      'Be open about your sexual desires and fantasies',
      'Ask clearly what they want and need sexually',
      'Express appreciation for their sexual energy',
      'Share your physical responses to them honestly'
    ],
    activities: [
      'Take photos together (with consent) to celebrate your connection',
      'Practice direct, honest sexual communication',
      'Explore visual elements that excite you both',
      'Plan regular physical intimacy without overthinking',
      'Create space for spontaneous physical connection'
    ]
  },
  kinky: {
    emoji: '🎭',
    title: 'Understanding Your Kinky Partner',
    description: 'They explore power dynamics, taboo elements, and psychological play',
    needs: [
      'Exploration of power dynamics',
      'Clear boundaries and consent discussions',
      'Variety and novel experiences',
      'Psychological stimulation and challenge',
      'Safe space to explore fantasies'
    ],
    honoring: [
      'Engage in open conversations about boundaries',
      'Explore power exchange in safe, consensual ways',
      'Be curious about their fantasies without judgment',
      'Create variety and novelty in your intimate life',
      'Respect their need for psychological stimulation'
    ],
    communication: [
      'Have detailed conversations about consent and boundaries',
      'Share fantasies and desires without shame',
      'Discuss what power exchange means to each of you',
      'Talk about what feels taboo or exciting',
      'Create safe words and check-in practices'
    ],
    activities: [
      'Explore role-playing scenarios together',
      'Practice consensual power exchange exercises',
      'Create games with rules and consequences',
      'Try new experiences that challenge your comfort zones',
      'Establish rituals that honor your dynamic'
    ]
  },
  shapeshifter: {
    emoji: '🦋',
    title: 'Understanding Your Shapeshifter Partner',
    description: 'They embody all blueprint types and need variety to stay engaged',
    needs: [
      'Variety and change in intimate experiences',
      'All blueprint types honored at different times',
      'Flexibility and adaptability from partners',
      'Regular novelty to prevent boredom',
      'Understanding that their needs shift and change'
    ],
    honoring: [
      'Embrace their need for variety and change',
      'Learn about all blueprint types to meet them anywhere',
      'Be flexible and willing to try different approaches',
      'Check in regularly about what they need in the moment',
      'Celebrate their adaptability as a gift'
    ],
    communication: [
      'Ask regularly what type of energy they need',
      'Share your willingness to explore different approaches',
      'Discuss how to signal when their needs shift',
      'Express appreciation for their versatility',
      'Talk about creating variety together'
    ],
    activities: [
      'Create a variety wheel with different blueprint activities',
      'Take turns choosing different styles of connection',
      'Explore all five blueprint approaches over time',
      'Check in weekly about what type of energy they need',
      'Celebrate the different aspects of their sexuality'
    ]
  }
}

export default function UnderstandingPartnerPage() {
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [partnerData, setPartnerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPartnerData()
  }, [user])

  const loadPartnerData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Get user data
      const userProfile = await UserService.getUser(user.uid)
      setUserData(userProfile)

      if (!userProfile?.coupleId) {
        setError('No partner connection found. Connect with your partner to access this toolkit.')
        setIsLoading(false)
        return
      }

      // Get partner data from couple
      const partnerProfile = await UserService.getPartnerData(user.uid)
      if (!partnerProfile) {
        setError('Partner information not found. Make sure your partner has completed their blueprint.')
        setIsLoading(false)
        return
      }

      setPartnerData(partnerProfile)
      setIsLoading(false)

    } catch (err) {
      console.error('Error loading partner data:', err)
      setError('Failed to load partner information. Please try again.')
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🧠</span>
            </div>
            <p className="text-gray-300">Loading partner insights...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-xl text-white font-medium mb-4">Understanding Partner</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={loadPartnerData}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                >
                  🔄 Try Again
                </button>
                <Link 
                  href="/partner-connect"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
                >
                  💕 Connect with Partner
                </Link>
                <Link 
                  href="/app"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
                >
                  🏠 Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!partnerData?.eroticBlueprintPrimary) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl text-white mb-4">Partner Blueprint Not Available</h1>
            <p className="text-gray-300 mb-6">Your partner hasn't completed their blueprint assessment yet.</p>
            <Link 
              href="/app"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              🏠 Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const partnerBlueprint = partnerData.eroticBlueprintPrimary
  const guide = BLUEPRINT_GUIDES[partnerBlueprint as keyof typeof BLUEPRINT_GUIDES]

  if (!guide) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl text-white mb-4">Blueprint Guide Not Found</h1>
            <Link 
              href="/app"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              🏠 Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl">{guide.emoji}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {guide.title}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A solo toolkit for honoring {partnerData.displayName || 'your partner'}'s {partnerBlueprint} blueprint. 
              Use these insights to deepen your connection, even when they're not actively using the app.
            </p>
          </motion.div>

          {/* Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-700/50 mb-8"
          >
            <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center">
              What You Need to Know
            </h2>
            <p className="text-gray-200 text-lg text-center leading-relaxed">
              {guide.description}
            </p>
          </motion.div>

          {/* Core Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* What They Need */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">💝</span>
                What They Need Most
              </h3>
              <ul className="space-y-3">
                {guide.needs.map((need, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-3 mt-1">•</span>
                    {need}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* How to Honor Them */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🙏</span>
                How to Honor Them
              </h3>
              <ul className="space-y-3">
                {guide.honoring.map((action, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Communication Tips */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">💬</span>
                Communication Tips
              </h3>
              <ul className="space-y-3">
                {guide.communication.map((tip, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-green-400 mr-3 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Activities to Try */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Activities to Try
              </h3>
              <ul className="space-y-3">
                {guide.activities.map((activity, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-pink-400 mr-3 mt-1">•</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Personal Empowerment Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-8 border border-green-700/50 mb-8"
          >
            <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center">
              🌟 You're Investing in Your Relationship
            </h2>
            <p className="text-gray-200 text-center leading-relaxed mb-6">
              By learning about {partnerData.displayName || 'your partner'}'s blueprint, you're taking a proactive step 
              toward deeper intimacy. This knowledge empowers you to create connection even when they're not actively 
              engaging with relationship work. Your effort and care matter deeply.
            </p>
            <div className="text-center">
              <Link 
                href="/our-connection"
                className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                💕 View Your Combined Analysis
              </Link>
            </div>
          </motion.div>

          {/* Share Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
          >
            <h3 className="text-xl font-serif font-bold text-white mb-4">
              💌 Want to Share This With {partnerData.displayName || 'Your Partner'}?
            </h3>
            <p className="text-gray-300 mb-4">
              You can share what you've learned or invite them to explore their own blueprint insights.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/ai-suggestions"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                🤖 Get AI Suggestions
              </Link>
              <Link 
                href="/intimacy-hub"
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                💕 Explore Together
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
} 