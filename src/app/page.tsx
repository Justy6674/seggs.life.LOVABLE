'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { user, userData } = useAuth()

  // If user is authenticated and has data, redirect to appropriate page
  useEffect(() => {
    if (user && userData) {
      if (userData.eroticBlueprintPrimary) {
        // User has completed assessment, go to dashboard
        window.location.href = '/app'
      } else {
        // User exists but hasn't completed assessment, go to flexible onboarding
        // Don't redirect - let them see the choice screen
      }
    }
  }, [user, userData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-wheat mb-6">
              What should we try tonight?
            </h1>
            <p className="text-2xl md:text-3xl text-wheat/80 mb-4">
              AI knows.
            </p>
            <p className="text-lg text-wheat/60 max-w-3xl mx-auto mb-12">
              The first Blueprint-Powered Intimacy Idea Engine that creates endless personalized suggestions 
              based on your unique erotic blueprint combination.
            </p>
          </motion.div>

          {/* Flexible Assessment Choice Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-serif font-semibold text-wheat mb-8">
              🧭 Choose Your Starting Point
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Predictive Partner Assessment */}
              <Link href="/partner-predict" className="group">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="text-5xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-wheat mb-3">Understand Our Dynamic</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    Explore how you and your partner connect through observation-based insights
                  </p>
                  <div className="text-purple-300 text-sm font-medium">
                    → Predictive partner assessment
                  </div>
                </div>
              </Link>

              {/* Personal Blueprint */}
              <Link href="/blueprint" className="group">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-wheat mb-3">Discover My Blueprint</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    Learn about your unique intimacy style through the proven Erotic Blueprint assessment
                  </p>
                  <div className="text-blue-300 text-sm font-medium">
                    → Personal assessment
                  </div>
                </div>
              </Link>

              {/* Full Intelligence */}
              <Link href="/full-assessment" className="group">
                <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-700/40 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-wheat mb-3">Both - Full Picture</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    Complete relationship intelligence - understand both your style and dynamic
                  </p>
                  <div className="text-emerald-300 text-sm font-medium">
                    → Both assessments
                  </div>
                </div>
              </Link>

              {/* Invite Partner */}
              <Link href="/invite-partner" className="group">
                <div className="bg-gradient-to-br from-pink-900/40 to-pink-700/40 backdrop-blur-sm rounded-3xl p-8 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="text-5xl mb-4">💌</div>
                  <h3 className="text-xl font-semibold text-wheat mb-3">Invite My Partner</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    They can join free and take their own assessment at their own pace
                  </p>
                  <div className="text-pink-300 text-sm font-medium">
                    → Send invite code
                  </div>
                </div>
              </Link>

              {/* Browse First */}
              <Link href="/explore-first" className="group">
                <div className="bg-gradient-to-br from-amber-900/40 to-amber-700/40 backdrop-blur-sm rounded-3xl p-8 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold text-wheat mb-3">Just Browse First</h3>
                  <p className="text-wheat/70 text-sm mb-4">
                    Explore the app and see what kinds of suggestions we generate before committing
                  </p>
                  <div className="text-amber-300 text-sm font-medium">
                    → Limited preview mode
                  </div>
                </div>
              </Link>

              {/* Quick Login */}
              {!user && (
                <Link href="/auth" className="group">
                  <div className="bg-gradient-to-br from-gray-700/40 to-gray-600/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 transform hover:scale-105 h-full">
                    <div className="text-5xl mb-4">🔑</div>
                    <h3 className="text-xl font-semibold text-wheat mb-3">I'm Returning</h3>
                    <p className="text-wheat/70 text-sm mb-4">
                      Sign in to continue your intimacy discovery journey
                    </p>
                    <div className="text-gray-300 text-sm font-medium">
                      → Account login
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧬</span>
              </div>
              <h3 className="text-xl font-semibold text-wheat mb-2">Blueprint Science</h3>
              <p className="text-wheat/60">
                Based on proven Erotic Blueprint research - understand how you and your partner naturally connect
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-wheat mb-2">AI-Powered Ideas</h3>
              <p className="text-wheat/60">
                Endless personalized suggestions across 20 intimacy categories - never run out of new things to try
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold text-wheat mb-2">Solo-Friendly</h3>
              <p className="text-wheat/60">
                Start your journey alone or together - flexible approach that works for any situation
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 