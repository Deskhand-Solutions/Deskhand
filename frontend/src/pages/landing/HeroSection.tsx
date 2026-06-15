import { useEffect, useRef } from 'react'
import { ArrowRight, ChevronDown, Lock, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../app/providers/ThemeProvider'
import { ButtonLink, getButtonClassName } from '../../shared/components'
import { HERO_FRAGMENT_LABELS } from './content'
import {
  createHeroField,
  createRng,
  sampleFragment,
  type HeroFragment,
  type HeroTone,
} from './heroField'
import { useInView, usePrefersReducedMotion } from './hooks'
import { PlatformCore } from './PlatformCore'
import { clamp01, range, smooth01 } from './scroll'

type HeroPalette = {
  tones: Record<HeroTone, string>
  chipBg: string
  chipBorder: string
  chipText: string
  ring: string
}

/** Canvas kennt keine CSS-Variablen — pro Theme eine abgestimmte Palette. */
const PALETTES: Record<'dark' | 'light', HeroPalette> = {
  dark: {
    tones: {
      blue: '96, 165, 250',
      violet: '167, 139, 250',
      cyan: '103, 232, 249',
      neutral: '203, 213, 225',
    },
    chipBg: 'rgba(13, 16, 24, 0.85)',
    chipBorder: 'rgba(255, 255, 255, 0.14)',
    chipText: 'rgba(226, 230, 240, 0.92)',
    ring: '148, 163, 184',
  },
  light: {
    tones: {
      blue: '37, 99, 235',
      violet: '124, 58, 237',
      cyan: '8, 145, 178',
      neutral: '100, 116, 139',
    },
    chipBg: 'rgba(255, 255, 255, 0.94)',
    chipBorder: 'rgba(23, 23, 28, 0.12)',
    chipText: 'rgba(35, 38, 46, 0.92)',
    ring: '100, 116, 139',
  },
}

const FIELD_SEED = 20260611

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  const radius = Math.min(r, h / 2, w / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Hero — Akt 1 der Story in drei Phasen:
 * 1. Ruhe: Headline auf gestaltetem Hintergrund, keine Ablenkung.
 * 2. Chaos: Beim Scrollen blenden Informationsfragmente ein — überlappend
 *    mit dem Headline-Ausblenden, damit nie ein leerer Bildschirm entsteht.
 * 3. Ordnung: Die Fragmente ziehen auf Bahnen, der Plattform-Kern formt sich.
 * Canvas zeichnet die Fragmente, DOM-Overlays (Headline, Kern,
 * Bildunterschrift) werden im selben Frame-Loop gesteuert.
 */
export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInView(sectionRef, '120px')
  const { theme } = useTheme()

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas || (!inView && !reduced)) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = PALETTES[theme]
    let width = 0
    let height = 0
    let dpr = 1
    let field: HeroFragment[] = []
    const textWidths = new Map<string, number>()
    const centerY = () => (reduced ? 0.62 : 0.5)

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      const compact = width < 680
      field = createHeroField({
        labels: HERO_FRAGMENT_LABELS,
        chipCount: compact ? 16 : 30,
        dotCount: compact ? 48 : 92,
        rng: createRng(FIELD_SEED),
      })
      textWidths.clear()
    }

    const measure = (label: string): number => {
      const cached = textWidths.get(label)
      if (cached !== undefined) return cached
      ctx.font = '500 11px Inter, system-ui, sans-serif'
      const w = ctx.measureText(label).width
      textWidths.set(label, w)
      return w
    }

    const drawDot = (f: HeroFragment, x: number, y: number, alpha: number, scale: number) => {
      const r = f.size * scale
      ctx.fillStyle = `rgba(${palette.tones[f.tone]}, ${(alpha * 0.16).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(x, y, r * 2.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(${palette.tones[f.tone]}, ${alpha.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawChip = (f: HeroFragment, x: number, y: number, alpha: number, scale: number) => {
      const label = f.label ?? ''
      const fontSize = 11 * scale
      const textW = measure(label) * scale
      const padX = 9 * scale
      const dotR = 2.1 * scale
      const gap = 5.5 * scale
      const w = textW + padX * 2 + dotR * 2 + gap
      const h = 23 * scale
      const left = x - w / 2
      const top = y - h / 2

      ctx.globalAlpha = alpha
      ctx.fillStyle = palette.chipBg
      roundRectPath(ctx, left, top, w, h, 8 * scale)
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = palette.chipBorder
      ctx.stroke()
      ctx.fillStyle = `rgba(${palette.tones[f.tone]}, 0.95)`
      ctx.beginPath()
      ctx.arc(left + padX + dotR, y, dotR, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = `500 ${fontSize.toFixed(2)}px Inter, system-ui, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = palette.chipText
      ctx.fillText(label, left + padX + dotR * 2 + gap, y + 0.5)
      ctx.globalAlpha = 1
    }

    const drawFrame = (timeSec: number, progress: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // Das Feld blendet ein, während die Headline noch sichtbar ist.
      const fieldFade = reduced ? 1 : smooth01(range(progress, 0.12, 0.28))
      if (fieldFade <= 0.01) return
      ctx.translate(width / 2, height * centerY())

      // Struktur-Ringe deuten die Ordnung an, sobald sich Bahnen bilden.
      const order = reduced ? 1 : smooth01(range(progress, 0.5, 0.72))
      if (order > 0.02) {
        const minDim = Math.min(width, height)
        for (const radius of [0.34, 0.43]) {
          ctx.beginPath()
          ctx.ellipse(0, 0, radius * minDim, radius * minDim * 0.8, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${palette.ring}, ${(0.12 * order).toFixed(3)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      const fieldProgress = reduced ? 1 : progress
      for (const f of field) {
        const s = sampleFragment(f, timeSec, fieldProgress, width, height)
        const alpha = s.alpha * fieldFade
        if (alpha <= 0.012) continue
        if (f.kind === 'dot') drawDot(f, s.x, s.y, alpha, s.scale)
      }
      // Chips über den Punkten — Lesbarkeit der Labels.
      for (const f of field) {
        if (f.kind !== 'chip') continue
        const s = sampleFragment(f, timeSec, fieldProgress, width, height)
        const alpha = s.alpha * fieldFade
        if (alpha <= 0.012) continue
        drawChip(f, s.x, s.y, alpha, s.scale)
      }
    }

    const applyOverlays = (progress: number) => {
      const headline = headlineRef.current
      if (headline) {
        const visible = reduced ? 1 : 1 - smooth01(range(progress, 0.08, 0.2))
        headline.style.opacity = String(visible)
        headline.style.transform = `translateY(${(-26 * (1 - visible)).toFixed(1)}px)`
        headline.style.pointerEvents = visible < 0.05 ? 'none' : ''
      }
      const cue = cueRef.current
      if (cue) {
        cue.style.opacity = reduced ? '0' : String(1 - range(progress, 0.01, 0.05))
      }
      const core = coreRef.current
      if (core) {
        const t = reduced ? 1 : smooth01(range(progress, 0.52, 0.68))
        core.style.opacity = String(t)
        core.style.transform = `translate(-50%, -50%) scale(${(0.78 + 0.22 * t).toFixed(3)})`
      }
      const caption = captionRef.current
      if (caption) {
        const t = reduced ? 0 : smooth01(range(progress, 0.76, 0.88))
        caption.style.opacity = String(t)
        caption.style.transform = `translate(-50%, ${((1 - t) * 14).toFixed(1)}px)`
      }
    }

    const readProgress = (): number => {
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      return clamp01(-rect.top / Math.max(total, 1))
    }

    rebuild()

    if (reduced) {
      // Statisches, bereits geordnetes Bild — keine Bewegung.
      applyOverlays(1)
      drawFrame(0, 1)
      const onResize = () => {
        rebuild()
        drawFrame(0, 1)
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const progress = readProgress()
      applyOverlays(progress)
      drawFrame((now - start) / 1000, progress)
    }
    raf = requestAnimationFrame(loop)
    const onResize = () => rebuild()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [inView, reduced, theme])

  return (
    <section
      ref={sectionRef}
      id="start"
      aria-label="Einstieg"
      className="relative"
      style={{ height: reduced ? '100svh' : '200vh' }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Bühnenlicht — trägt die ruhige Anfangsphase ohne Fragmente */}
        <div className="landing-hero-glow absolute inset-0" aria-hidden />
        {/* Dezentes Punktraster — Struktur, bevor das Chaos sichtbar wird */}
        <div className="landing-hero-grid absolute inset-0" aria-hidden />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
        {/* Sanfte Vignette für Textkontrast */}
        <div className="landing-hero-vignette absolute inset-0" aria-hidden />

        {/* Plattform-Kern — formt sich beim Scrollen */}
        <div
          ref={coreRef}
          className="absolute left-1/2 will-change-[opacity,transform]"
          style={{
            top: reduced ? '62%' : '50%',
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.78)',
          }}
        >
          <PlatformCore size={108} pulse />
        </div>

        {/* Headline-Overlay */}
        <div
          ref={headlineRef}
          className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center px-6 text-center will-change-[opacity,transform]"
        >
          <div className="mt-[11svh] flex flex-col items-center sm:mt-[12svh]">
            <p className="eyebrow">Die KI-Plattform für Ihr Unternehmen</p>
            <h1 className="mt-5 text-4xl leading-[1.06] font-semibold tracking-tight text-text sm:text-5xl xl:text-[3.5rem]">
              Ihr Unternehmen erzeugt täglich tausende Informationen.{' '}
              <span className="text-gradient">Die meisten bleiben ungenutzt.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Deskhand verbindet Ihre bestehenden Systeme, zentralisiert Ihr
              Unternehmenswissen und automatisiert wiederkehrende Arbeit — mit
              KI, die um Ihr Geschäft herum gebaut ist.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink to="/register" className="h-10 gap-2 px-5">
                Strategiegespräch buchen
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </ButtonLink>
              <a href="#verbinden" className={getButtonClassName('secondary', 'h-10 px-5')}>
                So funktioniert es
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-soft">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-accent" aria-hidden />
                DSGVO-konform & EU-Hosting
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-accent" aria-hidden />
                Mandantentrennung & Audit-Logs
              </span>
            </div>
          </div>
        </div>

        {/* Auflösung des ersten Akts */}
        <div
          ref={captionRef}
          className="absolute bottom-[8svh] left-1/2 z-10 w-full max-w-xl px-6 text-center will-change-[opacity,transform]"
          style={{ opacity: 0, transform: 'translate(-50%, 14px)' }}
        >
          <p className="text-lg font-medium text-text sm:text-xl">
            Die Informationen existieren bereits.
          </p>
          <p className="mt-1 text-sm text-muted">
            Die Plattform ordnet sie — und macht sie nutzbar.
          </p>
        </div>

        <div
          ref={cueRef}
          className="landing-cue absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[11px] tracking-[0.14em] text-muted-soft uppercase"
        >
          Scrollen
          <ChevronDown className="size-4" strokeWidth={1.5} aria-hidden />
        </div>
      </div>
    </section>
  )
}
