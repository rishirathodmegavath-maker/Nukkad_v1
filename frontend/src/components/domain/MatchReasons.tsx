import { cn } from '@/lib/utils'

/** Renders a list of human-readable "why we suggest this" reasons as chips. Never shows raw scores. */
export function MatchReasons({ reasons, className }: { reasons: string[]; className?: string }) {
  if (reasons.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5 min-w-0 max-w-full', className)}>
      {reasons.map((reason) => (
        <span
          key={reason}
          title={reason}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-sunken text-fg-secondary border border-border/70 text-xs font-normal leading-tight max-w-full"
        >
          <span className="size-1 rounded-full bg-accent-500 shrink-0" />
          <span className="truncate min-w-0">{reason}</span>
        </span>
      ))}
    </div>
  )
}

