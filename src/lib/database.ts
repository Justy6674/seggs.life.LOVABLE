import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp,
  setDoc,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Couple, Prompt, ThoughtBubble, DiaryEntry, PushSettings, Notification, CouplesAnalysisResult } from './firebase';

// User Management
export class UserService {
  static async createUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async findUserByInviteCode(inviteCode: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error finding user by invite code:', error);
      throw error;
    }
  }

  static async getPartnerData(userId: string): Promise<User | null> {
    try {
      // Get current user to find their partner ID
      const currentUser = await this.getUser(userId);
      if (!currentUser?.partnerId) {
        return null;
      }

      // Get partner data
      const partnerData = await this.getUser(currentUser.partnerId);
      return partnerData;
    } catch (error) {
      console.error('Error getting partner data:', error);
      throw error;
    }
  }
}

// Couple Management
export class CoupleService {
  static async createCouple(user1Id: string, user2Id: string): Promise<string> {
    try {
      const coupleData: Partial<Couple> = {
        user1Id,
        user2Id,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        isActive: true,
        sharedBoundaries: [],
        sharedIntensityLevel: 'sweet',
        sharedRelationshipType: 'mixed',
        mutualPushConsent: {
          established: false,
          user1Consent: false,
          user2Consent: false
        },
        subscriptionStatus: 'free',
        billingUserId: user1Id
      };

      const docRef = await addDoc(collection(db, 'couples'), coupleData);
      
      // Update both users with coupleId
      await Promise.all([
        UserService.updateUser(user1Id, { coupleId: docRef.id, partnerId: user2Id }),
        UserService.updateUser(user2Id, { coupleId: docRef.id, partnerId: user1Id })
      ]);

      return docRef.id;
    } catch (error) {
      console.error('Error creating couple:', error);
      throw error;
    }
  }

  static async getCouple(coupleId: string): Promise<Couple | null> {
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      if (coupleDoc.exists()) {
        return { id: coupleDoc.id, ...coupleDoc.data() } as Couple;
      }
      return null;
    } catch (error) {
      console.error('Error getting couple:', error);
      throw error;
    }
  }

  static async updateCouple(coupleId: string, updates: Partial<Couple>): Promise<void> {
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating couple:', error);
      throw error;
    }
  }
}

// Prompt Management
export class PromptService {
  static async createPrompt(coupleId: string, promptData: Partial<Prompt>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'prompts'), {
        coupleId,
        ...promptData,
        isCompleted: false,
        generatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  static async getDailyPrompts(coupleId: string): Promise<Prompt[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'prompts'),
        where('coupleId', '==', coupleId),
        where('generatedAt', '>=', Timestamp.fromDate(today)),
        orderBy('generatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
    } catch (error) {
      console.error('Error getting daily prompts:', error);
      throw error;
    }
  }

  static async completePrompt(promptId: string, userId: string): Promise<void> {
    try {
      const promptRef = doc(db, 'prompts', promptId);
      const promptDoc = await getDoc(promptRef);
      
      if (promptDoc.exists()) {
        const promptData = promptDoc.data() as Prompt;
        const completedBy = promptData.completedBy || [];
        
        if (!completedBy.includes(userId)) {
          completedBy.push(userId);
          
          await updateDoc(promptRef, {
            completedBy,
            isCompleted: completedBy.length >= 2, // Both partners completed
            completedAt: completedBy.length >= 2 ? serverTimestamp() : null
          });
        }
      }
    } catch (error) {
      console.error('Error completing prompt:', error);
      throw error;
    }
  }

  static async getCompletedPrompts(coupleId: string): Promise<Prompt[]> {
    try {
      const q = query(
        collection(db, 'prompts'),
        where('coupleId', '==', coupleId),
        where('isCompleted', '==', true),
        orderBy('completedAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
    } catch (error) {
      console.error('Error getting completed prompts:', error);
      throw error;
    }
  }
}

// Thought Bubble Management
export class ThoughtBubbleService {
  static async createThoughtBubble(thoughtData: Partial<ThoughtBubble>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'thought_bubbles'), {
        ...thoughtData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating thought bubble:', error);
      throw error;
    }
  }

  static async getThoughtBubbles(coupleId: string, isPrivate?: boolean): Promise<ThoughtBubble[]> {
    try {
      let q = query(
        collection(db, 'thought_bubbles'),
        where('coupleId', '==', coupleId),
        orderBy('createdAt', 'desc')
      );

      if (isPrivate !== undefined) {
        q = query(
          collection(db, 'thought_bubbles'),
          where('coupleId', '==', coupleId),
          where('isPrivate', '==', isPrivate),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThoughtBubble));
    } catch (error) {
      console.error('Error getting thought bubbles:', error);
      throw error;
    }
  }

  static async revealThoughtBubble(thoughtId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'thought_bubbles', thoughtId), {
        revealedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error revealing thought bubble:', error);
      throw error;
    }
  }

  static async getScheduledThoughts(coupleId: string): Promise<ThoughtBubble[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'thought_bubbles'),
        where('coupleId', '==', coupleId),
        where('scheduledRevealAt', '<=', Timestamp.fromDate(now)),
        where('revealedAt', '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThoughtBubble));
    } catch (error) {
      console.error('Error getting scheduled thoughts:', error);
      throw error;
    }
  }
}

// Memory/Diary Management
export class DiaryService {
  static async createMemory(memoryData: Partial<DiaryEntry>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'diary'), {
        ...memoryData,
        isFavourite: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating memory:', error);
      throw error;
    }
  }

  static async getMemories(coupleId: string): Promise<DiaryEntry[]> {
    try {
      const q = query(
        collection(db, 'diary'),
        where('coupleId', '==', coupleId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
    } catch (error) {
      console.error('Error getting memories:', error);
      throw error;
    }
  }

  static async toggleFavourite(memoryId: string, isFavourite: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'diary', memoryId), {
        isFavourite
      });
    } catch (error) {
      console.error('Error toggling favourite:', error);
      throw error;
    }
  }
}

// Streak/Gamification Management
export class StreakService {
  static async updateStreak(coupleId: string): Promise<void> {
    try {
      const streakRef = doc(db, 'streaks', coupleId);
      const streakDoc = await getDoc(streakRef);
      
      if (streakDoc.exists()) {
        const streakData = streakDoc.data();
        const lastActive = streakData.lastPromptCompleted?.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (lastActive) {
          const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day
            await updateDoc(streakRef, {
              daysActive: streakData.daysActive + 1,
              lastPromptCompleted: serverTimestamp()
            });
          } else if (daysDiff > 1) {
            // Streak broken
            await updateDoc(streakRef, {
              daysActive: 1,
              lastPromptCompleted: serverTimestamp()
            });
          }
        }
      } else {
        // Create new streak
        await updateDoc(streakRef, {
          coupleId,
          daysActive: 1,
          lastPromptCompleted: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  static async getStreak(coupleId: string): Promise<{ daysActive: number; lastActive: Date | null } | null> {
    try {
      const streakDoc = await getDoc(doc(db, 'streaks', coupleId));
      if (streakDoc.exists()) {
        const data = streakDoc.data();
        return {
          daysActive: data.daysActive || 0,
          lastActive: data.lastPromptCompleted?.toDate() || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting streak:', error);
      throw error;
    }
  }
}

// Real-time subscription helpers
export class RealtimeService {
  static subscribeToPrompts(coupleId: string, callback: (prompts: Prompt[]) => void) {
    const q = query(
      collection(db, 'prompts'),
      where('coupleId', '==', coupleId),
      orderBy('generatedAt', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const prompts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
      callback(prompts);
    });
  }

  static subscribeToThoughts(coupleId: string, callback: (thoughts: ThoughtBubble[]) => void) {
    const q = query(
      collection(db, 'thought_bubbles'),
      where('coupleId', '==', coupleId),
      where('revealedAt', '!=', null),
      orderBy('revealedAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const thoughts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThoughtBubble));
      callback(thoughts);
    });
  }

  static subscribeToPartnerActivity(partnerId: string, callback: (isOnline: boolean) => void) {
    const userRef = doc(db, 'users', partnerId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const lastSeen = userData.lastSeen?.toDate();
        const isOnline = lastSeen ? (Date.now() - lastSeen.getTime()) < 300000 : false; // 5 minutes
        callback(isOnline);
      }
    });
  }
}

// Boundaries Management
export class BoundaryService {
  static async updateBoundaries(coupleId: string, boundaries: string[], safeWord: string): Promise<void> {
    try {
      await addDoc(collection(db, 'boundaries'), {
        coupleId,
        safeWord,
        bannedTopics: boundaries,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating boundaries:', error);
      throw error;
    }
  }

  static async getBoundaries(coupleId: string): Promise<{ safeWord: string; bannedTopics: string[] } | null> {
    try {
      const q = query(
        collection(db, 'boundaries'),
        where('coupleId', '==', coupleId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const boundaryDoc = querySnapshot.docs[0];
        const data = boundaryDoc.data();
        return {
          safeWord: data.safeWord || '',
          bannedTopics: data.bannedTopics || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting boundaries:', error);
      throw error;
    }
  }
}

// NEW: Couples Analysis Service
export class CouplesAnalysisService {
  /**
   * Save partner's quiz results to the couple document
   * This will trigger the Cloud Function when both partners are complete
   */
  static async savePartnerQuizResults(
    userId: string, 
    coupleId: string, 
    scores: {
      energetic: number;
      sensual: number;
      sexual: number;
      kinky: number;
      shapeshifter: number;
    },
    primaryBlueprint: string,
    secondaryBlueprint?: string
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const coupleRef = doc(db, 'couples', coupleId);
        const coupleDoc = await transaction.get(coupleRef);
        
        if (!coupleDoc.exists()) {
          throw new Error('Couple document not found');
        }
        
        const coupleData = coupleDoc.data() as Couple;
        
        // Determine if this user is partnerA or partnerB
        let partnerKey: 'partnerA' | 'partnerB';
        if (coupleData.user1Id === userId) {
          partnerKey = 'partnerA';
        } else if (coupleData.user2Id === userId) {
          partnerKey = 'partnerB';
        } else {
          throw new Error('User is not part of this couple');
        }
        
        // Prevent overwriting existing data
        if (coupleData[partnerKey]) {
          console.log(`Partner ${partnerKey} data already exists, skipping update`);
          return;
        }
        
        const partnerData = {
          userId,
          completedAt: serverTimestamp(),
          primaryBlueprint,
          secondaryBlueprint,
          scores
        };
        
        transaction.update(coupleRef, {
          [partnerKey]: partnerData,
          updatedAt: serverTimestamp()
        });
      });
      
      console.log('✅ Partner quiz results saved to couple document');
    } catch (error) {
      console.error('Error saving partner quiz results:', error);
      throw error;
    }
  }

  /**
   * Get couples analysis result
   */
  static async getCouplesAnalysis(coupleId: string): Promise<CouplesAnalysisResult | null> {
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      
      if (!coupleDoc.exists()) {
        return null;
      }
      
      const coupleData = coupleDoc.data() as Couple;
      
      if (!coupleData.analysis || !coupleData.partnerA || !coupleData.partnerB) {
        return null;
      }
      
      // Get user names
      const [user1Doc, user2Doc] = await Promise.all([
        getDoc(doc(db, 'users', coupleData.partnerA.userId)),
        getDoc(doc(db, 'users', coupleData.partnerB.userId))
      ]);
      
      const user1Data = user1Doc.data();
      const user2Data = user2Doc.data();
      
      return {
        coupleId,
        partnerA: {
          userId: coupleData.partnerA.userId,
          name: user1Data?.displayName || 'Partner A',
          primaryBlueprint: coupleData.partnerA.primaryBlueprint,
          secondaryBlueprint: coupleData.partnerA.secondaryBlueprint,
          scores: coupleData.partnerA.scores
        },
        partnerB: {
          userId: coupleData.partnerB.userId,
          name: user2Data?.displayName || 'Partner B',
          primaryBlueprint: coupleData.partnerB.primaryBlueprint,
          secondaryBlueprint: coupleData.partnerB.secondaryBlueprint,
          scores: coupleData.partnerB.scores
        },
        analysis: {
          summary: coupleData.analysis.summary,
          compatibility: {
            strengths: [], // Will be enhanced in future iterations
            challenges: [],
            overlapAreas: []
          },
          individualTips: {
            forPartnerA: [coupleData.analysis.partnerATips],
            forPartnerB: [coupleData.analysis.partnerBTips]
          },
          sharedExercises: coupleData.analysis.exercises,
          conversationStarters: coupleData.analysis.suggestions,
          nextSteps: coupleData.analysis.revisitPrompt || 'Continue growing together!',
          generatedAt: coupleData.analysis.generatedAt
        }
      };
    } catch (error) {
      console.error('Error getting couples analysis:', error);
      throw error;
    }
  }

  /**
   * Check if both partners have completed their quizzes
   */
  static async checkCoupleStatus(coupleId: string): Promise<{
    partnerAComplete: boolean;
    partnerBComplete: boolean;
    analysisReady: boolean;
    analysisInProgress: boolean;
  }> {
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      
      if (!coupleDoc.exists()) {
        return {
          partnerAComplete: false,
          partnerBComplete: false,
          analysisReady: false,
          analysisInProgress: false
        };
      }
      
      const coupleData = coupleDoc.data() as Couple;
      
      return {
        partnerAComplete: !!coupleData.partnerA,
        partnerBComplete: !!coupleData.partnerB,
        analysisReady: !!coupleData.analysisReady,
        analysisInProgress: !!coupleData.analysisInProgress
      };
    } catch (error) {
      console.error('Error checking couple status:', error);
      throw error;
    }
  }
}

// NEW: Notification Service
export class NotificationService {
  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Notification));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user notifications
   */
  static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Notification));
      callback(notifications);
    });
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
} 