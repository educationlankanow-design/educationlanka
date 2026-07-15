'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Props {
  institutionId: string
  institutionName: string
  courses: { id: string; name: string }[]
}

export default function InquiryForm({ institutionId, institutionName, courses }: Props) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', course_id: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) = >{
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.from('inquiries').insert({
      institution_id: institutionId,
      course_id: form.course_id || null,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
    })
    setStatus(error ? 'error' : 'success')
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-gray-800">Inquiry sent!</p>
        <p className="text-sm text-gray-500 mt-1">{institutionName} will be in touch with you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        type="text"
        placeholder="Your full name *"
        value={form.full_name}
        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c6b]"
      />
      <input
        required
        type="email"
        placeholder="Email address *"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c6b]"
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c6b]"
      />
      {courses.length > 0 && (
        <select
          value={form.course_id}
          onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c6b] text-gray-600"
        >
          <option value="">Select a course (optional)</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <textarea
        rows={3}
        placeholder="Your message or question…"
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c6b] resize-none"
      />
      {status === 'error' && (
        <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#1a3c6b] hover:bg-[#152f56] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  )
}
