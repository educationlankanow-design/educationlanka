'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase-client'

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Sinhala', 'Tamil', 'History', 'Geography',
  'Commerce', 'Economics', 'ICT', 'Art', 'Music'
]

const GRADES = [
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11 (O/L)', 'Grade 12 (A/L)', 'Grade 13 (A/L)', 'University', 'Other'
]

const TARGET_LEVELS = [
  'O/L (Ordinary Level)', 'A/L (Advanced Level)', 'Diploma',
  'Undergraduate Degree', 'Postgraduate', 'Professional Certification', 'Vocational Training'
]

export default function StudentRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    currentSchool: '', currentGrade: '', targetLevel: '',
    subjects: [] as string[], bio: ''
  })

  function update(field: string, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleSubject(s: string) {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter(x => x !== s)
        : [...f.subjects, s]
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const supabase = createBrowserSupabase()
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: window.location.origin + '/auth/callback' }
      })
      if (signUpErr) throw signUpErr

      // Save profile via admin API route so it works even before email confirmation
      if (authData.user) {
        const res = await fetch('/api/complete-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: authData.user.id,
            full_name: form.fullName,
            email: form.email,
            phone: form.phone || null,
            current_school: form.currentSchool || null,
            current_grade: form.currentGrade || null,
            target_level: form.targetLevel || null,
            subjects: form.subjects,
            bio: form.bio || null,
          })
        })
        if (!res.ok) console.error('Profile save failed:', await res.text())
      }

      setRegisteredEmail(form.email)
      setStep(4) // Check email step
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  const stepTitles = ['Your Details', 'Your School', 'Your Interests']
  const progress = Math.min((step / 3) * 100, 100)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">Institutions</Link></li>
            <li><Link href="/students/login" className="navbar-portal-link">Sign In</Link></li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Student Portal</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Create your account</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Join thousands of students finding their path</p>
          </div>

          {step < 4 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                {stepTitles.map((t, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: i + 1 === step ? 700 : 400, color: i + 1 <= step ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {i + 1}. {t}
                  </span>
                ))}
              </div>
              <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress + '%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Details</h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Full Name *</label>
                  <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} required placeholder="Your full name"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="you@example.com"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password *</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="At least 8 characters"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+94 77 123 4567"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                  onClick={() => {
                    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all required fields.'); return; }
                    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
                    setError(''); setStep(2);
                  }}>
                  Continue &rarr;
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>School &amp; Level</h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Current School / Institution</label>
                  <input type="text" value={form.currentSchool} onChange={e => update('currentSchool', e.target.value)} placeholder="e.g. Royal College Colombo"
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Current Grade / Year</label>
                  <select value={form.currentGrade} onChange={e => update('currentGrade', e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', background: 'var(--color-surface)' }}>
                    <option value="">Select grade...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Target Qualification</label>
                  <select value={form.targetLevel} onChange={e => update('targetLevel', e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', background: 'var(--color-surface)' }}>
                    <option value="">Select target...</option>
                    {TARGET_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setError(''); setStep(1); }}>&larr; Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.875rem' }} onClick={() => { setError(''); setStep(3); }}>Continue &rarr;</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Subjects &amp; Interests</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Select all that apply — institutions will match you with relevant programs.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {SUBJECTS.map(s => (
                    <button key={s} type="button"
                      onClick={() => toggleSubject(s)}
                      style={{
                        padding: '0.4rem 0.875rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                        borderColor: form.subjects.includes(s) ? 'var(--color-primary)' : 'var(--color-border)',
                        background: form.subjects.includes(s) ? 'var(--color-primary)' : 'transparent',
                        color: form.subjects.includes(s) ? '#fff' : 'var(--color-text-secondary)',
                        transition: 'all 0.15s'
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>About you (optional)</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                    placeholder="Tell institutions a bit about your goals and interests..."
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setError(''); setStep(2); }}>&larr; Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.875rem' }} disabled={loading} onClick={handleSubmit}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Check your email!</h2>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                  We&apos;ve sent a confirmation link to{' '}
                  <strong style={{ color: 'var(--color-text)' }}>{registeredEmail}</strong>.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Click the link in the email to verify your account. Your profile details have been saved and will be ready when you sign in.
                </p>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Didn&apos;t get the email? Check your spam folder, or{' '}
                  <Link href="/students/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>try signing in</Link>.
                </div>
              </div>
            )}

            {step < 4 && (
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Already have an account?{' '}
                <Link href="/students/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in &rarr;</Link>
              </p>
            )}
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
