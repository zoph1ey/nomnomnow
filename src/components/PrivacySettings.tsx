'use client'

import { useState } from 'react'
import { updateProfileVisibility, type Profile, type ProfileVisibility } from '@/lib/supabase/profiles'

interface PrivacySettingsProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone can see your restaurant list' },
  { value: 'friends_only', label: 'Friends Only', description: 'Only approved friends can see your list' },
  { value: 'private', label: 'Private', description: 'Only you can see your restaurant list' },
]

export default function PrivacySettings({ profile, onProfileUpdate }: PrivacySettingsProps) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = async (visibility: ProfileVisibility) => {
    setSuccess(false)
    setSaving(true)

    try {
      const updated = await updateProfileVisibility(visibility)
      onProfileUpdate(updated)
      setSuccess(true)
    } catch (err) {
      console.error('Failed to update visibility:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Profile Privacy</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Control who can see your restaurant list
      </p>
      <div className="space-y-2">
        {VISIBILITY_OPTIONS.map(({ value, label, description }) => (
          <label
            key={value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              profile?.profile_visibility === value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name="visibility"
              value={value}
              checked={profile?.profile_visibility === value}
              onChange={() => handleChange(value)}
              disabled={saving}
              className="w-4 h-4 text-blue-500"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </label>
        ))}
      </div>
      {saving && (
        <p className="mt-2 text-sm text-gray-500">Saving...</p>
      )}
      {success && !saving && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">Privacy setting saved!</p>
      )}
    </div>
  )
}
