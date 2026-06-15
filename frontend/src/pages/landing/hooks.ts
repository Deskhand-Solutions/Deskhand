import { useEffect, useRef, useState, type RefObject } from 'react'
import { clamp01 } from './scroll'

/** Reagiert live auf Änderungen von `prefers-reduced-motion`. */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Lokaler Scroll-Fortschritt (0..1) einer hohen Sektion mit Sticky-Inhalt.
 * Schreibt per Callback direkt in DOM-Styles — keine Re-Renders pro Frame.
 */
export const useSectionProgress = (
  sectionRef: RefObject<HTMLElement | null>,
  onProgress: (local: number) => void,
): void => {
  const callbackRef = useRef(onProgress)
  useEffect(() => {
    callbackRef.current = onProgress
  })

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      callbackRef.current(clamp01(-rect.top / Math.max(total, 1)))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sectionRef])
}

/** Ob ein Element gerade sichtbar ist — pausiert Animationen außerhalb. */
export const useInView = (
  ref: RefObject<HTMLElement | null>,
  rootMargin = '0px',
): boolean => {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}

/** Wird `true`, sobald das Element einmal sichtbar war — für Eintritts-Reveals. */
export const useRevealed = (
  ref: RefObject<HTMLElement | null>,
  threshold = 0.15,
): boolean => {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (revealed) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, revealed, threshold])

  return revealed
}
