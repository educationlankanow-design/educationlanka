import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

const CATEGORIES = [
  { slug: 'universities',          name: 'Universities',              icon: '🎓', color: 'bg-blue-600' },
  { slug: 'institutes',            name: 'Degree Institutes',         icon: '🏛️', color: 'bg-emerald-600' },
  { slug: 'international-schools', name: 'International Schools',     icon: '🌍', color: 'bg-purple-600' },
  { slug: 'national-schools',      name: 'National Schools',          icon: '🏫', color: 'bg-orange-600' },
  { slug: 'private-schools',       name: 'Private Schools',           icon: '📚', color: 'bg-red-700' },
  { slug: 'vocational',            name: 'Vocational & Professional', icon: '🔧', color: 'bg-indigo-600' },
]

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createServerSupabase()

  // Stats
  const { count: totalCount } = await supabase.from('institutions').select('*', { count: 'exact', head: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0b2545] via-[#1a3c6b] to-[#2a5298] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Find the Right Education in<br />
            <span className="text-orange-400">Sri Lanka</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            {totalCount?.toLocaleString() ?? '500+'} schools, universities & institutes — all in one place
          </p>

          <form action="/institutions" className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Search by name, city or district…"
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/institutions?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`${cat.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#1a3c6b]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Province */}
      <section className="bg-white py-12 px-4 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Province</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Western','Central','Southern','Northern','Eastern','North Western','North Central','Uva','Sabaragamuwa'].map(p => (
              <Link
                key={p}
                href={`/institutions?province=${encodeURIComponent(p)}`}
                className="px-5 py-2 rounded-full border border-[#1a3c6b] text-[#1a3c6b] text-sm font-medium hover:bg-[#1a3c6b] hover:text-white transition-colors"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Institution CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-[#1a3c6b] to-[#2a5298] text-white rounded-3xl p-10">
          <h2 className="text-2xl font-bold mb-3">Are you an educational institution?</h2>
          <p className="text-blue-200 mb-6">Claim your listing to manage your profile, add courses, and receive student inquiries directly.</p>
          <Link href="/portal" className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            Claim Your Listing →
          </Link>
        </div>
      </section>
    </div>
  )
}
