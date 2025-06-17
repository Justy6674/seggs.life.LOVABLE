'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ContextHeaderProps {
  title?: string
  subtitle?: string
  icon?: string
  showBack?: boolean
  backUrl?: string
  rightAction?: React.ReactNode
}

// Page configuration for automatic breadcrumb generation
const PAGE_CONFIG: Record<string, {
  title: string
  subtitle?: string
  icon: string
  section: string
  parent?: string
}> = {
  '/app': {
    title: 'Dashboard',
    subtitle: 'Your intimate connection hub',
    icon: '🏠',
    section: 'Home'
  },
  '/connect': {
    title: 'Connect',
    subtitle: 'Strengthen your intimate bond together',
    icon: '💕',
    section: 'Connect'
  },
  '/journey': {
    title: 'Your Journey',
    subtitle: 'Track growth and celebrate milestones',
    icon: '🗺️',
    section: 'Connect',
    parent: '/connect'
  },
  '/boudoir': {
    title: 'Boudoir',
    subtitle: 'Playful and intimate suggestions',
    icon: '💑',
    section: 'Connect',
    parent: '/connect'
  },
  '/explore': {
    title: 'Explore Together',
    subtitle: 'Discover new experiences',
    icon: '🌟',
    section: 'Connect',
    parent: '/connect'
  },
  '/prompts': {
    title: 'Conversation Prompts',
    subtitle: 'Deepen your connection',
    icon: '💡',
    section: 'Connect',
    parent: '/connect'
  },
  '/intimacy-hub': {
    title: 'Intimacy Hub',
    subtitle: 'Your intimate connection center',
    icon: '💕',
    section: 'Connect',
    parent: '/connect'
  },
  '/ai-suggestions': {
    title: 'AI Suggestions',
    subtitle: 'Personalized recommendations',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Connect',
    parent: '/connect'
  },
  '/thoughts': {
    title: 'Secret Thoughts',
    subtitle: 'Share something special with your partner',
    icon: '💭',
    section: 'Connect',
    parent: '/connect'
  },
  '/couples-demo': {
    title: 'Couples Demo',
    subtitle: 'Experience our couples features',
    icon: '💑',
    section: 'Connect',
    parent: '/connect'
  },
  '/intimacy-demo': {
    title: 'Intimacy Demo',
    subtitle: 'Explore intimate features',
    icon: '✨',
    section: 'Connect',
    parent: '/connect'
  },
  '/coach': {
    title: 'AI Coach',
    subtitle: 'Your personal relationship coach',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach'
  },
  '/coaching': {
    title: 'AI Coaching',
    subtitle: 'Your personal relationship coach',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach',
    parent: '/coach'
  },
  '/predictive-insights': {
    title: 'Insights',
    subtitle: 'AI-powered relationship insights',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach',
    parent: '/coach'
  },
  '/test-seggsy': {
    title: 'Test Seggsy AI',
    subtitle: 'Try our AI chatbot',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach',
    parent: '/coach'
  },
  '/test-conversation-memory': {
    title: 'Conversation Memory',
    subtitle: 'Test AI memory features',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach',
    parent: '/coach'
  },
  '/test-feedback': {
    title: 'Feedback Test',
    subtitle: 'Test feedback systems',
    icon: '/SEGGSYCHATBOT.png',
    section: 'Coach',
    parent: '/coach'
  },
  '/you': {
    title: 'Your Profile',
    subtitle: 'Settings and personalization',
    icon: '⚙️',
    section: 'You'
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Customize your experience',
    icon: '⚙️',
    section: 'You',
    parent: '/you'
  },
  '/blueprint': {
    title: 'Your Blueprint',
    subtitle: 'Discover your erotic blueprint',
    icon: '🧭',
    section: 'You',
    parent: '/you'
  },
  '/partner-connect': {
    title: 'Partner Connection',
    subtitle: 'Connect with your partner',
    icon: '👥',
    section: 'You',
    parent: '/you'
  },
  '/personalization': {
    title: 'Personalization',
    subtitle: 'Tailor your experience',
    icon: '🎨',
    section: 'You',
    parent: '/you'
  },
  '/admin-tools': {
    title: 'Admin Tools',
    subtitle: 'Administrative functions',
    icon: '🔧',
    section: 'You',
    parent: '/you'
  },
  '/analytics': {
    title: 'Analytics',
    subtitle: 'Usage insights and metrics',
    icon: '📊',
    section: 'You',
    parent: '/you'
  },
  '/our-connection': {
    title: 'Our Connection',
    subtitle: 'Combined blueprint analysis',
    icon: '💕',
    section: 'Connect'
  },
  '/understanding-partner': {
    title: 'Understanding Partner',
    subtitle: 'Solo toolkit for connection',
    icon: '🧠',
    section: 'Connect',
    parent: '/our-connection'
  },
  '/relationship-insights': {
    title: 'Relationship Insights',
    subtitle: 'Weekly AI coaching',
    icon: '💡',
    section: 'Connect',
    parent: '/our-connection'
  },
  '/relationship-timeline': {
    title: 'Relationship Timeline',
    subtitle: 'Track your journey together',
    icon: '📈',
    section: 'Connect',
    parent: '/our-connection'
  },
  '/weekly-insights': {
    title: 'Weekly Insights',
    subtitle: 'AI-powered relationship coaching',
    icon: '🧠',
    section: 'Connect',
    parent: '/our-connection'
  }
}

export default function ContextHeader({ 
  title, 
  subtitle, 
  icon, 
  showBack = true, 
  backUrl, 
  rightAction 
}: ContextHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Get page config or use props
  const pageConfig = pathname ? PAGE_CONFIG[pathname] : null
  const displayTitle = title || pageConfig?.title || 'Page'
  const displaySubtitle = subtitle || pageConfig?.subtitle
  const displayIcon = icon || pageConfig?.icon || '📱'
  const section = pageConfig?.section
  const parentPage = pageConfig?.parent

  // Determine back URL
  const getBackUrl = () => {
    if (backUrl) return backUrl
    if (parentPage) return parentPage
    if (pathname && pathname !== '/app') return '/app'
    return null
  }

  const handleBack = () => {
    const backTarget = getBackUrl()
    if (backTarget) {
      router.push(backTarget)
    } else {
      router.back()
    }
  }

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; href: string }> = []
    
    // Always start with Dashboard if not on dashboard
    if (pathname && pathname !== '/app') {
      breadcrumbs.push({ label: 'Dashboard', href: '/app' })
    }
    
    // Add section if different from current page
    if (section && parentPage) {
      breadcrumbs.push({ label: section, href: parentPage })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const showBackButton = showBack && getBackUrl()

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-wheat/20">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back Button + Breadcrumbs + Title */}
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 md:space-x-2 text-deepRed hover:text-deepRed/80 transition-colors p-1 md:p-2 rounded-lg hover:bg-deepRed/5 -ml-1 md:-ml-2"
              >
                <span className="text-lg md:text-lg">←</span>
                <span className="text-xs md:text-sm font-medium hidden sm:inline">Back</span>
              </button>
            )}
            
            {/* Breadcrumbs - Hidden on small screens to save space */}
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-wheat/60">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center space-x-2">
                    <Link 
                      href={crumb.href}
                      className="hover:text-wheat transition-colors whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                    <span>•</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Current Page Title */}
            <div className="flex items-center space-x-2 min-w-0">
              <div className="text-base md:text-lg flex-shrink-0 flex items-center justify-center">
                {displayIcon && displayIcon.startsWith('/') ? (
                  <Image
                    src={displayIcon}
                    alt={displayTitle}
                    width={20}
                    height={20}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  />
                ) : (
                  <span>{displayIcon}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-wheat truncate">
                  {displayTitle}
                </h1>
                {displaySubtitle && (
                  <p className="text-xs text-wheat/70 truncate hidden sm:block">
                    {displaySubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Action + Panic Button */}
          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {rightAction}
            
            {/* Panic Button */}
            <button
              className="w-7 h-7 md:w-8 md:h-8 bg-emphasis hover:bg-emphasis/80 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:shadow-lg"
              title="Panic mode - disguise app"
              onClick={() => {
                console.log('Panic mode activated')
                // TODO: Implement panic mode
              }}
            >
              <span className="text-xs md:text-sm">👁️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 