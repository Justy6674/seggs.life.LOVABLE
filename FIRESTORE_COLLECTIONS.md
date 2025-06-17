# 🗃️ FIRESTORE COLLECTIONS STRUCTURE

## 📋 Smart Phase 1 Database Architecture

### 🔗 **Existing Collections (Enhanced)**

#### `/users/{userId}`
```typescript
interface User {
  // ... existing fields ...
  
  // NEW: Enhanced AI fields
  aiProfile?: {
    preferredTone: 'playful' | 'romantic' | 'direct' | 'nurturing';
    communicationStyle: string;
    lastInteraction: Date;
    totalConversations: number;
    engagementLevel: 'high' | 'medium' | 'low';
  };
  
  // NEW: Conversation preferences
  conversationPreferences?: {
    sessionLength: 'brief' | 'medium' | 'extended';
    responseDetail: 'concise' | 'detailed' | 'adaptive';
    topicInterests: string[];
    avoidTopics: string[];
  };
}
```

#### `/couples/{coupleId}`
```typescript
interface Couple {
  // ... existing fields ...
  
  // NEW: Enhanced relationship tracking
  relationshipJourney?: {
    currentPhase: string;
    totalDays: number;
    majorMilestones: number;
    lastMilestone: Date;
  };
  
  healthMetrics?: {
    overallScore: number;
    lastAssessment: Date;
    trend: 'improving' | 'stable' | 'needs_attention';
  };
}
```

---

### 🆕 **New Collections**

#### `/conversations/{conversationId}`
```typescript
interface ConversationDoc {
  id: string;
  userId: string;
  partnerId?: string;
  createdAt: Date;
  lastActivity: Date;
  totalMessages: number;
  
  // Conversation metadata
  context: {
    recentThemes: string[];
    currentFocus: string;
    relationshipPhase: string;
    preferredTone: string;
    engagementLevel: string;
  };
  
  // AI insights
  insights: {
    dominantTopics: string[];
    conversationMood: string;
    partnerDynamics: string;
    successPatterns: string[];
    aiAnalysis: string;
  };
  
  // Performance metrics
  metrics: {
    averageResponseTime: number;
    userSatisfaction: number;
    conversationDepth: number;
    actionItemsGenerated: number;
  };
}
```

#### `/conversations/{conversationId}/messages/{messageId}`
```typescript
interface ConversationMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  
  // Enhanced metadata
  insights?: {
    topics: string[];
    mood: string;
    actionItems: string[];
    preferences: string[];
    relationshipFocus?: string;
  };
  
  // User feedback
  feedback?: {
    rating: 'helpful' | 'not_helpful' | 'love_it' | 'too_much' | 'off_topic';
    timestamp: Date;
    notes?: string;
  };
  
  // AI context
  aiContext?: {
    contextUsed: string[];
    promptVersion: string;
    responseConfidence: number;
    personalizedElements: string[];
  };
}
```

#### `/feedback/{feedbackId}`
```typescript
interface SuggestionFeedback {
  id: string;
  userId: string;
  coupleId?: string;
  suggestionId: string;
  suggestionType: string;
  category: string;
  heatLevel: 'sweet' | 'flirty' | 'spicy' | 'wild';
  
  // Detailed feedback
  feedback: 'loved' | 'tried' | 'not_for_us' | 'maybe_later' | 'too_intense' | 'not_enough';
  outcome?: 'successful' | 'mixed' | 'unsuccessful';
  notes?: string;
  timestamp: Date;
  
  // Partner involvement
  partnerFeedback?: string;
  partnerRating?: number;
  
  // Context
  context: {
    timeOfDay: string;
    dayOfWeek: number;
    relationshipMood: string;
    recentEvents: string[];
  };
}
```

#### `/userPreferences/{userId}`
```typescript
interface UserPreferenceProfile {
  userId: string;
  partnerId?: string;
  lastAnalyzed: Date;
  totalFeedback: number;
  
  // Analyzed preferences
  preferredCategories: Array<{
    category: string;
    score: number;
    frequency: number;
    successRate: number;
  }>;
  
  optimalSettings: {
    intensity: string;
    timing: string[];
    sessionLength: string;
    communicationStyle: string;
  };
  
  patterns: {
    successPatterns: string[];
    avoidancePatterns: string[];
    timingPreferences: string[];
    moodCorrelations: string[];
  };
  
  // AI-generated insights
  aiInsights: {
    summary: string;
    recommendations: string[];
    personalityProfile: string;
    growthAreas: string[];
  };
}
```

#### `/milestones/{milestoneId}`
```typescript
interface RelationshipMilestone {
  id: string;
  coupleId: string;
  type: 'blueprint_completion' | 'first_month' | 'goal_achieved' | 'communication_breakthrough' | 
        'intimacy_growth' | 'conflict_resolution' | 'celebration' | 'challenge_overcome' | 'custom';
  
  // Milestone details
  title: string;
  description: string;
  date: Date;
  significance: number; // 1-10 scale
  
  // Detection and celebration
  autoDetected: boolean;
  celebrationSuggested: boolean;
  celebrated: boolean;
  celebrationDate?: Date;
  
  // Rich context
  context: {
    relationshipPhase: string;
    challengesOvercome: string[];
    growthAreas: string[];
    partnerInvolvement: 'both' | 'individual' | 'mixed';
    triggerEvents: string[];
  };
  
  // AI analysis
  aiReflection: string;
  insights: string[];
  futureGuidance: string[];
  
  // User input
  userNotes?: string;
  partnerNotes?: string;
  photos?: string[];
  tags: string[];
}
```

#### `/journeys/{coupleId}`
```typescript
interface RelationshipJourney {
  coupleId: string;
  startDate: Date;
  lastUpdated: Date;
  
  // Current state
  currentPhase: {
    name: string;
    description: string;
    startDate: Date;
    characteristics: string[];
    focusAreas: string[];
    expectedDuration?: string;
  };
  
  // Progress metrics
  growthMetrics: {
    communicationScore: number;
    intimacyScore: number;
    engagementScore: number;
    satisfactionScore: number;
    overallTrend: 'improving' | 'stable' | 'declining';
    lastUpdated: Date;
  };
  
  // Comprehensive insights
  insights: {
    strengths: string[];
    opportunities: string[];
    patterns: string[];
    successFormulas: string[];
    challengeAreas: string[];
    aiAnalysis: string;
    nextSteps: string[];
    recommendations: string[];
  };
  
  // Journey statistics
  statistics: {
    totalJourneyDays: number;
    majorMilestones: number;
    goalsAchieved: number;
    challengesOvercome: number;
    celebrationsMissed: number;
    engagementStreaks: number;
  };
}
```

#### `/usagePatterns/{userId}`
```typescript
interface UsagePattern {
  userId: string;
  coupleId?: string;
  lastAnalyzed: Date;
  
  // Timing patterns
  optimalTimes: Array<{
    dayOfWeek: number;
    hour: number;
    confidence: number;
    context: string;
  }>;
  
  // Session analysis
  sessionPatterns: {
    averageLength: number;
    preferredFrequency: string;
    peakEngagementTimes: string[];
    lowEngagementPeriods: string[];
  };
  
  // Engagement cycles
  engagementCycles: {
    highEngagementPeriods: Date[];
    lowEngagementPeriods: Date[];
    patterns: string[];
    triggers: string[];
  };
  
  // Response patterns
  responsiveness: {
    quickResponseTopics: string[];
    deepConversationTriggers: string[];
    disengagementTriggers: string[];
    averageResponseTime: number;
  };
  
  // Predictive insights
  predictions: {
    nextOptimalEngagement: Date;
    recommendedContent: string[];
    riskFactors: string[];
    opportunities: string[];
  };
}
```

#### `/healthIndicators/{coupleId}`
```typescript
interface RelationshipHealthIndicator {
  coupleId: string;
  lastAssessment: Date;
  nextAssessment: Date;
  
  // Overall health
  overallScore: number; // 0-100
  trend: 'improving' | 'stable' | 'needs_attention';
  confidenceLevel: number;
  
  // Detailed dimensions
  dimensions: {
    communication: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
      evidence: string[];
    };
    intimacy: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
      evidence: string[];
    };
    engagement: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
      evidence: string[];
    };
    satisfaction: {
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      indicators: string[];
      evidence: string[];
    };
  };
  
  // Actionable insights
  alerts: Array<{
    type: 'positive' | 'neutral' | 'attention_needed';
    priority: 'low' | 'medium' | 'high';
    message: string;
    actionable: boolean;
    suggestions: string[];
    deadline?: Date;
  }>;
  
  // Strategic guidance
  strengths: string[];
  opportunities: string[];
  riskFactors: string[];
  recommendations: string[];
  
  // AI analysis
  aiAnalysis: {
    summary: string;
    keyInsights: string[];
    actionPlan: string[];
    preventiveMeasures: string[];
  };
}
```

---

### 🔐 **Security Rules Updates Needed**

```javascript
// New rules for enhanced collections
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Conversations - user and partner access only
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.partnerId == request.auth.uid);
    }
    
    // Conversation messages - same access as conversation
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/conversations/$(conversationId)) &&
        (get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/conversations/$(conversationId)).data.partnerId == request.auth.uid);
    }
    
    // User preferences - user only
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Feedback - user only
    match /feedback/{feedbackId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Milestones - couple members only
    match /milestones/{milestoneId} {
      allow read, write: if request.auth != null && 
        isCoupleMembe ber(resource.data.coupleId, request.auth.uid);
    }
    
    // Journey - couple members only
    match /journeys/{coupleId} {
      allow read, write: if request.auth != null && 
        isCoupleMembe ber(coupleId, request.auth.uid);
    }
    
    // Usage patterns - user only
    match /usagePatterns/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Health indicators - couple members only
    match /healthIndicators/{coupleId} {
      allow read, write: if request.auth != null && 
        isCoupleMembe ber(coupleId, request.auth.uid);
    }
    
    // Helper function to check couple membership
    function isCoupleMembe ber(coupleId, userId) {
      let coupleDoc = get(/databases/$(database)/documents/couples/$(coupleId));
      return coupleDoc.data.user1Id == userId || coupleDoc.data.user2Id == userId;
    }
  }
}
```

---

### 📊 **Collection Relationships**

```
Users
├── Conversations (1:many)
│   └── Messages (1:many)
├── UserPreferences (1:1)
├── Feedback (1:many)
└── UsagePatterns (1:1)

Couples
├── Milestones (1:many)
├── Journey (1:1)
└── HealthIndicators (1:1)
```

---

### 🗄️ **Index Requirements**

```javascript
// Required composite indexes
Conversations:
- userId, lastActivity (desc)
- partnerId, lastActivity (desc)

Messages:
- conversationId, timestamp (desc)
- sender, timestamp (desc)

Feedback:
- userId, timestamp (desc)
- suggestionType, feedback, timestamp (desc)

Milestones:
- coupleId, date (desc)
- type, significance (desc)

UsagePatterns:
- userId, lastAnalyzed (desc)

HealthIndicators:
- coupleId, lastAssessment (desc)
- overallScore, trend
```

---

### 💾 **Storage Considerations**

**Estimated Storage per Couple (Monthly):**
- Conversations: ~2-5MB
- Messages: ~10-20MB  
- Feedback: ~1MB
- Milestones: ~500KB
- Journey: ~1MB
- Health: ~500KB

**Total: ~15-30MB per couple per month**

---

### 🔄 **Data Lifecycle**

**Retention Policies:**
- Messages: Keep all (relationship history valuable)
- Conversations: Archive after 2 years
- Feedback: Keep all (learning data)
- Milestones: Keep all (permanent record)
- Usage Patterns: Keep last 12 months
- Health Indicators: Keep all assessments 