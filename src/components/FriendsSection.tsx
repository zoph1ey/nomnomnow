'use client'

import { useState, useEffect } from 'react'
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
  type FriendshipWithProfile
} from '@/lib/supabase/friends'
import FriendSearch from './FriendSearch'
import FriendRequestList from './FriendRequestList'
import FriendsList from './FriendsList'

interface FriendsSectionProps {
  userId: string
}

export default function FriendsSection({ userId }: FriendsSectionProps) {
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([])
  const [sentRequests, setSentRequests] = useState<FriendshipWithProfile[]>([])

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

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Friends</h2>

      <FriendSearch onRequestSent={setSentRequests} />

      <FriendRequestList
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        onCancel={handleCancelRequest}
      />

      <FriendsList
        friends={friends}
        userId={userId}
        onUnfriend={handleUnfriend}
      />
    </div>
  )
}
