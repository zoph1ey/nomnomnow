'use client'

import { useState, useEffect } from 'react'
import { updateUsername, validateUsername, type Profile } from '@/lib/supabase/profiles'

interface UsernameFormProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

export default function UsernameForm({ profile, onProfileUpdate }: UsernameFormProps) {
  const [username, setUsername] = useState(profile?.username || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Real-time validation as user types
  useEffect(() => {
    if (!username) {
      setValidationError(null)
      return
    }
    const validation = validateUsername(username)
    setValidationError(validation.valid ? null : validation.error || null)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (validationError) return

    setSaving(true)

    try {
      const updated = await updateUsername(username)
      onProfileUpdate(updated)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <p className="text-sm text-muted-foreground mb-2">
          Choose a unique username for your public profile URL
        </p>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => {
            setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
            setSuccess(false)
          }}
          placeholder="e.g., foodie_jane"
          className={`w-full px-3 py-2 border rounded-lg bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            validationError ? 'border-red-400' : 'border-orange-200'
          }`}
        />
        {validationError && (
          <p className="mt-1 text-sm text-red-600">{validationError}</p>
        )}
        {username && !validationError && (
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile will be at: <span className="font-mono text-orange-600">/user/{username}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">✓ Username updated successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !!validationError || !username || username === profile?.username}
        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Save Username'}
      </button>
    </form>
  )
}
