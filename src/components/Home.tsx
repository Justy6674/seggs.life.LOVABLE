'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import type { User } from '../lib/firebase'
import Link from 'next/link'
import Image from 'next/image'
import Auth from './Auth'
import Footer from './Footer'
import NotificationBell from './NotificationBell'
import { ChevronRight, ArrowRight, Users, Heart, Zap, Target, Play, ChevronDown, User as UserIcon } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const { userData, loading } = useUserData()
  const [showAuth, setShowAuth] = useState('signin')
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Check if user has active membership
  const isMember = userData?.eroticBlueprintPrimary && userData?.partnerId
  const hasPartialSetup = userData?.eroticBlueprintPrimary && !userData?.partnerId

  // Handle logout
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?')
    if (confirmLogout) {
      await signOut(auth)
      setShowUserMenu(false)
    }
  }

  // Get user's first name for personalization
  const getFirstName = () => {
    if (userData?.displayName) {
      return userData.displayName.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'there'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wheat">Loading seggs.life...</p>
        </div>
      </div>
    )
  }

  // 🔥 ALWAYS SHOW BEAUTIFUL PUBLIC LANDING PAGE - Enhanced for all visitors
  return (
    <div className="min-h-screen bg-primary">
      {/* Top Navigation - Subtle member access for logged-in users */}
      <nav className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div>
              <Image 
                src="/SeggsLogoNoBackground.png"
                alt="Seggs.life Logo"
                width={120}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Right side - Auth or User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                // Logged-in user menu
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-burgundy/20 backdrop-blur-sm border border-wheat/20 text-wheat px-4 py-2 rounded-xl hover:bg-burgundy/30 transition-all duration-300"
                  >
                    <UserIcon size={16} />
                    <span className="hidden sm:inline">Hi, {getFirstName()}</span>
                    <ChevronDown size={16} className={`transform transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User dropdown menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-burgundy/95 backdrop-blur-sm border border-wheat/20 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-wheat/10">
                          <p className="text-wheat font-medium">{user.email}</p>
                          <div className="mt-1 text-xs">
                            {isMember && (
                              <span className="text-green-400">✓ Full Member</span>
                            )}
                            {hasPartialSetup && (
                              <span className="text-blue-400">📝 Setup in Progress</span>
                            )}
                            {!userData?.eroticBlueprintPrimary && (
                              <span className="text-yellow-400">🎯 Ready to Start</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <Link 
                            href="/app"
                            className="block px-3 py-2 text-wheat hover:bg-wheat/10 rounded-lg transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            🚀 Members Dashboard
                          </Link>
                          {hasPartialSetup && (
                            <Link 
                              href="/partner-connect"
                              className="block px-3 py-2 text-blue-400 hover:bg-wheat/10 rounded-lg transition-colors duration-200"
                              onClick={() => setShowUserMenu(false)}
                            >
                              💕 Connect Partner
                            </Link>
                          )}
                          {!userData?.eroticBlueprintPrimary && (
                            <Link 
                              href="/test-quiz"
                              className="block px-3 py-2 text-purple-400 hover:bg-wheat/10 rounded-lg transition-colors duration-200"
                              onClick={() => setShowUserMenu(false)}
                            >
                              📝 Take Blueprint Quiz
                            </Link>
                          )}
                          <div className="border-t border-wheat/20 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-3 py-2 text-wheat/70 hover:bg-wheat/10 rounded-lg transition-colors duration-200 text-sm"
                            >
                              🚪 Sign Out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Public visitor buttons
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="text-wheat/80 hover:text-wheat transition-colors duration-200 font-medium"
                  >
                    Members Login
                  </button>
                  <button
                    onClick={() => setShowAuth('signup')}
                    className="bg-deepRed hover:bg-deepRed/90 text-wheat px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    Start Free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Beautiful landing for everyone */}
      <div className="relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/heroseggs.png"
            alt="Seggs.life Hero Background"
            fill
            className="object-cover"
            priority
          />
          {/* Full-screen overlay for text readability */}
          <div className="absolute inset-0 bg-[rgba(75,79,86,0.6)]"></div>
        </div>
        
        <div className="relative px-4 py-20 md:py-32 pt-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Main Headline with Gradient */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                  <span className="bg-gradient-to-r from-wheat to-wheat/70 text-transparent bg-clip-text">
                    Understand your desires. Spark deeper connection. Transform your relationship.
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-wheat/80 leading-relaxed max-w-2xl">
                  Discover your unique erotic blueprint and get personalized relationship insights. Whether you explore solo or as a couple, our AI-powered tools help you understand what creates connection and satisfaction in your relationship.
                </p>

                {/* CTA Buttons - Dynamic based on auth state */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {user ? (
                    // Logged-in user CTAs
                    <>
                      <Link 
                        href="/app"
                        className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-deepRed/50 inline-flex items-center justify-center"
                      >
                        🚀 Enter Your Dashboard
                        <ArrowRight className="ml-2" size={20} />
                      </Link>
                      <Link 
                        href="/test-onboarding"
                        className="bg-burgundy hover:bg-burgundy/80 text-wheat px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-wheat/20 inline-flex items-center justify-center"
                      >
                        👀 Preview Features
                      </Link>
                    </>
                  ) : (
                    // Public visitor CTAs
                    <>
                      <button
                        onClick={() => setShowAuth('signup')}
                        className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-deepRed/50 inline-flex items-center justify-center"
                      >
                        Start Your Journey
                        <ArrowRight className="ml-2" size={20} />
                      </button>
                      <Link 
                        href="/test-onboarding"
                        className="bg-burgundy hover:bg-burgundy/80 text-wheat px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-wheat/20 inline-flex items-center justify-center"
                      >
                        👀 See How It Works
                      </Link>
                    </>
                  )}
                </div>

                {/* Privacy Badge */}
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2 bg-wheat/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-2xl">🔒</span>
                    <span className="text-wheat/90 font-medium">100% Private & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-wheat/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-2xl">💕</span>
                    <span className="text-wheat/90 font-medium">Couples Only</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Features Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Feature Cards */}
                <div className="grid gap-4">
                  <div className="bg-wheat/10 backdrop-blur-sm border border-wheat/20 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="text-deepRed" size={24} />
                      <h3 className="text-wheat font-bold text-lg">Erotic Blueprint Assessment</h3>
                    </div>
                    <p className="text-wheat/80">Discover your unique arousal patterns and desires through our comprehensive quiz.</p>
                  </div>

                  <div className="bg-wheat/10 backdrop-blur-sm border border-wheat/20 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Zap className="text-deepRed" size={24} />
                      <h3 className="text-wheat font-bold text-lg">AI-Powered Suggestions</h3>
                    </div>
                    <p className="text-wheat/80">Get personalized intimacy suggestions based on both partners' blueprints.</p>
                  </div>

                  <div className="bg-wheat/10 backdrop-blur-sm border border-wheat/20 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="text-deepRed" size={24} />
                      <h3 className="text-wheat font-bold text-lg">Couples Dashboard</h3>
                    </div>
                    <p className="text-wheat/80">Private space to explore desires, track connection, and grow together.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-primary/80 to-primary py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-wheat mb-6">How seggs.life Works</h2>
            <p className="text-xl text-wheat/80 max-w-3xl mx-auto">Three simple steps to transform your intimate connection</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users className="text-deepRed" size={32} />,
                title: "Sign Up & Get Started",
                description: "Create your private account and begin your journey. Invite your partner when ready, or explore solo first."
              },
              {
                step: "02", 
                icon: <Target className="text-deepRed" size={32} />,
                title: "Discover Your Blueprint",
                description: "Take our comprehensive erotic blueprint assessment to understand your unique desires and arousal patterns."
              },
              {
                step: "03",
                icon: <Zap className="text-deepRed" size={32} />,
                title: "Get Personalized Insights",
                description: "Receive AI-powered relationship insights and suggestions tailored to your blueprint, whether exploring solo or as a couple."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.2 }}
                className="text-center"
              >
                <div className="bg-wheat/10 backdrop-blur-sm border border-wheat/20 rounded-2xl p-8 h-full">
                  <div className="text-deepRed font-bold text-3xl mb-4">{item.step}</div>
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-wheat font-bold text-xl mb-4">{item.title}</h3>
                  <p className="text-wheat/80 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Section - Only show if not logged in */}
      {!user && (
        <div className="py-16 bg-primary">
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-serif font-bold text-wheat mb-4">Ready to Begin?</h2>
              <p className="text-wheat/80">Create your account and start exploring together</p>
            </motion.div>
            <Auth />
          </div>
        </div>
      )}

             {/* Members Login Modal */}
       <AnimatePresence>
         {showMembersModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowMembersModal(false)}
           >
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-burgundy rounded-2xl p-8 max-w-md w-full border border-wheat/20"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-serif font-bold text-wheat mb-2">Welcome Back!</h2>
                 <p className="text-wheat/70">Sign in to access your member dashboard</p>
               </div>
               <Auth />
               <div className="text-center mt-4">
                 <button
                   onClick={() => setShowMembersModal(false)}
                   className="text-wheat/60 hover:text-wheat transition-colors duration-200"
                 >
                   Cancel
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       <Footer />
     </div>
   )
 } 