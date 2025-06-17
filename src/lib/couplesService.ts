import { UserService, CoupleService } from './database'
import { AIService } from './aiService'
import type { User } from './firebase'

export class CouplesService {
  
  /**
   * Connect two users as a couple and check if both have completed onboarding
   * If both are complete, trigger AI report generation
   */
  static async connectPartners(user1Id: string, user2Id: string): Promise<{
    success: boolean
    coupleId?: string
    needsOnboarding?: string[]
    reportGenerated?: boolean
  }> {
    try {
      // Create couple record
      const coupleId = await CoupleService.createCouple(user1Id, user2Id)
      
      // Update both users with couple information
      await Promise.all([
        UserService.updateUser(user1Id, { 
          partnerId: user2Id, 
          coupleId: coupleId 
        }),
        UserService.updateUser(user2Id, { 
          partnerId: user1Id, 
          coupleId: coupleId 
        })
      ])

      // Check if both users have completed onboarding
      const [user1, user2] = await Promise.all([
        UserService.getUser(user1Id),
        UserService.getUser(user2Id)
      ])

      if (!user1 || !user2) {
        throw new Error('Users not found')
      }

      const needsOnboarding: string[] = []
      if (!user1.onboardingCompleted) needsOnboarding.push(user1.displayName || 'User 1')
      if (!user2.onboardingCompleted) needsOnboarding.push(user2.displayName || 'User 2')

      let reportGenerated = false

      // If both have completed onboarding, generate couples report
      if (needsOnboarding.length === 0) {
        try {
          const report = await AIService.generateCouplesReport(user1, user2)
          
          // Save report to both users
          await Promise.all([
            UserService.updateUser(user1Id, {
              couplesReport: report,
              couplesReportGeneratedAt: new Date()
            }),
            UserService.updateUser(user2Id, {
              couplesReport: report,
              couplesReportGeneratedAt: new Date()
            })
          ])

          reportGenerated = true
        } catch (error) {
          console.error('Error generating couples report:', error)
          // Don't fail the connection if report generation fails
        }
      }

      return {
        success: true,
        coupleId: coupleId,
        needsOnboarding: needsOnboarding.length > 0 ? needsOnboarding : undefined,
        reportGenerated
      }

    } catch (error) {
      console.error('Error connecting partners:', error)
      return { success: false }
    }
  }

  /**
   * Check if a couple is ready for AI report generation
   * Called when a user completes onboarding
   */
  static async checkForReportGeneration(userId: string): Promise<boolean> {
    try {
      const user = await UserService.getUser(userId)
      
      if (!user?.partnerId || !user.onboardingCompleted) {
        return false
      }

      const partner = await UserService.getUser(user.partnerId)
      
      if (!partner?.onboardingCompleted) {
        return false
      }

      // Both users have completed onboarding - generate report if not already done
      if (!user.couplesReport || !partner.couplesReport) {
        try {
          const report = await AIService.generateCouplesReport(user, partner)
          
          // Save report to both users
          await Promise.all([
            UserService.updateUser(userId, {
              couplesReport: report,
              couplesReportGeneratedAt: new Date()
            }),
            UserService.updateUser(user.partnerId, {
              couplesReport: report,
              couplesReportGeneratedAt: new Date()
            })
          ])

          return true
        } catch (error) {
          console.error('Error generating couples report:', error)
          return false
        }
      }

      return true // Report already exists
    } catch (error) {
      console.error('Error checking for report generation:', error)
      return false
    }
  }

  /**
   * Get couple status for a user
   */
  static async getCoupleStatus(userId: string): Promise<{
    hasPartner: boolean
    bothCompleted: boolean
    hasReport: boolean
  }> {
    try {
      const userData = await UserService.getUser(userId)
      
      if (!userData?.partnerId) {
        return { hasPartner: false, bothCompleted: false, hasReport: false }
      }

      const partnerData = await UserService.getUser(userData.partnerId)
      
      if (!partnerData) {
        return { hasPartner: false, bothCompleted: false, hasReport: false }
      }

      const bothCompleted = userData.onboardingCompleted && partnerData.onboardingCompleted
      const hasReport = !!(userData.couplesReport && partnerData.couplesReport)

      return {
        hasPartner: true,
        bothCompleted,
        hasReport
      }
    } catch (error) {
      console.error('Error getting couple status:', error)
      return { hasPartner: false, bothCompleted: false, hasReport: false }
    }
  }

  /**
   * Generate invitation link for partner
   */
  static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Create invite for partner
   */
  static async createPartnerInvite(invitingUserId: string): Promise<{
    success: boolean
    inviteCode?: string
    inviteLink?: string
  }> {
    try {
      const inviteCode = this.generateInviteCode()
      
      await UserService.updateUser(invitingUserId, {
        inviteCode,
        updatedAt: new Date()
      })

      const inviteLink = `${window.location.origin}/join/${inviteCode}`

      return {
        success: true,
        inviteCode,
        inviteLink
      }
    } catch (error) {
      console.error('Error creating partner invite:', error)
      return { success: false }
    }
  }

  /**
   * Accept partner invitation
   */
  static async acceptInvite(acceptingUserId: string, inviteCode: string): Promise<{
    success: boolean
    coupleId?: string
    invitingUser?: User
    reportGenerated?: boolean
  }> {
    try {
      // Find user with this invite code
      const invitingUser = await UserService.findUserByInviteCode(inviteCode)
      
      if (!invitingUser) {
        return { success: false }
      }

      // Connect the partners
      const result = await this.connectPartners(invitingUser.id, acceptingUserId)
      
      // Clear the invite code
      await UserService.updateUser(invitingUser.id, {
        inviteCode: undefined,
        updatedAt: new Date()
      })

      return {
        success: result.success,
        coupleId: result.coupleId,
        invitingUser,
        reportGenerated: result.reportGenerated
      }
    } catch (error) {
      console.error('Error accepting invite:', error)
      return { success: false }
    }
  }
} 