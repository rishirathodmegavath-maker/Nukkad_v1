import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = 'nukkad.theme'
const SIDEBAR_KEY = 'nukkad.sidebarCollapsed'

function getStoredSidebar(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIDEBAR_KEY) === 'true'
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? getSystemTheme() : preference
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
}

interface UiState {
  theme: ThemeMode
  themePreference: ThemePreference
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  setThemePreference: (preference: ThemePreference) => void
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
}

const initialPreference = getStoredPreference()

export const useUiStore = create<UiState>((set, get) => ({
  theme: resolveTheme(initialPreference),
  themePreference: initialPreference,
  sidebarCollapsed: getStoredSidebar(),
  mobileNavOpen: false,
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    localStorage.setItem(THEME_KEY, next)
    set({ theme: next, themePreference: next })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
    set({ theme, themePreference: theme })
  },
  setThemePreference: (preference) => {
    const resolved = resolveTheme(preference)
    applyTheme(resolved)
    localStorage.setItem(THEME_KEY, preference)
    set({ theme: resolved, themePreference: preference })
  },
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return { sidebarCollapsed: next }
    }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))

// apply theme immediately on module load, before first paint of the app shell
if (typeof document !== 'undefined') {
  applyTheme(resolveTheme(initialPreference))
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useUiStore.getState().themePreference === 'system') {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useUiStore.setState({ theme: resolved })
    }
  })
}
