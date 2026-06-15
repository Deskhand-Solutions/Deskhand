import type { User } from '../../features/auth/schemas'

const ADMIN_ROLES = new Set(['org_admin', 'super_admin'])

export const canAccessAdministration = (user: User | null | undefined): boolean => {
  if (!user) return false
  if (user.is_superuser) return true
  return user.role !== null && ADMIN_ROLES.has(user.role)
}
