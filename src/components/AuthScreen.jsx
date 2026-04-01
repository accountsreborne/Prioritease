import { useState, useRef } from 'react'
import { supabase } from '../supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const codeRef = useRef(null)

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
      setError(error.message || error.msg || JSON.stringify(error))
    } else {
      setSent(true)
      setTimeout(() => codeRef.current?.focus(), 100)
    }
  }

  async function handleVerify() {
    if (code.length < 6) return
    setVerifying(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'email',
    })

    setVerifying(false)
    if (error) setError(error.message)
  }

  function handleCodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 8)
    setCode(val)
    if (val.length >= 6) {
      setTimeout(() => {
        setVerifying(true)
        setError(null)
        supabase.auth.verifyOtp({ email: email.trim(), token: val, type: 'email' })
          .then(({ error }) => {
            setVerifying(false)
            if (error) setError(error.message)
          })
      }, 100)
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
        Pluto
      </div>

      <div style={{
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: 'var(--text-primary)',
        marginBottom: 32,
      }}>
        {sent ? 'Check your email' : 'Sign in'}
      </div>

      {!sent ? (
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
            <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
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
            {loading ? 'Sending…' : 'Pluto code'}
          </button>
        </form>
      ) : (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
            Enter the code sent to{' '}
            <span style={{ color: 'var(--accent)' }}>{email}</span>
          </div>

          {/* Single code input */}
          <input
            ref={codeRef}
            type="text"
            inputMode="numeric"
            placeholder="Enter code"
            value={code}
            onChange={handleCodeChange}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--bg-elevated)',
              border: `1px solid ${code.length > 0 ? 'rgba(0,212,255,0.4)' : 'var(--border)'}`,
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: 28,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.2em',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying || code.length < 6}
            style={{
              width: '100%',
              padding: '12px',
              background: verifying || code.length < 6 ? 'var(--bg-elevated)' : 'var(--accent)',
              color: verifying || code.length < 6 ? 'var(--text-muted)' : '#0a0a0f',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              cursor: verifying || code.length < 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {verifying ? 'Verifying…' : 'Sign in'}
          </button>

          <button
            onClick={() => { setSent(false); setCode(''); setError(null) }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            ← use a different email
          </button>
        </div>
      )}
    </div>
  )
}
