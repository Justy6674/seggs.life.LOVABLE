import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        
        {/* Logo Section */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <Image 
              src="/SeggsLogoNoBackground.png"
              alt="seggs.life logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-white font-serif text-3xl mb-2 tracking-wide">seggs.life</h1>
          <p className="text-gray-300 font-sans text-sm leading-relaxed max-w-xs">
            Tasteful intimacy & connection for couples. Private, respectful, inclusive.
          </p>
        </div>

        {/* Value Propositions */}
        <div className="space-y-4 mb-12 w-full max-w-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center">
                <span className="text-white text-xs">🔒</span>
              </div>
              <div>
                <h3 className="text-white font-sans text-sm font-medium">Privacy First</h3>
                <p className="text-gray-400 text-xs">End-to-end encryption, panic lock, no logs</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center">
                <span className="text-white text-xs">🤝</span>
              </div>
              <div>
                <h3 className="text-white font-sans text-sm font-medium">All Orientations</h3>
                <p className="text-gray-400 text-xs">Sexual, asexual, exploring—everyone welcome</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center">
                <span className="text-white text-xs">🧠</span>
              </div>
              <div>
                <h3 className="text-white font-sans text-sm font-medium">AI-Powered</h3>
                <p className="text-gray-400 text-xs">Smart prompts, health guidance, gentle nudges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 w-full max-w-sm">
          <Link href="/signup">
            <button className="w-full bg-slate-600 hover:bg-slate-500 text-white font-sans py-3 px-6 rounded-lg transition-colors">
              Create Account
            </button>
          </Link>
          
          <Link href="/login">
            <button className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-sans py-3 px-6 rounded-lg transition-colors">
              Sign In
            </button>
          </Link>
        </div>

        {/* Discrete Footer */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs font-sans">
            Medical-grade privacy • Evidence-based • Consent-focused
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-400 text-xs">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-400 text-xs">Terms</Link>
            <Link href="/support" className="text-gray-500 hover:text-gray-400 text-xs">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 