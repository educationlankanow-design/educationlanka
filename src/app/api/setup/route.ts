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

  // DML: seed missing featured institutions
  const seedInstitutions = [
    { name: 'Elizabeth Moir School',  slug: 'elizabeth-moir-school',  type: 'international-schools', city: 'Colombo', district: 'Colombo' },
    { name: 'Royal College Colombo',  slug: 'royal-college-colombo',  type: 'national-schools',      city: 'Colombo', district: 'Colombo' },
    { name: 'Ladies College Colombo', slug: 'ladies-college-colombo', type: 'private-schools',        city: 'Colombo', district: 'Colombo' },
    { name: 'CIMA Sri Lanka',         slug: 'cima-sri-lanka',         type: 'vocational',             city: 'Colombo', district: 'Colombo' },
    { name: 'University of Peradeniya', slug: 'university-of-peradeniya', type: 'universities',      city: 'Peradeniya', district: 'Kandy' },
  ]

  for (const inst of seedInstitutions) {
    const { error } = await supabase
      .from('institutions')
      .upsert({ ...inst }, { onConflict: 'slug', ignoreDuplicates: true })
    results[`seed_${inst.slug}`] = error ? error.message : 'ok'
  }

  // Mark featured
  const featuredSlugs = [
    'informatics-institute-of-technology-iit',
    'elizabeth-moir-school',
    'royal-college-colombo',
    'ladies-college-colombo',
    'university-of-peradeniya',
    'cima-sri-lanka',
  ]
  for (const slug of featuredSlugs) {
    const { error } = await supabase
      .from('institutions')
      .update({ is_featured: true } as any)
      .eq('slug', slug)
    results[`feature_${slug}`] = error ? error.message : 'ok'
  }

  return NextResponse.json({ success: true, results })
}
