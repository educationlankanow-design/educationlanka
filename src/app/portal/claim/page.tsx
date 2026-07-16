'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ClaimPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/portal'); return }
      setUser(user)
      setLoading(false)
    })
  }, [router])

  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return }
    const supabase = createClient()
    supabase.from('institutions').select('id, name, slug, city, district, institution_type')
      .ilike('name', '%' + search + '%').limit(8)
      .then(({ data }) => setResults(data || []))
  }, [search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/portal/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institution_id: selected?.id || null,
        institution_name: selected?.name || search,
        message,
      }),
    })
    if (!res.ok) { setError('Submission failed. Please try again.'); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
    </div>
  )

  if (submitted) return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
        </div>
      </nav>
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Claim submitted!</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Your request to claim <strong style={{ color: 'var(--color-text)' }}>{selected?.name || search}</strong> has been received.
            Our team will review and grant access &mdash; usually within 1&ndash;2 business days.
          </p>
          <div style={{ padding: '1.25rem', background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-xl)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            You&apos;ll be notified at <strong>{user?.email}</strong> once approved.
          </div>
          <Link href="/" className="btn btn-outline">Back to EducationLanka</Link>
        </div>
      </div>
    </>
  )

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

      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Institution Portal</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Claim your listing</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Find your institution in the directory and submit a claim. Our admin team will verify and approve your access.
            </p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Search for your institution *
                </label>
                {selected ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-muted)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{selected.name}</div>
                      {(selected.city || selected.district) && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {[selected.city, selected.district].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => { setSelected(null); setSearch('') }}
                      style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Change ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Type your institution name..."
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                    {results.length > 0 && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden' }}>
                        {results.map(r => (
                          <button key={r.id} type="button" onClick={() => { setSelected(r); setResults([]) }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{r.name}</span>
                            {(r.city || r.district) && (
                              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{[r.city, r.district].filter(Boolean).join(', ')}</span>
                            )}
                          </button>
                        ))}
                        <div style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          Not listed? Type your full name above and continue.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Your role <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>(optional)</span>
                </label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  placeholder="e.g. I am the admissions officer and would like to manage our listing..."
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#92400e' }}>
                <strong>Pending approval:</strong> Claims are reviewed by our admin team before access is granted.
              </div>

              <button type="submit" disabled={submitting || (!selected && search.trim().length < 2)}
                className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                {submitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <Link href="/portal" style={{ color: 'var(--color-text-secondary)' }}>&larr; Back to portal login</Link>
          </p>
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
