import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type StatCardProps = {
  label?: string
  title?: string
  value: string | number
  hint?: string
  icon?: ReactNode
  trend?: { value: string; positive?: boolean }
  accent?: boolean
  className?: string
}

export const StatCard = ({
  label,
  title,
  value,
  hint,
  icon,
  trend,
  accent = false,
  className,
}: StatCardProps) => {
  const displayLabel = label ?? title ?? ''

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5 shadow-soft transition-colors duration-150 hover:border-border-strong',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{displayLabel}</p>
        {icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-2 text-[1.65rem] leading-tight font-semibold tracking-tight tabular-nums',
          accent ? 'text-accent' : 'text-text',
        )}
      >
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'font-medium tabular-nums',
                trend.positive ? 'text-success' : 'text-muted',
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-soft">{hint}</span>}
        </div>
      )}
    </div>
  )
}
