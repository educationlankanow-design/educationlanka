'use client'
import { useState } from 'react'
import Link from 'next/link'

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Moneragala','Ratnapura','Kegalle']

export default function SubmitPage() {
  const [form, setForm] = useState({ submitterName: '', submitterEmail: '', institutionName: '', institutionType: '', city: '', district: '', website: '', phone: '', email: '', description: '', programs: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.submitterName || !form.submitterEmail || !form.institutionName) {
      setError('Please fill in all required fields.'); return
    }
    setSubmitting(true); setError('')
    const res = await fetch('/api/submit-institution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError('Submission failed. Please try again.'); setSubmitting(false); return }
    setSubmitted(true); setSubmitting(false)
  }

  if (submitted) return (
    <>
      <nav className="navbar"><div className="navbar-inner"><Link href="/" className="navbar-logo">Education<span>Lanka</span></Link></div></nav>
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Submission received!</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Thank you for submitting <strong style={{ color: 'var(--color-text)' }}>{form.institutionName}</strong>. Our team will review it and publish the listing — usually within 2&ndash;3 business days.
          </p>
          <Link href="/institutions" className="btn btn-outline">Browse Institutions</Link>
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
            <li><Link href="/students/login" className="navbar-portal-link">Student Portal</Link></li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Community</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Submit an Institution</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Know a school, university or institute that&apos;s missing from our directory? Submit it here &mdash; our team will review and publish it.
            </p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Your Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[['submitterName','Your Name','text',true],['submitterEmail','Your Email','email',true]].map(([f,p,t,r]) => (
                    <div key={f as string}><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>{p as string} {r && '*'}</label>
                    <input type={t as string} value={(form as any)[f as string]} onChange={e => update(f as string, e.target.value)} required={!!r} placeholder={p as string}
                      style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} /></div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Institution Details</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Institution Name *</label>
                  <input type="text" value={form.institutionName} onChange={e => update('institutionName', e.target.value)} required placeholder="e.g. Ananda College"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Type</label>
                  <select value={form.institutionType} onChange={e => update('institutionType', e.target.value)} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', background: 'var(--color-surface)' }}>
                    <option value="">Select type...</option>
                    <option value="universities">University</option>
                    <option value="institutes">Degree Institute</option>
                    <option value="international-schools">International School</option>
                    <option value="national-schools">National School</option>
                    <option value="private-schools">Private School</option>
                    <option value="vocational">Vocational / Professional</option>
                  </select></div>
                  <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>District</label>
                  <select value={form.district} onChange={e => update('district', e.target.value)} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', background: 'var(--color-surface)' }}>
                    <option value="">Select district...</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[['city','City / Town'],['website','Website URL'],['phone','Phone Number'],['email','Institution Email']].map(([f,p]) => (
                    <div key={f}><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>{p}</label>
                    <input type="text" value={(form as any)[f]} onChange={e => update(f, e.target.value)} placeholder={p}
                      style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} /></div>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
                    placeholder="Brief description of the institution..."
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Programmes Offered</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>List one programme per line (e.g. BSc Computer Science — 3 years)</p>
                <textarea value={form.programs} onChange={e => update('programs', e.target.value)} rows={5}
                  placeholder={'BSc Computer Science — 3 years\nMBA — 2 years\nCertificate in Digital Marketing — 6 months'}
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'monospace' }} />
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#15803d' }}>
                Your submission will be reviewed by our team before being published. We typically process submissions within 2&ndash;3 business days.
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                {submitting ? 'Submitting...' : 'Submit Institution'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer"><div className="footer-inner"><div className="footer-brand">Education<span>Lanka</span></div>
        <div className="footer-bottom"><span>&copy; {new Date().getFullYear()} EducationLanka.</span>
        <nav className="footer-links"><Link href="/">Home</Link><Link href="/institutions">Institutions</Link></nav></div></div></footer>
    </>
  )
}
