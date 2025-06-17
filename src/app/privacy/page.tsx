'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your privacy and data security are our highest priorities. Here's exactly how we protect your information.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-red max-w-none">
            
            {/* Introduction */}
            <section className="mb-12 p-8 bg-blue-900/20 border border-blue-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-blue-400 mb-4">🔒 Our Privacy Promise</h2>
              <div className="text-gray-200 space-y-4">
                <p className="text-lg">
                  At seggs.life, we believe intimate data should remain completely private. 
                  This policy explains what data we collect, how we protect it, and your rights to control it.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>End-to-end encryption</strong> for all sensitive data</li>
                  <li><strong>Zero intimate content storage</strong> on our servers</li>
                  <li><strong>Complete data deletion</strong> when you close your account</li>
                  <li><strong>No third-party sharing</strong> without explicit consent</li>
                </ul>
              </div>
            </section>

            {/* Data Collection */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">📊 What Data We Collect</h2>
              <div className="text-gray-200 space-y-6">
                
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Account Information:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Email address (for account access and security)</li>
                    <li>Display name (how you want to be addressed)</li>
                    <li>Account creation date</li>
                    <li>Authentication credentials (encrypted)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Erotic Blueprint Data:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quiz responses and calculated blueprint types</li>
                    <li>Blueprint scores and analysis</li>
                    <li>Compatibility analysis with partner</li>
                    <li>Reassessment history</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Usage Analytics (Anonymous):</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Feature usage patterns (which categories you access)</li>
                    <li>Session duration and frequency</li>
                    <li>Error logs for technical improvement</li>
                    <li>Device type and browser (for compatibility)</li>
                  </ul>
                </div>

                <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">What We DON'T Collect:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>❌ Your conversations or intimate messages</li>
                    <li>❌ Photos or videos you may share privately</li>
                    <li>❌ Location data or device tracking</li>
                    <li>❌ Social media profiles or contacts</li>
                    <li>❌ Financial information (unless you purchase premium features)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🛡️ How We Protect Your Data</h2>
              <div className="text-gray-200 space-y-4">
                
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Technical Security:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>End-to-End Encryption:</strong> All intimate data encrypted before leaving your device</li>
                    <li><strong>Zero-Knowledge Architecture:</strong> We cannot see your encrypted intimate content</li>
                    <li><strong>Secure Cloud Storage:</strong> Firebase with enterprise-grade security</li>
                    <li><strong>HTTPS Everywhere:</strong> All communications encrypted in transit</li>
                    <li><strong>Regular Security Audits:</strong> Third-party security assessments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Access Controls:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Partner-Only Access:</strong> Only connected partners can view shared data</li>
                    <li><strong>Account Isolation:</strong> Your data is completely separate from other users</li>
                    <li><strong>Automatic Logout:</strong> Sessions expire for security</li>
                    <li><strong>Device Verification:</strong> Login alerts for new devices</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🎯 How We Use Your Data</h2>
              <div className="text-gray-200 space-y-4">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>AI Personalization:</strong> Generate suggestions based on your blueprint combination</li>
                  <li><strong>Service Improvement:</strong> Analyze usage patterns to enhance features (anonymized)</li>
                  <li><strong>Technical Support:</strong> Diagnose and fix technical issues</li>
                  <li><strong>Security Monitoring:</strong> Detect and prevent unauthorized access</li>
                  <li><strong>Legal Compliance:</strong> Meet regulatory requirements where necessary</li>
                </ul>

                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 mt-6">
                  <p className="text-red-200 font-semibold">
                    🚫 We NEVER use your data for advertising, marketing to third parties, or any purpose not directly related to improving your seggs.life experience.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-12 p-8 bg-green-900/20 border border-green-600/50 rounded-2xl">
              <h2 className="text-3xl font-bold text-green-400 mb-4">👤 Your Privacy Rights</h2>
              <div className="text-gray-200 space-y-4">
                <p>Under GDPR, CCPA, and other privacy laws, you have these rights:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Access & Portability:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Request a copy of all your data</li>
                      <li>Export your blueprint results</li>
                      <li>Download your account information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Control & Deletion:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Delete your account and all data</li>
                      <li>Correct inaccurate information</li>
                      <li>Restrict certain data processing</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  To exercise these rights, email us at privacy@seggs.life with your request.
                  We'll respond within 30 days and verify your identity for security.
                </p>
              </div>
            </section>

            {/* International Compliance */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🌍 International Compliance</h2>
              <div className="text-gray-200 space-y-4">
                
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">GDPR (European Union):</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Lawful basis: Consent and legitimate interest</li>
                    <li>Data minimization: We only collect necessary data</li>
                    <li>Right to be forgotten: Complete data deletion available</li>
                    <li>Data Protection Officer available for inquiries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">CCPA (California):</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Right to know what data we collect</li>
                    <li>Right to delete personal information</li>
                    <li>Right to opt-out of data sales (we don't sell data)</li>
                    <li>Non-discrimination for exercising rights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Global Standards:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Data localization compliance where required</li>
                    <li>Age verification for all users (18+)</li>
                    <li>Cross-border transfer protections</li>
                    <li>Regular policy updates for changing regulations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact & Updates */}
            <section className="mb-12 p-8 bg-gray-800/60 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">📞 Contact & Updates</h2>
              <div className="text-gray-200 space-y-4">
                
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Contact Us:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Privacy Questions:</strong> privacy@seggs.life</li>
                    <li><strong>Data Rights Requests:</strong> privacy@seggs.life</li>
                    <li><strong>Security Concerns:</strong> security@seggs.life</li>
                    <li><strong>General Support:</strong> support@seggs.life</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Policy Updates:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>We'll notify you of significant changes via email</li>
                    <li>Continued use after changes means acceptance</li>
                    <li>Major changes require explicit re-consent</li>
                    <li>Version history available upon request</li>
                  </ul>
                </div>

                <p className="text-gray-400 text-sm mt-6">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <br />
                  <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-GB', { 
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
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/terms-consent" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                <span>📋</span>
                <span>Terms & Consent</span>
              </Link>
              <Link 
                href="/support" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                <span>🆘</span>
                <span>Support & Safety</span>
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