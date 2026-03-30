export default function CompletedView({ doneTasks, onRestore, onClose }) {
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
        borderBottom: '1px solid var(--border)'
      }}>
        <button onClick={onClose} style={{ color: 'var(--text-secondary)', display: 'flex', padding: 4, marginLeft: -4 }}>
          <BackIcon />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--done-color)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>
            Completed
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Done
          </div>
        </div>
        {/* Big counter */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--done-color)',
          letterSpacing: '-0.04em',
          textShadow: '0 0 24px rgba(0,255,148,0.4)'
        }}>
          {doneTasks.length}
        </div>
      </div>

      {doneTasks.length === 0 ? (
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
            <CheckIcon size={24} />
          </div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            Nothing completed yet
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {doneTasks.map(task => (
            <DoneRow key={task.id} task={task} onRestore={onRestore} />
          ))}
        </div>
      )}
    </div>
  )
}

function DoneRow({ task, onRestore }) {
  const time = task.resolvedAt
    ? new Date(task.resolvedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '14px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      opacity: 0.85
    }}>
      {/* Check mark */}
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--done-dim)',
        border: '1px solid rgba(0,255,148,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1
      }}>
        <CheckIcon size={12} color="var(--done-color)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-primary)',
          textDecoration: 'line-through',
          textDecorationColor: 'var(--text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 2
        }}>
          {task.title}
        </div>
        {time && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em'
          }}>
            {time}
          </div>
        )}
      </div>

      <button
        onClick={() => onRestore(task.id)}
        style={{
          padding: '5px 10px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          flexShrink: 0
        }}
      >
        UNDO
      </button>
    </div>
  )
}

function CheckIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
