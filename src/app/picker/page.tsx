"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import PickerChat from "@/components/PickerChat";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BotMessageSquareIcon, type BotMessageSquareHandle } from "@/components/ui/bot-message-square";

export default function PickerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const botIconRef = useRef<BotMessageSquareHandle>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header */}
      <header
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
        onMouseEnter={() => botIconRef.current?.startAnimation()}
        onMouseLeave={() => botIconRef.current?.stopAnimation()}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hover:bg-orange-50">
              <Link href="/">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6 bg-orange-200" />
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BotMessageSquareIcon ref={botIconRef} size={24} className="text-purple-500" /> AI Picker
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {user ? (
          <PickerChat />
        ) : (
          <Card className="max-w-md mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 py-0">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Get Personalized Picks</h2>
              <p className="text-muted-foreground mb-6">
                Log in to use the AI Picker and get recommendations from your saved restaurants.
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/login">
                  Log in to continue
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
