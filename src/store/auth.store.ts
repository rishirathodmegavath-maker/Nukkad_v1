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
  signup: (payload: SignupPayload) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>
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
  signup: async (payload) => {
    const session = await authService.signup(payload)
    queryClient.clear()
    set({ session, isAuthenticated: true })
  },
  loginWithGoogle: async (idToken) => {
    const { session, isNewUser } = await authService.loginWithGoogle(idToken)
    queryClient.clear()
    set({ session, isAuthenticated: true })
    return { isNewUser }
  },
  logout: async () => {
    await authService.logout()
    queryClient.clear()
    set({ session: null, isAuthenticated: false })
  },
}))
