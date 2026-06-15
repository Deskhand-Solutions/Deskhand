import { Link } from 'react-router-dom'
import { AutomationSection } from './AutomationSection'
import { ConnectionSection } from './ConnectionSection'
import { NAV_ITEMS } from './content'
import { FinaleSection } from './FinaleSection'
import { HeroSection } from './HeroSection'
import { ResultsSection } from './ResultsSection'
import { SolutionBuilderSection } from './SolutionBuilderSection'
import { UnderstandingSection } from './UnderstandingSection'

const TRUST_ITEMS = [
  'DSGVO-konform',
  'EU-Hosting',
  'Mandantentrennung',
  'Audit-Logs',
] as const

const LandingFooter = () => (
  <footer className="relative border-t border-border bg-canvas px-6 py-12">
    <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
      <div>
        <Link to="/" className="flex items-center gap-2.5" aria-label="Deskhand Startseite">
          <span
            className="bg-gradient-accent flex size-7 items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-soft"
            aria-hidden
          >
            D
          </span>
          <span className="text-sm font-semibold tracking-tight text-text">Deskhand</span>
        </Link>
        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
          Verbinden. Verstehen. Automatisieren. KI-Lösungen rund um die
          Systeme, die Ihr Unternehmen bereits nutzt.
        </p>
      </div>

      <nav aria-label="Footer Navigation">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-soft uppercase">
          Die Geschichte
        </p>
        <ul className="mt-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-[13px] text-muted transition-colors duration-150 hover:text-text"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-soft uppercase">
          Vertrauen
        </p>
        <ul className="mt-3 space-y-2">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="text-[13px] text-muted">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mx-auto mt-10 flex max-w-6xl flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-soft sm:flex-row sm:items-center">
      <p>© {new Date().getFullYear()} Deskhand — KI-Automation für Unternehmen</p>
      <p>Quellenbasierte Antworten · Keine Datenweitergabe an Dritte</p>
    </div>
  </footer>
)

/**
 * Landing-Story in fünf Akten:
 * Chaos (Hero) → Verbinden → Verstehen → Automatisieren → Ergebnis → Finale.
 */
export const LandingPage = () => (
  <div className="relative">
    <HeroSection />
    <ConnectionSection />
    <UnderstandingSection />
    <AutomationSection />
    <SolutionBuilderSection />
    <ResultsSection />
    <FinaleSection />
    <LandingFooter />
  </div>
)
