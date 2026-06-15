import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../shared/utils/cn'
import { EXTRA_SYSTEMS, SYSTEMS, type SystemDef } from './content'
import { useInView, usePrefersReducedMotion, useSectionProgress } from './hooks'
import { PlatformCore } from './PlatformCore'
import { Reveal } from './Reveal'
import { range, smooth01 } from './scroll'

/* Bühnen-Geometrie — Karten und SVG teilen sich dieselben Koordinaten. */
const STAGE_W = 1200
const STAGE_H = 640
const CARD_W = 264
const CARD_H = 78
const ROW_YS = [62, 158, 254, 350, 446, 542]
const LEFT_X = 16
const RIGHT_X = STAGE_W - 16 - CARD_W
const HUB = { x: STAGE_W / 2, y: STAGE_H / 2 }

type PlacedSystem = SystemDef & {
  cx: number
  cy: number
  /** Reihenfolge der Einblendung — beide Seiten bauen sich parallel auf. */
  order: number
  path: string
}

const connectorPath = (side: 'left' | 'right', cy: number): string => {
  const startX = side === 'left' ? LEFT_X + CARD_W + 4 : RIGHT_X - 4
  const endX = side === 'left' ? HUB.x - 70 : HUB.x + 70
  const c1x = side === 'left' ? startX + 116 : startX - 116
  const c2x = side === 'left' ? endX - 92 : endX + 92
  const midY = HUB.y + (cy - HUB.y) * 0.32
  const endY = HUB.y + (cy - HUB.y) * 0.08
  return `M ${startX} ${cy} C ${c1x} ${cy}, ${c2x} ${midY}, ${endX} ${endY}`
}

const placeSystems = (): PlacedSystem[] => {
  let left = 0
  let right = 0
  return SYSTEMS.map((system) => {
    const rowIndex = system.side === 'left' ? left++ : right++
    const cy = ROW_YS[rowIndex]
    return {
      ...system,
      cx: system.side === 'left' ? LEFT_X : RIGHT_X,
      cy,
      order: system.side === 'left' ? rowIndex * 2 : rowIndex * 2 + 1,
      path: connectorPath(system.side, cy),
    }
  })
}

const PLACED = placeSystems()

const NO_DISRUPTION = ['Kein Ersatz', 'Keine Migration', 'Keine Unterbrechung'] as const

const SectionIntro = ({ center = false }: { center?: boolean }) => (
  <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
    <p className={cn('eyebrow', center && 'justify-center')}>01 — Verbinden</p>
    <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl">
      Verbinden Sie alles, <span className="text-gradient">was Sie bereits nutzen.</span>
    </h2>
    <p className="mt-4 text-base leading-relaxed text-muted">
      Ihr Team arbeitet weiter mit den Tools, auf die es sich verlässt.
      Deskhand wird zur Mitte, in der alles zusammenläuft.
    </p>
    <div
      className={cn(
        'mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted',
        center && 'justify-center',
      )}
    >
      {NO_DISRUPTION.map((item) => (
        <span key={item} className="inline-flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-2.5" strokeWidth={3} aria-hidden />
          </span>
          {item}
        </span>
      ))}
    </div>
  </div>
)

const SystemCardBody = ({ system }: { system: SystemDef }) => (
  <>
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent-strong">
      <system.icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-medium text-text">{system.name}</span>
      <span className="block truncate text-xs text-muted-soft">{system.category}</span>
    </span>
  </>
)

const ExtraSystems = ({ center = false }: { center?: boolean }) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-2 text-xs text-muted',
      center && 'justify-center',
    )}
  >
    <span className="text-muted-soft">Außerdem:</span>
    {EXTRA_SYSTEMS.map((name) => (
      <span
        key={name}
        className="rounded-full border border-border bg-surface-muted px-3 py-1"
      >
        {name}
      </span>
    ))}
  </div>
)

/** Desktop: Sticky-Bühne — Verbindungen zeichnen sich beim Scrollen. */
const ConnectionStage = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const footRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const pathRefs = useRef(new Map<string, SVGPathElement>())
  const reduced = usePrefersReducedMotion()
  const inView = useInView(sectionRef)
  const [hovered, setHovered] = useState<string | null>(null)
  const [flowing, setFlowing] = useState(false)

  useSectionProgress(sectionRef, (local) => {
    const intro = reduced ? 1 : smooth01(range(local, 0.02, 0.12))
    if (introRef.current) {
      introRef.current.style.opacity = String(intro)
      introRef.current.style.transform = `translateY(${((1 - intro) * 22).toFixed(1)}px)`
    }
    const hub = reduced ? 1 : smooth01(range(local, 0.05, 0.15))
    if (hubRef.current) {
      hubRef.current.style.opacity = String(hub)
      hubRef.current.style.transform = `translate(-50%, -50%) scale(${(0.8 + 0.2 * hub).toFixed(3)})`
    }
    for (const system of PLACED) {
      const card = cardRefs.current.get(system.id)
      if (card) {
        const t = reduced
          ? 1
          : smooth01(range(local, 0.1 + system.order * 0.022, 0.2 + system.order * 0.022))
        card.style.opacity = String(t)
        card.style.transform = `translateY(${((1 - t) * 14).toFixed(1)}px)`
      }
      const path = pathRefs.current.get(system.id)
      if (path) {
        const t = reduced
          ? 1
          : smooth01(range(local, 0.18 + system.order * 0.026, 0.34 + system.order * 0.026))
        path.style.strokeDashoffset = String(1 - t)
      }
    }
    const foot = reduced ? 1 : smooth01(range(local, 0.55, 0.68))
    if (footRef.current) {
      footRef.current.style.opacity = String(foot)
    }
    const next = reduced ? true : local > 0.52
    setFlowing((current) => (current === next ? current : next))
  })

  return (
    <section
      ref={sectionRef}
      aria-label="Systeme verbinden"
      className="relative hidden lg:block"
      style={{ height: '160vh' }}
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-7 px-6 pt-20 pb-6">
        <div ref={introRef} className="will-change-[opacity,transform]" style={{ opacity: 0 }}>
          <SectionIntro center />
        </div>

        <div
          className="relative w-full"
          style={{
            maxWidth: 'min(68rem, calc((100svh - 25rem) * 1.875))',
            aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          }}
        >
          <svg
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            {PLACED.map((system) => (
              <path
                key={system.id}
                ref={(el) => {
                  if (el) pathRefs.current.set(system.id, el)
                  else pathRefs.current.delete(system.id)
                }}
                d={system.path}
                pathLength={1}
                fill="none"
                strokeDasharray="1"
                strokeDashoffset="1"
                strokeLinecap="round"
                className={cn(
                  'transition-[stroke,stroke-width] duration-200',
                  hovered === system.id ? 'stroke-accent-strong' : 'stroke-border-strong',
                )}
                strokeWidth={hovered === system.id ? 2 : 1.25}
              />
            ))}
            {flowing &&
              !reduced &&
              inView &&
              PLACED.map((system, index) => (
                <circle key={`pulse-${system.id}`} r="3" className="fill-accent-strong">
                  <animateMotion
                    dur="3.8s"
                    repeatCount="indefinite"
                    begin={`${(index * 0.45).toFixed(2)}s`}
                    path={system.path}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    keyTimes="0;0.12;0.82;1"
                    dur="3.8s"
                    repeatCount="indefinite"
                    begin={`${(index * 0.45).toFixed(2)}s`}
                  />
                </circle>
              ))}
          </svg>

          {PLACED.map((system) => (
            <div
              key={system.id}
              ref={(el) => {
                if (el) cardRefs.current.set(system.id, el)
                else cardRefs.current.delete(system.id)
              }}
              onMouseEnter={() => setHovered(system.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'absolute flex items-center gap-3 rounded-xl border px-3.5 shadow-soft transition-colors duration-200 will-change-[opacity,transform]',
                hovered === system.id
                  ? 'border-accent/50 bg-surface-elevated'
                  : 'border-border bg-surface',
              )}
              style={{
                left: `${(system.cx / STAGE_W) * 100}%`,
                top: `${((system.cy - CARD_H / 2) / STAGE_H) * 100}%`,
                width: `${(CARD_W / STAGE_W) * 100}%`,
                height: `${(CARD_H / STAGE_H) * 100}%`,
                opacity: 0,
              }}
            >
              <SystemCardBody system={system} />
            </div>
          ))}

          <div
            ref={hubRef}
            className="absolute left-1/2 top-1/2 will-change-[opacity,transform]"
            style={{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }}
          >
            <PlatformCore size={116} pulse={flowing && !reduced} />
          </div>
        </div>

        <div ref={footRef} className="will-change-[opacity]" style={{ opacity: 0 }}>
          <ExtraSystems center />
        </div>
      </div>
    </section>
  )
}

/** Mobile & Tablet: ruhige Liste statt Bühne. */
const ConnectionList = () => (
  <section
    aria-label="Systeme verbinden"
    className="relative px-6 py-24 lg:hidden"
  >
    <Reveal>
      <SectionIntro />
    </Reveal>

    <Reveal className="mt-10 flex justify-center" delay={80}>
      <PlatformCore size={88} pulse />
    </Reveal>

    <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
      {SYSTEMS.map((system, index) => (
        <Reveal key={system.id} delay={index * 50}>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-soft">
            <SystemCardBody system={system} />
          </div>
        </Reveal>
      ))}
    </div>

    <Reveal className="mx-auto mt-8 max-w-xl" delay={120}>
      <ExtraSystems />
    </Reveal>
  </section>
)

export const ConnectionSection = () => (
  <div id="verbinden">
    <ConnectionStage />
    <ConnectionList />
  </div>
)
