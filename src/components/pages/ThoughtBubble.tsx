'use client'

import React, { useState } from 'react';

const ThoughtBubble: React.FC = () => {
  const [thoughtContent, setThoughtContent] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sendOption, setSendOption] = useState<'now' | 'schedule' | 'surprise'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPanicMode, setShowPanicMode] = useState(false);

  const handleSendThought = () => {
    if (!thoughtContent.trim()) return;
    
    const thoughtData = {
      content: thoughtContent,
      type: isVoiceMode ? 'voice' : 'text',
      sendOption,
      scheduledTime: sendOption === 'schedule' ? scheduledTime : null,
      isPrivate,
    };
    
    console.log('Sending thought:', thoughtData);
    // In real app: save to Firebase with encryption
    
    // Reset form
    setThoughtContent('');
    setScheduledTime('');
    setSendOption('now');
  };

  const togglePanicMode = () => {
    setShowPanicMode(!showPanicMode);
    if (!showPanicMode) {
      // Hide app content and show disguise
      setThoughtContent('');
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // In real app: start recording with Web Audio API
    setTimeout(() => {
      setIsRecording(false);
      setThoughtContent('Voice recording: "I love how you..."');
    }, 3000);
  };

  if (showPanicMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-2xl">📝</span>
          </div>
          <h1 className="text-gray-800 font-sans text-xl mb-2">Personal Journal</h1>
          <p className="text-gray-600 text-sm mb-6">Private thoughts and daily notes</p>
          
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-gray-500 text-sm">Nothing to see here...</p>
          </div>
          
          <button
            onClick={togglePanicMode}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans py-2 px-4 rounded-lg transition-colors"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-serif text-xl mb-1">Secret thought</h1>
            <p className="text-gray-400 font-sans text-sm">Share something special with your partner</p>
          </div>
          <button
            onClick={togglePanicMode}
            className="w-8 h-8 rounded-full bg-red-deep flex items-center justify-center"
            title="Panic mode - disguise app"
          >
            <span className="text-white text-xs">👁️</span>
          </button>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsVoiceMode(false)}
            className={`flex-1 py-2 px-4 rounded-md font-sans text-sm transition-colors ${
              !isVoiceMode 
                ? 'bg-slate-600 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ✍️ Write
          </button>
          <button
            onClick={() => setIsVoiceMode(true)}
            className={`flex-1 py-2 px-4 rounded-md font-sans text-sm transition-colors ${
              isVoiceMode 
                ? 'bg-slate-600 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🎤 Voice
          </button>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          {isVoiceMode ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-deep flex items-center justify-center animate-pulse">
                      <span className="text-white text-xl">🎤</span>
                    </div>
                    <p className="text-white font-sans text-sm">Recording...</p>
                    <div className="flex justify-center space-x-1">
                      <div className="w-1 h-4 bg-red-deep rounded animate-pulse"></div>
                      <div className="w-1 h-6 bg-red-deep rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-3 bg-red-deep rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-5 bg-red-deep rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    </div>
                    <button
                      onClick={() => setIsRecording(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-sans py-2 px-4 rounded-lg transition-colors"
                    >
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-white text-xl">🎤</span>
                    </div>
                    <p className="text-gray-300 font-sans text-sm">
                      Record a voice message for your partner
                    </p>
                    <button
                      onClick={startVoiceRecording}
                      className="bg-slate-600 hover:bg-slate-500 text-white font-sans py-3 px-6 rounded-lg transition-colors"
                    >
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={thoughtContent}
                onChange={(e) => setThoughtContent(e.target.value)}
                placeholder="What are you thinking about your partner? This will be encrypted and only they can see it..."
                className="w-full h-32 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 font-sans text-sm resize-none focus:border-slate-500 focus:outline-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400 text-xs font-sans">
                  {thoughtContent.length}/500 characters
                </span>
                <span className="text-gray-400 text-xs font-sans">🔒 Encrypted</span>
              </div>
            </div>
          )}
        </div>

        {/* Send Options */}
        <div className="space-y-4">
          <h3 className="text-white font-sans text-sm font-medium">When to send</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setSendOption('now')}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                sendOption === 'now'
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">⚡</span>
                <div>
                  <div className="font-sans text-sm font-medium">Send now</div>
                  <div className="font-sans text-xs text-gray-400">Your partner will see it immediately</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSendOption('schedule')}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                sendOption === 'schedule'
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">⏰</span>
                <div>
                  <div className="font-sans text-sm font-medium">Schedule for later</div>
                  <div className="font-sans text-xs text-gray-400">Pick a specific time to reveal</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSendOption('surprise')}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                sendOption === 'surprise'
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎁</span>
                <div>
                  <div className="font-sans text-sm font-medium">Surprise timing</div>
                  <div className="font-sans text-xs text-gray-400">AI will pick the perfect moment</div>
                </div>
              </div>
            </button>
          </div>

          {/* Schedule Time Input */}
          {sendOption === 'schedule' && (
            <div className="mt-4">
              <label className="block text-white font-sans text-sm font-medium mb-2">
                When to reveal
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-sans text-sm"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Privacy Options */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-sans text-sm font-medium">Keep this private</h4>
              <p className="text-gray-400 text-xs mt-1">Only you can see this thought</p>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isPrivate ? 'bg-slate-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                isPrivate ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white font-sans py-3 px-6 rounded-lg transition-colors">
            Save Draft
          </button>
          
          <button
            onClick={handleSendThought}
            disabled={!thoughtContent.trim()}
            className={`flex-1 font-sans py-3 px-6 rounded-lg transition-colors ${
              thoughtContent.trim()
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sendOption === 'now' ? 'Send Now' : 
             sendOption === 'schedule' ? 'Schedule' : 
             'Create Surprise'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-gray-500 text-xs font-sans">
            All thoughts are end-to-end encrypted. Use panic mode (👁️) for instant disguise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThoughtBubble; 