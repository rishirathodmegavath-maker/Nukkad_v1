import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'sunken' | 'elevated' | 'outline'
}

const paddingClasses = {
  none: '',
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

const variantClasses = {
  default: 'bg-surface border border-border/80 shadow-xs',
  sunken: 'bg-surface-sunken border border-border/60',
  elevated: 'bg-surface border border-border/80 shadow-sm',
  outline: 'bg-transparent border border-border/80',
}

export function Card({
  interactive,
  padding = 'md',
  variant = 'default',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-150',
        variantClasses[variant],
        interactive &&
          'hover:border-border-strong cursor-pointer active:scale-[0.995]',
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  )
}

