'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RestaurantSearch from '@/components/RestaurantSearch'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleSave = async () => {
    if (!selected) return
    setError(null)
    try {
      await saveRestaurant({
        name: selected.name,
        address: selected.address,
        place_id: selected.placeId,
      })
      alert('Saved!')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {user ? (
            <button
              onClick={handleSave}
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
    </main>
  )
}
