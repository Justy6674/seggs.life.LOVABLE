import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/firebase'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, addDoc, orderBy } from 'firebase/firestore'
import { COLLECTIONS } from '../../../lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, suggestionId, feedback, category, heatLevel } = body

    if (!userId || !suggestionId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, suggestionId, feedback' },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validFeedback = ['love', 'maybe', 'pass', 'tried', 'not_for_us']
    if (!validFeedback.includes(feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Save feedback to Firestore for AI learning
    const feedbackRecord = {
      userId,
      suggestionId,
      feedback,
      category: category || 'general',
      heatLevel: heatLevel || 'flirty',
      timestamp: serverTimestamp(),
      source: 'boudoir'
    }
    
    const feedbackDoc = await addDoc(collection(db, 'suggestion_feedback'), feedbackRecord)

    // Update user preference profile based on feedback
    const userDoc = doc(db, COLLECTIONS.USERS, userId)
    const userSnap = await getDoc(userDoc)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      const preferences = userData.aiPreferences || {
        lovedCategories: [],
        passedCategories: [],
        preferredHeatLevel: 'flirty',
        totalFeedback: 0
      }
      
      // Update preferences based on feedback
      if (feedback === 'love' || feedback === 'tried') {
        if (!preferences.lovedCategories.includes(category)) {
          preferences.lovedCategories.push(category)
        }
      } else if (feedback === 'pass' || feedback === 'not_for_us') {
        if (!preferences.passedCategories.includes(category)) {
          preferences.passedCategories.push(category)
        }
      }
      
      preferences.totalFeedback = (preferences.totalFeedback || 0) + 1
      preferences.lastUpdated = serverTimestamp()
      
      await updateDoc(userDoc, {
        aiPreferences: preferences,
        updatedAt: serverTimestamp()
      })
    }

    return NextResponse.json({ 
      message: 'Feedback recorded successfully',
      feedbackId: feedbackDoc.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error recording feedback:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      )
    }

    // Fetch user feedback history from Firestore
    const feedbackQuery = query(
      collection(db, 'suggestion_feedback'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )
    
    const feedbackSnapshot = await getDocs(feedbackQuery)
    const feedbackHistory = feedbackSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }))
    
    // Get user preferences
    const userDoc = doc(db, COLLECTIONS.USERS, userId)
    const userSnap = await getDoc(userDoc)
    const userPreferences = userSnap.exists() ? userSnap.data().aiPreferences : null
    
    const response = {
      userId,
      totalFeedback: feedbackHistory.length,
      recentFeedback: feedbackHistory.slice(0, 10), // Last 10 feedback items
      preferences: userPreferences || {
        lovedCategories: [],
        passedCategories: [],
        preferredHeatLevel: 'flirty',
        totalFeedback: 0
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' }, 
      { status: 500 }
    )
  }
} 