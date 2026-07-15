import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

const CATEGORIES = [
  { slug: 'universities',          name: 'Universities' },
  { slug: 'institutes',            name: 'Institutes' },
  { slug: 'international-schools', name: "Int'l Schools" },
  { slug: 'national-schools',      name: 'National Schools' },
  { slug: 'private-schools',       name: 'Private Schools' },
  { slug: 'vocational',            name: 'Vocational' },
]

const PROVINCES = ['Western','Central','Southern','Northern','Eastern','North Western','North Central','Uva','Sabaragamuwa']

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; province?: string; district?: string; page?: string }>
}) {
  const { q, category, province, district, page } = await searchParams
  const supabase = await createServerSupabase()
  const pageNum = parseInt(page || '1')
  const pageSize = 24
  const offset = (pageNum - 1) * pageSize

  let query = supabase
    .from('institutions')
    .select('id,name,slug,city,district,province,phone,website,institution_type,category_id,categories(name,slug)', { count: 'exact' })
    .eq('is_active', true)
    .order('name')
    .range(offset, offset + pageSize - 1)

  if (q) query = query.ilike('name', `%${q}%`)
  if (province) query = query.eq('province', province)
  if (district) query = query.eq('district', district)
  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data: institutions, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  const buildUrl = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { q, category, province, district, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/institutions?${p.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search + filters header */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form action="/institutions" className="flex-1 flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          {province && <input type="hidden" name="province" value={province} />}
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Search institutions…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c6b] text-sm"
          />
          <button type="submit" className="bg-[#1a3c6b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152f56] transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
              <ul className="space-y-1">
                <li>
                  <Link href={buildUrl({ category: undefined, page: undefined })}
                    className={`block text-sm px-2 py-1 rounded-lg ${!category ? 'bg-[#1a3c6b] text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                    All Categories
                  </Link>
                </li>
                {CATEGORIES.map(c => (
                  <li key={c.slug}>
                    <Link href={buildUrl({ category: c.slug, page: undefined })}
                      className={`block text-sm px-2 py-1 rounded-lg ${category === c.slug ? 'bg-[#1a3c6b] text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Province</h3>
              <ul className="space-y-1">
                <li>
                  <Link href={buildUrl({ province: undefined, page: undefined })}
                    className={`block text-sm px-2 py-1 rounded-lg ${!province ? 'bg-blue-50 text-[#1a3c6b] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                    All Provinces
                  </Link>
                </li>
                {PROVINCES.map(p => (
                  <li key={p}>
                    <Link href={buildUrl({ province: p, page: undefined })}
                      className={`block text-sm px-2 py-1 rounded-lg ${province === p ? 'bg-blue-50 text-[#1a3c6b] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {count?.toLocaleString() ?? 0} institutions found
              {q && <> for &ldquo;<strong>{q}</strong>&rdquo;</>}
              {category && <> in <strong>{CATEGORIES.find(c => c.slug === category)?.name}</strong></>}
              {province && <> · <strong>{province} Province</strong></>}
            </p>
          </div>

          {institutions && institutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {institutions.map((inst: any) => (
                <Link
                  key={inst.id}
                  href={`/institutions/${inst.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1a3c6b] text-sm leading-tight">{inst.name}</h3>
                  </div>
                  {inst.categories && (
                    <span className="inline-block text-xs bg-blue-50 text-[#1a3c6b] px-2 py-0.5 rounded-full mb-2">
                      {(inst.categories as any).name}
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    📍 {[inst.city, inst.district, inst.province].filter(Boolean).join(', ')}
                  </p>
                  {inst.phone && <p className="text-xs text-gray-400 mt-1">📞 {inst.phone}</p>}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">No institutions found</p>
              <p className="text-sm">Try a different search or filter</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {pageNum > 1 && (
                <Link href={buildUrl({ page: String(pageNum - 1) })}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">← Prev</Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-600">Page {pageNum} of {totalPages}</span>
              {pageNum < totalPages && (
                <Link href={buildUrl({ page: String(pageNum + 1) })}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Next →</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
