import { cn } from '@/lib/utils'

export interface TabItem {
  key: string
  label: string
  count?: number
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-border/80 overflow-x-auto no-scrollbar', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer',
              active ? 'text-brand-600 dark:text-brand-400' : 'text-fg-muted hover:text-fg',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold leading-none',
                  active
                    ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                    : 'bg-surface-sunken text-fg-muted',
                )}
              >
                {item.count}
              </span>
            )}
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-[2.5px] rounded-full bg-brand-600 dark:bg-brand-500 shadow-xs" />
            )}
          </button>
        )
      })}
    </div>
  )
}

interface PillTabsProps {
  items: TabItem[]
  value: string
  onChange: (key: string) => void
  className?: string
}

export function PillTabs({ items, value, onChange, className }: PillTabsProps) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer border shadow-2xs',
              active
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs active:scale-[0.98]'
                : 'bg-surface text-fg-secondary border-border/80 hover:bg-surface-hover hover:border-border-strong hover:text-fg',
            )}
          >
            {item.label}
            {item.count !== undefined && <span className="ml-1.5 opacity-80">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

