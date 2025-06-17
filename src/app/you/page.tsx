'use client'

import AppLayout from '@/components/navigation/AppLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useUserData } from '@/hooks/useUserData'

interface YouFeature {
  title: string
  description: string
  icon: string
  href: string
  color: string
}

const YOU_FEATURES: YouFeature[] = [
  {
    title: 'Your Blueprint',
    description: 'Discover your erotic blueprint',
    icon: '🧭',
    href: '/blueprint',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Partner Connection',
    description: 'Connect with your partner',
    icon: '👥',
    href: '/partner-connect',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Settings',
    description: 'Customize your experience',
    icon: '⚙️',
    href: '/settings',
    color: 'from-gray-500 to-slate-500'
  },
  {
    title: 'Personalization',
    description: 'Tailor your experience',
    icon: '🎨',
    href: '/personalization',
    color: 'from-purple-500 to-indigo-500'
  }
]

export default function YouPage() {
  const { userData, loading } = useUserData()

  return (
    <AppLayout 
      headerProps={{
        title: 'Your Profile',
        subtitle: 'Personalize your intimate journey',
        icon: '⚙️'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 rounded-xl p-6 border border-wheat/10 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-deepRed to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
              {userData?.displayName?.charAt(0) || '👤'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-wheat">
                {userData?.displayName || 'Welcome'}
              </h2>
              <p className="text-wheat/60 text-sm">
                {userData?.email || 'Complete your profile to get started'}
              </p>
              <div className="flex space-x-4 mt-2">
                <span className="text-xs px-2 py-1 bg-deepRed/10 text-deepRed rounded-full">
                  📊 Journey Level 1
                </span>
                {userData?.partnerId && (
                  <span className="text-xs px-2 py-1 bg-pink-500/10 text-pink-600 rounded-full">
                    💕 Partnered
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {YOU_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-wheat/10 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-wheat group-hover:text-deepRed transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-wheat/60 text-sm mt-1 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-deepRed text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/50 rounded-xl p-6 border border-wheat/10"
        >
          <h2 className="text-lg font-semibold text-wheat mb-4 text-center">
            Your Journey Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-deepRed">
                {userData?.onboardingCompleted ? 1 : 0}
              </div>
              <div className="text-xs text-wheat/60">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-deepRed">
                {userData ? Math.floor((Date.now() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-xs text-wheat/60">Days Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-deepRed">
                {userData?.eroticBlueprintPrimary ? 1 : 0}
              </div>
              <div className="text-xs text-wheat/60">Blueprints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-deepRed">
                {userData?.partnerId ? 1 : 0}
              </div>
              <div className="text-xs text-wheat/60">Connections</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
} 