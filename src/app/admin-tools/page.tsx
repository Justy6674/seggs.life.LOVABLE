'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../lib/firebase'
import { UserService } from '../../lib/database'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  limit 
} from 'firebase/firestore'
import { motion } from 'framer-motion'
import type { User } from '../../lib/firebase'

interface AdminStats {
  totalSessions: number
  totalMessages: number
  userSessions: number
  userMessages: number
  partnerSessions?: number
  partnerMessages?: number
}

export default function AdminTools() {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [partnerData, setPartnerData] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalSessions: 0,
    totalMessages: 0,
    userSessions: 0,
    userMessages: 0
  })
  const [logs, setLogs] = useState<string[]>([])

  const loadUserData = useCallback(async () => {
    try {
      if (!user) return
      
      const userDoc = await UserService.getUser(user.uid)
      if (userDoc) {
        setUserData(userDoc)
        
        if (userDoc.partnerId) {
          const partner = await UserService.getUser(userDoc.partnerId)
          setPartnerData(partner)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [user])

  const loadStats = useCallback(async () => {
    try {
      if (!user) return

      const [
        userSessionsSnapshot,
        userMessagesSnapshot,
        totalSessionsSnapshot,
        totalMessagesSnapshot
      ] = await Promise.all([
        getDocs(query(collection(db, 'seggsy_sessions'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'seggsy_messages'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'seggsy_sessions'), limit(1000))),
        getDocs(query(collection(db, 'seggsy_messages'), limit(1000)))
      ])

      const newStats: AdminStats = {
        totalSessions: totalSessionsSnapshot.size,
        totalMessages: totalMessagesSnapshot.size,
        userSessions: userSessionsSnapshot.size,
        userMessages: userMessagesSnapshot.size
      }

      // If user has a partner, get their stats too
      if (userData?.partnerId) {
        const [partnerSessionsSnapshot, partnerMessagesSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'seggsy_sessions'), where('userId', '==', userData.partnerId))),
          getDocs(query(collection(db, 'seggsy_messages'), where('userId', '==', userData.partnerId)))
        ])

        newStats.partnerSessions = partnerSessionsSnapshot.size
        newStats.partnerMessages = partnerMessagesSnapshot.size
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [user, userData])

  useEffect(() => {
    if (user) {
      loadUserData()
      loadStats()
    }
  }, [user, loadUserData, loadStats])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const resetUserChat = async () => {
    if (!user) return
    
    setLoading(true)
    addLog('🧹 Starting user chat reset...')
    
    try {
      // Delete user's messages
      const messagesQuery = query(
        collection(db, 'seggsy_messages'),
        where('userId', '==', user.uid)
      )
      const messageSnapshot = await getDocs(messagesQuery)
      const deleteMessagePromises = messageSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deleteMessagePromises)
      addLog(`✅ Deleted ${messageSnapshot.size} user messages`)

      // Delete user's sessions
      const sessionsQuery = query(
        collection(db, 'seggsy_sessions'),
        where('userId', '==', user.uid)
      )
      const sessionSnapshot = await getDocs(sessionsQuery)
      const deleteSessionPromises = sessionSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deleteSessionPromises)
      addLog(`✅ Deleted ${sessionSnapshot.size} user sessions`)

      await loadStats()
      addLog('🎉 User chat reset complete!')
    } catch (error) {
      console.error('Error resetting user chat:', error)
      addLog('❌ Error resetting user chat')
    } finally {
      setLoading(false)
    }
  }

  const resetPartnerChat = async () => {
    if (!user || !userData?.partnerId) return
    
    setLoading(true)
    addLog('🧹 Starting partner chat reset...')
    
    try {
      // Delete partner's messages
      const messagesQuery = query(
        collection(db, 'seggsy_messages'),
        where('userId', '==', userData.partnerId)
      )
      const messageSnapshot = await getDocs(messagesQuery)
      const deleteMessagePromises = messageSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deleteMessagePromises)
      addLog(`✅ Deleted ${messageSnapshot.size} partner messages`)

      // Delete partner's sessions
      const sessionsQuery = query(
        collection(db, 'seggsy_sessions'),
        where('userId', '==', userData.partnerId)
      )
      const sessionSnapshot = await getDocs(sessionsQuery)
      const deleteSessionPromises = sessionSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deleteSessionPromises)
      addLog(`✅ Deleted ${sessionSnapshot.size} partner sessions`)

      await loadStats()
      addLog('🎉 Partner chat reset complete!')
    } catch (error) {
      console.error('Error resetting partner chat:', error)
      addLog('❌ Error resetting partner chat')
    } finally {
      setLoading(false)
    }
  }

  const resetBothChats = async () => {
    if (!user) return
    
    setLoading(true)
    addLog('🧹 Starting full couple chat reset...')
    
    try {
      await resetUserChat()
      if (userData?.partnerId) {
        await resetPartnerChat()
      }
      addLog('🎉 Full couple reset complete!')
    } catch (error) {
      console.error('Error resetting both chats:', error)
      addLog('❌ Error resetting both chats')
    } finally {
      setLoading(false)
    }
  }

  const resetUserBlueprint = async () => {
    if (!user) return
    
    setLoading(true)
    addLog('🧹 Resetting user blueprint...')
    
    try {
      await UserService.updateUser(user.uid, {
        eroticBlueprintPrimary: '',
        eroticBlueprintSecondary: '',
        eroticBlueprintScores: {
          energetic: 0,
          sensual: 0,
          sexual: 0,
          kinky: 0,
          shapeshifter: 0
        },
        onboardingCompleted: false
      })
      
      await loadUserData()
      addLog('✅ User blueprint reset - can retake assessment')
    } catch (error) {
      console.error('Error resetting blueprint:', error)
      addLog('❌ Error resetting blueprint')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Tools</h1>
          <p className="text-gray-400">Please log in to access admin tools</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">🔧 Seggsy Admin Tools</h1>
          <p className="text-gray-400">Testing and management tools for seggs.life</p>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">👤 User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {userData?.displayName || 'Not set'}</p>
              <p><strong>Blueprint:</strong> {userData?.eroticBlueprintPrimary || 'Not assessed'}</p>
              <p><strong>Onboarding:</strong> {userData?.onboardingCompleted ? '✅ Complete' : '❌ Incomplete'}</p>
            </div>
            <div>
              <p><strong>Partner Status:</strong> {userData?.partnerId ? '💑 Connected' : '🔍 Single'}</p>
              {partnerData && (
                <>
                  <p><strong>Partner Name:</strong> {partnerData.displayName}</p>
                  <p><strong>Partner Blueprint:</strong> {partnerData.eroticBlueprintPrimary}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">📊 Seggsy Chat Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{stats.userSessions}</div>
              <div className="text-sm text-gray-400">Your Sessions</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{stats.userMessages}</div>
              <div className="text-sm text-gray-400">Your Messages</div>
            </div>
            {partnerData && (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{stats.partnerSessions || 0}</div>
                  <div className="text-sm text-gray-400">Partner Sessions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{stats.partnerMessages || 0}</div>
                  <div className="text-sm text-gray-400">Partner Messages</div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Testing Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">🧪 Testing Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={resetUserChat}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-colors"
            >
              🗑️ Reset My Chat History
            </button>
            
            <button
              onClick={resetUserBlueprint}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-colors"
            >
              🔄 Reset My Blueprint
            </button>

            {partnerData && (
              <>
                <button
                  onClick={resetPartnerChat}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  🗑️ Reset Partner's Chat
                </button>
                
                <button
                  onClick={resetBothChats}
                  disabled={loading}
                  className="bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  💥 Reset Both Chat Histories
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">📝 Activity Log</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">No activity logged yet</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mt-6"
        >
          <h2 className="text-xl font-bold mb-4">📋 Testing Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>• <strong>Reset Chat History:</strong> Clears all Seggsy conversations and sessions</p>
            <p>• <strong>Reset Blueprint:</strong> Allows retaking the Erotic Blueprint assessment</p>
            <p>• <strong>Voice Testing:</strong> Say "Hey Seggsy" to test voice activation</p>
            <p>• <strong>Partner Testing:</strong> Both partners can use these tools independently</p>
            <p>• <strong>Fresh Start:</strong> Reset everything to test onboarding flow from scratch</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 