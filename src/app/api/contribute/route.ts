import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const { institutionId, contributorName, contributorEmail, contributionType, content } = await req.json()
    if (!institutionId || !contributorName?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'institutionId, contributorName and content are required' }, { status: 400 })
    }
    const { error } = await adminClient().from('contributions').insert({
      institution_id: institutionId,
      contributor_name: contributorName.trim(),
      contributor_email: contributorEmail?.trim() || null,
      contribution_type: contributionType || 'general',
      content: content.trim(),
      status: 'pending',
    })
    if (error) { console.error(error); return NextResponse.json({ error: error.message }, { status: 500 }) }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
