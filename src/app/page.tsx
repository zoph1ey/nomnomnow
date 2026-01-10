'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import { saveRestaurant } from '@/lib/supabase/restaurants'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Restaurant {
  name: string
  address: string
  placeId: string
}

export default function Home() {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
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
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NomNomNow 🍜</h1>
        <div className="text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{user.email}</span>
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
          <SavedRestaurants refreshTrigger={refreshTrigger} />
        </>
      )}
    </main>
  )
}
