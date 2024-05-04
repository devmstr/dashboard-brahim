import { Icons } from '@/components/icons'

type NavItem = {
  title: string
  href: string
  translationKey?: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type DashboardConfig = {
  sidebar: SidebarNavItem[]
}

export type HomeConfig = {
  nav: MainNavItem[]
}

export type StatusVariant = 'Non Commencé' | 'Encoure' | 'Fini'

export type OrderTableEntry = {
  id: string
  endDate?: string
  customer: {
    fullName: string
    phone: string
  }
  progress?: number
  quantity: number
  // status: StatusVariant
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

declare type UserRole = 'admin' | 'sales' | 'production' | 'engineering'
