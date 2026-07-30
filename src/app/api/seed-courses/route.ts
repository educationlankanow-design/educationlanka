import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// Seed programmes. Call: GET /api/seed-courses?secret=elanka-setup-2024
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (secret !== 'elanka-setup-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminSupabase()
  const results: Record<string, any> = {}

  const coursesData: Record<string, { name: string; level: string; duration?: string; description?: string }[]> = {
    'informatics-institute-of-technology-iit': [
      { name: 'BSc (Hons) Computer Science', level: 'Undergraduate', duration: '3 years', description: 'Joint degree with University of Westminster UK.' },
      { name: 'BSc (Hons) Software Engineering', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc (Hons) Business Information Systems', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc (Hons) Computer Networks and Security', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc (Hons) Data Science', level: 'Undergraduate', duration: '3 years' },
      { name: 'Foundation Programme in IT', level: 'Foundation', duration: '1 year' },
      { name: 'Higher National Diploma in Computing', level: 'HND', duration: '2 years' },
      { name: 'MBA in Information Technology', level: 'Postgraduate', duration: '2 years' },
      { name: 'MSc in Computer Science', level: 'Postgraduate', duration: '18 months' },
    ],
    'university-of-peradeniya': [
      { name: 'BSc Engineering', level: 'Undergraduate', duration: '4 years' },
      { name: 'MBBS', level: 'Undergraduate', duration: '5 years' },
      { name: 'BDS (Dental Surgery)', level: 'Undergraduate', duration: '5 years' },
      { name: 'BA in Humanities', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc in Science', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc Agriculture', level: 'Undergraduate', duration: '4 years' },
      { name: 'BVSc (Veterinary Science)', level: 'Undergraduate', duration: '5 years' },
      { name: 'MSc in Engineering', level: 'Postgraduate', duration: '2 years' },
      { name: 'PhD', level: 'Postgraduate', duration: '3-5 years' },
    ],
    'cima-sri-lanka': [
      { name: 'CIMA Certificate in Business Accounting', level: 'Professional', duration: '6 months' },
      { name: 'CIMA Operational Level', level: 'Professional', duration: '1 year' },
      { name: 'CIMA Management Level', level: 'Professional', duration: '1 year' },
      { name: 'CIMA Strategic Level', level: 'Professional', duration: '1 year' },
      { name: 'CGMA Designation', level: 'Professional', duration: 'Variable' },
    ],
    'elizabeth-moir-school': [
      { name: 'Cambridge IGCSE', level: 'Secondary', duration: '2 years' },
      { name: 'Cambridge A Levels', level: 'Advanced', duration: '2 years' },
      { name: 'Primary Programme (Years 1-6)', level: 'Primary', duration: '6 years' },
      { name: 'Lower Secondary (Years 7-9)', level: 'Secondary', duration: '3 years' },
    ],
    'british-school-colombo': [
      { name: 'Early Years Foundation Stage', level: 'Primary', duration: '2 years' },
      { name: 'Key Stage 1 and 2 (Primary)', level: 'Primary', duration: '6 years' },
      { name: 'GCSE', level: 'Secondary', duration: '2 years' },
      { name: 'A Levels', level: 'Advanced', duration: '2 years' },
    ],
    'overseas-school-of-colombo': [
      { name: 'IB Primary Years Programme', level: 'Primary', duration: '6 years' },
      { name: 'IB Middle Years Programme', level: 'Secondary', duration: '5 years' },
      { name: 'IB Diploma Programme', level: 'Advanced', duration: '2 years' },
    ],
    'royal-college-colombo': [
      { name: 'Ordinary Level (O/L)', level: 'Secondary', duration: '5 years' },
      { name: 'A/L Science Stream', level: 'Advanced', duration: '2 years' },
      { name: 'A/L Commerce Stream', level: 'Advanced', duration: '2 years' },
      { name: 'A/L Arts Stream', level: 'Advanced', duration: '2 years' },
    ],
    'ladies-college-colombo': [
      { name: 'Primary Education', level: 'Primary', duration: '5 years' },
      { name: 'Ordinary Level (O/L)', level: 'Secondary', duration: '5 years' },
      { name: 'A/L Science Stream', level: 'Advanced', duration: '2 years' },
      { name: 'A/L Commerce Stream', level: 'Advanced', duration: '2 years' },
    ],
    'wesley-college-colombo': [
      { name: 'Primary Education', level: 'Primary', duration: '5 years' },
      { name: 'Ordinary Level (O/L)', level: 'Secondary', duration: '5 years' },
      { name: 'A/L Science Stream', level: 'Advanced', duration: '2 years' },
      { name: 'A/L Arts Stream', level: 'Advanced', duration: '2 years' },
    ],
    'lyceum-international-school': [
      { name: 'Cambridge IGCSE', level: 'Secondary', duration: '2 years' },
      { name: 'Cambridge A Levels', level: 'Advanced', duration: '2 years' },
      { name: 'Cambridge Primary', level: 'Primary', duration: '6 years' },
    ],
    'gateway-college-colombo': [
      { name: 'Cambridge IGCSE', level: 'Secondary', duration: '2 years' },
      { name: 'Cambridge A Levels', level: 'Advanced', duration: '2 years' },
    ],
    'apiit-staffordshire-university-sri-lanka': [
      { name: 'BSc (Hons) Computer Science', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc (Hons) Software Engineering', level: 'Undergraduate', duration: '3 years' },
      { name: 'BSc (Hons) Artificial Intelligence', level: 'Undergraduate', duration: '3 years' },
      { name: 'BEng (Hons) Electronics Engineering', level: 'Undergraduate', duration: '3 years' },
      { name: 'MBA', level: 'Postgraduate', duration: '18 months' },
    ],
    'acbt-asian-college-of-business-technology': [
      { name: 'BSc (Hons) in Computing', level: 'Undergraduate', duration: '3 years' },
      { name: 'Foundation in Business', level: 'Foundation', duration: '1 year' },
      { name: 'HND in Business', level: 'HND', duration: '2 years' },
    ],
    'bcas-campus': [
      { name: 'BSc (Hons) Computer Science', level: 'Undergraduate', duration: '3 years', description: 'University of Bedfordshire UK joint degree.' },
      { name: 'BSc (Hons) Business Information Systems', level: 'Undergraduate', duration: '3 years' },
      { name: 'Foundation in IT', level: 'Foundation', duration: '1 year' },
      { name: 'HND Computing', level: 'HND', duration: '2 years' },
    ],
  }

  // Upsert missing institutions that aren't in the original 538 import
  const newInstitutions = [
    { name: 'British School in Colombo',    slug: 'british-school-colombo',       institution_type: 'International', city: 'Colombo',     district: 'Colombo',   description: 'One of Sri Lanka\'s premier international schools providing a British education from Nursery to Year 13.', is_active: true },
    { name: 'Lyceum International School',  slug: 'lyceum-international-school',  institution_type: 'International', city: 'Nugegoda',    district: 'Colombo',   description: 'One of the largest international school networks in Sri Lanka with branches island-wide.', is_active: true },
    { name: 'Colombo International School', slug: 'colombo-international-school', institution_type: 'International', city: 'Colombo',     district: 'Colombo',   description: 'Offers the Cambridge International curriculum from Kindergarten through to A Levels.', is_active: true },
    { name: 'Gateway College Colombo',      slug: 'gateway-college-colombo',      institution_type: 'International', city: 'Colombo',     district: 'Colombo',   description: 'Offers Cambridge International Examinations with a focus on holistic student development.', is_active: true },
    { name: 'Hindu College Colombo',        slug: 'hindu-college-colombo',        institution_type: 'private-schools', city: 'Colombo', district: 'Colombo',   description: 'A well-regarded school in Colombo catering primarily to the Hindu community.', is_active: true },
    { name: 'Musaeus College Colombo',      slug: 'musaeus-college-colombo',      institution_type: 'private-schools', city: 'Colombo', district: 'Colombo',   description: 'A leading Buddhist girls\' school in Colombo offering primary and secondary education.', is_active: true },
    { name: 'Wesley College Colombo',       slug: 'wesley-college-colombo',       institution_type: 'private-schools', city: 'Colombo', district: 'Colombo',   description: 'A leading boys\' school in Colombo established in 1874 by the Methodist Church.', is_active: true },
  ]
  for (const inst of newInstitutions) {
    const { error } = await supabase.from('institutions').upsert(inst, { onConflict: 'slug', ignoreDuplicates: false })
    results['upsert_' + inst.slug] = error ? error.message : 'ok'
  }


  const slugs = Object.keys(coursesData)
  const { data: institutions } = await supabase
    .from('institutions')
    .select('id, slug')
    .in('slug', slugs)

  results.found = institutions?.length || 0
  const slugToId: Record<string, string> = {}
  ;(institutions || []).forEach((i: any) => { slugToId[i.slug] = i.id })

  let total = 0
  for (const [slug, courses] of Object.entries(coursesData)) {
    const instId = slugToId[slug]
    if (!instId) { results['miss_' + slug] = 'not found'; continue }
    await supabase.from('courses').delete().eq('institution_id', instId)
    const rows = courses.map(c => ({ institution_id: instId, name: c.name, level: c.level, duration: c.duration || null, description: c.description || null, is_active: true }))
    const { error } = await supabase.from('courses').insert(rows)
    results[slug] = error ? error.message : rows.length + ' ok'
    if (!error) total += rows.length
  }
  results.total = total

  return NextResponse.json({ success: true, results })
}
