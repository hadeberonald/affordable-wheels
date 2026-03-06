'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VehicleCard from '@/components/VehicleCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface Vehicle {
  id: string; make: string; model: string; year: number; price: number
  mileage: number; transmission: string; fuel_type: string; drivetrain: string
  images: string[]; condition: string; status: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filtered, setFiltered] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '', maxPrice: '', transmission: '', fuelType: '', drivetrain: '', condition: '',
  })

  useEffect(() => { fetchVehicles() }, [])
  useEffect(() => { applyFilters() }, [searchTerm, filters, vehicles])

  const fetchVehicles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles').select('*').eq('status', 'available').order('created_at', { ascending: false })
    if (!error && data) { setVehicles(data); setFiltered(data) }
    setLoading(false)
  }

  const applyFilters = () => {
    let result = [...vehicles]
    if (searchTerm) result = result.filter(v =>
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filters.minPrice)    result = result.filter(v => v.price >= parseInt(filters.minPrice))
    if (filters.maxPrice)    result = result.filter(v => v.price <= parseInt(filters.maxPrice))
    if (filters.transmission) result = result.filter(v => v.transmission === filters.transmission)
    if (filters.fuelType)    result = result.filter(v => v.fuel_type === filters.fuelType)
    if (filters.drivetrain)  result = result.filter(v => v.drivetrain === filters.drivetrain)
    if (filters.condition)   result = result.filter(v => v.condition === filters.condition)
    setFiltered(result)
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', transmission: '', fuelType: '', drivetrain: '', condition: '' })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || Object.values(filters).some(Boolean)

  return (
    <div className="pt-20 min-h-screen bg-dark">
      {/* Header */}
      <section className="bg-dark-light border-b border-dark-border py-20 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="divider-glow mb-7" />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Browse Our <span className="text-accent text-glow">Stock</span>
          </h1>
          <p className="text-mid text-lg max-w-2xl leading-relaxed">
            All vehicles inspected and priced transparently. What you see is what you pay.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-7 bg-dark-light border-b border-dark-border sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mid" />
              <input
                type="text"
                placeholder="Search by make or model..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <button
              onClick={() => setShowFilters(o => !o)}
              className={`btn-outline gap-2 ${showFilters ? 'bg-accent text-black border-accent' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent ml-1" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-5 card p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Min Price (ZAR)', key: 'minPrice', type: 'number', placeholder: '0' },
                  { label: 'Max Price (ZAR)', key: 'maxPrice', type: 'number', placeholder: '1 000 000' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">{label}</label>
                    <input type={type} value={filters[key as keyof typeof filters]}
                      onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                      className="input-field" placeholder={placeholder} />
                  </div>
                ))}
                {[
                  { label: 'Transmission', key: 'transmission', options: ['Automatic', 'Manual', 'Semi-Automatic', 'CVT', 'DCT'] },
                  { label: 'Fuel Type', key: 'fuelType', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
                  { label: 'Drivetrain', key: 'drivetrain', options: ['4x2', '4x4', 'AWD'] },
                  { label: 'Condition', key: 'condition', options: ['New', 'Used', 'Demo'] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">{label}</label>
                    <select value={filters[key as keyof typeof filters]}
                      onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                      className="input-field">
                      <option value="">All</option>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-mid hover:text-accent transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-xs text-mid">
            Showing {filtered.length} of {vehicles.length} vehicles
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-24">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-mid text-sm">Loading vehicles...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 card max-w-md mx-auto">
              <p className="text-mid mb-4">No vehicles match your criteria.</p>
              <button onClick={resetFilters} className="btn-outline">Clear Filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
