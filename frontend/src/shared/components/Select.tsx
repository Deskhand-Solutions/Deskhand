import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: SelectOption[]
}

export const Select = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label && <span className="text-[13px] font-medium text-text">{label}</span>}
      <span className="relative block">
        <select
          id={selectId}
          className={cn(
            'h-9 w-full appearance-none rounded-lg border border-border bg-field pr-9 pl-3 text-sm text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150',
            'hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20',
            error && 'border-error hover:border-error focus:border-error focus:ring-error/20',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-soft"
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
      {error && <span className="text-xs text-error">{error}</span>}
    </label>
  )
}
