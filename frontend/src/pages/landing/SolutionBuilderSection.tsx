import { useMemo, useState } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { ButtonLink } from '../../shared/components'
import { cn } from '../../shared/utils/cn'
import { CHALLENGES, SYSTEMS } from './content'
import { PlatformCore } from './PlatformCore'
import { Reveal } from './Reveal'

const SYSTEM_BY_ID = new Map(SYSTEMS.map((system) => [system.id, system]))

/**
 * Lösungs-Baukasten: Besucher wählen ihre Engpässe, die Plattform setzt
 * sich rechts sichtbar zusammen — aus Bausteinen und verbundenen Systemen.
 */
export const SolutionBuilderSection = () => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(['email-management']),
  )

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const chosen = useMemo(
    () => CHALLENGES.filter((challenge) => selected.has(challenge.id)),
    [selected],
  )
  const connectedSystems = useMemo(() => {
    const ids = new Set(chosen.flatMap((challenge) => challenge.systems))
    return SYSTEMS.filter((system) => ids.has(system.id))
  }, [chosen])

  return (
    <section
      id="loesung"
      aria-label="Lösung zusammenstellen"
      className="relative px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">04 — Ihre Lösung</p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl">
            Wo soll KI bei Ihnen <span className="text-gradient">anfangen?</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Wählen Sie die Bereiche, die Sie heute aufhalten — und sehen Sie,
            wie sich Ihre Plattform daraus zusammensetzt.
          </p>
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          {/* Auswahl */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHALLENGES.map((challenge, index) => {
              const isSelected = selected.has(challenge.id)
              return (
                <Reveal key={challenge.id} delay={index * 45}>
                  <button
                    type="button"
                    onClick={() => toggle(challenge.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'group relative w-full rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                      isSelected
                        ? 'border-accent/45 bg-accent-soft/70'
                        : 'border-border bg-surface hover:border-border-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-3.5 right-3.5 flex size-5 items-center justify-center rounded-full border transition-all duration-200',
                        isSelected
                          ? 'border-transparent bg-accent text-white'
                          : 'border-border-strong text-transparent group-hover:border-accent/50',
                      )}
                      aria-hidden
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-lg border transition-colors duration-200',
                        isSelected
                          ? 'border-accent/40 bg-accent/15 text-accent-strong'
                          : 'border-border bg-surface-muted text-muted',
                      )}
                    >
                      <challenge.icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span
                      className={cn(
                        'mt-3 block pr-6 text-sm font-medium transition-colors duration-200',
                        isSelected ? 'text-text' : 'text-muted',
                      )}
                    >
                      {challenge.title}
                    </span>
                  </button>
                </Reveal>
              )
            })}
          </div>

          {/* Zusammengesetzte Plattform */}
          <Reveal delay={140}>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <PlatformCore size={40} />
                <div>
                  <p className="text-sm font-medium text-text">Ihre Plattform</p>
                  <p className="text-xs text-muted-soft">setzt sich aus Ihrer Auswahl zusammen</p>
                </div>
                <span className="ml-auto rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-strong">
                  {chosen.length} {chosen.length === 1 ? 'Baustein' : 'Bausteine'}
                </span>
              </div>

              <div className="space-y-3 p-5">
                {chosen.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-10 text-center">
                    <Sparkles className="size-5 text-muted-soft" strokeWidth={1.5} aria-hidden />
                    <p className="text-sm text-muted">
                      Noch nichts ausgewählt. Tippen Sie links auf einen Bereich —
                      Ihre Plattform entsteht hier.
                    </p>
                  </div>
                ) : (
                  chosen.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="rounded-xl border border-border bg-surface-elevated p-4 motion-safe:animate-rise"
                    >
                      <div className="flex items-center gap-2.5">
                        <challenge.icon
                          className="size-4 text-accent-strong"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <p className="text-sm font-medium text-text">{challenge.title}</p>
                      </div>
                      <ul className="mt-2.5 space-y-1.5">
                        {challenge.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2 text-[13px] text-muted">
                            <Check
                              className="mt-[3px] size-3.5 shrink-0 text-success"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {challenge.systems.map((systemId) => {
                          const system = SYSTEM_BY_ID.get(systemId)
                          if (!system) return null
                          return (
                            <span
                              key={systemId}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] text-muted"
                            >
                              <system.icon className="size-3" strokeWidth={1.75} aria-hidden />
                              {system.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-soft">
                  {chosen.length === 0
                    ? 'Ihre Auswahl bestimmt Module und Anbindungen.'
                    : `${chosen.length} ${chosen.length === 1 ? 'Bereich' : 'Bereiche'} · ${connectedSystems.length} ${connectedSystems.length === 1 ? 'System' : 'Systeme'} verbunden`}
                </p>
                <ButtonLink
                  to="/register"
                  className="h-9 gap-2 px-4 text-[13px] sm:ml-auto"
                >
                  Diese Lösung besprechen
                  <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
