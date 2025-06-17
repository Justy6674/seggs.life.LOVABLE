import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, suggestionId, feedback, timestamp } = body;

    if (!userId || !suggestionId || !feedback) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Valid feedback types
    const validFeedback = ['loved', 'liked', 'disliked'];
    if (!validFeedback.includes(feedback)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid feedback type' 
      }, { status: 400 });
    }

    // Store feedback in user's suggestion history
    const historyRef = doc(db, 'suggestionHistory', userId);
    const historySnap = await getDoc(historyRef);

    const feedbackRecord = {
      suggestionId,
      feedback,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date()
    };

    if (!historySnap.exists()) {
      // Create new history document
      await setDoc(historyRef, {
        feedbackHistory: [feedbackRecord],
        lovedSuggestions: feedback === 'loved' ? [suggestionId] : [],
        likedSuggestions: feedback === 'liked' ? [suggestionId] : [],
        dislikedSuggestions: feedback === 'disliked' ? [suggestionId] : [],
        totalFeedback: 1,
        createdAt: new Date()
      });
    } else {
      // Update existing history
      const updateData: any = {
        feedbackHistory: arrayUnion(feedbackRecord),
        totalFeedback: (historySnap.data().totalFeedback || 0) + 1,
        lastFeedbackDate: new Date()
      };

      // Add to appropriate feedback category
      if (feedback === 'loved') {
        updateData.lovedSuggestions = arrayUnion(suggestionId);
      } else if (feedback === 'liked') {
        updateData.likedSuggestions = arrayUnion(suggestionId);
      } else if (feedback === 'disliked') {
        updateData.dislikedSuggestions = arrayUnion(suggestionId);
      }

      await updateDoc(historyRef, updateData);
    }

    // Also store in global feedback collection for analytics
    const globalFeedbackRef = doc(db, 'suggestionFeedback', `${userId}_${suggestionId}`);
    await setDoc(globalFeedbackRef, {
      userId,
      suggestionId,
      feedback,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback stored successfully' 
    });

  } catch (error) {
    console.error('Error storing suggestion feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to store feedback' 
    }, { status: 500 });
  }
} 