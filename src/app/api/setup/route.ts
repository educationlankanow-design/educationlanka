import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (secret !== 'elanka-setup-2024') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabase()
  const results: Record<string, string> = {}

  const institutions = [
    { name: 'Elizabeth Moir School', slug: 'elizabeth-moir-school', institution_type: 'international-schools', city: 'Colombo', district: 'Colombo', website: 'https://elizabethmoir.com', description: 'Leading Cambridge international school in Colombo 3, offering education from Early Years through A Levels.' },
    { name: 'Royal College Colombo', slug: 'royal-college-colombo', institution_type: 'national-schools', city: 'Colombo', district: 'Colombo', description: "One of Sri Lanka's most prestigious national schools with over 150 years of academic excellence." },
    { name: "Ladies' College Colombo", slug: 'ladies-college-colombo', institution_type: 'private-schools', city: 'Colombo', district: 'Colombo', description: "A leading girls' school offering O/L and A/L with a tradition of excellence since 1900." },
    { name: 'CIMA Sri Lanka', slug: 'cima-sri-lanka', institution_type: 'vocational', city: 'Colombo', district: 'Colombo', website: 'https://cimasrilanka.com', description: 'The Chartered Institute of Management Accountants — professional finance qualifications in Sri Lanka.' },
    { name: 'University of Peradeniya', slug: 'university-of-peradeniya', institution_type: 'universities', city: 'Peradeniya', district: 'Kandy', website: 'https://pdn.ac.lk', description: "One of Sri Lanka's leading state universities, situated in the scenic city of Kandy." },
    { name: 'Colombo International School', slug: 'colombo-international-school', institution_type: 'international-schools', city: 'Colombo', district: 'Colombo', website: 'https://cis.lk', description: 'Offering IB and Cambridge IGCSE curricula in an internationally accredited environment.' },
    { name: 'The British School in Colombo', slug: 'british-school-colombo', institution_type: 'international-schools', city: 'Colombo', district: 'Colombo', website: 'https://britishschool.lk', description: 'British-style education following the National Curriculum of England, from Early Years to A Levels.' },
  ]

  for (const inst of institutions) {
    const { error } = await supabase.from('institutions').upsert(
      { ...inst, country: 'Sri Lanka', is_active: true },
      { onConflict: 'slug', ignoreDuplicates: false }
    )
    results['inst_' + inst.slug] = error ? error.message : 'ok'
  }

  const featuredSlugs = [
    'informatics-institute-of-technology-iit', 'elizabeth-moir-school', 'royal-college-colombo',
    'ladies-college-colombo', 'university-of-peradeniya', 'cima-sri-lanka',
    'colombo-international-school', 'british-school-colombo',
  ]
  for (const slug of featuredSlugs) {
    const { error } = await supabase.from('institutions').update({ is_featured: true } as any).eq('slug', slug)
    results['feature_' + slug] = error ? error.message : 'ok'
  }

  const { data: instRows } = await supabase.from('institutions').select('id, slug')
  const instMap: Record<string, string> = {}
  ;(instRows || []).forEach((r: any) => { instMap[r.slug] = r.id })

  const programs = [
    { s: 'elizabeth-moir-school', name: 'Cambridge Early Years & Primary', level: 'primary', duration: 'Ages 3-11', category: "Int'l Curricula" },
    { s: 'elizabeth-moir-school', name: 'Cambridge Lower Secondary', level: 'secondary', duration: 'Ages 11-14', category: "Int'l Curricula" },
    { s: 'elizabeth-moir-school', name: 'Cambridge IGCSE', level: 'secondary', duration: 'Ages 14-16', category: "Int'l Curricula" },
    { s: 'elizabeth-moir-school', name: 'Cambridge International A Levels', level: 'alevel', duration: 'Ages 16-18', category: "Int'l Curricula" },
    { s: 'royal-college-colombo', name: 'National Syllabus Primary & Junior Secondary', level: 'secondary', duration: 'Grades 1-9', category: 'Sciences' },
    { s: 'royal-college-colombo', name: 'GCE Ordinary Level (O/L)', level: 'secondary', duration: 'Grades 10-11', category: 'Sciences' },
    { s: 'royal-college-colombo', name: 'GCE A/L — Physical Science Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Sciences' },
    { s: 'royal-college-colombo', name: 'GCE A/L — Biological Science Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Medicine' },
    { s: 'royal-college-colombo', name: 'GCE A/L — Commerce Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Business' },
    { s: 'royal-college-colombo', name: 'GCE A/L — Arts Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Arts' },
    { s: 'ladies-college-colombo', name: 'Primary Education', level: 'primary', duration: 'Grades 1-5', category: 'Sciences' },
    { s: 'ladies-college-colombo', name: 'GCE Ordinary Level (O/L)', level: 'secondary', duration: 'Grades 6-11', category: 'Sciences' },
    { s: 'ladies-college-colombo', name: 'GCE A/L — Science Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Sciences' },
    { s: 'ladies-college-colombo', name: 'GCE A/L — Commerce Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Business' },
    { s: 'ladies-college-colombo', name: 'GCE A/L — Arts Stream', level: 'alevel', duration: 'Grades 12-13', category: 'Arts' },
    { s: 'cima-sri-lanka', name: 'CIMA Certificate in Business Accounting (Cert BA)', level: 'professional', duration: '6-12 months', category: 'Business' },
    { s: 'cima-sri-lanka', name: 'CIMA Operational Level', level: 'professional', duration: '12-18 months', category: 'Business' },
    { s: 'cima-sri-lanka', name: 'CIMA Management Level', level: 'professional', duration: '12-18 months', category: 'Business' },
    { s: 'cima-sri-lanka', name: 'CIMA Strategic Level', level: 'professional', duration: '12-18 months', category: 'Business' },
    { s: 'cima-sri-lanka', name: 'CIMA — Chartered Management Accountant', level: 'professional', duration: '3-5 years', category: 'Business' },
    { s: 'university-of-peradeniya', name: 'BSc Engineering (Civil / Electrical / Mechanical)', level: 'undergraduate', duration: '4 years', category: 'Engineering' },
    { s: 'university-of-peradeniya', name: 'MBBS — Faculty of Medicine', level: 'undergraduate', duration: '5 years', category: 'Medicine' },
    { s: 'university-of-peradeniya', name: 'BDS — Dental Surgery', level: 'undergraduate', duration: '5 years', category: 'Medicine' },
    { s: 'university-of-peradeniya', name: 'BSc Agriculture', level: 'undergraduate', duration: '4 years', category: 'Sciences' },
    { s: 'university-of-peradeniya', name: 'LLB — Faculty of Law', level: 'undergraduate', duration: '3 years', category: 'Law' },
    { s: 'university-of-peradeniya', name: 'BSc Science (Physics / Chemistry / Biology)', level: 'undergraduate', duration: '3 years', category: 'Sciences' },
    { s: 'colombo-international-school', name: 'IB Primary Years Programme (PYP)', level: 'primary', duration: 'Ages 3-12', category: "Int'l Curricula" },
    { s: 'colombo-international-school', name: 'IB Middle Years Programme (MYP)', level: 'secondary', duration: 'Ages 11-16', category: "Int'l Curricula" },
    { s: 'colombo-international-school', name: 'Cambridge IGCSE', level: 'secondary', duration: 'Ages 14-16', category: "Int'l Curricula" },
    { s: 'colombo-international-school', name: 'IB Diploma Programme', level: 'alevel', duration: 'Ages 16-19', category: "Int'l Curricula" },
    { s: 'british-school-colombo', name: 'Early Years Foundation Stage (EYFS)', level: 'primary', duration: 'Ages 3-5', category: "Int'l Curricula" },
    { s: 'british-school-colombo', name: 'Key Stage 1 & 2 — Primary', level: 'primary', duration: 'Ages 5-11', category: "Int'l Curricula" },
    { s: 'british-school-colombo', name: 'Key Stage 3 — Lower Secondary', level: 'secondary', duration: 'Ages 11-14', category: "Int'l Curricula" },
    { s: 'british-school-colombo', name: 'Cambridge IGCSE (Key Stage 4)', level: 'secondary', duration: 'Ages 14-16', category: "Int'l Curricula" },
    { s: 'british-school-colombo', name: 'Cambridge International A Levels', level: 'alevel', duration: 'Ages 16-18', category: "Int'l Curricula" },
  ]

  for (const p of programs) {
    const instId = instMap[p.s]
    if (!instId) { results['prog_missing_' + p.s] = 'no id'; continue }
    const { error } = await supabase.from('courses').upsert(
      { institution_id: instId, name: p.name, level: p.level, duration: p.duration, category: p.category, is_active: true },
      { onConflict: 'institution_id,name', ignoreDuplicates: true }
    )
    results['prog_' + p.name.slice(0, 25)] = error ? error.message : 'ok'
  }

  return NextResponse.json({ success: true, results })
}
