import { useEffect, useMemo, type ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  Shield,
  Zap,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { getModuleSlugs } from '../modules/registry'
import { canAccessAdministration } from '../shared/utils/canAccessAdministration'
import { useEnabledModules } from '../shared/hooks/useEnabledModules'
import { cn } from '../shared/utils/cn'
import { useSidebar } from './SidebarContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'sidebar-nav-item',
    isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-idle',
  )

type NavItemProps = {
  to: string
  label: string
  icon: ReactNode
  collapsed: boolean
}

const NavItem = ({ to, label, icon, collapsed }: NavItemProps) => (
  <NavLink
    to={to}
    className={navLinkClass}
    title={collapsed ? label : undefined}
    aria-label={collapsed ? label : undefined}
  >
    <span className="sidebar-nav-icon flex size-5 shrink-0 items-center justify-center">
      {icon}
    </span>
    <span
      className={cn(
        'truncate transition-all duration-200',
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
      )}
    >
      {label}
    </span>
  </NavLink>
)

export const Sidebar = () => {
  const { user, activeOrganization } = useAuth()
  const { modules: enabledModules } = useEnabledModules()
  const openableSlugs = useMemo(() => new Set(getModuleSlugs()), [])
  const modules = useMemo(
    () => enabledModules.filter((item) => openableSlugs.has(item.module.slug)),
    [enabledModules, openableSlugs],
  )
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar()
  const location = useLocation()

  const showAdmin = canAccessAdministration(user)

  useEffect(() => {
    closeMobile()
  }, [location.pathname, closeMobile])

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden"
          onClick={closeMobile}
          aria-label="Navigation schließen"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-text transition-all duration-200 ease-out lg:static lg:z-auto',
          isCollapsed ? 'w-[68px]' : 'w-60',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Seitennavigation"
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center px-3.5',
            isCollapsed ? 'justify-center px-0' : 'gap-2.5',
          )}
        >
          <span
            className="bg-gradient-accent flex size-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-soft"
            aria-hidden
          >
            D
          </span>
          <div
            className={cn(
              'min-w-0 overflow-hidden transition-all duration-200',
              isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100',
            )}
          >
            <p className="truncate text-[13px] leading-tight font-semibold tracking-tight text-sidebar-text">
              Deskhand
            </p>
            <p className="truncate text-[11px] leading-tight text-sidebar-muted">
              {activeOrganization?.name ?? 'Keine Organisation'}
            </p>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3"
          aria-label="Hauptnavigation"
        >
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="size-[17px]" strokeWidth={1.75} aria-hidden />}
            collapsed={isCollapsed}
          />
          <NavItem
            to="/modules"
            label="Module"
            icon={<Package className="size-[17px]" strokeWidth={1.75} aria-hidden />}
            collapsed={isCollapsed}
          />

          {modules.length > 0 && (
            <div className="pt-5">
              <p
                className={cn(
                  'mb-1.5 px-2.5 text-[11px] font-medium text-sidebar-muted',
                  isCollapsed ? 'sr-only' : 'not-sr-only',
                )}
              >
                Aktive Module
              </p>
              {modules.map((item) => (
                <NavItem
                  key={item.id}
                  to={`/modules/${item.module.slug}`}
                  label={item.module.name}
                  icon={<Zap className="size-[17px]" strokeWidth={1.75} aria-hidden />}
                  collapsed={isCollapsed}
                />
              ))}
            </div>
          )}

          {showAdmin && (
            <div className="pt-5">
              <NavItem
                to="/administration"
                label="Administration"
                icon={<Shield className="size-[17px]" strokeWidth={1.75} aria-hidden />}
                collapsed={isCollapsed}
              />
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-2.5">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              'sidebar-nav-item sidebar-nav-item-idle w-full',
              isCollapsed ? 'justify-center px-0' : 'justify-between',
            )}
            aria-label={isCollapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
          >
            {!isCollapsed && (
              <span className="text-xs font-medium">Einklappen</span>
            )}
            {isCollapsed ? (
              <ChevronRight className="size-4" aria-hidden />
            ) : (
              <ChevronLeft className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
