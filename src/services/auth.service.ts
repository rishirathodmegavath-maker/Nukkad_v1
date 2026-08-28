import { apiClient } from '@/lib/api-client'
import { persistSession, clearSession, getStoredSession } from '@/lib/session'
import type { DeviceSession, LoginCredentials, Session, SignupPayload } from '@/types'

export { getStoredSession } from '@/lib/session'

interface AuthResponseDto {
  user: { id: string }
  accessToken: string
  refreshToken: string
  expiresIn: number
  isNewUser?: boolean
}

function toSession(dto: AuthResponseDto): Session {
  return {
    userId: dto.user.id,
    token: dto.accessToken,
    refreshToken: dto.refreshToken,
    expiresAt: new Date(Date.now() + dto.expiresIn * 1000).toISOString(),
  }
}

export async function login(credentials: LoginCredentials): Promise<Session> {
  const dto = await apiClient.post<AuthResponseDto>('/auth/login', credentials)
  const session = toSession(dto)
  persistSession(session)
  return session
}

export async function signup(payload: SignupPayload): Promise<Session> {
  const dto = await apiClient.post<AuthResponseDto>('/auth/register', payload)
  const session = toSession(dto)
  persistSession(session)
  return session
}

export async function loginWithGoogle(idToken: string): Promise<{ session: Session; isNewUser: boolean }> {
  const dto = await apiClient.post<AuthResponseDto>('/auth/google', { idToken })
  const session = toSession(dto)
  persistSession(session)
  return { session, isNewUser: !!dto.isNewUser }
}

export async function requestPasswordReset(email: string): Promise<{ sent: true }> {
  await apiClient.post('/auth/password-reset/request', { email })
  return { sent: true }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword })
}

function currentRefreshTokenHeader(): Record<string, string> {
  const session = getStoredSession()
  return session?.refreshToken ? { 'X-Refresh-Token': session.refreshToken } : {}
}

export async function listSessions(): Promise<DeviceSession[]> {
  return apiClient.get<DeviceSession[]>('/auth/sessions', currentRefreshTokenHeader())
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/auth/sessions/${sessionId}`)
}

export async function logoutAllOtherSessions(): Promise<void> {
  await apiClient.post('/auth/sessions/logout-all', undefined, currentRefreshTokenHeader())
}

/** No backend endpoint yet (OTP flow was deprioritized) — kept as a stub so the UI still compiles. */
export async function verifyOtp(_email: string, code: string): Promise<{ verified: boolean }> {
  return { verified: code.length === 6 }
}

export async function logout(): Promise<void> {
  const session = getStoredSession()
  if (session?.refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken: session.refreshToken })
    } catch {
      // Best-effort server-side revoke — clear the local session regardless.
    }
  }
  clearSession()
}
