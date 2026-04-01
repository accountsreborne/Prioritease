import { useState } from 'react'
import { useTasks } from './hooks/useTasks'
import CardStack from './components/CardStack'
import AddTaskModal from './components/AddTaskModal'
import FeedView from './components/FeedView'
import AuthScreen from './components/AuthScreen'
import CalendarView from './components/CalendarView'

const VIEWS = {
  STACK: 'stack',
  PLANNING: 'planning',
  BACKLOG: 'backlog',
  COMPLETE: 'complete',
  CALENDAR: 'calendar'
}

export default function App() {
  const { planningTasks, activeTasks, backlogTasks, doneTasks, addTask, markDone, markBacklog, moveToActive, moveToPlanning, moveToBacklog, user, loading } = useTasks()
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
            Pluto
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
      {/* Planning: right → Backlog, no left */}
      {view === VIEWS.PLANNING && (
        <FeedView
          title="Planning"
          label="Up Next"
          color="var(--violet)"
          colorDim="rgba(124,58,237,0.15)"
          tasks={planningTasks}
          rightLabel="Backlog"
          onSwipeRight={moveToBacklog}
          onClose={() => setView(VIEWS.STACK)}
          emptyText="Nothing in planning"
        />
      )}
      {/* Backlog: right → In Progress, left → Planning */}
      {view === VIEWS.BACKLOG && (
        <FeedView
          title="Backlog"
          label="Parked"
          color="var(--backlog-color)"
          colorDim="var(--backlog-dim)"
          tasks={backlogTasks}
          rightLabel="In Progress"
          onSwipeRight={moveToActive}
          leftLabel="Planning"
          onSwipeLeft={moveToPlanning}
          onClose={() => setView(VIEWS.STACK)}
          emptyText="Backlog is clear"
        />
      )}
      {/* Complete: left → In Progress, no right */}
      {view === VIEWS.COMPLETE && (
        <FeedView
          title="Complete"
          label="Done"
          color="var(--done-color)"
          colorDim="var(--done-dim)"
          tasks={doneTasks}
          leftLabel="In Progress"
          onSwipeLeft={moveToActive}
          onClose={() => setView(VIEWS.STACK)}
          emptyText="Nothing completed yet"
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
        view={view}
        planCount={planningTasks.length}
        backlogCount={backlogTasks.length}
        doneCount={doneTasks.length}
        onAdd={() => setShowAddModal(true)}
        onPlanning={() => setView(view === VIEWS.PLANNING ? VIEWS.STACK : VIEWS.PLANNING)}
        onBacklog={() => setView(view === VIEWS.BACKLOG ? VIEWS.STACK : VIEWS.BACKLOG)}
        onComplete={() => setView(view === VIEWS.COMPLETE ? VIEWS.STACK : VIEWS.COMPLETE)}
        onCalendar={() => setView(view === VIEWS.CALENDAR ? VIEWS.STACK : VIEWS.CALENDAR)}
      />
    </div>
  )
}

function BottomNav({ view, planCount, backlogCount, doneCount, onAdd, onPlanning, onBacklog, onComplete, onCalendar }) {
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
      zIndex: 60
    }}>
      <NavBtn onClick={onAdd} label="Add" icon={<PlusIcon />} accent />
      <NavBtn onClick={onPlanning} label="Plan" icon={<PlanIcon />} active={view === VIEWS.PLANNING} activeColor="var(--violet)" badge={planCount > 0 ? planCount : null} badgeColor="var(--violet)" />
      <NavBtn onClick={onBacklog} label="Backlog" icon={<ListIcon />} active={view === VIEWS.BACKLOG} activeColor="var(--backlog-color)" badge={backlogCount > 0 ? backlogCount : null} badgeColor="var(--backlog-color)" />
      <NavBtn onClick={onComplete} label="Done" icon={<CheckIcon />} active={view === VIEWS.COMPLETE} activeColor="var(--done-color)" badge={doneCount > 0 ? doneCount : null} badgeColor="var(--done-color)" />
      <NavBtn onClick={onCalendar} label="Cal" icon={<CalIcon />} active={view === VIEWS.CALENDAR} activeColor="var(--accent)" />
    </div>
  )
}

function NavBtn({ onClick, label, icon, badge, badgeColor, accent, active, activeColor }) {
  const color = active ? activeColor : accent ? 'var(--accent)' : 'var(--text-secondary)'
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 20px',
        color,
        position: 'relative',
        transition: 'color 0.2s',
        filter: active ? `drop-shadow(0 0 6px ${activeColor})` : 'none',
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

function PlanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
