'use client'

import Link from 'next/link'

export default function SupportSafetyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Support & Safety
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your safety and wellbeing are our top priority. Here's how to get help, stay safe, and report concerns.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-red max-w-none">
            
            {/* Emergency Resources */}
            <section className="mb-12 p-8 bg-red-900/20 border border-red-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-red-400 mb-4">🚨 Emergency Resources</h2>
              <div className="text-gray-200 space-y-6">
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200 font-semibold mb-3">
                    🆘 If you are in immediate danger, contact local emergency services immediately.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-red-300 mb-3">Crisis Hotlines (24/7):</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>National Domestic Violence:</strong> 1-800-799-7233</li>
                      <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                      <li><strong>National Sexual Assault:</strong> 1-800-656-4673</li>
                      <li><strong>National Suicide Prevention:</strong> 988</li>
                      <li><strong>LGBTQ+ National Hotline:</strong> 1-888-843-4564</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-red-300 mb-3">International Resources:</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>UK - Samaritans:</strong> 116 123</li>
                      <li><strong>Australia - Lifeline:</strong> 13 11 14</li>
                      <li><strong>Canada - Crisis Services:</strong> 1-833-456-4566</li>
                      <li><strong>EU Emergency:</strong> 112</li>
                      <li><strong>Global Directory:</strong> findahelpline.com</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* App Support */}
            <section className="mb-12 p-8 bg-blue-900/20 border border-blue-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-blue-400 mb-4">💬 seggs.life Support</h2>
              <div className="text-gray-200 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Get Help With:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Technical issues or bugs</li>
                      <li>Account access problems</li>
                      <li>Blueprint quiz questions</li>
                      <li>Partner connection issues</li>
                      <li>Privacy and security concerns</li>
                      <li>Inappropriate AI suggestions</li>
                      <li>Account deletion requests</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Contact Methods:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Email:</strong> support@seggs.life</li>
                      <li><strong>Priority Support:</strong> urgent@seggs.life</li>
                      <li><strong>Security Issues:</strong> security@seggs.life</li>
                      <li><strong>Response Time:</strong> Within 24 hours</li>
                      <li><strong>Available:</strong> 7 days a week</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    <strong>📧 Email Template:</strong> Include your account email, device type, and description of the issue for fastest support.
                  </p>
                </div>
              </div>
            </section>

            {/* Safety Guidelines */}
            <section className="mb-12 p-8 bg-green-900/20 border border-green-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-green-400 mb-4">🛡️ Digital Safety Guidelines</h2>
              <div className="text-gray-200 space-y-6">
                
                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-3">Account Security:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Strong Passwords:</strong> Use unique, complex passwords</li>
                    <li><strong>Two-Factor Authentication:</strong> Enable when available</li>
                    <li><strong>Secure Devices:</strong> Don't save passwords on shared devices</li>
                    <li><strong>Regular Logout:</strong> Sign out after each session</li>
                    <li><strong>Suspicious Activity:</strong> Report unusual account behavior immediately</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-3">Privacy Protection:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Partner Verification:</strong> Ensure you're connecting with the right person</li>
                    <li><strong>Screen Privacy:</strong> Be aware of who can see your screen</li>
                    <li><strong>Shared Devices:</strong> Use private/incognito browsing</li>
                    <li><strong>Data Downloads:</strong> Only save data to secure, private locations</li>
                    <li><strong>Third-Party Apps:</strong> Never share seggs.life data with other apps</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Relationship Safety */}
            <section className="mb-12 p-8 bg-yellow-900/20 border border-yellow-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">💕 Relationship Safety</h2>
              <div className="text-gray-200 space-y-6">
                
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-3">Healthy Communication:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Open Dialogue:</strong> Discuss boundaries and comfort levels regularly</li>
                    <li><strong>Enthusiastic Consent:</strong> Ensure all activities are enthusiastically agreed upon</li>
                    <li><strong>Safe Words:</strong> Establish clear "stop" signals that are always respected</li>
                    <li><strong>Check-ins:</strong> Regularly ask how your partner is feeling</li>
                    <li><strong>No Pressure:</strong> Never pressure your partner to try suggested activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-3">Warning Signs to Watch For:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Coercion:</strong> Pressuring you to try activities you're uncomfortable with</li>
                    <li><strong>Disrespecting Boundaries:</strong> Ignoring your "no" or safe words</li>
                    <li><strong>Privacy Violations:</strong> Sharing your intimate data without permission</li>
                    <li><strong>Emotional Manipulation:</strong> Using guilt or shame to influence behavior</li>
                    <li><strong>Isolation:</strong> Trying to control your access to friends or support</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <p className="text-yellow-200 font-semibold">
                    🚨 If you recognize these signs, reach out to the crisis resources above or trusted friends/family. 
                    Healthy relationships are built on mutual respect and communication.
                  </p>
                </div>
              </div>
            </section>

            {/* Reporting System */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">📢 Report Concerns</h2>
              <div className="text-gray-200 space-y-6">
                
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">What to Report:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Inappropriate AI Content:</strong> Suggestions that seem harmful or non-consensual</li>
                    <li><strong>Technical Abuse:</strong> Attempts to hack or exploit the system</li>
                    <li><strong>Privacy Violations:</strong> Unauthorized sharing of user data</li>
                    <li><strong>Harassment:</strong> Abusive behavior from other users (if applicable)</li>
                    <li><strong>Safety Concerns:</strong> Any feature that could put users at risk</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">How to Report:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-300 mb-2">Email Reporting:</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>General:</strong> report@seggs.life</li>
                        <li><strong>Security:</strong> security@seggs.life</li>
                        <li><strong>Urgent:</strong> urgent@seggs.life</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-300 mb-2">Include:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Detailed description</li>
                        <li>• Screenshots if relevant</li>
                        <li>• Date and time</li>
                        <li>• Your account email</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Response Process:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>We investigate all reports within 24 hours</li>
                    <li>You'll receive confirmation that we received your report</li>
                    <li>We may contact you for additional information</li>
                    <li>We'll take appropriate action (content removal, account restrictions, etc.)</li>
                    <li>You'll be notified of the resolution (when appropriate)</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Mental Health Resources */}
            <section className="mb-12 p-8 bg-purple-900/20 border border-purple-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-purple-400 mb-4">🧠 Mental Health & Wellbeing</h2>
              <div className="text-gray-200 space-y-6">
                
                <p className="text-lg">
                  Exploring intimacy and relationships can bring up complex emotions. 
                  It's completely normal to need professional support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">When to Seek Support:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Feeling overwhelmed by relationship challenges</li>
                      <li>Struggling with intimacy or communication</li>
                      <li>Experiencing anxiety or depression</li>
                      <li>Processing past trauma</li>
                      <li>Needing guidance on relationship dynamics</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Resources:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Psychology Today:</strong> therapist directory</li>
                      <li><strong>BetterHelp:</strong> online therapy platform</li>
                      <li><strong>AASECT:</strong> certified sex therapists</li>
                      <li><strong>Open Path:</strong> affordable therapy options</li>
                      <li><strong>Local Community Centers:</strong> group support</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-4">
                  <p className="text-purple-200 text-sm">
                    <strong>💜 Remember:</strong> Seeking professional help is a sign of strength, not weakness. 
                    Many couples benefit from therapy or counseling to enhance their relationships.
                  </p>
                </div>
              </div>
            </section>

            {/* Community Guidelines */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">👥 Community Standards</h2>
              <div className="text-gray-200 space-y-4">
                <p>seggs.life is built on mutual respect, consent, and safety. We expect all users to:</p>
                
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Respect Boundaries:</strong> Honor your partner's limits and comfort levels</li>
                  <li><strong>Communicate Openly:</strong> Practice honest, non-judgmental communication</li>
                  <li><strong>Protect Privacy:</strong> Keep your partner's intimate information confidential</li>
                  <li><strong>Report Concerns:</strong> Help keep our community safe by reporting issues</li>
                  <li><strong>Seek Consent:</strong> Ensure all activities are mutually agreed upon</li>
                  <li><strong>Support Others:</strong> Create a positive, supportive environment</li>
                </ul>

                <div className="bg-gray-700/50 rounded-lg p-4 mt-6">
                  <p className="text-gray-300 text-sm">
                    <strong>Community Commitment:</strong> By using seggs.life, you agree to uphold these standards 
                    and contribute to a safe, respectful environment for all couples.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Navigation */}
          <div className="text-center mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/terms-consent" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                <span>📋</span>
                <span>Terms & Consent</span>
              </Link>
              <Link 
                href="/privacy" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                <span>🔒</span>
                <span>Privacy Policy</span>
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                <span>←</span>
                <span>Return to seggs.life</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 