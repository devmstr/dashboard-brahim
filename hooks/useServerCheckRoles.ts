'use server'

import { UserRole } from '@/types'
import { useServerUser } from './useServerUser'

export async function useServerCheckRoles(
  requiredRoles: UserRole | UserRole[]
): Promise<boolean> {
  const user = await useServerUser()
  if (!user) return false
  const userRoles = Array.isArray(user.role) ? user.role : [user.role]
  const requiredRolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles]
  return requiredRolesArray.some((role) => userRoles.includes(role))
}
