import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, MessageSquare, Sun, Moon, User, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { useThemeStore } from '@/store/theme.store'
import { useAuthStore } from '@/store/auth.store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useUnreadMessageCount } from '@/hooks/useConversations'
import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu, DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import { toast } from '@/store/toast.store'

function NotificationDot({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function Topbar() {
  const navigate = useNavigate()
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const theme = useThemeStore((s) => s.theme)
  const setThemePreference = useThemeStore((s) => s.setThemePreference)
  const toggleTheme = () => setThemePreference(theme === 'dark' ? 'light' : 'dark')
  const logout = useAuthStore((s) => s.logout)
  const { data: currentUser } = useCurrentUser()
  const { data: unreadNotifs = 0 } = useUnreadNotificationCount()
  const unreadMessages = useUnreadMessageCount()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  async function handleLogout() {
    await logout()
    toast.info('You’ve been logged out.')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-header/90 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile Drawer Trigger */}
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open mobile menu"
        className="lg:hidden flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden lg:flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
      >
        {sidebarCollapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
      </button>

      <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-fg-muted pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, ideas, startups…"
          className="w-full rounded-xl border border-border/80 bg-surface-sunken/60 pl-10 pr-10 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-fg-muted shadow-2xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-muted hover:text-fg cursor-pointer"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="size-4.5 text-amber-400" /> : <Moon className="size-4.5" />}
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="relative flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
          aria-label="Messages"
        >
          <MessageSquare className="size-4.5" />
          <NotificationDot count={unreadMessages} />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <NotificationDot count={unreadNotifs} />
        </button>

        <DropdownMenu
          trigger={
            <button className="ml-1 cursor-pointer rounded-full ring-2 ring-transparent hover:ring-brand-500/30 transition-all" aria-label="User profile menu">
              <Avatar src={currentUser?.avatarUrl} name={currentUser?.name ?? ''} size="sm" />
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-border/60 mb-1 bg-surface-sunken/40">
            <p className="text-sm font-bold text-fg truncate">{currentUser?.name}</p>
            <p className="text-xs text-fg-muted truncate mt-0.5">{currentUser?.headline || 'Member'}</p>
          </div>
          <DropdownItem icon={<User className="size-4 text-brand-600 dark:text-brand-400" />} onClick={() => navigate(`/people/${currentUser?.id}`)}>
            View profile
          </DropdownItem>
          <DropdownItem icon={<Settings className="size-4" />} onClick={() => navigate('/settings')}>
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<LogOut className="size-4 text-danger-500" />} danger onClick={handleLogout}>
            Log out
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  )
}
