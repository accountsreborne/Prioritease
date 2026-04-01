import { useState, useRef } from 'react'
import { supabase } from '../supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const inputRefs = useRef([])

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
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }

  async function handleVerify() {
    const token = code.join('')
    if (token.length < 8) return
    setVerifying(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'email',
    })

    setVerifying(false)
    if (error) setError(error.message)
  }

  function handleCodeChange(i, val) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 7) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) {
      // Auto-verify when all 8 digits entered
      setTimeout(() => {
        const token = next.join('')
        setVerifying(true)
        setError(null)
        supabase.auth.verifyOtp({ email: email.trim(), token, type: 'email' })
          .then(({ error }) => {
            setVerifying(false)
            if (error) setError(error.message)
          })
      }, 100)
    }
  }

  function handleCodeKeyDown(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (pasted.length === 8) {
      setCode(pasted.split(''))
      inputRefs.current[7]?.focus()
    }
  }

  const inputStyle = {
    width: 36,
    height: 48,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 24,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    caretColor: 'var(--accent)',
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
            {loading ? 'Sending…' : 'Merlin will message you'}
          </button>
        </form>
      ) : (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
            Enter the 6-digit code sent to{' '}
            <span style={{ color: 'var(--accent)' }}>{email}</span>
          </div>

          {/* Code inputs */}
          <div style={{ display: 'flex', gap: 8 }} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(i, e)}
                style={{
                  ...inputStyle,
                  borderColor: digit ? 'rgba(0,212,255,0.4)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying || code.join('').length < 8}
            style={{
              width: '100%',
              padding: '12px',
              background: verifying || code.join('').length < 8 ? 'var(--bg-elevated)' : 'var(--accent)',
              color: verifying || code.join('').length < 8 ? 'var(--text-muted)' : '#0a0a0f',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              cursor: verifying || code.join('').length < 8 ? 'not-allowed' : 'pointer',
            }}
          >
            {verifying ? 'Verifying…' : 'Sign in'}
          </button>

          <button
            onClick={() => { setSent(false); setCode(['', '', '', '', '', '']); setError(null) }}
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
