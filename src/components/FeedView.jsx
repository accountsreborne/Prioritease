import { useRef, useState } from 'react'

const SWIPE_THRESHOLD = 72

export default function FeedView({
  title, label, color, colorDim,
  tasks,
  rightLabel, onSwipeRight,   // advance in pipeline
  leftLabel, onSwipeLeft,     // retreat in pipeline
  onClose,
  emptyText
}) {
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
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 1,
            opacity: 0.9
          }}>
            {label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {title}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          fontWeight: 700,
          color,
          letterSpacing: '-0.04em',
          textShadow: `0 0 24px ${colorDim}`
        }}>
          {tasks.length}
        </div>
      </div>

      {/* Swipe hint */}
      {tasks.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 20px 4px',
          flexShrink: 0
        }}>
          {leftLabel ? (
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              ← {leftLabel}
            </div>
          ) : <div />}
          {rightLabel ? (
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {rightLabel} →
            </div>
          ) : <div />}
        </div>
      )}

      {/* Feed */}
      {tasks.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: 'var(--text-muted)'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <InboxIcon />
          </div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            {emptyText}
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 20px',
          paddingBottom: 'calc(80px + var(--safe-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {tasks.map(task => (
            <SwipeFeedCard
              key={task.id}
              task={task}
              color={color}
              colorDim={colorDim}
              rightLabel={rightLabel}
              onSwipeRight={onSwipeRight ? () => onSwipeRight(task.id) : null}
              leftLabel={leftLabel}
              onSwipeLeft={onSwipeLeft ? () => onSwipeLeft(task.id) : null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SwipeFeedCard({ task, color, colorDim, rightLabel, onSwipeRight, leftLabel, onSwipeLeft }) {
  const startPos = useRef({ x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, active: false })
  const [dismissed, setDismissed] = useState(false)
  const [flying, setFlying] = useState(null) // 'right' | 'left'

  const progress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1)
  const isRight = drag.x > 0

  if (dismissed) return null

  const handlePointerDown = (e) => {
    if (flying) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startPos.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, active: true })
  }

  const handlePointerMove = (e) => {
    if (!drag.active || flying) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    // Only activate horizontal swipe if clearly horizontal
    if (!drag.started && Math.abs(dy) > Math.abs(dx)) {
      setDrag({ x: 0, active: false })
      return
    }
    setDrag({ x: dx, active: true, started: true })
  }

  const handlePointerUp = () => {
    if (!drag.active || flying) return
    if (drag.x > SWIPE_THRESHOLD && onSwipeRight) {
      setFlying('right')
      setDrag(d => ({ ...d, active: false }))
      setTimeout(() => { onSwipeRight(); setDismissed(true) }, 260)
    } else if (drag.x < -SWIPE_THRESHOLD && onSwipeLeft) {
      setFlying('left')
      setDrag(d => ({ ...d, active: false }))
      setTimeout(() => { onSwipeLeft(); setDismissed(true) }, 260)
    } else {
      setDrag({ x: 0, active: false })
    }
  }

  const transform = flying === 'right'
    ? 'translateX(110vw)'
    : flying === 'left'
      ? 'translateX(-110vw)'
      : drag.active
        ? `translateX(${drag.x}px)`
        : 'translateX(0)'

  const transition = flying
    ? 'transform 0.26s cubic-bezier(0.55,0,1,0.45), opacity 0.26s'
    : drag.active
      ? 'none'
      : 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'

  const timeAgo = getTimeAgo(task.resolvedAt || task.createdAt)

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        transform,
        transition,
        opacity: flying ? 0 : 1,
        touchAction: 'pan-y',
        userSelect: 'none',
        cursor: drag.active ? 'grabbing' : 'grab',
      }}
    >
      {/* Directional overlays */}
      {drag.active && drag.started && (
        <>
          {onSwipeRight && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-sm)',
              background: `rgba(0,255,148,${progress * 0.15})`,
              border: `1.5px solid rgba(0,255,148,${progress * 0.5})`,
              opacity: isRight ? 1 : 0,
              zIndex: 2,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--done-color)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                opacity: progress
              }}>
                {rightLabel} →
              </span>
            </div>
          )}
          {onSwipeLeft && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-sm)',
              background: `rgba(124,58,237,${progress * 0.15})`,
              border: `1.5px solid rgba(124,58,237,${progress * 0.5})`,
              opacity: !isRight ? 1 : 0,
              zIndex: 2,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0 16px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--violet)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                opacity: progress
              }}>
                ← {leftLabel}
              </span>
            </div>
          )}
        </>
      )}

      {/* Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        padding: '14px 14px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.02), -2px 0 12px ${colorDim}`
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {timeAgo}
              </div>
              {task.priority && task.priority !== 'p1' && (
                <FeedPriorityBadge priority={task.priority} />
              )}
            </div>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              marginBottom: task.description ? 5 : 0
            }}>
              {task.title}
            </div>
            {task.description && (
              <div style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {task.description}
              </div>
            )}
          </div>
        </div>

        {task.links?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {task.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={e => e.stopPropagation()}
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--accent-dim)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  border: '1px solid rgba(0,212,255,0.15)'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {task.startTime && (
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {formatSchedule(task.startTime, task.endTime)}
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - (typeof ts === 'number' ? ts : new Date(ts).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function formatSchedule(start, end) {
  const s = new Date(start)
  const dateStr = s.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = s.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
  if (!end) return `${dateStr} · ${timeStr}`
  const endStr = new Date(end).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
  return `${dateStr} · ${timeStr} – ${endStr}`
}

const FEED_PRIORITY_COLORS = { p0: '#ff4757', p1: '#ffa502', p2: 'var(--text-muted)' }

function FeedPriorityBadge({ priority }) {
  const color = FEED_PRIORITY_COLORS[priority] || 'var(--text-muted)'
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      color,
      background: `${color}18`,
      border: `1px solid ${color}55`,
      borderRadius: 3,
      padding: '1px 6px',
      letterSpacing: '0.06em',
    }}>
      {priority.toUpperCase()}
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

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}
