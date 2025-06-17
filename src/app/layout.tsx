import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'seggs.life - Intimate Connection for Couples',
  description: 'Privacy-first, AI-powered intimacy app that helps couples stay connected through all life stages.',
  keywords: ['couples', 'intimacy', 'connection', 'privacy', 'relationships'],
  authors: [{ name: 'seggs.life' }],
  creator: 'seggs.life',
  publisher: 'seggs.life',
  robots: {
    index: false, // Privacy-first - don't index by default
    follow: false,
  },
  icons: {
    icon: '/SEGGSYFAVICON.png',
    apple: '/SEGGSYFAVICON.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'seggs.life',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4b4f56',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className="dark">
      <body className="min-h-screen bg-[#4b4f56] text-[#d6c0a5] font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 