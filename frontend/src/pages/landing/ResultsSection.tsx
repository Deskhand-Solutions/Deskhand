import { Check, Minus, MoveRight } from 'lucide-react'
import { AFTER_ITEMS, BEFORE_ITEMS } from './content'
import { Reveal } from './Reveal'

/** Verstreute Punkte — das Chaos vom Anfang, im Kleinen. */
const ChaosGlyph = () => (
  <svg viewBox="0 0 44 24" className="h-5 w-9 text-muted-soft" aria-hidden>
    {[
      [5, 7], [14, 18], [19, 4], [27, 13], [33, 20], [38, 6], [9, 14], [24, 21],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" fill="currentColor" />
    ))}
  </svg>
)

/** Geordnetes Raster — derselbe Bestand, strukturiert. */
const OrderGlyph = () => (
  <svg viewBox="0 0 44 24" className="h-5 w-9 text-accent-strong" aria-hidden>
    {[8, 18, 28, 38].flatMap((x) =>
      [8, 16].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" fill="currentColor" />),
    )}
  </svg>
)

/**
 * Ergebnis: Vorher und Nachher im direkten Vergleich — die Auflösung
 * der Geschichte aus dem Hero. Fließt normal im Dokument, keine
 * Scroll-Bühne: kurze Wege, nichts Leeres dazwischen.
 */
export const ResultsSection = () => (
  <section
    id="ergebnis"
    aria-label="Ergebnis"
    className="relative px-6 py-24 sm:py-32"
  >
    <div className="mx-auto w-full max-w-5xl">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">05 — Ergebnis</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Weniger Handarbeit. <span className="text-gradient">Mehr Umsetzung.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Reveal delay={60} className="h-full">
          <div className="h-full rounded-2xl border border-border bg-surface p-6 opacity-90">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-soft uppercase">
                Vorher
              </p>
              <ChaosGlyph />
            </div>
            <ul className="mt-4 space-y-3">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted">
                  <Minus
                    className="size-4 shrink-0 text-muted-soft"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={180} className="hidden items-center justify-center md:flex">
          <MoveRight className="size-6 text-accent" strokeWidth={1.5} aria-hidden />
        </Reveal>

        <Reveal delay={120} className="h-full">
          <div className="h-full rounded-2xl border border-accent/30 bg-accent-soft p-6 shadow-elevated">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
                Nachher
              </p>
              <OrderGlyph />
            </div>
            <ul className="mt-4 space-y-3">
              {AFTER_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-text">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Check className="size-2.5" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-muted">
          Das Informationschaos vom Anfang? Ist jetzt ein strukturiertes,
          intelligentes System — mit derselben Software, die Sie heute nutzen.
        </p>
      </Reveal>
    </div>
  </section>
)
