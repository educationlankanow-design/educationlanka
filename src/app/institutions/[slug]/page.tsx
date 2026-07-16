import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  universities: 'University',
  institutes: 'Degree Institute',
  'international-schools': 'International School',
  'national-schools': 'National School',
  'private-schools': 'Private School',
  vocational: 'Vocational & Professional',
}

const CATEGORY_BADGES: Record<string, string> = {
  universities: 'badge-blue',
  institutes: 'badge-green',
  'international-schools': 'badge-purple',
  'national-schools': 'badge-orange',
  'private-schools': 'badge-pink',
  vocational: 'badge-teal',
}

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  foundation: 'Foundation',
  professional: 'Professional Certificates',
  secondary: 'Secondary / A Levels',
  primary: 'Primary',
}

const LEVEL_ORDER = ['undergraduate', 'postgraduate', 'foundation', 'professional', 'secondary', 'primary']

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Computing & IT':        { bg: '#eef2ff', color: '#6366f1' },
  'Technology & Engineering': { bg: '#fffbeb', color: '#f59e0b' },
  'Business & Management': { bg: '#e0f2fe', color: '#0ea5e9' },
  'Medicine & Health':     { bg: '#d1fae5', color: '#10b981' },
  'Law':                   { bg: '#f3e8ff', color: '#8b5cf6' },
  'Science':               { bg: '#f0fdfa', color: '#14b8a6' },
  'Arts & Design':         { bg: '#fce7f3', color: '#ec4899' },
  'International Curriculum': { bg: '#dbeafe', color: '#3b82f6' },
  'Social Sciences':       { bg: '#fff7ed', color: '#c2410c' },
  'Languages':             { bg: '#fef9c3', color: '#a16207' },
}

function getCatStyle(category: string | null) {
  if (!category) return { bg: '#f1f5f9', color: '#475569' }
  return CATEGORY_COLORS[category] || { bg: '#f1f5f9', color: '#475569' }
}

function levelAbbr(name: string): string {
  if (/^BEng/.test(name)) return 'BEng'
  if (/^BSc/.test(name)) return 'BSc'
  if (/^BA /.test(name)) return 'BA'
  if (/^BBA/.test(name)) return 'BBA'
  if (/^MSc/.test(name)) return 'MSc'
  if (/^MBA/.test(name)) return 'MBA'
  if (/^MA /.test(name)) return 'MA'
  if (/^MBBS/.test(name)) return 'MBBS'
  if (/^LLB/.test(name)) return 'LLB'
  if (/Professional Certificate|Certified/.test(name)) return 'CERT'
  if (/Diploma/.test(name)) return 'DIP'
  if (/Foundation/.test(name)) return 'FDN'
  if (/^IB /.test(name)) return 'IB'
  if (/Cambridge/.test(name)) return 'CAM'
  return name.substring(0, 3).toUpperCase()
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ level?: string }>
}

export default async function InstitutionPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { level: activeTab } = await searchParams
  const supabase = await createServerSupabase()

  const { data: inst } = await supabase
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!inst) notFound()

  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, name, level, duration, category, program_url, description, is_active')
    .eq('institution_id', inst.id)
    .eq('is_active', true)
    .order('name')

  const courses = allCourses || []

  // Group by level
  const grouped: Record<string, typeof courses> = {}
  courses.forEach(c => {
    const lvl = c.level || 'other'
    if (!grouped[lvl]) grouped[lvl] = []
    grouped[lvl].push(c)
  })

  const availableLevels = LEVEL_ORDER.filter(l => grouped[l]?.length)
  const activeLevel = activeTab && grouped[activeTab]
    ? activeTab
    : availableLevels[0] || ''

  const displayCourses = activeLevel ? (grouped[activeLevel] || []) : courses

  const catLabel = CATEGORY_LABELS[inst.institution_type] || inst.institution_type
  const catBadge = CATEGORY_BADGES[inst.institution_type] || 'badge-navy'

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            Education<span>Lanka</span>
          </Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">All Institutions</Link></li>
            <li><Link href="/institutions?category=universities">Universities</Link></li>
            <li><Link href="/institutions?category=institutes">Institutes</Link></li>
            <li><Link href="/institutions?category=international-schools">Int&apos;l Schools</Link></li>
            <li><Link href="/portal" className="navbar-portal-link">Institution Portal</Link></li>
          </ul>
          <details className="navbar-mobile">
            <summary className="navbar-hamburger-btn" aria-label="Menu">
              <span></span><span></span><span></span>
            </summary>
            <div className="navbar-mobile-drawer">
              <Link href="/">Home</Link>
              <Link href="/institutions">All Institutions</Link>
              <Link href="/institutions?category=universities">Universities</Link>
              <Link href="/institutions?category=institutes">Institutes</Link>
              <Link href="/institutions?category=international-schools">Int&apos;l Schools</Link>
              <Link href="/portal">Institution Portal</Link>
            </div>
          </details>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/institutions">Institutions</Link>
          {inst.institution_type && (
            <>
              <span className="breadcrumb-sep">/</span>
              <Link href={`/institutions?category=${inst.institution_type}`}>{catLabel}s</Link>
            </>
          )}
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{inst.name}</span>
        </div>
      </div>

      {/* INSTITUTION HEADER */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <div className="detail-row">
            {/* Logo placeholder */}
            <div className="detail-logo">
              {inst.name.split(' ').filter((w: string) => w.length > 2).slice(0, 2).map((w: string) => w[0]).join('')}
            </div>
            <div className="detail-info">
              <h1 className="detail-name">{inst.name}</h1>
              <div className="detail-badges">
                <span className={`badge ${catBadge}`}>{catLabel}</span>
                {courses.length > 0 && (
                  <span className="badge badge-amber">{courses.length} programme{courses.length !== 1 ? 's' : ''} listed</span>
                )}
                {inst.district && (
                  <span className="badge badge-navy">{inst.district}</span>
                )}
              </div>
              <div className="detail-meta">
                {(inst.city || inst.district) && (
                  <span className="detail-meta-item">
                    &#x1F4CD; {[inst.city, inst.district].filter(Boolean).join(', ')}
                  </span>
                )}
                {inst.phone && (
                  <span className="detail-meta-item">
                    &#x1F4DE; <a href={`tel:${inst.phone}`} style={{ color: 'var(--color-primary)' }}>{inst.phone}</a>
                  </span>
                )}
                {inst.email && (
                  <span className="detail-meta-item">
                    &#x2709; <a href={`mailto:${inst.email}`} style={{ color: 'var(--color-primary)' }}>{inst.email}</a>
                  </span>
                )}
                {inst.website && (
                  <span className="detail-meta-item">
                    <a
                      href={inst.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ marginLeft: 0 }}
                    >
                      Visit Website &rarr;
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="section section-gray" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: courses.length > 0 ? '1fr 280px' : '1fr', gap: '2rem', alignItems: 'start' }}>

            {/* PROGRAMMES */}
            <div>
              {courses.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Programmes Offered</h2>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {courses.length} listed
                    </span>
                  </div>

                  {/* Level tabs */}
                  {availableLevels.length > 1 && (
                    <div className="level-tabs">
                      {availableLevels.map(lvl => (
                        <Link
                          key={lvl}
                          href={`/institutions/${slug}?level=${lvl}`}
                          className={`level-tab${activeLevel === lvl ? ' active' : ''}`}
                        >
                          {LEVEL_LABELS[lvl] || lvl}
                          <span className="level-tab-count">{grouped[lvl]?.length}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="program-grid">
                    {displayCourses.map((c: any) => {
                      const style = getCatStyle(c.category)
                      return (
                        <a
                          key={c.id}
                          href={c.program_url || inst.website || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="program-card"
                        >
                          <div
                            className="program-icon"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {levelAbbr(c.name)}
                          </div>
                          <div className="program-info">
                            <div className="program-name">{c.name}</div>
                            <div className="program-meta">
                              {c.category && (
                                <span className="badge" style={{
                                  background: style.bg,
                                  color: style.color,
                                  fontSize: '0.65rem',
                                  padding: '2px 8px',
                                }}>
                                  {c.category}
                                </span>
                              )}
                              {c.duration && <span className="program-dur">{c.duration}</span>}
                            </div>
                            {c.description && (
                              <p style={{
                                fontSize: '0.8125rem',
                                color: 'var(--color-text-secondary)',
                                marginTop: '0.375rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {c.description}
                              </p>
                            )}
                          </div>
                          <span className="program-arrow">&rarr;</span>
                        </a>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px dashed var(--color-border)',
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#x1F4DA;</div>
                  <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>No programmes listed yet</h3>
                  <p style={{ fontSize: '0.9rem' }}>Programme information for this institution is coming soon.</p>
                  {inst.website && (
                    <a
                      href={inst.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ marginTop: '1.25rem', display: 'inline-flex' }}
                    >
                      Visit Official Website &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Contact card */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--color-border)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>
                  Contact & Info
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {inst.address && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ flexShrink: 0 }}>&#x1F4CD;</span>
                      <span>{inst.address}</span>
                    </div>
                  )}
                  {inst.phone && (
                    <div style={{ fontSize: '0.875rem' }}>
                      <a href={`tel:${inst.phone}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        &#x1F4DE; {inst.phone}
                      </a>
                    </div>
                  )}
                  {inst.email && (
                    <div style={{ fontSize: '0.875rem' }}>
                      <a href={`mailto:${inst.email}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        &#x2709; {inst.email}
                      </a>
                    </div>
                  )}
                  {inst.website && (
                    <a
                      href={inst.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ marginTop: '0.5rem', justifyContent: 'center' }}
                    >
                      Official Website &rarr;
                    </a>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              {courses.length > 0 && (
                <div style={{
                  background: 'var(--color-primary)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem',
                  color: 'white',
                }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Programme Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {availableLevels.map(lvl => (
                      <div key={lvl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{LEVEL_LABELS[lvl] || lvl}</span>
                        <span style={{ fontWeight: 700, color: 'white' }}>{grouped[lvl]?.length}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Total</span>
                      <span style={{ color: 'var(--color-accent)' }}>{courses.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Back link */}
              <Link
                href={inst.institution_type ? `/institutions?category=${inst.institution_type}` : '/institutions'}
                className="btn btn-outline"
                style={{ justifyContent: 'center' }}
              >
                &larr; Back to {CATEGORY_LABELS[inst.institution_type] || 'Institutions'}s
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <p className="footer-tag">Sri Lanka&apos;s comprehensive education guide.</p>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka. All rights reserved.</span>
            <nav className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/institutions">Institutions</Link>
              <Link href="/portal">Institution Portal</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
