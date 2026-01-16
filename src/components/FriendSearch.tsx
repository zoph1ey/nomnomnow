'use client'

import { useState } from 'react'
import { searchUserByUsername, sendFriendRequest, getSentRequests, type FriendshipWithProfile } from '@/lib/supabase/friends'
import type { Profile } from '@/lib/supabase/profiles'

interface FriendSearchProps {
  onRequestSent: (sentRequests: FriendshipWithProfile[]) => void
}

export default function FriendSearch({ onRequestSent }: FriendSearchProps) {
  const [friendSearch, setFriendSearch] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null | undefined>(undefined)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)

  const handleSearchUser = async () => {
    if (!friendSearch.trim()) return

    setSearching(true)
    setSearchError(null)
    setSearchResult(undefined)

    try {
      const result = await searchUserByUsername(friendSearch.trim())
      setSearchResult(result)
      if (!result) {
        setSearchError('User not found')
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async () => {
    if (!searchResult) return

    setSendingRequest(true)
    try {
      await sendFriendRequest(searchResult.id)
      const sentData = await getSentRequests()
      onRequestSent(sentData)
      setSearchResult(undefined)
      setFriendSearch('')
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setSendingRequest(false)
    }
  }

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Add friends by username
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={friendSearch}
          onChange={(e) => {
            setFriendSearch(e.target.value.toLowerCase().replace(/\s/g, ''))
            setSearchResult(undefined)
            setSearchError(null)
          }}
          placeholder="Enter username..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearchUser()
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearchUser}
          disabled={searching || !friendSearch.trim()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{searchError}</p>
      )}

      {searchResult && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">@{searchResult.username}</p>
          </div>
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={sendingRequest}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {sendingRequest ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      )}
    </div>
  )
}
