import { cn } from '../utils/cn'

type StatusTone = 'success' | 'warning' | 'error' | 'neutral'

type StatusBadgeProps = {
  label: string
  tone?: StatusTone
}

const toneClasses: Record<StatusTone, string> = {
  success: 'border-success/20 bg-success-soft text-success',
  warning: 'border-warning/20 bg-warning-soft text-warning',
  error: 'border-error/20 bg-error-soft text-error',
  neutral: 'border-border bg-surface-muted text-muted',
}

const dotClasses: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-muted-soft',
}

export const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
      toneClasses[tone],
    )}
  >
    <span className={cn('size-1.5 rounded-full', dotClasses[tone])} aria-hidden />
    {label}
  </span>
)
