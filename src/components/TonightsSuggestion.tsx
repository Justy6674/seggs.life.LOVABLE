'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'
import { IntimacyActionsService, INTIMACY_CATEGORIES } from '../lib/intimacyActions'
import { Sparkles, RefreshCw, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TonightsSuggestion() {
  const { user } = useAuth()
  const { userData } = useUserData()
  const [suggestion, setSuggestion] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loved, setLoved] = useState(false)

  // Get random category for suggestions
  const getRandomCategory = () => {
    const randomIndex = Math.floor(Math.random() * INTIMACY_CATEGORIES.length)
    return INTIMACY_CATEGORIES[randomIndex]
  }

  // Generate tonight's suggestion
  const generateSuggestion = async () => {
    if (!userData || !userData.eroticBlueprintPrimary) return

    setLoading(true)
    try {
      const randomCategory = getRandomCategory()
      setCategory(randomCategory.name)

      // For demo purposes, create a mock partner if none exists
      const partnerData = {
        eroticBlueprintPrimary: userData.partnerId ? 'sensual' : 'sexual', // Mock for demo
        displayName: 'Your Partner'
      }

      const suggestions = await IntimacyActionsService.generateActions(
        randomCategory.id,
        userData as any,
        partnerData as any,
        1
      )

      if (suggestions.length > 0) {
        setSuggestion(suggestions[0])
      }
    } catch (error) {
      console.error('Error generating suggestion:', error)
      // Fallback suggestion
      setSuggestion("Try something new together tonight - let curiosity guide you!")
      setCategory("Connection")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userData?.eroticBlueprintPrimary) {
      generateSuggestion()
    }
  }, [userData])

  const handleLove = () => {
    setLoved(!loved)
    // Could log this feedback for AI learning
  }

  const handleRefresh = () => {
    generateSuggestion()
    setLoved(false)
  }

  if (!userData?.eroticBlueprintPrimary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-burgundy/20 to-burgundy/10 backdrop-blur-sm border border-wheat/20 rounded-2xl p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-deepRed" />
          <h3 className="text-lg font-semibold text-wheat">Tonight's Perfect Suggestion</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLove}
            className={`p-2 rounded-full transition-all duration-200 ${
              loved 
                ? 'bg-pink-500 text-white' 
                : 'bg-wheat/10 text-wheat/70 hover:bg-wheat/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${loved ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-full bg-wheat/10 text-wheat/70 hover:bg-wheat/20 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Blueprint Info */}
      <div className="mb-4">
        <span className="inline-block bg-deepRed/20 text-deepRed px-3 py-1 rounded-full text-sm font-medium">
          Perfect for {userData.eroticBlueprintPrimary} Blueprint
        </span>
        {category && (
          <span className="inline-block ml-2 bg-wheat/10 text-wheat/80 px-3 py-1 rounded-full text-sm">
            {category}
          </span>
        )}
      </div>

      {/* Suggestion Content */}
      <div className="mb-6">
        {loading ? (
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin"></div>
            <span className="text-wheat/70">Crafting something perfect for you...</span>
          </div>
        ) : (
          <p className="text-wheat leading-relaxed text-lg">
            {suggestion}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link 
          href="/explore"
          className="text-wheat/70 hover:text-wheat transition-colors duration-200 text-sm font-medium"
        >
          Explore more categories
        </Link>
        
        <button className="flex items-center space-x-2 bg-deepRed hover:bg-deepRed/90 text-wheat px-4 py-2 rounded-xl transition-all duration-200 font-medium">
          <span>Try this tonight</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
} 