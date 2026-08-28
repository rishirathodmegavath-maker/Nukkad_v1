import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore, type ToastTone } from '@/store/toast.store'
import { cn } from '@/lib/utils'

const toneStyles: Record<ToastTone, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-success-500' },
  error: { icon: XCircle, classes: 'text-danger-500' },
  info: { icon: Info, classes: 'text-info-500' },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => {
        const { icon: Icon, classes } = toneStyles[t.tone]
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-2xl border border-border/80 bg-surface shadow-xl px-4 py-3.5 animate-in backdrop-blur-md',
            )}
          >
            <Icon className={cn('size-5 shrink-0 mt-0.5', classes)} />
            <p className="text-sm font-medium text-fg flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-fg-muted hover:text-fg rounded-lg p-1 hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
