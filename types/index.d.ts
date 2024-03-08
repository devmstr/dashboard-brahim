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

export type StatusVariant = 'planned' | 'ongoing' | 'done' | 'abandoned'

export type OrderTableEntry = {
  id: string
  deadline: string
  customer: string
  progress: number
  subParts: number
  status: StatusVariant
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
