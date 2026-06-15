import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  FileText,
  Headphones,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { cn } from '../../shared/utils/cn'
import { CAPABILITIES, KNOWLEDGE_DEMOS } from './content'
import { useInView, usePrefersReducedMotion } from './hooks'
import { Reveal } from './Reveal'

const TYPE_INTERVAL_MS = 26
const REVEAL_DELAY_MS = 380
const HOLD_MS = 4200

const INTAKE_CHIPS = [
  { icon: Mail, label: 'E-Mails' },
  { icon: Phone, label: 'Anrufe' },
  { icon: FileText, label: 'Dokumente' },
  { icon: Users, label: 'CRM-Einträge' },
  { icon: Headphones, label: 'Tickets' },
] as const

type Stage = 'typing' | 'reveal' | 'hold'

/**
 * Die Wissens-Konsole: Fragen werden live getippt, die Antwort entsteht aus
 * den verbundenen Quellen. Läuft nur im Sichtfeld, respektiert reduced motion.
 */
const KnowledgeConsole = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInView(cardRef, '-15% 0px')
  const [demoIndex, setDemoIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [stage, setStage] = useState<Stage>('typing')

  const demo = KNOWLEDGE_DEMOS[demoIndex]
  const answered = reduced || stage !== 'typing'

  useEffect(() => {
    if (reduced || !inView) return

    if (stage === 'typing') {
      const id =
        chars >= demo.question.length
          ? window.setTimeout(() => setStage('reveal'), 60)
          : window.setTimeout(() => setChars((c) => c + 1), TYPE_INTERVAL_MS)
      return () => window.clearTimeout(id)
    }
    if (stage === 'reveal') {
      const id = window.setTimeout(() => setStage('hold'), REVEAL_DELAY_MS)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setDemoIndex((i) => (i + 1) % KNOWLEDGE_DEMOS.length)
      setChars(0)
      setStage('typing')
    }, HOLD_MS)
    return () => window.clearTimeout(id)
  }, [chars, demo.question.length, inView, reduced, stage])

  const selectDemo = (index: number) => {
    if (index === demoIndex) return
    setDemoIndex(index)
    setChars(0)
    setStage('typing')
  }

  const question = reduced ? demo.question : demo.question.slice(0, chars)

  return (
    <div ref={cardRef}>
      {/* Was hineinfließt */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-soft">
        {INTAKE_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1"
          >
            <chip.icon className="size-3" strokeWidth={1.75} aria-hidden />
            {chip.label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-soft uppercase">
        <ChevronDown className="size-3.5" strokeWidth={1.5} aria-hidden />
        fließt in die Plattform
      </div>

      {/* Konsole */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <Sparkles className="size-4 text-accent" strokeWidth={1.75} aria-hidden />
          <span className="text-[13px] font-medium text-text">Deskhand · Unternehmenswissen</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-soft">
            <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden />
            verbunden
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Search className="mt-0.5 size-4 shrink-0 text-muted-soft" strokeWidth={1.75} aria-hidden />
            <p className="min-h-[44px] text-[15px] font-medium text-text">
              {question}
              {!reduced && stage === 'typing' && (
                <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[3px] bg-accent motion-safe:animate-pulse" aria-hidden />
              )}
            </p>
          </div>

          <div
            className={cn(
              'mt-4 min-h-[148px] rounded-xl border border-border bg-surface-muted p-4 transition-[opacity,transform] duration-500 ease-out sm:min-h-[132px]',
              answered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          >
            <p className="text-sm leading-relaxed text-muted">{demo.answer}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
              <span className="text-[11px] tracking-[0.12em] text-muted-soft uppercase">Quellen</span>
              {demo.sources.map((source, index) => (
                <span
                  key={source.label}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] text-muted transition-[opacity,transform] duration-300',
                    answered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                  )}
                  style={{ transitionDelay: answered ? `${140 + index * 110}ms` : undefined }}
                >
                  <source.icon className="size-3 text-accent-strong" strokeWidth={1.75} aria-hidden />
                  {source.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {KNOWLEDGE_DEMOS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectDemo(index)}
                aria-pressed={index === demoIndex}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  index === demoIndex
                    ? 'border-accent/40 bg-accent-soft text-text'
                    : 'border-border text-muted hover:border-border-strong hover:text-text',
                )}
              >
                {item.topic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-3 text-xs text-muted-soft">
          <ShieldCheck className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
          Antworten mit Quellenbezug — nachvollziehbar statt geraten.
        </div>
      </div>
    </div>
  )
}

export const UnderstandingSection = () => (
  <section
    id="wissen"
    aria-label="Unternehmenswissen"
    className="relative px-6 py-24 sm:py-32"
  >
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
      <div>
        <Reveal>
          <p className="eyebrow">02 — Verstehen</p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl">
            Aus verbundenen Daten wird{' '}
            <span className="text-gradient">Unternehmenswissen.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            E-Mails, Anrufe, Dokumente und Vorgänge fließen in eine
            Wissensschicht, die Ihr Unternehmen wirklich versteht — und jede
            Antwort belegen kann.
          </p>
        </Reveal>

        <ul className="mt-8 space-y-5">
          {CAPABILITIES.map((capability, index) => (
            <Reveal key={capability.title} delay={index * 70}>
              <li className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent-strong">
                  <capability.icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-text">{capability.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                    {capability.text}
                  </span>
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={120}>
        <KnowledgeConsole />
      </Reveal>
    </div>
  </section>
)
