'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FEATURE_CATEGORIES } from '@/lib/vehicle-features'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Gauge, Fuel, Settings, Palette,
  ShieldCheck, Car, ChevronLeft, ChevronRight, Users, Wrench, Check, X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

const WHATSAPP_NUMBER = '27113623114'

function buildVehicleWhatsAppUrl(vehicle: Vehicle) {
  const price = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(vehicle.price)
  const mileage = new Intl.NumberFormat('en-ZA').format(vehicle.mileage)
  const message =
`Hi Dealz On Wheelz! I am interested in the following vehicle:

${vehicle.year} ${vehicle.make} ${vehicle.model}
Price: ${price}
Mileage: ${mileage} km
Colour: ${vehicle.color}

Could you please provide more details or arrange a test drive?
(Vehicle ref: ${vehicle.id})`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface Vehicle {
  id: string; make: string; model: string; year: number; price: number; mileage: number
  description: string; transmission: string; fuel_type: string; drivetrain: string
  color: string; interior_color: string | null; condition: string; body_type: string
  engine_size: string | null; doors: number; seats: number; cylinders: number
  vin: string | null; license_plate: string | null; registration_date: string | null
  warranty: boolean; warranty_expiry: string | null; service_history: boolean
  images: string[]; status: string; airbags: number; owners_count: number
  abs: boolean; traction_control: boolean; stability_control: boolean; hill_assist: boolean
  lane_assist: boolean; blind_spot_monitor: boolean; rear_cross_traffic: boolean
  adaptive_cruise: boolean; auto_emergency_brake: boolean; alarm_system: boolean
  immobilizer: boolean; central_locking: boolean; isofix: boolean; aircon: boolean
  climate_control: boolean; rear_ac: boolean; cruise_control: boolean; power_steering: boolean
  electric_seats: boolean; memory_seats: boolean; heated_seats: boolean; leather_seats: boolean
  bluetooth: boolean; usb_port: boolean; aux_input: boolean; touchscreen: boolean
  navigation: boolean; multimedia_system: boolean; apple_carplay: boolean; android_auto: boolean
  reverse_camera: boolean; parking_sensors: boolean; electric_windows: boolean
  electric_mirrors: boolean; keyless_entry: boolean; keyless_start: boolean; sunroof: boolean
  panoramic_roof: boolean; paddle_shifters: boolean; sport_mode: boolean; eco_mode: boolean
  alloy_wheels: boolean; fog_lights: boolean; xenon_lights: boolean; led_lights: boolean
  daytime_running_lights: boolean; tow_bar: boolean; roof_rails: boolean; warranty_remaining: boolean
}

function Lightbox({ imgs, startIdx, onClose }: { imgs: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx)
  const prev = useCallback(() => setIdx(i => (i - 1 + imgs.length) % imgs.length), [imgs.length])
  const next = useCallback(() => setIdx(i => (i + 1) % imgs.length), [imgs.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col" onClick={onClose}>
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/80" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {imgs.length}</span>
        <button onClick={onClose} className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
        <Image key={idx} src={imgs[idx]} alt="" fill className="object-contain" sizes="100vw" priority />
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="flex-shrink-0 bg-black/80 py-3 px-4" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2 justify-center overflow-x-auto pb-1">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-accent shadow-glow-sm' : 'border-white/15 hover:border-accent/50'}`}>
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStart, setLightboxStart] = useState(0)

  useEffect(() => { if (params.id) fetchVehicle(params.id as string) }, [params.id])

  const fetchVehicle = async (id: string) => {
    setLoading(true)
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (error) router.push('/vehicles')
    else setVehicle(data)
    setLoading(false)
  }

  const formatPrice   = (p: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(p)
  const formatMileage = (m: number) => new Intl.NumberFormat('en-ZA').format(m) + ' km'
  const wrap          = (i: number, len: number) => ((i % len) + len) % len

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-mid text-sm">Loading vehicle details...</p>
      </div>
    </div>
  )

  if (!vehicle) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <p className="text-mid mb-4">Vehicle not found.</p>
        <Link href="/vehicles" className="btn-outline">Back to Stock</Link>
      </div>
    </div>
  )

  const imgs = vehicle.images || []

  return (
    <div className="pt-20 min-h-screen bg-dark">
      {lightboxOpen && imgs.length > 0 && (
        <Lightbox imgs={imgs} startIdx={lightboxStart} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Back bar */}
      <div className="bg-dark-light border-b border-dark-border py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/vehicles" className="inline-flex items-center gap-2 text-mid hover:text-accent transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to All Vehicles
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Gallery */}
          <div>
            <div
              className="relative h-96 md:h-[480px] mb-3 rounded-xl overflow-hidden border border-dark-border cursor-pointer group"
              onClick={() => { setLightboxStart(currentImageIndex); setLightboxOpen(true) }}
            >
              {imgs.length > 0 ? (
                <>
                  <Image src={imgs[currentImageIndex]} alt={`${vehicle.make} ${vehicle.model}`} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl" priority sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 rounded-xl">
                    <span className="bg-white text-black text-sm px-4 py-2 font-semibold rounded-lg">Click to Enlarge</span>
                  </div>
                  {imgs.length > 1 && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => wrap(i - 1, imgs.length)) }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => wrap(i + 1, imgs.length)) }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:text-black hover:border-accent transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-light text-mid text-sm rounded-xl">No Image Available</div>
              )}
              <div className="absolute top-3 left-3">
                <span className="badge-accent">{vehicle.condition}</span>
              </div>
              {imgs.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {currentImageIndex + 1}/{imgs.length}
                </div>
              )}
            </div>

            {imgs.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => { setCurrentIdx(i); setLightboxStart(i); setLightboxOpen(true) }}
                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${i === currentImageIndex ? 'border-accent shadow-glow-sm' : 'border-dark-border hover:border-accent/50'}`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-7">
              <p className="text-xs text-mid uppercase tracking-widest mb-1">{vehicle.body_type} · {vehicle.condition}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div className="text-4xl font-bold text-accent text-glow">
                {formatPrice(vehicle.price)}
              </div>
              <p className="text-mid text-sm mt-1">Cash sale · No finance</p>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                { Icon: Calendar, label: 'Year',         value: String(vehicle.year) },
                { Icon: Gauge,    label: 'Mileage',      value: formatMileage(vehicle.mileage) },
                { Icon: Settings, label: 'Transmission', value: vehicle.transmission },
                { Icon: Fuel,     label: 'Fuel',         value: vehicle.fuel_type },
                { Icon: Car,      label: 'Drivetrain',   value: vehicle.drivetrain },
                { Icon: Palette,  label: 'Colour',       value: vehicle.color },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="card p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] text-mid uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-base font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Specs table */}
            <div className="card p-5 mb-7">
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-dark-border">Specifications</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {([
                  ['Body Type', vehicle.body_type],
                  ['Doors', String(vehicle.doors)],
                  ['Seats', String(vehicle.seats)],
                  vehicle.engine_size ? ['Engine', `${vehicle.engine_size}L`] : null,
                  ['Cylinders', String(vehicle.cylinders)],
                  vehicle.interior_color ? ['Interior', vehicle.interior_color] : null,
                ] as ([string, string] | null)[])
                  .filter((row): row is [string, string] => row !== null)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1 border-b border-dark-border last:border-0">
                      <span className="text-mid text-xs">{label}</span>
                      <span className="font-medium text-white text-xs">{value}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={buildVehicleWhatsAppUrl(vehicle)} target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors duration-200">
                  <WhatsAppIcon className="w-5 h-5" />
                  Inquire on WhatsApp
                </button>
              </a>
              <Link href="/contact" className="flex-1">
                <button className="btn-outline w-full py-3.5">Book a Test Drive</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-5">Vehicle Description</h2>
          <div className="card p-8">
            <p className="text-mid leading-relaxed whitespace-pre-line text-sm">{vehicle.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-5">Features & Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(FEATURE_CATEGORIES).map(([catKey, cat]) => {
              const enabled = cat.features.filter(f => vehicle[f.key as keyof Vehicle] === true)
              if (enabled.length === 0 && catKey !== 'safety' && catKey !== 'history') return null
              return (
                <div key={catKey} className="card p-6">
                  <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-accent/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-glow-sm" />
                    {cat.title}
                  </h3>
                  <div className="space-y-2">
                    {catKey === 'safety' && vehicle.airbags > 0 && (
                      <div className="flex items-center gap-2 text-sm text-mid">
                        <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        {vehicle.airbags} Airbags
                      </div>
                    )}
                    {enabled.map(f => (
                      <div key={f.key} className="flex items-center gap-2 text-sm text-mid">
                        <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        {f.label}
                      </div>
                    ))}
                    {catKey === 'history' && (
                      <div className="flex items-center gap-2 text-sm text-mid mt-2 pt-2 border-t border-dark-border">
                        <Users className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>{vehicle.owners_count === 0 ? 'Brand New' : vehicle.owners_count === 1 ? '1 Previous Owner' : `${vehicle.owners_count} Previous Owners`}</span>
                      </div>
                    )}
                    {enabled.length === 0 && catKey !== 'safety' && catKey !== 'history' && (
                      <p className="text-mid text-xs italic">No features listed</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* History */}
        {(vehicle.service_history || vehicle.warranty || vehicle.vin || vehicle.license_plate) && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-5">Vehicle History</h2>
            <div className="card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.service_history && (
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div><h4 className="font-semibold text-white text-sm mb-0.5">Full Service History</h4><p className="text-mid text-xs">Complete service records available</p></div>
                  </div>
                )}
                {vehicle.warranty && (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div><h4 className="font-semibold text-white text-sm mb-0.5">Warranty Coverage</h4><p className="text-mid text-xs">{vehicle.warranty_expiry ? `Valid until ${new Date(vehicle.warranty_expiry).toLocaleDateString()}` : 'Active warranty included'}</p></div>
                  </div>
                )}
                {vehicle.vin && <div><h4 className="font-semibold text-white text-sm mb-0.5">VIN Number</h4><p className="text-mid text-xs font-mono">{vehicle.vin}</p></div>}
                {vehicle.license_plate && <div><h4 className="font-semibold text-white text-sm mb-0.5">License Plate</h4><p className="text-mid text-xs font-mono">{vehicle.license_plate}</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* Trust cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: 'Cash Sale',         body: 'Simple, transparent cash transactions. No hidden fees or finance complications.' },
            { title: 'Trade-In Welcome',  body: 'We offer honest trade-in valuations on your current vehicle.' },
            { title: 'Quality Assured',   body: 'Every vehicle on our floor has been inspected before listing.' },
          ].map(({ title, body }) => (
            <div key={title} className="card-hover p-6 text-center">
              <h3 className="text-base font-semibold text-accent mb-2">{title}</h3>
              <p className="text-mid text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
