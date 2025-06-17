'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { AIService, type CouplesReport as CouplesReportType } from '../lib/aiService'
import { UserService } from '../lib/database'
import type { User } from '../lib/firebase'
import CouplesReport from './CouplesReport'

interface CouplesDashboardProps {
  userData: User
  partnerData: User
}

export default function CouplesDashboard({ userData, partnerData }: CouplesDashboardProps) {
  const [user] = useAuthState(auth)
  const [report, setReport] = useState<CouplesReportType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    // Check if we already have a report
    if (userData.couplesReport) {
      setReport(userData.couplesReport)
      setLoading(false)
    } else {
      generateCouplesReport()
    }
  }, [userData, partnerData])

  const generateCouplesReport = async () => {
    if (!userData || !partnerData) return

    setLoading(true)
    setError(null)
    setRegenerating(false)

    try {
      console.log('🚀 Generating AI couples report...')
      const aiReport = await AIService.generateCouplesReport(userData, partnerData)
      console.log('✅ AI report generated successfully:', aiReport)
      
      setReport(aiReport)
      
      // Save the report to Firestore for future reference
      if (user) {
        await UserService.updateUser(user.uid, {
          couplesReport: aiReport,
          couplesReportGeneratedAt: new Date()
        })
        console.log('💾 Report saved to database')
      }
    } catch (err) {
      console.error('❌ Error generating couples report:', err)
      setError('Unable to generate your couples report. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateReport = async () => {
    setRegenerating(true)
    await generateCouplesReport()
    setRegenerating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
            <img 
              src="/SeggsLogoNoBackground.png" 
              alt="seggs.life logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Generating Your AI-Powered Report</h2>
          <p className="text-gray-300 leading-relaxed">
            Our advanced AI is analysing your individual Erotic Blueprint assessments and creating personalised compatibility insights...
          </p>
          <div className="mt-6 bg-slate-800 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <span className="mr-2">⚡</span>
              <span>Comparing blueprint compatibility...</span>
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <span className="mr-2">🧠</span>
              <span>Generating personalised guidance...</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-2">💕</span>
              <span>Creating actionable prompts...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-3">
            <img 
              src="/SeggsLogoNoBackground.png" 
              alt="seggs.life logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-6xl mb-4">😓</div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Oops! Something went wrong</h2>
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">
              This might be due to a temporary API issue. Your data is safe and secure.
            </p>
          </div>
          <button
            onClick={generateCouplesReport}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Retrying...' : '🔄 Try Again'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <CouplesReport 
      userData={userData}
      partnerData={partnerData}
      report={report}
      onRegenerateReport={regenerating ? undefined : handleRegenerateReport}
    />
  )
} 