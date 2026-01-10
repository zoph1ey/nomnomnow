import Link from 'next/link'

export default function ProfileNotFound() {
  return (
    <main className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Profile Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This user doesn&apos;t exist or hasn&apos;t set up their profile yet.
      </p>
      <Link href="/" className="text-blue-500 dark:text-blue-400 hover:underline">
        Go back home
      </Link>
    </main>
  )
}
