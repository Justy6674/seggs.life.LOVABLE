'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PreviewCategory {
  id: string
  title: string
  emoji: string
  description: string
  sampleIdeas: string[]
  upgradeTeaser: string
}

const PREVIEW_CATEGORIES: PreviewCategory[] = [
  {
    id: 'romantic',
    title: 'Romantic Connection',
    emoji: '💕',
    description: 'Sweet, tender moments that build emotional intimacy',
    sampleIdeas: [
      'Share three things you love about each other while slow dancing',
      'Create a playlist of songs that tell your love story',
      'Write love notes and hide them for your partner to find'
    ],
    upgradeTeaser: 'Get 50+ romantic ideas personalized to your blueprint combination'
  },
  {
    id: 'sensual',
    title: 'Sensual Experiences',
    emoji: '🌹',
    description: 'Engaging all five senses for deeper connection',
    sampleIdeas: [
      'Give each other a relaxing massage with scented oils',
      'Feed each other your favorite foods blindfolded',
      'Take a bubble bath together with candles and soft music'
    ],
    upgradeTeaser: 'Unlock blueprint-specific sensual experiences and advanced techniques'
  },
  {
    id: 'playful',
    title: 'Playful & Fun',
    emoji: '🎮',
    description: 'Lighthearted activities that bring joy and laughter',
    sampleIdeas: [
      'Play truth or dare with intimate questions',
      'Have a pillow fight followed by cuddles',
      'Create silly TikTok dances together'
    ],
    upgradeTeaser: 'Access 100+ playful ideas tailored to your energy levels'
  },
  {
    id: 'adventurous',
    title: 'Adventure & Exploration',
    emoji: '🚀',
    description: 'New experiences to try together outside your comfort zone',
    sampleIdeas: [
      'Try a new cuisine you\'ve never had before',
      'Take a spontaneous day trip to somewhere new',
      'Learn a new skill together online'
    ],
    upgradeTeaser: 'Get personalized adventure suggestions based on your relationship blueprint'
  }
]

const BLUEPRINT_TEASERS = [
  {
    type: 'Sensual',
    description: 'If you\'re sensual, you crave experiences that engage all five senses',
    example: 'Perfect for you: "Create a sensory journey with different textures, scents, and tastes"'
  },
  {
    type: 'Sexual',
    description: 'If you\'re sexual, you prefer direct, passionate connection',
    example: 'Perfect for you: "Express your desires clearly and create intense physical moments"'
  },
  {
    type: 'Energetic',
    description: 'If you\'re energetic, you thrive on anticipation and mental stimulation',
    example: 'Perfect for you: "Build anticipation through flirtatious texts throughout the day"'
  },
  {
    type: 'Kinky',
    description: 'If you\'re kinky, you enjoy psychological play and creative scenarios',
    example: 'Perfect for you: "Explore role-playing scenarios that intrigue both of you"'
  },
  {
    type: 'Shapeshifter',
    description: 'If you\'re a shapeshifter, you enjoy variety and adapt to different moods',
    example: 'Perfect for you: "Mix different approaches based on your current energy and desires"'
  }
]

export default function ExploreFirstPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showBlueprints, setShowBlueprints] = useState(false)

  const selectedCategoryData = PREVIEW_CATEGORIES.find(cat => cat.id === selectedCategory)

  if (showBlueprints) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              Erotic Blueprint Preview
            </h1>
            <p className="text-wheat/70 mb-8">
              Here's how our AI personalizes suggestions based on your intimacy style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {BLUEPRINT_TEASERS.map((blueprint, index) => (
              <motion.div
                key={blueprint.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-600/30"
              >
                <h3 className="text-xl font-semibold text-wheat mb-2">
                  {blueprint.type} Blueprint
                </h3>
                <p className="text-wheat/70 text-sm mb-4">
                  {blueprint.description}
                </p>
                <div className="bg-gray-700/30 rounded-xl p-3">
                  <p className="text-amber-300 text-sm font-medium">
                    {blueprint.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-amber-900/40 to-amber-700/40 backdrop-blur-sm rounded-3xl p-8 border border-amber-500/30 text-center mb-8"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-wheat mb-4">
              See What You're Missing
            </h2>
            <p className="text-wheat/80 mb-6 max-w-2xl mx-auto">
              These are just generic examples. With your blueprint assessment, our AI generates 
              hundreds of personalized suggestions that match your exact intimacy style and preferences.
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/blueprint"
                className="block w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
              >
                🧬 Take Your Blueprint Assessment
              </Link>
              
              <Link 
                href="/partner-predict"
                className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
              >
                🔮 Predict Your Partner's Blueprint
              </Link>
            </div>
          </motion.div>

          <div className="text-center">
            <button
              onClick={() => setShowBlueprints(false)}
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Back to categories
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedCategory && selectedCategoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">{selectedCategoryData.emoji}</div>
            <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
              {selectedCategoryData.title}
            </h1>
            <p className="text-wheat/70">
              {selectedCategoryData.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            {selectedCategoryData.sampleIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-wheat leading-relaxed">{idea}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-amber-900/40 to-amber-700/40 backdrop-blur-sm rounded-3xl p-8 border border-amber-500/30 text-center mb-8"
          >
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-semibold text-wheat mb-3">
              Want More Like This?
            </h3>
            <p className="text-wheat/80 mb-4 text-sm">
              {selectedCategoryData.upgradeTeaser}
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/blueprint"
                className="block w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-200"
              >
                🚀 Unlock Personalized Suggestions
              </Link>
              
              <p className="text-amber-200/60 text-xs">
                Take the 5-minute assessment to get unlimited AI-generated ideas
              </p>
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
            >
              ← Back to categories
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-wheat mb-4">
            Explore Seggs.life Preview
          </h1>
          <p className="text-wheat/70 mb-8">
            Get a taste of what our AI-powered intimacy suggestions look like
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-900/40 to-amber-700/40 backdrop-blur-sm rounded-3xl p-8 border border-amber-500/30 text-center mb-8"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-semibold text-wheat mb-4">
            Preview Mode
          </h2>
          <p className="text-wheat/80 mb-6 max-w-2xl mx-auto">
            These are sample suggestions to show you how the app works. The real magic happens when 
            our AI creates personalized ideas based on your unique Erotic Blueprint combination.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowBlueprints(true)}
              className="bg-gradient-to-br from-purple-600/40 to-purple-500/40 hover:from-purple-500/60 hover:to-purple-400/60 border border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-200"
            >
              <div className="text-3xl mb-2">🧬</div>
              <div className="text-wheat font-medium text-sm">Learn About Blueprints</div>
            </button>
            
            <Link
              href="/blueprint"
              className="bg-gradient-to-br from-amber-600/40 to-amber-500/40 hover:from-amber-500/60 hover:to-amber-400/60 border border-amber-500/30 hover:border-amber-400/50 rounded-xl p-4 transition-all duration-200 block"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-wheat font-medium text-sm">Take Assessment</div>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-serif font-semibold text-wheat mb-6 text-center">
            Sample Categories & Ideas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PREVIEW_CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 text-left group"
              >
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h4 className="text-xl font-semibold text-wheat mb-2 group-hover:text-amber-200 transition-colors">
                  {category.title}
                </h4>
                <p className="text-wheat/70 text-sm mb-4">
                  {category.description}
                </p>
                <div className="text-amber-300 text-sm font-medium">
                  View {category.sampleIdeas.length} sample ideas →
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/30 text-center"
        >
          <h3 className="text-xl font-semibold text-wheat mb-4">
            Ready for Unlimited Personalized Ideas?
          </h3>
          <p className="text-wheat/70 mb-6 max-w-xl mx-auto">
            Take your blueprint assessment to unlock AI-generated suggestions tailored specifically 
            to your intimacy style and relationship dynamic.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/blueprint"
              className="block w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200"
            >
              🧬 Take Your Blueprint Assessment
            </Link>
            
            <div className="flex space-x-3">
              <Link 
                href="/partner-predict"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-xl text-center transition-all duration-200 text-sm"
              >
                🔮 Predict Partner
              </Link>
              
              <Link 
                href="/full-assessment"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-xl text-center transition-all duration-200 text-sm"
              >
                🚀 Full Assessment
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-8"
        >
          <Link 
            href="/"
            className="text-wheat/60 hover:text-wheat/80 transition-colors text-sm"
          >
            ← Back to start
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
