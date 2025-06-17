'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Heart, MessageCircle, User, Sparkles, ChevronRight } from 'lucide-react'

interface ContentStream {
  id: string
  type: 'understanding' | 'communication' | 'bridging'
  title: string
  description: string
  content: string[]
  userBlueprint: string
  partnerBlueprint: string
  icon: string
  color: string
}

interface PartnerSpecificContentStreamsProps {
  userBlueprint?: string
  partnerBlueprint?: string
}

export default function PartnerSpecificContentStreams({ 
  userBlueprint = 'sensual', 
  partnerBlueprint = 'energetic' 
}: PartnerSpecificContentStreamsProps) {
  const [activeStream, setActiveStream] = useState<string>('understanding')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const contentStreams: ContentStream[] = [
    {
      id: 'understanding',
      type: 'understanding',
      title: `Understanding Your ${partnerBlueprint.charAt(0).toUpperCase() + partnerBlueprint.slice(1)} Partner`,
      description: `Deep insights into how ${partnerBlueprint} partners experience intimacy and connection`,
      content: [
        `${partnerBlueprint.charAt(0).toUpperCase() + partnerBlueprint.slice(1)} partners thrive on variety and spontaneity in their intimate connections`,
        `They often need physical movement and dynamic energy to feel fully engaged`,
        `Creating playful, unexpected moments can be incredibly meaningful to them`,
        `They may feel disconnected when intimacy becomes too routine or predictable`,
        `Their arousal patterns often involve multiple senses and changing dynamics`
      ],
      userBlueprint,
      partnerBlueprint,
      icon: '🔍',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'communication',
      type: 'communication',
      title: `How to Communicate Your ${userBlueprint.charAt(0).toUpperCase() + userBlueprint.slice(1)} Needs`,
      description: `Express your blueprint needs in ways that resonate with your ${partnerBlueprint} partner`,
      content: [
        `Frame your sensual needs as adventures you can explore together`,
        `Use active language: "Let's create a beautiful, slow evening together"`,
        `Suggest specific activities rather than abstract feelings`,
        `Connect your needs to their energy: "Your enthusiasm makes these moments even more beautiful"`,
        `Propose trying new variations on familiar intimate activities`
      ],
      userBlueprint,
      partnerBlueprint,
      icon: '💬',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'bridging',
      type: 'bridging',
      title: `Bridging ${userBlueprint.charAt(0).toUpperCase() + userBlueprint.slice(1)} and ${partnerBlueprint.charAt(0).toUpperCase() + partnerBlueprint.slice(1)}`,
      description: `Strategies to create harmony between your different blueprint styles`,
      content: [
        `Start with high-energy connection, then gradually slow down to sensual pace`,
        `Incorporate movement into sensual activities (dancing, massage with rhythm)`,
        `Create "energy waves" - building excitement then savoring the moment`,
        `Use variety in your sensual experiences to keep things fresh`,
        `Plan surprise sensual experiences that feel like mini-adventures`
      ],
      userBlueprint,
      partnerBlueprint,
      icon: '🌉',
      color: 'from-pink-500 to-rose-600'
    }
  ]

  const getBlueprintColor = (blueprint: string) => {
    const colors = {
      sensual: 'text-green-600',
      energetic: 'text-orange-600',
      kinky: 'text-purple-600',
      sexual: 'text-red-600',
      shapeshifter: 'text-blue-600'
    }
    return colors[blueprint as keyof typeof colors] || 'text-gray-600'
  }

  const getBlueprintEmoji = (blueprint: string) => {
    const emojis = {
      sensual: '🌸',
      energetic: '⚡',
      kinky: '🎭',
      sexual: '🔥',
      shapeshifter: '🌈'
    }
    return emojis[blueprint as keyof typeof emojis] || '✨'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl">{getBlueprintEmoji(userBlueprint)}</span>
          <ChevronRight className="text-gray-400" size={20} />
          <span className="text-3xl">{getBlueprintEmoji(partnerBlueprint)}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Partner-Specific Content Streams
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Personalized insights for navigating your unique blueprint combination. 
          These insights work whether your partner is actively engaged or not.
        </p>
      </div>

      {/* Stream Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {contentStreams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => setActiveStream(stream.id)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeStream === stream.id
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{stream.icon}</span>
            {stream.type.charAt(0).toUpperCase() + stream.type.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Display */}
      <AnimatePresence mode="wait">
        {contentStreams
          .filter(stream => stream.id === activeStream)
          .map(stream => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stream Header */}
              <div className={`bg-gradient-to-r ${stream.color} rounded-2xl p-8 text-white`}>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{stream.icon}</span>
                  <h3 className="text-2xl font-bold">{stream.title}</h3>
                </div>
                <p className="text-white/90 text-lg">{stream.description}</p>
              </div>

              {/* Content Cards */}
              <div className="grid gap-4">
                {stream.content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed">{item}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Take Action</h4>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save to Journal
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Share with Partner
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Get More Insights
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Blueprint Reference */}
      <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Blueprint Combination</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">{getBlueprintEmoji(userBlueprint)}</div>
            <h5 className={`text-lg font-bold mb-2 ${getBlueprintColor(userBlueprint)}`}>
              You: {userBlueprint.charAt(0).toUpperCase() + userBlueprint.slice(1)}
            </h5>
            <p className="text-gray-600 text-sm">
              You thrive on sensory experiences, emotional connection, and taking time to savor intimate moments.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">{getBlueprintEmoji(partnerBlueprint)}</div>
            <h5 className={`text-lg font-bold mb-2 ${getBlueprintColor(partnerBlueprint)}`}>
              Partner: {partnerBlueprint.charAt(0).toUpperCase() + partnerBlueprint.slice(1)}
            </h5>
            <p className="text-gray-600 text-sm">
              They are energized by variety, movement, and dynamic experiences that engage multiple senses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 