'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMyProfile, updateUsername, updateCurrency, updateProfileVisibility, validateUsername, type Profile, type ProfileVisibility } from '@/lib/supabase/profiles'
import { getSupportedCurrencies, detectCurrency } from '@/lib/currency'
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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import CopyProfileLink from '@/components/CopyProfileLink'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [currencySuccess, setCurrencySuccess] = useState(false)

  // Privacy state
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [visibilitySuccess, setVisibilitySuccess] = useState(false)

  // Friends state
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([])
  const [sentRequests, setSentRequests] = useState<FriendshipWithProfile[]>([])
  const [friendSearch, setFriendSearch] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null | undefined>(undefined)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      try {
        const profileData = await getMyProfile()
        setProfile(profileData)
        setUsername(profileData?.username || '')
        setSelectedCurrency(profileData?.currency || detectCurrency())

        // Load friends data
        const [friendsData, pendingData, sentData] = await Promise.all([
          getFriends(),
          getPendingRequests(),
          getSentRequests()
        ])
        setFriends(friendsData)
        setPendingRequests(pendingData)
        setSentRequests(sentData)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  // Real-time validation as user types
  useEffect(() => {
    if (!username) {
      setValidationError(null)
      return
    }
    const validation = validateUsername(username)
    setValidationError(validation.valid ? null : validation.error || null)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (validationError) return

    setSaving(true)

    try {
      const updated = await updateUsername(username)
      setProfile(updated)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency)
    setCurrencySuccess(false)
    setSavingCurrency(true)

    try {
      const updated = await updateCurrency(newCurrency)
      setProfile(updated)
      setCurrencySuccess(true)
    } catch (err) {
      console.error('Failed to update currency:', err)
    } finally {
      setSavingCurrency(false)
    }
  }

  const handleVisibilityChange = async (visibility: ProfileVisibility) => {
    setVisibilitySuccess(false)
    setSavingVisibility(true)

    try {
      const updated = await updateProfileVisibility(visibility)
      setProfile(updated)
      setVisibilitySuccess(true)
    } catch (err) {
      console.error('Failed to update visibility:', err)
    } finally {
      setSavingVisibility(false)
    }
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

  // Helper to get friend's profile from a friendship
  const getFriendProfile = (friendship: FriendshipWithProfile): Profile | undefined => {
    if (friendship.requester_id === user?.id) {
      return friendship.addressee
    }
    return friendship.requester
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Username
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Choose a unique username for your public profile URL
            </p>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => {
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
                setSuccess(false)
              }}
              placeholder="e.g., foodie_jane"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationError}</p>
            )}
            {username && !validationError && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your profile will be at: <span className="font-mono text-gray-800 dark:text-gray-200">/user/{username}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-green-700 dark:text-green-400 text-sm">Username updated successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !!validationError || !username || username === profile?.username}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Username'}
          </button>
        </form>

        {/* Currency Selector */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Currency</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Choose your local currency for price range display
          </p>
          <div className="flex items-center gap-3">
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              disabled={savingCurrency}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              {getSupportedCurrencies().map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
            {savingCurrency && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            {currencySuccess && !savingCurrency && (
              <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Profile Privacy</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Control who can see your restaurant list
          </p>
          <div className="space-y-2">
            {(['public', 'friends_only', 'private'] as ProfileVisibility[]).map((visibility) => (
              <label
                key={visibility}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  profile?.profile_visibility === visibility
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={visibility}
                  checked={profile?.profile_visibility === visibility}
                  onChange={() => handleVisibilityChange(visibility)}
                  disabled={savingVisibility}
                  className="w-4 h-4 text-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {visibility === 'public' && 'Public'}
                    {visibility === 'friends_only' && 'Friends Only'}
                    {visibility === 'private' && 'Private'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {visibility === 'public' && 'Anyone can see your restaurant list'}
                    {visibility === 'friends_only' && 'Only approved friends can see your list'}
                    {visibility === 'private' && 'Only you can see your restaurant list'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {savingVisibility && (
            <p className="mt-2 text-sm text-gray-500">Saving...</p>
          )}
          {visibilitySuccess && !savingVisibility && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">Privacy setting saved!</p>
          )}
        </div>

        {/* Friends Section */}
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

        {profile?.username && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Share Your Profile</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                {typeof window !== 'undefined' ? window.location.origin : ''}/user/{profile.username}
              </code>
              <CopyProfileLink username={profile.username} />
            </div>
            <Link
              href={`/user/${profile.username}`}
              className="inline-block mt-3 text-sm text-blue-500 dark:text-blue-400 hover:underline"
            >
              View your public profile
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
