'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Amber ambient gradient behind logo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '300px',
          background: 'radial-gradient(ellipse at top, rgba(232,184,75,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        {/* Logo */}
        <div className="text-center mb-10" style={{ position: 'relative' }}>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Paisa<span style={{ color: '#E8B84B' }}>Track</span>
          </h1>
          <p className="text-[#555] text-sm mt-2">Your personal finance manager</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-7" style={{ borderTop: '2px solid #E8B84B' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Welcome back</h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 text-rose-400 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium tracking-widest uppercase text-[#3A3A3A]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full h-11 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 text-sm text-white placeholder-[#333] outline-none focus:border-[#E8B84B] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium tracking-widest uppercase text-[#3A3A3A]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                className="w-full h-11 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 text-sm text-white placeholder-[#333] outline-none focus:border-[#E8B84B] transition-colors"
              />
            </div>

            {/* Sign In button */}
            <button
              onClick={handleEmailLogin}
              disabled={loading || !email || !password}
              className="w-full h-12 rounded-xl text-sm font-semibold text-[#0C0C0C] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8B84B' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1E1E1E]" />
              <span className="text-xs text-[#3A3A3A]">or</span>
              <div className="flex-1 h-px bg-[#1E1E1E]" />
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2.5 hover:border-[#333] hover:bg-[#1E1E1E] transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          <p className="text-center text-sm text-[#555] mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-medium" style={{ color: '#E8B84B' }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
