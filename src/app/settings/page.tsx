'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMyProfile, updateUsername, validateUsername, type Profile } from '@/lib/supabase/profiles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import CopyProfileLink from '@/components/CopyProfileLink'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      try {
        const profileData = await getMyProfile()
        setProfile(profileData)
        setUsername(profileData?.username || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

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
      setProfile(updated)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Username
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationError}</p>
            )}
            {username && !validationError && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your profile will be at: <span className="font-mono text-gray-800 dark:text-gray-200">/user/{username}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-green-700 dark:text-green-400 text-sm">Username updated successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !!validationError || !username || username === profile?.username}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Username'}
          </button>
        </form>

        {profile?.username && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Share Your Profile</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                {typeof window !== 'undefined' ? window.location.origin : ''}/user/{profile.username}
              </code>
              <CopyProfileLink username={profile.username} />
            </div>
            <Link
              href={`/user/${profile.username}`}
              className="inline-block mt-3 text-sm text-blue-500 dark:text-blue-400 hover:underline"
            >
              View your public profile
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
