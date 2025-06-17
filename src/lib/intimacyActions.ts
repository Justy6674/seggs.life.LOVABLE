import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, doc, getDoc, setDoc, addDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import type { User } from './firebase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface IntimacyCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isNew?: boolean;
}

export interface IntimacyAction {
  id: string;
  categoryId: string;
  content: string;
  primaryBlueprint: string;
  secondaryBlueprint?: string;
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  createdAt: Date;
  lastUsed?: Date;
}

export interface BlueprintInsight {
  combination: string;
  strengths: string[];
  challenges: string[];
  suggestions: string[];
  specificActivities: string[];
}

export const INTIMACY_CATEGORIES: IntimacyCategory[] = [
  { id: 'naughty_texts', name: 'Naughty Texts', emoji: '💬', description: 'Flirty messages to send your partner' },
  { id: 'naughty_pictures', name: 'Naughty Pictures', emoji: '📸', description: 'Photo ideas to tease and delight' },
  { id: 'naughty_games', name: 'Naughty Game Ideas', emoji: '🎲', description: 'Playful games for couples' },
  { id: 'fantasy_sharing', name: 'I Had a Fantasy...', emoji: '🔥', description: 'Share your desires safely' },
  { id: 'naughty_outfits', name: 'Naughty Outfits', emoji: '👗', description: 'Clothing ideas to surprise your partner' },
  { id: 'truth_or_dare', name: 'Naughty Truth or Dare', emoji: '🃏', description: 'Intimate questions and dares' },
  { id: 'daily_thoughts', name: 'Something I Thought About Today', emoji: '💡', description: 'Share what crossed your mind' },
  { id: 'new_ideas', name: 'I Have an Idea...', emoji: '🌹', description: 'Suggest something new to try' },
  { id: 'date_nights', name: 'Date Night Plans', emoji: '🥂', description: 'Romantic evening ideas' },
  { id: 'voyeur_exhibitionist', name: 'Voyeur & Exhibitionist', emoji: '👀', description: 'Watching and being watched scenarios' },
  { id: 'bdsm_inspiration', name: 'BDSM Inspiration', emoji: '⛓️', description: 'Power play and kink ideas' },
  { id: 'sexy_movies', name: 'Sexy Movie Ideas', emoji: '🎥', description: 'Films to watch together' },
  { id: 'erotic_podcasts', name: 'Intimacy Podcasts', emoji: '🎙️', description: 'Audio content for couples' },
  { id: 'roleplay_ideas', name: 'Role-play Ideas', emoji: '🎭', description: 'Characters and scenarios to explore', isNew: true },
  { id: 'naughty_toys', name: 'Naughty Toy Suggestions', emoji: '🧸', description: 'Product recommendations for play', isNew: true },
  { id: 'want_to_try', name: 'I Want to Try... Up for It?', emoji: '🙋', description: 'Propose new experiences', isNew: true },
  { id: 'want_to_do', name: 'I Want to Do to You...', emoji: '💋', description: 'Express your desires', isNew: true },
  { id: 'self_pleasure', name: 'Self-Pleasure Notifications', emoji: '💦', description: 'Share intimate moments', isNew: true },
  { id: 'simple_tonight', name: 'Can We Just ___ Tonight?', emoji: '🛋️', description: 'Simple connection requests', isNew: true },
  { id: 'sensual_touch', name: 'Sensual Touch & Massage', emoji: '🤲', description: 'Massage and touch techniques to explore', isNew: true }
];

export class IntimacyActionsService {
  /**
   * Generate personalised intimacy actions using blueprint types directly
   * Simplified method for dashboard use
   */
  static async generateActions(
    categoryId: string,
    primaryBlueprint: string,
    partnerBlueprint?: string,
    count: number = 5
  ): Promise<any[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const category = INTIMACY_CATEGORIES.find(cat => cat.id === categoryId);
      if (!category) throw new Error('Category not found');

      const partnerBlueprintType = partnerBlueprint || primaryBlueprint;
      const combination = `${primaryBlueprint} + ${partnerBlueprintType}`;

      const systemPrompt = `You are Seggsy, a sophisticated intimacy coach creating personalized suggestions for couples based on their Erotic Blueprint combination.

EROTIC BLUEPRINTS:
- Energetic: Turned on by anticipation, tease, space, mental foreplay, and slow energy build-up
- Sensual: Needs all 5 senses engaged, ambiance, emotional connection, comfort, and slow touch
- Sexual: Direct, passionate, visual, physical, genital-focused, and straightforward approach  
- Kinky: Psychological play, power dynamics, taboo scenarios, rules, and boundary exploration
- Shapeshifter: Variety, change, adapts to different moods, enjoys all blueprint types

BLUEPRINT COMBINATION: ${combination}
This couple brings together ${primaryBlueprint} and ${partnerBlueprintType} energies. Consider:
- How these blueprints naturally complement each other
- Where they need bridging or creative solutions
- Language that resonates with both types
- Activities that honor both partners' core desires

CATEGORY: ${category.name} - ${category.description}

GUIDELINES:
- Create tasteful, mature, relationship-focused suggestions
- Use sophisticated, exciting language that feels personally crafted
- Make suggestions actionable with clear next steps
- Include variety for different energy levels and moods
- Consider real-life constraints (time, energy, privacy)
- Make each suggestion feel perfect for this specific combination

Generate ${count} specific suggestions for "${category.name}" tailored to a ${combination} couple.

For each suggestion, format as JSON:
{
  "id": "unique_id",
  "action": "Brief compelling title",
  "description": "2-3 sentences explaining the activity and why it works for this combination",
  "estimatedTime": "5-15 min" or "30-60 min" etc,
  "heatLevel": "sweet" | "flirty" | "spicy" | "wild",
  "emoji": "relevant emoji",
  "blueprintReason": "One sentence explaining why this is perfect for ${primaryBlueprint} + ${partnerBlueprintType}"
}

Return ONLY a JSON array of ${count} suggestions, no other text.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse as JSON first
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          return suggestions.map((s: any, index: number) => ({
            ...s,
            id: s.id || `${categoryId}_${Date.now()}_${index}`,
            categoryId
          }));
        }
      } catch (parseError) {
        console.log('JSON parse failed, using text parsing fallback');
      }

      // Fallback: parse as text
      const suggestions = text
        .split('\n')
        .filter(line => line.trim() && /^\d+/.test(line.trim()))
        .map((line, index) => {
          const suggestion = line.replace(/^\d+\.\s*/, '').trim();
          return {
            id: `${categoryId}_${Date.now()}_${index}`,
            action: suggestion,
            description: suggestion,
            estimatedTime: "15-30 min",
            heatLevel: "flirty" as const,
            emoji: category.emoji,
            blueprintReason: `Tailored for your ${combination} combination`,
            categoryId
          };
        })
        .filter(suggestion => suggestion.action.length > 0);

      return suggestions.slice(0, count);
    } catch (error) {
      console.error('Error generating AI actions:', error);
      return this.getFallbackActions(categoryId, count).map((action, index) => ({
        id: `${categoryId}_fallback_${index}`,
        action,
        description: action,
        estimatedTime: "15-30 min",
        heatLevel: "flirty" as const,
        emoji: INTIMACY_CATEGORIES.find(c => c.id === categoryId)?.emoji || '💕',
        blueprintReason: `Crafted for your unique combination`,
        categoryId
      }));
    }
  }

  /**
   * Get cached actions from Firestore or generate new ones
   */
  static async getActionsForCategory(
    categoryId: string,
    user1: User,
    user2: User
  ): Promise<any[]> {
    try {
      const cacheKey = `${categoryId}_${user1.eroticBlueprintPrimary}_${user2.eroticBlueprintPrimary}`;
      const cacheDoc = await getDoc(doc(db, 'intimacy_cache', cacheKey));

      if (cacheDoc.exists()) {
        const cached = cacheDoc.data();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // If cache is less than a week old, use it
        if (cached.createdAt.toDate() > weekAgo) {
          return cached.actions;
        }
      }

      // Generate new actions and cache them
      const newActions = await this.generateActions(
        categoryId, 
        user1.eroticBlueprintPrimary || 'energetic', 
        user2.eroticBlueprintPrimary || 'energetic'
      );
      
      await setDoc(doc(db, 'intimacy_cache', cacheKey), {
        actions: newActions,
        createdAt: new Date(),
        categoryId,
        user1Blueprint: user1.eroticBlueprintPrimary,
        user2Blueprint: user2.eroticBlueprintPrimary
      });

      return newActions;
    } catch (error) {
      console.error('Error getting actions for category:', error);
      return this.getFallbackActions(categoryId).map((action, index) => ({
        id: `${categoryId}_fallback_${index}`,
        action,
        description: action,
        estimatedTime: "15-30 min",
        heatLevel: "flirty" as const,
        emoji: INTIMACY_CATEGORIES.find(c => c.id === categoryId)?.emoji || '💕',
        blueprintReason: `Crafted for your unique combination`,
        categoryId
      }));
    }
  }

  /**
   * Generate blueprint combination analysis
   */
  static async generateBlueprintAnalysis(user1: User, user2: User): Promise<BlueprintInsight> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const user1Blueprint = user1.eroticBlueprintPrimary || 'energetic';
      const user2Blueprint = user2.eroticBlueprintPrimary || 'energetic';
      const combination = `${user1Blueprint} + ${user2Blueprint}`;

      const systemPrompt = `You are an expert relationship coach analysing Erotic Blueprint compatibility.

Partner A: ${user1Blueprint} blueprint (${user1.displayName})
Partner B: ${user2Blueprint} blueprint (${user2.displayName})

EROTIC BLUEPRINTS:
- Energetic: Anticipation, tease, energy exchange, space, slow build-up
- Sensual: Senses, touch, comfort, setting, emotional connection
- Sexual: Direct, visual, physical, straightforward, genital-focused  
- Kinky: Taboo, power play, rules, boundaries, psychological games
- Shapeshifter: Variety, change, all types at different times

Provide a comprehensive analysis in JSON format:
{
  "combination": "${combination}",
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "specificActivities": ["activity1", "activity2", "activity3", "activity4", "activity5"]
}

Focus on:
- Natural compatibility areas
- Potential friction points and how to navigate them
- Specific strategies that honour both blueprints
- Practical activities they can try together

Keep advice tasteful, actionable, and relationship-focused.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return parsed as BlueprintInsight;
      } catch (parseError) {
        console.error('Error parsing AI analysis:', parseError);
        return this.getFallbackAnalysis(user1Blueprint, user2Blueprint);
      }
    } catch (error) {
      console.error('Error generating blueprint analysis:', error);
      return this.getFallbackAnalysis(user1.eroticBlueprintPrimary || 'energetic', user2.eroticBlueprintPrimary || 'energetic');
    }
  }

  /**
   * Cache and retrieve blueprint analysis
   */
  static async getBlueprintAnalysis(user1: User, user2: User): Promise<BlueprintInsight> {
    try {
      const user1Blueprint = user1.eroticBlueprintPrimary || 'energetic';
      const user2Blueprint = user2.eroticBlueprintPrimary || 'energetic';
      const cacheKey = `analysis_${user1Blueprint}_${user2Blueprint}`;
      const cacheDoc = await getDoc(doc(db, 'blueprint_analysis', cacheKey));

      if (cacheDoc.exists()) {
        const cached = cacheDoc.data();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        // If cache is less than a month old, use it
        if (cached.createdAt.toDate() > monthAgo) {
          return cached.analysis;
        }
      }

      // Generate new analysis and cache it
      const newAnalysis = await this.generateBlueprintAnalysis(user1, user2);
      
      await setDoc(doc(db, 'blueprint_analysis', cacheKey), {
        analysis: newAnalysis,
        createdAt: new Date(),
        user1Blueprint,
        user2Blueprint
      });

      return newAnalysis;
    } catch (error) {
      console.error('Error getting blueprint analysis:', error);
      return this.getFallbackAnalysis(user1.eroticBlueprintPrimary || 'energetic', user2.eroticBlueprintPrimary || 'energetic');
    }
  }

  /**
   * Log action usage for analytics
   */
  static async logActionUsage(categoryId: string, actionContent: string, userId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'action_usage'), {
        categoryId,
        actionContent,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging action usage:', error);
    }
  }

  /**
   * Check if user needs blueprint reassessment
   */
  static shouldPromptReassessment(user: User): boolean {
    if (!user.onboardingCompletedAt) return false;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return user.onboardingCompletedAt < sixMonthsAgo;
  }

  /**
   * Fallback actions when AI fails
   */
  private static getFallbackActions(categoryId: string, count: number = 5): string[] {
    const fallbacks: Record<string, string[]> = {
      naughty_texts: [
        "Send a message about what you're thinking about right now",
        "Text them about the last time you felt really connected",
        "Share a memory from your relationship that makes you smile",
        "Tell them one thing you love about how they make you feel",
        "Send a sweet message about what you're looking forward to tonight"
      ],
      date_nights: [
        "Plan a cozy evening at home with their favourite meal",
        "Create a playlist of songs that remind you of special moments",
        "Set up a romantic atmosphere with candles and soft lighting",
        "Plan a walk somewhere beautiful you both enjoy",
        "Suggest trying a new activity you've both been curious about"
      ],
      new_ideas: [
        "Suggest a new way to show appreciation for each other",
        "Propose trying a different approach to your usual routine",
        "Share an idea for deepening your emotional connection",
        "Suggest exploring a new form of physical affection",
        "Propose a way to be more present with each other"
      ]
    };

    const categoryFallbacks = fallbacks[categoryId] || fallbacks.new_ideas;
    return categoryFallbacks.slice(0, count);
  }

  /**
   * Fallback blueprint analysis
   */
  private static getFallbackAnalysis(blueprint1: string, blueprint2: string): BlueprintInsight {
    return {
      combination: `${blueprint1} + ${blueprint2}`,
      strengths: [
        "You both bring unique perspectives to intimacy",
        "Your different approaches can create exciting variety",
        "You can learn and grow from each other's preferences"
      ],
      challenges: [
        "Different pacing preferences may require patience",
        "Communication about needs and desires is essential",
        "Finding middle ground between different styles"
      ],
      suggestions: [
        "Take turns leading intimate experiences",
        "Communicate openly about what feels good",
        "Explore activities that blend both of your preferences",
        "Be patient as you learn each other's languages"
      ],
      specificActivities: [
        "Plan intimate evenings that incorporate both of your styles",
        "Practice expressing your desires clearly and kindly",
        "Try new forms of physical affection",
        "Create rituals that honour both of your needs",
        "Set aside time for regular check-ins about your relationship"
      ]
    };
  }
} 