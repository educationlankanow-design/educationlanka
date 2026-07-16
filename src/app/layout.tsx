import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EducationLanka',
  description: "Sri Lanka's comprehensive education guide",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
