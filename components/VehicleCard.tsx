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
      <div className="card-hover overflow-hidden">
        {/* Image */}
        <div className="relative h-52 overflow-hidden rounded-t-xl bg-dark-light">
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-mid text-sm">
              No Image Available
            </div>
          )}
          {/* Price badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-accent text-black text-sm font-bold px-3 py-1.5 rounded-lg shadow-glow-sm">
              {formatPrice(vehicle.price)}
            </span>
          </div>
          {vehicle.condition && (
            <div className="absolute top-3 right-3">
              <span className="badge-mid text-xs">{vehicle.condition}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-accent transition-colors duration-200">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { Icon: Calendar, label: String(vehicle.year) },
              { Icon: Gauge,    label: formatMileage(vehicle.mileage) },
              { Icon: Settings, label: vehicle.transmission },
              { Icon: Fuel,     label: vehicle.fuel_type },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-mid">
                <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-mid">{vehicle.drivetrain}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all duration-200">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
