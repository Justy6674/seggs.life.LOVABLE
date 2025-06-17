'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../lib/firebase'
import { UserService } from '../../lib/database'
import { PushNotificationService } from '../../lib/pushService'
import type { User, PushSettings } from '../../lib/firebase'
import Image from 'next/image'

type SettingsCategory = 'overview' | 'notifications' | 'privacy' | 'relationship' | 'health' | 'account'

export default function Settings() {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [pushSettings, setPushSettings] = useState<PushSettings | null>(null)
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    } else if (user === null) {
      // User is not authenticated, stop loading and show error
      setLoading(false)
      setError('Please sign in to access settings')
    }
    // Note: user === undefined means still checking auth state, keep loading
  }, [user])

  const loadData = async () => {
    try {
      if (!user) return

      const [userDoc, pushSettingsDoc] = await Promise.all([
        UserService.getUser(user.uid),
        PushNotificationService.getPushSettings(user.uid)
      ])

      setUserData(userDoc)
      setPushSettings(pushSettingsDoc)
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: SettingsCategory) => {
    setActiveCategory(category)
  }

  const updatePushToggle = async (toggleName: keyof PushSettings['toggles'], value: boolean) => {
    if (!user) return

    setSaving(true)
    try {
      await PushNotificationService.updateToggleSetting(user.uid, toggleName, value)
      
      // Update local state
      if (pushSettings) {
        setPushSettings({
          ...pushSettings,
          toggles: {
            ...pushSettings.toggles,
            [toggleName]: value
          }
        })
      }

      showSuccess('Setting updated successfully')
    } catch (error) {
      console.error('Error updating toggle:', error)
      setError('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const updateUserSetting = async (field: keyof User, value: any) => {
    if (!user) return

    setSaving(true)
    try {
      await UserService.updateUser(user.uid, { [field]: value })
      
      // Update local state
      if (userData) {
        setUserData({ ...userData, [field]: value })
      }

      showSuccess('Setting updated successfully')
    } catch (error) {
      console.error('Error updating user setting:', error)
      setError('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean
    onChange: (value: boolean) => void
    disabled?: boolean 
  }) => (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled || saving}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-slate-600' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
        checked ? 'translate-x-7' : 'translate-x-1'
      }`}></div>
    </button>
  )

  const SettingItem = ({ 
    title, 
    description, 
    children,
    emoji 
  }: { 
    title: string
    description: string
    children: React.ReactNode
    emoji?: string 
  }) => (
    <div className="card p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          {emoji && <span className="text-lg">{emoji}</span>}
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-slate-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 relative">
              <Image 
                src="/SeggsLogoNoBackground.png"
                alt="seggs.life logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Settings</h1>
              <p className="text-gray-300">Customize your intimate experience</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', emoji: '🔍' },
              { id: 'notifications', label: 'Notifications', emoji: '🔔' },
              { id: 'privacy', label: 'Privacy', emoji: '🔒' },
              { id: 'relationship', label: 'Relationship', emoji: '💕' },
              { id: 'health', label: 'Health', emoji: '🏥' },
              { id: 'account', label: 'Account', emoji: '👤' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as SettingsCategory)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeCategory === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Notification Preferences</h2>
                
                {/* Mood & Desire Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Mood & Connection</h3>
                  <div className="space-y-4">
                    <SettingItem
                      emoji="💭"
                      title="Mood Nudges"
                      description="Get notified when your partner shares their mood"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.receiveMoodNudges || false}
                        onChange={(value) => updatePushToggle('receiveMoodNudges', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🔥"
                      title="Intimacy Alerts"
                      description="Receive discreet notifications when your partner is in the mood"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.receiveHornyAlerts || false}
                        onChange={(value) => updatePushToggle('receiveHornyAlerts', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="⚡"
                      title="Energy Check-ins"
                      description="Get prompted to share your energy levels"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.receiveEnergyChecks || false}
                        onChange={(value) => updatePushToggle('receiveEnergyChecks', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="✋"
                      title="Consent Prompts"
                      description="Gentle reminders about checking in with your partner"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.receiveConsentPrompts || false}
                        onChange={(value) => updatePushToggle('receiveConsentPrompts', value)}
                      />
                    </SettingItem>
                  </div>
                </div>

                {/* Health Reminders */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Health & Wellness</h3>
                  <div className="space-y-4">
                    <SettingItem
                      emoji="💊"
                      title="PrEP Reminders"
                      description="Medication and appointment reminders"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.prepReminders || false}
                        onChange={(value) => updatePushToggle('prepReminders', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🩺"
                      title="STI Check Reminders"
                      description="Regular sexual health screening reminders"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.stiCheckReminders || false}
                        onChange={(value) => updatePushToggle('stiCheckReminders', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🏥"
                      title="Health Appointments"
                      description="General health check-up reminders"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.pathologyReminders || false}
                        onChange={(value) => updatePushToggle('pathologyReminders', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🧠"
                      title="Mental Health Check-ins"
                      description="Gentle prompts for mental wellness"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.mentalHealthChecks || false}
                        onChange={(value) => updatePushToggle('mentalHealthChecks', value)}
                      />
                    </SettingItem>
                  </div>
                </div>

                {/* Timing Controls */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Timing & Frequency</h3>
                  <div className="space-y-4">
                    <SettingItem
                      emoji="🌙"
                      title="Respect Quiet Hours"
                      description="Honor your quiet time settings"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.nightModeEnabled || false}
                        onChange={(value) => updatePushToggle('nightModeEnabled', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="💼"
                      title="Work Hours Mode"
                      description="Limit notifications during work hours (9-5)"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.workHoursRespect || false}
                        onChange={(value) => updatePushToggle('workHoursRespect', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🎉"
                      title="Weekend Only"
                      description="Only receive notifications on weekends"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.weekendOnlyMode || false}
                        onChange={(value) => updatePushToggle('weekendOnlyMode', value)}
                      />
                    </SettingItem>
                  </div>
                </div>

                {/* Content Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Content & Suggestions</h3>
                  <div className="space-y-4">
                    <SettingItem
                      emoji="🤖"
                      title="AI Suggestions"
                      description="Receive personalised prompts and ideas"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.aiSuggestionsEnabled || false}
                        onChange={(value) => updatePushToggle('aiSuggestionsEnabled', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="📚"
                      title="Educational Content"
                      description="Tips, articles, and wellness information"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.educationalContentEnabled || false}
                        onChange={(value) => updatePushToggle('educationalContentEnabled', value)}
                      />
                    </SettingItem>

                    <SettingItem
                      emoji="🛍️"
                      title="Shopping Suggestions"
                      description="Product recommendations and deals"
                    >
                      <ToggleSwitch
                        checked={pushSettings?.toggles.shoppingSuggestionsEnabled || false}
                        onChange={(value) => updatePushToggle('shoppingSuggestionsEnabled', value)}
                      />
                    </SettingItem>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Privacy & Security</h2>
                
                <div className="space-y-4">
                  <SettingItem
                    emoji="🚨"
                    title="Panic Lock"
                    description="Quick way to hide the app in emergencies"
                  >
                    <ToggleSwitch
                      checked={userData?.panicLockEnabled || false}
                      onChange={(value) => updateUserSetting('panicLockEnabled', value)}
                    />
                  </SettingItem>

                  <SettingItem
                    emoji="🔐"
                    title="End-to-End Encryption"
                    description="All your data is encrypted (recommended)"
                  >
                    <ToggleSwitch
                      checked={userData?.encryptionEnabled || false}
                      onChange={(value) => updateUserSetting('encryptionEnabled', value)}
                    />
                  </SettingItem>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quiet Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={userData?.notificationPreferences?.quietHours?.start || '22:00'}
                        onChange={(e) => updateUserSetting('notificationPreferences', {
                          ...userData?.notificationPreferences,
                          quietHours: {
                            ...userData?.notificationPreferences?.quietHours,
                            start: e.target.value
                          }
                        })}
                        className="input-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={userData?.notificationPreferences?.quietHours?.end || '08:00'}
                        onChange={(e) => updateUserSetting('notificationPreferences', {
                          ...userData?.notificationPreferences,
                          quietHours: {
                            ...userData?.notificationPreferences?.quietHours,
                            end: e.target.value
                          }
                        })}
                        className="input-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'relationship' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Relationship Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Intensity Level</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'sweet', emoji: '💕', label: 'Sweet', desc: 'Gentle & romantic' },
                        { value: 'flirty', emoji: '😘', label: 'Flirty', desc: 'Playful & teasing' },
                        { value: 'spicy', emoji: '🔥', label: 'Spicy', desc: 'Passionate & sensual' },
                        { value: 'wild', emoji: '🌶️', label: 'Wild', desc: 'Bold & adventurous' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateUserSetting('intensityLevel', option.value)}
                          className={`card p-4 text-center transition-all ${
                            userData?.intensityLevel === option.value 
                              ? 'ring-2 ring-red-deep bg-slate-700' 
                              : 'hover:bg-slate-700'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.emoji}</div>
                          <div className="font-semibold text-white mb-1">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Safe Word</h3>
                    <input
                      type="text"
                      placeholder="Your safe word"
                      value={userData?.safeWord || ''}
                      onChange={(e) => updateUserSetting('safeWord', e.target.value)}
                      className="input-primary"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      This word will immediately pause any activity when used by either partner.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'health' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Health Preferences</h2>
                
                <div className="space-y-4">
                  <SettingItem
                    emoji="💊"
                    title="PrEP Reminders"
                    description="Get reminded about PrEP medications and check-ups"
                  >
                    <ToggleSwitch
                      checked={userData?.healthInterests?.prepReminders || false}
                      onChange={(value) => updateUserSetting('healthInterests', {
                        ...userData?.healthInterests,
                        prepReminders: value
                      })}
                    />
                  </SettingItem>

                  <SettingItem
                    emoji="📚"
                    title="STI Education"
                    description="Receive educational content about sexual health"
                  >
                    <ToggleSwitch
                      checked={userData?.healthInterests?.stiEducation || false}
                      onChange={(value) => updateUserSetting('healthInterests', {
                        ...userData?.healthInterests,
                        stiEducation: value
                      })}
                    />
                  </SettingItem>

                  <SettingItem
                    emoji="📱"
                    title="Telehealth Resources"
                    description="Quick access to telehealth providers for sexual health"
                  >
                    <ToggleSwitch
                      checked={userData?.healthInterests?.telehealthLinks || false}
                      onChange={(value) => updateUserSetting('healthInterests', {
                        ...userData?.healthInterests,
                        telehealthLinks: value
                      })}
                    />
                  </SettingItem>

                  <SettingItem
                    emoji="🏥"
                    title="Health Check Reminders"
                    description="Gentle reminders for regular health screenings"
                  >
                    <ToggleSwitch
                      checked={userData?.healthInterests?.pathologyReminders || false}
                      onChange={(value) => updateUserSetting('healthInterests', {
                        ...userData?.healthInterests,
                        pathologyReminders: value
                      })}
                    />
                  </SettingItem>
                </div>
              </div>
            )}

            {activeCategory === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Account Management</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={userData?.displayName || ''}
                          onChange={(e) => updateUserSetting('displayName', e.target.value)}
                          className="input-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={userData?.email || ''}
                          disabled
                          className="input-primary opacity-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Danger Zone</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      These actions are permanent and cannot be undone.
                    </p>
                    <div className="space-y-3">
                      <button className="btn-secondary text-red-400 border-red-400 hover:bg-red-900/30">
                        Delete All Data
                      </button>
                      <button className="btn-secondary text-red-400 border-red-400 hover:bg-red-900/30">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 mt-6"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 mt-6"
            >
              <p className="text-green-300 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 