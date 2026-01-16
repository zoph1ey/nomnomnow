'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMyProfile, type Profile } from '@/lib/supabase/profiles'
import { detectCurrency } from '@/lib/currency'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import UsernameForm from '@/components/UsernameForm'
import CurrencySelector from '@/components/CurrencySelector'
import PrivacySettings from '@/components/PrivacySettings'
import FriendsSection from '@/components/FriendsSection'
import CopyProfileLink from '@/components/CopyProfileLink'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
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
        // Set default currency if not set
        if (profileData && !profileData.currency) {
          profileData.currency = detectCurrency()
        }
        setProfile(profileData)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
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

        <UsernameForm profile={profile} onProfileUpdate={handleProfileUpdate} />

        <CurrencySelector profile={profile} onProfileUpdate={handleProfileUpdate} />

        <PrivacySettings profile={profile} onProfileUpdate={handleProfileUpdate} />

        <FriendsSection userId={user.id} />

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
