'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '../../contexts/AuthContext'

const PersonalizationDashboard = dynamic(
  () => import('../../components/PersonalizationDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }
)

export default function PersonalizationPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
          </div>
        }>
          <PersonalizationDashboard />
        </Suspense>
      </div>
    </AuthProvider>
  )
} 