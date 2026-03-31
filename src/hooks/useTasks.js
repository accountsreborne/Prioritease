import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

function dbToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    links: row.links || [],
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).getTime() : undefined,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
  }
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
        status: 'active',
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
    deleteTask,
    user,
    loading,
  }
}
