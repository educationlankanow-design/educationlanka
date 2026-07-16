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
  { name: "Int'l Curricula",       abbr: 'IB',  color: '#3b82f6', bg: '#dbeafe', query: 'International' },
]

const TYPES = [
  { slug: 'universities',          name: 'Universities',              abbr: 'UNI', desc: 'State & private universities' },
  { slug: 'institutes',            name: 'Degree Institutes',         abbr: 'DEG', desc: 'Affiliated UK/US degree programmes' },
  { slug: 'international-schools', name: 'International Schools',     abbr: 'INT', desc: 'IB, Cambridge & American curricula' },
  { slug: 'national-schools',      name: 'National Schools',          abbr: 'NAT', desc: 'Government national schools' },
  { slug: 'private-schools',       name: 'Private Schools',           abbr: 'PVT', desc: 'Independent private schools' },
  { slug: 'vocational',            name: 'Vocational & Professional',  abbr: 'VOC', desc: 'TVEC, NVQ & professional certs' },
]

const CATEGORY_COLORS: Record<string, string> = {
  universities: '#1a3a6b', institutes: '#0ea5e9',
  'international-schools': '#8b5cf6', 'national-schools': '#f97316',
  'private-schools': '#ec4899', vocational: '#14b8a6',
  Public: '#1a3a6b', Private: '#0ea5e9', 'Degree Awarding': '#0ea5e9',
  International: '#8b5cf6', '1AB': '#f97316', '1C': '#f97316', '1B': '#f97316',
  Professional: '#14b8a6', Vocational: '#14b8a6',
}
const CATEGORY_LABELS: Record<string, string> = {
  universities: 'University', institutes: 'Degree Institute',
  'international-schools': 'International School', 'national-schools': 'National School',
  'private-schools': 'Private School', vocational: 'Vocational',
  Public: 'University', Private: 'Private Institute', 'Degree Awarding': 'Degree Awarding',
  International: 'International School', '1AB': 'National School', '1C': 'National School', '1B': 'National School',
  Professional: 'Professional', Vocational: 'Vocational',
}
const CATEGORY_BADGES: Record<string, string> = {
  universities: 'badge-blue', institutes: 'badge-green',
  'international-schools': 'badge-purple', 'national-schools': 'badge-orange',
  'private-schools': 'badge-pink', vocational: 'badge-teal',
  Public: 'badge-blue', Private: 'badge-green', 'Degree Awarding': 'badge-green',
  International: 'badge-purple', '1AB': 'badge-orange', '1C': 'badge-orange', '1B': 'badge-orange',
  Professional: 'badge-teal', Vocational: 'badge-teal',
}

const SCHOOL_INFO: Record<string, { desc: string; tags: string[]; gradient: string }> = {
  'ladies-college-colombo': {
    desc: "One of Sri Lanka's most prestigious girls' schools, Ladies' College has shaped generations of leaders since 1900, offering outstanding O/L and A/L education with a proud tradition of academic and extracurricular excellence.",
    tags: ["Girls' School", "O/L & A/L", "Colombo 7", "Est. 1900"],
    gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  },
  'elizabeth-moir-school': {
    desc: "Elizabeth Moir School delivers the Cambridge International curriculum from Early Years through A Levels, preparing students for admission to top universities worldwide from its campus in Colombo 3.",
    tags: ['Cambridge Curriculum', 'Early Years to A/L', 'Colombo 3', 'International'],
    gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
  },
  'colombo-international-school': {
    desc: "Colombo International School offers the IB curriculum and Cambridge IGCSE in a truly international environment, developing globally minded students from Early Years through to the IB Diploma.",
    tags: ['IB World School', 'Cambridge IGCSE', 'Colombo', 'International'],
    gradient: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
  },
  'royal-college-colombo': {
    desc: "Royal College Colombo is one of Sri Lanka's most celebrated national schools with over 150 years of history, offering the national curriculum from primary through to A/L across all major subject streams.",
    tags: ["National School", "O/L & A/L", "Colombo 7", "Est. 1835"],
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
  },
  'british-school-colombo': {
    desc: "The British School in Colombo provides a world-class British-style education following England's National Curriculum, from the Early Years Foundation Stage through Cambridge A Levels.",
    tags: ['British Curriculum', 'EYFS to A Levels', 'Colombo', 'Cambridge'],
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
  },
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

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
  const supabase = await createServerSupabase()

  const [
    { count: totalInstitutions },
    { count: totalCourses },
    iitResult,
    featuredResult,
    schoolsResult,
  ] = await Promise.all([
    supabase.from('institutions').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('institutions').select('*').eq('slug', 'informatics-institute-of-technology-iit').single(),
    supabase.from('institutions').select('*').eq('is_featured' as any, true).limit(12),
    supabase.from('institutions').select('*').in('slug', ['ladies-college-colombo', 'elizabeth-moir-school', 'colombo-international-school', 'royal-college-colombo', 'british-school-colombo']),
  ])

  const iit = iitResult.data
  const rawFeatured = featuredResult.data || []
  const featuredInsts = shuffle(rawFeatured).slice(0, 6)
  const featuredSchool = shuffle(schoolsResult.data || [])[0] || null
  const schoolInfo = featuredSchool ? SCHOOL_INFO[featuredSchool.slug] : null

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
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">All Institutions</Link></li>
            <li><Link href="/institutions?category=universities">Universities</Link></li>
            <li><Link href="/institutions?category=institutes">Institutes</Link></li>
            <li><Link href="/institutions?category=international-schools">Int&apos;l Schools</Link></li>
            <li><Link href="/students/login" className="navbar-portal-link">Student Portal</Link></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Sri Lanka&apos;s Comprehensive Education Guide</div>
          <h1 className="hero-title">Find your perfect <em>course</em> in Sri Lanka</h1>
          <p className="hero-subtitle">
            Explore {(totalInstitutions ?? 0).toLocaleString()}+ institutions &mdash; universities, degree institutes,
            international schools and more.
          </p>
          <form action="/institutions" method="GET" className="hero-search">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <span className="search-icon">&#x1F50D;</span>
              <input name="q" type="search" placeholder="Search by institution name..." autoComplete="off"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '1rem', padding: '0.875rem 0.5rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <select name="category" style={{ border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '0.5rem 0.75rem', fontSize: '0.875rem', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer' }}>
                <option value="">All Types</option>
                <option value="universities">Universities</option>
                <option value="institutes">Degree Institutes</option>
                <option value="international-schools">International Schools</option>
                <option value="national-schools">National Schools</option>
                <option value="private-schools">Private Schools</option>
                <option value="vocational">Vocational</option>
              </select>
              <select name="subject" style={{ border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '0.5rem 0.75rem', fontSize: '0.875rem', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer' }}>
                <option value="">All Subjects</option>
                <option value="Computing">Computing &amp; IT</option>
                <option value="Business">Business &amp; Management</option>
                <option value="Engineering">Engineering</option>
                <option value="Medicine">Medicine &amp; Health</option>
                <option value="Law">Law</option>
                <option value="Science">Sciences</option>
                <option value="Arts">Arts &amp; Design</option>
                <option value="International">Int&apos;l Curricula</option>
              </select>
              <button type="submit">Search</button>
            </div>
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

      {/* FEATURED INSTITUTIONS */}
      {featuredInsts.length > 0 && (
        <section className="section section-white">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Featured Institutions</span>
              <h2 className="section-title">Top institutions in Sri Lanka</h2>
              <p className="section-sub">Highlighted institutions across universities, schools and professional bodies</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {featuredInsts.map((inst: any) => {
                const itype = inst.institution_type || inst.category || ''
                const color = CATEGORY_COLORS[itype] || '#1a3a6b'
                const label = CATEGORY_LABELS[itype] || itype
                const badge = CATEGORY_BADGES[itype] || 'badge-navy'
                return (
                  <Link key={inst.id} href={`/institutions/${inst.slug}`} style={{
                    display: 'flex', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', overflow: 'hidden', textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ width: '5px', background: color, flexShrink: 0 }} />
                    <div style={{ padding: '1.25rem', flex: 1 }}>
                      <span className={`badge ${badge}`} style={{ marginBottom: '0.625rem', display: 'inline-block' }}>{label}</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: 1.3 }}>{inst.name}</div>
                      {(inst.city || inst.district) && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          &#x1F4CD; {[inst.city, inst.district].filter(Boolean).join(', ')}
                        </div>
                      )}
                      <div style={{ marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>View programmes &rarr;</div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/institutions" className="btn btn-outline">Browse all institutions &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      {/* SUBJECT AREAS */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Browse by Subject</span>
            <h2 className="section-title">What do you want to study?</h2>
            <p className="section-sub">Browse programmes across all subject areas from Sri Lanka&apos;s top institutions</p>
          </div>
          <div className="subjects-grid">
            {SUBJECTS.map(s => (
              <Link key={s.name} href={`/institutions?subject=${encodeURIComponent(s.query)}`} className="subject-card">
                <div className="subject-icon" style={{ background: s.bg, color: s.color }}>{s.abbr}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-cta">Explore programmes &rarr;</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED INSTITUTION SPOTLIGHT (IIT) */}
      {iit && (
        <section className="section section-white">
          <div className="container">
            <div className="featured-banner">
              <div className="featured-grid">
                <div>
                  <div className="featured-tag">Featured Institution</div>
                  <h2 className="featured-title">Informatics Institute of Technology</h2>
                  <p className="featured-desc">
                    35+ years of excellence in Sri Lanka. IIT partners with the{' '}
                    <strong style={{ color: 'white' }}>University of Westminster</strong> and{' '}
                    <strong style={{ color: 'white' }}>Robert Gordon University</strong> (UK) to deliver
                    world-class degrees right here in Colombo.
                  </p>
                  <div className="featured-tags">
                    {['5,000+ Alumni', 'UK Accredited', '35+ Years', 'Colombo 03'].map(t => (
                      <span key={t} className="featured-pill">{t}</span>
                    ))}
                  </div>
                  <div className="featured-actions">
                    <Link href={`/institutions/${iit.slug}`} className="btn btn-primary btn-lg">View All Programmes</Link>
                    {iit.website && (
                      <a href={iit.website} target="_blank" rel="noopener noreferrer" className="btn btn-white-outline btn-lg">Visit IIT Website</a>
                    )}
                  </div>
                </div>
                <div>
                  <div className="featured-programs-label">Featured Degree Programmes</div>
                  <div className="featured-programs-list">
                    {iitPrograms.map(p => (
                      <a key={p.id} href={p.program_url || '#'} target="_blank" rel="noopener noreferrer" className="featured-program-row">
                        <span className="featured-program-abbr">{levelAbbr(p.name)}</span>
                        <span className="featured-program-name">{p.name}</span>
                        <span className="featured-program-dur">{p.duration}</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem' }}>&rarr;</span>
                      </a>
                    ))}
                    <Link href={`/institutions/${iit.slug}`} className="featured-more-link">See all IIT programmes &rarr;</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED SCHOOL SPOTLIGHT (rotating) */}
      {featuredSchool && schoolInfo && (
        <section className="section section-gray">
          <div className="container">
            <div style={{
              background: schoolInfo.gradient,
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(2rem, 5vw, 3rem)',
              color: 'white',
              boxShadow: 'var(--shadow-xl)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)', marginBottom: '0.75rem' }}>
                    Featured School
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: 1.2 }}>
                    {featuredSchool.name}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                    {schoolInfo.desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    {schoolInfo.tags.map(t => (
                      <span key={t} style={{
                        background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8rem', fontWeight: 600,
                      }}>{t}</span>
                    ))}
                  </div>
                  <Link href={`/institutions/${featuredSchool.slug}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'white', color: schoolInfo.gradient.includes('7c3aed') ? '#7c3aed' : '#0284c7',
                    padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', fontWeight: 700,
                    fontSize: '0.9375rem', textDecoration: 'none', transition: 'opacity 0.15s',
                  }}>
                    View School Profile &rarr;
                  </Link>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-xl)', padding: '1.75rem', backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
                    About this School
                  </div>
                  {[
                    { label: 'Location', value: [featuredSchool.city, featuredSchool.district].filter(Boolean).join(', ') || 'Colombo' },
                    { label: 'Type', value: CATEGORY_LABELS[featuredSchool.institution_type || featuredSchool.category || ''] || 'School' },
                    { label: 'Country', value: 'Sri Lanka' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    &#8635; Refreshes with each visit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BROWSE BY TYPE */}
      <section className="section section-gray">
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

      {/* STUDENT / INSTITUTION CTA */}
      <section className="section section-white">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #0ea5e9)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', color: 'white' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>For Students</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Create your student profile</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Tell us your interests and grades &mdash; we&apos;ll match you with the right programmes.
            </p>
            <Link href="/students/register" className="btn btn-white-outline btn-lg">Register as a Student</Link>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', color: 'white' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>For Institutions</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Reach prospective students</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              List your programmes and connect with students who match your intake criteria.
            </p>
            <Link href="/portal" className="btn btn-white-outline btn-lg">Institution Portal</Link>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-strip">
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Not sure where to start?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '1.0625rem' }}>Browse all institutions and filter by type, subject, or district.</p>
          <Link href="/institutions" className="btn btn-primary btn-lg">Browse All Institutions</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <p className="footer-tag">Sri Lanka&apos;s comprehensive education guide &mdash; universities, institutes, schools and more.</p>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka. All rights reserved.</span>
            <nav className="footer-links">
              <Link href="/institutions">All Institutions</Link>
              <Link href="/students/login">Student Portal</Link>
              <Link href="/portal">Institution Portal</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
