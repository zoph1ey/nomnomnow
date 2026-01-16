'use client'

import Link from 'next/link'
import { type FriendshipWithProfile } from '@/lib/supabase/friends'
import type { Profile } from '@/lib/supabase/profiles'

interface FriendsListProps {
  friends: FriendshipWithProfile[]
  userId: string
  onUnfriend: (friendshipId: string) => void
}

export default function FriendsList({ friends, userId, onUnfriend }: FriendsListProps) {
  const getFriendProfile = (friendship: FriendshipWithProfile): Profile | undefined => {
    if (friendship.requester_id === userId) {
      return friendship.addressee
    }
    return friendship.requester
  }

  if (friends.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No friends yet. Search for users above to send friend requests.
      </p>
    )
  }

  return (
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
                onClick={() => onUnfriend(friendship.id)}
                className="px-3 py-1.5 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Unfriend
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
