'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ChevronRight } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/dashboard')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/vehicles', label: 'Stock' },
    
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(13,13,13,0.98)'
            : '#020202',
          borderBottom: scrolled ? '1px solid #2e2e2e' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        {/* Top gold accent line */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #e4ac29 30%, #e4ac29 70%, transparent)' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 relative">
              <Image
                src="/logo.jpg"
                alt="Affordable Wheels"
                width={150}
                height={44}
                className="h-10 md:h-11 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative text-sm font-semibold uppercase tracking-widest transition-colors duration-200 group"
                  style={{ color: isActive(href) ? '#e4ac29' : '#888888' }}
                >
                  {label}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{
                      width: isActive(href) ? '100%' : '0%',
                      background: '#e4ac29',
                    }}
                  />
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold uppercase tracking-widest transition-colors duration-200"
                  style={{ color: pathname?.startsWith('/dashboard') ? '#e4ac29' : '#888888' }}
                >
                  Dashboard
                </Link>
              )}
              {user && isAdminPage && (
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold uppercase tracking-widest text-muted hover:text-offwhite transition-colors duration-200"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/vehicles"
                className="hidden md:inline-flex btn-gold text-xs py-2.5 px-5"
              >
                Browse Stock
              </Link>
              <button
                onClick={() => setIsOpen(o => !o)}
                className="md:hidden p-2 text-muted hover:text-offwhite transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/80"
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#020202] border-l border-charcoal shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-0.5 w-full" style={{ background: '#e4ac29' }} />
          <div className="flex justify-between items-center px-5 py-4 border-b border-charcoal">
            <Image
              src="/logo.jpg"
              alt="Affordable Wheels"
              width={130}
              height={38}
              className="h-9 w-auto object-contain"
            />
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-offwhite p-1">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col p-5 gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between py-3 px-3 text-sm font-semibold uppercase tracking-widest transition-colors"
                style={{ color: isActive(href) ? '#e4ac29' : '#888888' }}
              >
                {label}
                <ChevronRight size={14} />
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center justify-between py-3 px-3 text-sm font-semibold uppercase tracking-widest text-muted hover:text-offwhite transition-colors"
              >
                Dashboard <ChevronRight size={14} />
              </Link>
            )}
            {user && isAdminPage && (
              <button
                onClick={handleSignOut}
                className="text-left py-3 px-3 text-sm font-semibold uppercase tracking-widest text-muted hover:text-offwhite transition-colors border-t border-charcoal mt-3 pt-5"
              >
                Sign Out
              </button>
            )}
            <div className="mt-6 pt-4 border-t border-charcoal">
              <Link href="/vehicles" className="btn-gold w-full justify-center text-xs">
                View All Stock
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
