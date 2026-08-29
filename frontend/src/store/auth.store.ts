import { create } from 'zustand'
import * as authService from '@/services/auth.service'
import { queryClient } from '@/lib/query-client'
import type { LoginCredentials, Session, SignupPayload } from '@/types'

interface AuthState {
  session: Session | null
  status: 'idle' | 'loading' | 'ready'
  isAuthenticated: boolean
  init: () => void
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (payload: SignupPayload) => Promise<{ email: string; message: string }>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: 'idle',
  isAuthenticated: false,
  init: () => {
    const session = authService.getStoredSession()
    set({ session, isAuthenticated: !!session, status: 'ready' })
  },
  login: async (credentials) => {
    const session = await authService.login(credentials)
    queryClient.clear()
    set({ session, isAuthenticated: true })
  },
  // Register no longer issues a session — the account must be email-verified before login.
  signup: async (payload) => authService.signup(payload),
  loginWithGoogle: async (idToken) => {
    const session = await authService.loginWithGoogle(idToken)
    queryClient.clear()
    set({ session, isAuthenticated: true })
  },
  logout: async () => {
    await authService.logout()
    queryClient.clear()
    set({ session: null, isAuthenticated: false })
  },
}))
