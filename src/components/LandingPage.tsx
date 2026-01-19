'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AuthForm from '@/components/AuthForm'
import { AnimatedGradientDemo } from '@/components/GradientLanding';
import FoodScrollingBackground from '@/components/FoodScrollingBackground';

export default function LandingPage() {
  const [highlightForm, setHighlightForm] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHighlightForm(true)
    setTimeout(() => setHighlightForm(false), 2000)
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section - Split Layout */}
      <section className="min-h-[85vh] flex items-center relative">
        {/* Background decoration */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
          <FoodScrollingBackground />
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side - Branding */}
          <div className="space-y-8">
            <div className="space-y-4">
              <img
                src="/logo.png"
                alt="nomnomnow"
                className="h-auto w-[280px] lg:w-[400px]"
              />
              <p className="text-2xl lg:text-3xl text-muted-foreground font-medium">
                Can&apos;t decide what to eat?
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-md">
              Tell us your mood. We&apos;ll pick the perfect spot from your saved favorites or somewhere new!
              No more &quot;I don&apos;t know, what do you want?&quot;
            </p>

            {/* Quick Value Props */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span> AI-powered recommendations
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span> Save your favorite spots
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span> Share with friends
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div ref={formRef} className="flex justify-center lg:justify-end">
            <AuthForm highlight={highlightForm} />
          </div>
        </div>
      </section>

      <AnimatedGradientDemo />

      <Separator />

      {/* CTA Footer */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">Stop scrolling. Start eating.</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands who&apos;ve solved their "What to eat?" dilemma.
          </p>
          <Button size="lg" onClick={scrollToForm} className="text-lg px-8">
            Get Started — It&apos;s Free
          </Button>
        </div>
      </section>

    </main>
  )
}
