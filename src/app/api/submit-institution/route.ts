import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { submitterName, submitterEmail, institutionName, institutionType, city, district, website, phone, email, description, programs } = body
    if (!submitterName?.trim() || !submitterEmail?.trim() || !institutionName?.trim()) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }
    const { error } = await adminClient().from('institution_submissions').insert({
      submitter_name: submitterName.trim(),
      submitter_email: submitterEmail.trim(),
      institution_name: institutionName.trim(),
      institution_type: institutionType || null,
      city: city || null,
      district: district || null,
      website: website || null,
      phone: phone || null,
      email: email || null,
      description: description || null,
      programs: programs || null,
      status: 'pending',
    })
    if (error) { console.error(error); return NextResponse.json({ error: error.message }, { status: 500 }) }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
