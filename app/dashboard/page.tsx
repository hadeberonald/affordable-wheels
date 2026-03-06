'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { FEATURE_CATEGORIES, COLORS, BODY_TYPES, MAKES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/vehicle-features'
import { useRouter } from 'next/navigation'
import {
  Car, Users, Image as ImageIcon, Plus, Edit, Trash2, X,
  Upload, Check, Loader2, Eye, Phone, Mail,
  CheckCircle, Clock, XCircle, Search,
  BarChart3, MessageSquare, InboxIcon, ChevronDown,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRow {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'agent'
}
interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  images: string[]
  created_at: string
}
interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image_url: string
  order_index: number
  active: boolean
}
interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  replied: boolean
  replied_at: string | null
  created_at: string
}

type Tab = 'vehicles' | 'messages' | 'users' | 'hero'

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('vehicles')
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data) setUserRole(data.role)
    const { count } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('replied', false)
    setUnreadMessages(count || 0)
    setLoading(false)
  }

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-mid text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; Icon: any; adminOnly?: boolean; badge?: number }[] = [
    { id: 'vehicles', label: 'Vehicles',      Icon: Car },
    { id: 'messages', label: 'Messages',      Icon: MessageSquare, badge: unreadMessages },
    { id: 'users',    label: 'Users',         Icon: Users,     adminOnly: true },
    { id: 'hero',     label: 'Hero Carousel', Icon: ImageIcon, adminOnly: true },
  ]

  return (
    <div className="pt-20 min-h-screen bg-dark">

      {/* Header */}
      <div className="bg-dark-light border-b border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <div className="flex items-center gap-3">
              <p className="text-mid text-sm">{user?.email}</p>
              {userRole && (
                <span className="badge-accent text-xs">{userRole}</span>
              )}
            </div>
          </div>
          <BarChart3 className="w-8 h-8 text-accent opacity-40" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-dark-light border-b border-dark-border sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, Icon, adminOnly, badge }) => {
              if (adminOnly && userRole !== 'admin') return null
              const active = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    active
                      ? 'text-accent border-accent'
                      : 'text-mid border-transparent hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge ? (
                    <span className="absolute top-2.5 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'vehicles' && <VehiclesTab userRole={userRole} userId={user?.id} />}
        {activeTab === 'messages' && <MessagesTab onBadgeChange={setUnreadMessages} />}
        {activeTab === 'users'    && userRole === 'admin' && <UsersTab />}
        {activeTab === 'hero'     && userRole === 'admin' && <HeroTab />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function MessagesTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactSubmission | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('contact_submissions').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setSubmissions(data)
      onBadgeChange(data.filter(s => !s.replied).length)
    }
    setLoading(false)
  }

  const markReplied = async (id: string) => {
    await supabase
      .from('contact_submissions')
      .update({ replied: true, replied_at: new Date().toISOString() })
      .eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, replied: true, replied_at: new Date().toISOString() } : s))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, replied: true } : prev)
    onBadgeChange(submissions.filter(s => s.id !== id && !s.replied).length)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_submissions').delete().eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
    onBadgeChange(submissions.filter(s => s.id !== id && !s.replied).length)
  }

  const filtered = submissions.filter(s => {
    if (filter === 'unread'  && s.replied)  return false
    if (filter === 'replied' && !s.replied) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.name?.toLowerCase().includes(q) &&
        !s.email?.toLowerCase().includes(q) &&
        !s.subject?.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  if (loading) return <TabLoader />

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',   value: submissions.length,                         color: 'border-dark-border' },
          { label: 'Unread',  value: submissions.filter(s => !s.replied).length, color: 'border-red-500/40' },
          { label: 'Replied', value: submissions.filter(s => s.replied).length,  color: 'border-green-500/40' },
        ].map(s => (
          <div key={s.label} className={`card p-5 border ${s.color}`}>
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs text-mid font-medium uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid" />
          <input
            className="input-field pl-9 py-2 text-sm w-full"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-dark-border">
          {(['all', 'unread', 'replied'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                filter === f ? 'bg-accent text-black' : 'bg-dark-card text-mid hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <InboxIcon className="w-10 h-10 text-dark-border mx-auto mb-3" />
          <p className="text-mid text-sm">
            {submissions.length === 0 ? 'No messages yet.' : 'No messages match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-2">
            {filtered.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelected(sub)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected?.id === sub.id
                    ? 'border-accent bg-accent/5'
                    : 'border-dark-border bg-dark-card hover:border-accent/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!sub.replied && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />
                      )}
                      <span className="font-semibold text-white text-sm truncate">{sub.name}</span>
                      {sub.replied && (
                        <span className="flex-shrink-0 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded">
                          REPLIED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-mid truncate mb-0.5">{sub.subject}</p>
                    <p className="text-xs text-mid/70 truncate">{sub.message}</p>
                  </div>
                  <span className="text-[10px] text-mid flex-shrink-0 mt-0.5">
                    {new Date(sub.created_at).toLocaleDateString('en-ZA')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="card p-6 h-fit sticky top-24">
              <div className="flex items-start justify-between mb-5 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-0.5">{selected.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-mid">
                    <span>{selected.email}</span>
                    {selected.phone && <span>{selected.phone}</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-mid hover:text-white p-1 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-semibold text-mid uppercase tracking-wide mb-1">Subject</div>
                <p className="text-sm font-semibold text-white">{selected.subject}</p>
              </div>

              <div className="mb-5">
                <div className="text-xs font-semibold text-mid uppercase tracking-wide mb-2">Message</div>
                <div className="bg-dark-light border border-dark-border rounded-lg p-4">
                  <p className="text-sm text-mid leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="text-xs text-mid mb-5">
                Received {new Date(selected.created_at).toLocaleString('en-ZA')}
                {selected.replied && selected.replied_at && (
                  <span> · Replied {new Date(selected.replied_at).toLocaleString('en-ZA')}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${selected.phone?.replace(/\D/g, '').replace(/^0/, '27')}?text=${encodeURIComponent(`Hi ${selected.name}, thanks for contacting Dealz On Wheelz regarding "${selected.subject}". `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-primary text-xs py-2 px-4 gap-1.5 ${!selected.phone ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(`Hi ${selected.name},\n\n`)}`}
                  className="btn-outline text-xs py-2 px-4 gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
                {!selected.replied && (
                  <button
                    onClick={() => markReplied(selected.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Replied
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-dark-border rounded-xl p-12 text-mid text-sm">
              Select a message to view
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function VehiclesTab({ userRole, userId }: { userRole: string | null; userId: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles').select('*').order('created_at', { ascending: false })
    if (!error && data) setVehicles(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle listing?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    fetchVehicles()
  }

  const filtered = vehicles.filter(v => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)
  })

  const stats = {
    total:     vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    sold:      vehicles.filter(v => v.status === 'sold').length,
    reserved:  vehicles.filter(v => v.status === 'reserved').length,
  }

  if (loading) return <TabLoader />

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: stats.total,     color: 'border-dark-border' },
          { label: 'Available', value: stats.available, color: 'border-green-500/40' },
          { label: 'Sold',      value: stats.sold,      color: 'border-red-500/40' },
          { label: 'Reserved',  value: stats.reserved,  color: 'border-amber-500/40' },
        ].map(s => (
          <div key={s.label} className={`card p-5 border ${s.color}`}>
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs text-mid font-medium uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid" />
          <input
            className="input-field pl-9 py-2 text-sm w-full"
            placeholder="Search make or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={vehicles.length === 0 ? 'No vehicles yet. Add your first listing.' : 'No vehicles match your search.'} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-light border-b border-dark-border">
                <tr>
                  {['Vehicle', 'Year', 'Price', 'Status', 'Images', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-mid uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-dark-light/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white text-sm">{v.make} {v.model}</td>
                    <td className="px-5 py-4 text-mid text-sm">{v.year}</td>
                    <td className="px-5 py-4 text-white text-sm font-medium">
                      R {new Intl.NumberFormat('en-ZA').format(v.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${
                        v.status === 'available' ? 'badge-success' :
                        v.status === 'sold'      ? 'badge-danger'  : 'badge-warning'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 items-center">
                        {v.images?.length > 0 ? (
                          <>
                            <img
                              src={v.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-dark-border"
                            />
                            {v.images.length > 1 && (
                              <span className="text-xs font-bold text-mid bg-dark-light border border-dark-border px-1.5 py-0.5 rounded">
                                +{v.images.length - 1}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="w-10 h-10 bg-dark-light rounded-lg flex items-center justify-center border border-dark-border">
                            <ImageIcon className="w-4 h-4 text-mid" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(v); setShowModal(true) }}
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <VehicleModal
          vehicle={editingVehicle}
          userId={userId}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { fetchVehicles(); setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('users').delete().eq('id', id)
    fetchUsers()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Manage Users</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {users.length === 0 ? <EmptyState message="No users found." /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-light border-b border-dark-border">
                <tr>
                  {['Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-mid uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-dark-light/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white text-sm">{u.full_name}</td>
                    <td className="px-5 py-4 text-mid text-sm">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={u.role === 'admin' ? 'badge-accent' : 'badge-mid'}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchUsers(); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO TAB
// ═══════════════════════════════════════════════════════════════════════════════
function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditing] = useState<any>(null)

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('hero_carousel').select('*').order('order_index', { ascending: true })
    if (!error && data) setSlides(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return
    await supabase.from('hero_carousel').delete().eq('id', id)
    fetchSlides()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_carousel').update({ active: !current }).eq('id', id)
    fetchSlides()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Manage Hero Carousel</h2>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {slides.length === 0 ? <EmptyState message="No slides yet. Add your first hero slide." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map(slide => (
            <div key={slide.id} className="card overflow-hidden">
              <div className="relative h-44 bg-dark-light">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover rounded-t-xl" />
                <div className="absolute top-3 right-3">
                  {slide.active
                    ? <span className="badge-success">Active</span>
                    : <span className="badge-mid">Inactive</span>}
                </div>
                <div className="absolute top-3 left-3">
                  <span className="badge-mid">#{slide.order_index}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-1">{slide.title}</h3>
                <p className="text-xs text-mid mb-4 line-clamp-2">{slide.subtitle}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleActive(slide.id, slide.active)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      slide.active
                        ? 'bg-dark-light text-mid hover:text-white border border-dark-border'
                        : 'btn-primary py-1.5 px-3 text-xs'
                    }`}
                  >
                    {slide.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setEditing(slide); setShowModal(true) }}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <HeroModal
          slide={editingSlide}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { fetchSlides(); setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function VehicleModal({ vehicle, userId, onClose, onSuccess }: any) {
  const [customMakes, setCustomMakes] = useState<string[]>([])
  const [showCustomMakeInput, setShowCustomMakeInput] = useState(false)
  const [customMakeInput, setCustomMakeInput] = useState('')
  const [savingMake, setSavingMake] = useState(false)

  useEffect(() => {
    supabase.from('custom_makes').select('name').order('name').then(({ data }) => {
      if (data) setCustomMakes(data.map((r: any) => r.name))
    })
    if (vehicle?.make && !MAKES.includes(vehicle.make)) {
      setShowCustomMakeInput(true)
      setCustomMakeInput(vehicle.make)
    }
  }, [])

  const allMakes = [...MAKES.filter((m: string) => m !== 'Other'), ...customMakes, 'Other']

  const handleMakeChange = (val: string) => {
    if (val === 'Other') {
      setShowCustomMakeInput(true)
      sf('make', '')
    } else {
      setShowCustomMakeInput(false)
      setCustomMakeInput('')
      sf('make', val)
    }
  }

  const handleSaveCustomMake = async () => {
    const trimmed = customMakeInput.trim()
    if (!trimmed) return
    sf('make', trimmed)
    const alreadyExists = [...MAKES, ...customMakes].map((m: string) => m.toLowerCase()).includes(trimmed.toLowerCase())
    if (alreadyExists) return
    setSavingMake(true)
    await supabase.from('custom_makes').insert([{ name: trimmed }])
    setCustomMakes((prev: string[]) => [...prev, trimmed].sort())
    setSavingMake(false)
  }

  const [formData, setFormData] = useState({
    make:                      vehicle?.make        || '',
    model:                     vehicle?.model       || '',
    year:                      vehicle?.year        || new Date().getFullYear(),
    price:                     vehicle?.price       || 0,
    mileage:                   vehicle?.mileage     || 0,
    description:               vehicle?.description || '',
    transmission:              vehicle?.transmission || 'Automatic',
    fuel_type:                 vehicle?.fuel_type   || 'Petrol',
    drivetrain:                vehicle?.drivetrain  || '4x2',
    color:                     vehicle?.color       || '',
    interior_color:            vehicle?.interior_color || '',
    condition:                 vehicle?.condition   || 'Used',
    body_type:                 vehicle?.body_type   || '',
    engine_size:               vehicle?.engine_size || '',
    doors:                     vehicle?.doors       || 4,
    seats:                     vehicle?.seats       || 5,
    cylinders:                 vehicle?.cylinders   || 4,
    airbags:                   vehicle?.airbags     || 0,
    vin:                       vehicle?.vin         || '',
    license_plate:             vehicle?.license_plate || '',
    registration_date:         vehicle?.registration_date || '',
    warranty:                  vehicle?.warranty    || false,
    warranty_expiry:           vehicle?.warranty_expiry || '',
    service_history:           vehicle?.service_history || false,
    status:                    vehicle?.status      || 'available',
    owners_count:              vehicle?.owners_count || 0,
  })

  const [features, setFeatures] = useState({
    abs: vehicle?.abs||false, traction_control: vehicle?.traction_control||false,
    stability_control: vehicle?.stability_control||false, hill_assist: vehicle?.hill_assist||false,
    lane_assist: vehicle?.lane_assist||false, blind_spot_monitor: vehicle?.blind_spot_monitor||false,
    rear_cross_traffic: vehicle?.rear_cross_traffic||false, adaptive_cruise: vehicle?.adaptive_cruise||false,
    auto_emergency_brake: vehicle?.auto_emergency_brake||false, alarm_system: vehicle?.alarm_system||false,
    immobilizer: vehicle?.immobilizer||false, central_locking: vehicle?.central_locking||false,
    isofix: vehicle?.isofix||false, aircon: vehicle?.aircon||false,
    climate_control: vehicle?.climate_control||false, rear_ac: vehicle?.rear_ac||false,
    cruise_control: vehicle?.cruise_control||false, power_steering: vehicle?.power_steering||false,
    electric_seats: vehicle?.electric_seats||false, memory_seats: vehicle?.memory_seats||false,
    heated_seats: vehicle?.heated_seats||false, leather_seats: vehicle?.leather_seats||false,
    bluetooth: vehicle?.bluetooth||false, usb_port: vehicle?.usb_port||false,
    aux_input: vehicle?.aux_input||false, touchscreen: vehicle?.touchscreen||false,
    navigation: vehicle?.navigation||false, multimedia_system: vehicle?.multimedia_system||false,
    apple_carplay: vehicle?.apple_carplay||false, android_auto: vehicle?.android_auto||false,
    reverse_camera: vehicle?.reverse_camera||false, parking_sensors: vehicle?.parking_sensors||false,
    electric_windows: vehicle?.electric_windows||false, electric_mirrors: vehicle?.electric_mirrors||false,
    keyless_entry: vehicle?.keyless_entry||false, keyless_start: vehicle?.keyless_start||false,
    sunroof: vehicle?.sunroof||false, panoramic_roof: vehicle?.panoramic_roof||false,
    paddle_shifters: vehicle?.paddle_shifters||false, sport_mode: vehicle?.sport_mode||false,
    eco_mode: vehicle?.eco_mode||false, alloy_wheels: vehicle?.alloy_wheels||false,
    fog_lights: vehicle?.fog_lights||false, xenon_lights: vehicle?.xenon_lights||false,
    led_lights: vehicle?.led_lights||false, daytime_running_lights: vehicle?.daytime_running_lights||false,
    tow_bar: vehicle?.tow_bar||false, roof_rails: vehicle?.roof_rails||false,
    warranty_remaining: vehicle?.warranty_remaining||false,
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>(vehicle?.images || [])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fd = formData
  const sf = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try {
      const urls = await uploadMultipleToCloudinary(e.target.files)
      setUploadedImages(p => [...p, ...urls])
    } catch {
      alert('Image upload failed.')
    }
    setUploading(false)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!uploadedImages.length) { alert('Please upload at least one image'); return }
    setSubmitting(true)
    const data = {
      ...formData, ...features, images: uploadedImages,
      price:       parseFloat(String(fd.price))   || 0,
      mileage:     parseFloat(String(fd.mileage)) || 0,
      year:        parseInt(String(fd.year))      || new Date().getFullYear(),
      doors:       parseInt(String(fd.doors))     || 4,
      seats:       parseInt(String(fd.seats))     || 5,
      cylinders:   parseInt(String(fd.cylinders)) || 4,
      airbags:     parseInt(String(fd.airbags))   || 0,
      owners_count: parseInt(String(fd.owners_count)) || 0,
      engine_size:       fd.engine_size       || null,
      warranty_expiry:   fd.warranty_expiry   || null,
      registration_date: fd.registration_date || null,
      vin:               fd.vin               || null,
      license_plate:     fd.license_plate     || null,
      interior_color:    fd.interior_color    || null,
      created_by: userId,
    }
    const { error } = vehicle
      ? await supabase.from('vehicles').update(data).eq('id', vehicle.id)
      : await supabase.from('vehicles').insert([data])
    if (!error) onSuccess()
    else { alert('Error: ' + error.message); console.error(error) }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-glow-lg">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex-shrink-0 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <button onClick={onClose} className="text-mid hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Images */}
            <FormSection title="Vehicle Images *">
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-dark-border" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-1 left-1 bg-accent text-black px-1.5 py-0.5 text-[10px] font-bold rounded">
                          MAIN
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${uploading ? 'border-accent bg-accent/5' : 'border-dark-border hover:border-accent/50'}`}>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" disabled={uploading} />
                <label htmlFor="img-upload" className="cursor-pointer">
                  {uploading
                    ? <div className="flex flex-col items-center"><Loader2 className="w-8 h-8 text-accent animate-spin mb-2" /><span className="text-sm text-mid">Uploading...</span></div>
                    : <><Upload className="w-8 h-8 mx-auto text-mid mb-2" /><div className="text-sm font-medium text-mid">Click to upload images</div><div className="text-xs text-mid/60 mt-1">PNG, JPG, WEBP · First image = main photo</div></>
                  }
                </label>
              </div>
            </FormSection>

            {/* Basic Info */}
            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Make *">
                  <select
                    value={showCustomMakeInput ? 'Other' : fd.make}
                    onChange={e => handleMakeChange(e.target.value)}
                    required={!showCustomMakeInput}
                    className="input-field"
                  >
                    <option value="">Select make</option>
                    {allMakes.map((m: string) => <option key={m}>{m}</option>)}
                  </select>
                  {showCustomMakeInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={customMakeInput}
                        onChange={e => { setCustomMakeInput(e.target.value); sf('make', e.target.value.trim()) }}
                        className="input-field flex-1"
                        placeholder="e.g. Subaru"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomMake}
                        disabled={savingMake || !customMakeInput.trim()}
                        className="btn-primary px-3 py-2 text-xs gap-1.5 disabled:opacity-50 whitespace-nowrap"
                        title="Save to makes list for future use"
                      >
                        {savingMake ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Save Make
                      </button>
                    </div>
                  )}
                </Field>
                <Field label="Model *">
                  <input value={fd.model} onChange={e => sf('model', e.target.value)} required className="input-field" placeholder="Hilux" />
                </Field>
                <Field label="Year *">
                  <input type="number" value={fd.year} onChange={e => sf('year', e.target.value)} required className="input-field" min="1900" max={new Date().getFullYear() + 1} />
                </Field>
                <Field label="Body Type *">
                  <select value={fd.body_type} onChange={e => sf('body_type', e.target.value)} required className="input-field">
                    <option value="">Select type</option>
                    {BODY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Condition">
                  <select value={fd.condition} onChange={e => sf('condition', e.target.value)} className="input-field">
                    <option>New</option><option>Used</option><option>Demo</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={fd.status} onChange={e => sf('status', e.target.value)} className="input-field">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </Field>
              </div>
            </FormSection>

            {/* Pricing */}
            <FormSection title="Pricing & Mileage">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Asking Price (ZAR) *">
                  <input type="number" value={fd.price} onChange={e => sf('price', e.target.value)} required className="input-field" />
                </Field>
                <Field label="Mileage (km) *">
                  <input type="number" value={fd.mileage} onChange={e => sf('mileage', e.target.value)} required className="input-field" />
                </Field>
              </div>
            </FormSection>

            {/* Technical */}
            <FormSection title="Technical Specifications">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Transmission">
                  <select value={fd.transmission} onChange={e => sf('transmission', e.target.value)} className="input-field">
                    {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Fuel Type">
                  <select value={fd.fuel_type} onChange={e => sf('fuel_type', e.target.value)} className="input-field">
                    {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Drivetrain">
                  <select value={fd.drivetrain} onChange={e => sf('drivetrain', e.target.value)} className="input-field">
                    <option value="4x2">4x2 (2WD)</option>
                    <option value="4x4">4x4 (4WD)</option>
                    <option value="AWD">AWD</option>
                  </select>
                </Field>
                <Field label="Engine Size (L)">
                  <input value={fd.engine_size} onChange={e => sf('engine_size', e.target.value)} className="input-field" placeholder="2.8" />
                </Field>
                <Field label="Cylinders">
                  <input type="number" value={fd.cylinders} onChange={e => sf('cylinders', e.target.value)} className="input-field" min="2" max="12" />
                </Field>
                <Field label="Doors">
                  <input type="number" value={fd.doors} onChange={e => sf('doors', e.target.value)} required className="input-field" min="2" max="5" />
                </Field>
                <Field label="Seats">
                  <input type="number" value={fd.seats} onChange={e => sf('seats', e.target.value)} required className="input-field" min="2" max="9" />
                </Field>
                <Field label="Airbags">
                  <input type="number" value={fd.airbags} onChange={e => sf('airbags', e.target.value)} className="input-field" min="0" max="12" />
                </Field>
              </div>
            </FormSection>

            {/* Colours */}
            <FormSection title="Colours">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Exterior Colour *">
                  <select value={fd.color} onChange={e => sf('color', e.target.value)} required className="input-field">
                    <option value="">Select colour</option>
                    {COLORS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Interior Colour">
                  <select value={fd.interior_color} onChange={e => sf('interior_color', e.target.value)} className="input-field">
                    <option value="">Select colour</option>
                    {COLORS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            </FormSection>

            {/* Identification */}
            <FormSection title="Vehicle Identification">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="VIN Number">
                  <input value={fd.vin} onChange={e => sf('vin', e.target.value)} className="input-field font-mono" placeholder="1HGBH41JXMN109186" />
                </Field>
                <Field label="License Plate">
                  <input value={fd.license_plate} onChange={e => sf('license_plate', e.target.value)} className="input-field font-mono" placeholder="ABC 123 GP" />
                </Field>
                <Field label="Registration Date">
                  <input type="date" value={fd.registration_date} onChange={e => sf('registration_date', e.target.value)} className="input-field" />
                </Field>
              </div>
            </FormSection>

            {/* History */}
            <FormSection title="Warranty & Service History">
              <div className="space-y-4">
                <Field label="Previous Owners">
                  <input type="number" value={fd.owners_count} onChange={e => sf('owners_count', e.target.value)} className="input-field w-32" min="0" max="10" />
                </Field>
                <div className="flex flex-col gap-3">
                  <CheckboxField label="Warranty Available" checked={fd.warranty} onChange={v => sf('warranty', v)} />
                  {fd.warranty && (
                    <Field label="Warranty Expiry">
                      <input type="date" value={fd.warranty_expiry} onChange={e => sf('warranty_expiry', e.target.value)} className="input-field max-w-xs" />
                    </Field>
                  )}
                  <CheckboxField label="Factory Warranty Remaining" checked={features.warranty_remaining} onChange={v => setFeatures(p => ({ ...p, warranty_remaining: v }))} />
                  <CheckboxField label="Full Service History" checked={fd.service_history} onChange={v => sf('service_history', v)} />
                </div>
              </div>
            </FormSection>

            {/* Description */}
            <FormSection title="Description *">
              <textarea
                value={fd.description}
                onChange={e => sf('description', e.target.value)}
                required
                rows={5}
                className="input-field resize-none"
                placeholder="Describe the vehicle condition, history, notable features..."
              />
            </FormSection>

            {/* Features */}
            <FormSection title="Features & Equipment">
              <div className="space-y-5">
                {Object.entries(FEATURE_CATEGORIES).map(([catKey, cat]) => (
                  <div key={catKey} className="bg-dark-light rounded-xl p-4 border border-dark-border">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {cat.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.features.map(f => (
                        <label key={f.key} className="flex items-center gap-2 p-1.5 hover:bg-dark-card rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={features[f.key as keyof typeof features] as boolean}
                            onChange={e => setFeatures(p => ({ ...p, [f.key]: e.target.checked }))}
                            className="w-4 h-4 accent-accent rounded"
                          />
                          <span className="text-xs text-mid">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-border flex-shrink-0 bg-dark-card rounded-b-2xl flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="btn-primary disabled:opacity-50 gap-2"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              : <><Check className="w-4 h-4" />{vehicle ? 'Update Vehicle' : 'Add Vehicle'}</>
            }
          </button>
          <button
            onClick={onClose}
            disabled={submitting || uploading}
            className="btn-outline disabled:opacity-50"
          >
            Cancel
          </button>
          <span className="text-xs text-mid ml-auto">* Required · Images via Cloudinary</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function UserModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', role: 'agent' as 'admin' | 'agent',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })
    if (authError) { alert(authError.message); setSubmitting(false); return }
    if (authData.user) {
      const { error } = await supabase.from('users').insert([{
        id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
      }])
      if (!error) onSuccess()
      else alert(error.message)
    }
    setSubmitting(false)
  }

  return (
    <ModalShell title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full Name *">
          <input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} required className="input-field" placeholder="Jane Doe" />
        </Field>
        <Field label="Email *">
          <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required className="input-field" placeholder="jane@dealzonwheelz.co.za" />
        </Field>
        <Field label="Password *">
          <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required className="input-field" minLength={6} placeholder="••••••••" />
        </Field>
        <Field label="Role">
          <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as any }))} className="input-field">
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </ModalShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function HeroModal({ slide, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title:       slide?.title       || '',
    subtitle:    slide?.subtitle    || '',
    image_url:   slide?.image_url   || '',
    order_index: slide?.order_index || 0,
    active:      slide?.active      ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try {
      const urls = await uploadMultipleToCloudinary(e.target.files)
      if (urls.length) setFormData(p => ({ ...p, image_url: urls[0] }))
    } catch {
      alert('Upload failed')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image_url) { alert('Please upload an image'); return }
    setSubmitting(true)
    const { error } = slide
      ? await supabase.from('hero_carousel').update(formData).eq('id', slide.id)
      : await supabase.from('hero_carousel').insert([formData])
    if (!error) onSuccess()
    else alert('Error: ' + error.message)
    setSubmitting(false)
  }

  return (
    <ModalShell title={slide ? 'Edit Slide' : 'Add Slide'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-dark-light rounded-xl p-5 border border-dark-border">
          <div className="text-sm font-semibold text-white mb-3">Hero Image *</div>
          {formData.image_url ? (
            <div className="relative group">
              <img src={formData.image_url} alt="" className="w-full h-48 object-cover rounded-lg border border-dark-border" />
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'border-accent bg-accent/5' : 'border-dark-border hover:border-accent/50'}`}>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="hero-upload" disabled={uploading} />
              <label htmlFor="hero-upload" className="cursor-pointer">
                {uploading
                  ? <Loader2 className="w-8 h-8 mx-auto text-accent animate-spin" />
                  : <><Upload className="w-8 h-8 mx-auto text-mid mb-2" /><div className="text-sm text-mid">Click to upload · 1920×1080 recommended</div></>
                }
              </label>
            </div>
          )}
        </div>

        <Field label="Title *">
          <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required className="input-field" placeholder="Great Vehicles. Real Deals." />
        </Field>
        <Field label="Subtitle *">
          <textarea value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} required rows={2} className="input-field resize-none" />
        </Field>
        <Field label="Display Order">
          <input type="number" value={formData.order_index} onChange={e => setFormData(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className="input-field w-28" min="0" />
        </Field>
        <CheckboxField label="Active (show on homepage)" checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting || uploading} className="btn-primary disabled:opacity-50 gap-2">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              : <><Check className="w-4 h-4" />{slide ? 'Update Slide' : 'Add Slide'}</>
            }
          </button>
          <button type="button" onClick={onClose} disabled={submitting || uploading} className="btn-outline disabled:opacity-50">
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-glow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-mid hover:text-white p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-accent/30 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-accent"
      />
      <span className="text-sm font-medium text-mid group-hover:text-white transition-colors">{label}</span>
    </label>
  )
}

function TabLoader() {
  return (
    <div className="text-center py-16">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 card">
      <p className="text-mid text-sm">{message}</p>
    </div>
  )
}