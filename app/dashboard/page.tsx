'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { FEATURE_CATEGORIES, COLORS, BODY_TYPES, MAKES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/vehicle-features'
import { useRouter } from 'next/navigation'
import {
  Car, Users, Image as ImageIcon, Plus, Edit, Trash2, X,
  Upload, Check, Loader2, Phone, Mail,
  Search, BarChart3, MessageSquare, InboxIcon,
  LogOut, Menu, LayoutDashboard, Eye, EyeOff,
  AlertCircle, CheckCircle,
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

type Tab = 'overview' | 'vehicles' | 'messages' | 'users' | 'hero'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 text-sm font-medium shadow-2xl border transition-all ${type === 'success' ? 'bg-[#181818] border-[#e4ac29] text-[#f5f4f0]' : 'bg-[#181818] border-red-500 text-red-400'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 text-[#e4ac29] flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
      <div className="bg-[#181818] border border-[#2a2a2a] p-8 max-w-sm w-full mx-4">
        <div className="w-10 h-10 border border-red-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-base uppercase tracking-wide text-[#f5f4f0] mb-2 font-bold">Confirm Action</h3>
        <p className="text-sm text-[#888] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#2a2a2a] text-[#888] hover:border-[#444] hover:text-[#f5f4f0] transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 transition-all">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const notify = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type })
  const askConfirm = (message: string, onConfirm: () => void) => setConfirm({ message, onConfirm })

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

  const logout = async () => { await supabase.auth.signOut(); router.push('/auth/login') }

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#e4ac29] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#888] text-sm font-bold uppercase tracking-widest">Loading dashboard</p>
      </div>
    </div>
  )

  const navItems: { id: Tab; label: string; Icon: any; adminOnly?: boolean; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',       Icon: LayoutDashboard },
    { id: 'vehicles',  label: 'Vehicles',        Icon: Car },
    { id: 'messages',  label: 'Messages',        Icon: MessageSquare, badge: unreadMessages },
    { id: 'users',     label: 'Users',           Icon: Users,     adminOnly: true },
    { id: 'hero',      label: 'Hero Carousel',   Icon: ImageIcon, adminOnly: true },
  ]

  return (
    <div className="min-h-screen bg-[#020202] flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#020202] border-r border-[#1e1e1e] z-50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-[#1e1e1e]">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e4ac29]">Admin Panel</div>
          <div className="text-lg font-bold text-[#f5f4f0] uppercase tracking-wide mt-0.5">Dashboard</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ id, label, Icon, adminOnly, badge }) => {
            if (adminOnly && userRole !== 'admin') return null
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group border-l-2 ${active ? 'bg-[#e4ac29]/8 text-[#f5f4f0] border-[#e4ac29]' : 'text-[#666] hover:text-[#f5f4f0] hover:bg-white/3 border-transparent'}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#e4ac29]' : 'group-hover:text-[#e4ac29] transition-colors'}`} />
                <span className="text-xs font-bold uppercase tracking-wider flex-1">{label}</span>
                {badge ? (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 ${active ? 'bg-[#e4ac29] text-black' : 'bg-[#e4ac29]/20 text-[#e4ac29]'}`}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#1e1e1e]">
          <div className="px-3 py-2 mb-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#e4ac29]">{userRole}</div>
            <div className="text-xs text-[#666] truncate mt-0.5">{user?.email}</div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[#666] hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#020202]/95 backdrop-blur border-b border-[#1e1e1e] px-5 py-3 flex items-center gap-4">
          <button className="lg:hidden text-[#888] hover:text-[#f5f4f0]" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold uppercase tracking-wide text-[#f5f4f0] flex-1">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Live</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          {activeTab === 'overview'  && <OverviewTab userRole={userRole} setActiveTab={setActiveTab} />}
          {activeTab === 'vehicles'  && <VehiclesTab userRole={userRole} userId={user?.id} notify={notify} askConfirm={askConfirm} />}
          {activeTab === 'messages'  && <MessagesTab onBadgeChange={setUnreadMessages} notify={notify} askConfirm={askConfirm} />}
          {activeTab === 'users'     && userRole === 'admin' && <UsersTab notify={notify} askConfirm={askConfirm} />}
          {activeTab === 'hero'      && userRole === 'admin' && <HeroTab notify={notify} askConfirm={askConfirm} />}
        </main>
      </div>

      {confirm && <ConfirmDialog message={confirm.message} onConfirm={() => { confirm.onConfirm(); setConfirm(null) }} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ userRole, setActiveTab }: { userRole: string | null; setActiveTab: (t: Tab) => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
    ]).then(([v, c]) => {
      if (v.data) setVehicles(v.data)
      if (c.data) setContacts(c.data)
      setLoading(false)
    })
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

  const stats = {
    total:     vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    sold:      vehicles.filter(v => v.status === 'sold').length,
    reserved:  vehicles.filter(v => v.status === 'reserved').length,
    contacts:  contacts.length,
    unread:    contacts.filter(c => !c.replied).length,
  }

  if (loading) return <TabLoader />

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Vehicles', value: stats.total,     accent: false },
          { label: 'Available',      value: stats.available, accent: true  },
          { label: 'Sold',           value: stats.sold,      accent: false },
          { label: 'Reserved',       value: stats.reserved,  accent: false },
          { label: 'Total Contacts', value: stats.contacts,  accent: false },
          { label: 'Unread',         value: stats.unread,    accent: stats.unread > 0 },
        ].map(({ label, value, accent }) => (
          <div key={label} className={`border p-4 ${accent ? 'border-[#e4ac29]/30 bg-[#e4ac29]/4' : 'border-[#1e1e1e] bg-[#0e0e0e]'}`}>
            <div className={`text-3xl font-bold leading-none mb-1 ${accent ? 'text-[#e4ac29]' : 'text-[#f5f4f0]'}`}>{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#555]">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-[#f5f4f0]">Recent Stock</h2>
          <button onClick={() => setActiveTab('vehicles')} className="text-[10px] font-bold uppercase tracking-widest text-[#e4ac29] hover:text-[#f0c84a]">View All →</button>
        </div>
        <div className="border border-[#1e1e1e] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e] bg-[#0e0e0e]">
                {['Vehicle', 'Price', 'Status', 'Added'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#555]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {vehicles.slice(0, 5).map(v => (
                <tr key={v.id} className="hover:bg-[#0e0e0e] transition-colors">
                  <td className="px-4 py-3 text-[#f5f4f0] font-medium">{v.year} {v.make} {v.model}</td>
                  <td className="px-4 py-3 text-[#e4ac29] font-bold text-xs">{fmt(v.price)}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-[#555] text-xs">{fmtDate(v.created_at)}</td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#555] text-sm">No vehicles in stock</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-[#f5f4f0]">Recent Enquiries</h2>
          <button onClick={() => setActiveTab('messages')} className="text-[10px] font-bold uppercase tracking-widest text-[#e4ac29] hover:text-[#f0c84a]">View All →</button>
        </div>
        <div className="space-y-2">
          {contacts.slice(0, 4).map(c => (
            <div key={c.id} className={`flex items-start gap-4 px-4 py-3 border ${c.replied ? 'border-[#1e1e1e] bg-[#0a0a0a]' : 'border-[#e4ac29]/20 bg-[#e4ac29]/3'}`}>
              <div className={`w-2 h-2 mt-1.5 flex-shrink-0 rounded-full ${c.replied ? 'bg-[#333]' : 'bg-[#e4ac29]'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#f5f4f0] text-sm">{c.name}</span>
                  <span className="text-[#555] text-xs">{c.email}</span>
                  {!c.replied && <span className="text-[9px] font-bold uppercase tracking-wider bg-[#e4ac29]/15 text-[#e4ac29] px-1.5 py-0.5">New</span>}
                </div>
                <p className="text-xs text-[#666] mt-0.5 truncate">{c.subject} — {c.message}</p>
              </div>
              <div className="text-[10px] text-[#444] flex-shrink-0">{fmtDate(c.created_at)}</div>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-[#555] text-sm py-4 text-center">No enquiries yet</p>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function MessagesTab({ onBadgeChange, notify, askConfirm }: { onBadgeChange: (n: number) => void; notify: any; askConfirm: any }) {
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
    notify('Marked as replied')
  }

  const handleDelete = async (id: string) => {
    askConfirm('Delete this message? This cannot be undone.', async () => {
      await supabase.from('contact_submissions').delete().eq('id', id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (selected?.id === id) setSelected(null)
      onBadgeChange(submissions.filter(s => s.id !== id && !s.replied).length)
      notify('Message deleted')
    })
  }

  const filtered = submissions.filter(s => {
    if (filter === 'unread' && s.replied) return false
    if (filter === 'replied' && !s.replied) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.name?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q) && !s.subject?.toLowerCase().includes(q)) return false
    }
    return true
  })

  if (loading) return <TabLoader />

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',   value: submissions.length,                         accent: false },
          { label: 'Unread',  value: submissions.filter(s => !s.replied).length, accent: true  },
          { label: 'Replied', value: submissions.filter(s => s.replied).length,  accent: false },
        ].map(s => (
          <div key={s.label} className={`border p-5 ${s.accent ? 'border-[#e4ac29]/30 bg-[#e4ac29]/4' : 'border-[#1e1e1e] bg-[#0e0e0e]'}`}>
            <div className={`text-3xl font-bold mb-1 ${s.accent ? 'text-[#e4ac29]' : 'text-[#f5f4f0]'}`}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#555]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            className="w-full bg-[#0e0e0e] border border-[#1e1e1e] text-[#f5f4f0] text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#e4ac29]/40 placeholder-[#555]"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex border border-[#1e1e1e] overflow-hidden">
          {(['all', 'unread', 'replied'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${filter === f ? 'bg-[#e4ac29] text-black' : 'bg-[#0e0e0e] text-[#666] hover:text-[#f5f4f0]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1e1e1e]">
          <InboxIcon className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm">{submissions.length === 0 ? 'No messages yet.' : 'No messages match this filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-2">
            {filtered.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelected(sub)}
                className={`w-full text-left p-4 border-2 transition-all ${selected?.id === sub.id ? 'border-[#e4ac29] bg-[#e4ac29]/5' : 'border-[#1e1e1e] bg-[#0e0e0e] hover:border-[#e4ac29]/40'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!sub.replied && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#e4ac29]" />}
                      <span className="font-semibold text-[#f5f4f0] text-sm truncate">{sub.name}</span>
                      {sub.replied && (
                        <span className="flex-shrink-0 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 uppercase tracking-wide">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666] truncate mb-0.5">{sub.subject}</p>
                    <p className="text-xs text-[#444] truncate">{sub.message}</p>
                  </div>
                  <span className="text-[10px] text-[#444] flex-shrink-0 mt-0.5">
                    {new Date(sub.created_at).toLocaleDateString('en-ZA')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-6 h-fit sticky top-24">
              <div className="flex items-start justify-between mb-5 gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[#f5f4f0] mb-0.5">{selected.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-[#666]">
                    <span>{selected.email}</span>
                    {selected.phone && <span>{selected.phone}</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#666] hover:text-[#f5f4f0] p-1 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">Subject</div>
                <p className="text-sm font-semibold text-[#f5f4f0]">{selected.subject}</p>
              </div>

              <div className="mb-5">
                <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">Message</div>
                <div className="bg-[#080808] border border-[#1a1a1a] p-4">
                  <p className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="text-xs text-[#555] mb-5">
                Received {new Date(selected.created_at).toLocaleString('en-ZA')}
                {selected.replied && selected.replied_at && (
                  <span> · Replied {new Date(selected.replied_at).toLocaleString('en-ZA')}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${selected.phone?.replace(/\D/g, '').replace(/^0/, '27')}?text=${encodeURIComponent(`Hi ${selected.name}, thanks for contacting us regarding "${selected.subject}". `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 bg-[#e4ac29] text-black hover:bg-[#f0c84a] transition-all ${!selected.phone ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(`Hi ${selected.name},\n\n`)}`}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 border border-[#1e1e1e] text-[#888] hover:text-[#f5f4f0] hover:border-[#444] transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
                {!selected.replied && (
                  <button
                    onClick={() => markReplied(selected.id)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 px-3 py-2 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Replied
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 px-3 py-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-[#1e1e1e] p-12 text-[#555] text-sm">
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
function VehiclesTab({ userRole, userId, notify, askConfirm }: { userRole: string | null; userId: string; notify: any; askConfirm: any }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (!error && data) setVehicles(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    askConfirm('Delete this vehicle listing? This cannot be undone.', async () => {
      await supabase.from('vehicles').delete().eq('id', id)
      fetchVehicles()
      notify('Vehicle deleted')
    })
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n)

  const filtered = vehicles.filter(v => {
    const matchSearch = !search || `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: stats.total,     accent: false },
          { label: 'Available', value: stats.available, accent: true  },
          { label: 'Sold',      value: stats.sold,      accent: false },
          { label: 'Reserved',  value: stats.reserved,  accent: false },
        ].map(s => (
          <div key={s.label} className={`border p-5 ${s.accent ? 'border-[#e4ac29]/30 bg-[#e4ac29]/4' : 'border-[#1e1e1e] bg-[#0e0e0e]'}`}>
            <div className={`text-3xl font-bold mb-1 ${s.accent ? 'text-[#e4ac29]' : 'text-[#f5f4f0]'}`}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#555]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['all', 'available', 'reserved', 'sold'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[#e4ac29] text-black' : 'border border-[#1e1e1e] text-[#666] hover:border-[#444] hover:text-[#f5f4f0]'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
            <input
              className="w-full bg-[#0e0e0e] border border-[#1e1e1e] text-[#f5f4f0] text-xs pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#e4ac29]/40 placeholder-[#555]"
              placeholder="Search make or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true) }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#e4ac29] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#f0c84a] transition-all flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={vehicles.length === 0 ? 'No vehicles yet. Add your first listing.' : 'No vehicles match your search.'} />
      ) : (
        <div className="border border-[#1e1e1e] overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-[#0e0e0e] border-b border-[#1e1e1e]">
              <tr>
                {['Vehicle', 'Year', 'Price', 'Status', 'Images', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-bold text-[#555] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-[#0e0e0e] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#f5f4f0] text-sm">{v.make} {v.model}</td>
                  <td className="px-5 py-4 text-[#666] text-sm">{v.year}</td>
                  <td className="px-5 py-4 text-[#e4ac29] text-sm font-bold">{fmt(v.price)}</td>
                  <td className="px-5 py-4"><StatusBadge status={v.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 items-center">
                      {v.images?.length > 0 ? (
                        <>
                          <img src={v.images[0]} alt="" className="w-10 h-10 object-cover border border-[#1e1e1e]" />
                          {v.images.length > 1 && (
                            <span className="text-xs font-bold text-[#666] bg-[#0e0e0e] border border-[#1e1e1e] px-1.5 py-0.5">
                              +{v.images.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-10 h-10 bg-[#0e0e0e] flex items-center justify-center border border-[#1e1e1e]">
                          <ImageIcon className="w-4 h-4 text-[#333]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(v); setShowModal(true) }}
                        className="w-7 h-7 flex items-center justify-center border border-[#1e1e1e] hover:border-[#e4ac29] hover:text-[#e4ac29] text-[#555] transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="w-7 h-7 flex items-center justify-center border border-[#1e1e1e] hover:border-red-500 hover:text-red-400 text-[#555] transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <VehicleModal
          vehicle={editingVehicle}
          userId={userId}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { fetchVehicles(); setShowModal(false); setEditing(null); notify(editingVehicle ? 'Vehicle updated' : 'Vehicle added') }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ notify, askConfirm }: { notify: any; askConfirm: any }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    askConfirm('Delete this user?', async () => {
      await supabase.from('users').delete().eq('id', id)
      fetchUsers()
      notify('User deleted')
    })
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[#f5f4f0] uppercase tracking-wide">Manage Users</h2>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#e4ac29] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#f0c84a] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add User
        </button>
      </div>

      {users.length === 0 ? <EmptyState message="No users found." /> : (
        <div className="border border-[#1e1e1e] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0e0e0e] border-b border-[#1e1e1e]">
              <tr>
                {['Name', 'Email', 'Role', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-bold text-[#555] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#0e0e0e] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#f5f4f0] text-sm">{u.full_name}</td>
                  <td className="px-5 py-4 text-[#666] text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${u.role === 'admin' ? 'bg-[#e4ac29]/15 text-[#e4ac29] border border-[#e4ac29]/30' : 'bg-white/5 text-[#666] border border-[#1e1e1e]'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(u.id)}
                      className="w-7 h-7 flex items-center justify-center border border-[#1e1e1e] hover:border-red-500 hover:text-red-400 text-[#555] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchUsers(); setShowModal(false); notify('User created') }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO TAB
// ═══════════════════════════════════════════════════════════════════════════════
function HeroTab({ notify, askConfirm }: { notify: any; askConfirm: any }) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditing] = useState<any>(null)

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    const { data, error } = await supabase.from('hero_carousel').select('*').order('order_index', { ascending: true })
    if (!error && data) setSlides(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    askConfirm('Delete this slide?', async () => {
      await supabase.from('hero_carousel').delete().eq('id', id)
      fetchSlides()
      notify('Slide deleted')
    })
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_carousel').update({ active: !current }).eq('id', id)
    fetchSlides()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[#f5f4f0] uppercase tracking-wide">Manage Hero Carousel</h2>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#e4ac29] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#f0c84a] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="border border-dashed border-[#1e1e1e] py-16 text-center">
          <ImageIcon className="w-8 h-8 text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No hero slides yet. Add your first slide.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map(slide => (
            <div key={slide.id} className="border border-[#1e1e1e] overflow-hidden">
              <div className="relative h-44 bg-[#0e0e0e]">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${slide.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-[#666] border border-[#1e1e1e]'}`}>
                    {slide.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-black/60 text-[#888] border border-white/10">#{slide.order_index}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#f5f4f0] mb-1">{slide.title}</h3>
                <p className="text-xs text-[#666] mb-4 line-clamp-2">{slide.subtitle}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleActive(slide.id, slide.active)}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-all ${slide.active ? 'border border-[#1e1e1e] text-[#666] hover:text-[#f5f4f0] hover:border-[#444]' : 'bg-[#e4ac29] text-black hover:bg-[#f0c84a]'}`}
                  >
                    {slide.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setEditing(slide); setShowModal(true) }}
                    className="w-7 h-7 flex items-center justify-center border border-[#1e1e1e] hover:border-[#e4ac29] hover:text-[#e4ac29] text-[#555] transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="w-7 h-7 flex items-center justify-center border border-[#1e1e1e] hover:border-red-500 hover:text-red-400 text-[#555] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          onSuccess={() => { fetchSlides(); setShowModal(false); setEditing(null); notify(editingSlide ? 'Slide updated' : 'Slide added') }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLE MODAL — full form from file 1, styled with file 2 aesthetic
// ═══════════════════════════════════════════════════════════════════════════════
function VehicleModal({ vehicle, userId, onClose, onSuccess }: any) {
  const [customMakes, setCustomMakes] = useState<string[]>([])
  const [showCustomMakeInput, setShowCustomMakeInput] = useState(false)
  const [customMakeInput, setCustomMakeInput] = useState('')
  const [savingMake, setSavingMake] = useState(false)
  const [activeSection, setActiveSection] = useState<'basic' | 'specs' | 'features' | 'media'>('basic')

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
    if (val === 'Other') { setShowCustomMakeInput(true); sf('make', '') }
    else { setShowCustomMakeInput(false); setCustomMakeInput(''); sf('make', val) }
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
    make: vehicle?.make || '', model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(), price: vehicle?.price || 0,
    mileage: vehicle?.mileage || 0, description: vehicle?.description || '',
    transmission: vehicle?.transmission || 'Automatic', fuel_type: vehicle?.fuel_type || 'Petrol',
    drivetrain: vehicle?.drivetrain || '4x2', color: vehicle?.color || '',
    interior_color: vehicle?.interior_color || '', condition: vehicle?.condition || 'Used',
    body_type: vehicle?.body_type || '', engine_size: vehicle?.engine_size || '',
    doors: vehicle?.doors || 4, seats: vehicle?.seats || 5, cylinders: vehicle?.cylinders || 4,
    airbags: vehicle?.airbags || 0, vin: vehicle?.vin || '', license_plate: vehicle?.license_plate || '',
    registration_date: vehicle?.registration_date || '', warranty: vehicle?.warranty || false,
    warranty_expiry: vehicle?.warranty_expiry || '', service_history: vehicle?.service_history || false,
    status: vehicle?.status || 'available', owners_count: vehicle?.owners_count || 0,
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
    } catch { alert('Image upload failed.') }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!uploadedImages.length) { alert('Please upload at least one image'); return }
    setSubmitting(true)
    const data = {
      ...formData, ...features, images: uploadedImages,
      price: parseFloat(String(fd.price)) || 0,
      mileage: parseFloat(String(fd.mileage)) || 0,
      year: parseInt(String(fd.year)) || new Date().getFullYear(),
      doors: parseInt(String(fd.doors)) || 4,
      seats: parseInt(String(fd.seats)) || 5,
      cylinders: parseInt(String(fd.cylinders)) || 4,
      airbags: parseInt(String(fd.airbags)) || 0,
      owners_count: parseInt(String(fd.owners_count)) || 0,
      engine_size: fd.engine_size || null,
      warranty_expiry: fd.warranty_expiry || null,
      registration_date: fd.registration_date || null,
      vin: fd.vin || null,
      license_plate: fd.license_plate || null,
      interior_color: fd.interior_color || null,
      created_by: userId,
    }
    const { error } = vehicle
      ? await supabase.from('vehicles').update(data).eq('id', vehicle.id)
      : await supabase.from('vehicles').insert([data])
    if (!error) onSuccess()
    else { alert('Error: ' + error.message); console.error(error) }
    setSubmitting(false)
  }

  const tabCls = (t: string) => `px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeSection === t ? 'text-[#e4ac29] border-[#e4ac29]' : 'text-[#555] border-transparent hover:text-[#f5f4f0]'}`

  const inputCls = "w-full bg-[#111] border border-[#2a2a2a] text-[#f5f4f0] text-sm px-3 py-2.5 focus:outline-none focus:border-[#e4ac29]/40 placeholder-[#444]"
  const selectCls = inputCls
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-[#666] mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2a2a2a] max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex justify-between items-center flex-shrink-0">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e4ac29] mb-0.5">Vehicle Management</div>
            <h2 className="text-xl font-bold text-[#f5f4f0] uppercase tracking-wide">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[#2a2a2a] text-[#555] hover:text-[#f5f4f0] hover:border-[#444] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[#2a2a2a] px-2 flex-shrink-0">
          {(['basic', 'specs', 'features', 'media'] as const).map(t => (
            <button key={t} className={tabCls(t)} onClick={() => setActiveSection(t)}>
              {t === 'basic' ? 'Basic Info' : t === 'specs' ? 'Specs' : t === 'features' ? 'Features' : 'Images'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6">

          {/* BASIC INFO */}
          {activeSection === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Make *</label>
                  <select className={selectCls} value={showCustomMakeInput ? 'Other' : fd.make} onChange={e => handleMakeChange(e.target.value)}>
                    <option value="">Select make</option>
                    {allMakes.map((m: string) => <option key={m}>{m}</option>)}
                  </select>
                  {showCustomMakeInput && (
                    <div className="mt-2 flex gap-2">
                      <input value={customMakeInput} onChange={e => { setCustomMakeInput(e.target.value); sf('make', e.target.value.trim()) }}
                        className={`${inputCls} flex-1`} placeholder="e.g. Subaru" autoFocus required />
                      <button type="button" onClick={handleSaveCustomMake} disabled={savingMake || !customMakeInput.trim()}
                        className="px-3 py-2 text-xs font-bold uppercase tracking-wide bg-[#e4ac29]/10 border border-[#e4ac29]/30 text-[#e4ac29] hover:bg-[#e4ac29]/20 disabled:opacity-40 whitespace-nowrap">
                        {savingMake ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '+ Save'}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Model *</label>
                  <input className={inputCls} value={fd.model} onChange={e => sf('model', e.target.value)} required placeholder="e.g. Hilux" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Year *</label>
                  <input type="number" className={inputCls} value={fd.year} onChange={e => sf('year', e.target.value)} required min="1900" max={new Date().getFullYear() + 1} /></div>
                <div><label className={labelCls}>Body Type *</label>
                  <select className={selectCls} value={fd.body_type} onChange={e => sf('body_type', e.target.value)} required>
                    <option value="">Select type</option>
                    {BODY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className={labelCls}>Condition</label>
                  <select className={selectCls} value={fd.condition} onChange={e => sf('condition', e.target.value)}>
                    <option>New</option><option>Used</option><option>Demo</option>
                  </select></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Price (ZAR) *</label>
                  <input type="number" className={inputCls} value={fd.price} onChange={e => sf('price', e.target.value)} required /></div>
                <div><label className={labelCls}>Mileage (km) *</label>
                  <input type="number" className={inputCls} value={fd.mileage} onChange={e => sf('mileage', e.target.value)} required /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Exterior Colour *</label>
                  <select className={selectCls} value={fd.color} onChange={e => sf('color', e.target.value)} required>
                    <option value="">Select colour</option>
                    {COLORS.map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className={labelCls}>Interior Colour</label>
                  <select className={selectCls} value={fd.interior_color} onChange={e => sf('interior_color', e.target.value)}>
                    <option value="">Select colour</option>
                    {COLORS.map(c => <option key={c}>{c}</option>)}
                  </select></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Status</label>
                  <select className={selectCls} value={fd.status} onChange={e => sf('status', e.target.value)}>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select></div>
                <div><label className={labelCls}>Previous Owners</label>
                  <input type="number" className={inputCls} value={fd.owners_count} onChange={e => sf('owners_count', e.target.value)} min="0" max="10" /></div>
                <div><label className={labelCls}>VIN Number</label>
                  <input className={`${inputCls} font-mono`} value={fd.vin} onChange={e => sf('vin', e.target.value)} placeholder="1HGBH41JXMN109186" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>License Plate</label>
                  <input className={`${inputCls} font-mono`} value={fd.license_plate} onChange={e => sf('license_plate', e.target.value)} placeholder="ABC 123 GP" /></div>
                <div><label className={labelCls}>Registration Date</label>
                  <input type="date" className={inputCls} value={fd.registration_date} onChange={e => sf('registration_date', e.target.value)} /></div>
              </div>

              <div className="space-y-3">
                <GoldCheckbox label="Warranty Available" checked={fd.warranty} onChange={v => sf('warranty', v)} />
                {fd.warranty && (
                  <div><label className={labelCls}>Warranty Expiry</label>
                    <input type="date" className={`${inputCls} max-w-xs`} value={fd.warranty_expiry} onChange={e => sf('warranty_expiry', e.target.value)} /></div>
                )}
                <GoldCheckbox label="Factory Warranty Remaining" checked={features.warranty_remaining} onChange={v => setFeatures(p => ({ ...p, warranty_remaining: v }))} />
                <GoldCheckbox label="Full Service History" checked={fd.service_history} onChange={v => sf('service_history', v)} />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea className={`${inputCls} resize-none`} value={fd.description} onChange={e => sf('description', e.target.value)} required rows={4}
                  placeholder="Describe the vehicle condition, history, notable features..." />
              </div>
            </div>
          )}

          {/* SPECS */}
          {activeSection === 'specs' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Transmission</label>
                  <select className={selectCls} value={fd.transmission} onChange={e => sf('transmission', e.target.value)}>
                    {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className={labelCls}>Fuel Type</label>
                  <select className={selectCls} value={fd.fuel_type} onChange={e => sf('fuel_type', e.target.value)}>
                    {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                  </select></div>
                <div><label className={labelCls}>Drivetrain</label>
                  <select className={selectCls} value={fd.drivetrain} onChange={e => sf('drivetrain', e.target.value)}>
                    <option value="4x2">4x2 (2WD)</option>
                    <option value="4x4">4x4 (4WD)</option>
                    <option value="AWD">AWD</option>
                  </select></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Engine Size (L)</label>
                  <input className={inputCls} value={fd.engine_size} onChange={e => sf('engine_size', e.target.value)} placeholder="2.8" /></div>
                <div><label className={labelCls}>Cylinders</label>
                  <input type="number" className={inputCls} value={fd.cylinders} onChange={e => sf('cylinders', e.target.value)} min="2" max="12" /></div>
                <div><label className={labelCls}>Airbags</label>
                  <input type="number" className={inputCls} value={fd.airbags} onChange={e => sf('airbags', e.target.value)} min="0" max="12" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Doors</label>
                  <input type="number" className={inputCls} value={fd.doors} onChange={e => sf('doors', e.target.value)} min="2" max="5" /></div>
                <div><label className={labelCls}>Seats</label>
                  <input type="number" className={inputCls} value={fd.seats} onChange={e => sf('seats', e.target.value)} min="2" max="9" /></div>
              </div>
            </div>
          )}

          {/* FEATURES */}
          {activeSection === 'features' && (
            <div className="space-y-6">
              {Object.entries(FEATURE_CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e4ac29] mb-3 pb-2 border-b border-[#2a2a2a]">{cat.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cat.features.map(f => {
                      const checked = features[f.key as keyof typeof features] as boolean
                      return (
                        <button key={f.key} type="button"
                          onClick={() => setFeatures(p => ({ ...p, [f.key]: !p[f.key as keyof typeof p] }))}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs text-left border transition-all ${checked ? 'border-[#e4ac29] bg-[#e4ac29]/8 text-[#f5f4f0]' : 'border-[#2a2a2a] text-[#666] hover:border-[#444] hover:text-[#f5f4f0]'}`}>
                          <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center border ${checked ? 'bg-[#e4ac29] border-[#e4ac29]' : 'border-[#2a2a2a]'}`}>
                            {checked && <Check className="w-2.5 h-2.5 text-black" />}
                          </div>
                          {f.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA */}
          {activeSection === 'media' && (
            <div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover border border-[#2a2a2a]" />
                      <button type="button"
                        onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && <div className="absolute bottom-1 left-1 bg-[#e4ac29] text-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">Main</div>}
                    </div>
                  ))}
                </div>
              )}
              <div className={`border-2 border-dashed p-8 text-center transition-colors ${uploading ? 'border-[#e4ac29] bg-[#e4ac29]/5' : 'border-[#2a2a2a] hover:border-[#e4ac29]/40'}`}>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" disabled={uploading} />
                <label htmlFor="img-upload" className="cursor-pointer">
                  {uploading
                    ? <div className="flex flex-col items-center"><Loader2 className="w-8 h-8 text-[#e4ac29] animate-spin mb-2" /><span className="text-sm text-[#666]">Uploading...</span></div>
                    : <><Upload className="w-8 h-8 mx-auto text-[#555] mb-2" /><div className="text-sm text-[#666]">Click to upload images</div><div className="text-xs text-[#444] mt-1">PNG, JPG, WEBP · First image = main photo</div></>
                  }
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a2a] flex-shrink-0 flex items-center gap-3 flex-wrap bg-[#181818]">
          <button onClick={handleSubmit} disabled={submitting || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#e4ac29] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#f0c84a] disabled:opacity-40 transition-all">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />{vehicle ? 'Update Vehicle' : 'Add Vehicle'}</>}
          </button>
          <button onClick={onClose} disabled={submitting || uploading}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#2a2a2a] text-[#666] hover:text-[#f5f4f0] hover:border-[#444] disabled:opacity-40 transition-all">
            Cancel
          </button>
          <span className="text-xs text-[#444] ml-auto">* Required · Images via Cloudinary</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function UserModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'agent' as 'admin' | 'agent' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password })
    if (authError) { alert(authError.message); setSubmitting(false); return }
    if (authData.user) {
      const { error } = await supabase.from('users').insert([{ id: authData.user.id, email: formData.email, full_name: formData.full_name, role: formData.role }])
      if (!error) onSuccess()
      else alert(error.message)
    }
    setSubmitting(false)
  }

  const inputCls = "w-full bg-[#111] border border-[#2a2a2a] text-[#f5f4f0] text-sm px-3 py-2.5 focus:outline-none focus:border-[#e4ac29]/40 placeholder-[#444]"
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-[#666] mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2a2a2a] max-w-md w-full">
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#f5f4f0] uppercase tracking-wide">Add User</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[#2a2a2a] text-[#555] hover:text-[#f5f4f0] hover:border-[#444] transition-all"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className={labelCls}>Full Name *</label><input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} required className={inputCls} placeholder="Jane Doe" /></div>
          <div><label className={labelCls}>Email *</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required className={inputCls} /></div>
          <div><label className={labelCls}>Password *</label><input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required className={inputCls} minLength={6} /></div>
          <div><label className={labelCls}>Role</label>
            <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as any }))} className={inputCls}>
              <option value="agent">Agent</option><option value="admin">Admin</option>
            </select></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#e4ac29] text-black hover:bg-[#f0c84a] disabled:opacity-40 transition-all">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#2a2a2a] text-[#666] hover:text-[#f5f4f0] hover:border-[#444] transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function HeroModal({ slide, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: slide?.title || '', subtitle: slide?.subtitle || '',
    image_url: slide?.image_url || '', order_index: slide?.order_index || 0, active: slide?.active ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try {
      const urls = await uploadMultipleToCloudinary(e.target.files)
      if (urls.length) setFormData(p => ({ ...p, image_url: urls[0] }))
    } catch { alert('Upload failed') }
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

  const inputCls = "w-full bg-[#111] border border-[#2a2a2a] text-[#f5f4f0] text-sm px-3 py-2.5 focus:outline-none focus:border-[#e4ac29]/40 placeholder-[#444]"
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-[#666] mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2a2a2a] max-w-lg w-full">
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#f5f4f0] uppercase tracking-wide">{slide ? 'Edit Slide' : 'Add Slide'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[#2a2a2a] text-[#555] hover:text-[#f5f4f0] hover:border-[#444] transition-all"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Hero Image *</label>
            {formData.image_url ? (
              <div className="relative group">
                <img src={formData.image_url} alt="" className="w-full h-48 object-cover border border-[#2a2a2a]" />
                <button type="button" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className={`border-2 border-dashed p-8 text-center transition-colors ${uploading ? 'border-[#e4ac29] bg-[#e4ac29]/5' : 'border-[#2a2a2a] hover:border-[#e4ac29]/40'}`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="hero-upload" disabled={uploading} />
                <label htmlFor="hero-upload" className="cursor-pointer">
                  {uploading ? <Loader2 className="w-8 h-8 mx-auto text-[#e4ac29] animate-spin" />
                    : <><Upload className="w-8 h-8 mx-auto text-[#555] mb-2" /><div className="text-sm text-[#666]">Click to upload · 1920×1080 recommended</div></>}
                </label>
              </div>
            )}
          </div>
          <div><label className={labelCls}>Title *</label><input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required className={inputCls} placeholder="Great Vehicles. Real Deals." /></div>
          <div><label className={labelCls}>Subtitle *</label><textarea value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} required rows={2} className={`${inputCls} resize-none`} /></div>
          <div><label className={labelCls}>Display Order</label><input type="number" value={formData.order_index} onChange={e => setFormData(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className={`${inputCls} w-28`} min="0" /></div>
          <GoldCheckbox label="Active (show on homepage)" checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || uploading} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#e4ac29] text-black hover:bg-[#f0c84a] disabled:opacity-40 transition-all">
              {submitting ? <><Loader2 className="w-4 h-4 inline animate-spin mr-1" />Saving...</> : slide ? 'Update Slide' : 'Add Slide'}
            </button>
            <button type="button" onClick={onClose} disabled={submitting || uploading}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#2a2a2a] text-[#666] hover:text-[#f5f4f0] hover:border-[#444] disabled:opacity-40 transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    available: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    sold:      'bg-red-500/10 text-red-400 border border-red-500/20',
    reserved:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  }
  return <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cfg[status] || cfg.available}`}>{status}</span>
}

function GoldCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-4 h-4 flex items-center justify-center border transition-all ${checked ? 'bg-[#e4ac29] border-[#e4ac29]' : 'border-[#2a2a2a] group-hover:border-[#444]'}`}
        onClick={() => onChange(!checked)}>
        {checked && <Check className="w-2.5 h-2.5 text-black" />}
      </div>
      <span className="text-sm text-[#666] group-hover:text-[#f5f4f0] transition-colors">{label}</span>
    </label>
  )
}

function TabLoader() {
  return (
    <div className="text-center py-16">
      <div className="w-8 h-8 border-2 border-[#e4ac29] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#1e1e1e] py-20 text-center">
      <p className="text-[#555] text-sm">{message}</p>
    </div>
  )
}