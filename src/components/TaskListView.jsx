export default function TaskListView({ activeTasks, backlogTasks, onRestore, onClose }) {
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
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>
            All Tasks
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Queue
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Section
          title="In Progress"
          color="var(--accent)"
          tasks={activeTasks}
          emptyText="Nothing in progress"
          renderAction={null}
        />
        <Section
          title="Backlog / Tomorrow"
          color="var(--backlog-color)"
          tasks={backlogTasks}
          emptyText="Backlog is clear"
          renderAction={(task) => (
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
              RESTORE
            </button>
          )}
        />
      </div>
    </div>
  )
}

function Section({ title, color, tasks, emptyText, renderAction }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          {title}
        </div>
        <div style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)'
        }}>
          {tasks.length}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-sm)'
        }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} action={renderAction?.(task)} />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '14px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: task.description ? 4 : 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {task.description}
          </div>
        )}
        {task.links?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {task.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--accent-dim)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  border: '1px solid rgba(0,212,255,0.15)'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
      {action}
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
