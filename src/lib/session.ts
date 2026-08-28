import type { Session } from '@/types'

const SESSION_KEY = 'nukkad.session'

export function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (!session.token || !session.refreshToken) return null
    return session
  } catch {
    return null
  }
}

export function persistSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
