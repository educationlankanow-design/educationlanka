import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { institution_id, institution_name, message } = body

    if (!institution_name?.trim()) {
      return NextResponse.json({ error: 'institution_name is required' }, { status: 400 })
    }

    const admin = createAdminSupabase()
    const { error } = await admin.from('institution_claims').insert({
      user_id: user.id,
      institution_id: institution_id || null,
      institution_name: institution_name.trim(),
      org_email: user.email,
      message: message?.trim() || null,
      status: 'pending',
    })

    if (error) {
      console.error('institution_claims insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('portal claim exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
