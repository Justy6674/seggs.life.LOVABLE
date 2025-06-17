'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import IntimacyActionHub from '../../components/IntimacyActionHub'
import type { User } from '../../lib/firebase'

export default function IntimacyDemoPage() {
  const [showDemo, setShowDemo] = useState(false)

  // Enhanced sample data with complete blueprint results
  const sampleUser1: User = {
    id: 'demo-user1',
    email: 'alice@demo.seggs.life',
    displayName: 'Alice',
    createdAt: new Date(),
    updatedAt: new Date(),
    onboardingCompleted: true,
    onboardingCompletedAt: new Date('2024-06-01'), // 6+ months ago to trigger reassessment
    eroticBlueprintPrimary: 'energetic',
    eroticBlueprintSecondary: 'sensual',
    eroticBlueprintScores: {
      energetic: 22,
      sensual: 18,
      sexual: 12,
      kinky: 8,
      shapeshifter: 15
    },
    relationshipType: 'heterosexual',
    relationshipStage: 'living_together',
    timeTogethers: '2_5_years',
    sexLifeSatisfaction: 7,
    sexFrequency: '3',
    biggestChallenge: ['Different pacing', 'Time and energy constraints'],
    improvementGoals: ['Better communication about desires', 'More frequent intimate moments'],
    futureVision: ['I want us to feel more connected and adventurous while maintaining our deep emotional bond.'],
    partnerId: 'demo-user2',
    coupleId: 'demo-couple1'
  }

  const sampleUser2: User = {
    id: 'demo-user2',
    email: 'bob@demo.seggs.life',
    displayName: 'Bob',
    createdAt: new Date(),
    updatedAt: new Date(),
    onboardingCompleted: true,
    onboardingCompletedAt: new Date('2024-06-01'),
    eroticBlueprintPrimary: 'sexual',
    eroticBlueprintSecondary: 'kinky',
    eroticBlueprintScores: {
      energetic: 8,
      sensual: 10,
      sexual: 21,
      kinky: 17,
      shapeshifter: 12
    },
    relationshipType: 'heterosexual',
    relationshipStage: 'living_together',
    timeTogethers: '2_5_years',
    sexLifeSatisfaction: 6,
    sexFrequency: '2',
    biggestChallenge: ['Communication about desires', 'Feeling routine/bored'],
    improvementGoals: ['Try new things together', 'Deepen emotional connection'],
    futureVision: ['I want us to be more adventurous and open about our fantasies, while maintaining emotional intimacy.'],
    partnerId: 'demo-user1',
    coupleId: 'demo-couple1'
  }

  if (showDemo) {
    return <IntimacyActionHub userData={sampleUser1} partnerData={sampleUser2} />
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
          <img 
            src="/SeggsLogoNoBackground.png" 
            alt="seggs.life logo" 
            className="w-full h-full object-contain"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Intimacy Action Hub Demo
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience the comprehensive Intimacy Action Hub with AI-powered personalised suggestions 
            based on Erotic Blueprint compatibility analysis.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-2xl p-8 mb-8 text-left border border-slate-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Demo Couple Profile</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-xl mr-4">
                  ⚡
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Alice</h3>
                  <p className="text-yellow-400">Energetic + Sensual</p>
                </div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                <h4 className="text-yellow-400 font-semibold mb-2">Primary: Energetic</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Turned on by anticipation, tease, energy exchange, and slow build-up. 
                  Needs space and mental stimulation before physical touch.
                </p>
                <h4 className="text-yellow-400 font-semibold mb-2">Secondary: Sensual</h4>
                <p className="text-gray-300 text-sm">
                  Loves senses, touch, comfort, beautiful settings, and emotional connection.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xl mr-4">
                  🔥
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Bob</h3>
                  <p className="text-red-400">Sexual + Kinky</p>
                </div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                <h4 className="text-red-400 font-semibold mb-2">Primary: Sexual</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Direct, visual, physical, straightforward, and genital-focused. 
                  Wants immediate physical connection and clear communication.
                </p>
                <h4 className="text-red-400 font-semibold mb-2">Secondary: Kinky</h4>
                <p className="text-gray-300 text-sm">
                  Interested in taboo, power play, rules, boundaries, and psychological games.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6">What You'll Experience</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">🎯 Blueprint Analysis</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Strengths and challenges of Energetic + Sexual combination</li>
                <li>• Specific strategies for bridging different intimacy styles</li>
                <li>• Personalised activities that honour both preferences</li>
                <li>• Growth opportunities for this specific pairing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-3">💡 AI-Powered Categories</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• 19 intimacy categories from sweet to adventurous</li>
                <li>• Personalised suggestions based on both blueprints</li>
                <li>• Copy-to-clipboard functionality for easy sharing</li>
                <li>• Fresh AI-generated content weekly</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowDemo(true)}
            className="btn-primary text-lg px-12 py-4 mb-6"
          >
            <div className="flex items-center">
              <span className="mr-3">✨</span>
              Launch Intimacy Action Hub Demo
            </div>
          </button>
          
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            This demo showcases AI-powered personalised intimacy suggestions based on 
            Erotic Blueprint compatibility. All features are fully functional with sample data.
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid md:grid-cols-3 gap-6 text-left"
        >
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-white mb-2">Gemini AI Integration</h3>
            <p className="text-gray-400 text-sm">
              Advanced AI generates contextual suggestions based on your unique blueprint combination.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Reassessment Prompts</h3>
            <p className="text-gray-400 text-sm">
              Periodic reminders to retake assessments as your preferences evolve over time.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-gray-400 text-sm">
              All suggestions are private, discreet, and only shared when you choose to copy them.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 