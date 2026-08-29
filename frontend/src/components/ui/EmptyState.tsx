import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border/90 bg-surface-sunken/40',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface text-brand-600 dark:text-brand-400 border border-border/80 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-fg tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-fg-muted leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-danger-200 dark:border-danger-900/50 bg-danger-100/20 dark:bg-danger-950/20">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 border border-danger-200 dark:border-danger-800/40">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-base font-bold text-fg tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-fg-muted leading-relaxed">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </div>
  )
}

