'use client'

import Link from 'next/link'

export default function TermsConsentPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Terms, Consent & Safety
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your safety, privacy, and consent are our highest priorities. Please read these important guidelines.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-red max-w-none">
            
            {/* Age Verification */}
            <section className="mb-12 p-8 bg-red-900/20 border border-red-700/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-red-400 mb-4">🔞 Age Verification & Adult Content</h2>
              <div className="text-gray-200 space-y-4">
                <p className="text-lg font-semibold">
                  This application is strictly for consenting adults aged 18 years and older.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>By accessing seggs.life, you confirm you are 18+ years old</li>
                  <li>This app contains adult themes, intimate content, and AI-generated suggestions for couples</li>
                  <li>If you are under 18, you must not use this application</li>
                  <li>We may request age verification at any time</li>
                </ul>
              </div>
            </section>

            {/* Consent Framework */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">💝 Consent & Mutual Respect</h2>
              <div className="text-gray-200 space-y-4">
                <p className="text-lg">
                  seggs.life is built on the foundation of enthusiastic, ongoing consent between partners.
                </p>
                
                <h3 className="text-xl font-semibold text-red-400">Core Principles:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Enthusiastic Consent:</strong> All activities must be wanted, welcomed, and actively agreed upon</li>
                  <li><strong>Ongoing Communication:</strong> Consent can be withdrawn at any time</li>
                  <li><strong>Mutual Respect:</strong> Both partners' boundaries must be respected without question</li>
                  <li><strong>No Pressure:</strong> No partner should feel pressured to participate in any suggested activity</li>
                  <li><strong>Safe Words:</strong> Establish clear communication about comfort levels and boundaries</li>
                </ul>

                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mt-6">
                  <p className="text-yellow-200 font-semibold">
                    🛑 Remember: Just because the AI suggests something doesn't mean you have to try it. 
                    All suggestions are optional starting points for conversation between consenting partners.
                  </p>
                </div>
              </div>
            </section>

            {/* Safety Guidelines */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🛡️ Safety Guidelines</h2>
              <div className="text-gray-200 space-y-4">
                
                <h3 className="text-xl font-semibold text-red-400">Digital Safety:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use strong, unique passwords for your account</li>
                  <li>Never share your login credentials with anyone</li>
                  <li>Log out from shared devices</li>
                  <li>Report any suspicious activity immediately</li>
                </ul>

                <h3 className="text-xl font-semibold text-red-400 mt-6">Physical & Emotional Safety:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Discuss boundaries openly before trying new activities</li>
                  <li>Establish safe words and respect them absolutely</li>
                  <li>Stop immediately if anyone feels uncomfortable</li>
                  <li>Prioritise emotional and physical wellbeing over any app suggestion</li>
                  <li>Seek professional help if you experience relationship difficulties</li>
                </ul>
              </div>
            </section>

            {/* AI Content Disclaimer */}
            <section className="mb-12 p-8 bg-blue-900/20 border border-blue-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-blue-400 mb-4">🤖 AI-Generated Content</h2>
              <div className="text-gray-200 space-y-4">
                <ul className="list-disc list-inside space-y-2">
                  <li>All suggestions are AI-generated based on Erotic Blueprint assessments</li>
                  <li>Content is designed to be tasteful, consensual, and relationship-focused</li>
                  <li>AI suggestions are starting points for discussion, not instructions</li>
                  <li>We continuously improve our AI to ensure appropriate, helpful content</li>
                  <li>Report any inappropriate suggestions immediately</li>
                </ul>
              </div>
            </section>

            {/* Privacy & Data Protection */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🔒 Privacy & Data Protection</h2>
              <div className="text-gray-200 space-y-4">
                <ul className="list-disc list-inside space-y-2">
                  <li>We use end-to-end encryption for all sensitive data</li>
                  <li>Your blueprint results and AI suggestions are private to you and your partner only</li>
                  <li>We never store intimate conversations or personal content</li>
                  <li>You can delete your account and all data at any time</li>
                  <li>We comply with GDPR, CCPA, and international privacy laws</li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  For full details, see our <Link href="/privacy" className="text-red-400 hover:text-red-300">Privacy Policy</Link>.
                </p>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-12 p-8 bg-red-900/20 border border-red-700/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-red-400 mb-4">⛔ Prohibited Uses</h2>
              <div className="text-gray-200 space-y-4">
                <p>The following activities are strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Using the app for non-consensual activities</li>
                  <li>Harassment, abuse, or coercion of any kind</li>
                  <li>Sharing account access with anyone other than your committed partner</li>
                  <li>Creating multiple accounts or fake profiles</li>
                  <li>Using the app for commercial purposes</li>
                  <li>Attempting to reverse-engineer or exploit the AI system</li>
                  <li>Sharing explicit content generated by the app outside the platform</li>
                </ul>
              </div>
            </section>

            {/* Reporting & Support */}
            <section className="mb-12 p-8 bg-green-900/20 border border-green-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-green-400 mb-4">📞 Support & Reporting</h2>
              <div className="text-gray-200 space-y-4">
                <p>If you experience any issues, inappropriate content, or safety concerns:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">Immediate Safety</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>If in immediate danger, contact local emergency services</li>
                      <li>National Domestic Violence Hotline: 1-800-799-7233</li>
                      <li>Crisis Text Line: Text HOME to 741741</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">App Support</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Email: support@seggs.life</li>
                      <li>In-app reporting (coming soon)</li>
                      <li>Response within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Terms */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">⚖️ Legal Terms</h2>
              <div className="text-gray-200 space-y-4 text-sm">
                <p>
                  By using seggs.life, you agree to these terms and our Privacy Policy. 
                  These terms constitute a legally binding agreement between you and seggs.life.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Limitation of Liability:</h3>
                <p>
                  seggs.life provides tools for communication and relationship enhancement. 
                  We are not responsible for how users choose to interpret or act upon AI suggestions. 
                  Users are solely responsible for their actions and communications.
                </p>

                <h3 className="text-lg font-semibold mt-6">Jurisdiction:</h3>
                <p>
                  These terms are governed by the laws of [Your Jurisdiction]. 
                  Any disputes will be resolved through binding arbitration.
                </p>

                <h3 className="text-lg font-semibold mt-6">Changes to Terms:</h3>
                <p>
                  We may update these terms periodically. Users will be notified of significant changes 
                  and must re-accept updated terms to continue using the service.
                </p>

                <p className="text-gray-400 text-xs mt-6">
                  Last Updated: {new Date().toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </section>

          </div>

          {/* Navigation */}
          <div className="text-center mt-12 pt-8 border-t border-gray-700">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300"
            >
              <span>←</span>
              <span>Return to seggs.life</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 