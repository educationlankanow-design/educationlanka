'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-[#1a3c6b] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            Education<span className="text-orange-400">Lanka</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/institutions" className="hover:text-orange-300 transition-colors">Browse</Link>
          <Link href="/institutions?category=universities" className="hover:text-orange-300 transition-colors">Universities</Link>
          <Link href="/institutions?category=international-schools" className="hover:text-orange-300 transition-colors">Int'l Schools</Link>
          <Link href="/institutions?category=vocational" className="hover:text-orange-300 transition-colors">Vocational</Link>
          <Link href="/portal" className="bg-orange-500 hover:bg-orange-400 px-4 py-1.5 rounded-full transition-colors">
            Institution Login
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-[#152f56] px-4 py-3 space-y-2 text-sm">
          <Link href="/institutions" className="block py-1" onClick={() => setOpen(false)}>Browse All</Link>
          <Link href="/institutions?category=universities" className="block py-1" onClick={() => setOpen(false)}>Universities</Link>
          <Link href="/institutions?category=international-schools" className="block py-1" onClick={() => setOpen(false)}>Int'l Schools</Link>
          <Link href="/institutions?category=vocational" className="block py-1" onClick={() => setOpen(false)}>Vocational</Link>
          <Link href="/portal" className="block py-1 text-orange-400" onClick={() => setOpen(false)}>Institution Login</Link>
        </div>
      )}
    </header>
  )
}
