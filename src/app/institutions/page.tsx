import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const CATEGORY_MAP: Record<string, { label: string; badge: string }> = {
  universities:          { label: 'University',           badge: 'badge-blue' },
  institutes:            { label: 'Degree Institute',     badge: 'badge-green' },
  'international-schools':{ label: 'International School', badge: 'badge-purple' },
  'national-schools':    { label: 'National School',      badge: 'badge-orange' },
  'private-schools':     { label: 'Private School',       badge: 'badge-pink' },
  vocational:            { label: 'Vocational',           badge: 'badge-teal' },
}

const TYPES = [
  { slug: '', label: 'All' },
  { slug: 'universities', label: 'Universities' },
  { slug: 'institutes', label: 'Degree Institutes' },
  { slug: 'international-schools', label: 'Int\'l Schools' },
  { slug: 'national-schools', label: 'National Schools' },
  { slug: 'private-schools', label: 'Private Schools' },
  { slug: 'vocational', label: 'Vocational' },
]

interface Props {
  searchParams: { q?: string; category?: string }
}

export default async function InstitutionsPage({ searchParams }: Props) {
  const supabase = createServerSupabase()
  const q = searchParams.q?.trim() || ''
  const cat = searchParams.category || ''

  let query = supabase
    .from('institutions')
    .select('id, name, slug, category, city, district, phone, website_url')
    .order('name')
    .limit(200)

  if (cat) query = query.eq('category', cat)
  if (q)   query = query.ilike('name', `%${q}%`)

  const { data: institutions = [] } = await query
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('institution_id', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get course counts per institution
  const { data: courseCounts } = await supabase
    .from('courses')
    .select('institution_id')
    .eq('is_active', true)

  const courseCountMap: Record<string, number> = {}
  ;(courseCounts || []).forEach((r: any) => {
    courseCountMap[r.institution_id] = (courseCountMap[r.institution_id] || 0) + 1
  })

  const catMeta = cat ? CATEGORY_MAP[cat] : null

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
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '2rem 1.5rem' }}>
        <div className="container">
          <div className="breadcrumb" style={{ padding: 0, marginBottom: '1rem' }}>
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Institutions</span>
            {catMeta && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span>{catMeta.label}s</span>
              </>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            {catMeta ? `${catMeta.label}s in Sri Lanka` : 'All Institutions in Sri Lanka'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            {(institutions?.length ?? 0).toLocaleString()} institution{institutions?.length !== 1 ? 's' : ''} found
            {q ? ` for "${q}"` : ''}
          </p>
        </div>
      </div>

      <div className="section section-gray" style={{ paddingTop: '2rem' }}>
        <div className="container">
          {/* FILTER BAR */}
          <div className="filter-bar">
            <span className="filter-label">Type:</span>
            <div className="filter-chips">
              {TYPES.map(t => (
                <Link
                  key={t.slug}
                  href={t.slug ? `/institutions?category=${t.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}` : `/institutions${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                  className={`filter-chip${cat === t.slug ? ' active' : ''}`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <form action="/institutions" method="GET" className="search-wrap">
              {cat && <input type="hidden" name="category" value={cat} />}
              <span className="search-icon">&#x1F50D;</span>
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search institutions..."
              />
            </form>
          </div>

          {/* GRID */}
          {institutions && institutions.length > 0 ? (
            <div className="inst-grid">
              {institutions.map((inst: any) => {
                const meta = CATEGORY_MAP[inst.category] || { label: inst.category, badge: 'badge-navy' }
                const progCount = courseCountMap[inst.id] || 0
                return (
                  <Link key={inst.id} href={`/institutions/${inst.slug}`} className="inst-card">
                    <div className="inst-card-bar" />
                    <div className="inst-card-body">
                      <div className="inst-card-badges">
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                        {progCount > 0 && (
                          <span className="badge badge-amber">{progCount} programme{progCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <div className="inst-card-name">{inst.name}</div>
                      {(inst.city || inst.district) && (
                        <div className="inst-card-loc">
                          {[inst.city, inst.district].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {inst.phone && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {inst.phone}
                        </div>
                      )}
                      <div className="inst-card-footer">
                        <span className="inst-card-prog-count">
                          {progCount > 0 ? `${progCount} programme${progCount !== 1 ? 's' : ''} listed` : 'View details'}
                        </span>
                        <span className="inst-card-arrow">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#x1F50D;</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>No institutions found</h3>
              <p>Try adjusting your search or filter</p>
              <Link href="/institutions" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
                Clear filters
              </Link>
            </div>
          )}
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
