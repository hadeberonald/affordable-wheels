import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Gauge, Fuel, Settings, ArrowRight } from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuel_type: string
  images: string[]
  drivetrain: string
  condition?: string
  color?: string
}

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)

  const formatMileage = (mileage: number) =>
    new Intl.NumberFormat('en-ZA').format(mileage) + ' km'

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <div className="bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border-b-2 border-transparent hover:border-b-gold-dark">
        {/* Image container */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              No Image Available
            </div>
          )}

          {/* Price badge — gold on black */}
          <div className="absolute top-0 left-0">
            <div
              className="px-3 py-2 font-display text-sm text-black"
              style={{ background: '#e4ac29' }}
            >
              {formatPrice(vehicle.price)}
            </div>
          </div>

          {vehicle.condition && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-mid text-xs">{vehicle.condition}</span>
            </div>
          )}
        </div>

        {/* Card body — white background */}
        <div className="bg-white p-5 border-t-0">
          {/* Make / Model / Year */}
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
              {vehicle.make}
            </p>
            <h3
              className="font-display text-lg uppercase text-gray-900 group-hover:text-gold-dark transition-colors duration-200 leading-tight"
              style={{ letterSpacing: '0.02em' }}
            >
              {vehicle.model} <span className="text-gray-400 text-base">{vehicle.year}</span>
            </h3>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 mb-3" />

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { Icon: Gauge, label: formatMileage(vehicle.mileage) },
              { Icon: Settings, label: vehicle.transmission },
              { Icon: Fuel, label: vehicle.fuel_type },
              { Icon: Calendar, label: String(vehicle.year) },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className="w-3 h-3 flex-shrink-0 text-gold-dark" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div
            className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100"
          >
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{vehicle.drivetrain}</span>
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gold-dark group-hover:gap-2 transition-all duration-200">
              View Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
