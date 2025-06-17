'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Send, Mic, MicOff, Sparkles, Heart, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'seggsy';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'quiz' | 'image';
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

const suggestedPrompts = [
  "Help us spice up our date nights",
  "I want to understand my partner better",
  "What are some sensual activities we can try?",
  "How can we improve our communication?",
  "Give me romantic surprise ideas",
  "We're in a long-distance relationship"
];

export function SeggsyChat() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userBlueprint, setUserBlueprint] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.uid) {
      loadUserData();
      loadChatHistory();
      // Send welcome message if first time
      const hasVisited = localStorage.getItem(`seggsy-chat-${user.uid}`);
      if (!hasVisited) {
        sendWelcomeMessage();
        localStorage.setItem(`seggsy-chat-${user.uid}`, 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserData = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      if (userData?.blueprintResult) {
        setUserBlueprint(userData.blueprintResult);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!user?.uid) return;
    try {
      const messagesQuery = query(
        collection(db, 'chatMessages'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'asc'),
        limit(50)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const chatMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ChatMessage[];
      
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      content: `Hey gorgeous! 💋 I'm Seggsy, your AI intimacy coach. I'm here to help you and your partner explore deeper connection, spice up your relationship, and discover new ways to love each other. What would you like to talk about today?`,
      sender: 'seggsy',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !user?.uid) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, 'chatMessages'), {
        ...userMessage,
        userId: user!.uid
      });

      // Generate AI response
      const aiResponse = await generateAIResponse(content);
      
      const aiMessage: ChatMessage = {
        id: 'seggsy-' + Date.now(),
        content: aiResponse,
        sender: 'seggsy',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to Firestore
      await addDoc(collection(db, 'chatMessages'), {
        ...aiMessage,
        userId: user!.uid
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        content: "Oops! I'm having a moment. Can you try asking me again? 💕",
        sender: 'seggsy',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // This would call your AI API (OpenAI, etc.)
    // For now, we'll use contextual mock responses
    
    const input = userInput.toLowerCase();
    
    if (input.includes('date') || input.includes('romantic')) {
      return `I love that you're thinking about romance! 💕 Based on your ${userBlueprint?.dominantType || 'unique'} blueprint, here are some ideas:\n\n• Create a sensory experience with candlelight, soft music, and your favorite scents\n• Plan a surprise picnic indoors with all your favorite foods\n• Try a couples massage with warm oils\n\nWhat kind of mood are you going for - sweet and tender, or something with more heat? 🔥`;
    }
    
    if (input.includes('communication') || input.includes('talk')) {
      return `Communication is the foundation of amazing intimacy! 💬 Here's what I recommend:\n\n• Start with 'I feel' statements instead of 'You always/never'\n• Set aside 15 minutes daily for device-free connection time\n• Try the 'appreciation sandwich' - share something you love, discuss an issue, then end with gratitude\n\nRemember, great lovers are great listeners first. What specific area of communication would you like to work on?`;
    }
    
    if (input.includes('spice') || input.includes('exciting') || input.includes('new')) {
      return `Ooh, I love the adventurous energy! ✨ Let's add some delicious variety:\n\n• Change your usual location - try the kitchen counter, a hotel, or even a blanket fort\n• Introduce new textures - silk scarves, ice cubes, feathers\n• Play with anticipation - send flirty texts throughout the day\n• Create themed nights based on different countries or time periods\n\nWhat's your comfort zone right now, and how far outside it are you willing to explore? 😈`;
    }
    
    if (input.includes('long distance') || input.includes('apart')) {
      return `Long distance love requires extra creativity, but it can actually deepen your connection! 💝\n\n• Schedule virtual date nights with coordinated activities\n• Send care packages with items that smell like you\n• Try synchronized movies or online games\n• Write each other love letters (yes, actual letters!)\n• Plan countdown activities for your next visit\n\nThe anticipation and intentionality can make your reunions incredibly passionate. How often are you able to see each other?`;
    }
    
    // Default response
    return `That's such an interesting question! 💭 I love how thoughtful you are about your relationship. Can you tell me a bit more about what specifically you'd like to explore? I'm here to help you create more connection, pleasure, and joy together. Whether it's emotional intimacy, physical connection, or just having more fun - I've got ideas for you! 😘`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const startVoiceInput = () => {
    // Implement speech recognition
    setIsListening(true);
    // Mock implementation
    setTimeout(() => {
      setIsListening(false);
      setInputValue("This is a voice input example");
    }, 2000);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes('Female')) || null;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageContent = (content: string) => {
    // Format bullet points and emojis properly
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-accent w-12 h-12 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900">Seggsy AI</h1>
              <p className="text-sm text-slate-600">Your intimate relationship coach</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
              Start a conversation with Seggsy
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              I'm here to help you explore intimacy, improve communication, and strengthen your relationship
            </p>
            
            {/* Suggested prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              message.sender === 'user' 
                ? 'bg-primary text-white rounded-l-2xl rounded-br-2xl' 
                : 'bg-white border border-slate-200 rounded-r-2xl rounded-bl-2xl'
            } p-4 shadow-sm`}>
              <div className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-slate-700'} leading-relaxed`}>
                {formatMessageContent(message.content)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className={`text-xs ${
                  message.sender === 'user' 
                    ? 'text-white/70' 
                    : 'text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {message.sender === 'seggsy' && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => speakMessage(message.content)}
                      className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3 w-3 text-slate-500" />
                      ) : (
                        <Volume2 className="h-3 w-3 text-slate-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-r-2xl rounded-bl-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-slate-500">Seggsy is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to Seggsy..."
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              disabled={isLoading}
            />
            <button
              onClick={startVoiceInput}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                isListening
                  ? 'text-red-500 bg-red-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-xs text-slate-500 text-center mt-2">
          Seggsy can make mistakes. Please use judgment and communicate openly with your partner.
        </div>
      </div>
    </div>
  );
} 