'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignUp) {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } }
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id, email, full_name: fullName, role: 'agent',
        })
        if (insertError) { setError(`Account created but profile error: ${insertError.message}`); setLoading(false); return }
        setSuccess('Account created. Ask an admin to promote your role via the SQL Editor, then sign in.')
        setIsSignUp(false)
        setLoading(false)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false) }
      else router.push('/dashboard')
    }
  }

  return (
    <div className="pt-[73px] min-h-screen bg-[#020202] flex items-center justify-center px-5">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 bottom-0 w-1 bg-gold z-10" />

      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <p className="section-label mb-3">Staff Access</p>
          <div className="gold-rule mx-auto mb-4" />
          <h1 className="font-display text-4xl uppercase text-offwhite">
            {isSignUp ? 'Create Account' : 'Staff Login'}
          </h1>
        </div>

        <div
          className="bg-charcoal border border-charcoal-border p-8"
          
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-gold/10 border border-gold/30 text-gold text-sm">
              {success}
              <div className="mt-3 text-xs text-muted">
                Run this in Supabase SQL Editor:
                <code className="bg-[#020202] p-1.5 block mt-1 text-gold font-mono text-xs">
                  UPDATE users SET role = 'admin' WHERE email = '{email}';
                </code>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-1.5">Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                  className="input-field"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field"
                placeholder="you@affordablewheels.co.za"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="input-field"
                placeholder="••••••••"
              />
              {isSignUp && <p className="text-xs text-muted mt-1">Minimum 6 characters</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-xs disabled:opacity-50 gap-2">
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => { setIsSignUp(o => !o); setError(''); setSuccess('') }}
              className="text-xs text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
            <Link href="/" className="text-xs text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
