'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VehicleCard from '@/components/VehicleCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuel_type: string
  drivetrain: string
  images: string[]
  condition: string
  status: string
  color: string
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
      .from('vehicles')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    if (!error && data) { setVehicles(data); setFiltered(data) }
    setLoading(false)
  }

  const applyFilters = () => {
    let result = [...vehicles]
    if (searchTerm) result = result.filter(v =>
      v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filters.minPrice) result = result.filter(v => v.price >= parseInt(filters.minPrice))
    if (filters.maxPrice) result = result.filter(v => v.price <= parseInt(filters.maxPrice))
    if (filters.transmission) result = result.filter(v => v.transmission === filters.transmission)
    if (filters.fuelType) result = result.filter(v => v.fuel_type === filters.fuelType)
    if (filters.drivetrain) result = result.filter(v => v.drivetrain === filters.drivetrain)
    if (filters.condition) result = result.filter(v => v.condition === filters.condition)
    setFiltered(result)
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', transmission: '', fuelType: '', drivetrain: '', condition: '' })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || Object.values(filters).some(Boolean)

  return (
    <div className="pt-[67px] md:pt-[73px] min-h-screen bg-[#020202]">

      {/* Header */}
      <section className="relative bg-[#020202] border-b border-charcoal py-20 overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="absolute top-0 left-3 bottom-0 w-0.5" style={{ background: 'rgba(228,172,41,0.2)' }} />
        <div className="absolute inset-0 track-lines opacity-60" />

        <div className="relative max-w-7xl mx-auto px-8 md:px-12">
          <p className="section-label mb-4">Available Now</p>
          <div className="gold-rule mb-6" />
          <h1 className="font-display text-5xl md:text-6xl text-offwhite uppercase leading-none mb-4">
            Browse Our{' '}
            <span className="font-serif-italic" style={{ color: '#e4ac29' }}>Stock</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            All vehicles inspected and priced transparently. What you see is what you pay.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="bg-white border-b border-gray-200 sticky top-[67px] md:top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make or model..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(o => !o)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
                showFilters
                  ? 'bg-[#020202] text-gold border-[#020202]'
                  : 'border-gray-200 text-gray-600 hover:border-gold-dark hover:text-gold-dark'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-gold flex-shrink-0" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Min Price (ZAR)', key: 'minPrice', type: 'number', placeholder: '0' },
                  { label: 'Max Price (ZAR)', key: 'maxPrice', type: 'number', placeholder: '1 000 000' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={filters[key as keyof typeof filters]}
                      onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                {[
                  { label: 'Transmission', key: 'transmission', options: ['Automatic', 'Manual', 'Semi-Automatic', 'CVT', 'DCT'] },
                  { label: 'Fuel Type', key: 'fuelType', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
                  { label: 'Drivetrain', key: 'drivetrain', options: ['4x2', '4x4', 'AWD'] },
                  { label: 'Condition', key: 'condition', options: ['New', 'Used', 'Demo'] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
                    <select
                      value={filters[key as keyof typeof filters]}
                      onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark"
                    >
                      <option value="">All</option>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gold-dark transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400 font-medium">
            Showing {filtered.length} of {vehicles.length} vehicles
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-offwhite">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-24">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-muted text-sm">Loading vehicles...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-gray-200 max-w-md mx-auto">
              <p className="text-gray-500 mb-4 text-sm">No vehicles match your criteria.</p>
              <button onClick={resetFilters} className="btn-outline-gold text-xs">Clear Filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
