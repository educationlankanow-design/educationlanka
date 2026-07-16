import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/students/login')

  const { data: profile } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single()

  async function signOut() {
    'use server'
    const sb = await createServerSupabase()
    await sb.auth.signOut()
    redirect('/students/login')
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Student'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">Institutions</Link></li>
            <li>
              <form action={signOut}>
                <button type="submit" className="navbar-portal-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Sign Out
                </button>
              </form>
            </li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Student Profile</div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, margin: '0.25rem 0 0.125rem' }}>{displayName}</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.85 }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>

            {/* Academic info */}
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Academic Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current School</div>
                  <div style={{ fontSize: '0.9375rem', marginTop: '0.25rem' }}>{profile?.current_school || <span style={{ color: 'var(--color-text-secondary)' }}>Not set</span>}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade / Year</div>
                  <div style={{ fontSize: '0.9375rem', marginTop: '0.25rem' }}>{profile?.current_grade || <span style={{ color: 'var(--color-text-secondary)' }}>Not set</span>}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Qualification</div>
                  <div style={{ fontSize: '0.9375rem', marginTop: '0.25rem' }}>{profile?.target_level || <span style={{ color: 'var(--color-text-secondary)' }}>Not set</span>}</div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Subjects & Interests</h2>
              {profile?.subjects?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.subjects.map((s: string) => (
                    <span key={s} style={{
                      padding: '0.3rem 0.75rem', borderRadius: '999px',
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary)',
                      fontSize: '0.8125rem', fontWeight: 600,
                    }}>{s}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No subjects selected yet.</p>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', gridColumn: '1 / -1' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About</h2>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>{profile.bio}</p>
              </div>
            )}

          </div>

          {/* Matching note */}
          <div style={{
            marginTop: '1.5rem',
            background: 'var(--color-primary-muted)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Matching active</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Institutions that match your subjects and interests may send you program details through EducationLanka. Keep your profile up to date for the best matches.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/institutions" className="btn btn-primary">Browse Institutions &rarr;</Link>
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
