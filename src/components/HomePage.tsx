'use client'

import { useState } from 'react'
import Link from 'next/link'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import CopyProfileLink from '@/components/CopyProfileLink'
import RestaurantFilters from '@/components/RestaurantFilters'
import { saveRestaurant, DietaryTag, ContextTag } from '@/lib/supabase/restaurants'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/profiles'
import type { User } from '@supabase/supabase-js'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Restaurant {
  name: string
  address: string
  placeId: string
  countryCode: string | null
}

interface HomePageProps {
  user: User
  profile: Profile | null
  onLogout: () => void
}

export default function HomePage({ user, profile, onLogout }: HomePageProps) {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [priceFilter, setPriceFilter] = useState<number[]>([])
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag[]>([])
  const [contextFilter, setContextFilter] = useState<ContextTag[]>([])

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
    onLogout()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/logo.png"
                alt="nomnomnow"
                className="h-9 w-auto"
              />
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {profile?.username ? `@${profile.username}` : user.email}
              </span>
              <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/settings">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar - Full Width */}
        <div className="mb-8">
          <RestaurantSearch onSelect={setSelected} />
        </div>

        {/* Selected Restaurant Preview */}
        {selected && (
          <Card className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 py-0">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{selected.name}</h2>
                  <p className="text-muted-foreground text-sm">{selected.address}</p>
                </div>
                <Button onClick={() => setShowSaveModal(true)} className="bg-orange-500 hover:bg-orange-600">
                  + Save Restaurant
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Split Layout */}
        <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-8">
          {/* Left Sidebar - Sticky */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* AI Picker Card */}
            <Card>
              <CardContent className="py-1 px-4"> {/* Standard top padding for the whole card */}
                <CardTitle className="text-lg mb-1 leading-tight"> {/* Control the gap with mb-1 */}
                  Can&apos;t Decide?
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-4">
                  Let our AI pick the perfect spot based on your mood
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <Link href="/picker">✨ Try AI Picker</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card className="border-orange-100 bg-white/80">
              <CardContent className="py-1 px-4">
                <CardTitle className="text-base mb-2 leading-none">Filters</CardTitle>

                <RestaurantFilters
                  priceFilter={priceFilter}
                  dietaryFilter={dietaryFilter}
                  contextFilter={contextFilter}
                  onPriceChange={setPriceFilter}
                  onDietaryChange={setDietaryFilter}
                  onContextChange={setContextFilter}
                />
              </CardContent>
            </Card>

            {/* Share Profile Card */}
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50">
              <CardContent>
                <CardTitle className="text-base mb-2 leading-none flex items-center gap-2">
                  <span className="text-orange-500">👥</span> Share Your List
                </CardTitle>
                {profile?.username ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Share your restaurant recommendations with friends
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-white/80 border border-orange-100 px-3 py-2 rounded-md overflow-x-auto">
                        /user/{profile.username}
                      </code>
                      <CopyProfileLink username={profile.username} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Set up your username to share your list with friends!
                    </p>
                    <Button asChild variant="outline" className="w-full border-orange-200 hover:bg-orange-50">
                      <Link href="/settings">
                        Set Up Username
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Restaurant List */}
          <div className="bg-white/60 rounded-xl p-6 border border-orange-100/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-orange-500">📍</span> Your Saved Restaurants
              </h2>
            </div>
            <Separator className="mb-6 bg-orange-100" />
            <SavedRestaurants
              refreshTrigger={refreshTrigger}
              priceFilter={priceFilter}
              dietaryFilter={dietaryFilter}
              contextFilter={contextFilter}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
