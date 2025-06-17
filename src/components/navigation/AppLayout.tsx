'use client'

import { useAuth } from '@/hooks/useAuth'
import BottomTabBar from './BottomTabBar'
import ContextHeader from './ContextHeader'
import FloatingActionButton from './FloatingActionButton'
import SeggsyBot from '../SeggsyBot'
import GentleReEntryFlow from '../GentleReEntryFlow'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showBottomNav?: boolean
  showFAB?: boolean
  headerProps?: {
    title?: string
    subtitle?: string
    icon?: string
    showBack?: boolean
    backUrl?: string
    rightAction?: React.ReactNode
  }
}

export default function AppLayout({ 
  children, 
  showHeader = true,
  showBottomNav = true,
  showFAB = true,
  headerProps = {}
}: AppLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show navigation on auth pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register') || pathname?.includes('/auth')
  
  if (isAuthPage) {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-deepRed border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Context Header */}
      {showHeader && <ContextHeader {...headerProps} />}
      
      {/* Main Content Area */}
      <main className={`
        ${showHeader ? 'mt-0' : ''}
        ${showBottomNav ? 'pb-20' : 'pb-4'}
        flex-1 max-w-7xl mx-auto px-4 py-6
      `}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Floating Action Button - Disabled since SeggsyBot has its own */}
      {/* {showFAB && <FloatingActionButton />} */}
      
      {/* Bottom Navigation */}
      {showBottomNav && <BottomTabBar />}
      
      {/* Seggsy Chatbot - Restored! */}
      <SeggsyBot />
      
      {/* Gentle Re-Entry Flow */}
      <GentleReEntryFlow />
    </div>
  )
} 