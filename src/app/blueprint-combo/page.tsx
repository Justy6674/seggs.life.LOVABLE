"use client"

import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../hooks/useUserData'
import AppLayout from '../../components/navigation/AppLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface BlueprintComboInsight {
  title: string
  description: string
  strengths: string[]
  growthAreas: string[]
  perfectActivities: string[]
}

const BLUEPRINT_COMBO_INSIGHTS: Record<string, BlueprintComboInsight> = {
  'energetic+energetic': {
    title: 'Double Energy Dynamo',
    description: 'You both thrive on excitement, adventure, and high-energy connection. Your relationship is a playground of possibilities!',
    strengths: ['Natural chemistry', 'Adventurous spirit', 'Playful energy', 'Always trying new things'],
    growthAreas: ['Slowing down together', 'Deep emotional moments', 'Quiet intimacy', 'Mindful presence'],
    perfectActivities: ['Adventure games', 'Active challenges', 'Spontaneous dates', 'Energy-based play']
  },
  'sensual+sensual': {
    title: 'Sensory Paradise',
    description: 'Touch, taste, smell, sight, sound - you both speak the language of the senses. Your connection is deeply felt and beautifully slow.',
    strengths: ['Deep physical connection', 'Mindful presence', 'Sensory awareness', 'Gentle intimacy'],
    growthAreas: ['Adding excitement', 'Verbal expression', 'Faster pacing', 'Adventure elements'],
    perfectActivities: ['Massage rituals', 'Sensory exploration', 'Mindful touch', 'Atmospheric experiences']
  },
  'kinky+kinky': {
    title: 'Power Play Partners',
    description: 'You understand each other\'s need for psychological stimulation, power dynamics, and taboo exploration. Trust is your foundation.',
    strengths: ['Deep trust', 'Open communication', 'Creative exploration', 'Boundary respect'],
    growthAreas: ['Soft romantic moments', 'Simple pleasures', 'Vanilla connection', 'Emotional vulnerability'],
    perfectActivities: ['Role play scenarios', 'Power exchange', 'Creative challenges', 'Boundary exploration']
  },
  'emotional+emotional': {
    title: 'Heart-to-Heart Connection',
    description: 'Your intimacy flows through deep emotional bonds, meaningful conversations, and feeling truly seen and loved.',
    strengths: ['Deep emotional bond', 'Great communication', 'Feeling understood', 'Romantic connection'],
    growthAreas: ['Physical expression', 'Playful moments', 'Body-based connection', 'Spontaneous fun'],
    perfectActivities: ['Deep conversations', 'Romantic gestures', 'Emotional sharing', 'Meaningful experiences']
  },
  'sexual+sexual': {
    title: 'Pure Physical Chemistry',
    description: 'Your connection is raw, primal, and intensely physical. You speak fluent body language and crave that electric touch.',
    strengths: ['Intense chemistry', 'Physical attraction', 'Body confidence', 'Natural rhythm'],
    growthAreas: ['Emotional depth', 'Slow exploration', 'Non-sexual intimacy', 'Mental connection'],
    perfectActivities: ['Physical challenges', 'Body appreciation', 'Intense connection', 'Passionate encounters']
  }
}

export default function BlueprintComboPage() {
  const { user } = useAuth()
  const { userData, loading } = useUserData()

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wheat">Loading your combination insights...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData?.eroticBlueprintPrimary) {
    return (
      <AppLayout 
        headerProps={{
          title: 'Blueprint Combination',
          subtitle: 'Discover your unique chemistry',
          icon: '🧬',
          showBack: true
        }}
      >
        <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="text-6xl mb-6">🧭</div>
            <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
              Complete Your Blueprint First
            </h1>
            <p className="text-wheat/70 mb-6">
              Take your Erotic Blueprint assessment to discover your unique combination insights.
            </p>
            <Link 
              href="/test-quiz"
              className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
            >
              Take Blueprint Assessment
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const primaryBlueprint = userData.eroticBlueprintPrimary
  const secondaryBlueprint = userData.eroticBlueprintSecondary || primaryBlueprint
  const comboKey = `${primaryBlueprint}+${secondaryBlueprint}`
  const insights = BLUEPRINT_COMBO_INSIGHTS[comboKey] || BLUEPRINT_COMBO_INSIGHTS[`${primaryBlueprint}+${primaryBlueprint}`]

  return (
    <AppLayout 
      headerProps={{
        title: 'Your Blueprint Combination',
        subtitle: 'Understanding your unique chemistry',
        icon: '🧬',
        showBack: true
      }}
    >
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          
          {/* Combination Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/30 mb-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 bg-deepRed/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-wheat capitalize">
                    {primaryBlueprint.charAt(0)}
                  </span>
                </div>
                <div className="text-4xl text-wheat">+</div>
                <div className="w-20 h-20 bg-burgundy/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-wheat capitalize">
                    {secondaryBlueprint.charAt(0)}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
                {insights?.title || `${primaryBlueprint} + ${secondaryBlueprint}`}
              </h1>
              <p className="text-wheat/90 text-lg leading-relaxed max-w-2xl mx-auto">
                {insights?.description || 'Your unique combination creates a special dynamic of intimacy and connection.'}
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20"
            >
              <h2 className="text-2xl font-serif font-bold text-wheat mb-6 text-center">
                💪 Your Superpowers
              </h2>
              <div className="space-y-4">
                {insights?.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-wheat/90">{strength}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Growth Areas */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20"
            >
              <h2 className="text-2xl font-serif font-bold text-wheat mb-6 text-center">
                🌱 Growth Opportunities
              </h2>
              <div className="space-y-4">
                {insights?.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">→</span>
                    </div>
                    <p className="text-wheat/90">{area}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Perfect Activities */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20 mt-8"
          >
            <h2 className="text-2xl font-serif font-bold text-wheat mb-6 text-center">
              🎯 Perfect Activities for You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights?.perfectActivities.map((activity, index) => (
                <div key={index} className="bg-primary/40 rounded-xl p-4 text-center border border-wheat/10">
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-wheat font-medium">{activity}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center mt-8"
          >
            <Link 
              href="/ai-suggestions"
              className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              🤖 Get AI Suggestions for Your Combo
            </Link>
            <Link 
              href="/app"
              className="bg-wheat/20 hover:bg-wheat/30 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              🏠 Back to Dashboard
            </Link>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  )
} 