import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};



// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Initialize messaging (client-side only)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Initialize Analytics (client-side only, with support check)
export const analytics = null;

// Collection names for Firestore (updated with new features)
export const COLLECTIONS = {
  USERS: 'users',
  COUPLES: 'couples', 
  THOUGHT_BUBBLES: 'thought_bubbles',
  PROMPTS: 'prompts',
  DIARY: 'diary',
  SHOPPING_LINKS: 'shopping_links',
  PODCASTS: 'podcasts',
  PATHOLOGY: 'pathology',
  NOTIFICATIONS: 'notifications',
  BILLING: 'billing',
  PUSH_SETTINGS: 'push_settings',
  HEALTH_RECORDS: 'health_records',
  INTIMACY_CACHE: 'intimacy_cache',
  BLUEPRINT_ANALYSIS: 'blueprint_analysis',
  ACTION_USAGE: 'action_usage'
} as const;

// Enhanced User profile interface with new features
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Current state
  currentMood?: 'content' | 'loving' | 'passionate' | 'tired' | 'cuddly' | 'thoughtful';
  lastSeen?: Date;
  
  // Onboarding completion status
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  onboardingProgress?: {
    responses: { [key: string]: any };
    currentStepIndex: number;
    currentQuestionIndex: number;
    blueprintQuizAnswers?: { [key: string]: number };
    lastUpdated: Date;
  };
  
  // Section 1: Relationship Basics
  fillingInAs?: 'solo' | 'together' | 'separately';
  relationshipType?: 'heterosexual' | 'same_sex' | 'non_binary_queer' | 'poly_open' | 'prefer_not_to_say';
  timeTogethers?: '<6_months' | '6_24_months' | '2_5_years' | '5_10_years' | '10_plus_years';
  relationshipStage?: 'just_dating' | 'newly_committed' | 'living_together' | 'married_long_term' | 'parenting_young' | 'parenting_teens' | 'empty_nesters' | 'other';
  relationshipStageOther?: string;
  
  // Section 2: Personal & Sexual Health
  hasChildren?: 'no' | 'yes_at_home' | 'yes_grown_up';
  relationshipAffects?: string[]; // chronic_illness, disability, mental_health, medication_side_effects, menopause, none
  sexualHealthConcerns?: string[]; // erectile_dysfunction, low_libido, vaginismus, pain_with_sex, difficult_orgasms, history_stis, none
  lastSTIScreen?: '<12_months' | '1_3_years' | '>3_years' | 'never';
  
  // Section 3: Erotic Blueprint
  eroticBlueprints?: string[]; // energetic, sensual, sexual, kinky, shapeshifter
  eroticBlueprintScores?: {
    energetic: number;
    sensual: number;
    sexual: number;
    kinky: number;
    shapeshifter: number;
  };
  eroticBlueprintPrimary?: string;
  eroticBlueprintSecondary?: string;
  partnerBlueprintSame?: 'same' | 'different' | 'not_sure';
  discussedBlueprints?: boolean;
  
  // Enhanced relationship data from comprehensive onboarding
  usingAs?: 'couple' | 'solo';
  haveChildren?: 'yes' | 'no' | 'not_applicable';
  numberOfChildren?: string;
  sexFrequency?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7_plus';
  bestThingAboutSexLife?: string;
  biggestChallenge?: string[];
  mostWantToChange?: string[];
  communicationConfidence?: number; // 1-10 slider
  hornynessOpenness?: number; // 1-10 slider
  healthFunctionIssues?: 'never' | 'sometimes' | 'often' | 'prefer_not_say';
  sexualApproach?: 'vanilla' | 'adventurous' | 'roleplay_fantasy' | 'kinky' | 'prefer_not_say';
  kinksAndFantasies?: string[];
  futureVision?: string[];
  thingsToAvoid?: string;
  
  // Section 4: Erotic Life & Desires
  sexLifeSatisfaction?: number; // 1-10 slider
  sexLifeDescription?: string[]; // vanilla, adventurous, experimental, routine, infrequent, non_existent, other
  sexLifeDescriptionOther?: string;
  favouritePartSexLife?: string;
  weeklyIntimateContact?: '0' | '1' | '2_3' | '4_6' | '7_plus';
  biggestChallenges?: string[]; // low_desire, time_energy, stress_kids, different_turn_ons, orgasm_difficulty, pain_discomfort, body_confidence, relationship_tension, medical_medications, no_challenges, other
  biggestChallengesOther?: string;
  usesInBedroom?: string[]; // toys, fantasy_roleplay, porn_erotica, kink_bdsm, open_poly_play, none
  fantasiesNotTried?: string;
  hardLimits?: string;
  sexualStyle?: string[]; // spontaneous, planned_scheduled, horny_often, rarely_horny, need_mood_right
  hornyScale?: number; // 1-10 slider
  
  // Section 5: Goals & Intentions
  improvementGoals?: string[]; // more_frequent_sex, new_adventures, better_communication, more_intimacy_non_sexual, more_confidence, fix_specific_issue, other
  improvementGoalsOther?: string;
  communicationComfort?: 'very_comfortable' | 'somewhat_comfortable' | 'not_comfortable';
  additionalInfo?: string;
  
  // Legacy fields for backward compatibility (can be removed later)
  boundaries?: string[];
  noGoList?: string[];
  safeWord?: string;
  intensityLevel?: 'sweet' | 'flirty' | 'spicy' | 'wild';
  
  // Health preferences (legacy)
  healthInterests?: {
    prepReminders: boolean;
    stiEducation: boolean;
    telehealthLinks: boolean;
    pathologyReminders: boolean;
  };
  
  // Notification preferences
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly';
    quietHours: {
      start: string; // "22:00"
      end: string;   // "08:00"
    };
  };
  
  // Privacy settings
  panicLockEnabled?: boolean;
  panicLockPin?: string;
  encryptionEnabled?: boolean;
  
  // Partner connection
  partnerId?: string;
  coupleId?: string;
  inviteCode?: string;
  
  // AI-generated couples report
  couplesReport?: {
    welcomeMessage: string;
    blueprintSummary: {
      user1Summary: string;
      user2Summary: string;
    };
    compatibility: {
      strengths: string[];
      challenges: string[];
      overlapAreas: string[];
    };
    actionableAdvice: {
      immediateSteps: string[];
      weeklyIdeas: string[];
      longTermGoals: string[];
    };
    personalisedPrompts: string[];
    nextSteps: string;
  };
  couplesReportGeneratedAt?: Date;
  
  // Terms agreement
  agreedToTerms?: boolean;
  
  // FCM token for push notifications
  fcmToken?: string;
}

// Push Settings interface for the toggle system
export interface PushSettings {
  id: string;
  userId: string;
  coupleId: string;
  
  // Individual toggles (~20 options as specified)
  toggles: {
    // Mood & desire alerts
    receiveMoodNudges: boolean;
    receiveHornyAlerts: boolean;
    receiveEnergyChecks: boolean;
    receiveConsentPrompts: boolean;
    
    // Health reminders
    prepReminders: boolean;
    stiCheckReminders: boolean;
    pathologyReminders: boolean;
    mentalHealthChecks: boolean;
    
    // Connection modes
    asexualModeOnly: boolean;
    sexualModeEnabled: boolean;
    mixedModeEnabled: boolean;
    
    // Partner-enabled settings (require mutual consent)
    allowPartnerMoodAlerts: boolean;
    allowPartnerHornyAlerts: boolean;
    allowPartnerConsentChecks: boolean;
    allowPartnerHealthReminders: boolean;
    
    // Timing and frequency
    nightModeEnabled: boolean;
    workHoursRespect: boolean;
    weekendOnlyMode: boolean;
    
    // Content preferences
    aiSuggestionsEnabled: boolean;
    educationalContentEnabled: boolean;
    shoppingSuggestionsEnabled: boolean;
  };
  
  // Consent tracking for partner-enabled features
  partnerConsentGiven: {
    moodAlerts: boolean;
    hornyAlerts: boolean;
    consentChecks: boolean;
    healthReminders: boolean;
    grantedAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Couple interface
export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  
  // Merged preferences
  sharedBoundaries: string[];
  sharedIntensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  sharedRelationshipType: 'sexual' | 'asexual' | 'mixed';
  
  // Push notification mutual consent
  mutualPushConsent: {
    established: boolean;
    establishedAt?: Date;
    user1Consent: boolean;
    user2Consent: boolean;
  };
  
  // Subscription info
  subscriptionStatus: 'free' | 'premium';
  subscriptionId?: string;
  billingUserId: string;

  // NEW: Couples Analysis Flow
  partnerA?: {
    userId: string;
    completedAt: Date;
    primaryBlueprint: string;
    secondaryBlueprint?: string;
    scores: {
      energetic: number;
      sensual: number;
      sexual: number;
      kinky: number;
      shapeshifter: number;
    };
  };
  partnerB?: {
    userId: string;
    completedAt: Date;
    primaryBlueprint: string;
    secondaryBlueprint?: string;
    scores: {
      energetic: number;
      sensual: number;
      sexual: number;
      kinky: number;
      shapeshifter: number;
    };
  };
  analysis?: {
    summary: string;
    sharedCompatibility: string;
    partnerATips: string;
    partnerBTips: string;
    exercises: string[];
    suggestions: string[];
    generatedAt: Date;
    revisitPrompt?: string;
  };
  analysisInProgress?: boolean;
  analysisReady?: boolean;
  alerted?: boolean;
}

// Podcasts interface for crawled content
export interface Podcast {
  id: string;
  title: string;
  description: string;
  category: 'sexual_health' | 'relationships' | 'asexual' | 'lgbtq' | 'wellness' | 'education';
  podcastUrl: string;
  imageUrl?: string;
  hostName?: string;
  episodeCount?: number;
  isActive: boolean;
  tags: string[];
  suitableFor: ('sexual' | 'asexual' | 'mixed')[];
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  lastCrawled: Date;
  createdAt: Date;
}

// Health/Pathology interface
export interface HealthRecord {
  id: string;
  userId: string;
  coupleId: string;
  type: 'sti_test' | 'prep_reminder' | 'pep_info' | 'telehealth_booking' | 'general_health';
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  reminderEnabled: boolean;
  isPrivate: boolean; // some health records may be shared with partner
  telehealthProviderUrl?: string;
  notes?: string; // encrypted
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Prompt interface
export interface Prompt {
  id: string;
  coupleId: string;
  content: string;
  category: 'connection' | 'affection' | 'touch' | 'playful' | 'intimate' | 'shopping' | 'health' | 'asexual' | 'educational';
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  relationshipMode: 'sexual' | 'asexual' | 'mixed' | 'any';
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string[];
  generatedAt: Date;
  expiresAt?: Date;
  
  // AI context that generated this prompt
  aiContext?: {
    userMood?: string;
    relationshipStage?: string;
    healthContext?: string;
  };
}

// Push notification queue (ephemeral, not logged for privacy)
export interface PushNotification {
  id: string;
  toUserId: string;
  fromUserId?: string;
  type: 'mood_nudge' | 'horny_alert' | 'consent_check' | 'health_reminder' | 'ai_suggestion';
  title: string;
  body: string; // always discreet
  payload?: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  delivered: boolean;
  
  // These are NOT stored long-term for privacy
  // Only kept briefly for delivery confirmation
}

// All existing interfaces remain the same...
export interface ThoughtBubble {
  id: string;
  userId: string;
  coupleId: string;
  content: string; // encrypted
  type: 'text' | 'voice';
  isPrivate: boolean;
  scheduledRevealAt?: Date;
  revealedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiaryEntry {
  id: string;
  coupleId: string;
  type: 'prompt_completed' | 'thought_revealed' | 'milestone' | 'custom' | 'health_log';
  title: string;
  content?: string; // encrypted
  promptId?: string;
  thoughtBubbleId?: string;
  healthRecordId?: string;
  tags: string[];
  isFavourite: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ShoppingLink {
  id: string;
  title: string;
  description: string;
  category: 'lingerie' | 'accessories' | 'wellness' | 'experiences' | 'books' | 'health' | 'fitness' | 'devices';
  url: string;
  affiliateUrl?: string;
  imageUrl?: string;
  price?: string;
  intensityLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  suitableFor: ('sexual' | 'asexual' | 'mixed')[];
  isActive: boolean;
  createdAt: Date;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'prompt_reminder' | 'thought_ready' | 'partner_activity' | 'milestone' | 'health_reminder';
  title: string;
  content: string; // always non-explicit
  channel: 'email' | 'sms' | 'push';
  status: 'sent' | 'delivered' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  
  // Note: Push notifications are NOT logged here for privacy
  // Only SMS/email reminders are logged
}

export interface Billing {
  id: string;
  coupleId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Notification interface for couples analysis alerts
export interface Notification {
  id: string;
  userId: string;
  type: 'couple_analysis_ready' | 'partner_joined' | 'partner_completed' | 'weekly_followup' | 'milestone_reached';
  coupleId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// NEW: Enhanced couples analysis result
export interface CouplesAnalysisResult {
  coupleId: string;
  partnerA: {
    userId: string;
    name: string;
    primaryBlueprint: string;
    secondaryBlueprint?: string;
    scores: {
      energetic: number;
      sensual: number;
      sexual: number;
      kinky: number;
      shapeshifter: number;
    };
  };
  partnerB: {
    userId: string;
    name: string;
    primaryBlueprint: string;
    secondaryBlueprint?: string;
    scores: {
      energetic: number;
      sensual: number;
      sexual: number;
      kinky: number;
      shapeshifter: number;
    };
  };
  analysis: {
    summary: string;
    compatibility: {
      strengths: string[];
      challenges: string[];
      overlapAreas: string[];
    };
    individualTips: {
      forPartnerA: string[];
      forPartnerB: string[];
    };
    sharedExercises: string[];
    conversationStarters: string[];
    nextSteps: string;
    generatedAt: Date;
  };
}

// NEW: Enhanced Conversation Memory Interfaces
export interface ConversationInsight {
  topics: string[];
  mood: 'excited' | 'curious' | 'stressed' | 'romantic' | 'playful' | 'concerned' | 'neutral';
  actionItems: string[];
  preferences: string[];
  relationshipFocus?: string;
}

export interface ConversationMessage {
  id: string;
  userId: string;
  partnerId?: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  insights?: ConversationInsight;
  feedback?: 'helpful' | 'not_helpful' | 'love_it' | 'too_much' | 'off_topic';
  aiResponse?: string;
  contextUsed?: string[];
}

export interface ConversationContext {
  userId: string;
  partnerId?: string;
  conversationId: string;
  recentThemes: string[];
  preferredTone: 'playful' | 'romantic' | 'direct' | 'nurturing' | 'educational';
  currentFocus: string;
  relationshipPhase: 'new' | 'exploring' | 'deepening' | 'committed' | 'growing';
  averageSessionLength: number;
  lastInteraction: Date;
  totalMessages: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

// NEW: Feedback Analytics Interfaces
export interface SuggestionFeedback {
  id: string;
  userId: string;
  suggestionId: string;
  suggestionType: string;
  category: string;
  heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  feedback: 'loved' | 'tried' | 'not_for_us' | 'maybe_later' | 'too_intense' | 'not_enough';
  notes?: string;
  timestamp: Date;
  partnerFeedback?: string;
  outcome?: 'successful' | 'mixed' | 'unsuccessful';
}

export interface UserPreferenceProfile {
  userId: string;
  partnerId?: string;
  preferredCategories: Array<{
    category: string;
    score: number;
    frequency: number;
  }>;
  optimalIntensity: string;
  preferredTiming: string[];
  communicationStyle: string;
  avoidancePatterns: string[];
  successPatterns: string[];
  lastAnalyzed: Date;
  totalFeedback: number;
  aiInsights: string;
}

// NEW: Enhanced Journey Tracking Interfaces
export interface RelationshipMilestone {
  id: string;
  coupleId: string;
  type: 'blueprint_completion' | 'first_month' | 'goal_achieved' | 'communication_breakthrough' | 
        'intimacy_growth' | 'conflict_resolution' | 'celebration' | 'challenge_overcome' | 'custom';
  title: string;
  description: string;
  date: Date;
  significance: number; // 1-10 scale
  autoDetected: boolean;
  celebrationSuggested: boolean;
  celebrated: boolean;
  context: {
    relationshipPhase: string;
    challengesOvercome: string[];
    growthAreas: string[];
    partnerInvolvement: 'both' | 'individual' | 'mixed';
  };
  aiReflection: string;
  userNotes?: string;
  tags: string[];
}

export interface RelationshipJourney {
  coupleId: string;
  startDate: Date;
  milestones: RelationshipMilestone[];
  currentPhase: {
    name: string;
    description: string;
    startDate: Date;
    characteristics: string[];
    focusAreas: string[];
  };
  growthMetrics: {
    communicationScore: number;
    intimacyScore: number;
    engagementScore: number;
    satisfactionScore: number;
    lastUpdated: Date;
  };
  insights: {
    strengths: string[];
    opportunities: string[];
    patterns: string[];
    aiAnalysis: string;
    nextSteps: string[];
  };
  totalJourneyDays: number;
  majorMilestones: number;
  lastAnalyzed: Date;
}

// NEW: Enhanced Usage Session Types (Week 4)
export interface UsageSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  isActive: boolean
  activities: Array<{
    type: 'conversation' | 'exploration' | 'feedback' | 'journey' | 'suggestions' | 'quiz'
    startTime: Date
    duration: number
    engagement: number
    outcome: 'completed' | 'abandoned' | 'skipped'
  }>
  contextualFactors: {
    dayOfWeek: number
    hour: number
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    deviceType?: string
    location?: string
  }
  userState: {
    mood?: string
    energy?: string
    availability?: string
    goals?: string[]
  }
  engagementMetrics: {
    totalInteractions: number
    averageResponseTime: number
    completionRate: number
    satisfactionScore?: number
  }
}

export interface EngagementCycle {
  id: string
  startDate: Date
  endDate: Date
  averageEngagement: number
  totalSessions: number
  totalDuration: number
  completionRate: number
  phase: 'high_engagement' | 'moderate_engagement' | 'active' | 'low_engagement'
}

// NEW: Predictive Features Interfaces
export interface UsagePattern {
  userId: string;
  coupleId?: string;
  optimalTimes: Array<{
    dayOfWeek: number;
    hour: number;
    confidence: number;
  }>;
  sessionPatterns: {
    averageLength: number;
    preferredFrequency: string;
    peakEngagementTimes: string[];
  };
  engagementCycles: {
    highEngagementPeriods: Date[];
    lowEngagementPeriods: Date[];
    patterns: string[];
  };
  responsiveness: {
    quickResponseTopics: string[];
    deepConversationTriggers: string[];
    disengagementTriggers: string[];
  };
  lastAnalyzed: Date;
}

export interface RelationshipHealthIndicator {
  coupleId: string;
  overallScore: number; // 0-100
  dimensions: {
    communication: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
    };
    intimacy: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
    };
    engagement: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
    };
    satisfaction: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
    };
  };
  alerts: Array<{
    type: 'positive' | 'neutral' | 'attention_needed';
    message: string;
    actionable: boolean;
    suggestions: string[];
  }>;
  strengths: string[];
  opportunities: string[];
  lastAnalyzed: Date;
  trend: 'improving' | 'stable' | 'needs_attention';
}

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

export default app; 