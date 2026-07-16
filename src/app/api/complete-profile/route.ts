import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id, full_name, email, phone,
      current_school, current_grade, target_level,
      subjects, bio
    } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    const { error } = await supabase
      .from('students')
      .upsert({
        user_id,
        full_name: full_name || null,
        email: email || null,
        phone: phone || null,
        current_school: current_school || null,
        current_grade: current_grade || null,
        target_level: target_level || null,
        subjects: subjects || [],
        bio: bio || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('complete-profile error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('complete-profile exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
