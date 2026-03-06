import Link from 'next/link'
import { MapPin, ArrowRight, ShieldCheck, Star, Users } from 'lucide-react'

export const metadata = {
  title: 'About Us | Dealz On Wheelz',
  description: 'Learn about Dealz On Wheelz — your trusted pre-owned vehicle dealer in Springs, Gauteng.',
}

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-dark">

      {/* Hero */}
      <section className="relative bg-dark-light border-b border-dark-border py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="divider-glow mb-7" />
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Who We Are</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-3xl">
            Real Deals.<br />
            <span className="text-accent text-glow">No Nonsense.</span>
          </h1>
          <p className="text-mid text-lg max-w-xl leading-relaxed">
            Springs' trusted destination for quality pre-owned vehicles — honest pricing, no pressure
            and every car inspected before it leaves our lot.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-4xl font-bold text-white mb-7 leading-tight">
                Welcome to<br />Dealz On Wheelz
              </h2>
              <div className="space-y-5 text-mid leading-relaxed text-sm">
                <p>
                  Dealz On Wheelz was built on one simple idea: buying a used car should not be stressful.
                  We started in Springs with a small selection of vehicles and a commitment to transparency,
                  and that commitment has never changed.
                </p>
                <p>
                  Our inventory is hand-picked. Every vehicle we buy is assessed for mechanical condition,
                  service history and overall value before it appears on our floor. We only stock cars we
                  believe in.
                </p>
                <p>
                  We operate on a cash-sale model, which keeps things simple and keeps our pricing sharp.
                  No hidden finance fees, no inflated sticker prices designed to be negotiated down.
                  Just fair deals.
                </p>
              </div>
              <div className="mt-8 flex items-start gap-3 border-l-2 border-accent pl-5">
                <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm mb-0.5">Visit Us</p>
                  <p className="text-mid text-sm">159 2nd St, Springs New, Springs, 1559</p>
                </div>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative h-[380px] hidden lg:flex items-center justify-center">
              <div className="card-glow w-full h-full flex flex-col items-center justify-center text-center p-12 bg-radial-glow">
                <div className="divider-glow mx-auto mb-8" />
                <p className="text-3xl font-bold text-white leading-snug">
                  Your Next Car.<br />
                  <span className="text-accent text-glow">Our Best Price.</span>
                </p>
                <div className="divider-glow mx-auto mt-8" />
                <p className="text-mid text-sm mt-6 max-w-xs">
                  No finance gimmicks. No pressure sales. Just honest value in Springs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-dark-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">What Sets Us Apart</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Three Things We Never Compromise On</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                number: '01',
                title: 'Inspected Stock Only',
                body: 'Every vehicle is assessed before listing. We do not sell cars we would not drive ourselves.',
              },
              {
                Icon: Star,
                number: '02',
                title: 'Transparent Pricing',
                body: 'The price on the windscreen is the price. We do not inflate to leave room for negotiation.',
              },
              {
                Icon: Users,
                number: '03',
                title: 'People-First Service',
                body: 'We take time to understand what you need and match you to a vehicle that fits your life and budget.',
              },
            ].map(({ Icon, number, title, body }) => (
              <div key={number} className="card-hover p-8 group">
                <div className="flex items-start gap-5 mb-5">
                  <span className="text-5xl font-bold text-accent/20 group-hover:text-accent/35 transition-colors duration-300 leading-none">
                    {number}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <div className="divider-glow mb-4" />
                <p className="text-mid text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card-glow p-12 md:p-16 text-center bg-radial-glow">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">Springs, Gauteng</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Come See Us in Person
            </h2>
            <p className="text-mid text-lg mb-2 max-w-lg mx-auto">
              159 2nd St, Springs New, Springs, 1559
            </p>
            <p className="text-mid text-sm mb-10">No appointment necessary during business hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles" className="btn-primary text-base px-8 py-3.5">
                Browse Our Stock
              </Link>
              <Link href="/contact" className="btn-outline-white text-base px-8 py-3.5">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
