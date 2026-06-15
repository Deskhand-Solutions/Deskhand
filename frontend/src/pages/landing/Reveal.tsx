import { useRef, type ReactNode } from 'react'
import { cn } from '../../shared/utils/cn'
import { usePrefersReducedMotion, useRevealed } from './hooks'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Verzögerung des Eintritts in ms — für gestaffelte Gruppen. */
  delay?: number
}

/** Weicher Eintritt beim ersten Sichtbarwerden; respektiert reduced motion. */
export const Reveal = ({ children, className, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const revealed = useRevealed(ref)
  const reduced = usePrefersReducedMotion()
  const shown = revealed || reduced

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
      style={{ transitionDelay: shown && !reduced ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
