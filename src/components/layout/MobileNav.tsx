import { NavLink } from 'react-router-dom'
import { Home, Rss, Users, Briefcase, MessageSquare, User } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUnreadMessageCount } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

export function MobileNav() {
  const { data: currentUser } = useCurrentUser()
  const unreadMessages = useUnreadMessageCount()

  const profilePath = currentUser ? `/people/${currentUser.id}` : '/people'

  const navItems = [
    { key: 'home', to: '/', label: 'Home', icon: Home, end: true },
    { key: 'feed', to: '/feed', label: 'Feed', icon: Rss, end: false },
    { key: 'people', to: '/people', label: 'People', icon: Users, end: false },
    { key: 'opportunities', to: '/opportunities', label: 'Opportunities', icon: Briefcase, end: false },
    { key: 'messages', to: '/messages', label: 'Messages', icon: MessageSquare, end: false, badge: unreadMessages },
    { key: 'profile', to: profilePath, label: 'Profile', icon: User, end: false, isProfile: true },
  ]

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border/80 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors select-none',
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-fg-muted hover:text-fg',
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon
              return (
                <>
                  <span className="relative flex items-center justify-center mb-0.5">
                    {item.isProfile && currentUser ? (
                      <span className={cn('rounded-full transition-all', isActive && 'ring-2 ring-brand-500')}>
                        <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="xs" />
                      </span>
                    ) : (
                      <Icon className={cn('size-5 transition-transform', isActive && 'scale-110')} />
                    )}
                    {!!item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold text-white shadow-xs">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="truncate max-w-[64px]">{item.label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
