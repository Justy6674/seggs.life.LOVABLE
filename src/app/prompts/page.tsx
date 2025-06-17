'use client'

import AppLayout from '../../components/navigation/AppLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PromptsPage() {
  const quickPrompts = [
    {
      title: "Deep Connection",
      description: "Questions to deepen your intimate bond",
      icon: "💕",
      href: "/coaching"
    },
    {
      title: "Playful Suggestions", 
      description: "AI-powered intimate suggestions",
      icon: "🎲",
      href: "/boudoir"
    },
    {
      title: "Conversation Starters",
      description: "Meaningful questions for couples",
      icon: "💬", 
      href: "/coaching"
    },
    {
      title: "Romantic Ideas",
      description: "Personalized romantic suggestions",
      icon: "🌹",
      href: "/boudoir"
    }
  ]

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-accent mb-2">AI Prompts & Suggestions</h1>
          <p className="text-accent/70 mb-8">Choose what kind of inspiration you're looking for</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={prompt.href}>
                  <div className="bg-primary/60 backdrop-blur-sm border border-accent/30 rounded-xl p-6 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-4">{prompt.icon}</span>
                      <h2 className="text-xl font-semibold text-accent group-hover:text-accent/90">
                        {prompt.title}
                      </h2>
                    </div>
                    <p className="text-accent/70 mb-4">{prompt.description}</p>
                    <div className="flex items-center text-accent/60 group-hover:text-accent/80 text-sm">
                      <span>Explore</span>
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-accent/10 to-emphasis/10 border border-accent/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-accent mb-3">
              ✨ Looking for personalized suggestions?
            </h3>
            <p className="text-accent/70 mb-4">
              Get AI-powered, personalized prompts and suggestions based on your preferences and relationship style.
            </p>
            <Link 
              href="/boudoir"
              className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
            >
              Get Personal Suggestions
              <span className="ml-2">🎯</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
} 