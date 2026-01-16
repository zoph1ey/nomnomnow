'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMyProfile, type Profile } from '@/lib/supabase/profiles'
import LandingPage from '@/components/LandingPage'
import HomePage from '@/components/HomePage'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        try {
          const profileData = await getMyProfile()
          setProfile(profileData)
        } catch (err) {
          console.error('Failed to load profile:', err)
        }
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = () => {
    setUser(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return <HomePage user={user} profile={profile} onLogout={handleLogout} />
}
