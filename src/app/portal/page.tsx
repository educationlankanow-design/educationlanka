'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PortalLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'check-email'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setStatus('error') }
      else router.push('/portal/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setStatus('error') }
      else setStatus('check-email')
    }
  }

  if (status === 'check-email') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a3c6b]">Institution Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your listing and receive student inquiries</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'login' ? 'bg-white text-[#1a3c6b] shadow-sm' : 'text-gray-500'}`}>
            Login
          </button>
          <button onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'signup' ? 'bg-white text-[#1a3c6b] shadow-sm' : 'text-gray-500'}`}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6b]" />
          <input required type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6b]" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={status === 'loading'}
            className="w-full bg-[#1a3c6b] hover:bg-[#152f56] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {status === 'loading' ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          By registering, your account will be linked to your institution listing by our team.
        </p>
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-[#1a3c6b]">← Back to directory</Link>
        </div>
      </div>
    </div>
  )
}
