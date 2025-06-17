'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '../../contexts/AuthContext'

const BlueprintComponent = dynamic(
  () => import('./BlueprintComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
)

export default function BlueprintPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }>
        <BlueprintComponent />
      </Suspense>
    </AuthProvider>
  )
} 