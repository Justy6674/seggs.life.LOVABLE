"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../hooks/useUserData'
import AppLayout from '../../components/navigation/AppLayout'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FavoriteSuggestion {
  suggestionId: string
  feedback: string
  timestamp: string
  category: string
  userBlueprint: string
  title?: string
  content?: string
  emoji?: string
  estimatedTime?: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const { userData, loading } = useUserData()
  const [favorites, setFavorites] = useState<FavoriteSuggestion[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedHeatLevel, setSelectedHeatLevel] = useState<string>('all')

  useEffect(() => {
    // Load favorites from localStorage
    const storedFeedback = JSON.parse(localStorage.getItem('suggestionFeedback') || '[]')
    const lovedSuggestions = storedFeedback.filter((item: FavoriteSuggestion) => item.feedback === 'love')
    setFavorites(lovedSuggestions)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-wheat/30 border-t-wheat rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wheat">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <AppLayout 
        headerProps={{
          title: 'Your Favorites',
          subtitle: 'Collected suggestions you love',
          icon: '💖',
          showBack: true
        }}
      >
        <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-3xl font-serif font-bold text-wheat mb-4">
              Sign In to View Favorites
            </h1>
            <p className="text-wheat/70 mb-6">
              Your favorite suggestions are saved to your personal account.
            </p>
            <Link 
              href="/app"
              className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const categories = ['all', ...Array.from(new Set(favorites.map(f => f.category)))]
  const heatLevels = ['all', 'sweet', 'flirty', 'steamy', 'wild']

  const filteredFavorites = favorites.filter(fav => {
    const categoryMatch = selectedCategory === 'all' || fav.category === selectedCategory
    const heatMatch = selectedHeatLevel === 'all' || fav.category.toLowerCase().includes(selectedHeatLevel)
    return categoryMatch && heatMatch
  })

  return (
    <AppLayout 
      headerProps={{
        title: 'Your Favorites',
        subtitle: `${favorites.length} suggestions you love`,
        icon: '💖',
        showBack: true
      }}
    >
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20 text-center"
            >
              <div className="text-6xl mb-6">💫</div>
              <h2 className="text-2xl font-serif font-bold text-wheat mb-4">Start Building Your Collection</h2>
              <p className="text-wheat/70 mb-6 max-w-2xl mx-auto">
                When you find suggestions you love, hit the "💕 Love it!" button to save them here. 
                Build your personal collection of amazing ideas!
              </p>
              <Link 
                href="/app"
                className="bg-deepRed hover:bg-deepRed/90 text-wheat px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
              >
                Discover Suggestions
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-primary/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-6 border border-wheat/20 mb-8"
              >
                <h3 className="text-lg font-semibold text-wheat mb-4 text-center">Filter Your Collection</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  
                  {/* Category Filter */}
                  <div>
                    <label className="text-wheat/80 text-sm font-medium mb-2 block">📂 Category</label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm focus:outline-none focus:border-wheat/50"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Heat Level Filter */}
                  <div>
                    <label className="text-wheat/80 text-sm font-medium mb-2 block">🔥 Heat Level</label>
                    <select 
                      value={selectedHeatLevel}
                      onChange={(e) => setSelectedHeatLevel(e.target.value)}
                      className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm focus:outline-none focus:border-wheat/50"
                    >
                      {heatLevels.map(level => (
                        <option key={level} value={level}>
                          {level === 'all' ? 'All Heat Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Favorites Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.suggestionId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-gradient-to-r from-deepRed/20 to-burgundy/20 backdrop-blur-sm rounded-2xl p-6 border border-wheat/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-2xl">{favorite.emoji || '💕'}</div>
                      <div className="text-xs text-wheat/60 bg-wheat/10 px-2 py-1 rounded">
                        {favorite.category}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-wheat mb-3">
                      {favorite.title || 'Loved Suggestion'}
                    </h4>
                    
                    <p className="text-wheat/80 text-sm leading-relaxed mb-4">
                      {favorite.content || 'A suggestion you marked as a favorite'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-wheat/60">
                      <span>⏱️ {favorite.estimatedTime || '15 min'}</span>
                      <span>{new Date(favorite.timestamp).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredFavorites.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-3xl p-8 border border-wheat/20 text-center"
                >
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-wheat mb-4">No matches found</h3>
                  <p className="text-wheat/70 mb-6">
                    Try adjusting your filters or explore more suggestions to build your collection.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedHeatLevel('all')
                    }}
                    className="bg-wheat/20 hover:bg-wheat/30 text-wheat px-6 py-3 rounded-xl font-medium transition-all duration-300 mr-4"
                  >
                    Clear Filters
                  </button>
                  <Link 
                    href="/app"
                    className="bg-deepRed hover:bg-deepRed/90 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-block"
                  >
                    Find More Ideas
                  </Link>
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>
    </AppLayout>
  )
} 