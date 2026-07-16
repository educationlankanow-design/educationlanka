import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/students/login')

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) redirect('/')

  const admin = createAdminSupabase()

  // Fetch all institutions
  const { data: institutions } = await admin
    .from('institutions')
    .select('id, name, slug, institution_type, is_featured')
    .order('name')

  // Fetch recent students
  const { data: students } = await admin
    .from('students')
    .select('id, full_name, email, current_school, target_level, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  async function toggleFeatured(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const current = formData.get('current') === 'true'
    const adm = createAdminSupabase()
    await adm.from('institutions').update({ is_featured: !current } as any).eq('id', id)
    revalidatePath('/admin')
  }

  async function signOut() {
    'use server'
    const sb = await createServerSupabase()
    await sb.auth.signOut()
    redirect('/students/login')
  }

  const featuredCount = institutions?.filter(i => (i as any).is_featured).length || 0
  const totalInstitutions = institutions?.length || 0
  const totalStudents = students?.length || 0

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
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <span className="eyebrow">Super Admin</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Manage featured institutions and view student registrations.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Institutions', value: totalInstitutions, color: 'var(--color-primary)' },
              { label: 'Featured', value: featuredCount, color: '#10b981' },
              { label: 'Recent Students', value: totalStudents, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Institutions table */}
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Institutions â Featured Toggle</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)' }}>
                    {['Name', 'Type', 'Featured'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {institutions?.map((inst: any) => (
                    <tr key={inst.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{inst.name}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{inst.institution_type || 'â'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <form action={toggleFeatured} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={inst.id} />
                          <input type="hidden" name="current" value={String(inst.is_featured)} />
                          <button type="submit" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            border: '1.5px solid',
                            borderColor: inst.is_featured ? '#10b981' : 'var(--color-border)',
                            background: inst.is_featured ? '#ecfdf5' : 'transparent',
                            color: inst.is_featured ? '#10b981' : 'var(--color-text-secondary)',
                            fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
                          }}>
                            {inst.is_featured ? 'â Featured' : 'â Set Featured'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Students table */}
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Student Registrations</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)' }}>
                    {['Name', 'Email', 'School', 'Target', 'Joined'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students?.length ? students.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.full_name}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.email}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.current_school || 'â'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.target_level || 'â'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No students registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
