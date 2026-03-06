'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  useEffect(() => {
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
    { href: '/',         label: 'Home' },
    { href: '/vehicles', label: 'Our Stock' },
    { href: '/contact',  label: 'Contact' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000] border-b border-white/8 shadow-lg">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-8">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="Dealz On Wheelz"
                width={160}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(href) ? 'text-accent' : 'text-mid hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname?.startsWith('/dashboard') ? 'text-accent' : 'text-mid hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {user && isAdminPage && (
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-mid hover:text-white transition-colors duration-200"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/vehicles" className="btn-primary text-sm py-2.5 px-5">
                Browse Stock
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(o => !o)}
              className="md:hidden text-mid hover:text-white transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#000000] border-l border-dark-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b border-dark-border">
            <Image
              src="/logo.jpg"
              alt="Dealz On Wheelz"
              width={130}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <button onClick={() => setIsOpen(false)} className="text-mid hover:text-white p-1">
              <X size={22} />
            </button>
          </div>
          <div className="flex flex-col p-5 gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`py-3 px-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(href)
                    ? 'text-accent bg-accent/10'
                    : 'text-mid hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard" className="py-3 px-3 rounded-lg text-base font-medium text-mid hover:text-white hover:bg-white/5 transition-colors">
                Dashboard
              </Link>
            )}
            {user && isAdminPage && (
              <button onClick={handleSignOut} className="py-3 px-3 rounded-lg text-base font-medium text-mid hover:text-white hover:bg-white/5 transition-colors text-left mt-4 border-t border-dark-border pt-4">
                Sign Out
              </button>
            )}
            <div className="mt-4 pt-4 border-t border-dark-border">
              <Link href="/vehicles" className="btn-primary w-full justify-center">
                Browse Stock
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}