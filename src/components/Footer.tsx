'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary/90 border-t border-accent/30 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          {/* Legal Disclaimer */}
          <p className="text-accent/70 text-sm">
            For consenting adults (18+) only. Always practice safe, respectful communication.
          </p>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            <Link 
              href="/terms-consent" 
              className="text-accent/80 hover:text-emphasis transition-colors"
            >
              Terms, Consent & Safety
            </Link>
            <Link 
              href="/privacy" 
              className="text-accent/80 hover:text-emphasis transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/support" 
              className="text-accent/80 hover:text-emphasis transition-colors"
            >
              Support & Safety
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-accent/60 text-xs pt-4 border-t border-accent/30">
            <p>© {new Date().getFullYear()} seggs.life. All rights reserved.</p>
            <p className="mt-1">
              🔒 Your privacy and safety are our highest priorities. 
              This app uses end-to-end encryption and stores no intimate content on our servers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 