'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'
import { usePathname } from 'next/navigation'
import { OpenAIConversationService } from '../lib/openaiConversation'
import type { ConversationMessage } from '../lib/firebase'
import Image from 'next/image'

interface Message {
  id: string
  text: string
  sender: 'user' | 'seggsy'
  timestamp: Date
  feedback?: 'helpful' | 'not_helpful' | 'love_it' | 'too_much' | 'off_topic'
  insights?: {
    topics: string[]
    mood: string
    actionItems: string[]
  }
}

interface UserData {
  displayName?: string
  eroticBlueprintPrimary?: string
  eroticBlueprintSecondary?: string
  partnerId?: string
}

export default function SeggsyBot() {
  const { user } = useAuth()
  const { userData } = useUserData()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversationContext, setConversationContext] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const pathname = usePathname()

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Voice recognition setup
  useEffect(() => {
    if (!user) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1]
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.toLowerCase().trim()
          if (transcript.includes('hey seggsy') || transcript.includes('hi seggsy')) {
            openChatWithVoiceGreeting()
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error)
        setIsListening(false)
      }

      // Start listening
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.log('Voice recognition not supported or blocked')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [user])

  // Listen for FAB events to open chat
  useEffect(() => {
    const handleOpenSeggsy = () => {
      openChat()
    }

    window.addEventListener('openSeggsy', handleOpenSeggsy)
    
    return () => {
      window.removeEventListener('openSeggsy', handleOpenSeggsy)
    }
  }, [])

  const openChatWithVoiceGreeting = async () => {
    setIsOpen(true)
    
    // Stop voice recognition when chat opens
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    // Load conversation history
    await loadConversationHistory()

    // Add greeting message if it's the first message
    if (messages.length === 0) {
      const greeting = `Hey ${userData?.displayName || 'gorgeous'}! I heard you calling for me 😊 What's on your mind tonight?`
      addMessage(greeting, 'seggsy')
    }
  }

  const addMessage = (text: string, sender: 'user' | 'seggsy') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Load conversation history when chat opens
  const loadConversationHistory = async () => {
    if (!user || messages.length > 0) return

    try {
      // Get recent conversations for this user
      const conversations = await OpenAIConversationService.analyzeConversationPatterns(user.uid)
      
      // For now, we'll start fresh each time but could load recent messages here
      // This is where we could implement conversation persistence across sessions
      
    } catch (error) {
      console.error('Error loading conversation history:', error)
    }
  }

  // Generate context-aware greeting based on current page
  const getContextualGreeting = (): string => {
    const displayName = userData?.displayName || 'gorgeous'
    
    if (!pathname) return `Hey ${displayName}! What's on your mind? 💕`
    
    // Context-aware greetings by page
    if (pathname.includes('/journey')) {
      return `Hey ${displayName}! I see you're exploring your journey. What aspect of your intimacy journey would you like to talk about? ✨`
    }
    if (pathname.includes('/blueprint')) {
      return `Hi ${displayName}! Working on your erotic blueprint? I'm here to help you understand your desires better! 🧭`
    }
    if (pathname.includes('/boudoir')) {
      return `Hey beautiful! In the boudoir section? Tell me what's inspiring your sensual side today! 🌹`
    }
    if (pathname.includes('/prompts')) {
      return `Hi ${displayName}! Looking for conversation prompts? I can help you find the perfect one or create something custom! 💬`
    }
    if (pathname.includes('/predictive-insights')) {
      return `Hey ${displayName}! I see you're checking out insights. Want to dive deeper into what the patterns might mean? 🔮`
    }
    if (pathname.includes('/settings')) {
      return `Hi ${displayName}! Updating your preferences? I can help you customize your experience! ⚙️`
    }
    if (pathname.includes('/partner-connect')) {
      return `Hey ${displayName}! Working on partner connection? I'm here to help strengthen your bond! 💕`
    }
    if (pathname.includes('/explore')) {
      return `Hi ${displayName}! In exploration mode? I love helping discover new dimensions of intimacy! 🗺️`
    }
    if (pathname.includes('/coach') || pathname.includes('/coaching')) {
      return `Hey ${displayName}! Ready for some coaching? What relationship topic can I help you with today? 🤖`
    }
    
    // Default greeting
    return `Hey ${displayName}! I'm here to chat about anything on your mind. What would you like to explore today? 💕`
  }

  // Handle opening chat (with history loading and contextual greeting)
  const openChat = async () => {
    setIsOpen(true)
    await loadConversationHistory()
    
    // Add contextual greeting if it's the first message
    if (messages.length === 0) {
      const contextualGreeting = getContextualGreeting()
      addMessage(contextualGreeting, 'seggsy')
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return

    const userMessage = inputText.trim()
    setInputText('')
    
    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      // Generate context-aware AI response using our intelligent system
      const response = await OpenAIConversationService.generateContextAwareResponse(
        user.uid,
        userMessage,
        conversationId || undefined
      )

      // Save the conversation with context and insights
      const newConversationId = await OpenAIConversationService.saveConversationWithContext(
        user.uid,
        userMessage,
        response.response,
        conversationId || undefined
      )

      // Update conversation ID if this is a new conversation
      if (!conversationId) {
        setConversationId(newConversationId)
      }

      // Add AI response to UI with insights
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'seggsy',
        timestamp: new Date(),
        insights: {
          topics: response.insights.topics,
          mood: response.insights.mood,
          actionItems: response.insights.actionItems
        }
      }
      setMessages(prev => [...prev, aiMsg])

      // Update conversation context for better future responses
      if (response.contextUsed.length > 0) {
        setConversationContext(response.contextUsed)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having a moment connecting all my thoughts. Can you try asking me again? 💕",
        sender: 'seggsy',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle message feedback
  const handleMessageFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful' | 'love_it' | 'too_much' | 'off_topic') => {
    try {
      // Update local state immediately
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ))

      // Save feedback to database if we have a conversation ID
      if (conversationId) {
        // Find the corresponding database message ID (this is simplified - in production you'd track this better)
        await OpenAIConversationService.addMessageFeedback(
          conversationId,
          messageId, // In production, this should be the Firestore document ID
          feedback
        )
      }
    } catch (error) {
      console.error('Error saving feedback:', error)
    }
  }

  // Don't render for non-authenticated users
  if (!user) return null

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3, ease: "easeOut" }}
      >
        <motion.button
          onClick={openChat}
          className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary to-burgundy hover:from-primary/80 hover:to-burgundy/80 rounded-full shadow-xl flex items-center justify-center transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Image
            src="/SEGGSYCHATBOT.png"
            alt="Seggsy"
            width={32}
            height={32}
            className="w-7 h-7 md:w-8 md:h-8 object-contain"
          />
          
          {/* Voice listening indicator */}
          {isListening && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 md:bottom-24 right-2 md:right-4 lg:right-6 w-[calc(100vw-16px)] max-w-sm md:w-80 lg:w-96 h-[400px] md:h-[450px] lg:h-[500px] bg-white rounded-2xl shadow-2xl border border-wheat/20 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-burgundy p-3 md:p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Image
                  src="/SEGGSYCHATBOT.png"
                  alt="Seggsy"
                  width={32}
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8 object-contain rounded-full"
                />
                <div>
                  <h3 className="text-wheat font-serif font-semibold text-sm md:text-base">Seggsy</h3>
                  <p className="text-wheat/70 text-xs">Your intimate AI companion</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-wheat/70 hover:text-wheat transition-colors p-1"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-600 py-6 md:py-8">
                  <Image
                    src="/SEGGSYCHATBOT.png"
                    alt="Seggsy"
                    width={48}
                    height={48}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain mx-auto mb-2 opacity-50"
                  />
                  <p className="text-sm">Hi there! I'm Seggsy, your intimate AI companion.</p>
                  <p className="text-xs mt-1">Ask me anything about connection and intimacy! 💕</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-xs ${message.sender === 'user' ? '' : 'space-y-2'}`}>
                    <div
                      className={`p-2.5 md:p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-wheat'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-wheat/70' : 'text-slate-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Show insights for AI messages */}
                        {message.sender === 'seggsy' && message.insights && (
                          <div className="flex items-center space-x-1">
                            {message.insights.topics.slice(0, 2).map((topic, i) => (
                              <span key={i} className="text-xs bg-slate-200 text-slate-600 px-1 py-0.5 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Feedback buttons for AI messages */}
                    {message.sender === 'seggsy' && !message.feedback && (
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleMessageFeedback(message.id, 'love_it')}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors touch-manipulation"
                          title="Love it!"
                        >
                          💕
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, 'helpful')}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors touch-manipulation"
                          title="Helpful"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, 'not_helpful')}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors touch-manipulation"
                          title="Not helpful"
                        >
                          👎
                        </button>
                      </div>
                    )}
                    
                    {/* Show feedback if given */}
                    {message.sender === 'seggsy' && message.feedback && (
                      <div className="ml-2 text-xs text-slate-500">
                        Feedback: {message.feedback.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-2.5 md:p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 border-t border-wheat/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Seggsy anything..."
                  className="flex-1 bg-slate-50 text-slate-800 rounded-lg px-3 py-2 text-sm border border-wheat/30 focus:border-primary focus:outline-none min-w-0"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-primary hover:bg-primary/80 disabled:bg-slate-300 text-wheat px-3 md:px-4 py-2 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 