import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="max-w-4xl mx-auto px-8 py-6">
        <span className="text-2xl font-bold">NomNomNow 🍜</span>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Can&apos;t decide what to eat?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Tell us your mood. We&apos;ll pick the perfect spot from your saved favorites.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold text-lg"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-12">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-center text-lg font-medium text-gray-500 dark:text-gray-400 mb-8">You&apos;re not alone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-purple-500 mb-2">80%</p>
              <p className="text-gray-600 dark:text-gray-400">of people don&apos;t know what they&apos;re in the mood for</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-500 mb-2">90%</p>
              <p className="text-gray-600 dark:text-gray-400">just go back to places they already know</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-500 mb-2">70%</p>
              <p className="text-gray-600 dark:text-gray-400">forget about restaurants they wanted to try</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        {/* Feature 1: AI Picker */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Mood Picker</h3>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Not sure what you want? We&apos;ll figure it out together.
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Our AI asks a few quick questions about your mood, cravings, and the occasion—then picks the perfect restaurant from your saved list. No more scrolling through apps. No more &quot;I don&apos;t know, what do you want?&quot;
          </p>
        </div>

        {/* Feature 2: Restaurant List */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xl">📍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Restaurant List</h3>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Save all your spots in one place.
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Never forget that place your friend recommended. Add ratings, notes, price ranges, and tags like &quot;date night&quot; or &quot;quick lunch&quot; to find the right spot instantly.
          </p>
        </div>

        {/* Feature 3: Social */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Share with Friends</h3>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            See where your friends love to eat.
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Get trusted recommendations from people you actually know. Share your public profile or keep it private—you&apos;re in control.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-500 to-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop scrolling. Start eating.</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands who&apos;ve solved their dinner dilemma.</p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-8 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>NomNomNow — Because &quot;I don&apos;t know, what do you want?&quot; is not a dinner plan.</p>
      </footer>
    </main>
  )
}
