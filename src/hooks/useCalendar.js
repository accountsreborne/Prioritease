import { useState, useEffect, useCallback, useRef } from 'react'

const SCOPES = 'https://www.googleapis.com/auth/calendar'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const TOKEN_KEY = 'gcal_token'

function loadGIS() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = resolve
    document.head.appendChild(script)
  })
}

function getStoredToken() {
  try {
    const stored = JSON.parse(localStorage.getItem(TOKEN_KEY))
    if (stored && stored.expires_at > Date.now()) return stored.access_token
  } catch {}
  return null
}

export function useCalendar() {
  const [token, setToken] = useState(getStoredToken)
  const [events, setEvents] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const tokenClientRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) return
    loadGIS().then(() => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) { setError(response.error); return }
          if (response.access_token) {
            const expires_at = Date.now() + (response.expires_in - 60) * 1000
            localStorage.setItem(TOKEN_KEY, JSON.stringify({
              access_token: response.access_token,
              expires_at
            }))
            setToken(response.access_token)
            setError(null)
          }
        }
      })
    })
  }, [])

  const connect = useCallback(() => {
    tokenClientRef.current?.requestAccessToken()
  }, [])

  const disconnect = useCallback(() => {
    if (token) window.google?.accounts?.oauth2?.revoke(token, () => {})
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setEvents([])
  }, [token])

  const fetchEvents = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    setSyncing(true)
    setError(null)
    const now = new Date().toISOString()
    const maxTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(now)}&timeMax=${encodeURIComponent(maxTime)}` +
        `&singleEvents=true&orderBy=startTime&maxResults=30`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = await res.json()
      if (data.error) {
        if (data.error.code === 401) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        }
        throw new Error(data.error.message)
      }
      setEvents(data.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [token])

  // Create an all-day event on today's date from a task
  const createEvent = useCallback(async ({ title, description, links }) => {
    if (!token) return null
    const today = new Date().toISOString().split('T')[0]
    const descParts = [
      description,
      ...(links || []).map(l => `${l.label}: ${l.url}`)
    ].filter(Boolean)
    const event = {
      summary: title,
      description: descParts.join('\n') || undefined,
      start: { date: today },
      end: { date: today },
    }
    try {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [token])

  // Auto-fetch when token first becomes available
  useEffect(() => {
    if (token) fetchEvents(token)
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connected: !!token,
    configured: !!CLIENT_ID,
    connect,
    disconnect,
    events,
    syncing,
    error,
    fetchEvents,
    createEvent,
  }
}
