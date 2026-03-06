'use client'

import { useState, useEffect, useCallback } from 'react'
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
    const timer = setInterval(() => advance(1), 7000)
    return () => clearInterval(timer)
  }, [current, slides.length])

  const advance = useCallback((dir: number) => {
    if (animating || slides.length === 0) return
    setAnimating(true)
    setCurrent(i => ((i + dir) + slides.length) % slides.length)
    setTimeout(() => setAnimating(false), 700)
  }, [animating, slides.length])

  if (slides.length === 0) {
    return (
      <section className="relative min-h-[640px] flex items-center overflow-hidden bg-[#020202] track-lines">
        {/* Racing stripe decoration */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="absolute top-0 left-3 bottom-0 w-0.5" style={{ background: 'rgba(228,172,41,0.3)' }} />

        <div className="max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl">
            <p className="section-label mb-4">Newcastle, KZN</p>
            <div className="gold-rule mb-6" />
            <h1 className="font-display text-5xl md:text-7xl text-offwhite uppercase leading-none mb-4">
              Performance
              <br />
              <span className="highlight text-5xl md:text-7xl" style={{ fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic', color: '#e4ac29' }}>
                Meets Value.
              </span>
            </h1>
            <p className="text-muted text-lg max-w-xl leading-relaxed mt-6 mb-10">
              Hand-picked pre-owned vehicles at honest prices. Every car on our floor
              has been inspected and is ready to drive away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/vehicles" className="btn-gold text-xs">Browse Our Stock</Link>
              <Link href="/contact" className="btn-outline-white text-xs">Get In Touch</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[640px] overflow-hidden bg-[#020202]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Strong dark overlay for legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.70) 50%, rgba(13,13,13,0.20) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.5) 0%, transparent 50%)' }}
            />
          </div>

          {/* Racing stripe left edge */}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold z-10" />
          <div className="absolute top-0 left-3 bottom-0 w-0.5 z-10" style={{ background: 'rgba(228,172,41,0.3)' }} />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center min-h-[640px]">
            <div className="max-w-7xl mx-auto px-8 md:px-12 w-full">
              <div className="max-w-2xl">
                <p className="section-label mb-4">Affordable Wheels — Newcastle</p>
                <div className="gold-rule mb-6" />
                <h1 className="font-display text-4xl md:text-6xl xl:text-7xl text-offwhite uppercase leading-none mb-4">
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg max-w-lg leading-relaxed mb-10" style={{ color: 'rgba(245,244,240,0.7)' }}>
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/vehicles" className="btn-gold text-xs">Browse Stock</Link>
                  <Link href="/contact" className="btn-outline-white text-xs">Contact Us</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center px-8 md:px-12">
          <button
            onClick={() => advance(-1)}
            className="w-10 h-10 flex items-center justify-center border border-charcoal bg-black/60 text-muted hover:border-gold hover:text-gold transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!animating) {
                    setAnimating(true)
                    setCurrent(i)
                    setTimeout(() => setAnimating(false), 700)
                  }
                }}
                className="h-0.5 transition-all duration-500"
                style={{
                  width: i === current ? '40px' : '16px',
                  background: i === current ? '#e4ac29' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => advance(1)}
            className="w-10 h-10 flex items-center justify-center border border-charcoal bg-black/60 text-muted hover:border-gold hover:text-gold transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="absolute top-8 right-8 z-20 text-xs font-bold tracking-widest text-muted">
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      )}
    </section>
  )
}
