import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1a3c6b] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Education<span className="text-orange-400">Lanka</span></h3>
          <p className="text-sm text-blue-200">Sri Lanka's most complete education directory - find schools, universities and institutes island-wide.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-orange-300">Browse</h4>
          <ul className="space-y-1 text-sm text-blue-200">
            <li><Link href="/institutions?category=universities" className="hover:text-white">Universities</Link></li>
            <li><Link href="/institutions?category=institutes" className="hover:text-white">Degree Institutes</Link></li>
            <li><Link href="/institutions?category=international-schools" className="hover:text-white">International Schools</Link></li>
            <li><Link href="/institutions?category=national-schools" className="hover:text-white">National Schools</Link></li>
            <li><Link href="/institutions?category=vocational" className="hover:text-white">Vocational</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-orange-300">Provinces</h4>
          <ul className="space-y-1 text-sm text-blue-200">
            {['Western','Central','Southern','Northern','Eastern','North Western','North Central','Uva','Sabaragamuwa'].map(p => (
              <li key={p}><Link href={`/institutions?province=${encodeURIComponent(p)}`} className="hover:text-white">{p}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-orange-300">Institution Portal</h4>
          <p className="text-sm text-blue-200 mb-3">Manage your listing, update details, and receive student inquiries.</p>
          <Link href="/portal" className="inline-block bg-orange-500 hover:bg-orange-400 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Login / Register
          </Link>
        </div>
      </div>
      <div className="border-t border-blue-800 text-center text-xs text-blue-300 py-4">
        (c) {new Date().getFullYear()} EducationLanka.com - All rights reserved
      </div>
    </footer>
  )
}
