'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  FiClock, 
  FiCalendar, 
  FiZap, 
  FiSettings, 
  FiBell,
  FiTarget,
  FiRefreshCw,
  FiCheckCircle,
  FiBarChart,
  FiActivity
} from 'react-icons/fi'
import { smartScheduler } from '../lib/smart-scheduling'
import { useAuth } from '../contexts/AuthContext'

interface AutomationDashboardProps {
  userId?: string
}

export default function AutomationDashboard({ userId }: AutomationDashboardProps) {
  const { user } = useAuth()
  const currentUserId = userId || user?.uid || ''
  
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    if (currentUserId) {
      loadAutomationData()
    }
  }, [currentUserId])

  const loadAutomationData = async () => {
    try {
      setLoading(true)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const [scheduleSuggestions, userEvents, userPrefs] = await Promise.all([
        smartScheduler.generateSmartSchedule(currentUserId),
        smartScheduler.getUserEvents(currentUserId, today, nextWeek),
        smartScheduler.getSchedulingPreferences(currentUserId)
      ])

      setSuggestions(scheduleSuggestions)
      setEvents(userEvents)
      setPreferences(userPrefs)
    } catch (error) {
      console.error('Error loading automation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const acceptSuggestion = async (suggestionId: string) => {
    try {
      await smartScheduler.acceptSuggestion(suggestionId)
      await loadAutomationData() // Refresh data
    } catch (error) {
      console.error('Error accepting suggestion:', error)
    }
  }

  const updatePreference = async (key: string, value: any) => {
    try {
      await smartScheduler.updateSchedulingPreferences(currentUserId, {
        [key]: value
      })
      setPreferences((prev: any) => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error('Error updating preference:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading automation features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Automation</h1>
          <p className="text-gray-600 mt-2">
            AI-powered scheduling and intelligent relationship workflows
          </p>
        </div>
        <Button onClick={loadAutomationData} variant="outline">
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Automation Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Automations</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <FiZap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Events</p>
                <p className="text-2xl font-bold text-green-600">{events.length}</p>
              </div>
              <FiCalendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Smart Suggestions</p>
                <p className="text-2xl font-bold text-purple-600">{suggestions.length}</p>
              </div>
              <FiBell className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">94%</p>
              </div>
              <FiTarget className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">
            <FiCalendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <FiBell className="w-4 h-4 mr-2" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="automations">
            <FiZap className="w-4 h-4 mr-2" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="settings">
            <FiSettings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startTime).toLocaleDateString()} at{' '}
                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={event.aiGenerated ? 'default' : 'secondary'}>
                          {event.aiGenerated ? 'AI Generated' : 'Manual'}
                        </Badge>
                        <Badge variant="outline">{event.duration}min</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiCalendar className="w-12 h-12 mx-auto mb-4" />
                    <p>No upcoming events scheduled</p>
                    <p className="text-sm">Check the suggestions tab for AI-generated recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <p className="text-gray-600">Smart suggestions based on your relationship patterns</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{suggestion.title}</h4>
                        <p className="text-gray-600 mt-1">{suggestion.description}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="w-4 h-4 mr-1" />
                            {new Date(suggestion.suggestedTime).toLocaleDateString()} at{' '}
                            {new Date(suggestion.suggestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiActivity className="w-4 h-4 mr-1" />
                            {suggestion.duration} minutes
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Why this suggestion:</p>
                          <ul className="text-sm text-gray-600 mt-1">
                            {suggestion.reasoning.map((reason: string, i: number) => (
                              <li key={i}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <Badge variant="outline">Priority: {suggestion.priority}/10</Badge>
                        <Button
                          size="sm"
                          onClick={() => acceptSuggestion(suggestion.id)}
                        >
                          <FiCheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiBell className="w-12 h-12 mx-auto mb-4" />
                    <p>No new suggestions available</p>
                    <p className="text-sm">Check back later for personalized recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Automations</CardTitle>
              <p className="text-gray-600">Intelligent workflows running in the background</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AutomationItem
                  title="Daily Check-in Reminders"
                  description="Automatically schedules daily connection moments"
                  enabled={true}
                  onToggle={() => {}}
                />
                <AutomationItem
                  title="Goal Progress Tracking"
                  description="Monitors goal progress and suggests adjustments"
                  enabled={true}
                  onToggle={() => {}}
                />
                <AutomationItem
                  title="Conflict Prevention Alerts"
                  description="Detects potential relationship tensions and provides guidance"
                  enabled={false}
                  onToggle={() => {}}
                />
                <AutomationItem
                  title="Achievement Celebrations"
                  description="Automatically recognizes and celebrates milestones"
                  enabled={true}
                  onToggle={() => {}}
                />
                <AutomationItem
                  title="Smart Content Curation"
                  description="Delivers personalized content based on your interests"
                  enabled={true}
                  onToggle={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {preferences && (
            <Card>
              <CardHeader>
                <CardTitle>Automation Preferences</CardTitle>
                <p className="text-gray-600">Customize how AI assists your relationship</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow AI Scheduling</Label>
                      <p className="text-sm text-gray-600">Let AI automatically schedule activities</p>
                    </div>
                    <Switch
                      checked={preferences.allowAIScheduling}
                      onCheckedChange={(checked) => updatePreference('allowAIScheduling', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Times</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['morning', 'afternoon', 'evening'].map(time => (
                        <Button
                          key={time}
                          variant={preferences.preferredTimes?.includes(time) ? 'primary' : 'outline'}
                          size="sm"
                          className="capitalize"
                          onClick={() => {
                            const currentTimes = preferences.preferredTimes || []
                            const newTimes = currentTimes.includes(time)
                              ? currentTimes.filter((t: string) => t !== time)
                              : [...currentTimes, time]
                            updatePreference('preferredTimes', newTimes)
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Daily Activities</Label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={preferences.maxDailyActivities || 3}
                        onChange={(e) => updatePreference('maxDailyActivities', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600">10</span>
                      <span className="font-medium w-8">{preferences.maxDailyActivities || 3}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Activity Duration</Label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">5min</span>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={preferences.preferredDuration || 20}
                        onChange={(e) => updatePreference('preferredDuration', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600">2hr</span>
                      <span className="font-medium w-12">{preferences.preferredDuration || 20}min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AutomationItem({ 
  title, 
  description, 
  enabled, 
  onToggle 
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge variant={enabled ? 'default' : 'secondary'}>
          {enabled ? 'Active' : 'Inactive'}
        </Badge>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  )
} 