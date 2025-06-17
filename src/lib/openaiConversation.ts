'use client'

import OpenAI from 'openai'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { 
  ConversationMessage, 
  ConversationContext, 
  ConversationInsight,
  User
} from './firebase'
import { UserService } from './database'

// Initialize OpenAI as you explicitly requested
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
})

export interface ConversationResponse {
  response: string
  insights: ConversationInsight
  contextUsed: string[]
  confidence: number
}

export interface ConversationSummary {
  totalMessages: number
  dominantTopics: string[]
  conversationMood: string
  relationshipFocus: string
  successPatterns: string[]
  aiAnalysis: string
}

export class OpenAIConversationService {
  
  /**
   * Save a conversation message with enhanced context and insights
   */
  static async saveConversationWithContext(
    userId: string,
    userMessage: string,
    aiResponse: string,
    conversationId?: string
  ): Promise<string> {
    try {
      // Get or create conversation
      const convId = conversationId || await this.getOrCreateConversation(userId)
      
      // Extract insights from the conversation using OpenAI
      const insights = await this.extractConversationInsights(userMessage, aiResponse, userId)
      
      // Save user message
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        conversationId: convId,
        content: userMessage,
        sender: 'user',
        timestamp: serverTimestamp(),
        insights: insights.userInsights,
        aiContext: {
          contextUsed: insights.contextUsed,
          promptVersion: '1.0',
          responseConfidence: insights.confidence,
          personalizedElements: insights.personalizedElements
        }
      })

      // Save AI response
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        conversationId: convId,
        content: aiResponse,
        sender: 'ai',
        timestamp: serverTimestamp(),
        insights: insights.aiInsights,
        aiContext: {
          contextUsed: insights.contextUsed,
          promptVersion: '1.0',
          responseConfidence: insights.confidence,
          personalizedElements: insights.personalizedElements
        }
      })

      // Update conversation metadata
      await this.updateConversationMetadata(convId, userId)
      
      return convId
    } catch (error) {
      console.error('Error saving conversation with context:', error)
      throw error
    }
  }

  /**
   * Generate context-aware AI response using OpenAI
   */
  static async generateContextAwareResponse(
    userId: string, 
    userMessage: string,
    conversationId?: string
  ): Promise<ConversationResponse> {
    try {
      // Get user data and blueprint info
      const userData = await UserService.getUser(userId)
      if (!userData) throw new Error('User not found')

      // Get conversation context
      const context = await this.buildConversationContext(userId, conversationId)
      
      // Get recent conversation history
      const recentMessages = await this.getRecentMessages(userId, conversationId, 10)
      
      // Build OpenAI messages
      const messages = await this.buildOpenAIMessages(userData, context, recentMessages, userMessage)
      
      // Generate AI response using OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 1000,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })

      const aiResponse = completion.choices[0]?.message?.content || "I'm having a moment connecting all my thoughts. Can you try asking me again? 💕"

      // Extract insights from this interaction
      const insights = await this.extractConversationInsights(userMessage, aiResponse, userId)
      
      return {
        response: aiResponse,
        insights: insights.aiInsights,
        contextUsed: insights.contextUsed,
        confidence: insights.confidence
      }
    } catch (error) {
      console.error('Error generating context-aware response:', error)
      
      // Fallback response
      return {
        response: "I'm having a moment connecting all my thoughts. Can you try asking me again? 💕",
        insights: {
          topics: ['technical_issue'],
          mood: 'neutral',
          actionItems: [],
          preferences: []
        },
        contextUsed: [],
        confidence: 0.1
      }
    }
  }

  /**
   * Build OpenAI messages array with proper context
   */
  private static async buildOpenAIMessages(
    userData: User,
    context: ConversationContext,
    recentMessages: ConversationMessage[],
    userMessage: string
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
    
    const systemPrompt = `You are Seggsy, a warm, intelligent, and slightly cheeky AI companion for intimate relationships. You specialize in helping couples connect through the Erotic Blueprint system.

PERSONALITY & TONE:
- Warm, neutral, and encouraging
- Slightly playful and cheeky (but never crude)
- Emotionally intelligent and empathetic  
- Use emojis naturally but not excessively
- Speak like a trusted friend who "gets it"

USER CONTEXT:
- Name: ${userData.displayName || 'gorgeous'}
- Primary Blueprint: ${userData.eroticBlueprintPrimary || 'unknown'}
- Secondary Blueprint: ${userData.eroticBlueprintSecondary || 'none'}
- Relationship Stage: ${userData.relationshipStage || 'exploring'}
- Has Partner: ${userData.partnerId ? 'yes' : 'no'}

EROTIC BLUEPRINT KNOWLEDGE:
- Energetic: Needs space, anticipation, teasing, mental connection
- Sensual: All 5 senses, ambiance, luxury, slow buildup
- Sexual: Direct physical appreciation, seeing bodies, straightforward
- Kinky: Power dynamics, taboo, psychological play, rules/structure
- Shapeshifter: Variety, adapts to situations, likes multiple types

CONVERSATION APPROACH:
- Ask follow-up questions to understand better
- Provide practical, actionable advice
- Reference their blueprint type in suggestions
- Be neutral of their relationship goals
- Keep responses concise but meaningful (2-4 sentences usually)
- End with a question or invitation to continue the conversation

BOUNDARIES:
- Stay tasteful and therapeutic, never explicit
- Focus on connection and intimacy, not just physical acts
- Respect all relationship types and orientations
- If asked about serious relationship issues, be neutral but suggest professional help when appropriate`

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add recent conversation history
    recentMessages.forEach(msg => {
      if (msg.sender === 'user') {
        messages.push({ role: 'user', content: msg.content })
      } else {
        messages.push({ role: 'assistant', content: msg.content })
      }
    })

    // Add current user message
    messages.push({ role: 'user', content: userMessage })

    return messages
  }

  /**
   * Get or create a conversation for the user
   */
  private static async getOrCreateConversation(userId: string): Promise<string> {
    try {
      // Check for existing active conversation
      const existingQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        orderBy('lastActivity', 'desc'),
        limit(1)
      )
      
      const existingDocs = await getDocs(existingQuery)
      
      if (!existingDocs.empty) {
        const existingConv = existingDocs.docs[0]
        const lastActivity = existingConv.data().lastActivity?.toDate()
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        
        // If last activity was within an hour, continue that conversation
        if (lastActivity && lastActivity > oneHourAgo) {
          return existingConv.id
        }
      }

      // Create new conversation
      const userData = await UserService.getUser(userId)
      const newConv = await addDoc(collection(db, 'conversations'), {
        userId,
        partnerId: userData?.partnerId || null,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        totalMessages: 0,
        context: {
          recentThemes: [],
          currentFocus: 'general',
          relationshipPhase: userData?.relationshipStage || 'exploring',
          preferredTone: 'playful',
          engagementLevel: 'medium'
        },
        insights: {
          dominantTopics: [],
          mood: 'neutral',
          successPatterns: [],
          aiAnalysis: ''
        }
      })
      
      return newConv.id
    } catch (error) {
      console.error('Error getting/creating conversation:', error)
      throw error
    }
  }

  /**
   * Build conversation context
   */
  private static async buildConversationContext(
    userId: string, 
    conversationId?: string
  ): Promise<ConversationContext> {
    try {
      const userData = await UserService.getUser(userId)
      
      const context: ConversationContext = {
        userId,
        partnerId: userData?.partnerId || undefined,
        conversationId: conversationId || 'new',
        recentThemes: [],
        preferredTone: 'playful',
        currentFocus: 'general',
        relationshipPhase: 'exploring',
        averageSessionLength: 5,
        lastInteraction: new Date(),
        totalMessages: 0,
        engagementLevel: 'medium'
      }

      if (conversationId) {
        const convDoc = await getDoc(doc(db, 'conversations', conversationId))
        if (convDoc.exists()) {
          const data = convDoc.data()
          context.recentThemes = data.context?.recentThemes || []
          context.currentFocus = data.context?.currentFocus || 'general'
          context.preferredTone = data.context?.preferredTone || 'playful'
          context.totalMessages = data.totalMessages || 0
        }
      }

      return context
    } catch (error) {
      console.error('Error building conversation context:', error)
      return {
        userId,
        conversationId: 'error',
        recentThemes: [],
        preferredTone: 'playful',
        currentFocus: 'general',
        relationshipPhase: 'exploring',
        averageSessionLength: 5,
        lastInteraction: new Date(),
        totalMessages: 0,
        engagementLevel: 'medium'
      }
    }
  }

  /**
   * Get recent messages for context
   */
  private static async getRecentMessages(
    userId: string, 
    conversationId?: string, 
    limit_count: number = 10
  ): Promise<ConversationMessage[]> {
    if (!conversationId) return []

    try {
      const messagesQuery = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      )
      
      const messagesSnap = await getDocs(messagesQuery)
      const messages: ConversationMessage[] = []

      messagesSnap.forEach(doc => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          userId: data.userId || userId,
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp?.toDate() || new Date(),
          insights: data.insights
        })
      })

      return messages.reverse() // Return in chronological order
    } catch (error) {
      console.error('Error getting recent messages:', error)
      return []
    }
  }

  /**
   * Extract conversation insights using OpenAI
   */
  private static async extractConversationInsights(
    userMessage: string,
    aiResponse: string,
    userId: string
  ): Promise<{
    userInsights: ConversationInsight,
    aiInsights: ConversationInsight,
    contextUsed: string[],
    confidence: number,
    personalizedElements: string[]
  }> {
    try {
      const insightPrompt = `Analyze this conversation exchange and extract insights:

User Message: "${userMessage}"
AI Response: "${aiResponse}"

Return a JSON object with the following structure:
{
  "userTopics": ["topic1", "topic2"],
  "userMood": "excited|curious|stressed|romantic|playful|concerned|neutral",
  "aiTopics": ["topic1", "topic2"], 
  "aiMood": "neutral|playful|educational|romantic|neutral",
  "actionItems": ["action1", "action2"],
  "preferences": ["preference1", "preference2"],
  "contextUsed": ["context1", "context2"],
  "confidence": 0.8,
  "personalizedElements": ["element1", "element2"]
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing intimate relationship conversations. Return only valid JSON.' },
          { role: 'user', content: insightPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}')

      return {
        userInsights: {
          topics: result.userTopics || [],
          mood: result.userMood || 'neutral',
          actionItems: [],
          preferences: result.preferences || []
        },
        aiInsights: {
          topics: result.aiTopics || [],
          mood: result.aiMood || 'neutral',
          actionItems: result.actionItems || [],
          preferences: []
        },
        contextUsed: result.contextUsed || [],
        confidence: result.confidence || 0.5,
        personalizedElements: result.personalizedElements || []
      }
    } catch (error) {
      console.error('Error extracting insights:', error)
      return this.createFallbackInsights(userMessage, aiResponse)
    }
  }

  /**
   * Create fallback insights when OpenAI analysis fails
   */
  private static createFallbackInsights(userMessage: string, aiResponse: string) {
    const topics = []
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()

    // Basic keyword detection
    if (lowerUser.includes('relationship') || lowerUser.includes('partner')) topics.push('relationship')
    if (lowerUser.includes('intimacy') || lowerUser.includes('intimate')) topics.push('intimacy')
    if (lowerUser.includes('communication') || lowerUser.includes('talk')) topics.push('communication')
    if (lowerUser.includes('blueprint') || lowerUser.includes('type')) topics.push('erotic_blueprint')

    return {
      userInsights: {
        topics,
        mood: 'neutral' as const,
        actionItems: [],
        preferences: []
      },
      aiInsights: {
        topics,
        mood: 'neutral' as const,
        actionItems: [],
        preferences: []
      },
      contextUsed: ['basic_analysis'],
      confidence: 0.3,
      personalizedElements: []
    }
  }

  /**
   * Update conversation metadata
   */
  private static async updateConversationMetadata(conversationId: string, userId: string) {
    try {
      const convRef = doc(db, 'conversations', conversationId)
      const convDoc = await getDoc(convRef)
      
      if (convDoc.exists()) {
        const currentData = convDoc.data()
        await updateDoc(convRef, {
          lastActivity: serverTimestamp(),
          totalMessages: (currentData.totalMessages || 0) + 2, // User + AI message
        })
      }
    } catch (error) {
      console.error('Error updating conversation metadata:', error)
    }
  }

  /**
   * Add message feedback
   */
  static async addMessageFeedback(
    conversationId: string,
    messageId: string,
    feedback: 'helpful' | 'not_helpful' | 'love_it' | 'too_much' | 'off_topic',
    notes?: string
  ) {
    try {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId)
      await updateDoc(messageRef, {
        feedback,
        feedbackNotes: notes || null,
        feedbackTimestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding message feedback:', error)
    }
  }

  /**
   * Analyze conversation patterns (stub for compatibility)
   */
  static async analyzeConversationPatterns(userId: string): Promise<{
    communicationPatterns: any,
    engagementPatterns: any,
    topicPatterns: any,
    timingPatterns: any,
    responsePatterns: any,
    insights: string[]
  }> {
    // Return basic patterns for now
    return {
      communicationPatterns: {},
      engagementPatterns: {},
      topicPatterns: {},
      timingPatterns: {},
      responsePatterns: {},
      insights: ['Using OpenAI-powered conversation analysis']
    }
  }
} 