import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = ({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && (
        <span className="text-[13px] font-medium text-text">{label}</span>
      )}
      <input
        id={inputId}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-field px-3 text-sm text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150',
          'placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20',
          error && 'border-error hover:border-error focus:border-error focus:ring-error/20',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </label>
  )
}
