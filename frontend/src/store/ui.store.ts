import { create } from 'zustand'

const SIDEBAR_KEY = 'nukkad.sidebarCollapsed'

function getStoredSidebar(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIDEBAR_KEY) === 'true'
}

interface UiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: getStoredSidebar(),
  mobileNavOpen: false,
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return { sidebarCollapsed: next }
    }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))
