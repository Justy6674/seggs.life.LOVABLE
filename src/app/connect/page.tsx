'use client'

import AppLayout from '@/components/navigation/AppLayout'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface FeatureCard {
  title: string
  description: string
  icon?: string
  iconImage?: string
  href: string
  color: string
}

const CONNECT_FEATURES: FeatureCard[] = [
  {
    title: 'Your Journey',
    description: 'Track growth and celebrate milestones',
    icon: '🗺️',
    href: '/journey',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Boudoir',
    description: 'Playful and intimate suggestions',
    icon: '💑',
    href: '/boudoir',
    color: 'from-red-500 to-pink-500'
  },
  {
    title: 'Explore Together',
    description: 'Discover new experiences',
    icon: '🌟',
    href: '/explore',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Conversation Prompts',
    description: 'Deepen your connection',
    icon: '💡',
    href: '/prompts',
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Intimacy Hub',
    description: 'Your connection center',
    icon: '💕',
    href: '/intimacy-hub',
    color: 'from-rose-500 to-pink-500'
  },
  {
    title: 'AI Suggestions',
    description: 'Personalized recommendations',
    iconImage: '/SEGGSYCHATBOT.png',
    href: '/ai-suggestions',
    color: 'from-indigo-500 to-purple-500'
  }
]

export default function ConnectPage() {
  return (
    <AppLayout 
      headerProps={{
        title: 'Connect',
        subtitle: 'Strengthen your intimate bond together',
        icon: '💕'
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
            Connect & Explore Together
          </h1>
          <p className="text-wheat/70 max-w-md mx-auto">
            Discover tools and activities to deepen your intimate connection and explore new dimensions of your relationship.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONNECT_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-wheat/10">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {feature.icon && (
                          <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                        )}
                        {feature.iconImage && (
                          <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center">
                            <Image
                              src={feature.iconImage}
                              alt={feature.title}
                              width={48}
                              height={48}
                              className="rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-wheat group-hover:text-deepRed transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-wheat/60 text-sm mt-1 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-white/50 rounded-xl p-6 border border-wheat/10"
        >
          <h2 className="text-lg font-semibold text-wheat mb-4 text-center">
            Quick Actions
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-deepRed/10 hover:bg-deepRed/20 text-deepRed rounded-full text-sm font-medium transition-colors duration-200">
              🎲 Random Activity
            </button>
            <button className="px-4 py-2 bg-deepRed/10 hover:bg-deepRed/20 text-deepRed rounded-full text-sm font-medium transition-colors duration-200">
              💡 Daily Prompt
            </button>
            <button className="px-4 py-2 bg-deepRed/10 hover:bg-deepRed/20 text-deepRed rounded-full text-sm font-medium transition-colors duration-200">
              ✨ Surprise Me
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
} 