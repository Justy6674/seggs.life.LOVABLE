'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { UserService } from '../lib/database'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '../lib/firebase'

interface AuthContextType {
  user: FirebaseUser | null | undefined
  userData: User | null
  loading: boolean
  error: Error | undefined
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, loading, error] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [userDataLoading, setUserDataLoading] = useState(false)

  // Load user data when authenticated user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setUserDataLoading(true)
        try {
          const data = await UserService.getUser(user.uid)
          setUserData(data)
        } catch (error) {
          console.error('Error loading user data:', error)
          setUserData(null)
        } finally {
          setUserDataLoading(false)
        }
      } else {
        setUserData(null)
        setUserDataLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      setUserData(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value: AuthContextType = {
    user,
    userData,
    loading: loading || userDataLoading,
    error,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext 