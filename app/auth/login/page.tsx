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
        setSuccess('Account created. Promote yourself to admin in Supabase, then sign in.')
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
    <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
      <div className="max-w-md w-full mx-5">
        <div className="text-center mb-10">
          <div className="divider-glow mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-2">
            Staff <span className="text-accent text-glow">{isSignUp ? 'Sign Up' : 'Login'}</span>
          </h1>
          <p className="text-mid text-sm">
            {isSignUp ? 'Create your staff account' : 'Sign in to access the dashboard'}
          </p>
        </div>

        <div className="card-glow p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/30 text-accent text-sm rounded-lg">
              {success}
              <div className="mt-2 text-xs text-mid">
                Run this in Supabase SQL Editor:
                <code className="bg-dark p-1.5 rounded block mt-1 text-accent font-mono">
                  UPDATE users SET role = 'admin' WHERE email = '{email}';
                </code>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="input-field" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@dealzonwheelz.co.za" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="••••••••" />
              {isSignUp && <p className="text-xs text-mid mt-1">Minimum 6 characters</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50 gap-2">
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button onClick={() => { setIsSignUp(o => !o); setError(''); setSuccess('') }}
              className="text-sm text-mid hover:text-accent transition-colors">
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
            <Link href="/" className="text-sm text-mid hover:text-accent transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
