import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createServerSupabase()
  const { error } = await supabase.from('inquiries').insert({
    ...body,
    ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
