'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import CopyProfileLink from '@/components/CopyProfileLink'
import RestaurantFilters from '@/components/RestaurantFilters'
import { saveRestaurant, DietaryTag, ContextTag } from '@/lib/supabase/restaurants'
import { getPendingRequestsCount } from '@/lib/supabase/friends'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/profiles'
import type { User } from '@supabase/supabase-js'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UsersIcon, type UsersIconHandle } from '@/components/ui/users'
import { BotMessageSquareIcon, type BotMessageSquareHandle } from '@/components/ui/bot-message-square'
import { MapPinIcon, type MapPinIconHandle } from '@/components/ui/map-pin'
import { SettingsIcon, type SettingsIconHandle } from '@/components/ui/settings'
import { LogoutIcon, type LogoutIconHandle } from '@/components/ui/logout'

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
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const usersIconRef = useRef<UsersIconHandle>(null)
  const botIconRef = useRef<BotMessageSquareHandle>(null)
  const mapPinIconRef = useRef<MapPinIconHandle>(null)
  const settingsIconRef = useRef<SettingsIconHandle>(null)
  const logoutIconRef = useRef<LogoutIconHandle>(null)

  useEffect(() => {
    getPendingRequestsCount().then(setPendingRequestsCount)
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
    onLogout()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <img
                src="/logo.png"
                alt="nomnomnow"
                className="h-7 sm:h-9 w-auto"
              />
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {profile?.username ? `@${profile.username}` : user.email}
              </span>
              <Button
                asChild
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white relative"
                onMouseEnter={() => settingsIconRef.current?.startAnimation()}
                onMouseLeave={() => settingsIconRef.current?.stopAnimation()}
              >
                <Link href="/settings" className="flex items-center gap-1.5">
                  <SettingsIcon ref={settingsIconRef} size={16} />
                  <span className="hidden sm:inline">Settings</span>
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                onMouseEnter={() => logoutIconRef.current?.startAnimation()}
                onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <LogoutIcon ref={logoutIconRef} size={16} />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
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
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 lg:gap-8">
          {/* Left Sidebar - Sticky */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* AI Picker Card */}
            <Card
              onMouseEnter={() => botIconRef.current?.startAnimation()}
              onMouseLeave={() => botIconRef.current?.stopAnimation()}
            >
              <CardContent className="py-1 px-4">
                <CardTitle className="text-lg mb-2 leading-none flex items-center gap-2">
                  <BotMessageSquareIcon ref={botIconRef} className="text-purple-500" /> Can&apos;t Decide?
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-4">
                  Let our AI pick the perfect spot based on your mood
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <Link href="/picker">Try AI Picker</Link>
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
            <Card
              className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50"
              onMouseEnter={() => usersIconRef.current?.startAnimation()}
              onMouseLeave={() => usersIconRef.current?.stopAnimation()}
            >
              <CardContent>
                <CardTitle className="text-base mb-2 leading-none flex items-center gap-2">
                  <UsersIcon ref={usersIconRef} className="text-orange-500" /> Share Your List
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
                      <Link href="/settings?tab=profile">
                        Set Up Username
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Restaurant List */}
          <div
            className="bg-white/60 rounded-xl p-6 border border-orange-100/50"
            onMouseEnter={() => mapPinIconRef.current?.startAnimation()}
            onMouseLeave={() => mapPinIconRef.current?.stopAnimation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPinIcon ref={mapPinIconRef} className="text-orange-500" size={24} /> Your Saved Restaurants
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
