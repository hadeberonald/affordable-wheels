import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: 'About Us | Affordable Wheels',
  description: 'Learn about Affordable Wheels — your trusted pre-owned vehicle dealer in Newcastle, KwaZulu-Natal.',
}

export default function AboutPage() {
  return (
    <div className="pt-[67px] md:pt-[73px] min-h-screen bg-[#020202]">

      {/* Hero */}
      <section className="relative bg-[#020202] border-b border-charcoal py-24 overflow-hidden">
        {/* Racing stripe */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="absolute top-0 left-3 bottom-0 w-0.5" style={{ background: 'rgba(228,172,41,0.2)' }} />
        {/* Track lines background */}
        <div className="absolute inset-0 track-lines opacity-60" />

        <div className="relative max-w-7xl mx-auto px-8 md:px-12">
          <p className="section-label mb-4">Who We Are</p>
          <div className="gold-rule mb-6" />
          <h1 className="font-display text-5xl md:text-7xl text-offwhite uppercase leading-none mb-6 max-w-3xl">
            Real Deals.{' '}
            <br />
            <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
              No Nonsense.
            </span>
          </h1>
          <p className="text-muted text-lg max-w-xl leading-relaxed">
            Newcastle's trusted destination for quality pre-owned vehicles. Honest pricing,
            no pressure, and every car inspected before it leaves our lot.
          </p>
        </div>
      </section>

      {/* Story — white section */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-3" style={{ color: '#c4911a' }}>Our Story</p>
              <div className="gold-rule mb-6" />
              <h2 className="font-display text-4xl text-gray-900 uppercase leading-none mb-8">
                Welcome to{' '}
                <span className="font-serif-italic text-gold-dark">
                  Affordable Wheels
                </span>
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed text-sm">
                <p>
                  Affordable Wheels was built on one simple idea: buying a pre-owned car
                  should not be stressful. We started in Newcastle with a hand-picked selection
                  of vehicles and a commitment to transparency — and that commitment has not
                  changed.
                </p>
                <p>
                  Every vehicle we acquire is assessed for mechanical condition, service history
                  and overall value before it appears on our floor. We only stock cars we
                  believe in and would drive ourselves.
                </p>
                <p>
                  We operate on a straightforward cash-sale model. No hidden fees,
                  no inflated sticker prices designed to be negotiated down. Just honest
                  deals and a team that takes the time to understand what you need.
                </p>
              </div>
              <div className="mt-8 stripe-left pl-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">Visit Us</p>
                    <p className="text-gray-500 text-sm">56 Montague Street, Newcastle, 2940</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual panel */}
            <div
              className="hidden lg:block relative bg-[#020202] p-12 text-center"
              
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              <p className="section-label mb-6">Affordable Wheels</p>
              <div className="gold-rule mx-auto mb-8" />
              <p className="font-display text-3xl text-offwhite uppercase leading-tight">
                Your Next Car.
              </p>
              <p className="font-serif-italic text-3xl mt-2" style={{ color: '#e4ac29' }}>
                Our Best Price.
              </p>
              <div className="gold-rule mx-auto mt-8 mb-6" />
              <p className="text-sm text-muted max-w-xs mx-auto">
                No pressure sales. No hidden costs. Just honest value in Newcastle, KZN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars — black section */}
      <section className="py-20 bg-[#020202] relative">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="mb-12">
            <p className="section-label mb-3">What Sets Us Apart</p>
            <div className="gold-rule mb-4" />
            <h2 className="font-display text-4xl md:text-5xl text-offwhite uppercase leading-none">
              Three Things We{' '}
              <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
                Never Compromise
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: '01',
                title: 'Inspected Stock Only',
                body: 'Every vehicle is thoroughly assessed before listing. We do not put cars on the floor that we would not recommend to our own family.',
              },
              {
                number: '02',
                title: 'Transparent Pricing',
                body: 'The price on the windscreen is the price. We do not inflate to leave room for negotiation. What you see is what you pay.',
              },
              {
                number: '03',
                title: 'People-First Service',
                body: 'We take time to understand what you need and match you to a vehicle that fits your lifestyle and your budget — no pressure, ever.',
              },
            ].map(({ number, title, body }) => (
              <div
                key={number}
                className="border border-charcoal p-8 group hover:border-gold-subtle transition-all duration-300"
              >
                <div
                  className="font-display text-8xl leading-none select-none mb-5"
                  style={{ color: 'rgba(228,172,41,0.12)', letterSpacing: '0.02em' }}
                >
                  {number}
                </div>
                <h3 className="font-display text-sm uppercase tracking-wide text-offwhite mb-3">{title}</h3>
                <div className="gold-rule mb-4" />
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="bg-[#020202] p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />

            <div className="text-center">
              <p className="section-label mb-4">Newcastle, KwaZulu-Natal</p>
              <div className="gold-rule mx-auto mb-6" />
              <h2 className="font-display text-4xl md:text-5xl text-offwhite uppercase leading-none mb-4">
                Come See Us{' '}
                <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
                  In Person
                </span>
              </h2>
              <p className="text-muted text-sm mb-2">56 Montague Street, Newcastle, 2940</p>
              <p className="text-muted text-xs mb-10">No appointment necessary during business hours.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/vehicles" className="btn-gold text-xs">Browse Our Stock</Link>
                <Link href="/contact" className="btn-outline-white text-xs">
                  <Phone className="w-4 h-4" /> Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
