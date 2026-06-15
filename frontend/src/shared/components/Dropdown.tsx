import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../utils/cn'

type DropdownProps = {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'animate-dropdown absolute top-full z-50 mt-1.5 min-w-[210px] rounded-xl border border-border bg-surface-elevated p-1 shadow-elevated',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({
  children,
  onClick,
  icon,
  destructive = false,
}: {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  destructive?: boolean
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-100',
      destructive
        ? 'text-error hover:bg-error-soft'
        : 'text-text hover:bg-surface-muted',
    )}
  >
    {icon}
    {children}
  </button>
)

export const DropdownDivider = () => (
  <div className="my-1 border-t border-border" role="separator" />
)
