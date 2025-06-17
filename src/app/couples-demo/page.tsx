'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AIService } from '../../lib/aiService'
import type { User } from '../../lib/firebase'
import CouplesDashboard from '../../components/CouplesDashboard'

export default function CouplesDemoPage() {
  const [loading, setLoading] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Enhanced sample data with realistic blueprint results
  const sampleUser1: User = {
    id: 'demo-user1',
    email: 'alice@demo.seggs.life',
    displayName: 'Alice',
    createdAt: new Date(),
    updatedAt: new Date(),
    onboardingCompleted: true,
    onboardingCompletedAt: new Date(),
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
    onboardingCompletedAt: new Date(),
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

  const generateReport = async () => {
    setLoading(true)
    try {
      console.log('🎬 Starting demo couples report generation...')
      
      // Generate AI report with sample data
      const report = await AIService.generateCouplesReport(sampleUser1, sampleUser2)
      console.log('✅ Demo report generated:', report)
      
      // Add the report to the sample users
      sampleUser1.couplesReport = report
      sampleUser1.couplesReportGeneratedAt = new Date()
      
      sampleUser2.couplesReport = report
      sampleUser2.couplesReportGeneratedAt = new Date()
      
      setShowDashboard(true)
    } catch (error) {
      console.error('❌ Error generating demo report:', error)
      alert('Error generating report. Please check your internet connection and try again. Make sure you have a valid Gemini API key configured.')
    } finally {
      setLoading(false)
    }
  }

  if (showDashboard) {
    return <CouplesDashboard userData={sampleUser1} partnerData={sampleUser2} />
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
            AI Couples Compatibility Demo
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience how seggs.life creates personalised, AI-powered compatibility reports 
            based on individual Erotic Blueprint assessments.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-2xl p-8 mb-8 text-left border border-slate-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sample Couple Profile</h2>
          
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Relationship satisfaction:</span>
                  <span className="text-white">7/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary challenge:</span>
                  <span className="text-gray-300">Different pacing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Goal:</span>
                  <span className="text-gray-300">Better communication</span>
                </div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                <p className="text-gray-300 text-sm">
                  <strong>Energetic Blueprint:</strong> Turned on by anticipation, tease, and slow build-up. 
                  Needs space and energy exchange before physical touch.
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Relationship satisfaction:</span>
                  <span className="text-white">6/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary challenge:</span>
                  <span className="text-gray-300">Feeling routine</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Goal:</span>
                  <span className="text-gray-300">Try new adventures</span>
                </div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <p className="text-gray-300 text-sm">
                  <strong>Sexual Blueprint:</strong> Direct, visual, and straightforward. 
                  Wants immediate physical connection and clear sexual communication.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <h4 className="text-blue-400 font-semibold mb-2">🧠 What the AI Will Analyse:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Blueprint compatibility patterns (Energetic vs Sexual approaches)</li>
              <li>• Communication bridges for different intimacy styles</li>
              <li>• Personalised activities that honor both preferences</li>
              <li>• Growth opportunities for this specific combination</li>
              <li>• Actionable prompts tailored to their individual challenges</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn-primary text-lg px-12 py-4 mb-6"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating AI Analysis...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-3">✨</span>
                Generate AI Couples Report
              </div>
            )}
          </button>
          
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            This will call the Gemini AI to analyse their blueprint compatibility and generate 
            personalised insights, challenges, and actionable guidance for their relationship.
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
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Blueprint Analysis</h3>
            <p className="text-gray-400 text-sm">
              Deep compatibility analysis showing where you align, differ, and can grow together.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Actionable Guidance</h3>
            <p className="text-gray-400 text-sm">
              Specific activities, conversations, and strategies tailored to your unique combination.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-lg font-semibold text-white mb-2">Personalised Prompts</h3>
            <p className="text-gray-400 text-sm">
              AI-generated conversation starters and intimate activities perfect for tonight.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 