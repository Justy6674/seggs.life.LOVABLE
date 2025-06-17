// Gemini AI integration for generating prompts
// This would typically use the @google/generative-ai package

interface PromptRequest {
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  category: 'connection' | 'affection' | 'touch' | 'playful' | 'intimate' | 'shopping';
  relationshipStage?: 'new' | 'established' | 'long_term' | 'parents' | 'mature';
  boundaries?: string[];
  noGoList?: string[];
  previousPrompts?: string[]; // to avoid repetition
}

interface GeneratedPrompt {
  content: string;
  category: string;
  intensityLevel: string;
  tags: string[];
  estimatedDuration?: string; // "5 minutes", "evening activity", etc.
}

type PromptCategory = 'connection' | 'affection' | 'touch' | 'playful' | 'intimate' | 'shopping';
type IntensityLevel = 'sweet' | 'flirty' | 'spicy' | 'wild';

/**
 * Generates tasteful, AI-powered intimacy and connection prompts
 * Always filtered for appropriateness and respect
 */
export const generatePrompt = async (request: PromptRequest): Promise<GeneratedPrompt> => {
  // This is a placeholder implementation
  // In production, this would call the actual Gemini API
  
  const prompts: Record<IntensityLevel, Partial<Record<PromptCategory, string[]>>> = {
    sweet: {
      connection: [
        "Write a note about something you admire about your partner and leave it somewhere they'll find it tomorrow.",
        "Share three things that made you think of your partner today.",
        "Plan a surprise breakfast in bed with their favourite morning treats.",
        "Create a playlist of songs that remind you of special moments together."
      ],
      affection: [
        "Give your partner a 2-minute shoulder massage while they tell you about their day.",
        "Hold hands for the next 10 minutes while sharing your favourite memories together.",
        "Surprise your partner with their favourite warm drink and a genuine compliment."
      ],
      touch: [
        "Practice the 20-second hug - hold each other close and breathe together.",
        "Take turns giving each other a gentle face massage with a favourite moisturiser.",
        "Sit close together and trace letters on each other's back - guess the words."
      ]
    },
    flirty: {
      connection: [
        "Send your partner a photo of something that reminded you of them today, with a flirty message.",
        "Plan a surprise date night at home with candles, good music, and no phones.",
        "Write down three things you find irresistible about your partner and share them over dinner."
      ],
      affection: [
        "Give your partner a slow, intentional kiss when they least expect it.",
        "Compliment your partner on something specific about how they look today.",
        "Surprise your partner with a sensual slow dance in the living room."
      ],
      shopping: [
        "Choose a beautiful candle or massage oil together online for your next intimate evening.",
        "Pick out a piece of lingerie or sleepwear that you think your partner would feel amazing in.",
        "Browse and choose a luxury bath product to enjoy together during your next shared bath."
      ]
    },
    spicy: {
      intimate: [
        "Plan a sensual evening focusing entirely on your partner's pleasure and comfort.",
        "Create an atmosphere of complete intimacy with music, lighting, and undivided attention.",
        "Explore new ways to show physical appreciation while respecting all boundaries."
      ],
      playful: [
        "Design a private 'truth or dare' game with questions and activities you both feel excited about.",
        "Plan a surprise intimate picnic in your bedroom with favourite foods and playful conversation.",
        "Create a list of new experiences you'd both like to explore together when the mood is right."
      ]
    },
    wild: {
      intimate: [
        "Plan an adventure that pushes your comfort zones while respecting all established boundaries.",
        "Explore a new level of intimacy that you've both expressed interest in trying.",
        "Create an evening entirely dedicated to mutual exploration and pleasure."
      ]
    }
  };

  // Safe category access with fallback
  const levelPrompts = prompts[request.intensityLevel];
  const categoryPrompts = levelPrompts?.[request.category] || prompts.sweet.connection || [];
  const selectedPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)] || "Share a moment of appreciation with your partner.";

  return {
    content: selectedPrompt,
    category: request.category,
    intensityLevel: request.intensityLevel,
    tags: [request.category, request.intensityLevel],
    estimatedDuration: request.intensityLevel === 'sweet' ? '5-15 minutes' : 
                      request.intensityLevel === 'flirty' ? '15-30 minutes' :
                      request.intensityLevel === 'spicy' ? '30-60 minutes' : 
                      '60+ minutes'
  };
};

/**
 * Generates shopping suggestions that align with the user's comfort level
 * Always tasteful and optional
 */
export const generateShoppingSuggestion = async (request: PromptRequest): Promise<GeneratedPrompt> => {
  const suggestions: Record<IntensityLevel, string[]> = {
    sweet: [
      "Consider a luxurious massage oil with a scent you both enjoy for relaxing evenings together.",
      "A beautiful silk pillowcase set could add elegance and comfort to your intimate space.",
      "Quality candles with relaxing scents can create the perfect ambiance for connection."
    ],
    flirty: [
      "A sophisticated piece of sleepwear that makes you feel confident and beautiful.",
      "Consider a couples' massage course or book to learn new techniques together.",
      "Beautiful lingerie that makes you feel amazing - something that's your style and comfort level."
    ],
    spicy: [
      "Explore high-quality intimate accessories designed for couples who want to enhance their connection.",
      "Consider a weekend getaway to a romantic location where you can focus entirely on each other.",
      "A beautiful piece of jewelry that can be a private symbol between you and your partner."
    ],
    wild: [
      "Explore high-quality intimate accessories designed for couples who want to enhance their connection.",
      "Consider a weekend getaway to a romantic location where you can focus entirely on each other.",
      "A beautiful piece of jewelry that can be a private symbol between you and your partner."
    ]
  };

  const levelSuggestions = suggestions[request.intensityLevel];
  const selectedSuggestion = levelSuggestions[Math.floor(Math.random() * levelSuggestions.length)];

  return {
    content: selectedSuggestion,
    category: 'shopping',
    intensityLevel: request.intensityLevel,
    tags: ['shopping', request.intensityLevel, 'suggestion'],
    estimatedDuration: 'Browse when convenient'
  };
};

/**
 * Validates that generated content meets our tasteful, mature standards
 */
export const validatePromptContent = (content: string): boolean => {
  // Basic content validation (in production, this would be more sophisticated)
  const inappropriateTerms = ['explicit', 'graphic', 'crude']; // This would be a comprehensive list
  const lowercaseContent = content.toLowerCase();
  
  return !inappropriateTerms.some(term => lowercaseContent.includes(term));
};

/**
 * Filters prompts based on user boundaries and no-go list
 */
export const filterPromptByBoundaries = (prompt: GeneratedPrompt, boundaries: string[], noGoList: string[]): boolean => {
  const promptContent = prompt.content.toLowerCase();
  const promptTags = prompt.tags.map(tag => tag.toLowerCase());
  
  // Check if prompt conflicts with no-go list
  const conflictsWithNoGo = noGoList.some(item => 
    promptContent.includes(item.toLowerCase()) || 
    promptTags.includes(item.toLowerCase())
  );
  
  return !conflictsWithNoGo;
}; 