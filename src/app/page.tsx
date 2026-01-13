'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import CopyProfileLink from '@/components/CopyProfileLink'
import { saveRestaurant } from '@/lib/supabase/restaurants'
import { getMyProfile, type Profile } from '@/lib/supabase/profiles'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Restaurant {
  name: string
  address: string
  placeId: string
  countryCode: string | null
}

export default function Home() {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [priceFilter, setPriceFilter] = useState<number[]>([])

  const togglePriceFilter = (level: number) => {
    setPriceFilter(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

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
    })
  }, [])

  const handleSave = async (data: {
    name: string
    address: string
    place_id: string
    tags: string[]
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    currency: string
  }) => {
    await saveRestaurant(data)
    setSelected(null)
    setShowSaveModal(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NomNomNow 🍜</h1>
        <div className="text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{user.email}</span>
              <Link
                href="/settings"
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="text-blue-500 hover:underline">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
              <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      <RestaurantSearch onSelect={setSelected} />

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold text-lg">{selected.name}</h2>
          <p className="text-gray-600 text-sm">{selected.address}</p>
          {user ? (
            <button
              onClick={() => setShowSaveModal(true)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Save
            </button>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              <Link href="/login" className="text-blue-500 hover:underline">Log in</Link> to save restaurants
            </p>
          )}
        </div>
      )}

      {showSaveModal && selected && (
        <SaveRestaurantModal
          restaurant={selected}
          onSave={handleSave}
          onCancel={() => {
            setShowSaveModal(false)
            setSelected(null)
          }}
        />
      )}

      {user && (
        <>
          <Link
            href="/picker"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
          >
            Can&apos;t decide? Try AI Picker
          </Link>

          {/* Price Filter */}
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filter by price:</span>
            {[
              { level: 1, label: '$' },
              { level: 2, label: '$$' },
              { level: 3, label: '$$$' },
              { level: 4, label: '$$$$' }
            ].map(({ level, label }) => (
              <button
                key={level}
                onClick={() => togglePriceFilter(level)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  priceFilter.includes(level)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {label}
              </button>
            ))}
            {priceFilter.length > 0 && (
              <button
                onClick={() => setPriceFilter([])}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </div>

          <SavedRestaurants refreshTrigger={refreshTrigger} priceFilter={priceFilter} />

          {profile?.username ? (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Share your restaurant list:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-gray-800 dark:text-gray-200">
                  /user/{profile.username}
                </code>
                <CopyProfileLink username={profile.username} />
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                Set up your username to share your restaurant list with friends!
              </p>
              <Link
                href="/settings"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Go to settings
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  )
}
