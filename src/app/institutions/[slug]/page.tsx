import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import RatingWidget from './RatingWidget'
import ContributeWidget from './ContributeWidget'

export const dynamic = 'force-dynamic'

function getInstMeta(itype: string) {
  const t = itype || ''
  if (t.includes('University') || t === 'Public' || t === 'universities')
    return { label: 'University', catSlug: 'universities', color: '#3b82f6' }
  if (t.includes('Degree') || t === 'institutes')
    return { label: 'Degree Institute', catSlug: 'institutes', color: '#10b981' }
  if (t.includes('International') || t === 'international-schools')
    return { label: 'International School', catSlug: 'international-schools', color: '#8b5cf6' }
  if (t === '1AB' || t === '1C' || t === '1B' || t.includes('National') || t === 'national-schools')
    return { label: 'National School', catSlug: 'national-schools', color: '#f59e0b' }
  if (t.includes('Private') || t === 'private-schools')
    return { label: 'Private School', catSlug: 'private-schools', color: '#ec4899' }
  if (t.includes('Vocational') || t.includes('Professional') || t === 'vocational')
    return { label: 'Vocational & Professional', catSlug: 'vocational', color: '#14b8a6' }
  return { label: t || 'Institution', catSlug: '', color: '#64748b' }
}

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: 'Undergraduate', postgraduate: 'Postgraduate', foundation: 'Foundation',
  professional: 'Professional', secondary: 'Secondary / A Levels', primary: 'Primary',
}
const LEVEL_ORDER = ['undergraduate', 'postgraduate', 'foundation', 'professional', 'secondary', 'primary']

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  'Computing & IT':           { bg: '#eef2ff', color: '#6366f1' },
  'Technology & Engineering': { bg: '#fffbeb', color: '#f59e0b' },
  'Business & Management':    { bg: '#e0f2fe', color: '#0ea5e9' },
  'Medicine & Health':        { bg: '#d1fae5', color: '#10b981' },
  'Law':                      { bg: '#f3e8ff', color: '#8b5cf6' },
  'Science':                  { bg: '#f0fdfa', color: '#14b8a6' },
  'Arts & Design':            { bg: '#fce7f3', color: '#ec4899' },
  'International Curriculum': { bg: '#dbeafe', color: '#3b82f6' },
  'Social Sciences':          { bg: '#fff7ed', color: '#c2410c' },
  'Languages':                { bg: '#fef9c3', color: '#a16207' },
}
function getCatStyle(cat: string | null) {
  return cat ? (CAT_COLORS[cat] || { bg: '#f1f5f9', color: '#475569' }) : { bg: '#f1f5f9', color: '#475569' }
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

interface InstDetail {
  heroImage: string; heroGradient: string; founded?: string; studentCount?: string;
  entryRequirements: string[]; highlights: string[]; accreditations?: string[];
}

const INST: Record<string, InstDetail> = {
  'informatics-institute-of-technology': {
    heroImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)',
    founded: '1990', studentCount: '5,000+',
    entryRequirements: [
      "Minimum 3 passes at G.C.E. A/L (Science, Commerce, or Arts stream acceptable)",
      "G.C.E. O/L with minimum C passes in Mathematics and English Language",
      "English proficiency: IELTS 5.5, TOEFL 61+ or equivalent",
      "Foundation Programme available for students who do not meet direct entry requirements",
      "Mature Entry (25+): relevant work experience may qualify via portfolio review",
    ],
    highlights: ["UGC Approved","Affiliated with University of Westminster, UK","ISO 9001:2015 Certified"],
    accreditations: ["University of Westminster (UK)","BCS – Chartered Institute for IT","UGC Sri Lanka"],
  },
  'university-of-peradeniya': {
    heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    founded: '1942', studentCount: '12,000+',
    entryRequirements: [
      "G.C.E. A/L with qualifying Z-score in the relevant subject stream",
      "Engineering: Physical Science stream – minimum B passes in Physics, Chemistry, Combined Maths",
      "Medicine / Dental: Biological Science stream – minimum B passes in Biology, Chemistry, Physics",
      "Arts & Management: Humanities or Commerce stream results considered",
      "Selection is purely merit-based on Z-score national ranking",
      "Postgraduate: Relevant degree with minimum second class lower (GPA 2.7+)",
    ],
    highlights: ["Government National University","Sri Lanka's Most Beautiful Campus","Comprehensive Research University","Affiliated Teaching Hospital"],
    accreditations: ["University Grants Commission (UGC) Sri Lanka","AHEAD Programme (ADB-funded)","Sri Lanka Medical Council","Institution of Engineers Sri Lanka (IESL)"],
  },
  'cima-sri-lanka': {
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    founded: '1919', studentCount: '3,500+',
    entryRequirements: [
      "Certificate Level: Minimum 2 G.C.E. A/L passes OR equivalent",
      "Direct entry to Operational Level: Relevant degree (full exemptions may apply)",
      "Management Level: Completion of Operational Level required",
      "Strategic Level: Completion of Management Level required",
      "No formal qualifications needed to start at Certificate Level",
      "Degree holders from partner universities may qualify for full exemptions",
    ],
    highlights: ["World's Leading Management Accounting Body","Recognised in 179 Countries","CGMA Designation on completion"],
    accreditations: ["IFAC – International Federation of Accountants","Chartered Global Management Accountant (CGMA)","AICPA Alliance"],
  },
  'ladies-college-colombo': {
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)',
    founded: '1900', studentCount: '2,500+',
    entryRequirements: [
      "Grade 1 (Ordinary Intake): Annual registration via government zonal lottery system",
      "Grade 1 (Special Intake): Children of past pupils and specific merit categories",
      "Grade 7: G.C.E. Grade 5 Scholarship Exam – national top performers preferred",
      "Mid-stream Entry: Subject to vacancy; entrance assessment in core subjects required",
      "A/L Section: Based on G.C.E. O/L results – minimum 6 As and 3 Bs for most streams",
    ],
    highlights: ["National School – Category 1AB","All-Girls School Founded 1900","Consistent National Top 10","STEM & Arts Excellence"],
  },
  'elizabeth-moir-school': {
    heroImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#0c4a6e 0%,#0284c7 100%)',
    founded: '1922', studentCount: '800+',
    entryRequirements: [
      "Entrance assessment covering English, Mathematics, and General Knowledge",
      "Interview with the Principal or Head of School",
      "Previous school records and academic transcripts required",
      "IGCSE stream (Years 9-11): Based on Year 8 assessment performance",
      "A Level entry: Minimum 5 IGCSEs at grade C or above including English and Maths",
      "English language proficiency essential – all instruction is in English",
    ],
    highlights: ["Cambridge International School","IGCSE & A Level Curriculum","Multicultural Student Body","Small Class Sizes"],
    accreditations: ["Cambridge Assessment International Education (CAIE)","CfBT Education Trust Accredited"],
  },
  'colombo-international-school': {
    heroImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#064e3b 0%,#0f766e 100%)',
    founded: '1968', studentCount: '1,200+',
    entryRequirements: [
      "Application form followed by age-appropriate entrance assessment",
      "English is the primary medium of instruction; proficiency required",
      "Junior School: Assessment in English and Mathematics for the relevant year group",
      "Senior School (IGCSE): Academic records plus entrance test in English and Maths",
      "IB Diploma: Minimum 5 IGCSE passes including English Language and Mathematics at grade C",
      "Interview with Head of Senior or Junior School for all new admissions",
    ],
    highlights: ["IB World School","Cambridge IGCSE & IB Diploma","Established 1968","International Student Body"],
    accreditations: ["IB World School","Cambridge Assessment International Education (CAIE)","Council of International Schools (CIS)"],
  },
  'royal-college-colombo': {
    heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#78350f 0%,#b45309 100%)',
    founded: '1835', studentCount: '5,500+',
    entryRequirements: [
      "Grade 1 (Zonal Quota): Government lottery system for zonal catchment residents",
      "Grade 1 (Special Quota): Old Royalists children, armed forces, merit categories",
      "Grade 7: G.C.E. Grade 5 Scholarship Exam – competitive national ranking required",
      "A/L Admission: Based on G.C.E. O/L results; Physical Science stream requires high As",
      "Applications via the Western Province Education Department",
    ],
    highlights: ["National School – Category 1AB","Sri Lanka's Oldest School (Est. 1835)","Alumni include 2 Presidents","Annual Battle of the Maroons"],
  },
  'british-school-colombo': {
    heroImage: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1400&q=80',
    heroGradient: 'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)',
    founded: '1986', studentCount: '1,000+',
    entryRequirements: [
      "Placement Assessment in English, Mathematics, and Verbal Reasoning",
      "Current school reports and academic records required",
      "Interview with Head of Primary or Secondary (depending on year group)",
      "Year 10 (GCSE start): Based on Year 9 assessment and previous records",
      "Sixth Form (A Levels): Minimum 5 GCSEs at grade C or above including English and Maths",
      "Non-native English speakers may need to demonstrate English proficiency",
    ],
    highlights: ["British National Curriculum","GCSE & A Level Examinations","Expatriate & Local Community","Strong UK University Pathways"],
    accreditations: ["Cambridge Assessment International Education (CAIE)","Council of International Schools (CIS)","BSO – British Schools Overseas"],
  },
}

const CAT_HERO: Record<string, string> = {
  universities: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80',
  'Public University': 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80',
  institutes: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
  'International School': 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=80',
  '1AB': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
}
const DEFAULT_HERO = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80'

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ level?: string }> }

export default async function InstitutionPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { level: activeTab } = await searchParams
  const supabase = await createServerSupabase()

  const { data: inst } = await supabase.from('institutions').select('*').eq('slug', slug).single()
  if (!inst) notFound()

  const { data: allCourses } = await supabase
    .from('courses').select('id,name,level,duration,category,program_url,description,is_active')
    .eq('institution_id', inst.id).eq('is_active', true).order('name')

  const courses = allCourses || []
  const details = INST[slug]
  const meta = getInstMeta(inst.institution_type || '')

  const grouped: Record<string, typeof courses> = {}
  courses.forEach(c => { const lvl = c.level || 'other'; if (!grouped[lvl]) grouped[lvl] = []; grouped[lvl].push(c) })
  const availableLevels = LEVEL_ORDER.filter(l => grouped[l]?.length)
  const activeLevel = activeTab && grouped[activeTab] ? activeTab : availableLevels[0] || ''
  const displayCourses = activeLevel ? (grouped[activeLevel] || []) : courses

  const heroImg = details?.heroImage || CAT_HERO[inst.institution_type || ''] || DEFAULT_HERO
  const heroGrad = details?.heroGradient || 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)'
  const siteUrl = inst.website || inst.website_url || ''

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Education<span>Lanka</span></Link>
          <ul className="navbar-links">
            <li><Link href="/institutions">All Institutions</Link></li>
            <li><Link href="/institutions?category=universities">Universities</Link></li>
            <li><Link href="/institutions?category=institutes">Institutes</Link></li>
            <li><Link href="/institutions?category=international-schools">Int&apos;l Schools</Link></li>
            <li><Link href="/portal" className="navbar-portal-link">Institution Portal</Link></li>
          </ul>
          <details className="navbar-mobile">
            <summary className="navbar-hamburger-btn" aria-label="Menu"><span></span><span></span><span></span></summary>
            <div className="navbar-mobile-drawer">
              <Link href="/">Home</Link><Link href="/institutions">All Institutions</Link>
              <Link href="/institutions?category=universities">Universities</Link>
              <Link href="/institutions?category=institutes">Institutes</Link>
              <Link href="/institutions?category=international-schools">Int&apos;l Schools</Link>
              <Link href="/portal">Institution Portal</Link>
            </div>
          </details>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '340px', overflow: 'hidden', background: heroGrad }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={inst.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.62) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '1rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'white', flexShrink: 0 }}>
              {inst.name.split(' ').filter((w: string) => w.length > 2).slice(0, 2).map((w: string) => w[0]).join('')}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '0.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                {inst.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.875rem', borderRadius: '999px' }}>{meta.label}</span>
                {inst.district && <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', padding: '0.25rem 0.875rem', borderRadius: '999px' }}>&#x1F4CD; {inst.district}</span>}
                {details?.founded && <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', padding: '0.25rem 0.875rem', borderRadius: '999px' }}>Est. {details.founded}</span>}
                {details?.studentCount && <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', padding: '0.25rem 0.875rem', borderRadius: '999px' }}>&#x1F393; {details.studentCount}</span>}
                {courses.length > 0 && <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', padding: '0.25rem 0.875rem', borderRadius: '999px' }}>{courses.length} programmes listed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span className="breadcrumb-sep">/</span>
          <Link href="/institutions">Institutions</Link>
          {meta.catSlug && <><span className="breadcrumb-sep">/</span><Link href={'/institutions?category=' + meta.catSlug}>{meta.label}s</Link></>}
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{inst.name}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="section section-gray" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* ABOUT */}
              {(inst.description || details?.highlights) && (
                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.875rem', color: 'var(--color-text)' }}>About</h2>
                  {inst.description && <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.9375rem' }}>{inst.description}</p>}
                  {details?.highlights && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {details.highlights.map((h, i) => (
                        <span key={i} style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', padding: '0.25rem 0.875rem' }}>
                          &#x2713; {h}
                        </span>
                      ))}
                    </div>
                  )}
                  {details?.accreditations && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accreditations & Affiliations</p>
                      {details.accreditations.map((a, i) => (
                        <p key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>&#x2022;</span> {a}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ENTRY REQUIREMENTS */}
              {details?.entryRequirements && (
                <div style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderRadius: 'var(--radius-xl)', border: '1.5px solid #bae6fd', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    &#x1F4CB; Entry Requirements
                  </h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' }}>
                    {details.entryRequirements.map((req, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#0c4a6e', lineHeight: 1.55 }}>
                        <span style={{ background: '#0284c7', color: 'white', borderRadius: '999px', minWidth: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>
                          {i + 1}
                        </span>
                        {req}
                      </li>
                    ))}
                  </ul>
                  {siteUrl && (
                    <p style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #bae6fd', fontSize: '0.8125rem', color: '#0369a1' }}>
                      &#x2139; Always verify on the <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>official website</a> as requirements may change.
                    </p>
                  )}
                </div>
              )}

              {/* PROGRAMMES */}
              {courses.length > 0 ? (
                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text)' }}>Programmes Offered</h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid var(--color-border)' }}>{courses.length} listed</span>
                  </div>
                  {availableLevels.length > 1 && (
                    <div className="level-tabs">
                      {availableLevels.map(lvl => (
                        <Link key={lvl} href={'/institutions/' + slug + '?level=' + lvl} className={'level-tab' + (activeLevel === lvl ? ' active' : '')}>
                          {LEVEL_LABELS[lvl] || lvl}<span className="level-tab-count">{grouped[lvl]?.length}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="program-grid">
                    {displayCourses.map((c: any) => {
                      const cs = getCatStyle(c.category)
                      return (
                        <a key={c.id} href={c.program_url || siteUrl || '#'} target="_blank" rel="noopener noreferrer" className="program-card">
                          <div className="program-icon" style={{ background: cs.bg, color: cs.color }}>{levelAbbr(c.name)}</div>
                          <div className="program-info">
                            <div className="program-name">{c.name}</div>
                            <div className="program-meta">
                              {c.category && <span className="badge" style={{ background: cs.bg, color: cs.color, fontSize: '0.65rem', padding: '2px 8px' }}>{c.category}</span>}
                              {c.duration && <span className="program-dur">{c.duration}</span>}
                            </div>
                            {c.description && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.375rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>}
                          </div>
                          <span className="program-arrow">&rarr;</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed var(--color-border)', padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#x1F4DA;</div>
                  <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>No programmes listed yet</h3>
                  <p style={{ fontSize: '0.9rem' }}>Programme information is coming soon.</p>
                  {siteUrl && <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>Visit Official Website &rarr;</a>}
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>Contact & Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {inst.address && <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.5rem' }}><span>&#x1F4CD;</span><span>{inst.address}</span></div>}
                  {inst.phone && <a href={'tel:' + inst.phone} style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>&#x1F4DE; {inst.phone}</a>}
                  {inst.email && <a href={'mailto:' + inst.email} style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>&#x2709; {inst.email}</a>}
                  {siteUrl && <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Official Website &rarr;</a>}
                </div>
              </div>

              {courses.length > 0 && (
                <div style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', color: 'white' }}>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Programme Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {availableLevels.map(lvl => (
                      <div key={lvl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{LEVEL_LABELS[lvl] || lvl}</span>
                        <span style={{ fontWeight: 700 }}>{grouped[lvl]?.length}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Total</span>
                      <span style={{ color: 'var(--color-accent)' }}>{courses.length}</span>
                    </div>
                  </div>
                </div>
              )}

              <RatingWidget institutionId={inst.id} institutionName={inst.name} />
              <ContributeWidget institutionId={inst.id} institutionName={inst.name} />

              <Link href={meta.catSlug ? '/institutions?category=' + meta.catSlug : '/institutions'} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                &larr; Back to {meta.label}s
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Education<span>Lanka</span></div>
          <p className="footer-tag">Sri Lanka&apos;s comprehensive education guide.</p>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} EducationLanka. All rights reserved.</span>
            <nav className="footer-links">
              <Link href="/">Home</Link><Link href="/institutions">Institutions</Link><Link href="/portal">Institution Portal</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
