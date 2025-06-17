'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '../../contexts/AuthContext'

const BoudoirComponent = dynamic(
  () => import('./BoudoirComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
)

export default function BoudoirPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }>
        <BoudoirComponent />
      </Suspense>
    </AuthProvider>
  )
}

 