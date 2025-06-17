'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import Auth from '../../components/Auth'
import AppLayout from '../../components/navigation/AppLayout'

export default function TestSeggsyPage() {
  const [user] = useAuthState(auth)

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="text-2xl font-bold text-wheat mb-6">
            Members Only: Seggsy AI Chat
          </h1>
          <p className="text-wheat/70 mb-6">
            Our AI companion is available for members only. Please sign in to chat with Seggsy.
          </p>
          <Auth />
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">
              🤖 Test Seggsy Chatbot
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Test the new Seggsy AI chatbot! Look for the floating red bubble in the bottom-right corner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Features */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">✨ Seggsy Features</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="font-semibold text-white">Chat Interface</h3>
                    <p className="text-gray-400 text-sm">Click the floating bubble to open chat</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <h3 className="font-semibold text-white">Voice Activation</h3>
                    <p className="text-gray-400 text-sm">Say "Hey Seggsy" to activate voice mode</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h3 className="font-semibold text-white">Blueprint Aware</h3>
                    <p className="text-gray-400 text-sm">Responses tailored to your Erotic Blueprint</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-white">Smart Suggestions</h3>
                    <p className="text-gray-400 text-sm">Intimate coaching based on your relationship</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Instructions */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">🧪 Testing Instructions</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">1. Find the Floating Bubble</h3>
                  <p className="text-gray-300 text-sm">Look for the red floating bubble in the bottom-right corner of your screen.</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">2. Test Voice Activation</h3>
                  <p className="text-gray-300 text-sm">Try saying "Hey Seggsy" or "Hi Seggsy" - you should see a green indicator when listening.</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">3. Chat with Seggsy</h3>
                  <p className="text-gray-300 text-sm">Ask questions like:</p>
                  <ul className="text-gray-400 text-xs mt-2 space-y-1">
                    <li>• "Help me reconnect with my partner"</li>
                    <li>• "Suggest something playful for tonight"</li>
                    <li>• "How can we spice things up?"</li>
                    <li>• "What should we try based on our blueprints?"</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">4. Test Personalization</h3>
                  <p className="text-gray-300 text-sm">Complete your Erotic Blueprint first for better personalized responses.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Conversations */}
          <div className="mt-8 bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">💭 Sample Conversations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-red-400">Relationship Help</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white text-sm mb-2"><strong>You:</strong> "We've been feeling disconnected lately"</p>
                  <p className="text-gray-300 text-sm"><strong>Seggsy:</strong> "I hear you! Life can definitely create distance. Based on your Blueprint, here are some ideas to reconnect..."</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-red-400">Playful Ideas</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white text-sm mb-2"><strong>You:</strong> "Suggest something fun for tonight"</p>
                  <p className="text-gray-300 text-sm"><strong>Seggsy:</strong> "Ooh, I have the perfect idea! How about starting with some playful teasing messages..."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <a href="/" className="btn-secondary">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 