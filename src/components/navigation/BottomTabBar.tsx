'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface TabItem {
  id: string
  label: string
  icon?: string
  iconImage?: string
  href: string
  section: string
}

const TAB_ITEMS: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    href: '/app',
    section: 'home'
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: '💕',
    href: '/connect',
    section: 'connect'
  },
  {
    id: 'coach',
    label: 'Coach',
    iconImage: '/SEGGSYCHATBOT.png',
    href: '/coach',
    section: 'coach'
  },
  {
    id: 'you',
    label: 'You',
    icon: '⚙️',
    href: '/you',
    section: 'you'
  }
]

// Map existing routes to new sections
const ROUTE_MAPPING: Record<string, string> = {
  '/app': 'home',
  '/': 'home',
  '/connect': 'connect',
  '/journey': 'connect',
  '/boudoir': 'connect',
  '/explore': 'connect',
  '/prompts': 'connect',
  '/intimacy-hub': 'connect',
  '/ai-suggestions': 'connect',
  '/thoughts': 'connect',
  '/couples-demo': 'connect',
  '/intimacy-demo': 'connect',
  '/our-connection': 'connect',
  '/understanding-partner': 'connect',
  '/relationship-timeline': 'connect',
  '/coaching': 'coach',
  '/coach': 'coach',
  '/predictive-insights': 'coach',
  '/relationship-insights': 'coach',
  '/test-seggsy': 'coach',
  '/test-conversation-memory': 'coach',
  '/test-feedback': 'coach',
  '/settings': 'you',
  '/blueprint': 'you',
  '/partner-connect': 'you',
  '/personalization': 'you',
  '/admin-tools': 'you',
  '/analytics': 'you'
}

export default function BottomTabBar() {
  const pathname = usePathname()
  
  // Determine active section based on current path
  const getActiveSection = () => {
    if (!pathname) return 'home'
    return ROUTE_MAPPING[pathname] || 'home'
  }

  const activeSection = getActiveSection()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Bottom Tab Bar */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-wheat/20 shadow-xl">
        <div className="flex justify-around items-center px-1 py-1 pb-safe">
          {TAB_ITEMS.map((item) => {
            const isActive = activeSection === item.section
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-2 px-2 min-w-[60px] md:min-w-[64px] min-h-[52px] md:min-h-[56px] rounded-xl transition-all duration-200 touch-manipulation"
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-deepRed/10 rounded-xl"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                
                {/* Icon */}
                <div className={`text-xl md:text-2xl mb-1 transition-all duration-200 flex items-center justify-center ${
                  isActive 
                    ? 'transform scale-110' 
                    : 'opacity-70 hover:opacity-90'
                }`}>
                  {item.iconImage ? (
                    <Image
                      src={item.iconImage}
                      alt={item.label}
                      width={24}
                      height={24}
                      className="w-6 h-6 md:w-7 md:h-7 object-contain"
                    />
                  ) : (
                    item.icon
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium transition-all duration-200 leading-tight text-center ${
                  isActive 
                    ? 'text-deepRed font-semibold' 
                    : 'text-wheat/80 hover:text-wheat'
                }`}>
                  {item.label}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 w-1 h-1 bg-deepRed rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 