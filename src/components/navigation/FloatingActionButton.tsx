'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface FABAction {
  id: string
  label: string
  icon: string
  action: () => void
  section: string
}

export default function FloatingActionButton() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  // Context-aware FAB actions based on section
  const getFABActions = (): FABAction[] => {
    // Determine current section
    const section = getCurrentSection()
    
    switch (section) {
      case 'home':
        return [
          {
            id: 'quick-mood',
            label: 'Quick Mood Check',
            icon: '💭',
            action: () => console.log('Mood check'),
            section: 'home'
          },
          {
            id: 'daily-spark',
            label: 'Daily Spark',
            icon: '✨',
            action: () => console.log('Daily spark'),
            section: 'home'
          }
        ]
      
      case 'connect':
        return [
          {
            id: 'start-activity',
            label: 'Start Activity',
            icon: '🎯',
            action: () => console.log('Start activity'),
            section: 'connect'
          },
          {
            id: 'random-prompt',
            label: 'Random Prompt',
            icon: '🎲',
            action: () => console.log('Random prompt'),
            section: 'connect'
          }
        ]
      
      case 'coach':
        return [
          {
            id: 'quick-insight',
            label: 'Quick Insight',
            icon: '💡',
            action: () => console.log('Quick insight'),
            section: 'coach'
          },
          {
            id: 'analyze-patterns',
            label: 'Analyze Patterns',
            icon: '📊',
            action: () => console.log('Analyze patterns'),
            section: 'coach'
          }
        ]
      
      case 'you':
        return [
          {
            id: 'update-profile',
            label: 'Update Profile',
            icon: '👤',
            action: () => console.log('Update profile'),
            section: 'you'
          },
          {
            id: 'sync-partner',
            label: 'Sync with Partner',
            icon: '🔄',
            action: () => console.log('Sync partner'),
            section: 'you'
          }
        ]
      
      default:
        return []
    }
  }

  const getCurrentSection = (): string => {
    if (!pathname) return 'home'
    if (pathname === '/app' || pathname === '/') return 'home'
    if (pathname.includes('/journey') || pathname.includes('/boudoir') || 
        pathname.includes('/explore') || pathname.includes('/prompts') ||
        pathname.includes('/intimacy-hub') || pathname.includes('/ai-suggestions')) {
      return 'connect'
    }
    if (pathname.includes('/coach') || pathname.includes('/predictive-insights')) {
      return 'coach'
    }
    if (pathname.includes('/you') || pathname.includes('/settings') || 
        pathname.includes('/blueprint') || pathname.includes('/partner-connect') ||
        pathname.includes('/personalization')) {
      return 'you'
    }
    return 'home'
  }

  const actions = getFABActions()
  const primaryAction = actions[0]

  if (!primaryAction) return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {/* Expanded Actions */}
        {isExpanded && actions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.slice(1).reverse().map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.5, 
                  y: 20,
                  transition: { delay: (actions.length - 2 - index) * 0.1 }
                }}
                onClick={() => {
                  action.action()
                  setIsExpanded(false)
                }}
                className="flex items-center space-x-3 bg-white hover:bg-gray-50 text-wheat shadow-lg rounded-full px-4 py-3 transition-all duration-200 hover:shadow-xl border border-wheat/10"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (actions.length > 1) {
            setIsExpanded(!isExpanded)
          } else {
            primaryAction.action()
          }
        }}
        className="w-14 h-14 bg-deepRed hover:bg-deepRed/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
      >
        <motion.span
          animate={{ rotate: isExpanded ? 45 : 0 }}
          className="text-xl"
        >
          {isExpanded ? '✕' : primaryAction.icon}
        </motion.span>
        
        {/* Ripple Effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute inset-0 bg-deepRed rounded-full"
        />
      </motion.button>

      {/* Label tooltip */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
            {primaryAction.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 