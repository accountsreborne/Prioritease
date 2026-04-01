import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

const PRIORITY_ORDER = { p0: 0, p1: 1, p2: 2 }

function dbToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    links: row.links || [],
    status: row.status,
    priority: row.priority || 'p1',
    createdAt: new Date(row.created_at).getTime(),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).getTime() : undefined,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
  }
}

function sortByPriorityThenTime(a, b) {
  const pDiff = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
  if (pDiff !== 0) return pDiff
  const tA = a.startTime ? new Date(a.startTime).getTime() : a.createdAt
  const tB = b.startTime ? new Date(b.startTime).getTime() : b.createdAt
  return tA - tB
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch tasks when user changes
  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setTasks(data.map(dbToTask))
        setLoading(false)
      })
  }, [user])

  const addTask = useCallback(async (task) => {
    if (!user) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title.trim(),
        description: task.description?.trim() || null,
        links: task.links || [],
        status: task.status || 'active',
        priority: task.priority || 'p1',
        user_id: user.id,
        start_time: task.startTime || null,
        end_time: task.endTime || null,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks(prev => [dbToTask(data), ...prev])
    }
  }, [user])

  const markDone = useCallback(async (id) => {
    const resolved_at = new Date().toISOString()
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', resolved_at })
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'done', resolvedAt: new Date(resolved_at).getTime() } : t
      ))
    }
  }, [])

  const markBacklog = useCallback(async (id) => {
    const resolved_at = new Date().toISOString()
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'backlog', resolved_at })
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'backlog', resolvedAt: new Date(resolved_at).getTime() } : t
      ))
    }
  }, [])

  const restoreTask = useCallback(async (id) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'active', resolved_at: null })
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'active', resolvedAt: undefined } : t
      ))
    }
  }, [])

  const deleteTask = useCallback(async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
  }, [])

  const planningTasks = tasks.filter(t => t.status === 'planning').sort(sortByPriorityThenTime)
  const activeTasks = tasks.filter(t => t.status === 'active').sort(sortByPriorityThenTime)
  const backlogTasks = tasks.filter(t => t.status === 'backlog').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0))
  const doneTasks = tasks.filter(t => t.status === 'done').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0))

  const moveToStatus = useCallback(async (id, status) => {
    const resolved_at = status === 'done' ? new Date().toISOString() : null
    const { error } = await supabase
      .from('tasks')
      .update({ status, resolved_at })
      .eq('id', id)
    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status, resolvedAt: resolved_at ? new Date(resolved_at).getTime() : undefined } : t
      ))
    }
  }, [])

  const moveToActive = useCallback((id) => moveToStatus(id, 'active'), [moveToStatus])
  const moveToPlanning = useCallback((id) => moveToStatus(id, 'planning'), [moveToStatus])
  const moveToBacklog = useCallback((id) => moveToStatus(id, 'backlog'), [moveToStatus])

  return {
    tasks,
    planningTasks,
    activeTasks,
    backlogTasks,
    doneTasks,
    addTask,
    markDone,
    markBacklog,
    moveToStatus,
    moveToActive,
    moveToPlanning,
    moveToBacklog,
    restoreTask,
    deleteTask,
    user,
    loading,
  }
}
