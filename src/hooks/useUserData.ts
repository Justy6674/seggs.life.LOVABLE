'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserService } from '../lib/database'
import type { User } from '../lib/firebase'

interface UseUserDataReturn {
  userData: User | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  updateUserData: (updates: Partial<User>) => Promise<void>
}

/**
 * Centralized hook for managing user data
 * Provides consistent user data loading and management across all components
 * Eliminates duplicate loading logic and ensures data consistency
 */
export function useUserData(): UseUserDataReturn {
  const { user } = useAuth()
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user data when auth user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else if (user === null) {
      // User is not authenticated
      setUserData(null)
      setLoading(false)
      setError(null)
    }
    // user === undefined means still loading auth state
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const existingUser = await UserService.getUser(user.uid)
      setUserData(existingUser)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user data')
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    await loadUserData()
  }

  const updateUserData = async (updates: Partial<User>) => {
    if (!user || !userData) return

    try {
      setError(null)
      
      // Optimistically update local state
      const updatedUser = { ...userData, ...updates }
      setUserData(updatedUser)
      
      // Update in database
      await UserService.updateUser(user.uid, updates)
    } catch (err) {
      console.error('Error updating user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user data')
      
      // Revert optimistic update on error
      await loadUserData()
    }
  }

  return {
    userData,
    loading,
    error,
    refreshUserData,
    updateUserData
  }
}
