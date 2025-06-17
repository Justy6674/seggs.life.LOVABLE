'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { NotificationService } from '../lib/database'
import type { Notification } from '../lib/firebase'
import Link from 'next/link'

export default function NotificationBell() {
  const [user] = useAuthState(auth)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time notifications
    const unsubscribe = NotificationService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications)
        setUnreadCount(newNotifications.filter(n => !n.read).length)
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await NotificationService.markNotificationAsRead(notification.id)
      
      // Close dropdown
      setShowDropdown(false)
      
      // Navigate to action URL if available
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'couple_analysis_ready':
        return '💕'
      case 'partner_joined':
        return '👥'
      case 'partner_completed':
        return '✅'
      case 'weekly_followup':
        return '📅'
      case 'milestone_reached':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (!user || unreadCount === 0) {
    return null
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
        aria-label={`${unreadCount} unread notifications`}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Notification Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-700">
                <h3 className="text-white font-medium flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-sm text-gray-400">{unreadCount} new</span>
                </h3>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {notifications.map((notification) => (
                      <motion.button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-700"
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {formatRelativeTime(new Date(
                                (notification.createdAt as any)?.toDate ? 
                                (notification.createdAt as any).toDate() : 
                                notification.createdAt
                              ))}
                            </p>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-700">
                  <Link 
                    href="/app"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 