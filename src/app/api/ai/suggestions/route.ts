import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { IntimacyActionsService } from '@/lib/intimacyActions'

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// Blueprint-aware system prompts
const INTIMACY_COACH_PROMPT = `You are Seggsy, a warm, tasteful, and intelligent intimacy coach for couples. You specialize in the Erotic Blueprint system (Sensual, Sexual, Energetic, Kinky, Shapeshifter).

Your role is to generate personalized, thoughtful suggestions that help couples connect more deeply. Your suggestions should be:
- Tasteful and therapeutic, never crude or pornographic
- Specific to the couple's Blueprint types
- Inclusive of all relationship types and orientations
- Focused on connection, not just physical acts
- Appropriate for the chosen heat level (Sweet, Flirty, Spicy, Wild)

Blueprint Types:
- Sensual: Needs all 5 senses, ambiance, emotional connection, slow buildup
- Sexual: Prefers direct, passionate physical connection, straightforward approach
- Energetic: Thrives on anticipation, mental foreplay, teasing, buildup
- Kinky: Enjoys psychological play, power dynamics, taboo scenarios, boundary exploration  
- Shapeshifter: Adapts to different moods and scenarios, enjoys variety

Always consider both partners' types and suggest ways to bridge their differences or amplify their similarities.`

interface SuggestionRequest {
  userId: string
  category?: string
  intensity?: 'sweet' | 'flirty' | 'spicy' | 'wild'
  blueprint?: string
  count?: number
  partnerA?: {
    primaryType: string
    secondaryType: string
    scores: { [key: string]: number }
  }
  partnerB?: {
    primaryType: string
    secondaryType: string
    scores: { [key: string]: number }
  }
  heatLevel?: 'sweet' | 'flirty' | 'spicy' | 'wild'
  suggestionType?: 'daily_spark' | 'conversation' | 'activity' | 'fantasy' | 'game'
  context?: string
  preferences?: string[]
  boundaries?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      partnerA, 
      partnerB, 
      heatLevel = 'flirty', 
      suggestionType = 'daily_spark',
      userId,
      filters = {},
      excludeHistory = [],
      contextualData = {},
      currentSuggestion = null,
      favorites = []
    } = body

    // Machine learning: Analyze user patterns from favorites
    const userPatterns = analyzeFavoritePatterns(favorites)
    
    // Generate AI suggestion using existing working method
    return await generateCoupleSuggestions({
      userId,
      partnerA,
      partnerB,
      heatLevel,
      suggestionType,
      preferences: [],
      boundaries: []
    })

  } catch (error) {
    console.error('Error in suggestions API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function generateBoudoirSuggestions({
  userId,
  category,
  intensity,
  blueprint,
  count
}: {
  userId: string
  category: string
  intensity: string
  blueprint: string
  count: number
}) {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not configured')
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `Generate ${count} intimate ${category} suggestions for a couple. 
    
Context:
- Category: ${category}
- Intensity level: ${intensity}
- Erotic blueprint: ${blueprint}
- Target audience: Consenting adults in committed relationships

Requirements:
- Tasteful and respectful
- Specific to the ${category} category
- Appropriate for ${intensity} intensity level
- Consider ${blueprint} blueprint preferences
- Include practical tips
- Focus on connection and intimacy

Format each suggestion as:
Title: [Creative title]
Description: [2-3 sentences describing the activity]
Duration: [Estimated time]
Tips: [2-3 practical tips]

Generate ${count} unique suggestions.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response into structured suggestions
    const suggestions = parseBoudoirResponse(text, category, intensity)

    return NextResponse.json({
      success: true,
      suggestions,
      metadata: {
        category,
        intensity,
        blueprint,
        count: suggestions.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Boudoir suggestion error:', error)
    
    // Return fallback suggestions
    const fallbackSuggestions = generateFallbackBoudoirSuggestions(category, intensity, count)
    
    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      fallback: true
    })
  }
}

async function generateCoupleSuggestions({
  userId,
  partnerA,
  partnerB,
  heatLevel,
  suggestionType,
  context,
  preferences,
  boundaries
}: {
  userId: string
  partnerA: any
  partnerB: any
  heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild'
  suggestionType: 'daily_spark' | 'conversation' | 'activity' | 'fantasy' | 'game'
  context?: string
  preferences: string[]
  boundaries: string[]
}) {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not configured')
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = buildSuggestionPrompt({
      userId,
      partnerA,
      partnerB,
      heatLevel,
      suggestionType,
      context,
      preferences,
      boundaries
    })

    const result = await model.generateContent(INTIMACY_COACH_PROMPT + '\n\n' + prompt)
    const response = await result.response
    const suggestion = response.text()

    const enhancedSuggestion = enhanceSuggestion(suggestion, {
      partnerA,
      partnerB,
      heatLevel,
      suggestionType
    })

    return NextResponse.json({
      success: true,
      suggestion: enhancedSuggestion,
      metadata: {
        partnerTypes: `${partnerA.primaryType} + ${partnerB.primaryType}`,
        heatLevel,
        suggestionType,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Couple suggestion error:', error)
    
    const fallbackSuggestion = getFallbackSuggestion(suggestionType)
    
    return NextResponse.json({
      success: true,
      suggestion: fallbackSuggestion,
      fallback: true
    })
  }
}

function buildSuggestionPrompt({
  userId,
  partnerA,
  partnerB,
  heatLevel,
  suggestionType,
  context,
  preferences,
  boundaries
}: SuggestionRequest): string {
  if (!partnerA || !partnerB) {
    return `Generate a ${suggestionType} suggestion for a couple. Focus on connection and intimacy.`
  }

  let prompt = `Generate a ${suggestionType} suggestion for a couple with these Blueprints:

Partner A: Primary ${partnerA.primaryType} (${partnerA.scores[partnerA.primaryType]}%), Secondary ${partnerA.secondaryType} (${partnerA.scores[partnerA.secondaryType]}%)
Partner B: Primary ${partnerB.primaryType} (${partnerB.scores[partnerB.primaryType]}%), Secondary ${partnerB.secondaryType} (${partnerB.scores[partnerB.secondaryType]}%)

Heat Level: ${heatLevel}
`

  if (context) {
    prompt += `Context: ${context}\n`
  }

  if (preferences && preferences.length > 0) {
    prompt += `They enjoy: ${preferences.join(', ')}\n`
  }

  if (boundaries && boundaries.length > 0) {
    prompt += `Avoid: ${boundaries.join(', ')}\n`
  }

  // Add specific instructions based on suggestion type
  switch (suggestionType) {
    case 'daily_spark':
      prompt += `
Create a brief, actionable suggestion (2-3 sentences) they can try today. Focus on their Blueprint compatibility and bridge any differences. Make it specific and doable.`
      break
    
    case 'conversation':
      prompt += `
Suggest a meaningful conversation starter or question that will help them connect emotionally and understand each other's desires better.`
      break
    
    case 'activity':
      prompt += `
Suggest a specific activity or experience they can do together that honors both their Blueprint types.`
      break
    
    case 'fantasy':
      prompt += `
Create a tasteful fantasy scenario that incorporates elements appealing to both their Blueprint types. Keep it suggestive but not explicit.`
      break
    
    case 'game':
      prompt += `
Suggest a playful game or challenge they can try together that incorporates their Blueprint preferences.`
      break
  }

  return prompt
}

function enhanceSuggestion(suggestion: string, metadata: any) {
  // Add emoji and formatting to make suggestions more engaging
  const emojis = {
    sensual: '🕯️',
    sexual: '🔥',
    energetic: '⚡',
    kinky: '🎭',
    shapeshifter: '🌈'
  }

  const primaryEmoji = emojis[metadata.partnerA.primaryType as keyof typeof emojis] || '💕'

  return {
    content: suggestion,
    emoji: primaryEmoji,
    title: generateTitle(metadata.suggestionType),
    estimatedTime: estimateTime(suggestion),
    blueprintTags: [metadata.partnerA.primaryType, metadata.partnerB.primaryType]
  }
}

function generateTitle(suggestionType: string): string {
  const titles = {
    daily_spark: 'Today\'s Spark',
    conversation: 'Deep Connection',
    activity: 'Try Together',
    fantasy: 'Imagine This',
    game: 'Play Time'
  }
  return titles[suggestionType as keyof typeof titles] || 'Suggestion'
}

function estimateTime(suggestion: string): string {
  const wordCount = suggestion.split(' ').length
  if (wordCount < 50) return '5-10 min'
  if (wordCount < 100) return '15-30 min'
  if (wordCount < 150) return '30-60 min'
  return '1+ hour'
}

function parseBoudoirResponse(text: string, category: string, intensity: string) {
  // Simple parsing - in production, this would be more sophisticated
  const suggestions = []
  const lines = text.split('\n').filter(line => line.trim())
  
  let currentSuggestion: any = {}
  
  for (const line of lines) {
    if (line.startsWith('Title:')) {
      if (currentSuggestion.title) {
        suggestions.push(currentSuggestion)
        currentSuggestion = {}
      }
      currentSuggestion.title = line.replace('Title:', '').trim()
      currentSuggestion.id = `${category}_${Date.now()}_${suggestions.length}`
      currentSuggestion.category = category
      currentSuggestion.intensity = intensity
    } else if (line.startsWith('Description:')) {
      currentSuggestion.description = line.replace('Description:', '').trim()
    } else if (line.startsWith('Duration:')) {
      currentSuggestion.duration = line.replace('Duration:', '').trim()
    } else if (line.startsWith('Tips:')) {
      currentSuggestion.tips = [line.replace('Tips:', '').trim()]
    } else if (line.startsWith('-') && currentSuggestion.tips) {
      currentSuggestion.tips.push(line.replace('-', '').trim())
    }
  }
  
  if (currentSuggestion.title) {
    suggestions.push(currentSuggestion)
  }
  
  return suggestions.length > 0 ? suggestions : generateFallbackBoudoirSuggestions(category, intensity, 1)
}

function generateFallbackBoudoirSuggestions(category: string, intensity: string, count: number) {
  const suggestions = []
  
  for (let i = 0; i < count; i++) {
    suggestions.push({
      id: `${category}_fallback_${Date.now()}_${i}`,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Experience`,
      description: `A thoughtfully crafted ${category} experience designed to bring you closer together. This ${intensity} level activity focuses on connection and intimacy.`,
      category,
      intensity,
      duration: '15-30 minutes',
      tips: [
        'Take your time and communicate openly',
        'Focus on what feels good for both of you',
        'Remember that consent is ongoing'
      ]
    })
  }
  
  return suggestions
}

function getFallbackSuggestion(suggestionType: string) {
  const fallbacks = {
    daily_spark: {
      content: "Take turns giving each other a 5-minute shoulder massage while sharing one thing you appreciate about your partner today.",
      emoji: '💆‍♀️',
      title: 'Today\'s Spark',
      estimatedTime: '10 min',
      blueprintTags: ['sensual', 'sexual']
    },
    conversation: {
      content: "Ask your partner: 'What's one way I could make you feel more desired this week?' Really listen to their answer without getting defensive.",
      emoji: '💬',
      title: 'Deep Connection',
      estimatedTime: '15 min',
      blueprintTags: ['energetic', 'sensual']
    },
    activity: {
      content: "Create a cozy atmosphere with dimmed lights and soft music, then spend 20 minutes just holding each other and breathing together.",
      emoji: '🕯️',
      title: 'Try Together',
      estimatedTime: '20 min',
      blueprintTags: ['sensual', 'energetic']
    }
  }

  return fallbacks[suggestionType as keyof typeof fallbacks] || fallbacks.daily_spark
}

// Machine Learning: Analyze patterns from user feedback
function analyzeFavoritePatterns(favorites: any[]) {
  if (!favorites || favorites.length === 0) {
    return {
      preferredCategories: [],
      preferredTimes: [],
      preferredEnergy: 'medium',
      patternConfidence: 0
    }
  }

  // Analyze category preferences
  const categoryMap: Record<string, number> = {}
  const timeMap: Record<string, number> = {}
  const energyMap: Record<string, number> = {}

  favorites.forEach(fav => {
    // Count categories
    if (fav.category) {
      categoryMap[fav.category] = (categoryMap[fav.category] || 0) + 1
    }
    
    // Count time preferences
    if (fav.estimatedTime) {
      timeMap[fav.estimatedTime] = (timeMap[fav.estimatedTime] || 0) + 1
    }
    
    // Analyze contextual patterns
    if (fav.contextualData?.timeOfDay) {
      energyMap[fav.contextualData.timeOfDay] = (energyMap[fav.contextualData.timeOfDay] || 0) + 1
    }
  })

  // Extract top preferences
  const preferredCategories = Object.entries(categoryMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat)

  const preferredTimes = Object.entries(timeMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([time]) => time)

  const mostActiveTime = Object.entries(energyMap)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'evening'

  const preferredEnergy = mostActiveTime === 'morning' ? 'high' : 
                         mostActiveTime === 'afternoon' ? 'medium' : 'low'

  return {
    preferredCategories,
    preferredTimes,
    preferredEnergy,
    patternConfidence: Math.min(favorites.length / 10, 1) // 0-1 confidence
  }
} 