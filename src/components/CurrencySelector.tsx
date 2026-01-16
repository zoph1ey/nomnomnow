'use client'

import { useState } from 'react'
import { updateCurrency, type Profile } from '@/lib/supabase/profiles'
import { getSupportedCurrencies } from '@/lib/currency'

interface CurrencySelectorProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

export default function CurrencySelector({ profile, onProfileUpdate }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || 'USD')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency)
    setSuccess(false)
    setSaving(true)

    try {
      const updated = await updateCurrency(newCurrency)
      onProfileUpdate(updated)
      setSuccess(true)
    } catch (err) {
      console.error('Failed to update currency:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Choose your local currency for price range display
      </p>
      <div className="flex items-center gap-3">
        <select
          value={selectedCurrency}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className="flex-1 px-3 py-2 border border-orange-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
        >
          {getSupportedCurrencies().map(c => (
            <option key={c.code} value={c.code}>
              {c.symbol} - {c.name}
            </option>
          ))}
        </select>
        {saving && (
          <span className="text-sm text-muted-foreground">Saving...</span>
        )}
        {success && !saving && (
          <span className="text-sm text-green-600">✓ Saved!</span>
        )}
      </div>
    </div>
  )
}
