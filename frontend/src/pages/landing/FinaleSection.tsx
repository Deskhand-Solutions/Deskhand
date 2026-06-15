import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../../shared/components'
import { cn } from '../../shared/utils/cn'
import { PlatformCore } from './PlatformCore'
import { Reveal } from './Reveal'

const STATUS_ITEMS = ['Systeme verbunden', 'Wissen verfügbar', 'Automationen aktiv'] as const

const ORBIT_TONES = [
  'bg-accent-strong',
  'bg-accent-secondary',
  'bg-accent',
  'bg-accent-strong',
  'bg-accent-secondary',
  'bg-accent',
] as const

/** Ruhig laufendes Ökosystem: der Kern, umkreist von verbundenen Systemen. */
const AmbientPlatform = () => (
  <div className="relative flex size-[230px] items-center justify-center" aria-hidden>
    <span className="absolute inset-0 rounded-full border border-border" />
    <span className="absolute inset-[34px] rounded-full border border-border/60" />
    <div className="absolute inset-0 motion-safe:animate-[orbit-spin_52s_linear_infinite]">
      {ORBIT_TONES.map((tone, index) => (
        <span
          key={index}
          className="absolute top-1/2 left-1/2"
          style={{ transform: `rotate(${index * 60}deg) translateX(115px)` }}
        >
          <span className={cn('glow-dot block size-2 rounded-full', tone)} />
        </span>
      ))}
    </div>
    <PlatformCore size={104} pulse />
  </div>
)

const HEADLINE_LINES = [
  'Ihr Unternehmen funktioniert bereits.',
  'Jetzt machen Sie es intelligent.',
] as const

/**
 * Finale: Das Ökosystem läuft — und der Besucher hat zwei klare Wege.
 * Bewusst ohne Scroll-Bühne: Der Abschluss-CTA ist sofort erreichbar.
 */
export const FinaleSection = () => (
  <section
    id="kontakt"
    aria-label="Kontakt"
    className="relative px-6 py-24 sm:py-32"
  >
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      <Reveal>
        <AmbientPlatform />
      </Reveal>

      <Reveal delay={80} className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        {STATUS_ITEMS.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs text-muted"
          >
            <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden />
            {item}
          </span>
        ))}
      </Reveal>

      <Reveal delay={140}>
        <h2 className="mt-8 text-[2.4rem] leading-[1.08] font-semibold tracking-tight text-text sm:text-5xl lg:text-6xl">
          {HEADLINE_LINES.map((line, index) => (
            <span
              key={line}
              className={cn(
                'block',
                index === HEADLINE_LINES.length - 1 && 'text-gradient',
              )}
            >
              {line}
            </span>
          ))}
        </h2>
      </Reveal>

      <Reveal delay={200}>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted">
          KI-Lösungen, zugeschnitten auf Ihre Systeme, Ihre Prozesse und
          Ihr Geschäft.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/register" className="h-11 gap-2 px-6 text-[15px]">
            Kostenloses Strategiegespräch buchen
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
          <ButtonLink to="/register" variant="secondary" className="h-11 px-6 text-[15px]">
            Live-Demo anfragen
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-muted-soft">
          Unverbindlich · 30 Minuten · konkrete Automatisierungsideen für Ihren Fall
        </p>
      </Reveal>
    </div>
  </section>
)
