'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  image_url: string
  order_index: number
}

interface HeroCarouselProps {
  slides: CarouselSlide[]
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => advance(1), 6000)
    return () => clearInterval(timer)
  }, [current, slides.length])

  const advance = (dir: number) => {
    if (animating || slides.length === 0) return
    setAnimating(true)
    setCurrent(i => ((i + dir) + slides.length) % slides.length)
    setTimeout(() => setAnimating(false), 600)
  }

  if (slides.length === 0) {
    return (
      <section className="relative min-h-[620px] bg-dark flex items-center overflow-hidden bg-grid bg-radial-glow">
        <div className="max-w-7xl mx-auto px-6 py-32 text-center w-full">
          <div className="divider-glow mx-auto mb-8" />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Great Vehicles.<br />
            <span className="text-accent text-glow">Real Deals.</span>
          </h1>
          <p className="text-lg text-mid max-w-2xl mx-auto mb-10">
            Quality pre-owned vehicles in Springs, Gauteng. Every car is inspected,
            fairly priced and ready to drive away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vehicles" className="btn-primary text-base px-8 py-3.5">Browse Our Stock</Link>
            <Link href="/contact" className="btn-outline-white text-base px-8 py-3.5">Get In Touch</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[620px] bg-dark overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === current
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-[1.02]'
          }`}
        >
          <div className="absolute inset-0">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/60 to-dark/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex items-center min-h-[620px]">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <div className="divider-glow mb-7" />
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/vehicles" className="btn-primary text-base px-8 py-3.5">
                    Browse Stock
                  </Link>
                  <Link href="/contact" className="btn-outline-white text-base px-8 py-3.5">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom bar — arrows on edges, dots centred, all on the same row */}
      {slides.length > 1 && (
        <div className="absolute bottom-7 left-0 right-0 z-10 flex items-center px-6">
          <button
            onClick={() => advance(-1)}
            className="w-11 h-11 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all duration-200 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (!animating) { setAnimating(true); setCurrent(i); setTimeout(() => setAnimating(false), 600) } }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 h-2 bg-accent shadow-glow-sm'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => advance(1)}
            className="w-11 h-11 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all duration-200 flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  )
}