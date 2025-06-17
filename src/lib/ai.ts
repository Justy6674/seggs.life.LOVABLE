import { GoogleGenerativeAI } from '@google/generative-ai';
import type { User, Couple } from './firebase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface PromptRequest {
  mood?: string;
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  relationshipType: 'sexual' | 'asexual' | 'mixed';
  boundaries?: string[];
  previousPrompts?: string[];
  relationshipStage?: 'new' | 'established' | 'long-term';
  healthContext?: string;
}

export class AIService {
  static async generatePrompt(request: PromptRequest): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = `You are an AI assistant specialized in creating intimate, thoughtful connection prompts for couples. Your role is to generate personalised suggestions that help partners deepen their emotional and physical intimacy while respecting their boundaries and preferences.

IMPORTANT GUIDELINES:
- Always respect the specified boundaries and intensity level
- Keep prompts tasteful, mature, and relationship-focused
- For asexual relationships, focus on emotional intimacy, communication, and non-sexual connection
- For mixed relationships, include both sexual and non-sexual options
- Ensure prompts are actionable and specific
- Avoid explicit sexual content - keep suggestions sophisticated and mature
- Include prompts that work for all relationship orientations (straight, gay, lesbian, etc.)
- Consider the relationship stage and current mood

INTENSITY LEVELS:
- Sweet: Gentle, romantic, emotional connection
- Flirty: Playful, teasing, light romantic tension
- Spicy: Passionate, intimate, sensual (but not explicit)
- Wild: Adventurous, bold, intense connection (but still tasteful)

RELATIONSHIP TYPES:
- Sexual: Include physical intimacy suggestions appropriate to intensity
- Asexual: Focus on emotional, intellectual, and non-sexual physical connection
- Mixed: Provide options that work for varying comfort levels

Generate a single, specific prompt based on the provided parameters. The prompt should be 1-2 sentences and actionable.`;

      const userPrompt = `Generate a connection prompt with these parameters:
- Mood: ${request.mood || 'not specified'}
- Intensity Level: ${request.intensityLevel}
- Relationship Type: ${request.relationshipType}
- Boundaries to avoid: ${request.boundaries?.join(', ') || 'none specified'}
- Relationship Stage: ${request.relationshipStage || 'established'}
- Previous prompts to avoid repeating: ${request.previousPrompts?.slice(-5).join('; ') || 'none'}

Please generate a thoughtful, actionable prompt that respects these parameters.`;

      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      // Clean up the response
      return text.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      // Fallback prompts based on parameters
      return AIService.getFallbackPrompt(request);
    }
  }

  static getFallbackPrompt(request: PromptRequest): string {
    const { mood, intensityLevel, relationshipType } = request;

    const prompts = {
      sweet: {
        sexual: [
          "Share three things you love most about your partner while holding their hand",
          "Create a playlist of songs that remind you of special moments together",
          "Write a heartfelt note expressing what your partner means to you"
        ],
        asexual: [
          "Plan a cosy evening activity you both enjoy and take turns sharing favourite memories",
          "Create a shared bucket list of experiences you want to have together",
          "Have a deep conversation about your dreams and aspirations while cuddling"
        ],
        mixed: [
          "Surprise your partner with their favourite treat and spend quality time together",
          "Share what you're most grateful for about your relationship",
          "Plan a special date that incorporates both of your favourite activities"
        ]
      },
      flirty: {
        sexual: [
          "Send your partner a playful text about what you're looking forward to when you see them",
          "Plan a surprise romantic gesture that will make them smile",
          "Share a cheeky compliment about something you find irresistible about them"
        ],
        asexual: [
          "Send your partner a sweet message about why they make you happy",
          "Plan a fun surprise activity that shows how well you know them",
          "Share an inside joke or memory that always makes you both laugh"
        ],
        mixed: [
          "Plan a playful activity that you can enjoy together this evening",
          "Send your partner a message that will brighten their day",
          "Suggest trying something new together that you've both been curious about"
        ]
      },
      spicy: {
        sexual: [
          "Plan an intimate evening that focuses on exploring new ways to connect",
          "Share a fantasy or desire you'd like to explore together",
          "Create a romantic atmosphere for an evening of passionate connection"
        ],
        asexual: [
          "Plan an intense emotional bonding experience like deep conversation or shared vulnerability",
          "Create an atmosphere for deep intimacy through meaningful touch and presence",
          "Share your deepest thoughts and feelings in a safe, intimate setting"
        ],
        mixed: [
          "Plan an evening focused on the type of intimacy you both crave most",
          "Create space for passionate connection in whatever way feels right for you both",
          "Explore a new level of vulnerability and openness with each other"
        ]
      },
      wild: {
        sexual: [
          "Plan an adventurous intimate experience somewhere new or different",
          "Suggest trying something bold that you've both been curious about",
          "Create an evening of passionate exploration and new experiences"
        ],
        asexual: [
          "Plan an emotionally intense bonding experience like a deep sharing session",
          "Suggest a bold new adventure or activity you can experience together",
          "Create space for raw, honest vulnerability and emotional intensity"
        ],
        mixed: [
          "Plan an adventurous experience that pushes your comfort zones together",
          "Suggest exploring new dimensions of your connection and intimacy",
          "Create an intense bonding experience that feels exciting for both of you"
        ]
      }
    };

    const categoryPrompts = prompts[intensityLevel]?.[relationshipType] || prompts[intensityLevel]?.mixed || prompts.sweet.mixed;
    return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  }

  static async generateDailyPrompts(userData: User, coupleData: Couple, count: number = 3): Promise<string[]> {
    const prompts: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const request: PromptRequest = {
        intensityLevel: coupleData.sharedIntensityLevel,
        relationshipType: coupleData.sharedRelationshipType,
        boundaries: coupleData.sharedBoundaries,
        relationshipStage: this.determineRelationshipStage(coupleData),
        mood: userData.currentMood
      };

      const prompt = await this.generatePrompt(request);
      prompts.push(prompt);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return prompts;
  }

  private static determineRelationshipStage(coupleData: Couple): 'new' | 'established' | 'long-term' {
    const daysSinceCreated = Math.floor((Date.now() - coupleData.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated < 30) return 'new';
    if (daysSinceCreated < 365) return 'established';
    return 'long-term';
  }

  static async generateHealthPrompt(userData: User): Promise<string> {
    const healthPrompts = [
      "Check in with your partner about how you're both feeling about your sexual health and wellness",
      "Discuss any health goals you have as a couple and how you can support each other",
      "Share appreciation for how your partner takes care of their health and wellbeing",
      "Plan a wellness activity you can do together this week",
      "Have an open conversation about comfort levels and any health concerns"
    ];

    return healthPrompts[Math.floor(Math.random() * healthPrompts.length)];
  }

  static async generateThoughtBubblePrompt(mood?: string): Promise<string> {
    const thoughtPrompts = {
      loving: [
        "What's one thing about your partner that made you fall deeper in love recently?",
        "Share a secret wish you have for your relationship",
        "What's a memory with your partner that always makes you smile?"
      ],
      passionate: [
        "What's something about your partner that drives you wild?",
        "Share a desire you've been thinking about lately",
        "What's the most attractive thing your partner did recently?"
      ],
      thoughtful: [
        "What's something deep you've been thinking about regarding your relationship?",
        "Share a realization you've had about love or intimacy",
        "What's something you want your partner to know but haven't said yet?"
      ],
      default: [
        "What's on your mind about your partner right now?",
        "Share something you've been wanting to tell your partner",
        "What's a secret thought you have about your relationship?"
      ]
    };

    const prompts = thoughtPrompts[mood as keyof typeof thoughtPrompts] || thoughtPrompts.default;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
} 