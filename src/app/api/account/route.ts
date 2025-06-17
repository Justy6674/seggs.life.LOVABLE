import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { COLLECTIONS } from '../../../lib/firebase'

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

    // Fetch user account data from Firestore
    const userDoc = doc(db, COLLECTIONS.USERS, userId)
    const userSnap = await getDoc(userDoc)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      )
    }
    
    const userData = userSnap.data()
    const accountData = {
      userId,
      accountStatus: 'active',
      subscriptionTier: userData.subscriptionTier || 'free',
      lastLogin: userData.lastSeen?.toDate?.() || new Date(),
      displayName: userData.displayName,
      email: userData.email,
      onboardingCompleted: userData.onboardingCompleted,
      partnerId: userData.partnerId,
      features: {
        boudoir: true,
        blueprint: true,
        aiSuggestions: true,
        partnerSharing: !!userData.partnerId
      }
    }

    return NextResponse.json(accountData, { status: 200 })
  } catch (error) {
    console.error('Account fetch failed:', error)
    return NextResponse.json(
      { error: 'Account service unavailable' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, updates' },
        { status: 400 }
      )
    }

    // Update user account in Firestore
    const userDoc = doc(db, COLLECTIONS.USERS, userId)
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(userDoc, updateData)

    return NextResponse.json({ 
      message: 'Account updated',
      userId,
      updatedFields: Object.keys(updates),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      )
    }

    // Delete user account and all associated data
    const batch = writeBatch(db)
    
    // Delete user document
    const userDoc = doc(db, COLLECTIONS.USERS, userId)
    batch.delete(userDoc)
    
    // Delete associated data collections
    const collectionsToClean = [
      COLLECTIONS.THOUGHT_BUBBLES,
      COLLECTIONS.DIARY,
      COLLECTIONS.NOTIFICATIONS,
      COLLECTIONS.HEALTH_RECORDS,
      COLLECTIONS.INTIMACY_CACHE,
      COLLECTIONS.BLUEPRINT_ANALYSIS,
      COLLECTIONS.ACTION_USAGE
    ]
    
    for (const collectionName of collectionsToClean) {
      const q = query(collection(db, collectionName), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
    }
    
    await batch.commit()

    return NextResponse.json({ 
      message: 'Account deletion completed',
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' }, 
      { status: 500 }
    )
  }
} 