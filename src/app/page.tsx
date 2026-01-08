'use client'

import { useState } from 'react'
import RestaurantSearch from '@/components/RestaurantSearch'

interface Restaurant {
  name: string
  address: string
  placeId: string
}

export default function Home() {
  const [selected, setSelected] = useState<Restaurant | null>(null)

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">NomNomNow 🍜</h1>
      
      <RestaurantSearch onSelect={setSelected} />

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold text-lg">{selected.name}</h2>
          <p className="text-gray-600 text-sm">{selected.address}</p>
        </div>
      )}
    </main>
  )
}