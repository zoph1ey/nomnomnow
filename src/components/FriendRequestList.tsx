'use client'

import { type FriendshipWithProfile } from '@/lib/supabase/friends'

interface FriendRequestListProps {
  pendingRequests: FriendshipWithProfile[]
  sentRequests: FriendshipWithProfile[]
  onAccept: (friendshipId: string) => void
  onReject: (friendshipId: string) => void
  onCancel: (friendshipId: string) => void
}

export default function FriendRequestList({
  pendingRequests,
  sentRequests,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestListProps) {
  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return null
  }

  return (
    <>
      {/* Pending Requests (received) */}
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
                    onClick={() => onAccept(request.id)}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(request.id)}
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
                  onClick={() => onCancel(request.id)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
