import { UserRole } from '@/types'

export interface RoleOption {
  label: string
  value: UserRole
}

// Define roles as an array of objects with label and value
export const ROLES: RoleOption[] = [
  { label: 'Commerciale', value: 'SALES_AGENT' },
  { label: 'Directeur Commercial', value: 'SALES_MANAGER' },
  { label: 'Production', value: 'PRODUCTION_WORKER' },
  { label: 'Chef Production', value: 'PRODUCTION_MANAGER' },
  { label: 'Technicien', value: 'ENGINEER' },
  { label: 'Cef Technique', value: 'ENGINEERING_MANAGER' },
  { label: 'Espère Metier', value: 'CONSULTANT' },
  { label: 'CEO', value: 'CEO' },
  { label: "Agent D'Inventaire", value: 'INVENTORY_AGENT' },
  { label: 'Admin', value: 'ADMIN' }
]

// Helper functions for conversion
export function getLabelFromRole(role: UserRole): string {
  const roleOption = ROLES.find((r) => r.value === role)
  return roleOption?.label || role // Fallback to the role itself if not found
}

export function getRoleFromLabel(label: string): UserRole | undefined {
  const roleOption = ROLES.find((r) => r.label === label)
  return roleOption?.value
}
