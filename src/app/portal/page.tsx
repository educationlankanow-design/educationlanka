'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function PortalLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/portal/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback?next=/portal/claim',
        data: { org_name: orgName, role: 'institution' },
      },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setRegisteredEmail(email)
    setLoading(false)
  }

  // Check email step after registration
  if (registeredEmail) {
    return (
      <>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
            <ul className="navbar-links">
              <li><Link href="/institutions">Institutions</Link></li>
            </ul>
          </div>
        </nav>
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Check your email</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--color-text)' }}>{registeredEmail}</strong>.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Once confirmed, you&apos;ll be taken to a page where you can claim your institution listing.
              Your access will then be reviewed and approved by our team.
            </p>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Didn&apos;t receive the email? Check your spam folder, or{' '}
              <button onClick={() => setRegisteredEmail('')} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                try again
              </button>.
            </div>
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

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">Institutions</Link></li>
            <li><Link href="/students/login" className="navbar-portal-link">Student Portal</Link></li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Institution Portal</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>
              {mode === 'login' ? 'Welcome back' : 'Register your institution'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {mode === 'login' ? 'Sign in to manage your institution listing' : 'Create an account to claim and manage your listing'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '4px', marginBottom: '1.5rem' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', fontWeight: 600,
                background: mode === m ? 'var(--color-surface)' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: 'none', cursor: 'pointer', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@institution.lk"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  New here?{' '}
                  <button onClick={() => { setMode('register'); setError('') }} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Register your institution &rarr;
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Institution / Organisation Name</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required placeholder="e.g. Colombo International School"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Work Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@institution.lk"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 8 characters"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Re-enter your password"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                  After confirming your email, you&apos;ll be able to claim your institution listing.
                  Access is granted upon approval by our team.
                </p>
              </form>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <Link href="/" style={{ color: 'var(--color-text-secondary)' }}>&larr; Back to EducationLanka</Link>
          </p>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka.</span>
            <nav className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/institutions">Institutions</Link>
              <Link href="/students/login">Student Portal</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
