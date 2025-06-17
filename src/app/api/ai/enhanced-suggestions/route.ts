import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, userId, partnerId, excludeHistory, preferredCategories, avoidCategories } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    // Build enhanced system message for better AI responses
    const systemMessage = `You are an expert intimate relationship coach and suggestion generator for couples. Your role is to create personalized, tasteful, and exciting intimate suggestions that:

1. RESPECT BOUNDARIES: Always suggest consensual, respectful activities
2. MATCH BLUEPRINTS: Tailor suggestions to their specific intimate blueprints
3. FIT CONTEXT: Consider time, energy, mood, and situation
4. PROVIDE VALUE: Focus on deepening connection and intimacy
5. BE SPECIFIC: Give clear, actionable instructions
6. INCLUDE BENEFITS: Explain why this will help their relationship

BLUEPRINT GUIDANCE:
- Energetic: Focus on anticipation, teasing, space between bodies, building tension
- Sensual: Emphasize ambiance, all five senses, luxury, taking time
- Sexual: Direct physical appreciation, seeing bodies, straightforward pleasure
- Kinky: Power dynamics, roleplay, taboo elements, psychological play
- Shapeshifter: Variety, surprise, combining multiple blueprint elements

HEAT LEVELS:
- Sweet: Romantic, gentle, emotionally connecting
- Flirty: Playful teasing, light physical touch, building attraction
- Spicy: More intense physical connection, passionate moments
- Wild: Adventurous, uninhibited, deeply intimate

Always return a valid JSON object with the exact structure requested.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let suggestion;
    try {
      suggestion = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    if (!suggestion.title || !suggestion.content) {
      throw new Error('AI response missing required fields');
    }

    // Enhance suggestion with additional fields if missing
    suggestion = {
      title: suggestion.title,
      content: suggestion.content,
      emoji: suggestion.emoji || '💕',
      category: suggestion.category || 'Connection',
      subcategory: suggestion.subcategory || 'General',
      heatLevel: suggestion.heatLevel || 'flirty',
      instructions: Array.isArray(suggestion.instructions) ? suggestion.instructions : [],
      tips: Array.isArray(suggestion.tips) ? suggestion.tips : [],
      benefits: Array.isArray(suggestion.benefits) ? suggestion.benefits : ['Deeper connection'],
      variations: Array.isArray(suggestion.variations) ? suggestion.variations : [],
      requiredItems: Array.isArray(suggestion.requiredItems) ? suggestion.requiredItems : [],
      location: suggestion.location || 'anywhere',
      preparationTime: suggestion.preparationTime || '0 min'
    };

    return NextResponse.json({ 
      success: true, 
      suggestion,
      metadata: {
        model: completion.model,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Enhanced suggestions API error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service configuration error' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate suggestion' 
    }, { status: 500 });
  }
} 