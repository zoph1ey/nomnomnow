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

    // Check auth and load profile
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
          const profileData = await getMyProfile()
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('Auth error:', err)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Listen for auth changes (login/logout only, not initial)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        loadUser()
      }
    })

    return () => subscription.unsubscribe()
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
