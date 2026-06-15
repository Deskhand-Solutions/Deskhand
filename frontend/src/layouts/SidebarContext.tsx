import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'deskhand_sidebar_collapsed'

type SidebarContextValue = {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const readCollapsedState = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsedState)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore storage errors */
      }
      return next
    })
  }, [])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isCollapsed,
      isMobileOpen,
      toggleCollapsed,
      toggleMobile,
      closeMobile,
    }),
    [isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar muss innerhalb von SidebarProvider genutzt werden.')
  }
  return context
}
