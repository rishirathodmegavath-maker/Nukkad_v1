import { useMemo, useRef } from 'react'
import { NavLink, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { Home, Rss, Users, Briefcase, MessageSquare, User } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUnreadMessageCount } from '@/hooks/useConversations'
import { useLiquidDock } from '@/hooks/useLiquidDock'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

function resolveActiveIndex(pathname: string, items: { to: string; end: boolean }[], fallback: number): number {
  let bestIndex = -1
  let bestLength = -1
  items.forEach((item, i) => {
    if (matchPath({ path: item.to, end: item.end }, pathname) && item.to.length > bestLength) {
      bestIndex = i
      bestLength = item.to.length
    }
  })
  return bestIndex === -1 ? fallback : bestIndex
}

export function MobileNav() {
  const { data: currentUser } = useCurrentUser()
  const unreadMessages = useUnreadMessageCount()
  const location = useLocation()
  const navigate = useNavigate()

  const profilePath = currentUser ? `/people/${currentUser.id}` : '/people'

  const navItems = [
    { key: 'home', to: '/', label: 'Home', icon: Home, end: true },
    { key: 'feed', to: '/feed', label: 'Feed', icon: Rss, end: false },
    { key: 'people', to: '/people', label: 'People', icon: Users, end: false },
    { key: 'opportunities', to: '/opportunities', label: 'Opportunities', icon: Briefcase, end: false },
    { key: 'messages', to: '/messages', label: 'Messages', icon: MessageSquare, end: false, badge: unreadMessages },
    { key: 'profile', to: profilePath, label: 'Profile', icon: User, end: false, isProfile: true },
  ]

  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const beadRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<(HTMLElement | null)[]>([])
  const lastActiveRef = useRef(0)

  const activeIndex = useMemo(() => {
    const resolved = resolveActiveIndex(location.pathname, navItems, lastActiveRef.current)
    lastActiveRef.current = resolved
    return resolved
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, profilePath])

  useLiquidDock({
    containerRef,
    svgRef,
    pathRef,
    beadRef,
    tabRefs,
    activeIndex,
    onSelectIndex: (index) => {
      const to = navItems[index]?.to
      if (to && to !== location.pathname) navigate(to)
    },
  })

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-[env(safe-area-inset-bottom)]"
    >
      <div ref={containerRef} className="liquid-dock">
        <span className="liquid-dock__cast" aria-hidden="true" />

        <svg ref={svgRef} className="liquid-dock__skin" aria-hidden="true" focusable="false" preserveAspectRatio="none">
          <defs>
            <linearGradient id="liquidDockPlate" x1="0" y1="0" x2="0" y2="1">
              <stop className="liquid-dock__plate-hi" offset="0" />
              <stop className="liquid-dock__plate-lo" offset="1" />
            </linearGradient>
            <linearGradient id="liquidDockRim" x1="0" y1="0" x2="0" y2="1">
              <stop className="liquid-dock__rim-hi" offset="0" />
              <stop className="liquid-dock__rim-lo" offset="1" />
            </linearGradient>
          </defs>
          <path ref={pathRef} className="liquid-dock__fill" />
        </svg>

        <span ref={beadRef} className="liquid-dock__bead" aria-hidden="true" />

        <div className="liquid-dock__tabs">
          {navItems.map((item, index) => (
            <NavLink
              key={item.key}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              to={item.to}
              end={item.end}
              draggable={false}
              data-active={index === activeIndex ? 'true' : 'false'}
              className="liquid-dock__tab"
            >
              {(() => {
                const Icon = item.icon
                return (
                  <>
                    <span className="liquid-dock__icon-slot">
                      <span className="liquid-dock__icon-rise">
                        {item.isProfile && currentUser ? (
                          <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="xs" />
                        ) : (
                          <Icon className="size-5" />
                        )}
                      </span>
                      {!!item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold text-white shadow-xs">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </span>
                    <span className={cn('liquid-dock__label', item.label.length > 11 && 'text-[9.5px]')}>{item.label}</span>
                  </>
                )
              })()}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
