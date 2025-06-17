'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/navigation/AppLayout'
import RelationshipTimeline from '@/components/RelationshipTimeline'
import { useUserData } from '@/hooks/useUserData'

export default function RelationshipTimelinePage() {
  const { userData } = useUserData()

  return (
    <AppLayout 
      headerProps={{
        title: 'Your Journey',
        subtitle: 'Track your relationship growth over time',
        icon: '📈',
        showBack: true,
        backUrl: '/our-connection'
      }}
    >
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <RelationshipTimeline />
        </div>
      </div>
    </AppLayout>
  )
} 