import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../../app/providers/ThemeProvider'
import { ButtonLink } from '../../shared/components'
import { cn } from '../../shared/utils/cn'
import { NAV_ITEMS } from './content'

const iconButtonClass =
  'flex size-9 items-center justify-center rounded-lg border border-border text-muted transition-colors duration-150 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menü schließen, sobald die Desktop-Navigation übernimmt.
  useEffect(() => {
    if (!menuOpen) return
    const query = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (query.matches) setMenuOpen(false)
    }
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [menuOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled || menuOpen
          ? 'border-border bg-canvas/90 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Deskhand Startseite">
          <span
            className="bg-gradient-accent flex size-7 items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-soft"
            aria-hidden
          >
            D
          </span>
          <span className="text-sm font-semibold tracking-tight text-text">Deskhand</span>
        </Link>

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Landingpage Navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={iconButtonClass}
            aria-label={theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" strokeWidth={1.75} aria-hidden />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} aria-hidden />
            )}
          </button>
          <ButtonLink
            to="/login"
            variant="ghost"
            className="hidden text-muted sm:inline-flex"
          >
            Anmelden
          </ButtonLink>
          <ButtonLink to="/register">Erstgespräch</ButtonLink>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            className={cn(iconButtonClass, 'md:hidden')}
          >
            {menuOpen ? (
              <X className="size-4.5" strokeWidth={1.75} aria-hidden />
            ) : (
              <Menu className="size-4.5" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="landing-mobile-nav"
          aria-label="Mobile Navigation"
          className="border-t border-border bg-canvas/95 px-6 pt-2 pb-4 backdrop-blur-md md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-border py-3 text-sm font-medium text-muted transition-colors duration-150 last:border-b-0 hover:text-text"
            >
              {item.label}
            </a>
          ))}
          <ButtonLink
            to="/login"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => setMenuOpen(false)}
          >
            Anmelden
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}
