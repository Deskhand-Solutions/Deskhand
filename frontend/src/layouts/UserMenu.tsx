import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from '../shared/components/Dropdown'

const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
}

export const UserMenu = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const initials = getInitials(user.first_name, user.last_name)

  const handleNavigate = (path: string) => {
    void navigate(path)
  }

  const handleLogout = () => {
    void logout()
  }

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 pr-1.5 transition-colors duration-150 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:pr-2"
          aria-label="Benutzermenü öffnen"
        >
          <span
            className="flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white"
            aria-hidden
          >
            {initials}
          </span>
          <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-text sm:block">
            {user.first_name} {user.last_name}
          </span>
          <ChevronDown
            className="hidden size-3.5 text-muted-soft sm:block"
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      }
    >
      <div className="px-2.5 py-2">
        <p className="text-[13px] font-medium text-text">
          {user.first_name} {user.last_name}
        </p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <DropdownDivider />
      <DropdownItem
        icon={<User className="size-4 text-muted" strokeWidth={1.75} aria-hidden />}
        onClick={() => handleNavigate('/profile')}
      >
        Profil
      </DropdownItem>
      <DropdownItem
        icon={<Settings className="size-4 text-muted" strokeWidth={1.75} aria-hidden />}
        onClick={() => handleNavigate('/settings')}
      >
        Einstellungen
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem
        icon={<LogOut className="size-4" strokeWidth={1.75} aria-hidden />}
        onClick={handleLogout}
        destructive
      >
        Abmelden
      </DropdownItem>
    </Dropdown>
  )
}
