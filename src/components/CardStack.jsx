import { useState, useCallback } from 'react'
import SwipeCard from './SwipeCard'

const VISIBLE_CARDS = 3

export default function CardStack({ tasks, onDone, onBacklog }) {
  const [dismissed, setDismissed] = useState(new Set())

  const visibleTasks = tasks.filter(t => !dismissed.has(t.id))

  const handleDone = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]))
    onDone(id)
  }, [onDone])

  const handleBacklog = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]))
    onBacklog(id)
  }, [onBacklog])

  if (visibleTasks.length === 0) {
    return <EmptyState />
  }

  const displayTasks = visibleTasks.slice(0, VISIBLE_CARDS)

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 20px',
      overflow: 'visible'
    }}>
      {/* Count indicator */}
      <div style={{
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em'
      }}>
        {visibleTasks.length} IN PROGRESS
      </div>

      {/* Card stack area */}
      <div style={{
        position: 'relative',
        flex: 1,
        marginBottom: 28,
      }}>
        {/* Peek cards behind — only render if there are more */}
        {visibleTasks.length > 2 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 10,
            right: 10,
            height: 20,
            borderRadius: 'var(--radius)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            zIndex: 1
          }} />
        )}
        {visibleTasks.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 5,
            right: 5,
            height: 20,
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            zIndex: 2
          }} />
        )}

        {/* Main swipe card — leaves 18px at bottom for peeks to show */}
        {visibleTasks.slice(0, 1).map((task) => (
          <SwipeCard
            key={task.id}
            task={task}
            isTop={true}
            hasMore={visibleTasks.length > 1}
            peekOffset={visibleTasks.length > 1 ? 18 : 0}
            onSwipeRight={() => handleDone(task.id)}
            onSwipeLeft={() => handleBacklog(task.id)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <ActionButtons
        onLeft={() => visibleTasks[0] && handleBacklog(visibleTasks[0].id)}
        onRight={() => visibleTasks[0] && handleDone(visibleTasks[0].id)}
      />
    </div>
  )
}

function ActionButtons({ onLeft, onRight }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 40,
      paddingBottom: 8
    }}>
      <button
        onClick={onLeft}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--backlog-color)',
          color: 'var(--backlog-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(255,107,53,0.2), 0 4px 12px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          fontSize: 22
        }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <ClockIcon />
      </button>
      <button
        onClick={onRight}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--done-color)',
          color: 'var(--done-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(0,255,148,0.2), 0 4px 12px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <CheckIcon />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '0 32px'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        <CheckIcon size={28} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          All clear
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          No tasks in progress. Add a new task or restore something from your backlog.
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ClockIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
