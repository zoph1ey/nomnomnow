'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import CopyProfileLink from '@/components/CopyProfileLink'
import { saveRestaurant, DietaryTag, DIETARY_TAGS, ContextTag, CONTEXT_TAGS } from '@/lib/supabase/restaurants'

// Display labels for dietary filter chips
const DIETARY_LABELS: Record<DietaryTag, string> = {
  'halal': 'Halal',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
}

// Display labels for context filter chips
const CONTEXT_LABELS: Record<ContextTag, string> = {
  'date-night': 'Date Night',
  'solo-friendly': 'Solo Friendly',
  'group-friendly': 'Group Friendly',
  'special-occasion': 'Special Occasion',
  'quick-lunch': 'Quick Lunch',
  'late-night': 'Late Night',
  'family-friendly': 'Family Friendly',
  'work-meeting': 'Work Meeting',
  'casual-hangout': 'Casual Hangout',
}
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
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag[]>([])
  const [contextFilter, setContextFilter] = useState<ContextTag[]>([])

  const togglePriceFilter = (level: number) => {
    setPriceFilter(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  const toggleDietaryFilter = (tag: DietaryTag) => {
    setDietaryFilter(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleContextFilter = (tag: ContextTag) => {
    setContextFilter(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
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

  // Landing page for non-logged-in users
  if (!user) {
    return (
      <main className="min-h-screen">
        {/* Navigation */}
        <nav className="max-w-4xl mx-auto px-8 py-6">
          <span className="text-2xl font-bold">NomNomNow 🍜</span>
        </nav>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Can&apos;t decide what to eat?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Tell us your mood. We&apos;ll pick the perfect spot from your saved favorites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold text-lg"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="bg-gray-50 dark:bg-gray-800/50 py-12">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-center text-lg font-medium text-gray-500 dark:text-gray-400 mb-8">You&apos;re not alone</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-purple-500 mb-2">80%</p>
                <p className="text-gray-600 dark:text-gray-400">of people don&apos;t know what they&apos;re in the mood for</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-500 mb-2">90%</p>
                <p className="text-gray-600 dark:text-gray-400">just go back to places they already know</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-500 mb-2">70%</p>
                <p className="text-gray-600 dark:text-gray-400">forget about restaurants they wanted to try</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="max-w-4xl mx-auto px-8 py-16">
          {/* Feature 1: AI Picker */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Mood Picker</h3>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Not sure what you want? We&apos;ll figure it out together.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Our AI asks a few quick questions about your mood, cravings, and the occasion—then picks the perfect restaurant from your saved list. No more scrolling through apps. No more &quot;I don&apos;t know, what do you want?&quot;
            </p>
          </div>

          {/* Feature 2: Restaurant List */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Restaurant List</h3>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Save all your spots in one place.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Never forget that place your friend recommended. Add ratings, notes, price ranges, and tags like &quot;date night&quot; or &quot;quick lunch&quot; to find the right spot instantly.
            </p>
          </div>

          {/* Feature 3: Social */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Share with Friends</h3>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              See where your friends love to eat.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Get trusted recommendations from people you actually know. Share your public profile or keep it private—you&apos;re in control.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-purple-500 to-blue-500 py-16">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stop scrolling. Start eating.</h2>
            <p className="text-white/80 mb-8 text-lg">Join thousands who&apos;ve solved their dinner dilemma.</p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-8 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>NomNomNow — Because &quot;I don&apos;t know, what do you want?&quot; is not a dinner plan.</p>
        </footer>
      </main>
    )
  }

  // Logged-in user app
  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NomNomNow 🍜</h1>
        <div className="text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
            <Link
              href="/settings"
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
        </div>
      </div>

      <RestaurantSearch onSelect={setSelected} />

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selected.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{selected.address}</p>
          <button
            onClick={() => setShowSaveModal(true)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Save
          </button>
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

      <Link
        href="/picker"
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
      >
        Can&apos;t decide? Try AI Picker
      </Link>

      {/* Price Filter */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter by price:</span>
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
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
        {priceFilter.length > 0 && (
          <button
            onClick={() => setPriceFilter([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dietary Filter */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Dietary:</span>
        {DIETARY_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleDietaryFilter(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              dietaryFilter.includes(tag)
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
            }`}
          >
            {DIETARY_LABELS[tag]}
          </button>
        ))}
        {dietaryFilter.length > 0 && (
          <button
            onClick={() => setDietaryFilter([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Context/Occasion Filter */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Best for:</span>
        {CONTEXT_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleContextFilter(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              contextFilter.includes(tag)
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            {CONTEXT_LABELS[tag]}
          </button>
        ))}
        {contextFilter.length > 0 && (
          <button
            onClick={() => setContextFilter([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      <SavedRestaurants refreshTrigger={refreshTrigger} priceFilter={priceFilter} dietaryFilter={dietaryFilter} contextFilter={contextFilter} />

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
    </main>
  )
}
