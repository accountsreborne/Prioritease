import { useState } from 'react'
import { useCalendar } from '../hooks/useCalendar'

export default function CalendarView({ activeTasks, onAddTask, onClose }) {
  const { connected, configured, connect, disconnect, events, syncing, error, fetchEvents, createEvent } = useCalendar()
  const [imported, setImported] = useState(new Set())
  const [pushed, setPushed] = useState(new Set())
  const [pushingId, setPushingId] = useState(null)

  async function handleImport(event) {
    await onAddTask({
      title: event.summary || '(No title)',
      description: event.description?.split('\n')[0] || null,
      links: event.htmlLink ? [{ label: 'View in Calendar', url: event.htmlLink }] : []
    })
    setImported(prev => new Set([...prev, event.id]))
  }

  async function handlePush(task) {
    setPushingId(task.id)
    const result = await createEvent(task)
    if (result) setPushed(prev => new Set([...prev, task.id]))
    setPushingId(null)
  }

  function formatEventTime(event) {
    if (event.start?.date) {
      const d = new Date(event.start.date + 'T12:00:00')
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
    const d = new Date(event.start?.dateTime)
    return (
      d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'var(--safe-top)',
      animation: 'fadeSlideIn 0.2s ease'
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <button onClick={onClose} style={{ color: 'var(--text-secondary)', display: 'flex', padding: 4, marginLeft: -4 }}>
          <BackIcon />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>
            Google Calendar
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Calendar Sync
          </div>
        </div>
        {connected && (
          <button
            onClick={() => fetchEvents()}
            disabled={syncing}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: syncing ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              cursor: syncing ? 'not-allowed' : 'pointer',
            }}
          >
            {syncing ? 'SYNCING…' : 'SYNC'}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Not configured */}
        {!configured && (
          <div style={{
            padding: 20,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 14,
            lineHeight: 1.7,
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>Setup required</div>
            Add{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 3 }}>
              VITE_GOOGLE_CLIENT_ID
            </code>
            {' '}to your{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 3 }}>
              .env
            </code>
            {' '}file to enable Google Calendar sync.
          </div>
        )}

        {/* Connect prompt */}
        {configured && !connected && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 40 }}>
            <CalIcon size={44} color="var(--text-muted)" />
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
              Connect your Google Calendar to pull upcoming events in as tasks and push tasks to your calendar.
            </div>
            <button
              onClick={connect}
              style={{
                padding: '12px 28px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 10,
                color: '#0a0a0f',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              Connect Google Calendar
            </button>
          </div>
        )}

        {/* Connected */}
        {connected && (
          <>
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: 8,
                color: '#ff6b6b',
                fontSize: 13,
                fontFamily: 'var(--font-mono)'
              }}>
                {error}
              </div>
            )}

            {/* Upcoming events → import as tasks */}
            <div>
              <SectionHeader title="Upcoming Events" color="var(--accent)" count={events.length} />
              {events.length === 0 && !syncing ? (
                <EmptyState text="No events in the next 14 days" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map(event => (
                    <div key={event.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          marginBottom: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {event.summary || '(No title)'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {formatEventTime(event)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleImport(event)}
                        disabled={imported.has(event.id)}
                        style={{
                          padding: '5px 10px',
                          background: imported.has(event.id) ? 'rgba(0,255,148,0.06)' : 'var(--bg-elevated)',
                          border: `1px solid ${imported.has(event.id) ? 'rgba(0,255,148,0.25)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          color: imported.has(event.id) ? 'var(--done-color)' : 'var(--text-secondary)',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.06em',
                          flexShrink: 0,
                          cursor: imported.has(event.id) ? 'default' : 'pointer',
                        }}
                      >
                        {imported.has(event.id) ? '✓ ADDED' : '+ TASK'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active tasks → push to calendar */}
            <div>
              <SectionHeader title="Push Tasks to Calendar" color="var(--backlog-color)" count={activeTasks.length} />
              {activeTasks.length === 0 ? (
                <EmptyState text="No active tasks to push" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeTasks.map(task => (
                    <div key={task.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            marginTop: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handlePush(task)}
                        disabled={pushed.has(task.id) || pushingId === task.id}
                        style={{
                          padding: '5px 10px',
                          background: pushed.has(task.id) ? 'rgba(0,255,148,0.06)' : 'var(--bg-elevated)',
                          border: `1px solid ${pushed.has(task.id) ? 'rgba(0,255,148,0.25)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          color: pushed.has(task.id) ? 'var(--done-color)' : pushingId === task.id ? 'var(--text-muted)' : 'var(--text-secondary)',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.06em',
                          flexShrink: 0,
                          cursor: pushed.has(task.id) || pushingId === task.id ? 'default' : 'pointer',
                        }}
                      >
                        {pushed.has(task.id) ? '✓ SENT' : pushingId === task.id ? '…' : '→ CAL'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disconnect */}
            <div style={{ paddingBottom: 8 }}>
              <button
                onClick={disconnect}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                DISCONNECT GOOGLE CALENDAR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, color, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {count}
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{
      padding: 16,
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 14,
      fontFamily: 'var(--font-mono)',
      border: '1px dashed var(--border-subtle)',
      borderRadius: 'var(--radius-sm)'
    }}>
      {text}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function CalIcon({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
