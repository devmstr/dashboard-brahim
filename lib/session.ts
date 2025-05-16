// lib/session.ts
import { getServerSession } from 'next-auth'
import { authOptions } from './auth' // Update this path to where your authOptions is exported
import { UserRole } from '@/types'
import { redirect } from 'next/navigation'

/**
 * Gets the current session with proper typing
 * @returns The current session or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Gets the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Checks if a user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

/**
 * Gets the current user's role
 * @returns The user's role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser()
  return user?.role || null
}

/**
 * Checks if the current user has one of the specified roles
 * @param allowedRoles Array of roles that are allowed
 * @returns True if the user has one of the allowed roles, false otherwise
 */
export async function hasRole(allowedRoles: UserRole[]) {
  const role = await getUserRole()
  return role ? allowedRoles.includes(role) : false
}

/**
 * Middleware-style function to require authentication
 * Redirects to login page if not authenticated
 * @param redirectTo Optional path to redirect to after login
 */
export async function requireAuth(redirectTo?: string) {
  const isAuthed = await isAuthenticated()
  if (!isAuthed) {
    redirect(redirectTo ? `/?redirect=${encodeURIComponent(redirectTo)}` : '/')
  }
}

/**
 * Middleware-style function to require specific roles
 * Throws an error or redirects if the user doesn't have the required role
 * @param allowedRoles Array of roles that are allowed
 * @param options Configuration options
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options: {
    redirectTo?: string
    throwError?: boolean
  } = {}
) {
  await requireAuth(options.redirectTo)

  const hasAllowedRole = await hasRole(allowedRoles)

  if (!hasAllowedRole) {
    if (options.throwError) {
      throw new Error('Unauthorized: Insufficient permissions')
    } else if (options.redirectTo) {
      redirect(options.redirectTo)
    } else {
      redirect('/unauthorized')
    }
  }
}

/**
 * Helper function to check if user is an engineer
 */
export async function isEngineer() {
  const role = await getUserRole()
  return role === 'ENGINEER' || role === 'ENGINEERING_MANAGER'
}

/**
 * Helper function to check if user is a sales person
 */
export async function isSales() {
  const role = await getUserRole()
  return role === 'SALES_AGENT' || role === 'SALES_MANAGER'
}

/**
 * Helper function to check if user is a manager
 */
export async function isManager() {
  const role = await getUserRole()
  return role === 'ENGINEERING_MANAGER' || role === 'SALES_MANAGER'
}

/**
 * Helper function for API routes to validate authentication
 * @returns Object with user and role if authenticated, or null if not
 */
export async function validateApiAuth() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  return {
    user: session.user,
    role: session.user.role
  }
}

/**
 * Helper function for API routes to validate role-based access
 * @param allowedRoles Array of roles that are allowed
 * @returns Object with user and role if authorized, or null if not
 */
export async function validateApiRole(allowedRoles: UserRole[]) {
  const auth = await validateApiAuth()

  if (!auth || !auth.role || !allowedRoles.includes(auth.role)) {
    return null
  }

  return auth
}

/**
 * Use this in API routes to require authentication
 * @example
 * const auth = await requireApiAuth();
 * if (!auth) {
 *   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
 * }
 * // Continue with authenticated request
 */
export async function requireApiAuth() {
  return await validateApiAuth()
}

/**
 * Use this in API routes to require specific roles
 * @example
 * const auth = await requireApiRole(['ADMIN', 'MANAGER']);
 * if (!auth) {
 *   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
 * }
 * // Continue with authorized request
 */
export async function requireApiRole(allowedRoles: UserRole[]) {
  return await validateApiRole(allowedRoles)
}
