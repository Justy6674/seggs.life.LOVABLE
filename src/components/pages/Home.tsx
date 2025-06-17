import React, { useState } from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [partnerStatus, setPartnerStatus] = useState<'online' | 'away' | 'offline'>('away');

  // Mock data - in real app this would come from Firebase
  const todayPrompt = {
    id: '1',
    category: 'connection',
    content: 'Share three things you appreciated about each other today',
    intensityLevel: 'sweet' as const,
    estimatedTime: '5 min'
  };

  const recentThoughts = [
    { id: '1', preview: 'I loved watching you laugh at...', isRevealed: false, scheduledFor: '8:00 PM' },
    { id: '2', preview: 'Your smile this morning made...', isRevealed: true, revealedAt: '2 hours ago' }
  ];

  const moodOptions = [
    { emoji: '😊', label: 'Content', id: 'content' },
    { emoji: '❤️', label: 'Loving', id: 'loving' },
    { emoji: '🔥', label: 'Passionate', id: 'passionate' },
    { emoji: '😴', label: 'Tired', id: 'tired' },
    { emoji: '🤗', label: 'Cuddly', id: 'cuddly' },
    { emoji: '💭', label: 'Thoughtful', id: 'thoughtful' }
  ];

  const handleMoodChange = (moodId: string) => {
    setCurrentMood(moodId);
    // In real app: update Firebase and potentially trigger partner notification
  };

  const sendPartnerNudge = (type: 'thinking' | 'mood' | 'check-in') => {
    // In real app: send discreet push notification to partner
    console.log(`Sending ${type} nudge to partner`);
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-serif text-xl mb-1">Good evening</h1>
            <p className="text-gray-400 font-sans text-sm">How are you feeling today?</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              partnerStatus === 'online' ? 'bg-green-500' : 
              partnerStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-gray-400 text-xs font-sans">Partner {partnerStatus}</span>
          </div>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <h2 className="text-white font-sans text-sm font-medium mb-3">Your mood right now</h2>
        <div className="grid grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodChange(mood.id)}
              className={`p-3 rounded-lg border transition-colors ${
                currentMood === mood.id
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{mood.emoji}</div>
                <div className="text-xs font-sans">{mood.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's AI Prompt */}
      <div className="mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-white font-sans text-sm font-medium mb-1">Today's Connection</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-sans">{todayPrompt.category}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400 font-sans">{todayPrompt.estimatedTime}</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded bg-slate-600 flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
          </div>
          
          <p className="text-gray-200 font-sans text-sm mb-4 leading-relaxed">
            {todayPrompt.content}
          </p>
          
          <div className="flex space-x-2">
            <Link href={`/prompts/${todayPrompt.id}`}>
              <button className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-sans py-2 px-4 rounded-lg text-sm transition-colors">
                Start Together
              </button>
            </Link>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-sans py-2 px-4 rounded-lg text-sm transition-colors">
              Get New Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-white font-sans text-sm font-medium mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/thoughts/new">
            <button className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 p-4 rounded-lg transition-colors group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded bg-slate-600 flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                  <span className="text-white text-sm">💭</span>
                </div>
                <div className="text-white font-sans text-sm font-medium">Send Thought</div>
                <div className="text-gray-400 text-xs font-sans mt-1">Secret or scheduled</div>
              </div>
            </button>
          </Link>

          <button
            onClick={() => sendPartnerNudge('thinking')}
            className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 p-4 rounded-lg transition-colors group"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded bg-slate-600 flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                <span className="text-white text-sm">👋</span>
              </div>
              <div className="text-white font-sans text-sm font-medium">Nudge Partner</div>
              <div className="text-gray-400 text-xs font-sans mt-1">Thinking of you</div>
            </div>
          </button>

          <Link href="/prompts">
            <button className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 p-4 rounded-lg transition-colors group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded bg-slate-600 flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <div className="text-white font-sans text-sm font-medium">More Prompts</div>
                <div className="text-gray-400 text-xs font-sans mt-1">On-demand ideas</div>
              </div>
            </button>
          </Link>

          <button
            onClick={() => sendPartnerNudge('check-in')}
            className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 p-4 rounded-lg transition-colors group"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded bg-slate-600 flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                <span className="text-white text-sm">💙</span>
              </div>
              <div className="text-white font-sans text-sm font-medium">Check In</div>
              <div className="text-gray-400 text-xs font-sans mt-1">How are you?</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Thought Bubbles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-sans text-sm font-medium">Recent thoughts</h2>
          <Link href="/thoughts" className="text-slate-400 hover:text-slate-300 text-xs font-sans">
            View all
          </Link>
        </div>
        
        <div className="space-y-2">
          {recentThoughts.map((thought) => (
            <div key={thought.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-200 font-sans text-sm mb-1">
                    {thought.preview}
                  </p>
                  <div className="flex items-center space-x-2">
                    {thought.isRevealed ? (
                      <span className="text-green-400 text-xs font-sans">
                        Revealed {thought.revealedAt}
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-xs font-sans">
                        Scheduled for {thought.scheduledFor}
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-300 text-xs font-sans">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Reminder (if enabled) */}
      <div className="mb-6">
        <div className="bg-gray-800 border border-red-deep border-opacity-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded bg-red-deep flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-sans text-sm font-medium mb-1">Health Check-in</h3>
              <p className="text-gray-300 text-xs mb-2">
                It's been a while since your last wellness check
              </p>
              <button className="text-red-deep hover:text-red-500 text-xs font-sans">
                Schedule appointment
              </button>
            </div>
            <button className="text-gray-400 hover:text-gray-300 text-xs">×</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 