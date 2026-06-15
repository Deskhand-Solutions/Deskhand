import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../utils/cn'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-accent-soft text-accent'
      : 'text-muted hover:bg-surface hover:text-text',
  )

export const AppShell = () => (
  <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-6 py-8">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Deskhand
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text">
          KI-Automatisierungsplattform
        </h1>
      </div>

      <nav className="flex items-center gap-2" aria-label="Hauptnavigation">
        <NavLink to="/" className={navLinkClass} end>
          Start
        </NavLink>
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
      </nav>
    </header>

    <main className="flex-1">
      <Outlet />
    </main>
  </div>
)
