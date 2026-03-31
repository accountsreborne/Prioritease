import { useState } from 'react'
import { supabase } from '../supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      paddingTop: 'var(--safe-top)',
      paddingBottom: 'var(--safe-bottom)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--accent)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 8,
        opacity: 0.8,
      }}>
        TaskSwipe
      </div>

      <div style={{
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: 'var(--text-primary)',
        marginBottom: 32,
      }}>
        Sign in
      </div>

      {sent ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 15,
          lineHeight: 1.6,
          maxWidth: 300,
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>✉️</div>
          Check your email — we sent a magic link to{' '}
          <span style={{ color: 'var(--accent)' }}>{email}</span>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />

          {error && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 13,
              marginBottom: 12,
              fontFamily: 'var(--font-mono)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || !email ? 'var(--bg-elevated)' : 'var(--accent)',
              color: loading || !email ? 'var(--text-muted)' : '#0a0a0f',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {loading ? 'Sending…' : 'Merlin will message you'}
          </button>
        </form>
      )}
    </div>
  )
}
