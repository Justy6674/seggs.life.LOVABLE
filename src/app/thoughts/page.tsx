'use client'

import AppLayout from '../../components/navigation/AppLayout'
import ThoughtBubble from '../../components/pages/ThoughtBubble'

export default function ThoughtsPage() {
  return (
    <AppLayout 
      headerProps={{
        title: 'Secret Thoughts',
        subtitle: 'Share something special with your partner',
        icon: '💭'
      }}
    >
      <ThoughtBubble />
    </AppLayout>
  )
} 