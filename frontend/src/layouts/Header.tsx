import { Moon, PanelLeft, Sun } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { useTheme } from '../app/providers/ThemeProvider'
import { Select } from '../shared/components/Select'
import { useSidebar } from './SidebarContext'
import { UserMenu } from './UserMenu'

const iconButtonClass =
  'flex size-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export const Header = () => {
  const { organizations, activeOrganization, setActiveOrganization } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toggleCollapsed, toggleMobile } = useSidebar()

  const handleSidebarToggle = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      toggleMobile()
      return
    }
    toggleCollapsed()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas px-4 lg:px-6">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleSidebarToggle}
          className={iconButtonClass}
          aria-label="Navigation öffnen"
        >
          <PanelLeft className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
        <div className="hidden items-baseline gap-2 sm:flex">
          <p className="text-sm font-medium text-text">
            {activeOrganization?.name ?? 'Deskhand'}
          </p>
          <p className="text-xs text-muted-soft">Organisation</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {organizations.length > 1 && activeOrganization && (
          <div className="hidden w-44 md:block lg:w-52">
            <Select
              aria-label="Organisation wählen"
              options={organizations.map((org) => ({
                value: org.slug,
                label: org.name,
              }))}
              value={activeOrganization.slug}
              onChange={(event) => {
                const org = organizations.find(
                  (item) => item.slug === event.target.value,
                )
                if (org) setActiveOrganization(org)
              }}
            />
          </div>
        )}

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

        <UserMenu />
      </div>
    </header>
  )
}
