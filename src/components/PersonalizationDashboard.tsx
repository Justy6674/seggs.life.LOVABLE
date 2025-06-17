'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { 
  FiUser, 
  FiSettings, 
  FiTrendingUp, 
  FiHeart, 
  FiClock, 
  FiTarget,
  FiEye,
  FiMic,
  FiBook,
  FiStar,
  FiBarChart,
  FiRefreshCw
} from 'react-icons/fi'
import { personalizationEngine, UserProfile, PersonalityTraits } from '../lib/personalization'
import { useAuth } from '../contexts/AuthContext'

interface PersonalizationDashboardProps {
  userId?: string
}

export default function PersonalizationDashboard({ userId }: PersonalizationDashboardProps) {
  const { user } = useAuth()
  const currentUserId = userId || user?.uid || ''
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (currentUserId) {
      loadUserProfile()
    }
  }, [currentUserId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const userProfile = await personalizationEngine.buildUserProfile(currentUserId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    setRefreshing(true)
    await loadUserProfile()
    setRefreshing(false)
  }

  const updatePreference = async (category: string, key: string, value: any) => {
    try {
      await personalizationEngine.updatePreference(currentUserId, {
        category: category as any,
        key,
        value,
        confidence: 1.0,
        source: 'explicit'
      })
      // Reload profile to show changes
      await loadUserProfile()
    } catch (error) {
      console.error('Error updating preference:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Building your personalized profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Unable to load your personalization profile.</p>
        <Button onClick={loadUserProfile}>
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Personal Profile</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights to enhance your relationship journey
          </p>
        </div>
        <Button 
          onClick={refreshProfile} 
          disabled={refreshing}
          variant="outline"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Profile
        </Button>
      </div>

      {/* Profile Completeness */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Profile Completeness</h3>
              <p className="text-gray-600">Complete your profile for better personalization</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {profile.profileCompleteness}%
            </div>
          </div>
          <Progress 
            value={profile.profileCompleteness} 
            className="h-3"
          />
          <div className="mt-3 text-sm text-gray-600">
            {profile.profileCompleteness < 50 && "Add more preferences to unlock advanced features"}
            {profile.profileCompleteness >= 50 && profile.profileCompleteness < 80 && "Great progress! Keep building your profile"}
            {profile.profileCompleteness >= 80 && "Excellent! Your profile is highly optimized"}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <FiUser className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="personality">
            <FiHeart className="w-4 h-4 mr-2" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <FiSettings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="insights">
            <FiTrendingUp className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileOverviewCard profile={profile} />
            <PersonalityHighlights traits={profile.personalityTraits} />
            <PreferenceSummary preferences={profile.preferences} />
          </div>
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <PersonalityAnalysis traits={profile.personalityTraits} />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferenceManager 
            preferences={profile.preferences}
            onUpdatePreference={updatePreference}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <PersonalizationInsights profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ===== OVERVIEW COMPONENTS =====

function ProfileOverviewCard({ profile }: { profile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FiUser className="w-5 h-5 mr-2" />
          Profile Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Last Updated</span>
          <span className="font-medium">
            {new Date(profile.lastProfileUpdate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Preferences</span>
          <Badge variant="secondary">{profile.preferences.length} active</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Personality Type</span>
          <Badge variant="outline">
            {getPersonalityType(profile.personalityTraits)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function PersonalityHighlights({ traits }: { traits: PersonalityTraits }) {
  const topTraits = getTopPersonalityTraits(traits)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FiHeart className="w-5 h-5 mr-2" />
          Personality Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topTraits.map((trait, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
              <span className="font-medium">{trait.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{trait.score}%</div>
              <div className="text-xs text-gray-500">{trait.level}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PreferenceSummary({ preferences }: { preferences: any[] }) {
  const preferencesByCategory = preferences.reduce((acc: Record<string, number>, pref) => {
    acc[pref.category] = (acc[pref.category] || 0) + 1
    return acc
  }, {})

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FiSettings className="w-5 h-5 mr-2" />
          Active Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(preferencesByCategory).map(([category, count]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center">
              <CategoryIcon category={category} />
              <span className="font-medium capitalize ml-2">
                {category.replace('_', ' ')}
              </span>
            </div>
            <Badge variant="secondary">{count}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ===== PERSONALITY ANALYSIS =====

function PersonalityAnalysis({ traits }: { traits: PersonalityTraits }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Big Five Personality Traits</CardTitle>
          <p className="text-gray-600">Based on your behavior patterns and interactions</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <TraitSlider 
            name="Openness" 
            value={traits.openness} 
            description="Creativity, curiosity, and openness to new experiences"
          />
          <TraitSlider 
            name="Conscientiousness" 
            value={traits.conscientiousness} 
            description="Organization, self-discipline, and goal-directed behavior"
          />
          <TraitSlider 
            name="Extraversion" 
            value={traits.extraversion} 
            description="Sociability, assertiveness, and positive emotions"
          />
          <TraitSlider 
            name="Agreeableness" 
            value={traits.agreeableness} 
            description="Cooperation, trust, and empathy towards others"
          />
          <TraitSlider 
            name="Neuroticism" 
            value={traits.neuroticism} 
            description="Emotional stability and stress resilience"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relationship Traits</CardTitle>
          <p className="text-gray-600">Your unique approach to relationships</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TraitDisplay 
              label="Communication Style" 
              value={traits.communicationStyle}
              icon={<FiMic className="w-4 h-4" />}
            />
            <TraitDisplay 
              label="Conflict Resolution" 
              value={traits.conflictResolution}
              icon={<FiTarget className="w-4 h-4" />}
            />
            <TraitDisplay 
              label="Intimacy Style" 
              value={traits.intimacyStyle}
              icon={<FiHeart className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-4">
            <TraitDisplay 
              label="Motivation Style" 
              value={traits.motivationStyle}
              icon={<FiTrendingUp className="w-4 h-4" />}
            />
            <TraitDisplay 
              label="Learning Style" 
              value={traits.learningStyle}
              icon={<FiBook className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relationship Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TraitSlider 
            name="Spontaneity" 
            value={traits.spontaneity} 
            description="Preference for spontaneous vs. planned activities"
          />
          <TraitSlider 
            name="Romanticism" 
            value={traits.romanticism} 
            description="Appreciation for romantic gestures and expressions"
          />
          <TraitSlider 
            name="Pragmatism" 
            value={traits.pragmatism} 
            description="Focus on practical aspects of the relationship"
          />
          <TraitSlider 
            name="Emotional Expressiveness" 
            value={traits.emotionalExpressiveness} 
            description="Comfort with expressing emotions openly"
          />
          <TraitSlider 
            name="Need for Validation" 
            value={traits.needForValidation} 
            description="Desire for reassurance and positive feedback"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function TraitSlider({ name, value, description }: { 
  name: string; 
  value: number; 
  description: string 
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <Label className="font-medium">{name}</Label>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Badge variant="outline">{Math.round(value)}%</Badge>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

function TraitDisplay({ label, value, icon }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        {icon}
        <span className="ml-2 font-medium">{label}</span>
      </div>
      <Badge variant="secondary" className="capitalize">
        {value.replace('_', ' ')}
      </Badge>
    </div>
  )
}

// ===== PREFERENCE MANAGER =====

function PreferenceManager({ 
  preferences, 
  onUpdatePreference 
}: { 
  preferences: any[];
  onUpdatePreference: (category: string, key: string, value: any) => void;
}) {
  const [localPreferences, setLocalPreferences] = useState<Record<string, any>>({})

  useEffect(() => {
    const prefMap = preferences.reduce((acc, pref) => {
      acc[`${pref.category}_${pref.key}`] = pref.value
      return acc
    }, {})
    setLocalPreferences(prefMap)
  }, [preferences])

  const updateLocalPreference = (category: string, key: string, value: any) => {
    const prefKey = `${category}_${key}`
    setLocalPreferences(prev => ({ ...prev, [prefKey]: value }))
    onUpdatePreference(category, key, value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
          <p className="text-gray-600">Customize how content is presented to you</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Learning Style</Label>
              <div className="space-y-3">
                {['visual', 'auditory', 'kinesthetic', 'reading'].map(style => (
                  <div key={style} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={style}
                      name="learningStyle"
                      checked={localPreferences['content_learning_style'] === style}
                      onChange={() => updateLocalPreference('content', 'learning_style', style)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor={style} className="capitalize cursor-pointer">
                      {style}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Content Difficulty</Label>
              <Slider
                value={[localPreferences['content_difficulty'] || 50]}
                onValueChange={([value]) => updateLocalPreference('content', 'difficulty', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timing Preferences</CardTitle>
          <p className="text-gray-600">When you prefer to engage with content</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['morning', 'afternoon', 'evening', 'night'].map(time => (
              <div key={time} className="flex items-center space-x-2">
                <Switch
                  checked={localPreferences['timing_preferred_times']?.includes(time) || false}
                  onCheckedChange={(checked) => {
                    const currentTimes = localPreferences['timing_preferred_times'] || []
                    const newTimes = checked 
                      ? [...currentTimes, time]
                      : currentTimes.filter((t: string) => t !== time)
                    updateLocalPreference('timing', 'preferred_times', newTimes)
                  }}
                />
                <Label className="capitalize">{time}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Preferences</CardTitle>
          <p className="text-gray-600">How you prefer to interact with the app</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Coaching Notifications</Label>
                <p className="text-sm text-gray-600">Receive AI coaching suggestions</p>
              </div>
              <Switch
                checked={localPreferences['interaction_coaching_notifications'] || false}
                onCheckedChange={(checked) => 
                  updateLocalPreference('interaction', 'coaching_notifications', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Progress Reminders</Label>
                <p className="text-sm text-gray-600">Get reminded about your goals</p>
              </div>
              <Switch
                checked={localPreferences['interaction_progress_reminders'] || false}
                onCheckedChange={(checked) => 
                  updateLocalPreference('interaction', 'progress_reminders', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Partner Insights</Label>
                <p className="text-sm text-gray-600">Share insights with your partner</p>
              </div>
              <Switch
                checked={localPreferences['interaction_partner_insights'] || false}
                onCheckedChange={(checked) => 
                  updateLocalPreference('interaction', 'partner_insights', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ===== INSIGHTS =====

function PersonalizationInsights({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <p className="text-gray-600">Personalized recommendations based on your profile</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <InsightCard
            title="Optimal Learning Time"
            insight={getOptimalLearningTime(profile)}
            icon={<FiClock className="w-5 h-5" />}
          />
          <InsightCard
            title="Communication Strengths"
            insight={getCommunicationStrengths(profile)}
            icon={<FiMic className="w-5 h-5" />}
          />
          <InsightCard
            title="Growth Opportunities"
            insight={getGrowthOpportunities(profile)}
            icon={<FiTrendingUp className="w-5 h-5" />}
          />
          <InsightCard
            title="Recommended Content"
            insight={getContentRecommendations(profile)}
            icon={<FiBook className="w-5 h-5" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function InsightCard({ title, insight, icon }: {
  title: string;
  insight: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-gray-700 mt-1">{insight}</p>
        </div>
      </div>
    </div>
  )
}

// ===== HELPER FUNCTIONS =====

function getPersonalityType(traits: PersonalityTraits): string {
  // Simplified personality type based on dominant traits
  if (traits.extraversion > 60 && traits.openness > 60) return 'Explorer'
  if (traits.conscientiousness > 70 && traits.agreeableness > 60) return 'Supporter'
  if (traits.openness > 70 && traits.conscientiousness > 60) return 'Innovator'
  if (traits.agreeableness > 70 && traits.extraversion > 60) return 'Connector'
  return 'Balanced'
}

function getTopPersonalityTraits(traits: PersonalityTraits) {
  const traitEntries = [
    { name: 'Openness', score: traits.openness },
    { name: 'Conscientiousness', score: traits.conscientiousness },
    { name: 'Extraversion', score: traits.extraversion },
    { name: 'Agreeableness', score: traits.agreeableness },
    { name: 'Emotional Stability', score: 100 - traits.neuroticism }
  ]
  
  return traitEntries
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(trait => ({
      ...trait,
      level: trait.score > 70 ? 'High' : trait.score > 30 ? 'Moderate' : 'Low'
    }))
}

function CategoryIcon({ category }: { category: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    content: <FiBook className="w-4 h-4" />,
    interaction: <FiSettings className="w-4 h-4" />,
    timing: <FiClock className="w-4 h-4" />,
    communication: <FiMic className="w-4 h-4" />,
    coaching: <FiTarget className="w-4 h-4" />,
    interface: <FiEye className="w-4 h-4" />,
    privacy: <FiUser className="w-4 h-4" />
  }
  
  return iconMap[category] || <FiSettings className="w-4 h-4" />
}

function getOptimalLearningTime(profile: UserProfile): string {
  const timingPrefs = profile.preferences.filter(p => p.category === 'timing')
  if (timingPrefs.length > 0) {
    return `Based on your activity patterns, you're most engaged during ${timingPrefs[0].value} sessions.`
  }
  return "We're still learning your optimal times. Keep using the app to get personalized timing insights!"
}

function getCommunicationStrengths(profile: UserProfile): string {
  const { communicationStyle, agreeableness, extraversion } = profile.personalityTraits
  
  if (communicationStyle === 'direct' && extraversion > 60) {
    return "You excel at clear, straightforward communication that gets results quickly."
  } else if (communicationStyle === 'expressive' && agreeableness > 70) {
    return "Your expressive and empathetic communication style helps create emotional connections."
  } else {
    return "Your balanced communication approach adapts well to different situations and partners."
  }
}

function getGrowthOpportunities(profile: UserProfile): string {
  const { openness, conscientiousness } = profile.personalityTraits
  
  if (openness > 70 && conscientiousness < 50) {
    return "Consider focusing on structured goal-setting to channel your creativity effectively."
  } else if (conscientiousness > 70 && openness < 50) {
    return "Try exploring new relationship experiences to add spontaneity to your routine."
  } else {
    return "Focus on developing emotional intelligence and active listening skills for deeper connections."
  }
}

function getContentRecommendations(profile: UserProfile): string {
  const { learningStyle, openness } = profile.personalityTraits
  
  if (learningStyle === 'visual' && openness > 60) {
    return "Interactive visual exercises and relationship mapping activities would suit you well."
  } else if (learningStyle === 'auditory') {
    return "Guided meditation, podcasts, and conversation exercises are ideal for your learning style."
  } else {
    return "Hands-on relationship challenges and experiential learning activities are perfect for you."
  }
} 