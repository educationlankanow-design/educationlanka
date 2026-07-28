'use client'
import { useState } from 'react'

const CONTRIBUTION_TYPES = [
  { value: 'program', label: 'Missing Programme' },
  { value: 'entry_requirements', label: 'Entry Requirements' },
  { value: 'contact', label: 'Contact Information' },
  { value: 'description', label: 'Institution Description' },
  { value: 'facilities', label: 'Facilities & Campus' },
  { value: 'fees', label: 'Fees & Scholarships' },
  { value: 'other', label: 'Other Information' },
]

export default function ContributeWidget({
  institutionId,
  institutionName,
}: {
  institutionId: string
  institutionName: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('program')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !content) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId,
          contributorName: name,
          contributorEmail: email,
          contributionType: type,
          content,
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    border: '1.5px solid var(--color-border)',
    fontSize: '0.875rem',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  if (status === 'done') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: '1.5px solid #93c5fd',
        borderRadius: '1rem',
        padding: '1.25rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>&#x1F4DD;</div>
        <p style={{ fontWeight: 700, color: '#1e40af', marginBottom: '0.25rem' }}>Contribution Received!</p>
        <p style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>
          Thank you for helping improve {institutionName}&apos;s listing. Our team will review it shortly.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: '1rem',
      border: '1.5px solid var(--color-border)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        &#x1F4DD; Contribute Info
      </h3>

      {!expanded ? (
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
            Know something about this institution? Help others by adding missing details.
          </p>
          <button
            onClick={() => setExpanded(true)}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem' }}
          >
            + Add Missing Info
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={inputStyle}
            >
              {CONTRIBUTION_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Your Email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder={`Describe the ${CONTRIBUTION_TYPES.find(t => t.value === type)?.label.toLowerCase() || 'information'}...`}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            {status === 'error' && (
              <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>
                Something went wrong. Please try again.
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name || !content || status === 'submitting'}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: 'center', fontSize: '0.875rem', opacity: (!name || !content) ? 0.5 : 1 }}
              >
                {status === 'submitting' ? 'Sending...' : 'Submit'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              All contributions are reviewed before publishing.
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
