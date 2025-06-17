import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, userId, properties } = body

    // Validate required fields
    if (!event || !userId) {
      return NextResponse.json(
        { error: 'Event name and userId are required' },
        { status: 400 }
      )
    }

    // Privacy-first analytics - only track conversion and engagement events
    const allowedEvents = [
      'assessment_completed',
      'suggestion_feedback',
      'partner_invited',
      'blueprint_shared',
      'more_like_this_clicked',
      'category_explored',
      'heat_level_selected',
      'suggestion_saved'
    ]

    if (!allowedEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Event not tracked for privacy' },
        { status: 400 }
      )
    }

    // Store analytics event in Firestore
    await addDoc(collection(db, 'analytics_events'), {
      event,
      userId,
      properties: properties || {},
      timestamp: serverTimestamp(),
      source: 'web_app'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
} 