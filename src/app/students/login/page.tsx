'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-client'

export default function StudentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createBrowserSupabase()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/students/profile')
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">Institutions</Link></li>
            <li><Link href="/students/register" className="navbar-portal-link">Register</Link></li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Student Portal</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Welcome back</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Sign in to your student account</p>
          </div>

          <form onSubmit={handleSubmit} style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              No account?{' '}
              <Link href="/students/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one &rarr;</Link>
            </p>
          </form>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka.</span>
            <nav className="footer-links"><Link href="/">Home</Link><Link href="/institutions">Institutions</Link></nav>
          </div>
        </div>
      </footer>
    </>
  )
}
