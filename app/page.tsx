import { supabase } from '@/lib/supabase'
import HeroCarousel from '@/components/HeroCarousel'
import VehicleCard from '@/components/VehicleCard'
import Link from 'next/link'
import { ArrowRight, Phone, MapPin } from 'lucide-react'

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
    <div className="pt-[67px] md:pt-[73px]">
      <HeroCarousel slides={heroSlides} />

      {/* Trust bar — black */}
      <section className="bg-[#020202] border-b border-charcoal py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14">
            {[
              'Inspected Stock',
              'Honest Pricing',
              'Cash Sales & Trade-Ins',
              'Newcastle, KZN',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
                <span className="w-1.5 h-1.5 bg-gold flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vehicles — white section */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-3">Available Now</p>
              <div className="gold-rule mb-4" />
              <h2 className="font-display text-4xl md:text-5xl text-gray-900 uppercase leading-none">
                Vehicles{' '}
                <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
                  In Stock
                </span>
              </h2>
            </div>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-dark hover:gap-3 transition-all duration-200"
            >
              View All Stock <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200">
              <p className="text-gray-500 mb-6">No vehicles available right now. Check back soon.</p>
              <Link href="/contact" className="btn-gold text-xs inline-flex">Get Notified</Link>
            </div>
          )}

          {vehicles.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/vehicles" className="btn-outline-gold text-xs inline-flex items-center gap-2">
                View All Stock <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why us — black section */}
      <section className="py-20 bg-[#020202] relative overflow-hidden">
        {/* Racing stripe */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="absolute top-0 left-3 bottom-0 w-0.5" style={{ background: 'rgba(228,172,41,0.2)' }} />

        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="mb-12">
            <p className="section-label mb-3">The Affordable Wheels Difference</p>
            <div className="gold-rule mb-4" />
            <h2 className="font-display text-4xl md:text-5xl text-offwhite uppercase leading-none">
              Why Choose{' '}
              <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
                Us
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: '01',
                title: 'Every Car Inspected',
                body: 'We assess mechanical condition, service history and overall value before any vehicle reaches our floor. We only stock cars we stand behind.',
              },
              {
                number: '02',
                title: 'Transparent Pricing',
                body: 'No inflated stickers. No back-room surprises. The price on the windscreen is the price you pay — straightforward deals, every time.',
              },
              {
                number: '03',
                title: 'Trade-Ins Welcome',
                body: 'Bring your current vehicle in for an honest, no-obligation valuation. We make the trade-in process as simple as it should be.',
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

      {/* Visit Us — split black/white */}
      <section className="bg-offwhite py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
            {/* Black left panel */}
            <div className="bg-[#020202] p-12 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
              <p className="section-label mb-4">Newcastle, KwaZulu-Natal</p>
              <div className="gold-rule mb-6" />
              <h2 className="font-display text-3xl md:text-4xl text-offwhite uppercase leading-none mb-6">
                Come See Us{' '}
                <span className="font-serif-italic" style={{ color: '#e4ac29' }}>
                  In Person
                </span>
              </h2>
              <div className="space-y-4 text-sm text-muted mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                  <span>56 Montague Street, Newcastle, South Africa, 2940</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gold" />
                  <a href="tel:0823447996" className="hover:text-offwhite transition-colors">082 344 7996</a>
                </div>
              </div>
              <div className="text-xs text-muted border-t border-charcoal pt-5 space-y-1">
                <p>Mon – Fri: 8:00 AM – 5:30 PM</p>
                <p>Saturday: 9:00 AM – 3:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Right panel */}
            <div className="bg-white p-12 flex flex-col justify-center">
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                No appointment necessary during business hours. Walk in, browse at your own pace,
                and let our team assist you when you are ready. Test drives available on request.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/vehicles" className="btn-gold text-xs">Browse Stock</Link>
                <Link href="/contact" className="btn-outline-gold text-xs">
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
