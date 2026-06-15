import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type CardPadding = 'sm' | 'md' | 'lg' | 'none'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
  padding?: CardPadding
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = ({
  className,
  interactive = false,
  padding = 'md',
  ...props
}: CardProps) => (
  <div
    className={cn(
      'rounded-xl border border-border bg-surface shadow-soft transition-colors duration-150',
      paddingClasses[padding],
      interactive && 'cursor-pointer hover:border-border-strong',
      className,
    )}
    {...props}
  />
)
