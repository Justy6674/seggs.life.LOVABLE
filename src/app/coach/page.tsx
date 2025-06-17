'use client'

import AppLayout from '@/components/navigation/AppLayout'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface CoachFeature {
  title: string
  description: string
  icon?: string
  iconImage?: string
  href: string
  color: string
}

const COACH_FEATURES: CoachFeature[] = [
  {
    title: 'AI Suggestions',
    description: 'Get personalized intimacy suggestions',
    iconImage: '/SEGGSYCHATBOT.png',
    href: '/ai-suggestions',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Blueprint Analysis',
    description: 'Understand your blueprint combination',
    icon: '🔮',
    href: '/blueprint-combo',
    color: 'from-purple-500 to-pink-500'
  }
]

export default function CoachPage() {
  return (
    <AppLayout 
      headerProps={{
        title: 'AI Coach',
        subtitle: 'Your personal relationship guide',
        icon: '🤖'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-wheat mb-2">
            Meet Seggsy, Your AI Coach
          </h1>
          <p className="text-wheat/70 max-w-md mx-auto">
            Get personalized guidance, insights, and support for your intimate relationship journey.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {COACH_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-wheat/10 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cream rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                        {feature.iconImage ? (
                          <Image
                            src={feature.iconImage}
                            alt={feature.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          feature.icon
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-wheat group-hover:text-deepRed transition-colors duration-300 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-wheat/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 rounded-xl p-6 border border-wheat/10"
        >
          <h2 className="text-lg font-semibold text-wheat mb-4 text-center">
            Quick Questions for Seggsy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/our-connection" className="text-left p-4 bg-white/70 hover:bg-white rounded-lg border border-wheat/10 transition-colors duration-200 block">
              <span className="text-deepRed text-sm">💡</span>
              <p className="text-wheat text-sm mt-1">"How can we improve our communication?"</p>
            </Link>
            <Link href="/explore" className="text-left p-4 bg-white/70 hover:bg-white rounded-lg border border-wheat/10 transition-colors duration-200 block">
              <span className="text-deepRed text-sm">🌟</span>
              <p className="text-wheat text-sm mt-1">"What are some new activities to try?"</p>
            </Link>
            <Link href="/ai-suggestions" className="text-left p-4 bg-white/70 hover:bg-white rounded-lg border border-wheat/10 transition-colors duration-200 block">
              <span className="text-deepRed text-sm">💕</span>
              <p className="text-wheat text-sm mt-1">"How do we keep the spark alive?"</p>
            </Link>
            <Link href="/blueprint-combo" className="text-left p-4 bg-white/70 hover:bg-white rounded-lg border border-wheat/10 transition-colors duration-200 block">
              <span className="text-deepRed text-sm">📊</span>
              <p className="text-wheat text-sm mt-1">"What's my relationship pattern?"</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
} 