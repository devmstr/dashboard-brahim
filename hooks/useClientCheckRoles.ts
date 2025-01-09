'use client'

import { UserRole } from '@/types'
import { useClientUser } from './useClientUser'
import { useCallback, useMemo } from 'react'

export function useClientCheckRoles() {
  const { user, loading } = useClientUser()

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user || !user.role) return false

      const userRoles = Array.isArray(user.role) ? user.role : [user.role]
      const requiredRoles = Array.isArray(roles) ? roles : [roles]

      return requiredRoles.some((role) => userRoles.includes(role))
    },
    [user]
  )

  const isLoading = useMemo(() => loading, [loading])

  return { hasRole, isLoading }
}
