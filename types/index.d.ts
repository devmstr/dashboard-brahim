import { Icons } from '@/components/icons'
import { STATUS_TYPES, userRoles } from '@/config/global'
import { Brand, Car, Core } from '@prisma/client'

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
  deadline?: string
  customer: string
  phone: string
  status: (typeof STATUS_TYPES)[number]
  progress?: number
  state?: string
  total?: number
  items?: number
  createdAt?: string
}
export type CarsTableEntry = {
  id: string
  manufacture: string
  car: string
  model?: string
  fuel?: string
  year?: number
}

export type InventoryTableEntry = {
  id: string
  designation: string
  barcode?: string
  brand?: string
  model?: string
  quantity: number
  price?: number
  bulkPrice?: number
  bulkPrice?: number
  bulkPriceThreshold?: number
}

export type ClientTableEntry = {
  id: string
  name: string
  city: string | null
  label: string | null
  email: string | null
  phone: string
  orderCount: number
  isCompany: boolean
}
export type ProductPosTableEntry = {
  id: string
  label: string
  stockLevel: number
  price: number
  bulkPrice: number
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
  key?: string
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

declare type UserRole = Uppercase<(typeof userRoles)[number]>

declare type RadiatorResponse = {
  id: string
  reference: string
  label: string
  category: OrderItem['category']
  cooling: OrderItem['cooling']
  barcode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  Clients: {
    id: string
    name: string
  }[]
  Brands: {
    id: string
    name: string
    Models: {
      id: string
      name: string
    }[]
  }[]
}

declare type InvoiceItem = {
  id: number
  label: string
  quantity: number
  price: number
  amount: number
}

declare type BillingConfig = {
  discountRate?: number // e.g., 0.03 for 3%
  refundRate?: number // RG is provided directly as a number
  vatRate?: number // fixed at 0.19 (19%)
  stampTaxRate?: number // fixed at 0.01 (1%)
}

export interface Product {
  id: string
  label: string
  stockLevel: number
  price: number
  bulkPrice: number
  image?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  city?: string
}
