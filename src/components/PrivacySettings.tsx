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
    <div className="space-y-3">
      <div className="space-y-2">
        {VISIBILITY_OPTIONS.map(({ value, label, description }) => (
          <label
            key={value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              profile?.profile_visibility === value
                ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50'
                : 'border-orange-100 hover:bg-orange-50/50'
            }`}
          >
            <input
              type="radio"
              name="visibility"
              value={value}
              checked={profile?.profile_visibility === value}
              onChange={() => handleChange(value)}
              disabled={saving}
              className="w-4 h-4 text-orange-500 accent-orange-500"
            />
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </label>
        ))}
      </div>
      {saving && (
        <p className="text-sm text-muted-foreground">Saving...</p>
      )}
      {success && !saving && (
        <p className="text-sm text-green-600">✓ Privacy setting saved!</p>
      )}
    </div>
  )
}
