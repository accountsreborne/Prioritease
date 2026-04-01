import { useState } from 'react'

export default function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [links, setLinks] = useState([])
  const [linkInput, setLinkInput] = useState({ label: '', url: '' })
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState('active')

  const addLink = () => {
    if (!linkInput.url.trim()) return
    const url = linkInput.url.trim()
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    setLinks(prev => [...prev, { label: linkInput.label.trim() || 'Link', url: fullUrl }])
    setLinkInput({ label: '', url: '' })
    setShowLinkForm(false)
  }

  const removeLink = (i) => setLinks(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    let startISO = null
    let endISO = null
    if (date) {
      startISO = new Date(`${date}T${startTime || '00:00'}`).toISOString()
      if (endTime) endISO = new Date(`${date}T${endTime}`).toISOString()
    }
    onAdd({ title, description, links, startTime: startISO, endTime: endISO, status })
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 100,
        backdropFilter: 'blur(4px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          paddingBottom: 'calc(var(--safe-bottom) + 24px)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06)',
          animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px 20px'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--accent)',
              letterSpacing: '0.1em',
              marginBottom: 4,
              textTransform: 'uppercase'
            }}>
              New Task
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
              Add to queue
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Title *
            </label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                color: 'var(--text-primary)',
                fontSize: 16,
                width: '100%',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                color: 'var(--text-primary)',
                fontSize: 15,
                width: '100%',
                resize: 'none',
                lineHeight: 1.5,
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Links
            </label>

            {links.map((link, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--accent-dim)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <LinkIcon size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.label} — {link.url}
                </span>
                <button type="button" onClick={() => removeLink(i)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}

            {showLinkForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <input
                  value={linkInput.label}
                  onChange={e => setLinkInput(l => ({ ...l, label: e.target.value }))}
                  placeholder="Label (e.g. Figma)"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    width: '100%'
                  }}
                />
                <input
                  value={linkInput.url}
                  onChange={e => setLinkInput(l => ({ ...l, url: e.target.value }))}
                  placeholder="URL"
                  type="url"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    width: '100%'
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={addLink} style={{
                    flex: 1,
                    padding: '8px',
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent)',
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowLinkForm(false); setLinkInput({ label: '', url: '' }) }} style={{
                    padding: '8px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: 13
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  transition: 'border-color 0.15s, color 0.15s'
                }}
              >
                <PlusIcon size={14} /> Add link
              </button>
            )}
          </div>

          {/* Schedule */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Schedule <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); if (!e.target.value) { setStartTime(''); setEndTime('') } }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: date ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 15,
                width: '100%',
                colorScheme: 'dark'
              }}
            />
            {date && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>START</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: 15,
                      width: '100%',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>END</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: 15,
                      width: '100%',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Add to
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'active', label: 'In Progress', color: 'var(--accent)' },
                { value: 'planning', label: 'Planning', color: 'var(--violet)' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    background: status === opt.value ? `${opt.color}18` : 'var(--bg-surface)',
                    border: `1px solid ${status === opt.value ? opt.color + '55' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: status === opt.value ? opt.color : 'var(--text-secondary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim()}
            style={{
              padding: '14px',
              background: title.trim() ? 'var(--accent)' : 'var(--bg-surface)',
              border: '1px solid',
              borderColor: title.trim() ? 'var(--accent)' : 'var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: title.trim() ? '#0a0a0f' : 'var(--text-muted)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              marginTop: 4,
              boxShadow: title.trim() ? '0 0 20px rgba(0,212,255,0.3)' : 'none'
            }}
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  )
}

function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function LinkIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function PlusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
