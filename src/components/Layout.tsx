'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { UserService } from '../lib/database'
import type { User } from '../lib/firebase'
import Footer from './Footer'
import SeggsyBot from './SeggsyBot'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export default function Layout({ children, currentPage = 'home' }: LayoutProps) {
  const { user } = useAuth()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', href: '/' },
    { id: 'intimacy-hub', label: 'Intimacy Hub', icon: '💕', href: '/intimacy-hub' },
    { id: 'journey', label: 'Journey', icon: '🗺️', href: '/journey' },
    { id: 'coaching', label: 'AI Coach', icon: '🤖', href: '/coaching' },
    { id: 'predictive-insights', label: 'Insights', icon: '🔮', href: '/predictive-insights' },
    { id: 'thoughts', label: 'Thoughts', icon: '💭', href: '/thoughts' },
    { id: 'prompts', label: 'Prompts', icon: '💡', href: '/prompts' },
    { id: 'explore', label: 'Explore', icon: '🌟', href: '/explore' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' }
  ]

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-primary/90 border-b border-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 relative mr-3">
                <Image 
                  src="/SeggsLogoNoBackground.png"
                  alt="seggs.life logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-accent font-primary text-xl font-bold">seggs.life</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-accent/20 text-accent border border-accent/50'
                      : 'text-accent/70 hover:text-accent hover:bg-accent/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* User Menu */}
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-accent/80 text-sm">{user.displayName || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-accent/70 hover:text-accent text-sm px-3 py-1 rounded border border-accent/30 hover:border-accent/60 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-accent/70 hover:text-accent p-3 rounded-lg hover:bg-accent/10 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              >
                <span className="text-xl font-light">{showMobileMenu ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden bg-primary/95 backdrop-blur-sm border-t border-accent/30 shadow-lg"
            >
              <div className="px-3 pt-3 pb-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 min-h-[52px] ${
                      currentPage === item.id
                        ? 'bg-accent/20 text-accent border border-accent/50 shadow-sm'
                        : 'text-accent/70 hover:text-accent hover:bg-accent/10 active:bg-accent/20'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {user && (
                  <div className="pt-3 mt-3 border-t border-accent/30">
                    <div className="px-4 py-2 mb-2">
                      <p className="text-sm text-accent/80 truncate">{user.displayName || user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 text-accent/70 hover:text-accent hover:bg-accent/10 active:bg-accent/20 rounded-xl transition-all duration-200 min-h-[52px]"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden bg-primary/95 backdrop-blur-sm border-t border-accent/30 shadow-lg safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 text-xs transition-all duration-200 rounded-lg min-h-[60px] justify-center ${
                currentPage === item.id
                  ? 'text-accent bg-accent/20 shadow-sm'
                  : 'text-accent/60 hover:text-accent active:text-accent active:bg-accent/10'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Panic Button (Always Visible) */}
      <button
        className="fixed top-4 right-4 w-10 h-10 bg-emphasis hover:bg-emphasis/80 rounded-full flex items-center justify-center text-white z-50 shadow-lg"
        title="Panic mode - disguise app"
        onClick={() => {
          // Implement panic mode
          console.log('Panic mode activated')
        }}
      >
        👁️
      </button>

      <Footer />
      
      {/* Seggsy Chatbot - Only for authenticated users */}
      <SeggsyBot />
    </div>
  )
} 