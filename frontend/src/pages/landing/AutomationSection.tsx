import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Check, CircleCheck } from 'lucide-react'
import { cn } from '../../shared/utils/cn'
import { WORKFLOWS } from './content'
import { useInView, usePrefersReducedMotion } from './hooks'
import { Reveal } from './Reveal'

const INTRO_MS = 800
const STEP_MS = 950
const HOLD_MS = 2400
const TOTAL_MS = INTRO_MS + 4 * STEP_MS + HOLD_MS

/**
 * Workflow-Theater: links die vier Abläufe, rechts die Bühne, auf der
 * Arbeit sichtbar erledigt wird — Schritt für Schritt, im Loop.
 */
export const AutomationSection = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInView(stageRef, '-10% 0px')
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  /** Anzahl abgeschlossener Schritte (0..4). */
  const [completed, setCompleted] = useState(0)

  const workflow = WORKFLOWS[active]
  const running = !reduced && inView

  useEffect(() => {
    if (!running) return
    const timers: number[] = [window.setTimeout(() => setCompleted(0), 0)]
    for (let i = 1; i <= 4; i += 1) {
      timers.push(window.setTimeout(() => setCompleted(i), INTRO_MS + i * STEP_MS))
    }
    timers.push(
      window.setTimeout(() => {
        setActive((a) => (a + 1) % WORKFLOWS.length)
        setCycle((c) => c + 1)
      }, TOTAL_MS),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [active, cycle, running])

  const selectWorkflow = (index: number) => {
    if (index === active) return
    setActive(index)
    setCycle((c) => c + 1)
  }

  // Außerhalb des Sichtfelds (oder mit reduced motion) steht alles auf „fertig".
  const shownCompleted = running ? completed : 4
  const finished = shownCompleted >= 4

  return (
    <section
      id="automatisierung"
      aria-label="Automatisierung"
      className="relative px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">03 — Automatisieren</p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl">
            KI genau dort, <span className="text-gradient">wo sie Wert schafft.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Vier Abläufe, die heute Arbeitszeit kosten — so laufen sie mit
            Deskhand. Schauen Sie zu, wie Arbeit fertig wird.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6">
          {/* Ablauf-Auswahl */}
          <div className="grid grid-cols-2 content-start gap-3 lg:grid-cols-1">
            {WORKFLOWS.map((item, index) => {
              const isActive = index === active
              return (
                <Reveal key={item.id} delay={index * 60}>
                  <button
                    type="button"
                    onClick={() => selectWorkflow(index)}
                    aria-pressed={isActive}
                    className={cn(
                      'relative w-full overflow-hidden rounded-xl border p-3.5 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:p-4',
                      isActive
                        ? 'border-accent/40 bg-accent-soft/60'
                        : 'border-border bg-surface hover:border-border-strong',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
                          isActive
                            ? 'border-accent/40 bg-accent/15 text-accent-strong'
                            : 'border-border bg-surface-muted text-muted',
                        )}
                      >
                        <item.icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            'block truncate text-sm font-medium',
                            isActive ? 'text-text' : 'text-muted',
                          )}
                        >
                          {item.name}
                        </span>
                        <span className="hidden truncate text-xs text-muted-soft lg:block">
                          {item.tagline}
                        </span>
                      </span>
                    </span>
                    {isActive && running && (
                      <span
                        key={`progress-${active}-${cycle}`}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent/70"
                        style={{ animation: `grow-x ${TOTAL_MS}ms linear forwards` }}
                        aria-hidden
                      />
                    )}
                  </button>
                </Reveal>
              )
            })}
          </div>

          {/* Bühne */}
          <Reveal delay={120}>
            <div
              ref={stageRef}
              className="rounded-2xl border border-border bg-surface p-5 shadow-elevated sm:p-6"
            >
              {/* Auslöser-Artefakt */}
              <div
                key={`artifact-${active}-${cycle}`}
                className="flex items-center gap-3.5 rounded-xl border border-border bg-surface-elevated p-4 motion-safe:animate-rise"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent-strong">
                  <workflow.trigger.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium tracking-[0.16em] text-muted-soft uppercase">
                    {workflow.trigger.kind}
                  </span>
                  <span className="block truncate text-sm font-medium text-text">
                    {workflow.trigger.title}
                  </span>
                  <span className="block truncate text-xs text-muted-soft">
                    {workflow.trigger.meta}
                  </span>
                </span>
              </div>

              <div className="my-3 flex justify-center text-muted-soft" aria-hidden>
                <ArrowDown className="size-4" strokeWidth={1.5} />
              </div>

              {/* Schritte */}
              <ol className="relative space-y-1">
                <span
                  className="absolute top-3 bottom-3 left-[15px] w-px bg-border"
                  aria-hidden
                />
                {workflow.steps.map((step, index) => {
                  const done = index < shownCompleted
                  const current = index === shownCompleted && !finished
                  return (
                    <li
                      key={`${workflow.id}-${step.title}`}
                      className={cn(
                        'relative flex items-start gap-3.5 rounded-lg px-1 py-2 transition-colors duration-300',
                        current && 'bg-surface-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'z-10 mt-0.5 flex size-[30px] shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                          done && 'border-transparent bg-accent text-white',
                          current && 'border-accent bg-accent/15',
                          !done && !current && 'border-border-strong bg-surface',
                        )}
                      >
                        {done ? (
                          <Check className="size-3.5" strokeWidth={3} aria-hidden />
                        ) : (
                          <step.icon
                            className={cn(
                              'size-3.5 transition-colors duration-300',
                              current ? 'text-accent-strong' : 'text-muted-soft',
                            )}
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span
                          className={cn(
                            'block text-sm transition-colors duration-300',
                            done && 'text-text',
                            current && 'font-medium text-text',
                            !done && !current && 'text-muted-soft',
                          )}
                        >
                          {step.title}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block min-h-[18px] text-xs text-muted transition-opacity duration-500',
                            done ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {step.result}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ol>

              {/* Abschluss */}
              <div
                className={cn(
                  'mt-4 flex items-start gap-2.5 border-t border-border pt-4 transition-opacity duration-500',
                  finished ? 'opacity-100' : 'opacity-30',
                )}
              >
                <CircleCheck
                  className={cn(
                    'mt-0.5 size-4 shrink-0 transition-colors duration-500',
                    finished ? 'text-success' : 'text-muted-soft',
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-[13px] leading-relaxed text-muted">{workflow.summary}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
