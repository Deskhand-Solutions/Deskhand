import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  meta?: string
  actions?: ReactNode
  className?: string
}

export const PageHeader = ({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) => (
  <div
    className={cn(
      'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
      className,
    )}
  >
    <div className="space-y-1.5">
      {eyebrow && (
        <p className="text-xs font-medium text-muted-soft">{eyebrow}</p>
      )}
      <h1 className="text-xl font-semibold tracking-tight text-text sm:text-[1.4rem]">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {meta && <p className="text-xs text-muted-soft">{meta}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
)
