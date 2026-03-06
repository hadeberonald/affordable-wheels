import { supabase } from '@/lib/supabase'
import HeroCarousel from '@/components/HeroCarousel'
import VehicleCard from '@/components/VehicleCard'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Star, Wrench, Phone } from 'lucide-react'

async function getHeroSlides() {
  const { data, error } = await supabase
    .from('hero_carousel')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error) { console.error(error); return [] }
  return data || []
}

async function getFeaturedVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) { console.error(error); return [] }
  return data || []
}

export const revalidate = 60

export default async function HomePage() {
  const [heroSlides, vehicles] = await Promise.all([getHeroSlides(), getFeaturedVehicles()])

  return (
    <div className="pt-20">
      <HeroCarousel slides={heroSlides} />

      {/* Trust bar */}
      <section className="py-5 bg-dark-light border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-mid">
            {[
              'Quality Inspected Stock',
              'Cash Sales & Trade-Ins Welcome',
              'No Hidden Fees',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-glow-sm" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In Stock */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="divider-glow mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Vehicles <span className="text-accent text-glow">In Stock</span>
            </h2>
            <p className="text-mid max-w-2xl mx-auto leading-relaxed">
              Browse our current selection of quality pre-owned vehicles. Every car has been
              inspected and is priced to sell.
            </p>
          </div>

          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/vehicles" className="btn-outline inline-flex items-center gap-2 text-base px-8 py-3.5">
                  View All Stock <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 card max-w-md mx-auto">
              <p className="text-mid">No vehicles available right now. Check back soon.</p>
              <Link href="/contact" className="btn-outline mt-6 inline-flex">Get Notified</Link>
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 bg-dark-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="divider-glow mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-accent">Dealz On Wheelz</span>
            </h2>
            <p className="text-mid max-w-xl mx-auto">
              We built this dealership on honesty, fair pricing and a no-pressure approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                title: 'Every Car Inspected',
                body: 'Before a vehicle hits our floor it goes through a thorough inspection. What you see is what you get.',
              },
              {
                Icon: Star,
                title: 'Honest Pricing',
                body: 'Our prices are transparent and fair. No inflated stickers, no back-room surprises — just straightforward deals.',
              },
              {
                Icon: Wrench,
                title: 'Trade-Ins Welcome',
                body: 'Have a vehicle to swap? We give honest trade-in valuations and make the process as simple as possible.',
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="card-glow p-8 text-center group hover:border-accent/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5 group-hover:shadow-glow-sm transition-all duration-300">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
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
            <div className="divider-glow mx-auto mb-7" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
              Come See Us in <span className="text-accent text-glow">Springs</span>
            </h2>
            <p className="text-mid text-lg mb-3 max-w-xl mx-auto">
              159 2nd St, Springs New, Springs, 1559
            </p>
            <p className="text-mid text-sm mb-10">Mon – Fri 8:00–17:30 &nbsp;|&nbsp; Sat 9:00–15:00</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles" className="btn-primary text-base px-8 py-3.5">
                Browse Our Stock
              </Link>
              <Link href="/contact" className="btn-outline-white text-base px-8 py-3.5">
                <Phone className="w-4 h-4" /> Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
