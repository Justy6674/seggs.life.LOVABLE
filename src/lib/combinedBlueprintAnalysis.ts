import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface BlueprintAnalysis {
  userBlueprint: string;
  partnerBlueprint: string;
  compatibility: number; // 1-100 scale
  whatWorks: string[];
  whatDoesnt: string[];
  howToProceed: string[];
  recommendedCategories: string[];
  conflictAreas: string[];
  strengths: string[];
}

export interface SuggestionRequest {
  category: string;
  eroticLevel: 'romantic' | 'soft' | 'daring' | 'erotic';
  userBlueprint: string;
  partnerBlueprint: string;
  timeAvailable?: string;
}

export const CATEGORIES = [
  'Foreplay & Buildup',
  'Touch & Massage', 
  'Oral Pleasure',
  'Role Playing',
  'Power Dynamics',
  'Sensory Play',
  'Position Exploration',
  'Toys & Props',
  'Location Adventures',
  'Dirty Talk',
  'Teasing & Denial',
  'Temperature Play',
  'Blindfolds & Restraints',
  'Body Worship',
  'Mutual Pleasure',
  'Quickies',
  'Extended Sessions',
  'Fantasy Fulfillment',
  'Exhibitionism',
  'Rough Play'
];

export class CombinedBlueprintAnalysis {
  
  static analyzeCompatibility(userBlueprint: string, partnerBlueprint: string): BlueprintAnalysis {
    const compatibilityMatrix: { [key: string]: { [key: string]: any } } = {
      energetic: {
        energetic: {
          compatibility: 95,
          whatWorks: [
            "Building anticipation together creates incredible magnetic tension",
            "Both love the mental game and psychological buildup",
            "Eye contact and verbal teasing amplify desire for both",
            "Space between bodies creates electric chemistry"
          ],
          whatDoesnt: [
            "Rushing straight to physical contact kills the energy",
            "Skipping the mental/emotional buildup disappoints both",
            "Being too predictable dampens excitement"
          ],
          howToProceed: [
            "Start with extended eye contact and verbal foreplay",
            "Build tension through teasing and anticipation",
            "Use space and near-misses to amplify desire",
            "Let the buildup be as important as the destination"
          ],
          recommendedCategories: ["Foreplay & Buildup", "Dirty Talk", "Teasing & Denial", "Role Playing"],
          conflictAreas: [],
          strengths: ["Incredible mental connection", "Natural chemistry", "Sustained excitement"]
        },
        sensual: {
          compatibility: 85,
          whatWorks: [
            "Energetic anticipation + sensual ambiance = perfect storm",
            "Building desire in beautiful settings amplifies both",
            "Slow, luxurious buildup satisfies both blueprints",
            "Combining mental tension with sensory pleasure"
          ],
          whatDoesnt: [
            "Rushing through the sensory experience",
            "Ignoring ambiance kills sensual pleasure",
            "Being too aggressive disrupts sensual flow"
          ],
          howToProceed: [
            "Create beautiful settings for your anticipation games",
            "Use sensory elements to build energetic tension",
            "Combine teasing with luxurious touch and ambiance",
            "Take time with each sensation while building desire"
          ],
          recommendedCategories: ["Sensory Play", "Touch & Massage", "Foreplay & Buildup", "Location Adventures"],
          conflictAreas: ["Pacing preferences"],
          strengths: ["Complementary styles", "Rich sensory experiences"]
        },
        sexual: {
          compatibility: 70,
          whatWorks: [
            "Energetic buildup leading to enthusiastic sexual expression",
            "Mental games that culminate in direct physical pleasure",
            "Teasing that ends in eager physical connection"
          ],
          whatDoesnt: [
            "Too much buildup without payoff frustrates sexual type",
            "Overly complex mental games when body wants direct pleasure",
            "Making things too complicated"
          ],
          howToProceed: [
            "Use energetic buildup but don't drag it out too long",
            "Build anticipation then deliver with enthusiastic physicality",
            "Balance mental games with direct body appreciation",
            "Let buildup enhance rather than replace physical pleasure"
          ],
          recommendedCategories: ["Body Worship", "Oral Pleasure", "Position Exploration", "Mutual Pleasure"],
          conflictAreas: ["Timing and directness"],
          strengths: ["Passion and intensity", "Great sexual chemistry"]
        },
        kinky: {
          compatibility: 90,
          whatWorks: [
            "Power dynamics amplify energetic tension beautifully",
            "Mental dominance games satisfy both blueprints",
            "Psychological control creates incredible anticipation",
            "Command and obedience games build electric energy"
          ],
          whatDoesnt: [
            "Vanilla approaches bore both partners",
            "Equal power dynamics miss the excitement",
            "Predictable patterns kill the thrill"
          ],
          howToProceed: [
            "Incorporate power exchange into your buildup",
            "Use commands and control to build anticipation",
            "Combine psychological dominance with energetic tension",
            "Make the mental game part of the power dynamic"
          ],
          recommendedCategories: ["Power Dynamics", "Role Playing", "Blindfolds & Restraints", "Teasing & Denial"],
          conflictAreas: [],
          strengths: ["Psychological connection", "Intense mental chemistry"]
        },
        shapeshifter: {
          compatibility: 80,
          whatWorks: [
            "Energetic anticipation adds excitement to variety",
            "Mental games enhance shapeshifter's exploration",
            "Buildup works with any experience shapeshifter wants"
          ],
          whatDoesnt: [
            "Being too locked into energetic-only approaches",
            "Not adapting to shapeshifter's changing desires"
          ],
          howToProceed: [
            "Use energetic buildup to enhance whatever experience is chosen",
            "Vary your approach while maintaining anticipation element",
            "Let shapeshifter lead while you add energetic tension"
          ],
          recommendedCategories: ["Fantasy Fulfillment", "Role Playing", "Location Adventures", "Toys & Props"],
          conflictAreas: ["Consistency vs variety"],
          strengths: ["Adaptable chemistry", "Exciting variety"]
        }
      },
      sensual: {
        energetic: {
          compatibility: 85,
          whatWorks: [
            "Sensual ambiance enhances energetic anticipation",
            "Beautiful settings amplify magnetic tension",
            "Luxury and buildup create perfect combination",
            "Sensory elements add richness to mental games"
          ],
          whatDoesnt: [
            "Rushing past the sensory experience",
            "Ignoring ambiance for pure mental focus",
            "Being too aggressive or forceful"
          ],
          howToProceed: [
            "Set beautiful scenes for your anticipation play",
            "Use sensory elements to build energetic tension",
            "Combine luxury with psychological buildup",
            "Let ambiance enhance the mental connection"
          ],
          recommendedCategories: ["Sensory Play", "Touch & Massage", "Location Adventures", "Foreplay & Buildup"],
          conflictAreas: ["Pacing preferences"],
          strengths: ["Rich sensory experiences", "Complementary styles"]
        },
        sensual: {
          compatibility: 95,
          whatWorks: [
            "Double the luxury creates incredible experiences",
            "Both appreciate beauty, ambiance, and sensory pleasure",
            "Natural understanding of each other's sensory needs",
            "Can create elaborate, beautiful intimate experiences together"
          ],
          whatDoesnt: [
            "Rushing or being crude kills the mood for both",
            "Uncomfortable settings ruin the experience",
            "Ignoring any of the five senses"
          ],
          howToProceed: [
            "Create elaborate, beautiful settings together",
            "Focus on all five senses in your intimate experiences",
            "Take time to savor each sensation and moment",
            "Invest in luxury items and beautiful environments"
          ],
          recommendedCategories: ["Sensory Play", "Touch & Massage", "Location Adventures", "Temperature Play"],
          conflictAreas: [],
          strengths: ["Incredible sensory experiences", "Natural harmony", "Luxurious connection"]
        },
        sexual: {
          compatibility: 75,
          whatWorks: [
            "Sensual settings enhance body appreciation",
            "Beautiful ambiance amplifies sexual enthusiasm",
            "Combining luxury with direct physical pleasure"
          ],
          whatDoesnt: [
            "Too much sensory buildup without sexual payoff",
            "Making things so elaborate it becomes performative",
            "Focusing only on ambiance and missing sexual energy"
          ],
          howToProceed: [
            "Create beautiful settings for body worship and appreciation",
            "Use sensory elements to enhance physical pleasure",
            "Balance ambiance with direct sexual expression",
            "Let luxury enhance rather than replace sexual enthusiasm"
          ],
          recommendedCategories: ["Body Worship", "Touch & Massage", "Sensory Play", "Oral Pleasure"],
          conflictAreas: ["Complexity vs directness"],
          strengths: ["Enhanced physical pleasure", "Beautiful sexual experiences"]
        },
        kinky: {
          compatibility: 80,
          whatWorks: [
            "Elaborate scenes in beautiful settings",
            "Sensory elements enhance power dynamics",
            "Luxury items and environments for kinky play",
            "Beautiful restraints and high-quality toys"
          ],
          whatDoesnt: [
            "Cheap or ugly kinky gear ruins sensual mood",
            "Harsh environments kill sensual pleasure",
            "Crude power dynamics without elegance"
          ],
          howToProceed: [
            "Invest in beautiful, high-quality kinky items",
            "Create elegant scenes with sensory elements",
            "Combine luxury with power exchange",
            "Make your kinky play beautiful and sensual"
          ],
          recommendedCategories: ["Sensory Play", "Power Dynamics", "Blindfolds & Restraints", "Toys & Props"],
          conflictAreas: ["Elegance vs rawness"],
          strengths: ["Elaborate kinky scenes", "Luxury power exchange"]
        },
        shapeshifter: {
          compatibility: 85,
          whatWorks: [
            "Sensual elements enhance any experience shapeshifter chooses",
            "Beautiful settings work with all varieties of play",
            "Luxury approach elevates shapeshifter's exploration"
          ],
          whatDoesnt: [
            "Being too rigid about sensual requirements",
            "Not adapting ambiance to different experiences"
          ],
          howToProceed: [
            "Create beautiful settings for whatever experience is chosen",
            "Use sensual elements to enhance variety",
            "Adapt your luxury approach to different types of play"
          ],
          recommendedCategories: ["Sensory Play", "Location Adventures", "Fantasy Fulfillment", "Touch & Massage"],
          conflictAreas: ["Consistency vs change"],
          strengths: ["Enhanced variety", "Luxurious exploration"]
        }
      },
      sexual: {
        energetic: {
          compatibility: 70,
          whatWorks: [
            "Mental buildup leading to enthusiastic physical expression",
            "Anticipation that culminates in eager sexual connection",
            "Body appreciation enhanced by psychological tension"
          ],
          whatDoesnt: [
            "Too much mental games without physical payoff",
            "Over-complicating when body wants direct pleasure",
            "Endless buildup that frustrates sexual desire"
          ],
          howToProceed: [
            "Use mental games to enhance physical pleasure",
            "Build anticipation but deliver with sexual enthusiasm",
            "Balance psychological play with body appreciation",
            "Let buildup serve sexual expression rather than replace it"
          ],
          recommendedCategories: ["Body Worship", "Oral Pleasure", "Foreplay & Buildup", "Position Exploration"],
          conflictAreas: ["Timing and complexity"],
          strengths: ["Intense passion", "Enhanced sexual pleasure"]
        },
        sensual: {
          compatibility: 75,
          whatWorks: [
            "Beautiful settings for body worship and appreciation",
            "Sensory elements that enhance sexual pleasure",
            "Luxury approach to physical intimacy"
          ],
          whatDoesnt: [
            "So much sensory focus that sexual energy gets lost",
            "Over-elaborate setups that feel performative",
            "Focusing on ambiance more than bodies"
          ],
          howToProceed: [
            "Use beautiful settings to enhance body appreciation",
            "Let sensory elements amplify sexual pleasure",
            "Create luxury experiences focused on physical connection",
            "Balance ambiance with direct sexual enthusiasm"
          ],
          recommendedCategories: ["Body Worship", "Touch & Massage", "Sensory Play", "Oral Pleasure"],
          conflictAreas: ["Complexity vs directness"],
          strengths: ["Enhanced physical experiences", "Beautiful sexual connection"]
        },
        sexual: {
          compatibility: 90,
          whatWorks: [
            "Both love direct, enthusiastic sexual expression",
            "Natural understanding of each other's sexual needs",
            "High sexual compatibility and shared enthusiasm",
            "Direct body appreciation and physical pleasure focus"
          ],
          whatDoesnt: [
            "Over-thinking or over-complicating things",
            "Too much buildup without sexual payoff",
            "Hiding bodies or being indirect"
          ],
          howToProceed: [
            "Be direct and enthusiastic about sexual desire",
            "Focus on body appreciation and physical pleasure",
            "Communicate openly about what feels good",
            "Keep things sexually focused and energetic"
          ],
          recommendedCategories: ["Body Worship", "Oral Pleasure", "Position Exploration", "Mutual Pleasure"],
          conflictAreas: [],
          strengths: ["High sexual compatibility", "Natural enthusiasm", "Direct communication"]
        },
        kinky: {
          compatibility: 85,
          whatWorks: [
            "Power dynamics that enhance sexual expression",
            "Direct sexual commands and body-focused dominance",
            "Kinky activities that celebrate sexual enthusiasm"
          ],
          whatDoesnt: [
            "Overly complex psychological games",
            "Power dynamics that ignore sexual pleasure",
            "Making things too mental instead of physical"
          ],
          howToProceed: [
            "Use power dynamics to enhance sexual pleasure",
            "Focus on body-based dominance and submission",
            "Combine kinky activities with sexual enthusiasm",
            "Keep power exchange sexually focused"
          ],
          recommendedCategories: ["Power Dynamics", "Body Worship", "Blindfolds & Restraints", "Rough Play"],
          conflictAreas: ["Mental vs physical focus"],
          strengths: ["Sexually charged power exchange", "Direct kinky communication"]
        },
        shapeshifter: {
          compatibility: 80,
          whatWorks: [
            "Sexual enthusiasm enhances any experience chosen",
            "Body appreciation works with all varieties",
            "Direct sexual energy elevates exploration"
          ],
          whatDoesnt: [
            "Being too rigid about sexual-only focus",
            "Not adapting to shapeshifter's variety needs"
          ],
          howToProceed: [
            "Bring sexual enthusiasm to whatever experience is chosen",
            "Use body appreciation to enhance variety",
            "Stay sexually focused while being adaptable"
          ],
          recommendedCategories: ["Position Exploration", "Body Worship", "Fantasy Fulfillment", "Toys & Props"],
          conflictAreas: ["Consistency vs variety"],
          strengths: ["Sexually charged variety", "Enthusiastic exploration"]
        }
      },
      kinky: {
        energetic: {
          compatibility: 90,
          whatWorks: [
            "Power dynamics create incredible mental tension",
            "Psychological dominance builds perfect anticipation",
            "Command and control games satisfy both blueprints",
            "Mental games enhance power exchange beautifully"
          ],
          whatDoesnt: [
            "Vanilla approaches bore both partners",
            "Equal power ruins the energetic dynamic",
            "Being too predictable kills excitement"
          ],
          howToProceed: [
            "Incorporate power exchange into buildup games",
            "Use psychological dominance to create anticipation",
            "Combine mental tension with clear power dynamics",
            "Make commands part of the energetic play"
          ],
          recommendedCategories: ["Power Dynamics", "Role Playing", "Teasing & Denial", "Blindfolds & Restraints"],
          conflictAreas: [],
          strengths: ["Intense psychological connection", "Perfect power/tension balance"]
        },
        sensual: {
          compatibility: 80,
          whatWorks: [
            "Elegant, beautiful power exchange scenes",
            "High-quality toys and restraints in luxury settings",
            "Sensory elements that enhance dominance and submission"
          ],
          whatDoesnt: [
            "Cheap, ugly kinky gear ruins sensual mood",
            "Harsh, uncomfortable environments",
            "Crude power dynamics without elegance"
          ],
          howToProceed: [
            "Invest in beautiful, high-quality kinky equipment",
            "Create elegant scenes with sensory enhancement",
            "Combine luxury with power exchange",
            "Make dominance and submission beautiful experiences"
          ],
          recommendedCategories: ["Power Dynamics", "Sensory Play", "Blindfolds & Restraints", "Toys & Props"],
          conflictAreas: ["Elegance vs rawness"],
          strengths: ["Luxurious power exchange", "Beautiful kinky scenes"]
        },
        sexual: {
          compatibility: 85,
          whatWorks: [
            "Direct, sexually-focused power dynamics",
            "Body-based dominance and submission",
            "Sexual commands and enthusiastic compliance"
          ],
          whatDoesnt: [
            "Overly complex psychological games without sexual payoff",
            "Power exchange that ignores sexual pleasure",
            "Too much mental play without physical expression"
          ],
          howToProceed: [
            "Focus power dynamics on sexual pleasure and body worship",
            "Use dominance to enhance sexual expression",
            "Keep commands sexually focused and direct",
            "Combine power exchange with enthusiastic physical pleasure"
          ],
          recommendedCategories: ["Power Dynamics", "Body Worship", "Rough Play", "Oral Pleasure"],
          conflictAreas: ["Mental vs physical focus"],
          strengths: ["Sexually charged dominance", "Direct power exchange"]
        },
        kinky: {
          compatibility: 95,
          whatWorks: [
            "Both love power dynamics and psychological play",
            "Natural understanding of dominance and submission",
            "Can explore complex scenes and role dynamics",
            "Shared interest in pushing boundaries together"
          ],
          whatDoesnt: [
            "Vanilla approaches bore both partners",
            "Not exploring power exchange deeply enough",
            "Being too cautious or conventional"
          ],
          howToProceed: [
            "Explore power dynamics and role playing deeply",
            "Develop complex scenes and psychological games",
            "Push boundaries together safely and consensually",
            "Embrace the taboo and forbidden aspects you both crave"
          ],
          recommendedCategories: ["Power Dynamics", "Role Playing", "Blindfolds & Restraints", "Exhibitionism"],
          conflictAreas: [],
          strengths: ["Perfect kinky compatibility", "Deep psychological connection", "Boundary exploration"]
        },
        shapeshifter: {
          compatibility: 85,
          whatWorks: [
            "Power dynamics add intensity to shapeshifter's variety",
            "Role playing satisfies both exploration and kink needs",
            "Can incorporate kinky elements into different experiences"
          ],
          whatDoesnt: [
            "Being too rigid about power dynamics",
            "Not adapting dominance style to different experiences"
          ],
          howToProceed: [
            "Use power dynamics to enhance whatever experience is chosen",
            "Adapt your dominance style to shapeshifter's current interest",
            "Incorporate kinky elements into variety play"
          ],
          recommendedCategories: ["Role Playing", "Power Dynamics", "Fantasy Fulfillment", "Toys & Props"],
          conflictAreas: ["Consistency vs change"],
          strengths: ["Versatile power exchange", "Enhanced variety"]
        }
      },
      shapeshifter: {
        energetic: {
          compatibility: 80,
          whatWorks: [
            "Energetic buildup enhances any experience chosen",
            "Mental games add excitement to variety",
            "Anticipation works with all shapeshifter interests"
          ],
          whatDoesnt: [
            "Being locked into only energetic approaches",
            "Not adapting to shapeshifter's changing desires"
          ],
          howToProceed: [
            "Use energetic elements to enhance chosen experiences",
            "Adapt buildup style to current shapeshifter interest",
            "Let variety lead while adding energetic tension"
          ],
          recommendedCategories: ["Fantasy Fulfillment", "Role Playing", "Location Adventures", "Position Exploration"],
          conflictAreas: ["Consistency vs variety"],
          strengths: ["Enhanced variety", "Adaptable chemistry"]
        },
        sensual: {
          compatibility: 85,
          whatWorks: [
            "Sensual elements enhance any chosen experience",
            "Beautiful settings work with all varieties of play",
            "Luxury approach elevates shapeshifter exploration"
          ],
          whatDoesnt: [
            "Being too rigid about sensual requirements",
            "Not adapting ambiance to different experiences"
          ],
          howToProceed: [
            "Create beautiful settings for whatever is chosen",
            "Use sensual elements to enhance variety",
            "Adapt luxury approach to different types of play"
          ],
          recommendedCategories: ["Location Adventures", "Fantasy Fulfillment", "Sensory Play", "Touch & Massage"],
          conflictAreas: ["Consistency vs change"],
          strengths: ["Luxurious variety", "Enhanced exploration"]
        },
        sexual: {
          compatibility: 80,
          whatWorks: [
            "Sexual enthusiasm enhances any experience",
            "Body appreciation works with all varieties",
            "Direct sexual energy elevates exploration"
          ],
          whatDoesnt: [
            "Being too rigid about sexual-only focus",
            "Not adapting to non-sexual shapeshifter interests"
          ],
          howToProceed: [
            "Bring sexual enthusiasm to chosen experiences",
            "Use body appreciation to enhance variety",
            "Stay sexually open while being adaptable"
          ],
          recommendedCategories: ["Position Exploration", "Fantasy Fulfillment", "Body Worship", "Toys & Props"],
          conflictAreas: ["Sexual focus vs variety"],
          strengths: ["Sexually enhanced variety", "Enthusiastic exploration"]
        },
        kinky: {
          compatibility: 85,
          whatWorks: [
            "Power dynamics add intensity to variety",
            "Role playing satisfies both kink and exploration needs",
            "Can incorporate kinky elements into different experiences"
          ],
          whatDoesnt: [
            "Being too rigid about power dynamics",
            "Not adapting kink style to different experiences"
          ],
          howToProceed: [
            "Use kinky elements to enhance chosen experiences",
            "Adapt power dynamics to current shapeshifter interest",
            "Let variety guide while adding kinky intensity"
          ],
          recommendedCategories: ["Role Playing", "Fantasy Fulfillment", "Power Dynamics", "Exhibitionism"],
          conflictAreas: ["Consistency vs change"],
          strengths: ["Kinky variety", "Enhanced intensity"]
        },
        shapeshifter: {
          compatibility: 90,
          whatWorks: [
            "Both love variety and exploration",
            "Natural understanding of changing desires",
            "Can explore everything together without judgment",
            "Endless possibilities for new experiences"
          ],
          whatDoesnt: [
            "Getting stuck in patterns or routines",
            "Not communicating about current interests",
            "Being too predictable"
          ],
          howToProceed: [
            "Embrace constant variety and exploration together",
            "Communicate openly about current interests and curiosities",
            "Try new things regularly and without judgment",
            "Use your combined creativity to invent new experiences"
          ],
          recommendedCategories: ["Fantasy Fulfillment", "Role Playing", "Location Adventures", "Exhibitionism"],
          conflictAreas: [],
          strengths: ["Ultimate variety", "Creative exploration", "Perfect adaptability"]
        }
      }
    };

    return compatibilityMatrix[userBlueprint]?.[partnerBlueprint] || {
      compatibility: 50,
      whatWorks: ["Basic compatibility"],
      whatDoesnt: ["Unknown areas"],
      howToProceed: ["Explore together"],
      recommendedCategories: ["Touch & Massage"],
      conflictAreas: ["Need more information"],
      strengths: ["Basic connection"]
    };
  }

  static async generateSuggestion(request: SuggestionRequest): Promise<string> {
    try {
      const analysis = this.analyzeCompatibility(request.userBlueprint, request.partnerBlueprint);
      
      const prompt = `Generate an intimate suggestion for a couple with these details:

USER BLUEPRINT: ${request.userBlueprint}
PARTNER BLUEPRINT: ${request.partnerBlueprint}
CATEGORY: ${request.category}
EROTIC LEVEL: ${request.eroticLevel}
TIME AVAILABLE: ${request.timeAvailable || '15-30 minutes'}

COMPATIBILITY ANALYSIS:
- Compatibility Score: ${analysis.compatibility}%
- What Works: ${analysis.whatWorks.join(', ')}
- How to Proceed: ${analysis.howToProceed.join(', ')}

Based on this analysis, create a specific, actionable suggestion for the ${request.category} category at ${request.eroticLevel} level that:
1. Leverages what works between these blueprints
2. Follows the "how to proceed" guidelines
3. Fits the requested category and erotic level
4. Is specific and actionable
5. Includes why this works for both blueprints

Keep it practical, specific, and sexy. 2-3 paragraphs maximum.`;

      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      return data.suggestion || "Try gentle touch and communication to explore together.";
      
    } catch (error) {
      console.error('Error generating suggestion:', error);
      return "Try gentle touch and communication to explore together.";
    }
  }

  static async saveAnalysis(userId: string, analysis: BlueprintAnalysis): Promise<void> {
    try {
      const analysisRef = doc(db, 'blueprintAnalyses', userId);
      await setDoc(analysisRef, {
        ...analysis,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  static async getAnalysis(userId: string): Promise<BlueprintAnalysis | null> {
    try {
      const analysisRef = doc(db, 'blueprintAnalyses', userId);
      const analysisSnap = await getDoc(analysisRef);
      
      if (!analysisSnap.exists()) return null;
      
      return analysisSnap.data() as BlueprintAnalysis;
    } catch (error) {
      console.error('Error getting analysis:', error);
      return null;
    }
  }
} 