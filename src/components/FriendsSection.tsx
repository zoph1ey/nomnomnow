'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
  searchUserByUsername,
  type FriendshipWithProfile
} from '@/lib/supabase/friends'
import type { Profile } from '@/lib/supabase/profiles'

interface FriendsSectionProps {
  userId: string
}

export default function FriendsSection({ userId }: FriendsSectionProps) {
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([])
  const [sentRequests, setSentRequests] = useState<FriendshipWithProfile[]>([])
  const [friendSearch, setFriendSearch] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null | undefined>(undefined)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)

  useEffect(() => {
    loadFriendsData()
  }, [])

  const loadFriendsData = async () => {
    const [friendsData, pendingData, sentData] = await Promise.all([
      getFriends(),
      getPendingRequests(),
      getSentRequests()
    ])
    setFriends(friendsData)
    setPendingRequests(pendingData)
    setSentRequests(sentData)
  }

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
      setSentRequests(sentData)
      setSearchResult(undefined)
      setFriendSearch('')
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId)
      const [friendsData, pendingData] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ])
      setFriends(friendsData)
      setPendingRequests(pendingData)
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await rejectFriendRequest(friendshipId)
      const pendingData = await getPendingRequests()
      setPendingRequests(pendingData)
    } catch (err) {
      console.error('Failed to reject request:', err)
    }
  }

  const handleCancelRequest = async (friendshipId: string) => {
    try {
      await cancelFriendRequest(friendshipId)
      const sentData = await getSentRequests()
      setSentRequests(sentData)
    } catch (err) {
      console.error('Failed to cancel request:', err)
    }
  }

  const handleUnfriend = async (friendshipId: string) => {
    try {
      await unfriend(friendshipId)
      const friendsData = await getFriends()
      setFriends(friendsData)
    } catch (err) {
      console.error('Failed to unfriend:', err)
    }
  }

  const getFriendProfile = (friendship: FriendshipWithProfile): Profile | undefined => {
    if (friendship.requester_id === userId) {
      return friendship.addressee
    }
    return friendship.requester
  }

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Friends</h2>

      {/* Search for friends */}
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

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  @{request.requester?.username}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(request.id)}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sent Requests ({sentRequests.length})
          </h3>
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  @{request.addressee?.username}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Pending</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleCancelRequest(request.id)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      {friends.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Friends ({friends.length})
          </h3>
          <div className="space-y-2">
            {friends.map((friendship) => {
              const friendProfile = getFriendProfile(friendship)
              return (
                <div
                  key={friendship.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      @{friendProfile?.username}
                    </p>
                    {friendProfile?.username && (
                      <Link
                        href={`/user/${friendProfile.username}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnfriend(friendship.id)}
                    className="px-3 py-1.5 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Unfriend
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No friends yet. Search for users above to send friend requests.
        </p>
      )}
    </div>
  )
}
