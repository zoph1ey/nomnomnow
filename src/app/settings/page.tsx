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
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type SettingsSection = 'account' | 'profile' | 'currency' | 'privacy' | 'friends' | 'share'

const SETTINGS_NAV: { id: SettingsSection; label: string; icon: string; description: string }[] = [
  { id: 'account', label: 'Account', icon: '👤', description: 'Your account details' },
  { id: 'profile', label: 'Profile', icon: '✏️', description: 'Username & public profile' },
  { id: 'currency', label: 'Currency', icon: '💰', description: 'Price display preferences' },
  { id: 'privacy', label: 'Privacy', icon: '🔒', description: 'Who can see your list' },
  { id: 'friends', label: 'Friends', icon: '👥', description: 'Manage your connections' },
  { id: 'share', label: 'Share', icon: '🔗', description: 'Share your profile' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
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
      <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Account Details</h2>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>
            <Card className="border-orange-100 bg-white/80 py-0">
              <CardContent className="py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="text-lg font-medium mt-1">{user.email}</p>
                  </div>
                  <Separator className="bg-orange-100" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                    <p className="text-sm font-mono text-muted-foreground mt-1">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Customize your public profile</p>
            </div>
            <Card className="border-orange-100 bg-white/80 py-0">
              <CardContent className="py-4">
                <UsernameForm profile={profile} onProfileUpdate={handleProfileUpdate} />
              </CardContent>
            </Card>
          </div>
        )

      case 'currency':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Currency Preferences</h2>
              <p className="text-sm text-muted-foreground">Set your preferred currency for price displays</p>
            </div>
            <Card className="border-orange-100 bg-white/80 py-0">
              <CardContent className="py-4">
                <CurrencySelector profile={profile} onProfileUpdate={handleProfileUpdate} />
              </CardContent>
            </Card>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Privacy Settings</h2>
              <p className="text-sm text-muted-foreground">Control who can see your restaurant list</p>
            </div>
            <Card className="border-orange-100 bg-white/80 py-0">
              <CardContent className="py-4">
                <PrivacySettings profile={profile} onProfileUpdate={handleProfileUpdate} />
              </CardContent>
            </Card>
          </div>
        )

      case 'friends':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Friends</h2>
              <p className="text-sm text-muted-foreground">Manage your friend connections</p>
            </div>
            <Card className="border-orange-100 bg-white/80 py-0">
              <CardContent className="py-4">
                <FriendsSection userId={user.id} />
              </CardContent>
            </Card>
          </div>
        )

      case 'share':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Share Your Profile</h2>
              <p className="text-sm text-muted-foreground">Let friends discover your restaurant recommendations</p>
            </div>
            {profile?.username ? (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 py-0">
                <CardContent className="py-4">
                  <label className="text-sm font-medium text-muted-foreground">Your Profile URL</label>
                  <div className="flex items-center gap-3 mt-2">
                    <code className="flex-1 text-sm bg-white/80 border border-orange-100 px-3 py-2 rounded-md overflow-x-auto">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/user/{profile.username}
                    </code>
                    <CopyProfileLink username={profile.username} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 py-0">
                <CardContent className="py-4 space-y-4">
                  <p className="text-muted-foreground">
                    Set up a username first to get your shareable profile link.
                  </p>
                  <Button
                    onClick={() => setActiveSection('profile')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Set Up Username
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hover:bg-orange-50">
              <Link href="/">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6 bg-orange-200" />
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-orange-500">⚙️</span> Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="space-y-2 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-orange-100 bg-white/80">
              <CardContent className="p-2">
                {SETTINGS_NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-orange-100 to-amber-50 text-orange-700 font-medium'
                        : 'hover:bg-orange-50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${activeSection === item.id ? 'font-medium' : ''}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    {activeSection === item.id && (
                      <div className="w-1 h-8 bg-orange-400 rounded-full" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Content */}
          <div className="bg-white/60 rounded-xl p-6 border border-orange-100/50 min-h-[500px]">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </main>
  )
}
