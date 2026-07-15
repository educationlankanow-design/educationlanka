import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Education Lanka – Find Schools, Universities & Institutes in Sri Lanka',
  description: 'The most complete directory of educational institutions in Sri Lanka. Search schools, universities, international schools, vocational institutes and more.',
  keywords: 'schools sri lanka, universities sri lanka, international schools colombo, education directory',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
