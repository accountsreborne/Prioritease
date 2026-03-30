import { useState, useCallback } from 'react'

const STORAGE_KEY = 'taskswipe_tasks'

const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Review pull requests',
    description: 'Go through the open PRs and leave feedback',
    links: [{ label: 'GitHub', url: 'https://github.com' }],
    status: 'active',
    createdAt: Date.now() - 3000
  },
  {
    id: '2',
    title: 'Update documentation',
    description: 'Sync the API docs with recent changes to the codebase',
    links: [],
    status: 'active',
    createdAt: Date.now() - 2000
  },
  {
    id: '3',
    title: 'Deploy staging build',
    description: null,
    links: [],
    status: 'active',
    createdAt: Date.now() - 1000
  }
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_TASKS
}

function save(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {}
}

export function useTasks() {
  const [tasks, setTasks] = useState(load)

  const update = useCallback((next) => {
    setTasks(next)
    save(next)
  }, [])

  const addTask = useCallback((task) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: task.title.trim(),
      description: task.description?.trim() || null,
      links: task.links || [],
      status: 'active',
      createdAt: Date.now()
    }
    update(prev => [newTask, ...prev])
  }, [update])

  const markDone = useCallback((id) => {
    update(prev => prev.map(t => t.id === id ? { ...t, status: 'done', resolvedAt: Date.now() } : t))
  }, [update])

  const markBacklog = useCallback((id) => {
    update(prev => prev.map(t => t.id === id ? { ...t, status: 'backlog', resolvedAt: Date.now() } : t))
  }, [update])

  const restoreTask = useCallback((id) => {
    update(prev => prev.map(t => t.id === id ? { ...t, status: 'active', resolvedAt: undefined } : t))
  }, [update])

  const deleteTask = useCallback((id) => {
    update(prev => prev.filter(t => t.id !== id))
  }, [update])

  const activeTasks = tasks.filter(t => t.status === 'active').sort((a, b) => a.createdAt - b.createdAt)
  const doneTasks = tasks.filter(t => t.status === 'done').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0))
  const backlogTasks = tasks.filter(t => t.status === 'backlog').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0))

  return {
    tasks,
    activeTasks,
    doneTasks,
    backlogTasks,
    addTask,
    markDone,
    markBacklog,
    restoreTask,
    deleteTask
  }
}
