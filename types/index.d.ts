import { Icons } from '@/components/icons'

type NavItem = {
  title: string
  href: string
  translationKey?: string
  disabled?: boolean
}

export type EmployeePasswordsEntry = {
  id: string
  name: string
  role: string | null
  password: string
  updatedAt: Date
}

export type MainNavItem = NavItem

export type DashboardConfig = {
  sidebar: SidebarNavItem[]
}

export type HomeConfig = {
  nav: MainNavItem[]
}

export type OrderTableEntry = {
  id: string
  title: string
  deadline?: string
  customer: string
  phone: string
  status: 'Annuler' | 'Non Commence' | 'Encours' | 'Fini'
  progress?: number
  quantity: number
}

export type OrderComponentsTableEntry = {
  id: string
  brand?: string
  model?: string
  deadline?: string
  customer: string
  phone: string
  type: string
  quantity: number
}
export type StockTableEntry = {
  id: string
  title: string
  quantity: number
  price?: number
  bulkPrice?: number
}

export type ClientTableEntry = {
  id: string
  label?: string
  location?: string
  name: string
  phone: string
  orderCount?: number
}

export type FooterConfig = {
  companyNav: MainNavItem[]
  resourcesNav: MainNavItem[]
  legalNav: MainNavItem[]
}

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  translationKey?: string
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type SocialMediaConfig = {
  links: SidebarNavItem[]
}

export type Dictionary = Record<string, string>

declare type UserRole = Uppercase<'admin' | 'sales' | 'production' | 'engineer'>
