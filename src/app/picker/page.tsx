"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PickerChat from "@/components/PickerChat";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function PickerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-blue-500 hover:underline text-sm"
        >
          ← Back to home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">AI Picker</h1>

      {user ? (
        <PickerChat />
      ) : (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-gray-600 mb-4">
            Log in to use the AI Picker and get personalized recommendations.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Log in
          </Link>
        </div>
      )}
    </main>
  );
}
