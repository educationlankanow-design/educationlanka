'use client'
import { useState } from 'react'

export default function RatingWidget({
  institutionId,
  institutionName,
}: {
  institutionId: string
  institutionName: string
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [review, setReview] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [expanded, setExpanded] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || !name) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId, reviewerName: name, reviewerEmail: email, rating, review }),
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
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '1.5px solid #6ee7b7',
        borderRadius: '1rem',
        padding: '1.25rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>&#x1F389;</div>
        <p style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>Thank you!</p>
        <p style={{ fontSize: '0.875rem', color: '#047857' }}>
          Your review is pending approval and will be published soon.
        </p>
      </div>
    )
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

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
        marginBottom: '0.875rem',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        &#x2B50; Rate this Institution
      </h3>

      {!expanded ? (
        <div>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => { setRating(star); setExpanded(true) }}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '1.75rem',
                  color: (hover || rating) >= star ? '#f59e0b' : '#d1d5db',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  transition: 'color 0.1s',
                }}
              >
                &#x2605;
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Click to rate {institutionName}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '1.75rem',
                  color: (hover || rating) >= star ? '#f59e0b' : '#d1d5db',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  transition: 'color 0.1s',
                }}
              >
                &#x2605;
              </button>
            ))}
            {rating > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {LABELS[rating]}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.875rem' }}>
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
              placeholder="Share your experience (optional)..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={3}
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
            <button
              type="submit"
              disabled={!rating || !name || status === 'submitting'}
              className="btn btn-primary"
              style={{ justifyContent: 'center', opacity: (!rating || !name) ? 0.5 : 1 }}
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Review'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Reviews are moderated before publishing.
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
