import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Return consent status or requirements
    const consentInfo = {
      required: true,
      version: '1.0',
      lastUpdated: '2024-01-01',
      categories: [
        'data_processing',
        'intimate_content',
        'ai_suggestions',
        'partner_sharing'
      ]
    }

    return NextResponse.json(consentInfo, { status: 200 })
  } catch (error) {
    console.error('Consent check failed:', error)
    return NextResponse.json(
      { error: 'Consent service unavailable' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, consentType, granted } = body

    if (!userId || !consentType || typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: userId, consentType, granted' },
        { status: 400 }
      )
    }

    // Save consent to Firestore
    const consentDoc = doc(db, 'consent', `${userId}_${consentType}`)
    await setDoc(consentDoc, {
      userId,
      consentType,
      granted,
      timestamp: serverTimestamp(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    }, { merge: true })

    return NextResponse.json({ 
      message: 'Consent recorded',
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error recording consent:', error)
    return NextResponse.json(
      { error: 'Failed to record consent' }, 
      { status: 500 }
    )
  }
} 