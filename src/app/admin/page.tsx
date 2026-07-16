import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'educationlankanow@gmail.com'

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== SUPER_ADMIN_EMAIL) redirect('/')

  const admin = createAdminSupabase()

  const [
    { data: institutions },
    { data: students },
    { data: claims },
    { data: submissions },
    { data: ratings },
    { data: contributions },
    { count: totalStudents },
    { count: totalInstitutions },
  ] = await Promise.all([
    admin.from('institutions').select('id, name, slug, institution_type, is_featured').order('name'),
    admin.from('students').select('id, full_name, email, current_school, target_level, created_at').order('created_at', { ascending: false }).limit(50),
    admin.from('institution_claims').select('*').order('created_at', { ascending: false }).limit(50).catch(() => ({ data: [] })),
    admin.from('institution_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50).catch(() => ({ data: [] })),
    admin.from('ratings').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50).catch(() => ({ data: [] })),
    admin.from('contributions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50).catch(() => ({ data: [] })),
    admin.from('students').select('*', { count: 'exact', head: true }),
    admin.from('institutions').select('*', { count: 'exact', head: true }),
  ])

  async function toggleFeatured(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const current = formData.get('current') === 'true'
    const adm = createAdminSupabase()
    await adm.from('institutions').update({ is_featured: !current } as any).eq('id', id)
    revalidatePath('/admin')
  }

  async function approveAction(formData: FormData) {
    'use server'
    const table = formData.get('table') as string
    const id = formData.get('id') as string
    const action = formData.get('action') as string // 'approved' | 'rejected'
    const adm = createAdminSupabase()
    await (adm as any).from(table).update({ status: action, reviewed_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function signOut() {
    'use server'
    const sb = await createServerSupabase()
    await sb.auth.signOut()
    redirect('/')
  }

  const featuredCount = institutions?.filter((i: any) => i.is_featured).length || 0
  const pendingClaims = (claims || []).filter((c: any) => c.status === 'pending').length
  const pendingSubmissions = (submissions || []).length
  const pendingRatings = (ratings || []).length
  const pendingContribs = (contributions || []).length

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">Institutions</Link></li>
            <li>
              <form action={signOut}>
                <button type="submit" className="navbar-portal-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Sign Out</button>
              </form>
            </li>
          </ul>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="eyebrow">Super Admin</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Logged in as {user.email}</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Institutions', value: totalInstitutions || 0, color: 'var(--color-primary)' },
              { label: 'Featured', value: featuredCount, color: '#10b981' },
              { label: 'Registered Students', value: totalStudents || 0, color: '#f59e0b' },
              { label: 'Pending Claims', value: pendingClaims, color: pendingClaims > 0 ? '#ef4444' : '#94a3b8' },
              { label: 'Pending Submissions', value: pendingSubmissions, color: pendingSubmissions > 0 ? '#f97316' : '#94a3b8' },
              { label: 'Pending Reviews', value: pendingRatings + pendingContribs, color: (pendingRatings + pendingContribs) > 0 ? '#8b5cf6' : '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pending Institution Claims */}
          {pendingClaims > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid #fecaca', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#dc2626' }}>
                Institution Claims — {pendingClaims} pending
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(claims || []).filter((c: any) => c.status === 'pending').map((c: any) => (
                  <div key={c.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.institution_name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{c.org_email} &bull; {new Date(c.created_at).toLocaleDateString('en-GB')}</div>
                      {c.message && <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', fontStyle: 'italic' }}>{c.message}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['approved', 'rejected'] as const).map(action => (
                        <form key={action} action={approveAction}>
                          <input type="hidden" name="table" value="institution_claims" />
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="action" value={action} />
                          <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: action === 'approved' ? '#10b981' : '#ef4444', background: action === 'approved' ? '#ecfdf5' : '#fef2f2', color: action === 'approved' ? '#10b981' : '#ef4444' }}>
                            {action === 'approved' ? 'Approve' : 'Reject'}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Institution Submissions */}
          {pendingSubmissions > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid #fed7aa', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#ea580c' }}>
                New Institution Submissions — {pendingSubmissions} pending
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(submissions || []).map((s: any) => (
                  <div key={s.id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.institution_name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{s.institution_type} &bull; {s.city}, {s.district} &bull; {s.submitter_email}</div>
                      {s.description && <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.description}</div>}
                      {s.website && <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>{s.website}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['approved', 'rejected'] as const).map(action => (
                        <form key={action} action={approveAction}>
                          <input type="hidden" name="table" value="institution_submissions" />
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="action" value={action} />
                          <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: action === 'approved' ? '#10b981' : '#ef4444', background: action === 'approved' ? '#ecfdf5' : '#fef2f2', color: action === 'approved' ? '#10b981' : '#ef4444' }}>
                            {action === 'approved' ? 'Approve & Publish' : 'Reject'}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Ratings */}
          {pendingRatings > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid #ddd6fe', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#7c3aed' }}>
                Ratings Pending Approval — {pendingRatings}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(ratings || []).map((r: any) => (
                  <div key={r.id} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.reviewer_name} &bull; {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{r.reviewer_email}</div>
                      {r.review && <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{r.review}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['approved', 'rejected'] as const).map(action => (
                        <form key={action} action={approveAction}>
                          <input type="hidden" name="table" value="ratings" />
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="action" value={action} />
                          <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: action === 'approved' ? '#10b981' : '#ef4444', background: action === 'approved' ? '#ecfdf5' : '#fef2f2', color: action === 'approved' ? '#10b981' : '#ef4444' }}>
                            {action === 'approved' ? 'Publish' : 'Reject'}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Contributions */}
          {pendingContribs > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1.5px solid #bfdbfe', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1d4ed8' }}>
                Content Contributions — {pendingContribs} pending
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(contributions || []).map((c: any) => (
                  <div key={c.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.contribution_type} — {c.contributor_name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{c.contributor_email}</div>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', background: 'white', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{c.content}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['approved', 'rejected'] as const).map(action => (
                        <form key={action} action={approveAction}>
                          <input type="hidden" name="table" value="contributions" />
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="action" value={action} />
                          <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: action === 'approved' ? '#10b981' : '#ef4444', background: action === 'approved' ? '#ecfdf5' : '#fef2f2', color: action === 'approved' ? '#10b981' : '#ef4444' }}>
                            {action === 'approved' ? 'Publish' : 'Reject'}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institutions — Featured Toggle */}
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Institutions — Featured Toggle</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead><tr style={{ borderBottom: '1.5px solid var(--color-border)' }}>
                  {['Name', 'Type', 'Featured', 'View'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}</tr></thead>
                <tbody>
                  {institutions?.map((inst: any) => (
                    <tr key={inst.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{inst.name}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>{inst.institution_type || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <form action={toggleFeatured} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={inst.id} />
                          <input type="hidden" name="current" value={String(inst.is_featured)} />
                          <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1.5px solid', borderColor: inst.is_featured ? '#10b981' : 'var(--color-border)', background: inst.is_featured ? '#ecfdf5' : 'transparent', color: inst.is_featured ? '#10b981' : 'var(--color-text-secondary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
                            {inst.is_featured ? '★ Featured' : '☆ Set Featured'}
                          </button>
                        </form>
                      </td>
                      <td style={{ padding: '0.75rem' }}><Link href={'/institutions/' + inst.slug} style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Students */}
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Registered Students ({totalStudents || 0} total)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead><tr style={{ borderBottom: '1.5px solid var(--color-border)' }}>
                  {['Name', 'Email', 'School', 'Target Level', 'Joined'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}</tr></thead>
                <tbody>
                  {students?.length ? students.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.full_name || '—'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.email}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.current_school || '—'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.target_level || '—'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No students yet.</td></tr>
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
