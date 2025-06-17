import { messaging, db } from './firebase'
import { getToken } from 'firebase/messaging'
import { doc, updateDoc, addDoc, collection, query, where, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import type { PushSettings, User, Couple } from './firebase'

export class PushNotificationService {
  // Initialize FCM and request permissions
  static async initializePushNotifications(userId: string): Promise<string | null> {
    try {
      if (!messaging || typeof window === 'undefined') {
        console.log('Push notifications not supported in this environment')
        return null
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return null
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      })

      if (token) {
        // Save token to user document
        await setDoc(doc(db, 'users', userId), {
          fcmToken: token,
          updatedAt: serverTimestamp()
        }, { merge: true })
        
        console.log('FCM token obtained and saved successfully')
        return token
      }

      return null
    } catch (error) {
      console.error('Error initializing push notifications:', error)
      return null
    }
  }

  // Create default push settings for a user
  static async createDefaultPushSettings(userId: string, coupleId: string): Promise<void> {
    try {
      const defaultSettings: Partial<PushSettings> = {
        userId,
        coupleId,
        toggles: {
          // Mood & desire alerts
          receiveMoodNudges: true,
          receiveHornyAlerts: false, // Conservative default
          receiveEnergyChecks: true,
          receiveConsentPrompts: true,
          
          // Health reminders
          prepReminders: false,
          stiCheckReminders: false,
          pathologyReminders: false,
          mentalHealthChecks: true,
          
          // Connection modes
          asexualModeOnly: false,
          sexualModeEnabled: true,
          mixedModeEnabled: true,
          
          // Partner-enabled settings (require mutual consent)
          allowPartnerMoodAlerts: false,
          allowPartnerHornyAlerts: false,
          allowPartnerConsentChecks: false,
          allowPartnerHealthReminders: false,
          
          // Timing and frequency
          nightModeEnabled: true, // Respect quiet hours
          workHoursRespect: true,
          weekendOnlyMode: false,
          
          // Content preferences
          aiSuggestionsEnabled: true,
          educationalContentEnabled: true,
          shoppingSuggestionsEnabled: false
        },
        partnerConsentGiven: {
          moodAlerts: false,
          hornyAlerts: false,
          consentChecks: false,
          healthReminders: false
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      }

      await addDoc(collection(db, 'push_settings'), defaultSettings)
    } catch (error) {
      console.error('Error creating default push settings:', error)
      throw error
    }
  }

  // Get user's push settings
  static async getPushSettings(userId: string): Promise<PushSettings | null> {
    try {
      const q = query(collection(db, 'push_settings'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as PushSettings
      }
      
      return null
    } catch (error) {
      console.error('Error getting push settings:', error)
      throw error
    }
  }

  // Update specific toggle setting
  static async updateToggleSetting(
    userId: string, 
    toggleName: keyof PushSettings['toggles'], 
    value: boolean
  ): Promise<void> {
    try {
      const q = query(collection(db, 'push_settings'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, {
          [`toggles.${toggleName}`]: value,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating toggle setting:', error)
      throw error
    }
  }

  // Request partner consent for specific alert type
  static async requestPartnerConsent(
    userId: string, 
    partnerId: string, 
    alertType: keyof PushSettings['partnerConsentGiven']
  ): Promise<void> {
    try {
      // Create a notification request for the partner
      await addDoc(collection(db, 'notifications'), {
        toUserId: partnerId,
        fromUserId: userId,
        type: 'consent_request',
        title: 'Partner Permission Request',
        content: `Your partner wants to send you ${alertType.replace(/([A-Z])/g, ' $1').toLowerCase()}. Do you consent?`,
        data: {
          alertType,
          requestingUserId: userId
        },
        status: 'pending',
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error requesting partner consent:', error)
      throw error
    }
  }

  // Grant partner consent
  static async grantPartnerConsent(
    userId: string, 
    requestingUserId: string, 
    alertType: keyof PushSettings['partnerConsentGiven']
  ): Promise<void> {
    try {
      // Update the requesting user's settings
      const q = query(collection(db, 'push_settings'), where('userId', '==', requestingUserId))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, {
          [`partnerConsentGiven.${alertType}`]: true,
          [`partnerConsentGiven.grantedAt`]: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error granting partner consent:', error)
      throw error
    }
  }

  // Check if notification should be sent based on settings
  static async shouldSendNotification(
    userId: string, 
    notificationType: string,
    userData: User,
    coupleData?: Couple
  ): Promise<boolean> {
    try {
      const settings = await this.getPushSettings(userId)
      if (!settings) return false

      // Check quiet hours
      if (settings.toggles.nightModeEnabled && userData.notificationPreferences) {
        const now = new Date()
        const currentTime = now.getHours() * 100 + now.getMinutes()
        const quietStart = this.timeStringToNumber(userData.notificationPreferences.quietHours.start)
        const quietEnd = this.timeStringToNumber(userData.notificationPreferences.quietHours.end)
        
        if (this.isInQuietHours(currentTime, quietStart, quietEnd)) {
          return false
        }
      }

      // Check work hours (assuming 9-17 weekdays)
      if (settings.toggles.workHoursRespect) {
        const now = new Date()
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
        const isWorkHours = now.getHours() >= 9 && now.getHours() <= 17
        
        if (isWeekday && isWorkHours) {
          return false
        }
      }

      // Check weekend-only mode
      if (settings.toggles.weekendOnlyMode) {
        const now = new Date()
        const isWeekend = now.getDay() === 0 || now.getDay() === 6
        if (!isWeekend) return false
      }

      // Check specific notification type toggles
      switch (notificationType) {
        case 'mood_nudge':
          return settings.toggles.receiveMoodNudges
        case 'horny_alert':
          return settings.toggles.receiveHornyAlerts
        case 'energy_check':
          return settings.toggles.receiveEnergyChecks
        case 'consent_prompt':
          return settings.toggles.receiveConsentPrompts
        case 'prep_reminder':
          return settings.toggles.prepReminders
        case 'sti_reminder':
          return settings.toggles.stiCheckReminders
        case 'pathology_reminder':
          return settings.toggles.pathologyReminders
        case 'mental_health':
          return settings.toggles.mentalHealthChecks
        case 'ai_suggestion':
          return settings.toggles.aiSuggestionsEnabled
        case 'educational_content':
          return settings.toggles.educationalContentEnabled
        case 'shopping_suggestion':
          return settings.toggles.shoppingSuggestionsEnabled
        default:
          return true
      }
    } catch (error) {
      console.error('Error checking notification settings:', error)
      return false
    }
  }

  // Send mood nudge to partner
  static async sendMoodNudge(fromUserId: string, toUserId: string, mood: string): Promise<void> {
    try {
      const fromUser = await this.getUser(fromUserId)
      if (!fromUser) return

      const shouldSend = await this.shouldSendNotification(toUserId, 'mood_nudge', fromUser)
      if (!shouldSend) return

      await this.sendPushNotification(toUserId, {
        title: 'Mood Update',
        body: `Your partner is feeling ${mood} 💕`,
        type: 'mood_nudge',
        data: {
          fromUserId,
          mood,
          timestamp: Date.now().toString()
        }
      })
    } catch (error) {
      console.error('Error sending mood nudge:', error)
    }
  }

  // Send horny alert (with consent check)
  static async sendHornyAlert(fromUserId: string, toUserId: string): Promise<void> {
    try {
      const settings = await this.getPushSettings(fromUserId)
      if (!settings?.partnerConsentGiven.hornyAlerts) {
        throw new Error('Partner consent required for horny alerts')
      }

      const fromUser = await this.getUser(fromUserId)
      if (!fromUser) return

      const shouldSend = await this.shouldSendNotification(toUserId, 'horny_alert', fromUser)
      if (!shouldSend) return

      await this.sendPushNotification(toUserId, {
        title: 'Special Invitation',
        body: 'Your partner has something special in mind... 🔥',
        type: 'horny_alert',
        data: {
          fromUserId,
          timestamp: Date.now().toString()
        }
      })
    } catch (error) {
      console.error('Error sending horny alert:', error)
    }
  }

  // Send health reminder
  static async sendHealthReminder(userId: string, reminderType: string, message: string): Promise<void> {
    try {
      const user = await this.getUser(userId)
      if (!user) return

      const shouldSend = await this.shouldSendNotification(userId, `${reminderType}_reminder`, user)
      if (!shouldSend) return

      await this.sendPushNotification(userId, {
        title: 'Health Reminder',
        body: message,
        type: `${reminderType}_reminder`,
        data: {
          reminderType,
          timestamp: Date.now().toString()
        }
      })
    } catch (error) {
      console.error('Error sending health reminder:', error)
    }
  }

  // Core push notification sending function
  private static async sendPushNotification(
    userId: string, 
    notification: {
      title: string
      body: string
      type: string
      data?: Record<string, string>
    }
  ): Promise<void> {
    try {
      // In a real implementation, this would call your backend API
      // which would use the Firebase Admin SDK to send the push notification
      console.log('Sending push notification:', { userId, notification })
      
      // Store notification in database for tracking
      await addDoc(collection(db, 'notifications'), {
        toUserId: userId,
        type: notification.type,
        title: notification.title,
        content: notification.body,
        data: notification.data || {},
        status: 'sent',
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending push notification:', error)
      throw error
    }
  }

  // Helper functions
  private static timeStringToNumber(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 100 + minutes
  }

  private static isInQuietHours(currentTime: number, quietStart: number, quietEnd: number): boolean {
    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd
    } else {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd
    }
  }

  private static async getUser(userId: string): Promise<User | null> {
    try {
      // This would use your UserService
      const { UserService } = await import('./database')
      return await UserService.getUser(userId)
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }
} 