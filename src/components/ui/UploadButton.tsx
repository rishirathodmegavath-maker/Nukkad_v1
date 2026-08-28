import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadCloud, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonSize, ButtonVariant } from '@/components/ui/Button'

export type UploadPhase = 'idle' | 'uploading' | 'done'

interface UploadButtonProps {
  phase: UploadPhase
  idleLabel: ReactNode
  uploadingLabel?: string
  doneLabel?: string
  leftIcon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  type?: 'button' | 'submit'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm border border-brand-700/20 font-medium',
  secondary:
    'bg-surface text-fg hover:bg-surface-hover hover:border-border-strong active:bg-surface-sunken border border-border font-medium shadow-sm',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm border border-accent-600/20 font-medium',
  outline:
    'bg-transparent text-fg border border-border hover:bg-surface-hover hover:border-border-strong active:bg-surface-sunken',
  ghost:
    'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg active:bg-surface-sunken',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm border border-danger-600/20 font-medium',
  'danger-subtle':
    'bg-danger-100/60 text-danger-500 hover:bg-danger-100 hover:text-danger-600 border border-transparent font-medium',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-xl font-semibold',
  icon: 'size-9 rounded-xl p-0',
  'icon-sm': 'size-7.5 rounded-lg p-0',
}

/** On light (secondary/outline/ghost) fills a dark bar reads better than a white one. */
const progressBarClasses: Record<ButtonVariant, string> = {
  primary: 'bg-white/30',
  secondary: 'bg-fg/12',
  accent: 'bg-white/30',
  outline: 'bg-fg/12',
  ghost: 'bg-fg/12',
  danger: 'bg-white/30',
  'danger-subtle': 'bg-danger-500/20',
}

const textVariants = {
  initial: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  appear: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

/**
 * Button that morphs through idle → uploading (sweeping indeterminate bar) → done
 * (bar fills + checkmark draws in) for any real upload/save mutation. Visual language
 * (text swap, bottom progress sweep, draw-in check) is shared across every upload
 * surface in the app; only labels/colors are per-call-site.
 */
export function UploadButton({
  phase,
  idleLabel,
  uploadingLabel = 'Uploading…',
  doneLabel = 'Done',
  leftIcon,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
}: UploadButtonProps) {
  return (
    <motion.button
      type={type}
      layout
      disabled={disabled || phase !== 'idle'}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center font-medium overflow-hidden',
        'disabled:cursor-not-allowed cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {phase === 'idle' && (
          <motion.span
            key="idle"
            variants={textVariants}
            initial="hidden"
            animate="initial"
            exit="hidden"
            className="relative z-10 inline-flex items-center gap-1.5"
          >
            {leftIcon}
            {idleLabel}
          </motion.span>
        )}
        {phase === 'uploading' && (
          <motion.span
            key="uploading"
            variants={textVariants}
            initial="hidden"
            animate="appear"
            exit="hidden"
            className="relative z-10 inline-flex items-center gap-1.5"
          >
            <motion.span
              className="inline-flex"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [1, 1.45, 1], opacity: 1 }}
              transition={{
                scale: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
              }}
            >
              <UploadCloud className="size-4" />
            </motion.span>
            {uploadingLabel}
          </motion.span>
        )}
        {phase === 'done' && (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 inline-flex items-center gap-1.5"
          >
            <motion.span
              className="inline-flex"
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Check className="size-4" />
            </motion.span>
            {doneLabel}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Sweeping/filling progress bar along the bottom edge */}
      <motion.div
        className={cn('absolute bottom-0 left-0', progressBarClasses[variant])}
        initial={false}
        animate={
          phase === 'uploading'
            ? { width: '85%', height: 3, transition: { duration: 1.6, ease: [0.7, 0, 0.2, 1] } }
            : phase === 'done'
              ? { width: '100%', height: '100%', transition: { duration: 0.5, ease: [0.7, 0, 0.2, 1] } }
              : { width: 0, height: 3, transition: { duration: 0.15 } }
        }
      />
    </motion.button>
  )
}

/**
 * Overlay for icon-only upload targets (an avatar, a thumbnail chip). The upload
 * icon grows while the file is in flight and shrinks down to a checkmark once done,
 * mirroring UploadButton's icon so every upload surface reads the same way.
 */
export function UploadSpinnerOverlay({ phase }: { phase: UploadPhase }) {
  const show = phase === 'uploading' || phase === 'done'
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/45"
        >
          {phase === 'uploading' ? (
            <motion.div
              className="text-white"
              initial={{ scale: 0.7 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UploadCloud className="size-5" />
            </motion.div>
          ) : (
            <motion.div
              className="text-white"
              initial={{ scale: 1.7 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Check className="size-5" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
