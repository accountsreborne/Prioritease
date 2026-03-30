import { useRef, useState, useEffect } from 'react'

const SWIPE_THRESHOLD = 80
const ROTATION_FACTOR = 0.12

export default function SwipeCard({ task, onSwipeRight, onSwipeLeft, isTop, hasMore, peekOffset = 0 }) {
  const cardRef = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [flying, setFlying] = useState(null) // 'right' | 'left' | null

  const progress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1)
  const isDoneDir = drag.x > 0
  const rotation = drag.x * ROTATION_FACTOR
  const scale = 1
  const translateY = 0

  useEffect(() => {
    if (!flying) return
    const timer = setTimeout(() => {
      if (flying === 'right') onSwipeRight()
      else onSwipeLeft()
    }, 280)
    return () => clearTimeout(timer)
  }, [flying, onSwipeRight, onSwipeLeft])

  const handlePointerDown = (e) => {
    if (!isTop || flying) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startPos.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, active: true })
  }

  const handlePointerMove = (e) => {
    if (!drag.active || flying) return
    setDrag({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
      active: true
    })
  }

  const handlePointerUp = () => {
    if (!drag.active || flying) return
    if (drag.x > SWIPE_THRESHOLD) {
      setFlying('right')
      setDrag(d => ({ ...d, active: false }))
    } else if (drag.x < -SWIPE_THRESHOLD) {
      setFlying('left')
      setDrag(d => ({ ...d, active: false }))
    } else {
      setDrag({ x: 0, y: 0, active: false })
    }
  }

  const getCardTransform = () => {
    if (flying === 'right') return `translateX(120vw) rotate(30deg)`
    if (flying === 'left') return `translateX(-120vw) rotate(-30deg)`
    if (drag.active) return `translateX(${drag.x}px) translateY(${drag.y * 0.3}px) rotate(${rotation}deg)`
    return `translateX(0) translateY(${translateY}px) scale(${scale})`
  }

  const getTransition = () => {
    if (flying) return 'transform 0.28s cubic-bezier(0.55, 0, 1, 0.45)'
    if (drag.active) return 'none'
    return 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: peekOffset,
        transform: getCardTransform(),
        transition: getTransition(),
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 10,
        cursor: isTop ? (drag.active ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {/* Direction overlays — only for top card */}
      {isTop && drag.active && (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius)',
            background: `rgba(0, 255, 148, ${progress * 0.18})`,
            border: `1.5px solid rgba(0, 255, 148, ${progress * 0.6})`,
            opacity: isDoneDir ? 1 : 0,
            transition: 'opacity 0.1s',
            zIndex: 2,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius)',
            background: `rgba(255, 107, 53, ${progress * 0.18})`,
            border: `1.5px solid rgba(255, 107, 53, ${progress * 0.6})`,
            opacity: !isDoneDir ? 1 : 0,
            transition: 'opacity 0.1s',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Labels */}
          <div style={{
            position: 'absolute',
            top: 24,
            left: 24,
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--done-color)',
            color: 'var(--done-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.1em',
            opacity: isDoneDir ? Math.min(progress * 1.5, 1) : 0,
            transform: `rotate(-8deg)`,
            transition: 'opacity 0.1s',
            zIndex: 3,
            pointerEvents: 'none',
            textTransform: 'uppercase',
            boxShadow: `0 0 12px rgba(0,255,148,0.3)`
          }}>
            DONE
          </div>
          <div style={{
            position: 'absolute',
            top: 24,
            right: 24,
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--backlog-color)',
            color: 'var(--backlog-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.1em',
            opacity: !isDoneDir ? Math.min(progress * 1.5, 1) : 0,
            transform: `rotate(8deg)`,
            transition: 'opacity 0.1s',
            zIndex: 3,
            pointerEvents: 'none',
            textTransform: 'uppercase',
            boxShadow: `0 0 12px rgba(255,107,53,0.3)`
          }}>
            LATER
          </div>
        </>
      )}

      {/* Card body */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'var(--radius)',
        background: 'var(--bg-card)',
        border: `1px solid ${isTop ? 'var(--border)' : 'var(--border-subtle)'}`,
        boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          height: 1,
          background: isTop
            ? 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)'
            : 'transparent',
          flexShrink: 0
        }} />

        {/* Card content */}
        <div style={{ flex: 1, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          {/* Task ID / meta */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            TASK_{task.id.slice(0, 6).toUpperCase()}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em'
          }}>
            {task.title}
          </div>

          {/* Description */}
          {task.description && (
            <div style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical'
            }}>
              {task.description}
            </div>
          )}
        </div>

        {/* Links */}
        {task.links && task.links.length > 0 && (
          <div style={{
            padding: '0 24px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            pointerEvents: isTop && !drag.active ? 'auto' : 'none'
          }}>
            {task.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={e => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  color: 'var(--accent)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                <LinkIcon size={11} />
                {link.label || 'Link'}
              </a>
            ))}
          </div>
        )}

        {/* Bottom swipe hint — only top card, not dragging */}
        {isTop && !drag.active && (
          <div style={{
            padding: '0 24px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>←</span> LATER
            </div>
            <div style={{
              width: 28,
              height: 2,
              background: 'var(--border)',
              borderRadius: 1
            }} />
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              DONE <span>→</span>
            </div>
          </div>
        )}
      </div>
    </div>
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
