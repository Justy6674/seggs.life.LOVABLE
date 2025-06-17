'use client'

import dynamic from 'next/dynamic'
import AppLayout from '../../components/navigation/AppLayout'

const JourneyDashboard = dynamic(() => import('../../components/JourneyDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
    </div>
  )
})

export default function JourneyPage() {
  return (
    <AppLayout 
      headerProps={{
        title: 'Your Journey',
        subtitle: 'Track growth and celebrate milestones',
        icon: '🗺️'
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">      
        <JourneyDashboard />
      </div>
    </AppLayout>
  )
} 