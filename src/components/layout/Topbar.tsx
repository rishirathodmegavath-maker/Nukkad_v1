import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, X, Bell, MessageSquare, Sun, Moon, User, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { useThemeStore } from '@/store/theme.store'
import { useAuthStore } from '@/store/auth.store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useUnreadMessageCount } from '@/hooks/useConversations'
import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu, DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import { GlobalSearchBox } from '@/components/domain/GlobalSearchBox'
import { toast } from '@/store/toast.store'
import { cn } from '@/lib/utils'

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

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
        className={cn(
          'lg:hidden flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors',
          mobileSearchOpen && 'hidden',
        )}
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

      <GlobalSearchBox variant="desktop" />

      {mobileSearchOpen ? (
        <>
          <GlobalSearchBox variant="mobile" />
          <button
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Close search"
            className="sm:hidden flex size-9 shrink-0 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </>
      ) : (
        <button
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
          className="sm:hidden flex size-9 items-center justify-center rounded-xl text-fg-secondary hover:bg-surface-hover hover:text-fg cursor-pointer transition-colors"
        >
          <Search className="size-4.5" />
        </button>
      )}

      <div className={cn('items-center gap-2 ml-auto', mobileSearchOpen ? 'hidden sm:flex' : 'flex')}>
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
