import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'danger-subtle'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs border border-brand-700/30 font-medium',
  secondary:
    'bg-surface text-fg hover:bg-surface-hover hover:border-border-strong active:bg-surface-sunken border border-border/80 font-medium shadow-xs',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-xs border border-accent-600/30 font-medium',
  outline:
    'bg-transparent text-fg border border-border/80 hover:bg-surface-hover hover:border-border-strong active:bg-surface-sunken font-medium',
  ghost:
    'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg active:bg-surface-sunken font-medium',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-xs border border-danger-600/30 font-medium',
  'danger-subtle':
    'bg-danger-100/60 text-danger-600 dark:text-danger-400 hover:bg-danger-100 border border-transparent font-medium',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-4.5 text-sm gap-2 rounded-lg font-semibold',
  icon: 'size-9 rounded-lg p-0',
  'icon-sm': 'size-7.5 rounded-md p-0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        'cursor-pointer select-none active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin shrink-0" /> : leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {children}
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  )
}

