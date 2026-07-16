import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const SUBJECTS = [
  { name: 'Computing & IT',        abbr: 'IT',  color: '#6366f1', bg: '#eef2ff', query: 'Computing' },
  { name: 'Business & Management', abbr: 'BM',  color: '#0ea5e9', bg: '#e0f2fe', query: 'Business' },
  { name: 'Engineering',           abbr: 'ENG', color: '#f59e0b', bg: '#fffbeb', query: 'Engineering' },
  { name: 'Medicine & Health',     abbr: 'MED', color: '#10b981', bg: '#d1fae5', query: 'Medicine' },
  { name: 'Law',                   abbr: 'LAW', color: '#8b5cf6', bg: '#f3e8ff', query: 'Law' },
  { name: 'Sciences',              abbr: 'SCI', color: '#14b8a6', bg: '#f0fdfa', query: 'Science' },
  { name: 'Arts & Design',         abbr: 'ART', color: '#ec4899', bg: '#fce7f3', query: 'Arts' },
  { name: 'Int\'l Curricula',      abbr: 'IB',  color: '#3b82f6', bg: '#dbeafe', query: 'International' },
]

const TYPES = [
  { slug: 'universities',          name: 'Universities',             abbr: 'UNI', desc: 'State & private universities' },
  { slug: 'institutes',            name: 'Degree Institutes',        abbr: 'DEG', desc: 'Affiliated UK/US degree programmes' },
  { slug: 'international-schools', name: 'International Schools',    abbr: 'INT', desc: 'IB, Cambridge & American curricula' },
  { slug: 'national-schools',      name: 'National Schools',         abbr: 'NAT', desc: 'Government national schools' },
  { slug: 'private-schools',       name: 'Private Schools',          abbr: 'PVT', desc: 'Independent private schools' },
  { slug: 'vocational',            name: 'Vocational & Professional', abbr: 'VOC', desc: 'TVEC, NVQ & professional certs' },
]

function levelAbbr(name: string): string {
  if (/^BEng|^BSc|^BA |^BBA|^BDes/.test(name)) return 'BSc'
  if (/^MSc|^MBA|^MA /.test(name)) return 'MSc'
  if (/Professional|Certificate/.test(name)) return 'CERT'
  if (/Foundation|Diploma/.test(name)) return 'DIP'
  if (/MBBS/.test(name)) return 'MBBS'
  if (/LLB/.test(name)) return 'LLB'
  if (/^IB /.test(name)) return 'IB'
  return name.substring(0, 3).toUpperCase()
}

export default async function HomePage() {
  const supabase = createServerSupabase()

  const [
    { count: totalInstitutions },
    { count: totalCourses },
    iitResult,
  ] = await Promise.all([
    supabase.from('institutions').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('institutions')
      .select('id, name, city, district, website_url, slug')
      .eq('slug', 'informatics-institute-of-technology-iit')
      .single(),
  ])

  const iit = iitResult.data
  let iitPrograms: any[] = []
  if (iit?.id) {
    const { data } = await supabase
      .from('courses')
      .select('id, name, level, duration, program_url')
      .eq('institution_id', iit.id)
      .eq('is_active', true)
      .eq('level', 'undergraduate')
      .order('name')
      .limit(5)
    iitPrograms = data || []
  }

  return (
    <>
      {/* ===== NAVBAR ===== */}
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
            <li>
              <Link href="/portal" className="navbar-portal-link">
                Institution Portal
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            Sri Lanka&apos;s Comprehensive Education Guide
          </div>
          <h1 className="hero-title">
            Find your perfect <em>course</em> in Sri Lanka
          </h1>
          <p className="hero-subtitle">
            Explore {(totalInstitutions ?? 0).toLocaleString()}+ institutions &mdash; universities, degree institutes,
            international schools and more.
          </p>

          <form action="/institutions" method="GET" className="hero-search">
            <input
              name="q"
              type="search"
              placeholder="Search institutions, programmes, or subjects..."
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>

          <div className="hero-stats">
            {[
              { val: `${(totalInstitutions ?? 0).toLocaleString()}+`, lbl: 'Institutions' },
              { val: `${(totalCourses ?? 0).toLocaleString()}+`,      lbl: 'Programmes Listed' },
              { val: '6',                                              lbl: 'Institution Types' },
              { val: '25+',                                            lbl: 'Districts Covered' },
            ].map(s => (
              <div key={s.lbl}>
                <div className="hero-stat-val">{s.val}</div>
                <div className="hero-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUBJECT AREAS ===== */}
      <section className="section section-white">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Browse by Subject</span>
            <h2 className="section-title">What do you want to study?</h2>
            <p className="section-sub">Browse programmes across all subject areas from Sri Lanka&apos;s top institutions</p>
          </div>
          <div className="subjects-grid">
            {SUBJECTS.map(s => (
              <Link
                key={s.name}
                href={`/institutions?q=${encodeURIComponent(s.query)}`}
                className="subject-card"
              >
                <div className="subject-icon" style={{ background: s.bg, color: s.color }}>
                  {s.abbr}
                </div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-cta">Explore programmes &rarr;</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IIT FEATURED SPOTLIGHT ===== */}
      {iit && (
        <section className="section section-gray">
          <div className="container">
            <div className="featured-banner">
              <div className="featured-grid">
                {/* Left: IIT info */}
                <div>
                  <div className="featured-tag">Featured Partner Institution</div>
                  <h2 className="featured-title">
                    Informatics Institute of Technology
                  </h2>
                  <p className="featured-desc">
                    35+ years of excellence in Sri Lanka. IIT partners with the{' '}
                    <strong style={{ color: 'white' }}>University of Westminster</strong> and{' '}
                    <strong style={{ color: 'white' }}>Robert Gordon University</strong> (UK) to deliver
                    world-class degrees right here in Colombo &mdash; so you get a UK degree without leaving home.
                  </p>
                  <div className="featured-tags">
                    {['5,000+ Alumni', 'UK Accredited', '35+ Years', 'Colombo 03'].map(t => (
                      <span key={t} className="featured-pill">{t}</span>
                    ))}
                  </div>
                  <div className="featured-actions">
                    <Link
                      href={`/institutions/${iit.slug}`}
                      className="btn btn-primary btn-lg"
                    >
                      View All Programmes
                    </Link>
                    {iit.website_url && (
                      <a
                        href={iit.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-white-outline btn-lg"
                      >
                        Visit IIT Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: featured programme list */}
                <div>
                  <div className="featured-programs-label">Featured Degree Programmes</div>
                  <div className="featured-programs-list">
                    {iitPrograms.map(p => (
                      <a
                        key={p.id}
                        href={p.program_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="featured-program-row"
                      >
                        <span className="featured-program-abbr">{levelAbbr(p.name)}</span>
                        <span className="featured-program-name">{p.name}</span>
                        <span className="featured-program-dur">{p.duration}</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem' }}>&rarr;</span>
                      </a>
                    ))}
                    <Link href={`/institutions/${iit.slug}`} className="featured-more-link">
                      See all IIT programmes &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== BROWSE BY TYPE ===== */}
      <section className="section section-white">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Browse by Institution Type</span>
            <h2 className="section-title">All institution types</h2>
          </div>
          <div className="type-grid">
            {TYPES.map(t => (
              <Link key={t.slug} href={`/institutions?category=${t.slug}`} className="type-card">
                <span className="type-icon">{t.abbr}</span>
                <div>
                  <div className="type-name">{t.name}</div>
                  <div className="type-sub">{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA STRIP ===== */}
      <section className="cta-strip">
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Not sure where to start?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '1.0625rem' }}>
            Browse all institutions and filter by type, subject, or district.
          </p>
          <Link href="/institutions" className="btn btn-primary btn-lg">
            Browse All Institutions
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <p className="footer-tag">Sri Lanka&apos;s comprehensive education guide &mdash; universities, institutes, schools and more.</p>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka. All rights reserved.</span>
            <nav className="footer-links">
              <Link href="/institutions">All Institutions</Link>
              <Link href="/institutions?category=universities">Universities</Link>
              <Link href="/portal">Institution Portal</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
