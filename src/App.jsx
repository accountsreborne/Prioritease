import { useState } from 'react'
import { useTasks } from './hooks/useTasks'
import CardStack from './components/CardStack'
import AddTaskModal from './components/AddTaskModal'
import TaskListView from './components/TaskListView'
import CompletedView from './components/CompletedView'
import AuthScreen from './components/AuthScreen'
import CalendarView from './components/CalendarView'

const VIEWS = {
  STACK: 'stack',
  LIST: 'list',
  DONE: 'done',
  CALENDAR: 'calendar'
}

export default function App() {
  const { activeTasks, doneTasks, backlogTasks, addTask, markDone, markBacklog, restoreTask, user, loading } = useTasks()
  const [view, setView] = useState(VIEWS.STACK)
  const [showAddModal, setShowAddModal] = useState(false)

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        letterSpacing: '0.08em',
      }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'var(--safe-top)',
      paddingBottom: 'calc(var(--safe-bottom) + 60px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px 10px',
        flexShrink: 0
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 1,
            opacity: 0.8
          }}>
            TaskSwipe
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}>
            In Progress
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: activeTasks.length > 0 ? 'rgba(0,212,255,0.07)' : 'var(--bg-elevated)',
          border: `1px solid ${activeTasks.length > 0 ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`,
          borderRadius: 20,
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: activeTasks.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: activeTasks.length > 0 ? '0 0 8px var(--accent)' : 'none',
            animation: activeTasks.length > 0 ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: activeTasks.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
            letterSpacing: '0.04em'
          }}>
            {activeTasks.length}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        marginBottom: 16,
        flexShrink: 0
      }} />

      {/* Main card stack */}
      <CardStack
        tasks={activeTasks}
        onDone={markDone}
        onBacklog={markBacklog}
      />

      {/* Overlaid views */}
      {view === VIEWS.LIST && (
        <TaskListView
          activeTasks={activeTasks}
          backlogTasks={backlogTasks}
          onRestore={restoreTask}
          onClose={() => setView(VIEWS.STACK)}
        />
      )}
      {view === VIEWS.DONE && (
        <CompletedView
          doneTasks={doneTasks}
          onRestore={restoreTask}
          onClose={() => setView(VIEWS.STACK)}
        />
      )}
      {view === VIEWS.CALENDAR && (
        <CalendarView
          activeTasks={activeTasks}
          onAddTask={addTask}
          onClose={() => setView(VIEWS.STACK)}
        />
      )}

      {/* Add task modal */}
      {showAddModal && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Bottom nav */}
      <BottomNav
        doneCount={doneTasks.length}
        onAdd={() => setShowAddModal(true)}
        onList={() => setView(VIEWS.LIST)}
        onDone={() => setView(VIEWS.DONE)}
        onCalendar={() => setView(VIEWS.CALENDAR)}
      />
    </div>
  )
}

function BottomNav({ doneCount, onAdd, onList, onDone, onCalendar }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: `calc(60px + var(--safe-bottom))`,
      paddingBottom: 'var(--safe-bottom)',
      background: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 40
    }}>
      {/* Add task */}
      <NavBtn
        onClick={onAdd}
        label="Add"
        icon={<PlusIcon />}
        accent
      />

      {/* Task list */}
      <NavBtn
        onClick={onList}
        label="Queue"
        icon={<ListIcon />}
      />

      {/* Completed */}
      <NavBtn
        onClick={onDone}
        label="Done"
        icon={<CheckIcon />}
        badge={doneCount > 0 ? doneCount : null}
        badgeColor="var(--done-color)"
      />

      {/* Calendar */}
      <NavBtn
        onClick={onCalendar}
        label="Cal"
        icon={<CalIcon />}
      />
    </div>
  )
}

function NavBtn({ onClick, label, icon, badge, badgeColor, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 20px',
        color: accent ? 'var(--accent)' : 'var(--text-secondary)',
        position: 'relative',
        transition: 'color 0.15s'
      }}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
        {badge != null && (
          <div style={{
            position: 'absolute',
            top: -6,
            right: -10,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: badgeColor || 'var(--accent)',
            color: '#0a0a0f',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: `0 0 8px ${badgeColor || 'var(--accent)'}`
          }}>
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        {label}
      </span>
    </button>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function CalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
