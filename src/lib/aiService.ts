import { GoogleGenerativeAI } from '@google/generative-ai'
import type { User } from './firebase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface CouplesBlueprint {
  user1: {
    name: string
    primary: string
    secondary?: string
    scores: {
      energetic: number
      sensual: number
      sexual: number
      kinky: number
      shapeshifter: number
    }
  }
  user2: {
    name: string
    primary: string
    secondary?: string
    scores: {
      energetic: number
      sensual: number
      sexual: number
      kinky: number
      shapeshifter: number
    }
  }
}

export interface CouplesReport {
  welcomeMessage: string
  blueprintSummary: {
    user1Summary: string
    user2Summary: string
  }
  compatibility: {
    strengths: string[]
    challenges: string[]
    overlapAreas: string[]
  }
  actionableAdvice: {
    immediateSteps: string[]
    weeklyIdeas: string[]
    longTermGoals: string[]
  }
  personalisedPrompts: string[]
  nextSteps: string
}

export class AIService {
  static async generateCouplesReport(
    user1Data: User, 
    user2Data: User
  ): Promise<CouplesReport> {
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const blueprintData: CouplesBlueprint = {
      user1: {
        name: user1Data.displayName || 'Partner A',
        primary: user1Data.eroticBlueprintPrimary || 'unknown',
        secondary: user1Data.eroticBlueprintSecondary,
        scores: user1Data.eroticBlueprintScores || {
          energetic: 0, sensual: 0, sexual: 0, kinky: 0, shapeshifter: 0
        }
      },
      user2: {
        name: user2Data.displayName || 'Partner B',
        primary: user2Data.eroticBlueprintPrimary || 'unknown',
        secondary: user2Data.eroticBlueprintSecondary,
        scores: user2Data.eroticBlueprintScores || {
          energetic: 0, sensual: 0, sexual: 0, kinky: 0, shapeshifter: 0
        }
      }
    }

    const prompt = this.buildCouplesReportPrompt(blueprintData, user1Data, user2Data)
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseCouplesReport(text, blueprintData)
    } catch (error) {
      console.error('Error generating couples report:', error)
      return this.getFallbackReport(blueprintData)
    }
  }

  private static buildCouplesReportPrompt(
    blueprintData: CouplesBlueprint,
    user1Data: User,
    user2Data: User
  ): string {
    return `You are an expert relationship coach specialising in intimate connections and erotic blueprints. Create a warm, encouraging, and actionable couples compatibility report.

PARTNER DATA:
Partner 1 (${blueprintData.user1.name}):
- Primary Blueprint: ${blueprintData.user1.primary}
- Secondary Blueprint: ${blueprintData.user1.secondary || 'None strong'}
- Scores: ${JSON.stringify(blueprintData.user1.scores)}
- Relationship satisfaction: ${user1Data.sexLifeSatisfaction || 'Not provided'}/10
- Biggest challenges: ${user1Data.biggestChallenge || 'Not specified'}
- Improvement goals: ${user1Data.improvementGoals || 'Not specified'}

Partner 2 (${blueprintData.user2.name}):
- Primary Blueprint: ${blueprintData.user2.primary}
- Secondary Blueprint: ${blueprintData.user2.secondary || 'None strong'}
- Scores: ${JSON.stringify(blueprintData.user2.scores)}
- Relationship satisfaction: ${user2Data.sexLifeSatisfaction || 'Not provided'}/10
- Biggest challenges: ${user2Data.biggestChallenge || 'Not specified'}
- Improvement goals: ${user2Data.improvementGoals || 'Not specified'}

EROTIC BLUEPRINT REFERENCE:
- Energetic: Turned on by anticipation, tease, energy, space, slow build-up
- Sensual: Loves senses, touch, comfort, setting, emotional connection
- Sexual: Direct, visual, physical, straightforward, genital-focused
- Kinky: Taboo, power play, rules, boundaries, psychological games
- Shapeshifter: Variety, change, all of the above at different times

GENERATE A REPORT WITH THESE SECTIONS:

**WELCOME**
Warm congratulations on BOTH of you completing your individual assessments. Celebrate their commitment to personal growth and relationship development.

**YOUR BLUEPRINTS**
Brief, positive summary of each person's primary blueprint with what turns them on and their superpowers.

**WHERE YOU MATCH**
Areas of natural compatibility, shared interests, overlapping blueprint strengths.

**WHERE YOU'RE DIFFERENT**
Frame differences as opportunities, not problems. Show how they can complement each other.

**BRIDGE-BUILDING STRATEGIES**
3-4 specific, practical ways to honour both blueprints in intimate moments.

**TRY THIS WEEK**
2-3 concrete activities, games, or conversations they can try immediately.

**GROWTH OPPORTUNITIES**
Longer-term relationship goals and areas for exploration.

**NEXT STEPS**
Encourage ongoing check-ins, revisiting blueprints, using the app's features.

TONE: Warm, sex-positive, encouraging, non-judgmental, practical. Avoid clinical language. Make it feel like advice from a wise, supportive friend. Keep it engaging and actionable.

FORMAT: Use clear headings and bullet points. Make it scannable but warm.`
  }

  private static parseCouplesReport(aiText: string, blueprintData: CouplesBlueprint): CouplesReport {
    const sections = aiText.split('**')
    
    return {
      welcomeMessage: this.extractSection(aiText, 'WELCOME') || 
        `🎉 Congratulations! You've both completed your individual Erotic Blueprint assessments. This is a beautiful step towards deeper intimacy and understanding.`,
      
      blueprintSummary: {
        user1Summary: `${blueprintData.user1.name} is primarily ${blueprintData.user1.primary}${blueprintData.user1.secondary ? ` with ${blueprintData.user1.secondary} tendencies` : ''}.`,
        user2Summary: `${blueprintData.user2.name} is primarily ${blueprintData.user2.primary}${blueprintData.user2.secondary ? ` with ${blueprintData.user2.secondary} tendencies` : ''}.`
      },
      
      compatibility: {
        strengths: this.extractListItems(aiText, 'WHERE YOU MATCH') || [
          'Both value intimate connection and communication',
          'Shared commitment to growth and exploration'
        ],
        challenges: this.extractListItems(aiText, 'WHERE YOU ARE DIFFERENT') || [
          'Different pacing preferences',
          "Learning each others turn-on languages"
        ],
        overlapAreas: this.findBlueprintOverlaps(blueprintData)
      },
      
      actionableAdvice: {
        immediateSteps: this.extractListItems(aiText, 'TRY THIS WEEK') || [
          'Have an open conversation about your blueprint results',
          'Plan an intimate evening that honours both your styles'
        ],
        weeklyIdeas: this.extractListItems(aiText, 'BRIDGE-BUILDING') || [
          'Take turns planning dates in your style',
          'Practice communicating desires openly'
        ],
        longTermGoals: this.extractListItems(aiText, 'GROWTH OPPORTUNITIES') || [
          "Develop fluency in each others erotic languages",
          'Continue exploring and expanding your intimacy together',
          'Revisit your blueprints periodically as you grow'
        ]
      },
      
      personalisedPrompts: this.generatePersonalisedPrompts(blueprintData),
      
      nextSteps: this.extractSection(aiText, 'NEXT STEPS') || 
        'Continue using seggs.life for personalised prompts, weekly check-ins, and ongoing relationship growth. Your blueprints may evolve—revisit this assessment anytime!'
    }
  }

  private static extractSection(text: string, heading: string): string | null {
    const regex = new RegExp(`\\*\\*${heading}\\*\\*([^*]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  private static extractListItems(text: string, section: string): string[] {
    const sectionText = this.extractSection(text, section)
    if (!sectionText) return []
    
    return sectionText
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0)
  }

  private static findBlueprintOverlaps(blueprintData: CouplesBlueprint): string[] {
    const overlaps: string[] = []
    const { user1, user2 } = blueprintData
    
    if (user1.primary === user2.primary) {
      overlaps.push(`Both are primarily ${user1.primary} - strong natural compatibility`)
    }
    
    if (user1.primary === user2.secondary) {
      overlaps.push(`${user1.name}'s primary (${user1.primary}) matches ${user2.name}'s secondary`)
    }
    
    if (user2.primary === user1.secondary) {
      overlaps.push(`${user2.name}'s primary (${user2.primary}) matches ${user1.name}'s secondary`)
    }
    
    Object.keys(user1.scores).forEach(blueprint => {
      if (user1.scores[blueprint as keyof typeof user1.scores] > 15 && 
          user2.scores[blueprint as keyof typeof user2.scores] > 15) {
        overlaps.push(`Both score high in ${blueprint} blueprint`)
      }
    })
    
    return overlaps.length > 0 ? overlaps : ['Complementary differences that can enhance your connection']
  }

  private static generatePersonalisedPrompts(blueprintData: CouplesBlueprint): string[] {
    const prompts: string[] = []
    const { user1, user2 } = blueprintData
    
    if (user1.primary === 'energetic' || user2.primary === 'energetic') {
      prompts.push('Try a "no-touch" tease session - build anticipation through eye contact and words only')
    }
    
    if (user1.primary === 'sensual' || user2.primary === 'sensual') {
      prompts.push('Create a sensory experience together - think music, scents, textures, and lighting')
    }
    
    if (user1.primary === 'sexual' || user2.primary === 'sexual') {
      prompts.push('Have a direct conversation about what you find most visually arousing about each other')
    }
    
    if (user1.primary === 'kinky' || user2.primary === 'kinky') {
      prompts.push("Discuss one fantasy or roleplay scenario you'd both be curious to explore")
    }
    
    if (user1.primary === 'shapeshifter' || user2.primary === 'shapeshifter') {
      prompts.push('Plan a "mystery date" where you incorporate elements from all blueprint types')
    }
    
    prompts.push('Share one thing you learned about yourself from the blueprint quiz')
    prompts.push('Describe your ideal intimate evening using your blueprint language')
    
    return prompts
  }

  private static getFallbackReport(blueprintData: CouplesBlueprint): CouplesReport {
    return {
      welcomeMessage: `🎉 Welcome to your personalised couples report! You've each completed your individual Erotic Blueprint assessment - this is an exciting step towards deeper intimacy.`,
      
      blueprintSummary: {
        user1Summary: `${blueprintData.user1.name} is primarily ${blueprintData.user1.primary}${blueprintData.user1.secondary ? ` with ${blueprintData.user1.secondary} tendencies` : ''}.`,
        user2Summary: `${blueprintData.user2.name} is primarily ${blueprintData.user2.primary}${blueprintData.user2.secondary ? ` with ${blueprintData.user2.secondary} tendencies` : ''}.`
      },
      
      compatibility: {
        strengths: [
          'Shared commitment to intimacy and growth',
          "Willingness to understand each others desires",
          'Open communication about your relationship'
        ],
        challenges: [
          'Different blueprint styles may require compromise',
          "Learning each others turn-on languages"
        ],
        overlapAreas: this.findBlueprintOverlaps(blueprintData)
      },
      
      actionableAdvice: {
        immediateSteps: [
          'Discuss your blueprint results openly and curiously',
          'Plan an intimate experience that honours both your styles',
          'Practice using blueprint language to communicate desires'
        ],
        weeklyIdeas: [
          'Take turns planning dates in your preferred blueprint style',
          'Try one new activity outside both your comfort zones',
          "Check in weekly about whats working and what to adjust"
        ],
        longTermGoals: [
          "Develop fluency in each others erotic languages",
          'Continue exploring and expanding your intimacy together',
          'Revisit your blueprints periodically as you grow'
        ]
      },
      
      personalisedPrompts: this.generatePersonalisedPrompts(blueprintData),
      
      nextSteps: 'Use seggs.life for ongoing personalised prompts, weekly relationship check-ins, and continued growth. Remember - blueprints can evolve, so revisit this assessment anytime!'
    }
  }
} 