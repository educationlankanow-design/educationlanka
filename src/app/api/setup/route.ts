import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'

// One-time DB setup endpoint. Call: GET /api/setup?secret=elanka-setup-2024
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (secret !== 'elanka-setup-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminSupabase()
  const results: Record<string, string> = {}

  // Seed missing institutions (no 'country' column in schema)
  const seedInstitutions = [
    // International schools
    { name: 'Elizabeth Moir School',        slug: 'elizabeth-moir-school',        institution_type: 'International', category: 'international-schools', city: 'Colombo',    district: 'Colombo', description: 'A leading international school in Colombo offering the British curriculum from Early Years through to A Levels.' },
    { name: 'British School in Colombo',    slug: 'british-school-colombo',        institution_type: 'International', category: 'international-schools', city: 'Colombo',    district: 'Colombo', description: 'One of Sri Lanka\'s premier international schools providing a British education from Nursery to Year 13.' },
    { name: 'Overseas School of Colombo',   slug: 'overseas-school-of-colombo',    institution_type: 'International', category: 'international-schools', city: 'Battaramulla', district: 'Colombo', description: 'A not-for-profit international school following the International Baccalaureate (IB) curriculum.' },
    { name: 'Colombo International School', slug: 'colombo-international-school',  institution_type: 'International', category: 'international-schools', city: 'Colombo',    district: 'Colombo', description: 'Offers the Cambridge International curriculum from Kindergarten through to A Levels.' },
    { name: 'Lyceum International School',  slug: 'lyceum-international-school',   institution_type: 'International', category: 'international-schools', city: 'Nugegoda',   district: 'Colombo', description: 'One of the largest international school networks in Sri Lanka with branches across the country.' },
    { name: 'Gateway College Colombo',      slug: 'gateway-college-colombo',       institution_type: 'International', category: 'international-schools', city: 'Colombo',    district: 'Colombo', description: 'Offers Cambridge International Examinations with a focus on holistic student development.' },
    // Private schools
    { name: 'Ladies\' College Colombo',     slug: 'ladies-college-colombo',        institution_type: 'private-schools',       category: 'private-schools',       city: 'Colombo',    district: 'Colombo', description: 'One of Sri Lanka\'s most prestigious girls\' schools, offering O Levels and A Levels.' },
    { name: 'Wesley College Colombo',       slug: 'wesley-college-colombo',        institution_type: 'private-schools',       category: 'private-schools',       city: 'Colombo',    district: 'Colombo', description: 'A leading boys\' school in Colombo established in 1874 by the Methodist Church.' },
    { name: 'Hindu College Colombo',        slug: 'hindu-college-colombo',         institution_type: 'private-schools',       category: 'private-schools',       city: 'Colombo',    district: 'Colombo', description: 'A well-regarded school in Colombo catering primarily to the Hindu community.' },
    { name: 'Musaeus College Colombo',      slug: 'musaeus-college-colombo',       institution_type: 'private-schools',       category: 'private-schools',       city: 'Colombo',    district: 'Colombo', description: 'A leading Buddhist girls\' school in Colombo offering primary and secondary education.' },
    // National schools
    { name: 'Royal College Colombo',        slug: 'royal-college-colombo',         institution_type: '1AB',           category: 'national-schools',      city: 'Colombo',    district: 'Colombo', description: 'One of the most prestigious national schools in Sri Lanka with a history spanning over 175 years.' },
    // Universities
    { name: 'University of Peradeniya',     slug: 'university-of-peradeniya',      institution_type: 'Public',        category: 'universities',          city: 'Peradeniya', district: 'Kandy',   description: 'One of the largest and most prestigious national universities in Sri Lanka, founded in 1942.' },
    // Vocational
    { name: 'CIMA Sri Lanka',               slug: 'cima-sri-lanka',                institution_type: 'Professional',  category: 'vocational',             city: 'Colombo',    district: 'Colombo', description: 'The Chartered Institute of Management Accountants Sri Lanka division, offering globally recognised accountancy qualifications.' },
  ]

  for (const inst of seedInstitutions) {
    const { error } = await supabase
      .from('institutions')
      .upsert({ ...inst, is_active: true }, { onConflict: 'slug', ignoreDuplicates: false })
    results[`inst_${inst.slug}`] = error ? error.message : 'ok'
  }

  // Mark featured
  const featuredSlugs = [
    'informatics-institute-of-technology-iit',
    'elizabeth-moir-school',
    'royal-college-colombo',
    'ladies-college-colombo',
    'university-of-peradeniya',
    'cima-sri-lanka',
    'british-school-colombo',
    'overseas-school-of-colombo',
  ]
  for (const slug of featuredSlugs) {
    const { error } = await supabase
      .from('institutions')
      .update({ is_featured: true } as any)
      .eq('slug', slug)
    results[`feature_${slug}`] = error ? error.message : 'ok'
  }

  // Fix institution_type for existing seeded records
  const typeUpdates = [
    { slug: 'elizabeth-moir-school',        institution_type: 'International' },
    { slug: 'british-school-colombo',       institution_type: 'International' },
    { slug: 'overseas-school-of-colombo',   institution_type: 'International' },
    { slug: 'colombo-international-school', institution_type: 'International' },
    { slug: 'lyceum-international-school',  institution_type: 'International' },
    { slug: 'gateway-college-colombo',      institution_type: 'International' },
    { slug: 'ladies-college-colombo',       institution_type: 'private-schools' },
    { slug: 'wesley-college-colombo',       institution_type: 'private-schools' },
    { slug: 'hindu-college-colombo',        institution_type: 'private-schools' },
    { slug: 'musaeus-college-colombo',      institution_type: 'private-schools' },
    { slug: 'royal-college-colombo',        institution_type: '1AB' },
    { slug: 'university-of-peradeniya',     institution_type: 'Public' },
    { slug: 'cima-sri-lanka',               institution_type: 'Professional' },
  ]
  for (const upd of typeUpdates) {
    const { error } = await supabase
      .from('institutions')
      .update({ institution_type: upd.institution_type })
      .eq('slug', upd.slug)
    results[`type_${upd.slug}`] = error ? error.message : 'ok'
  }

  return NextResponse.json({ success: true, results })
}
