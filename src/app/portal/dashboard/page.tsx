'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [institution, setInstitution] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/portal'); return }
      setUser(user)

      const { data: iu } = await supabase
        .from('institution_users')
        .select('institution_id, institutions(*)')
        .eq('user_id', user.id)
        .single()

      if (iu?.institutions) {
        setInstitution(iu.institutions)
        const { data: inq } = await supabase
          .from('inquiries')
          .select('*')
          .eq('institution_id', (iu.institutions as any).id)
          .order('created_at', { ascending: false })
          .limit(50)
        setInquiries(inq || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/portal')
  }

  const markRead = async (id: string) => {
    await supabase.from('inquiries').update({ status: 'read' }).eq('id', id)
    setInquiries(inq => inq.map(i => i.id === id ? { ...i, status: 'read' } : i))
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin text-4xl text-[#1a3c6b]">O</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
          Sign out
        </button>
      </div>

      {!institution ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <p className="text-yellow-800 font-medium">No institution linked to your account yet.</p>
          <p className="text-yellow-600 text-sm mt-2">Please contact us at <a href="mailto:admin@educationlanka.com" className="underline">admin@educationlanka.com</a> to link your account to your institution listing.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{institution.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{[institution.city, institution.district].filter(Boolean).join(', ')}</p>
              </div>
              <Link href={`/institutions/${institution.slug}`}
                className="text-sm text-[#1a3c6b] hover:underline">View public listing &rarr;</Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Inquiries
                {inquiries.filter(i => i.status === 'new').length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {inquiries.filter(i => i.status === 'new').length} new
                  </span>
                )}
              </h2>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No inquiries yet. They will appear here when students submit the form on your listing.</p>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq: any) => (
                  <div key={inq.id}
                    className={`border rounded-xl p-4 ${inq.status === 'new' ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{inq.full_name}</span>
                          {inq.status === 'new' && (
                            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <a href={`mailto:${inq.email}`} className="hover:text-[#1a3c6b]">{inq.email}</a>
                          {inq.phone && <span>{inq.phone}</span>}
                        </div>
                        {inq.message && <p className="text-sm text-gray-600 mt-2">{inq.message}</p>}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(inq.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      {inq.status === 'new' && (
                        <button onClick={() => markRead(inq.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
